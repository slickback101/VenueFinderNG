import sequelize from "sequelize";
import User from "../models/user.model.js";
module.exports=(sequelize, DataType) =>{
    const user = sequelize.define('user', {

    });
    return user;
}