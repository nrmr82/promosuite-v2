import React, { useState, useEffect } from 'react';
import './TypedText.css';

const TypedText = ({ 
  staticText = "Real Estate Content", 
  phrases = [
    "Flyer Generation",
    "Social Media Posts", 
    "Video Scripts",
    "Property Descriptions",
    "Marketing Copy"
  ],
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseTime = 2000
}) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < currentPhrase.length) {
          setCurrentText(currentPhrase.substring(0, currentText.length + 1));
        } else {
          // Finished typing current phrase
          setIsTypingComplete(true);
          setTimeout(() => {
            setIsDeleting(true);
            setIsTypingComplete(false);
          }, pauseTime);
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.substring(0, currentText.length - 1));
        } else {
          // Finished deleting, move to next phrase
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentPhraseIndex, phrases, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <span className="typed-text-container">
      <span className="static-text">{staticText}</span>
      <br />
      <span className="ai-capabilities">
        <span className="ai-label">AI-Powered </span>
        <span className={`dynamic-text ${isTypingComplete ? 'complete' : ''}`}>
          {currentText}
          <span className={`typing-cursor ${isDeleting ? 'deleting' : ''}`}>|</span>
        </span>
      </span>
    </span>
  );
};

export default TypedText;
