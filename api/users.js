const { Router } = require("express");
const status_500 = require("./status_500");
const Joi = require('@xavisoft/joi');
const { ACCOUNT_TYPES, PASSWORD_SALT_ROUNDS } = require("./config");
const User = require("./db/User");
const Merchant = require("./db/Merchant");
const { hash } = require("bcrypt");



const users = Router();

users.post('/', async (req, res) => {

   try {

      // validate
      const schema = {
         name: Joi.string().required(),
         surname: Joi.string().required(),
         account_type: Joi.valid(...ACCOUNT_TYPES),
         email: Joi.string().email().required(),
         password: Joi.string().required(),
      }

      const error = Joi.getError(req.body, schema);
      if (error)
         return res.status(400).send(error);

      // save to db
      req.body.password = await hash(req.body.password, PASSWORD_SALT_ROUNDS);
      const user = await User.create(req.body);

      // respond
      res.send(user);

   } catch (err) {
      status_500(err, res);
   }
});

users.post('/deposits', async (req, res) => {

   try {

      // authentication
      if (!req.auth)
         return res.sendStatus(401);

      // authorization
      if (req.auth.user.account_type !== 'teller')
         return res.sendStatus(403);

      // validation
      const schema = {
         amount: Joi.number().min(0.01).required(),
         account_no: Joi.string().required(),
      }

      const error = Joi.getError(req.body, schema);
      if (error)
         return res.status(400).send(error);

      // deposit money
      const { account_no, amount } = req.body;
      const user = await User.findOne({ where: { account_no } });

      if (!user)
         return res.sendStatus(401);

      user.increment('balance', {
         by: amount
      });

      res.send();

   } catch (err) {
      status_500(err, res);
   }
});

users.get('/logged', async (req, res) => {

   try {

      // auth
      if (!req.auth)
         return res.sendStatus(401);

      const id  = req.auth.user.id;

      const user = await User.findOne({
         where: { id },
         attributes: [ 'id', 'name', 'surname', 'balance', 'createdAt', 'email', 'account_no', 'account_type' ],
         include: {
            model: Merchant,
            as: 'merchants'
         }
      });

      if (!user)
         throw new Error('User has valid login, but cannnot be found in the datbase');

      res.send(user);

      

   } catch (err) {
      status_500(err, res);
   }
});

users.get('/secret', async (req, res) => {

   try {

      // auth
      if (!req.auth)
         return res.sendStatus(401);

      const id  = req.auth.user.id;

      const user = await User.findOne({
         where: { id },
         attributes: [ 'secret' ]
      });

      if (!user)
         throw new Error('User has valid login, but cannnot be found in the database');

      res.send(user);

   } catch (err) {
      status_500(err, res);
   }
});

users.post('/:user_id/merchants', async (req, res) => {

   try {

      // auth
      if (!req.auth)
         return res.sendStatus(401);

      if (req.auth.user.id != req.params.user_id)
         return res.sendStatus(403);

      // validate
      const schema = {
         name: Joi.string().required()
      }

      const error = Joi.getError(req.body, schema);
      if (error)
         return res.status(400).send(error);

      // save to db
      const merchant = await Merchant.create({
         name: req.body.name,
         user: req.params.user_id
      });

      res.send(merchant);

   } catch (err) {
      status_500(err, res);
   }
});


module.exports = users;