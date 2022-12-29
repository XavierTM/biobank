const { Router } = require("express");
const { v4: uuid } = require("uuid");
const jwt = require('jsonwebtoken');
const status_500 = require("./status_500");


// connection class
class SSEConnection {


   setResObject(res) {
      this._res = res;

      res.on('close', () => {
         this._connected = false;
      });

      this._resendMessages();
   }

   _resendMessages() {

      const msg = this._unsentMessages.shift();

      if (!msg)
         return;

      this.send(...msg);
      this._resendMessages();

   }


   send(eventName, data) {

      if (!this._connected) {
         this._unsentMessages.push([ eventName, data ]);
         return;
      }

      const res = this._res;

      res.write(`event: ${eventName}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);

   }

   constructor(id, res) {
      this._unsentMessages = [];
      this._id = id;
      this._connected = true;

      this.setResObject(res);
   }
}


const connectionsMap = new Map();
const userConnectionLists = new Map();

const router = Router();

router.get('/:access_token', (req, res) => {

   try {

      const payload = jwt.verify(req.params.access_token, process.env.JWT_SECRET);
      const { user, exp } = payload || {};

      if (exp < Date.now())
         return res.sendStatus(401);

      const headers = {
         'Content-Type': 'text/event-stream',
         'Connection': 'keep-alive',
         'Cache-Control': 'no-cache'
      };
      
      res.writeHead(200, headers);

      const id = req.headers['last-event-id'] || uuid();
      res.write(`id: ${id}\n\n`);

      // add connection to list
      const userId = user.id;
      let conn = connectionsMap.get(id);

      if (conn) {
         conn.setResObject(res);
      } else {
         conn = new SSEConnection(id, res);

         connectionsMap.set(id, conn);

         let userConnectionList = userConnectionLists.get(userId);

         if (!userConnectionList) {
            userConnectionList = new Set();
            userConnectionLists.set(userId, userConnectionList);
         }

         userConnectionList.add(id);

      }

   } catch (err) {
      status_500(err, res);
   }
      


});


function sendEvent(eventName, userId, data) {

   console.log(`${eventName}:`, data);
   
   const userConnectionList = userConnectionLists.get(userId);

   if (!userConnectionList)
      return 0;

   Array.from(userConnectionList).forEach(id => {
      try {
         const conn = connectionsMap.get(id);
         conn.send(eventName, data);
      } catch (err) {
         console.error(err);
      }
   })

   return userConnectionList.size;
}


function countUserConnections(userId) {

   console.log({ userId });

   const userConnectionList = userConnectionLists.get(userId);

   if (!userConnectionList)
      return 0;

   return userConnectionList.size
}


module.exports = {
   router,
   sendEvent,
   countUserConnections
};