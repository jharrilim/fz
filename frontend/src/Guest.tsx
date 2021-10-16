import { FC, useCallback, useContext, useState } from 'react';
import { SocketContext } from './App';
import WordList from './WordList';

interface GuestProps {
  words: {
    [word: string]: {
      upvotes: Array<string>;
    };
  }
}


const Guest: FC<GuestProps> = ({ words }) => {
  const ctx = useContext(SocketContext);

  const [word, setWord] = useState('');

  const sendWord = useCallback(() => {
    ctx?.socket?.emit('session:word:add', ctx.roomCode, word);
    setWord('');
  }, [ctx, word, setWord]);

  return (
    <div>
      <WordList words={words} />

      <p>Enter a word!</p>
      <input type="text" onChange={e => setWord(e.target.value)} value={word} />
      <button onClick={sendWord}>Send</button>
    </div>
  );
}

export default Guest;
