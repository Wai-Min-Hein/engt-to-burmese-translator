import React from 'react';

interface WordProps {
  text: string;
  onTripleClick: (word: string) => void;
}

const Word: React.FC<WordProps> = ({ text, onTripleClick }) => {
  // Regex to separate punctuation from the word for cleaner lookup
  // This splits "hello," into "hello" and ","
  const cleanWord = text.replace(/^[^\w]+|[^\w]+$/g, ''); 

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    // e.detail contains the click count (1 for single, 2 for double, 3 for triple)
    if (e.detail === 3) {
      // Prevent default selection behavior if desired, though often browser native selection is fine.
      // e.preventDefault(); 
      if (cleanWord.length > 0) {
        onTripleClick(cleanWord);
      }
    }
  };

  // If it's just whitespace, render it but don't make it interactive
  if (!text.trim()) {
    return <span>{text}</span>;
  }

  return (
    <span
      onClick={handleClick}
      className="cursor-pointer hover:bg-blue-100 hover:text-blue-800 rounded px-0.5 transition-colors duration-150 select-none"
      title="Triple-click for dictionary"
    >
      {text}
    </span>
  );
};

export default Word;