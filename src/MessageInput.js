import React, { useState, useContext } from 'react';
import { SocketConnection } from './lib/socketConnection'

import './MessageInput.css';
const roomId = 1
const NewMessage = (props) => {
  const {room} = props
  const [value, setValue] = useState('');
  const socketConn = SocketConnection.getInstance()


  const submitForm = (e) => {
    e.preventDefault();
    socketConn.pushMessage(room, value)
    setValue('');
  };

  return (
    <form onSubmit={submitForm}>
      <input
        autoFocus
        value={value}
        placeholder="Type your message"
        onChange={(e) => {
          setValue(e.currentTarget.value);
        }}
      />
    </form>
  );
};

export default NewMessage;