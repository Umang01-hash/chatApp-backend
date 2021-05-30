const Joi = require("joi");
const HttpStatus = require("http-status-codes");

const Post = require("../models/postModels");
const User = require("../models/userModels");

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
      .then(async (post) => {
        await User.updateOne(
          {
            _id: req.user._id,
          },
          {
            $push: {
              posts: {
                postId: post._id,
                post: req.body.post,
                created: new Date(),
              },
            },
          }
        );
        res
          .status(HttpStatus.StatusCodes.OK)
          .json({ message: "Post created", post });
      })
      .catch((err) => {
        res
          .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "error occured" });
      });
  },
  async GetAllPosts(req, res) {
    try {
      const posts = await Post.find({}).populate("user").sort({ created: -1 });

      const top = await Post.find({ totalLikes : {$gte: 2} }).populate("user").sort({ created: -1 });

      return res
        .status(HttpStatus.StatusCodes.OK)
        .json({ message: "All posts", posts , top});
    } catch (err) {
      return res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error Occured" });
    }
  },

  async AddLike(req, res) {
    const postId = req.body._id;
    await Post.updateOne(
      {
        _id: postId,
        "likes.username": { $ne: req.user.username },
      },
      {
        $push: {
          likes: {
            username: req.user.username,
          },
        },
        $inc: { totalLikes: 1 },
      }
    )
      .then(() => {
        res
          .status(HttpStatus.StatusCodes.OK)
          .json({ message: "You liked the post" });
      })
      .catch((err) =>
        res
          .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Error occured" })
      );
  },

  async AddComment(req, res) {
    const postId = req.body.postId;
    await Post.updateOne(
      {
        _id: postId,
      },
      {
        $push: {
          comments: {
            userId: req.user._id,
            username: req.user.username,
            comment: req.body.comment,
            createdAt: new Date(),
          },
        },
      }
    )
      .then(() => {
        res
          .status(HttpStatus.StatusCodes.OK)
          .json({ message: "Comment added to post" });
      })
      .catch((err) =>
        res
          .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Error occured" })
      );
  },

  async GetPost(req, res) {
    await Post.findOne({ _id: req.params.id })
      .populate("user")
      .populate("comments.userId")
      .then((post) => {
        res
          .status(HttpStatus.StatusCodes.OK)
          .json({ message: "Post found", post });
      })
      .catch((err) => {
        res
          .status(HttpStatus.StatusCodes.NOT_FOUND)
          .json({ message: "Post not found", post });
      });
  },
};
