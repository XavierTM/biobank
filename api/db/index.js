const { hash } = require("bcrypt");
const { Sequelize } = require("sequelize");
const Merchant = require("./Merchant");
const Transaction = require("./Transaction");
const User = require("./User");
const AccountRecoveryRequest = require("./AccountRecoveryRequest");


const dialect = `sqlite::${__dirname}/db.sqlite`;
const sequelize = new Sequelize(dialect, { logging: false });


async function init() {

   AccountRecoveryRequest.init(sequelize);
   Merchant.init(sequelize);
   Transaction.init(sequelize);
   User.init(sequelize);

   // relationships
   /// AccountRecoveryRequest
   AccountRecoveryRequest.belongsTo(User, {
      foreignKey: {
         name: 'user',
         allowNull: false
      }
   });

   /// Merchant
   Merchant.belongsTo(User, {
      foreignKey: {
         name: 'user',
         allowNull: false
      }
   });

   User.hasMany(Merchant, {
      as: 'merchants',
      foreignKey: {
         allowNull: false,
         name: 'user',
      }
   });

   /// Transaction
   Transaction.belongsTo(User, {
      foreignKey: {
         name: 'from',
         allowNull: false,
      }
   });

   Transaction.belongsTo(User, {
      foreignKey: {
         name: 'to',
         allowNull: false,
      }
   });

   Transaction.belongsTo(Merchant, {
      foreignKey: {
         name: 'merchant',
         allowNull: false,
      }
   });

   // create tables
   const force = process.env.NODE_ENV !== 'production';
   await sequelize.sync({ force });

   // default accounts
   try {
      await User.create({
         name: 'Jane',
         surname: 'Doe',
         account_type: 'teller',
         email: 'mavegetty@gmail.com',
      });
   } catch (err) {
      console.log(String(err));
   }

}


module.exports = {
   init,
   sequelize,
}