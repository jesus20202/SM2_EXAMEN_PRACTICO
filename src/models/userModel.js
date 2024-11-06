const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {connection} = require('./connectDatabase')

const userSchema = new Schema({
  externalUserId: {
    type: String,
    required: [true,"ERROR_MOONGOSE_REQUIRED"],
  }
  ,
  name: {
    type: String,
    minlength:0,
    maxlength:150
  },
  profilePicture: {
    type: String,
    minlength:0,
    maxlength:150
  }
  ,
  settings:{
    notifications:{
      type:Boolean,
      default:false
    }
    ,language:{
      type:String,
      default:'es',
      enum:['en','es']
    }
  }
  ,
  status: {
    type: String,
    enum: ['online','offline','away'],
    default: 'online',
  },
  lastActive:{
    type:Date,
    default:Date.now()
  },
  contacts:[{
    userId:{
      ref:'User',
      type: Schema.Types.ObjectId,
      required: [true,"ERROR_MOONGOSE_REQUIRED"],
    },
    status:{
      type: String,
      enum: ['pending','accepted','blocked'],
      default: 'offline',
    }
  }],
  deviceTokens:[String]
},
{ timestamps: true });


userSchema.methods.getFields = function(){
  return ['name','externalUserId','profilePicture','settings','status','lastActive','contacts','deviceTokens']
}

module.exports = connection().model('User', userSchema);
