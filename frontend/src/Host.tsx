import { FC } from 'react';
import WordList from './WordList';

interface HostProps {
  words: {
    [word: string]: {
      upvotes: Array<string>;
    };
  }
}

const Host: FC<HostProps> = ({
  words,
}) => {
  return (
    <WordList words={words} variant="host" />
  );
}

export default Host;
