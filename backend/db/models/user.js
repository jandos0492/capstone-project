'use strict';
const { Validator } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [4, 30],
      },
    },
    hashedPassword: {
      type: DataTypes.STRING.BINARY,
      allowNull: false,
      validate: {
        len: [60, 60]
      }
    },
  }, {
    defaultScope: {
      attributes: {
        exclude: ["hashedPassword", "createdAt", "updatedAt",],
      },
    },
    scopes: {
      currentUser: {
        attributes: { exclude: ["hashedPassword"] },
      },
      loginUser: {
        attributes: {},
      },
    },
  });

  // Define an instance method, User.prototype.toSafeObject, in the user.js
  // model file that will return an object with the User instance information
  // that is safe to save to a JWT. 
  User.prototype.toSafeObject = function () { // remember, this cannot be an arrow funciton
    const { id, username } = this; // context will be the User instance
    return { id, username };
  };

  // Define an instance method, User.prototype.validatePassword in the user.js
  // model file that will accept a password string and return true if there is
  // a match with the User instance's hashedPassword, otherwise return false.
  User.prototype.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.hashedPassword.toString());
  };

  // Define a static method, User.getCurrentUserById in the user.js model file
  // that will accept an id and return a User with that id using the currentUser scope.
  User.getCurrentUserById = async function (id) {
    return await User.scope("currentUser").findByPk(id);
  };

  // Method to associate the reset token with a user
  User.prototype.setResetToken = async function (resetToken) {
    this.resetToken = resetToken;
    await this.save();
  }

  // Define a static method, User.login in the user.js model file that will
  // accept an object with a username and password key and find a User with a
  // username or email with the specified username using the loginUser scope.
  // If a user is found, then validate the password by passing it into the
  // instance's .validatePassword method. If the password is valid, then
  // return the user with the currentUser scope.
  User.login = async function ({ username, password }) {
    const { Op } = require("sequelize");
    const user = await User.scope("loginUser").findOne({
      where: {
        [Op.or]: {
          username: username.toLowerCase(),
        },
      },
    });
    if (user && user.validatePassword(password)) {
      return await User.scope("currentUser").findByPk(user.id);
    }
  };

  // Define a static method, User.signup in the user.js model file that will
  // accept an object with a username, email and password key. Hash the password
  // using bcryptjs package's hashSync method. Create a User with the username,
  // email, and hashedPassword. Return the created user with the currentUser scope.
  User.signup = async function ({ username, password }) {
    const hashedPassword = bcrypt.hashSync(password);
    const user = await User.create({
      username: username.toLowerCase(),
      hashedPassword,
    });
    return await User.scope("currentUser").findByPk(user.id);
  };

  User.associate = function (models) {
    // associations can be defined here
  };
  return User;
};