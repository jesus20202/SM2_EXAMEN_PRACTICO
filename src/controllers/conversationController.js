const conversationService = require('../services/conversationService');
const messageService = require('../services/messageService');
const appError = require('../utils/appError');
const resSend = require('../utils/resSend');
const cryptoFeatures = require('../utils/crytoFeatures');
const catchAsync = require('../utils/catchAsync');
const requireField = require('./../utils/requireField');
const translatorNext = require('../utils/translatorNext');
const socketController = require('./socketController')
const emitToActiveUsersInRoom = require('../utils/socketEmitActiveUsersRoom');
const emitMessageToUser = require('../utils/socketEmitMessageToUser');
const handleClientError = (socket, statusCode, message) => {
  socket.emit('clientError', { statusCode, status: message });
};

const emitUserConversations = async (socket, senderId) => {
  const responseConversations = await conversationService.getUserConversationsService(senderId);
  
  if (!responseConversations.success) {
    socket.emit('receiveUserConversations', {
      statusCode: 200,
      status: true,
      data: null,
    });
    return;
  }

  const responseDetailsMessageConversations = await Promise.all(
    responseConversations.data.map(async (message) => {
      const responseUnreadMessage = await messageService.getUnreadMessagesService(message._id, senderId);
      message._doc.countUnread = responseUnreadMessage.data;
      message.lastMessage.content = cryptoFeatures.decrypt(message.lastMessage.content);
      return message;
    })
  );
  socket.emit('receiveUserConversations', {
    statusCode: 200,
    status: true,
    data: responseDetailsMessageConversations,
  });
};

exports.initiateConversationController = catchAsync(async (req, res, next) => {
  const { userId, memberUserId, content } = req.body;

  if (requireField(userId, memberUserId, content)) {
    return next(new appError(translatorNext(req, 'MISSING_REQUIRED_FIELDS'), 400));
  }

  const response = await conversationService.initiateConversationService([{ userId: memberUserId }], userId, content);

  const socket = socketController()
  const io=socket.io

  const usersInvolved = [userId, memberUserId];

  usersInvolved.forEach(userId => {
    emitMessageToUser(io,userId, 'getUserConversations', {
      statusCode: response.status,
      status: response.success,
      data: response.data,
    });
  });

  resSend(res, { statusCode: response.status, status: response.success, data: response.data, message: response.code });
});

exports.getUserConversationsController = async (io, socket) => {
  await emitUserConversations(socket, socket.userId);
};

exports.getConversationMessagesController = async (io, socket, conversationId) => {
  socket.currentRoomId = conversationId;
  const senderId = socket.userId;

  const responseMarkMessage = await messageService.markMessagesAsReadService(conversationId, senderId);
  
  if (!responseMarkMessage.success) {
    return handleClientError(socket, 400, 'Error al marcar mensajes');
  }

  const response = await messageService.getAllMessagesService(conversationId);
  
  if (!response.success) {
    return handleClientError(socket, response.statusCode, 'Error al obtener los mensajes');
  }

  await emitUserConversations(socket, senderId);

  await emitToActiveUsersInRoom(io, conversationId, 'getConversationMessages', {
    statusCode: response.status,
    status: response.success,
    data: response.data,
  });
};

exports.joinConversationController = async (io, socket, conversationId) => {
  socket.join(conversationId);
  io.in(conversationId).emit('joinConversation', { statusCode: 200, status: 'Se unio a la conversacion' });
};

exports.leaveConversationController = async (io, socket, conversationId) => {
  socket.leave(conversationId);
  io.in(conversationId).emit('leaveConversation', { statusCode: 200, status: 'Salio de la conversacion' });
};

exports.editPhotoConversationController = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;

  if (requireField(conversationId)) {
    return next(new appError(translatorNext(req, 'MISSING_REQUIRED_FIELDS'), 400));
  }

  // Implement the photo editing logic here
  // const response = await conversationService.editPhotoConversationService(conversationId, req.fileDetails);

  // For now, we'll just return a placeholder response
  const response = { status: 200, success: true, data: null, code: 'PHOTO_UPDATED' };
  resSend(res, { statusCode: response.status, status: response.success, data: response.data, message: response.code });
});