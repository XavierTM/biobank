



const { Model, DataTypes } = require("sequelize");
const { ACCOUNT_TYPES } = require("../config");
const casual = require('casual');


class AccountRecoveryRequest extends Model {

   static init(sequelize) {
      super.init({
         otp: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: () => casual.integer(100000, 999999),
            unique: true
         },
      }, { sequelize });
   }
}


module.exports = AccountRecoveryRequest;