const Joi = require("joi");
const HttpStatus = require("http-status-codes");
const bcrypt = require("bcryptjs");

const User = require("../models/userModels");
const Helpers = require("../Helpers/helpers");

module.exports = {
  async CreateUser(req, res) {
    const schema = Joi.object({
      username: Joi.string().min(5).max(10).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(5).required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error && error.details) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: error.details });
    }

    const userEmail = await User.findOne({
      email: Helpers.lowerCase(req.body.email),
    });
    if (userEmail) {
      return res
        .status(HttpStatus.CONFLICT)
        .json({ message: "Email already exist" });
    }

    const userName = await User.findOne({
      username: Helpers.firstUpper(req.body.username),
    });
    if (userName) {
      return res
        .status(HttpStatus.CONFLICT)
        .json({ message: "username already exists" });
    }

    return bcrypt.hash(value.password, 10, (err, hash) => {
      if (err) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: "Error hashing password" });
      }
      const body = {
        username: Helpers.firstUpper(value.username),
        email: Helpers.lowerCase(value.email),
        password: hash,
      };
      User.create(body).then((user) => {
        res
          .status(HttpStatus.CREATED)
          .json({ message: "User created successfully", user });
      }).catch(err => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error occured" });
      });
    });
  },
};
