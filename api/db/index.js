const { hash } = require("bcrypt");
const { Sequelize } = require("sequelize");
const Merchant = require("./Merchant");
const Transaction = require("./Transaction");
const User = require("./User");


const dialect = `sqlite::${__dirname}/db.sqlite`;
const sequelize = new Sequelize(dialect, { logging: false });


async function init() {

   Merchant.init(sequelize);
   Transaction.init(sequelize);
   User.init(sequelize);

   // relationships
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
         email: 'janedoe@biobank.com',
         password: await hash('password', 1),
      });
   } catch (err) {
      console.log(String(err));
   }

   try {
      await User.create({
         name: 'Xavier',
         surname: 'Mukodi',
         email: 'xaviermukodi@gmail.com',
         password: await hash('1111', 1),
         balance: 100,
      });
   } catch (err) {
      console.log(String(err));
   }

   try {
      await User.create({
         name: 'John',
         surname: 'Doe',
         email: 'johndoe@biobank.com',
         password: await hash('password', 1),
      });
   } catch (err) {
      console.log(String(err));
   }



}


module.exports = {
   init,
   sequelize,
}