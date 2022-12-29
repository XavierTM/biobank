const Joi = require("@xavisoft/joi");
const { Router } = require("express");
const Transaction = require("./db/Transaction");
const Merchant = require("./db/Merchant");
const User = require("./db/User");
const { countUserConnections, sendEvent } = require("./sse");
const status_500 = require("./status_500");
const { sequelize } = require("./db");
const { compare } = require("bcrypt");


const transactions = Router();

transactions.post('/', async (req, res) => {

   try {

      // auth
      if (!req.auth)
         return res.sendStatus(401);

      // validate
      /// schema
      const schema = {
         merchant: Joi.number().integer().required(),
         from: Joi.string().required(),
         amount: Joi.number().min(0.01).required(),
      }

      const error = Joi.getError(req.body, schema);
      if (error)
         return res.status(400).send(error);

      /// ids
      const from = await User.findOne({ where: { account_no: req.body.from }});
      if (!from)
         return res.status(400).send('Invalid account number');

      // check if user is connected
      const connectionCount = countUserConnections(from.id);

      if (connectionCount == 0)
         return res.status(400).send('The account number does not have any devices connected');

      // save to db
      const { amount, merchant } = req.body;
      const to = req.auth.user.id;

      const transaction = await Transaction.create({
         merchant,
         from: from.id,
         to,
         amount,
      });


      // notify user
      const merchantObj = await Merchant.findOne({ where: { id: merchant }});

      sendEvent('payment-request', from.id, {
         transactionId: transaction.id,
         merchant: merchantObj.name,
         amount,
      });


      res.send(transaction);

      // timeout to failure
      setTimeout(async () => {
         try {

            await transaction.destroy();
            
            sendEvent('payment-rejection', transaction.to, {
               transactionId: transaction.id,
               reason: 'Timeout',
            });

         } catch (err) {
            console.log(err);
         }

      }, 20 * 1000);


   } catch (err) {
      status_500(err, res);
   }
});


transactions.post('/:transactionId/approval', async (req, res) => {

   try {

      // validation
      const schema = {
         body: Joi.object({
            secret: Joi.string(),
            password: Joi.string(),
         }).min(1)
      }

      const body = req.body;
      const error = Joi.getError({ body }, schema);

      if (error)
         return res.status(400).send(error);

      // authorization
      const transaction = await Transaction.findOne({
         where: {
            id: req.params.transactionId,
         }
      });

      if (!transaction)
         return res.sendStatus(404);

      const user = await User.findOne({ where: { id: transaction.from }});

      if (!user)
         throw new User('User(from) is supposed to be valid');

      if (body.secret) {
         if (body.secret !== user.secret)
            return res.sendStatus(403);
      } else {
         const passwordIsValid = await compare(body.password, user.password);

         if (!passwordIsValid)
            return res.sendStatus(403);
      }

      // approve
      const trans = await sequelize.transaction();

      try {

         const sender = await User.findOne({ 
            where: { id: transaction.from }, 
            transaction: trans 
         });

         if (sender.balance < transaction.amount) {
            await trans.rollback();

            sendEvent('payment-rejection', transaction.to, {
               transactionId: transaction.id,
               reason: 'Insufficient funds',
            });

            return res.status(400).send('Insufficient funds');
         }

         await User.decrement('balance', {
            by: transaction.amount,
            where: {
               id: transaction.from
            },
            transaction: trans
         });

         await User.increment('balance', {
            by: transaction.amount,
            where: {
               id: transaction.to
            },
            transaction: trans
         });

         await trans.commit();

      } catch (err) {
         try { await trans.rollback() } catch {};
         throw err;
      }

      // notify receiver
      sendEvent('payment-approval', transaction.to, {
         transactionId: transaction.id,
         amount: transaction.amount,
      });

      // respond 
      res.send();

   } catch (err) {
      status_500(err, res);
   }
});



module.exports = transactions;