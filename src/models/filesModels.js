const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {connection} = require('./connectDatabase')

const fileSchema = new Schema({
    ownerId: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      maxlength: 255,
      required: true
    },
    fileType: {
      type: String,
      maxlength: 50,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    conversationId: {
      type: Schema.Types.ObjectId
    },
    messageId: {
      type: Schema.Types.ObjectId
    }
  }, 
{ timestamps: true });
  
fileSchema.methods.getFields = function() {
    return ['ownerId', 'filename', 'fileType', 'size', 'url', 'uploadedAt', 'conversationId', 'messageId'];
};


//module.exports = connection().model('File', fileSchema);