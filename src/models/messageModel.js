const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {connection} = require('./connectDatabase')
const crytoFeatures = require('../utils/crytoFeatures')
const messageSchema = new Schema({
  conversationId: {
    ref:'Conversation',
    type: Schema.Types.ObjectId,
    required: [true,"ERROR_MOONGOSE_REQUIRED"],
  },
  senderId: {
    ref:'User',
    type: Schema.Types.ObjectId,
    required: [true,"ERROR_MOONGOSE_REQUIRED"],
  },
  type: {
    type: String,
    default:'text',
    enum: ['text'],
    required: true
  },
  content: {
    type: String,
    maxlength: 1000
  },
  mediaUrl: String,
  replyTo: Schema.Types.ObjectId,
  reactions: [{
    userId: String,
    type: {
      type: String,
      enum: ['like']
    }
  }],
  readBy: [{
    userId: String,
    timestamp: Date
  }],
  timestamp: {
    type: Date,
    default: Date.now
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

messageSchema.methods.getFields = function() {
  return ['conversationId', 'senderId', 'type', 'content', 'mediaUrl', 'replyTo', 'reactions', 'readBy', 'timestamp', 'isEdited', 'isDeleted'];
};

messageSchema.pre('save', async function (next) {
  try {

    const conversationModel = require('./conversationModel');
    const messageModel = require('./messageModel');
    const userModel = require('./userModel');
    const conversationId = new mongoose.Types.ObjectId(this.conversationId);
    const conversation = await conversationModel.findById({_id:conversationId});

    const contentEncrypt = crytoFeatures.encrypt(this.content)

    this.content = contentEncrypt

    if (conversation) {

      const user = await userModel.findById(this.senderId)

      conversation.lastMessage = {
        senderId: this.senderId,
        name: user.name,
        content: contentEncrypt,
        timestamp: Date.now(),
      };

      const countMessages = await messageModel.countDocuments({ conversationId });

      conversation.metadata = {
        totalMessages: countMessages > 0 ? countMessages : 0,
      };

      await conversation.save();
    }

    next();
  } catch (error) {
    next(error);
  }
});

messageSchema.methods.decryptContent =function(){
  return crytoFeatures.decrypt(this.content);
}


module.exports = connection().model('Message', messageSchema);
