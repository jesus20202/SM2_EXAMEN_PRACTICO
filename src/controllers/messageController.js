const messageService = require('../services/messageService')
const conversationService = require('../services/conversationService')
const emitToActiveUsersInRoom = require('../utils/socketEmitActiveUsersRoom')


exports.sendMessageController = async (io, socket, conversationId, content) => {
    const senderId = socket.userId;

    const responseCheck = await conversationService.checkParticipantsConversationService(conversationId, senderId);

    if (!responseCheck.success) {
        socket.emit('clientError', {
            statusCode: responseCheck.status,
            status: responseCheck.success,
            data: responseCheck.data,
        });
        return;
    }


    const response = await messageService.sendMessageService(conversationId, senderId, content);
  
    if (response.success) {

        io.in(conversationId).emit('getUserConversations', {
            statusCode: response.status,
            status: response.success,
            data: response,
        });

        const responseMessages = await messageService.getAllMessagesService(conversationId);

        await emitToActiveUsersInRoom(io,conversationId,'getConversationMessages',{
            statusCode: responseMessages.status,
            status: responseMessages.success,
            data: responseMessages.data,
        })
    }

    socket.emit('sendMessage', {
        statusCode: response.status,
        status: response.success,
        data: response.data,
    });
};
exports.editMessageController = async (io,socket,conversationId,content,messageId)=>{
    const senderId = socket.userId

    const responseCheck=await conversationService.checkParticipantsConversationService(conversationId,senderId)

    if(!responseCheck.success){
        socket.emit('clientError',{statusCode:responseCheck.status,status:responseCheck.success,data:responseCheck.data});
        return;
    }

    const response = await messageService.editMessageService(messageId,senderId,content)

    if (response.success) {
        await emitToActiveUsersInRoom(io,conversationId,'getConversationMessages',{
            statusCode: response.status,
            status: response.success,
            data: response.data,
        })
    }

    socket.emit('editMessage',{statusCode:response.status,status:response.success,data:response.data});
}

exports.deleteMessageController = async (io,socket,conversationId,messageId)=>{
    const senderId = socket.userId

    const responseCheck=await conversationService.checkParticipantsConversationService(conversationId,senderId)

    if(!responseCheck.success){
        socket.emit('clientError',{statusCode:responseCheck.status,status:responseCheck.success,data:responseCheck.data});
        return;
    }
    const response = await messageService.deleteMessageService(messageId)

    if (response.success) {
        await emitToActiveUsersInRoom(io,conversationId,'getConversationMessages',{
            statusCode: response.status,
            status: response.success,
            data: response.data,
        })
    }

    socket.emit('deleteMessage',{statusCode:response.status,status:response.success,data:response.data});
}


exports.markMessagesAsReadController = async (io,socket,conversationId)=>{
    const senderId = socket.userId

    const response=await messageService.markMessagesAsReadService(conversationId,senderId)

    if(!response.success){
        socket.emit('clientError',{statusCode:response.status,status:responseCheck.success,data:responseCheck.data});
        return;
    }
    io.in(conversationId).emit('editMessage',{statusCode:response.status,status:response.success,data:response.data});
}




