

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleGenAI, Type, Chat } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';
import { AppFile, Role, Visibility, Flashcard as FlashcardType, AnalysisContent, ChatMessage, FileStatus } from '../types';
import { useAuth } from '../hooks/AuthContext';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { ChevronLeftIcon, FileIcon, VideoIcon, AudioIcon, SparklesIcon, DownloadIcon, ChatBubbleIcon } from '../components/layout/icons/Icons';
import Tag from '../components/ui/Tag';
import * as api from '../services/api';
import MarkdownRenderer from '../components/ui/MarkdownRenderer';
import Flashcard from '../components/ai/Flashcard';
import Spinner from '../components/ui/Spinner';
import Input from '../components/ui/Input';
import FilePreview from '../components/FilePreview';
import ChatMessageBubble from '../components/ChatMessage';


interface FileDetailProps {
    file: AppFile;
    onBack: () => void;
    updateFile: (file: AppFile) => void;
}

type AIFeature = 'summary' | 'concepts' | 'questions' | 'flashcards' | 'timeline' | 'chat';
type Tab = 'preview' | AIFeature;

const FileTypeIcon: React.FC<{ type: AppFile['type'] }> = ({ type }) => {
  const fileTypeStr = type.toLowerCase();
  if (['mp4', 'mov'].includes(fileTypeStr)) return <VideoIcon className="w-10 h-10 text-accent" />;
  if (['mp3', 'wav', 'm4a'].includes(fileTypeStr)) return <AudioIcon className="w-10 h-10 text-accent" />;
  return <FileIcon className="w-10 h-10 text-primary" />;
};

