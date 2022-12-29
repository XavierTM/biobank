const { Model, DataTypes } = require("sequelize");


class Transaction extends Model {

   static init(sequelize) {
      super.init({
         amount: {
            type: DataTypes.FLOAT,
            allowNull: false
         },
         approved: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
         },
      }, { sequelize });
   }
}


module.exports = Transaction;