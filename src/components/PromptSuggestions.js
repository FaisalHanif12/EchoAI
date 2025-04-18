import React, { useState } from 'react';
import './PromptSuggestions.css';

const PromptSuggestions = ({ onSelectPrompt }) => {
  // All available prompt suggestions organized by category
  const allSuggestions = {
    creative: [
      "Write a short story about a robot discovering emotions",
      "Generate a creative poem about the future",
      "Create a unique superhero concept and their origin story",
      "Write a dialogue between two AIs discussing humanity",
      "Come up with a plot for a sci-fi novel"
    ],
    educational: [
      "Explain quantum computing in simple terms",
      "Explain the difference between AI, ML and deep learning",
      "Summarize the history of the internet in a few paragraphs",
      "How does blockchain technology work?",
      "Explain climate change like I'm 10 years old"
    ],
    practical: [
      "Create a workout plan for beginners",
      "Suggest healthy meal ideas for the week",
      "Help me draft a professional email",
      "Give me tips for improving my public speaking",
      "Write a template for a resume"
    ],
    fun: [
      "Tell me an interesting fact about space",
      "Share a riddle that's hard to solve",
      "Give me creative project ideas",
      "Create a challenging trivia quiz",
      "Tell me a joke about programming"
    ]
  };
  
  // State to track the current category
  const [currentCategory, setCurrentCategory] = useState('mixed');
  
  // Get a mixed selection of prompts from all categories
  const getMixedSuggestions = () => {
    const mixed = [];
    Object.keys(allSuggestions).forEach(category => {
      // Get 2 random suggestions from each category
      const randomized = [...allSuggestions[category]].sort(() => 0.5 - Math.random());
      mixed.push(...randomized.slice(0, 2));
    });
    return mixed.slice(0, 8); // Limit to 8 suggestions
  };
  
  // Get current suggestions based on selected category
  const getCurrentSuggestions = () => {
    if (currentCategory === 'mixed') {
      return getMixedSuggestions();
    }
    return allSuggestions[currentCategory].slice(0, 8);
  };
  
  const suggestions = getCurrentSuggestions();
  
  return (
    <div className="prompt-suggestions-container">
      <div className="prompt-categories">
        <div 
          className={`prompt-category ${currentCategory === 'mixed' ? 'active' : ''}`}
          onClick={() => setCurrentCategory('mixed')}
        >
          Mix
        </div>
        <div 
          className={`prompt-category ${currentCategory === 'creative' ? 'active' : ''}`}
          onClick={() => setCurrentCategory('creative')}
        >
          Creative
        </div>
        <div 
          className={`prompt-category ${currentCategory === 'educational' ? 'active' : ''}`}
          onClick={() => setCurrentCategory('educational')}
        >
          Educational
        </div>
        <div 
          className={`prompt-category ${currentCategory === 'practical' ? 'active' : ''}`}
          onClick={() => setCurrentCategory('practical')}
        >
          Practical
        </div>
        <div 
          className={`prompt-category ${currentCategory === 'fun' ? 'active' : ''}`}
          onClick={() => setCurrentCategory('fun')}
        >
          Fun
        </div>
      </div>
      <div className="prompt-suggestions">
        {suggestions.map((prompt, index) => (
          <div 
            key={index} 
            className="prompt-suggestion" 
            onClick={() => onSelectPrompt(prompt)}
          >
            <div className="prompt-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            <span>{prompt}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromptSuggestions; 