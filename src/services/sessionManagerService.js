class SessionManager {
    static instance = undefined;
  
    constructor(io) {
      if (!SessionManager.instance) {
        SessionManager.instance = this;
      }
      console.log('Load Session Manager');
      this.io = io;
      this.rooms = new Map();
    }
  
    async addRoom(roomId) {
      const { room: room_id, _id } = observer;
      const session_id = String(_id);
  
      if (!this.rooms.has(room_id)) {
        this.rooms.set(room_id, new Set());
      }
      const observers = this.rooms.get(room_id);
      if (!observers.has(session_id)) {
        const qrActiveInRoom = Array.from(observers).some((obsId) => {
          const obs = this.sessionToObserver.get(obsId);
          return obs && obs.qrActive === true;
        });
        if (!qrActiveInRoom) {
          observers.add(session_id);
          this.sessionToObserver.set(session_id, observer); // Store the observer object directly
          messageEmit(this.io, room_id, 'clientAdded', { status: 'success', messageCode: 'ADDED_CLIENT' });
          return true;
        }
        messageEmit(this.io, room_id, 'clientAdded', { messageCode: 'ERROR_PENDING_CLIENT_QR' });
        return false;
      }
      messageEmit(this.io, room_id, 'clientAdded', { messageCode: 'ERROR_PENDING_CLIENT' });
      return false;
    }
  
    async leaveRoom(roomId) {
      
    }
  
  
    async notifyQr(room_id, qr) {
      messageEmit(this.io, room_id, 'receiveQR', { status: 'success', messageCode: 'QR_EMITTED', data: qr });
    }
  
    async notifyAuthenticated(room_id) {
      messageEmit(this.io, room_id, 'clientAuthenticated', { status: 'success', messageCode: 'CLIENT_AUTHENTICATED' });
    }
    static getInstance(io) {
      if (!SessionManager.instance && io) {
        SessionManager.instance = new SessionManager(io);
      }
      return SessionManager.instance;
    }
  }
  
  module.exports = SessionManager.getInstance;