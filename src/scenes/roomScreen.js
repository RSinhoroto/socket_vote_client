import {useState, useEffect} from 'react'
import { SocketConnection } from '../lib/socketConnection'


import Messages from '../Messages';
import MessageInput from '../MessageInput';
import '../App.css';
import { socket } from '../context/SocketProvider';
const roomId = 1;

function Room(props){
  const {room} = props

  const socketConn = SocketConnection.getInstance()

  const [name, setName] = useState("")
  const [votes, setVotes] = useState({a: 0, b: 0});

  socketConn.onVoteReceived((incomingVotes) => {
    setVotes({a: incomingVotes.a, b:incomingVotes.b});
  })

  useEffect(() => {
    console.log('printou')
    const getName = window.localStorage.getItem('name')
    console.log(getName)
    setName(getName);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('name', name);
  }, [name]);
  const roomName = name
  return (
    <div className="App">
      <header className="app-header">
        React Chat - Room {room}
      </header>
      { socketConn ? (
        <div className="chat-container">
          <Messages room={room} />
          <MessageInput room={room} />
          <div >
            <p>Espaço de votação</p>
            <button onClick={() => socketConn.pushVote(room, 'a')}>a</button>
            <button onClick={() => socketConn.pushVote(room, 'b')}>b</button>

            <div>
              <h6>Resultado das votações</h6>
              <p>Votos em A: {votes.a}</p>
              <p>Votos em B: {votes.b}</p>
            </div>
          </div>
        </div>
      ) : (
        <div>Not Connected</div>
      )}
    </div>
  )
}

export default Room