const { compare } = require("bcrypt");
const User = require("../db/User");


async function getUserInfo(credentials) {

   const { email, password, secret } = credentials;

   let where;

   if (secret) {
      where = { secret }
   } else {
      where = { email }
   }

   const user = await User.findOne({ where });
   
   if (!user)
      return null;

   const { account_type, id } = user;

   if (secret) {
      // validate secret
      if (user.secret !== secret)
         return null
   } else {
      // validate password
      const passwordIsValid = await compare(password, user.password);
      if (!passwordIsValid)
         return null;
   }
      
   return {
      email,
      id,
      account_type
   }
}

const authenticator = {
   getUserInfo
}

module.exports = authenticator;