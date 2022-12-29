const authenticator = require("./authenticator");
const { init: initAuth } = require('@xavisoft/auth/backend')

async function init(app) {

   await initAuth({
      app,
      authenticator,
      SECRET_KEY: process.env.JWT_SECRET,
      DB_PATH: __dirname
   });
   
}

module.exports = {
   init
}