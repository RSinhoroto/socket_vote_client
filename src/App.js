import Room from './scenes/roomScreen'
import { SocketConnection } from './lib/socketConnection'
import React, { useEffect, useState } from 'react';

function App() {
  const [room, setRoom] = useState("")
  const [join, setJoin] = useState(false)
  const socketConn = SocketConnection.getInstance()

  const handleInputChange = (e) => {
    setRoom(e.target.value)
    setJoin(false)
  }
  const handleJoin = () => {
    console.log("called", room, "dale")
    if(room !== ""){
      socketConn.joinRoom(room)
      setJoin(true)
    }
  }
  useEffect(() => {
    async function getLocalStorage() {
      const getRoom = await window.localStorage.getItem('room')
      await setRoom(getRoom);
      if(getRoom!=="" && getRoom!==null){
        socketConn.joinRoom(getRoom)
        setJoin(true)
      }
    }
    getLocalStorage()
  }, []);
  useEffect(() => {
    window.localStorage.setItem('room', room);
  }, [room]);

  return (
    <>
      <label>Choose room to enter</label>
      <input value={room} onChange={handleInputChange} />
      <button onClick={handleJoin}>Join Room</button>
      {join && <Room room={room}/>}
    </>
  );
}

export default App;