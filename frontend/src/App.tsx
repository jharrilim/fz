import { createContext, useEffect, useState } from 'react';
import './App.css';
import io, { Socket } from 'socket.io-client';
import {
  Switch,
  Route,
  useHistory,
} from 'react-router-dom';
import Host from './Host';
import Guest from './Guest';
import Home from './pages/Home';
import EnterRoomCode from './pages/EnterRoomCode';
export const SocketContext = createContext<{ socket: ReturnType<typeof io> | null, roomCode: string } | null>(null);

export interface Words {
  [word: string]: {
    upvotes: Array<string>;
  };
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [persona, setPersona] = useState('');
  const [words, setWords] = useState<Words>({});
  const history = useHistory();

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
      history.push(`/s/${roomCode}`);
    });
    socket.on('session:joined', (roomCode: string, words: Words) => {
      setRoomCode(roomCode);
      setPersona('guest');
      setWords(words);
      history.push(`/s/${roomCode}`);
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

  return (
    <SocketContext.Provider value={{ socket, roomCode }}>
      <div className="container">
        <h1 className="title">Flowzone</h1>
        {persona && <h2>{persona}</h2>}
        {roomCode && <code>code: {roomCode}</code>}
        <Switch>
          <Route path="/join">
            <EnterRoomCode />
          </Route>
          <Route path="/s/:roomCode">
            {persona && (
              persona === 'host'
                ? <Host words={words} />
                : <Guest words={words} />
            )}
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </SocketContext.Provider>
  );
}

export default App;
