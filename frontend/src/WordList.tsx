import { FC } from 'react';

interface WordListProps {
  words: {
    [word: string]: {
      upvotes: Array<string>;
    };
  }
}

const WordList: FC<WordListProps> = ({
  words,
}) => {
  return (
    <ul>
      {Object
        .entries(words)
        .sort((a, b) => a[1].upvotes.length - b[1].upvotes.length)
        .map(([word, { upvotes }]) =>
          <li key={word}>{word} - {upvotes.length} upvotes</li>
        )
      }
    </ul>
  );
}

export default WordList;
