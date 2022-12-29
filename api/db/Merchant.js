
const { Model, DataTypes } = require("sequelize");

class Merchant extends Model {

   static init(sequelize) {
      super.init({
         name: {
            type: DataTypes.STRING,
            allowNull: false
         },
      }, { sequelize });
   }
}


module.exports = Merchant;