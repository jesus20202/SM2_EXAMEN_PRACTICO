const conversationRepository = require('../repositories/conversationRepository');
const messageService = require('../services/messageService');
const userService = require('../services/userService');
const createResponse = require('./../utils/createResponse')

const mongoose = require('mongoose');

exports.initiateConversationService = async (participants, userId, content) => {


  const allParticipants = [...participants, { userId }];

  if (participants.some(participant => participant.userId === userId)) {
    return createResponse.post({ success: false, message: 'No puedes iniciar una conversación contigo mismo.' });
  }

  const participantsExist = await Promise.all(
    allParticipants.map(async participant => {
      const response = await userService.getUserService(participant.userId);
      return response;
    })
  );

  if (participantsExist.some((response) => !response.success)) {
    return createResponse.post({ success: false, message: 'Uno o más participantes no existen.' });
  }

  const participantIds = allParticipants.map(participant => new mongoose.Types.ObjectId(participant.userId));


  const uniqueParticipantIds = [...new Set(participantIds.map(id => id.toString()))].map(id => new mongoose.Types.ObjectId(id));

  let conversationExist = await conversationRepository.getConversation({ 
    type: 'individual',
    'participants.userId': { $all: uniqueParticipantIds }, 
    'participants': { $size: uniqueParticipantIds.length }
  });

  if (!conversationExist) {
      
      const formattedParticipants = participantsExist.map((response) => {
          const user = response.data;
          return { userId: user._id, name: user.name };
      });
      conversationExist = conversationRepository.getConversationInstance();
      conversationExist.admin = { userId: new mongoose.Types.ObjectId(userId), name: formattedParticipants.find(p => p.userId.toString() === userId).name };
      conversationExist.participants = formattedParticipants;
      conversationExist.type = 'individual';

      conversationExist = await conversationExist.save();

      const message = await messageService.sendMessageService(conversationExist._id, userId, content);

      if (!message.success) {
          return createResponse.post({ success: false, message: 'Error al enviar el mensaje.' });
      }
  }
  return createResponse.post({ success: true, data: conversationExist });
};

exports.getUserConversationsService  = async (userId) => {
    const query = {
      sort: 'lastMessage.timestamp'
    };
    
    const conversations = await conversationRepository.getAllConversations(
      { $or: [{ 'admin.userId': userId }, { 'participants.userId': userId }] },
      query
    );

    if (!conversations || conversations.length === 0) {
      return createResponse.get({});
    }
  
    for (let conversation of conversations) {
      conversation._doc.titleTemp = await conversation.getTitleTemp(userId);
    }
  
    return createResponse.get({ success: true, data: conversations });
  };
exports.getConversationDetailsService  = async (conversationId) => {
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation) {
      return createResponse.get({});
    }
    return createResponse.get({ success: true, data: conversation });
};

exports.checkParticipantsConversationService  = async (conversationId,participantId) => {

  let conversation = await conversationRepository.getConversationById(conversationId);
  const isAdmin = conversation.admin.userId.toString() === participantId.toString();
  const isParticipant = conversation.participants.some(
    participant => participant.userId.toString() === participantId.toString()
  );

  if (!isAdmin && !isParticipant) {
    return createResponse.get({});
  }

  return createResponse.get({ success: true, data: conversation });
};


