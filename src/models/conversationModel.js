const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {connection} = require('./connectDatabase')
const userModel = require('./userModel');


const conversationSchema = new Schema({
    type: {
      type: String,
      default:'individual',
      enum: ['individual', 'group'],
      required: true
    },
    participants: {
      type: [{
        userId:{
          ref:'User',
          type: Schema.Types.ObjectId,
          required: [true,"ERROR_MOONGOSE_REQUIRED"]
        },
        name:{
          type: String,
          maxlength: 150
        }
      }],
      required: true
    },
    admin: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      name:{
        type: String,
        maxlength: 150
      }
    },
    title: {
      type: String,  // Solo para grupos
      maxlength: 150
    },
    lastMessage: {
      senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      name:{
        type: String,
        maxlength: 150
      },
      content: {
        type: String,
        maxlength: 500
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    },
    metadata: {
      totalMessages: {
        type: Number,
        default: 0
      },
      isArchived: {
        type: Boolean,
        default: false
      }
    },
    expiresAt: {
        type: Date,
        default: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    }
},{ timestamps: true });


conversationSchema.set('toJSON', { virtuals: true });
conversationSchema.set('toObject', { virtuals: true });


conversationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

conversationSchema.methods.getFields = function() {
  return ['type', 'participants', 'admin', 'title', 'lastMessage', 'metadata'];
};

conversationSchema.methods.getTitleTemp = async function (currentUserId) {

  if (this.type === 'individual') {

    if(this.admin.userId.toString() === currentUserId.toString()){
      const otherParticipant = this.participants.find(
        p => p.userId.toString() !== currentUserId.toString()
      );

      if (otherParticipant) {
        return otherParticipant ? otherParticipant.name : 'Conversación sin nombre';
      }
    }
    else{
      return this.admin ? this.admin.name : 'Conversación sin nombre';
    }
  }

  if (this.type === 'group') {
    return 'EQUIPO DINAMITA '||this.title || 'Conversación sin nombre';
  }

  return 'Conversación sin título';
};

  
conversationSchema.pre('remove', async function (next) {
  try {
    const messageModel = require('./messageModel');
    const notificationModel = require('./notificationModel');

    const conversationId = this._id;

    await messageModel.deleteMany({ conversationId });

    await notificationModel.deleteMany({ 'metadata.conversation.id': conversationId });

    next();
  } catch (error) {
    next(error);
  }
});


module.exports = connection().model('Conversation', conversationSchema);