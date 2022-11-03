import React, { useEffect, useState, useContext } from 'react';
import { SocketConnection } from './lib/socketConnection'

import './Messages.css';

function Messages(props) {
  const { room } = props

  const [messages, setMessages] = useState({});
  const socketConn = SocketConnection.getInstance()

  useEffect(() => {
    const messageListener = (value) => {
      const { message, room: roomReceived } = value

      if (roomReceived === room) {
        setMessages((prevMessages) => {
          const newMessages = { ...prevMessages };
          newMessages[message.id] = message;
          return newMessages;
        });
      }
    };

    socketConn.onMessageReceived(messageListener)
    socketConn.getMessages(room)
    socketConn.getVotes(room)

    return () => { };
  }, [socketConn]);

  return (
    <div className="message-list">
      {[...Object.values(messages)]
        .sort((a, b) => a.time - b.time)
        .map((message) => (
          <div
            key={message.id}
            className="message-container"
            title={`Sent at ${new Date(message.time).toLocaleTimeString()}`}
          >
            <span className="user">{message.user.name}:</span>
            <span className="message">{message.value}</span>
            <span className="date">{new Date(message.time).toLocaleTimeString()}</span>
          </div>
        ))
      }
    </div>
  );
}

export default Messages;