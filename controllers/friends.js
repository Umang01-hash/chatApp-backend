const HttpStatus = require("http-status-codes");

const User = require("../models/userModels");

module.exports = {
  FollowUser(req, res) {
    const followUser = async () => {
        await User.updateOne({
            _id : req.user._id,
            'following.userFollowed' : { $ne: req.body.userFollowed }
        },
        {
            $push : {
                following : {
                    userFollowed : req.body.userFollowed
                }
            }
        } );

        await User.updateOne({
            _id : req.user.userFollowed,
            'following.follower' : { $ne: req.user._id }
        },
        {
            $push : {
                followers : {
                    follower : req.user._id
                }
            }
        } );
    };

    followUser()
      .then(() => {
          res.status(HttpStatus.StatusCodes.OK).json({ message : 'Following user now' })
      })
      .catch((err) => {
        res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message : 'Error Occured' })
      });
  },

  UnFollowUser(req, res) {
    const unFollowUser = async () => {
        await User.updateOne({
            _id : req.user._id,

        },
        {
            $pull : {
                following : {
                    userFollowed : req.body.userFollowed
                }
            }
        } );

        await User.updateOne({
            _id : req.user.userFollowed,

        },
        {
            $pull : {
                followers : {
                    follower : req.user._id
                }
            }
        } );
    };

    unFollowUser()
      .then(() => {
          res.status(HttpStatus.StatusCodes.OK).json({ message : 'UnFollowing user now' })
      })
      .catch((err) => {
        res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message : 'Error Occured' })
      });
  },
};
