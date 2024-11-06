const messageRepository = require('../repositories/messageRepository');
const createResponse = require('./../utils/createResponse')
/*

'conversationId', 'senderId', 'type', 'content', 'mediaUrl', 'replyTo', 'reactions', 'readBy', 'timestamp', 'isEdited', 'isDeleted'

*/

exports.getAllMessagesService = async (conversationId) => {
    const messages = await messageRepository.getAllMessages({ conversationId },{sort:'timestamp'},'senderId');

    if (!messages) {
        return createResponse.patch({});
    }
    
    const decryptResponse = messages.map(message => {
        message.content = message.decryptContent();
        return message;
    });

    return createResponse.patch({ success: true, data: decryptResponse });
};

exports.getUnreadMessagesService = async (conversationId, senderId) => {
    const unreadMessages = await messageRepository.getAllMessages({
        senderId: { $ne: senderId },
        conversationId,
        "readBy.userId": { $ne: senderId },
    });

    if (!unreadMessages) {
        return createResponse.patch({data:0});
    }

    return createResponse.patch({ success: true, data: unreadMessages.length});
};

exports.markMessagesAsReadService = async (conversationId, senderId) => {
    const markMessages = await messageRepository.updateManyMessages(
        {
          conversationId,
          senderId: { $ne: senderId },
          "readBy.userId": { $ne: senderId },
        },
        {
          $push: { readBy: { userId:senderId, timestamp: Date.now() } },
        }
    );

    if (!markMessages) {
        return createResponse.patch({});
    }

    return createResponse.patch({ success: true, data: markMessages.length});
};
  

exports.sendMessageService = async (conversationId,senderId,content) => {
  
    const message = await messageRepository.createMessage({conversationId,senderId,content});

    if (!message) {
        return createResponse.post({});
    }

    return createResponse.post({ success: true, data: message });
};

exports.editMessageService = async (messageId,senderId,content) => {
 
    const message = await messageRepository.updateMessage({messageId,senderId},{content,isEdited:true});

    if (!message) {
        return createResponse.post({});
    }

    return createResponse.patch({ success: true, data: message });
};

exports.deleteMessageService = async (messageId) => {
 
    const message = await messageRepository.updateMessage({messageId},{isDeleted:true});

    if (!message) {
        return createResponse.post({});
    }

    return createResponse.patch({ success: true, data: message });
};