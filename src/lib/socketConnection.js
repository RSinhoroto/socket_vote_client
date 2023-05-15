import { io, Socket } from 'socket.io-client'

export class SocketConnection {
  static instance;
  socket;
  serverAddress = 'http://localhost:3030';

  static getInstance(params) {
    if (!SocketConnection.instance) {
      SocketConnection.instance = new SocketConnection(params);
    }
    return SocketConnection.instance;
  }

  connect(isAdmin = false) {
    if (!this.socket) {
      if (isAdmin) {
        this.socket = io(this.serverAddress, {
          query: {
            admin: true
          }
        });
      } else {
        this.socket = io(this.serverAddress);
      }
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.close();
      this.socket = undefined;
    }
  }

  push(tag, message) {
    if (this.socket) return this.socket.emit(tag, message);
  }

  addEventListener(eventName, callback) {
    const ref = this.socket.on(eventName, callback)
    return () => this.socket.off(eventName, ref)
  }
  onMessageReceived(callback) {
    return this.addEventListener(`message`, callback)
  }
}