import React, { createContext, useCallback, useEffect, useState } from 'react';
import './App.css';
import io, { Socket } from 'socket.io-client';
import Host from './Host';
import Guest from './Guest';

export const SocketContext = createContext<{ socket: Socket | null, roomCode: string } | null>(null);

export interface Words {
  [word: string]: {
    upvotes: Array<string>;
  };
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [persona, setPersona] = useState('');
  const [words, setWords] = useState<Words>({});

  useEffect(() => {
    const socket = io(
      process.env.NODE_ENV === 'production'
        ? '/'
        : 'http://localhost:8080'
    );
    socket.on('connect', () => setSocket(socket));
    socket.on('session:roomcode', (roomCode: string) => {
      setRoomCode(roomCode);
      setPersona('host');
    });
    socket.on('session:joined', (roomCode: string, words: Words) => {
      setRoomCode(roomCode);
      setPersona('guest');
      setWords(words);
    });
    socket.on('session:words:updated', (words: Words) => {
      setWords(words);
    });
    socket.on('session:words:removed', (word: string) => {
      setWords(words => {
        const newWords = { ...words };
        delete newWords[word];
        return newWords;
      });
    });
  }, []);

  const createRoom = useCallback(() => {
    socket?.emit('session:host');
  }, [socket]);

  const joinRoom = useCallback(() => {
    socket?.emit('session:join', roomCodeInput);
  }, [socket, roomCodeInput]);

  return (
    <div className="App">
      <h1>Flowzone</h1>
      <h2>{persona}</h2>
      {roomCode
        ? <code>code: {roomCode}</code>
        : <>
          <button onClick={createRoom}>Create room</button>
          <div>
            <input type="text" onChange={e => setRoomCodeInput(e.target.value)} value={roomCodeInput} />
            <button onClick={joinRoom}>Join room</button>
          </div>
        </>
      }
      <SocketContext.Provider value={{ socket, roomCode }}>
        {persona && (
          persona === 'host' ? <Host words={words} /> : <Guest words={words} />
        )}
      </SocketContext.Provider>
    </div>
  );
}

export default App;
