const userRepository = require('../repositories/userRepository');
const createResponse = require('./../utils/createResponse')
const adminFCM = require('../config/certificateFCM');

exports.registerUserService = async (token, externalUserId,userName) => {
  try {
    const existUser = await userRepository.getUser({ externalUserId });
    console.log('existUser',existUser)
    if (existUser) {

      if (!existUser.deviceTokens.includes(token)) {
        existUser.deviceTokens.push(token);
        await existUser.save();
      }
      return createResponse.patch({ success: true, data: existUser });
    }
    const user = userRepository.getUserInstance();
    user.externalUserId = externalUserId;
    user.name = userName;
    user.deviceTokens = [token];

    const userUpdate = await user.save();

    return createResponse.post({ success: true, data: userUpdate });
  } catch (error) {
    console.log('error',error)
    return createResponse.post({ success: false, message: error.message });
  }
};

exports.updateSettingUserService  = async(userId,notification,language)=>{
  const user=await userRepository.updateUser({_id:userId},{settings:{notifications:notification,language}})

  if (existUser) {
    return createResponse.get({success:true,data:existUser})
  }

  return createResponse.patch({success:true,data:user})
}
  
exports.getUserService = async(userId)=>{
  
  const user=await userRepository.getUser({_id:userId})

  if(!user) return createResponse.get({})

  return createResponse.get({success:true,data:user})
}
  
exports.getAllUserService = async (body,query,popOptions)=>{
  let filter= undefined

  if(body) filter = {...body}
  const users=await userRepository.getAllUsers(filter,query,popOptions)
  return createResponse.get({success:true,data:users})
    
}

exports.updateStatusUserService = async(userId,status)=>{

  const user=await userRepository.updateUser({_id:userId},{status})

  if(!user) return createResponse.update({})

  return createResponse.update({success:true,data:user})

}
