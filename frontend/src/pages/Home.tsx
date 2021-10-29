import {
  useCallback,
  useContext,
} from 'react';
import { Link } from 'react-router-dom';
import { SocketContext } from '../App';

const Home = () => {
  const ctx = useContext(SocketContext);

  const createRoom = useCallback(() => {
    ctx?.socket?.emit('session:host');
  }, [ctx?.socket]);

  return (
    <>
    <div>
      <button className="button--secondary" onClick={createRoom}>
        Host Session
      </button>
    </div>
    <div className="or-text">
      <span>Or</span>
    </div>
    <div>
      <Link to="/join">
        <button className="button--primary">
          Join Session
        </button>
      </Link>
    </div>
  </>
  );
};

export default Home;
