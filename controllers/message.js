const httpStatus = require("http-status-codes");

const Message = require("../models/messageModels");
const Conversation = require("../models/conversationModels");
const User = require("../models/userModels");
const Helper=require('../Helpers/helpers.js')

module.exports = {
  async GetAllMessages(req, res) {
    const { sender_Id, receiver_Id } = req.params;
    const conversation = await Conversation.findOne({
      $or: [
        {
          $and: [
            { "participants.senderId": sender_Id },
            { "participants.receiverId": receiver_Id },
          ],
        },
        {
          $and: [
            { "participants.senderId": receiver_Id },
            { "participants.receiverId": sender_Id },
          ],
        },
      ],
    }).select("_id");

    if (conversation) {
      const messages = await Message.findOne({
        conversationId: conversation._id,
      });
      res
        .status(httpStatus.StatusCodes.OK)
        .json({ message: "Messages returned", messages });
    }
  },

  SendMessage(req, res) {
    const { sender_Id, receiver_Id } = req.params;

    Conversation.find(
      {
        $or: [
          {
            participants: {
              $elemMatch: { senderId: sender_Id, receiverId: receiver_Id },
            },
          },
          {
            participants: {
              $elemMatch: { senderId: receiver_Id, receiverId: sender_Id },
            },
          },
        ],
      },
      async (err, result) => {
        if (result.length > 0) {
          const msg = await Message.findOne({conversationId: result[0]._id });
          Helper.updateChatList(req,msg);
          await Message.updateOne(
            {
              conversationId: result[0]._id,
            },
            {
              $push: {
                message: {
                  senderId: req.user._id,
                  receiverId: req.params.receiver_Id,
                  sendername: req.user.username,
                  receivername: req.body.receiverName,
                  body: req.body.message,
                },
              },
            }
          )
            .then(() => {
              res
                .status(httpStatus.StatusCodes.OK)
                .json({ message: "Message sent successfully" });
            })
            .catch((err) => {
              res
                .status(httpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ message: "error occured" });
            });
        } else {
          const newConverstation = new Conversation();
          newConverstation.participants.push({
            senderId: req.user._id,
            receiverId: req.params.receiver_Id,
          });

          const saveConversation = await newConverstation.save();

          const newMessage = new Message();
          newMessage.conversationId = saveConversation._id;
          newMessage.sender = req.user.username;
          newMessage.reciever = req.body.receiverName;
          newMessage.message.push({
            senderId: req.user._id,
            receiverId: req.params.receiver_Id,
            sendername: req.user.username,
            receivername: req.body.receiverName,
            body: req.body.message,
          });

          await User.updateOne(
            {
              _id: req.user._id,
            },
            {
              $push: {
                chatList: {
                  $each: [
                    {
                      receiverId: req.params.receiver_Id,
                      msgId: newMessage._id,
                    },
                  ],
                  $position: 0,
                },
              },
            }
          );

          await User.updateOne(
            {
              _id: req.params.receiver_Id,
            },
            {
              $push: {
                chatList: {
                  $each: [
                    {
                      receiverId: req.user._id,
                      msgId: newMessage._id,
                    },
                  ],
                  $position: 0,
                },
              },
            }
          );

          await newMessage
            .save()
            .then(() => {
              res
                .status(httpStatus.StatusCodes.OK)
                .json({ message: "Message sent" });
            })
            .catch((err) => {
              res
                .status(httpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ message: "error occured" });
            });
        }
      }
    );
  },

  async MarkReceiverMessages(req,res){
    const { sender , receiver } = req.params;
    const msg = await Message.aggregate([
      {$unwind : '$message'},
      {
        $match : {
          $and: [{ 'message.sendername': receiver , 'message.receivername': sender }]
        }
      }
    ]);

    ;

    if(msg.length>0){
      try{
        msg.forEach(async (value) => {
          await Message.updateMany(
            {
              'message._id' : value.message._id
            },
            { $set : { 'message.$.isRead' : true } }
          )
        });
        res.status(httpStatus.StatusCodes.Ok).json({ message: 'Messages marked as read '});
      }catch(err){
        res.status(httpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error Occured'});
      }
    }
  }
};
