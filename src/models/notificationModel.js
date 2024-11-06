const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {connection} = require('./connectDatabase')

const notificationSchema = new Schema({
    userId: {
      ref:'User',
      type: Schema.Types.ObjectId,
      required: [true,"ERROR_MOONGOSE_REQUIRED"],
    },
    type: {
      type: String,
      enum: ['new_message', 'friend_request', 'mention', 'other'],
      required: true
    },
    content: {
      type: String,
      maxlength: 500
    },
    relatedId: Schema.Types.ObjectId,  // ID de un mensaje, conversación, etc.
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    },
    metadata: {
      sender: {
        userId: String,
        username: String
      },
      conversation: {
        id: {
            ref:'Conversation',
            type: Schema.Types.ObjectId,
            required: [true,"ERROR_MOONGOSE_REQUIRED"],
        },
        title: String
      }
    }
  }, { timestamps: true });
  
notificationSchema.methods.getFields = function() {
    return ['userId', 'type', 'content', 'relatedId', 'timestamp', 'isRead', 'metadata'];
};



module.exports = connection().model('Notification', notificationSchema);
  