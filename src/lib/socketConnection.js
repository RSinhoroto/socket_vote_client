import socketio from 'socket.io-client'

export class SocketConnection {
  static instance; //private static instance
  constructor(params) {
    const socketParams = { auth: { name: "Joana" } }
    console.log(socketParams)
    this.socket = socketio.connect("http://192.168.0.13:3030", socketParams)
  }
  static getInstance(params) { //private
    if (!SocketConnection.instance) {
      SocketConnection.instance = new SocketConnection()
    }
    return SocketConnection.instance
  }
  push(command, message) { //private
    return this.socket.emit(command, message)
  }
  addEventListener(eventName, callback) { //private
    const ref = this.socket.on(eventName, callback)
    return () => this.socket.off(eventName, ref)
  }
  onMessageReceived(callback) {
    return this.addEventListener(`message`, callback)
  }
  pushMessage(room, message) {
    return this.push(`message`, { message, room })
  }
  joinRoom(room) {
    return this.push('join-room', room)
  }
  getMessages(room) {
    return this.push('getMessages', room)
  }

  // Identify vote message received and update vote count onscreen
  onVoteReceived(callback) {
    return this.addEventListener('vote', callback)
  }

  // Send a vote to server
  pushVote(room, message) {
    return this.push(`vote`, { message, room })
  }
}