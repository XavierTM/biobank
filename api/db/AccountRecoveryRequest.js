



const { Model, DataTypes } = require("sequelize");
const { v4: uuid, v4 } = require("uuid");
const { ACCOUNT_TYPES } = require("../config");
const casual = require('casual');


class AccountRecoveryRequest extends Model {

   static init(sequelize) {
      super.init({
         ref_code: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: v4,
         },
      }, { sequelize });
   }
}


module.exports = AccountRecoveryRequest;