const Joi = require("joi");
const HttpStatus = require("http-status-codes");

const Post = require("../models/postModels");

module.exports = {
  AddPost(req, res) {
    const schema = Joi.object({
      post: Joi.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error && error.details) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: error.details });
    }
    const body = {
      user: req.user._id,
      username: req.user.username,
      post: req.body.post,
      created: new Date(),
    };

    Post.create(body)
      .then((post) => {
        res.status(HttpStatus.OK).json({ message: "Post created", post });
      })
      .catch((err) => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "error occured" });
      });
  },
};
