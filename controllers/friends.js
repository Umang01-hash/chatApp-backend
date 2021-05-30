const HttpStatus = require("http-status-codes");

const User = require("../models/userModels");

module.exports = {
  FollowUser(req, res) {
    const followUser = async () => {
      await User.updateOne(
        {
          _id: req.user._id,
          "following.userFollowed": { $ne: req.body.userFollowed },
        },
        {
          $push: {
            following: {
              userFollowed: req.body.userFollowed,
            },
          },
        }
      );

      await User.updateOne(
        {
          _id: req.body.userFollowed,
          "following.follower": { $ne: req.user._id },
        },
        {
          $push: {
            followers: {
              follower: req.user._id,
            },
            notifications: {
              senderId: req.user._id,
              message: `${req.user.username} is now following you.`,
              created: new Date(),
              viewProfile: false,
            },
          },
        }
      );
    };

    followUser()
      .then(() => {
        res
          .status(HttpStatus.StatusCodes.OK)
          .json({ message: "Following user now" });
      })
      .catch((err) => {
        res
          .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Error occured" });
      });
  },

  UnFollowUser(req, res) {
    const unFollowUser = async () => {
      await User.updateOne(
        {
          _id: req.user._id,
        },
        {
          $pull: {
            following: {
              userFollowed: req.body.userFollowed,
            },
          },
        }
      );

      await User.updateOne(
        {
          _id: req.body.userFollowed,
        },
        {
          $pull: {
            followers: {
              follower: req.user._id,
            },
          },
        }
      );
    };

    unFollowUser()
      .then(() => {
        res
          .status(HttpStatus.StatusCodes.OK)
          .json({ message: "FUnfllowing user now" });
      })
      .catch((err) => {
        res
          .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Error occured" });
      });
  },

  async MarkNotification(req, res) {
    if (!req.body.deleteValue) {
      await User.updateOne(
        {
          _id: req.user._id,
          "notifications._id": req.params.id,
        },
        {
          $set: { "notifications.$.read": true },
        }
      )
        .then(() => {
          res
            .status(HttpStatus.StatusCodes.OK)
            .json({ message: "Marked as read" });
        })
        .catch((err) => {
          res
            .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Error Occured" });
        });
    } else {
      await User.updateOne(
        {
          _id: req.user._id,
          "notifications._id": req.params.id,
        },
        {
          $pull: {
            notifications: { _id: req.params.id },
          },
        }
      )
        .then(() => {
          res
            .status(HttpStatus.StatusCodes.OK)
            .json({ message: "Deleted Successfully" });
        })
        .catch((err) => {
          res
            .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Error Occured" });
        });
    }
  },

  async MarkAllNotification(req, res) {
    await User.updateMany(
      {
        _id: req.user._id,
      },
      { $set: { "notifications.$[elem].read": true } },
      { arrayFilters: [{ "elem.read": false }], multi: true }
    ).then(() => {
      res
        .status(HttpStatus.StatusCodes.OK)
        .json({ message: "Marked All Successfully" });
    })
    .catch((err) => {
      res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error Occured" });
    });
  },
};
