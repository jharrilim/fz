import {
  useCallback,
  useContext,
  useState,
} from 'react';
import {
  Link,
} from 'react-router-dom';

import { SocketContext } from '../App';


const EnterRoomCode = () => {
  const ctx = useContext(SocketContext);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const joinRoom = useCallback(() => {
    ctx?.socket?.emit('session:join', roomCodeInput);
  }, [ctx?.socket, roomCodeInput]);

  return (
    <>
      <div>
        <input
          className="room-code-input"
          type="text"
          onChange={e => setRoomCodeInput(e.target.value)}
          value={roomCodeInput}
        />
        <div>
          <Link to="/">
            <button
              className="button--secondary"
            >
              Back
            </button>
          </Link>
          <button
            className="button--primary"
            onClick={joinRoom}
          >
            Enter Room Code
          </button>
        </div>
      </div>
    </>
  );
};

export default EnterRoomCode;
