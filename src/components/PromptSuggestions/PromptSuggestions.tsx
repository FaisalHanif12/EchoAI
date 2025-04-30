
import React from 'react';
import styles from './PromptSuggestions.module.css';

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelectPrompt }) => {
  const suggestions = [
    "Summarize this article for me",
    "Write a poem about nature",
    "Explain quantum computing simply",
    "Generate a creative story idea",
    "Help me plan my weekend"
  ];

  return (
    <div className={styles.suggestionsContainer}>
      <div className={styles.suggestions}>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className={styles.suggestionButton}
            onClick={() => onSelectPrompt(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PromptSuggestions;
