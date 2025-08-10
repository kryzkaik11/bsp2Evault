
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashcardProps {
  question: string;
  answer: string;
}

const Flashcard: React.FC<FlashcardProps> = ({ question, answer }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const cardVariants = {
    front: { rotateY: 0 },
    back: { rotateY: 180 },
  };

  return (
    <div
      className="w-full h-48 perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsFlipped(!isFlipped)}
      aria-label={`Flashcard: ${isFlipped ? 'Answer' : 'Question'}. Click to flip.`}
    >
      <motion.div
        className="relative w-full h-full transform-style-preserve-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Front of Card (Question) */}
        <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-4 bg-card border border-border rounded-lg">
          <div className="text-center">
            <p className="text-xs text-text-low mb-2">QUESTION</p>
            <p className="text-text-high font-medium">{question}</p>
          </div>
        </div>

        {/* Back of Card (Answer) */}
        <motion.div
          className="absolute w-full h-full backface-hidden flex items-center justify-center p-4 bg-surface border border-primary rounded-lg"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="text-center">
            <p className="text-xs text-primary mb-2">ANSWER</p>
            <p className="text-text-high text-sm">{answer}</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Flashcard;
