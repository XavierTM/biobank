
const { Model, DataTypes } = require("sequelize");
const { v4: uuid } = require("uuid");
const { ACCOUNT_TYPES } = require("../config");
const casual = require('casual');


class User extends Model {

   static init(sequelize) {
      super.init({
         name: {
            type: DataTypes.STRING,
            allowNull: false
         },
         surname: {
            type: DataTypes.STRING,
            allowNull: false
         },
         balance: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
            allowNull: false
         },
         account_type: {
            type: DataTypes.ENUM(...ACCOUNT_TYPES),
            defaultValue: ACCOUNT_TYPES[0],
            allowNull: false
         },
         account_no: {
            type: DataTypes.STRING,
            defaultValue: () => {
               return casual.card_number();
            },
            allowNull: false
         },
         secret: {
            type: DataTypes.STRING,
            defaultValue: uuid,
            allowNull: false
         },
         email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
         },
      }, { sequelize });
   }
}


module.exports = User;