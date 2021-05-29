const httpStatus = require('http-status-codes');


const User = require('../models/userModels');

module.exports = {
  async GetAllUsers(req, res) {
    await User.find({})
      .populate('posts.postId')
      .then(result => {
        res.status(httpStatus.StatusCodes.OK).json({ message: 'All users', result });
      })
      .catch(err => {
        res
          .status(httpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error occured' });
      });
  }
};