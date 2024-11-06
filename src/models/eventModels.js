const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {connection} = require('./connectDatabase')

const eventSchema = new Schema({
    type: {
      type: String,
      enum: ['message_sent', 'user_login', 'conversation_created', 'other'],
      required: true
    },
    userId: {
      ref:'User',
      type: Schema.Types.ObjectId,
      required: [true,"ERROR_MOONGOSE_REQUIRED"],
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: Object,
      required: false  // Datos adicionales específicos del evento
    }
  }, 
{ timestamps: true });
  
eventSchema.methods.getFields = function() {
    return ['type', 'userId', 'timestamp', 'metadata'];
};

module.exports = connection().model('Event', eventSchema);
  