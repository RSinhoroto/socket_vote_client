import { createContext } from 'react';
import socketio from 'socket.io-client';

const SocketContext = createContext();

const socketPlayer = socketio.connect("http://localhost:3030");
const socketAdmin = socketio.connect("http://localhost:3030", {
  auth: {
    name: "Admin"
  }
});

export {
  socketPlayer,
  socketAdmin,
  SocketContext,
};