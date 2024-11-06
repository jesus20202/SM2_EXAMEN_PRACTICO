const { Server } = require("socket.io");
const catchAsyncAdapter = require('../utils/catchAsyncAdapter');
const conversationController = require('../controllers/conversationController')
const messageController = require('../controllers/messageController')
const authMiddleware = require("../middleware/authMiddleware")
class SocketInputAdapter {
  static instance = undefined;

  constructor(server) {
    if (SocketInputAdapter.instance) return SocketInputAdapter.instance;
    
    SocketInputAdapter.instance = this;
    
    this.io = new Server(server, {
      cors: {
        origin: "*", 
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
      }
    });
    this.catchAsyncAdapter = catchAsyncAdapter.bind(this);
    this.handleSocketEvents();
  }

  handleSocketEvents() {
    this.io.on('connection', this.onConnection.bind(this));
  }

  async onConnection(socket) {

    await this.catchAsyncAdapter(authMiddleware, true, { socket });

    const markReadInterval = setInterval(() => {
      const conversationId = socket.currentRoomId
      if (conversationId) {
        this.catchAsyncAdapter(conversationController.getConversationMessagesController, true, { io:this.io,socket,conversationId})
      }
    }, 2000);

    const eventHandlers = {
      'sendMessage': (roomId,content) => this.catchAsyncAdapter(messageController.sendMessageController, true, { io:this.io,socket,roomId,content}),
      'editMessage': (roomId,content,messageId) => this.catchAsyncAdapter(messageController.editMessageController, true, { io:this.io,socket,roomId,content,messageId}),
      'deleteMessage': (roomId,messageId) => this.catchAsyncAdapter(messageController.deleteMessageController, true, { io:this.io,socket,roomId,messageId}),
      'sendUserConversations': () => this.catchAsyncAdapter(conversationController.getUserConversationsController, true, { io:this.io,socket }),
      'getConversationMessages': (conversationId) => this.catchAsyncAdapter(conversationController.getConversationMessagesController, true, { io:this.io,socket,conversationId }),
      'joinConversation': (roomId) => this.catchAsyncAdapter(conversationController.joinConversationController, true, { io:this.io,socket,roomId }),
      'leaveConversation': (roomId) => this.catchAsyncAdapter(conversationController.leaveConversationController, true, { io:this.io,socket,roomId }),
      'deactivateConversation': () => {
        socket.currentRoomId = null;
        clearInterval(markReadInterval);
      },
      'disconnect': () => console.log("client disconnect")
    };

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.on(event, async (...args) => await handler(...args));
    });
  }

  static getInstance(server) {
    if (!SocketInputAdapter.instance && server) {
      new SocketInputAdapter(server);
    }
    return SocketInputAdapter.instance;
  }
}

module.exports = SocketInputAdapter.getInstance;