const FileDetail: React.FC<FileDetailProps> = ({ file, onBack, updateFile }) => {
    const { profile } = useAuth();
    const [aiContent, setAiContent] = useState<AnalysisContent>(file.ai_content || {});
    const [activeTab, setActiveTab] = useState<Tab>('preview');
    const [loading, setLoading] = useState<Record<AIFeature, boolean>>({
        summary: false, concepts: false, questions: false, flashcards: false,
        timeline: false, chat: false
    });
    const [error, setError] = useState<string | null>(null);
    const [chatInput, setChatInput] = useState('');
    const [chat, setChat] = useState<Chat | null>(null);
    const chatHistoryContainerRef = useRef<HTMLDivElement>(null);
    
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [isLoadingContent, setIsLoadingContent] = useState(true);

    useEffect(() => {
        setIsLoadingContent(true);
        setFileContent(null);
        api.getFileContent(file)
            .then(content => setFileContent(content))
            .catch(err => {
                console.error("Failed to load file content", err);
                setError("Could not load file content. AI features may be inaccurate.");
            })
            .finally(() => setIsLoadingContent(false));
    }, [file]);

    useEffect(() => {
        if (chatHistoryContainerRef.current) {
            chatHistoryContainerRef.current.scrollTop = chatHistoryContainerRef.current.scrollHeight;
        }
    }, [aiContent.chat_history]);

    useEffect(() => {
        if (Object.keys(aiContent).length > 0 && JSON.stringify(aiContent) !== JSON.stringify(file.ai_content)) {
            updateFile({ ...file, ai_content: aiContent });
        }
    }, [aiContent, file, updateFile]);

    const ai = useMemo(() => {
        if (!process.env.API_KEY) {
            setError("Error: API_KEY is not configured. AI features are disabled.");
            return null;
        }
        setError(null);
        return new GoogleGenAI({ apiKey: process.env.API_KEY });
    }, []);

    // Initialize the chat session
    useEffect(() => {
        if (ai && fileContent && activeTab === 'chat' && !chat) {
            const systemInstruction = `You are a helpful study coach. Your goal is to help the user understand the provided document. The document is titled "${file.title}". The full text content of the document is: \n\n---\n${fileContent}\n---\n\nBase all your answers on this document content. If the user asks something outside the scope of the document, politely state that you can only answer questions about the provided material.`;

            const history = (aiContent.chat_history || []).map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }));

            const chatSession = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction },
                history,
            });
            setChat(chatSession);
        }
    }, [ai, fileContent, activeTab, chat, aiContent.chat_history, file.title]);

    const handleGenerate = async (feature: AIFeature) => {
        if (!ai || !fileContent) {
            setError("Cannot generate AI content because the file's text could not be loaded.");
            return;
        }
        setLoading(prev => ({...prev, [feature]: true}));
        setError(null);

        let prompt: string = '';
        let schema: any;

        switch (feature) {
            case 'summary':
                prompt = `Provide a comprehensive, well-structured summary of the following document:\n\n---\n${fileContent}\n---`;
                break;
            case 'concepts':
                prompt = `Extract the key concepts, terms, and important people from the following document. Present them as a markdown bulleted list:\n\n---\n${fileContent}\n---`;
                break;
            case 'questions':
                prompt = `Generate a list of 3-5 open-ended study questions based on the main topics of the following document. Present them as a markdown numbered list:\n\n---\n${fileContent}\n---`;
                break;
            case 'timeline':
                 prompt = `Analyze the following document for key events or a sequence of steps. Create a timeline from this information. If the document is not event-based, list the main sections in order. Present as a markdown list.\n\n---\n${fileContent}\n---`;
                break;
            case 'flashcards':
                prompt = `Based on the following document, create a JSON array of 5 flashcards. Each flashcard should have a 'question' and 'answer' field. The questions should cover the most important topics in the text.\n\n---\n${fileContent}\n---`;
                schema = { type: Type.OBJECT, properties: { flashcards: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, answer: { type: Type.STRING }}, required: ['question', 'answer']}}} };
                break;
            default:
                setLoading(prev => ({...prev, [feature]: false}));
                return;
        }

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                ...(schema && { config: { responseMimeType: 'application/json', responseSchema: schema } }),
            });
            const text = response.text;
            
            setAiContent(prev => {
                if (feature === 'flashcards') {
                    return {...prev, flashcards: JSON.parse(text).flashcards};
                }
                return {...prev, [feature]: text};
            });
        } catch(e: any) {
            console.error(e);
            setError(`An error occurred while generating the ${feature}. ${e.message}`);
        } finally {
            setLoading(prev => ({...prev, [feature]: false}));
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !chat) return;

        const messageContent = chatInput.trim();
        setChatInput('');
        setLoading(prev => ({ ...prev, chat: true }));
        setError(null);
        
        setAiContent(prev => ({
            ...prev,
            chat_history: [...(prev.chat_history || []), { role: 'user', content: messageContent }]
        }));

        try {
            const response = await chat.sendMessage({ message: messageContent });
            setAiContent(prev => ({
                ...prev,
                chat_history: [...(prev.chat_history || []), { role: 'model', content: response.text }]
            }));
        } catch (e: any) {
            console.error(e);
            setError(`Failed to get a response from the Study Coach. ${e.message}`);
            // Roll back user message on error
            setAiContent(prev => ({...prev, chat_history: prev.chat_history?.slice(0, -1)}));
        } finally {
            setLoading(prev => ({ ...prev, chat: false }));
        }
    }

    const handlePublish = async () => {
        const updated = await api.publishFiles([file.id]);
        if (updated && updated.length > 0) {
            updateFile(updated[0]);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024; const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${['Bytes', 'KB', 'MB', 'GB'][i]}`;
    };
    
    const renderContent = (feature: AIFeature) => {
        const content = aiContent[feature as keyof AnalysisContent];
        const featureLoading = loading[feature];
        
        const generateButton = (
            <div className="text-center py-16 bg-surface rounded-lg flex flex-col items-center justify-center min-h-[300px]">
                <SparklesIcon size={48} className="text-accent mb-4"/>
                <h3 className="text-lg font-medium text-text-high">Generate {feature.charAt(0).toUpperCase() + feature.slice(1)}</h3>
                <p className="text-text-mid mt-2 max-w-md">Click the button to use AI to generate {feature === 'flashcards' ? 'a set of flashcards' : `a ${feature}`} from the document content.</p>
                <Button onClick={() => handleGenerate(feature)} className="mt-4" disabled={featureLoading || isLoadingContent}>
                    {featureLoading ? <Spinner /> : `Generate ${feature.charAt(0).toUpperCase() + feature.slice(1)}`}
                </Button>
                {isLoadingContent && <p className="text-xs text-text-low mt-2 animate-pulse">Loading file content...</p>}
            </div>
        );

        if (featureLoading) {
            return <div className="flex justify-center items-center min-h-[300px]"><Spinner size="h-10 w-10"/></div>;
        }

        if (!content || (Array.isArray(content) && content.length === 0)) {
            return generateButton;
        }

        switch(feature) {
            case 'summary':
            case 'concepts':
            case 'questions':
            case 'timeline':
                return <div className="prose max-w-none"><MarkdownRenderer content={content as string} /></div>;

            case 'flashcards':
                return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{ (content as FlashcardType[]).map((card: FlashcardType, i: number) => <Flashcard key={i} question={card.question} answer={card.answer} />)}</div>;

            default: return null;
        }
    };

    const tabs: { id: Tab, name: string }[] = [
        { id: 'preview', name: 'Preview' }, { id: 'summary', name: 'Summary' }, { id: 'concepts', name: 'Key Concepts' },
        { id: 'questions', name: 'Study Questions' }, { id: 'flashcards', name: 'Flashcards' }, { id: 'timeline', name: 'Timeline' }, { id: 'chat', name: 'Study Coach' }
    ];
    
    return (
        <div className="flex flex-col h-screen bg-background text-text-high animate-fade-in">
            <header className="p-4 border-b border-border flex items-center justify-between bg-background z-10 shrink-0">
                 <Button variant="ghost" onClick={onBack}>
                    <ChevronLeftIcon size={20} className="mr-2"/>
                    Back to Vault
                 </Button>
                 <div className="flex items-center space-x-2">
                    {/* <Button variant="secondary" onClick={handleExport}><DownloadIcon size={16} className="mr-2"/> Export Notes</Button> */}
                    {profile?.role === Role.Admin && file.visibility !== Visibility.Shared && (
                        <Button onClick={handlePublish}>Publish</Button>
                    )}
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start gap-4">
                                <FileTypeIcon type={file.type} />
                                <div>
                                    <CardTitle className="text-2xl">{file.title}</CardTitle>
                                    <CardDescription className="mt-1">
                                        {formatBytes(file.size)} &middot; Uploaded on {new Date(file.created_at).toLocaleDateString()}
                                        {file.visibility === Visibility.Shared && <span className="ml-2 text-accent">&middot; Shared</span>}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        {file.tags.length > 0 && (
                            <CardContent>
                                <div className="flex flex-wrap gap-2 items-center">
                                    {file.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
                                </div>
                            </CardContent>
                        )}
                    </Card>
                    
                    {error && <p className="text-sm text-error text-center p-3 bg-error/10 rounded-md">{error}</p>}

                    <div className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                        <nav className="flex space-x-6 overflow-x-auto relative">
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`relative whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id ? 'text-primary' : 'text-text-mid hover:text-text-high'}`}>
                                    {tab.name}
                                    {activeTab === tab.id && (
                                        <motion.div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary" layoutId="underline" />
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-6">
                      <AnimatePresence mode="wait">
                        <motion.div key={activeTab} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.2 }}>
                          {activeTab === 'preview' && <FilePreview file={file} fileContent={fileContent} isLoading={isLoadingContent} />}
                          
                          {activeTab === 'summary' && renderContent('summary')}
                          {activeTab === 'concepts' && renderContent('concepts')}
                          {activeTab === 'questions' && renderContent('questions')}
                          {activeTab === 'flashcards' && renderContent('flashcards')}
                          {activeTab === 'timeline' && renderContent('timeline')}
                          
                          {activeTab === 'chat' && (
                              <div className="flex flex-col h-[60vh] bg-surface rounded-lg border border-border">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                      <ChatBubbleIcon size={24} className="text-primary" />
                                      <div>
                                        <CardTitle>Study Coach</CardTitle>
                                        <CardDescription>Ask questions about "{file.title}"</CardDescription>
                                      </div>
                                    </div>
                                </CardHeader>
                                <div ref={chatHistoryContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {(aiContent.chat_history || []).map((msg, index) => (
                                        <ChatMessageBubble key={index} role={msg.role} content={msg.content} />
                                    ))}
                                    {loading.chat && <ChatMessageBubble role="model" content={<Spinner />} />}
                                    {!chat && (
                                        <div className="text-center text-text-mid">
                                            {isLoadingContent ? "Loading file content to start chat..." : "Initializing Study Coach..."}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 border-t border-border mt-auto">
                                   <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                      <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Explain this concept in simpler terms..." disabled={loading.chat || !chat || isLoadingContent} className="flex-grow"/>
                                      <Button type="submit" disabled={loading.chat || !chatInput.trim() || !chat || isLoadingContent}>
                                          {loading.chat ? <Spinner /> : 'Send'}
                                      </Button>
                                  </form>
                                </div>
                              </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default FileDetail;
