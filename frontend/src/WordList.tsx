import { FC, useCallback, useContext } from 'react';
import { SocketContext } from './App';
import styles from './WordList.module.css';

interface WordListProps {
  words: {
    [word: string]: {
      upvotes: Array<string>;
    };
  },
  variant: 'guest' | 'host',
}

const WordList: FC<WordListProps> = ({
  words,
  variant,
}) => {
  const ctx = useContext(SocketContext);

  const wordClicked = useCallback((word: string) => () => {
    if (variant === 'guest') {
      ctx?.socket?.emit('session:word:add', ctx.roomCode, word);
    } else {
      ctx?.socket?.emit('session:word:remove', ctx.roomCode, word);
    }
  }, [ctx, variant]);

  return (
    <ul className={styles.wordList}>
      {Object
        .entries(words)
        .sort((a, b) => b[1].upvotes.length - a[1].upvotes.length)
        .map(([word, { upvotes }]) =>
          <li key={word}>
            <button onClick={wordClicked(word)}>
              {word} - {upvotes.length} upvote{upvotes.length !== 1 ? 's' : ''}
            </button>
          </li>
        )
      }
    </ul>
  );
}

export default WordList;
