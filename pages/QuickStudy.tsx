

import React, { useState, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SparklesIcon } from '../components/layout/icons/Icons';
import Spinner from '../components/ui/Spinner';
import MarkdownRenderer from '../components/ui/MarkdownRenderer';
import Skeleton from '../components/ui/Skeleton';
import Flashcard from '../components/ai/Flashcard';
import { Flashcard as FlashcardType } from '../types';

type AITool = 'summary' | 'concepts' | 'flashcards';

const QuickStudy: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [activeTool, setActiveTool] = useState<AITool | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string | FlashcardType[] | null>(null);

    const ai = useMemo(() => {
        if (!process.env.API_KEY) {
            setError("Error: API_KEY is not configured. AI features are disabled.");
            return null;
        }
        setError(null);
        return new GoogleGenAI({ apiKey: process.env.API_KEY });
    }, []);

    const handleGenerate = async (tool: AITool) => {
        if (!ai || !inputText.trim()) {
            setError("Please enter some text to analyze.");
            return;
        }

        setActiveTool(tool);
        setLoading(true);
        setResult(null);
        setError(null);

        let prompt = '';
        let schema;

        switch (tool) {
            case 'summary':
                prompt = `Provide a concise summary of the following text:\n\n---\n${inputText}\n---`;
                break;
            case 'concepts':
                prompt = `Extract the key concepts, terms, and people from the following text. Present them in a markdown bulleted list:\n\n---\n${inputText}\n---`;
                break;
            case 'flashcards':
                prompt = `Based on the following text, create 5 flashcards with a 'question' and 'answer'.:\n\n---\n${inputText}\n---`;
                schema = { type: Type.OBJECT, properties: { flashcards: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, answer: { type: Type.STRING }}, required: ['question', 'answer']}}} };
                break;
        }

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                ...(schema && { config: { responseMimeType: 'application/json', responseSchema: schema } }),
            });
            const text = response.text;
            
            if (tool === 'flashcards') {
                const parsed = JSON.parse(text);
                setResult(parsed.flashcards);
            } else {
                setResult(text);
            }
        } catch (e: any) {
            console.error(e);
            setError(`An error occurred while generating the ${tool}. ${e.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    const renderResult = () => {
        if (!activeTool) return null;
        
        if (loading) {
            if (activeTool === 'flashcards') {
                 return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Skeleton className="h-48 w-full"/><Skeleton className="h-48 w-full"/></div>;
            }
            return <div className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-11/12" /><Skeleton className="h-4 w-4/5" /></div>;
        }
        
        if (!result) return null;
        
        if (activeTool === 'flashcards' && Array.isArray(result)) {
            return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{result.map((card, i) => <Flashcard key={i} question={card.question} answer={card.answer} />)}</div>
        }
        
        if (typeof result === 'string') {
            return <div className="prose max-w-none"><MarkdownRenderer content={result} /></div>
        }

        return null;
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <SparklesIcon size={48} className="text-primary mx-auto"/>
                <h1 className="text-3xl font-bold text-text-high mt-2">Quick Study Tool</h1>
                <p className="text-text-mid mt-1 max-w-2xl mx-auto">
                    Welcome, Guest! Paste any text below and use our AI tools to instantly understand it better.
                    No account required.
                </p>
            </div>
            
            <Card>
                <CardContent className="p-6">
                    <textarea 
                        className="w-full h-48 p-4 bg-surface border border-border rounded-lg text-text-mid focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="Paste your lecture notes, an article snippet, or any text here..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                    <div className="mt-4 flex flex-wrap justify-center gap-4">
                        <Button onClick={() => handleGenerate('summary')} disabled={loading || !inputText.trim()}>
                            {loading && activeTool === 'summary' ? <Spinner/> : 'Summarize'}
                        </Button>
                         <Button onClick={() => handleGenerate('concepts')} disabled={loading || !inputText.trim()}>
                            {loading && activeTool === 'concepts' ? <Spinner/> : 'Key Concepts'}
                        </Button>
                         <Button onClick={() => handleGenerate('flashcards')} disabled={loading || !inputText.trim()}>
                            {loading && activeTool === 'flashcards' ? <Spinner/> : 'Make Flashcards'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {error && <p className="text-sm text-error text-center p-3 bg-error/10 rounded-md">{error}</p>}
            
            {(loading || result) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="capitalize">{activeTool}</CardTitle>
                        <CardDescription>AI-generated result based on your text.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {renderResult()}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default QuickStudy;
