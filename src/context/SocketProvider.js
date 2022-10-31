import { createContext } from 'react'
import socketio from 'socket.io-client'

const SocketContext = createContext()

const socket = socketio.connect("http://192.168.0.13:3030", {
  auth: {
    name: "Joana"
  }
})

export {
  socket,
  SocketContext
}