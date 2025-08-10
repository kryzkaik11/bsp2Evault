import React from 'react';
import { motion } from 'framer-motion';
import { UserIcon, SparklesIcon } from './layout/icons/Icons';
import MarkdownRenderer from './ui/MarkdownRenderer';

interface ChatMessageBubbleProps {
    role: 'user' | 'model';
    content: React.ReactNode;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ role, content }) => {
    const isUser = role === 'user';

    const bubbleVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    return (
        <motion.div
            variants={bubbleVariants}
            initial="hidden"
            animate="visible"
            className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <SparklesIcon size={18} />
                </div>
            )}
            
            <div className={`max-w-xl p-4 rounded-2xl ${isUser ? 'bg-primary text-primary-foreground rounded-br-lg' : 'bg-card text-text-high rounded-bl-lg'}`}>
                {typeof content === 'string' ? <div className="prose prose-sm max-w-none text-inherit"><MarkdownRenderer content={content} /></div> : content}
            </div>

             {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface flex items-center justify-center">
                    <UserIcon size={18} />
                </div>
            )}
        </motion.div>
    );
};

export default ChatMessageBubble;
