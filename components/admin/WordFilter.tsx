// components/admin/WordFilter.tsx
import React, { useState, useRef, KeyboardEvent } from 'react';

interface WordFilterProps {
    initialWords?: string[];
    onSaveWords: (words: string[]) => Promise<void>; // Expects a promise so it can show a loading state
}

export function WordFilter({ initialWords = [], onSaveWords }: WordFilterProps) {
    const [words, setWords] = useState<string[]>(initialWords);
    const [inputValue, setInputValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
            e.preventDefault();
            addWord();
        }
        if (e.key === 'Backspace' && inputValue === '' && words.length > 0) {
            setWords(words.slice(0, -1));
        }
    };

    const addWord = () => {
        const newWord = inputValue.trim().replace(/^@/, '');
        if (newWord && !words.includes(newWord)) {
            setWords([...words, newWord]);
        }
        setInputValue('');
    };

    const removeWord = (wordToRemove: string) => {
        setWords(words.filter(w => w !== wordToRemove));
    };

    const handleSave = async () => {
        // Add pending word if any
        let finalWords = [...words];
        const pendingWord = inputValue.trim().replace(/^@/, '');
        if (pendingWord && !words.includes(pendingWord)) {
            finalWords.push(pendingWord);
            setWords(finalWords);
            setInputValue('');
        }

        if (finalWords.length === 0) return;

        setIsSaving(true);
        try {
            await onSaveWords(finalWords); // Call the parent's save function
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-[#F4F6F8] border border-[#B0B8C1] rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-[22px] font-black text-[#222] mb-4">Word Filter</h2>
            <p className="text-[13px] text-[#444] font-medium leading-relaxed mb-6 text-justify">
                This database contains terms identified as derogatory, disrespectful, or profane. To maintain a safe and focused learning environment, any student posts matching these entries will be automatically flagged for moderator review before appearing in the public feed.
            </p>
            
            <label className="block text-[14px] font-bold text-[#222] mb-2">Add words</label>
            
            <div 
                className="bg-transparent border border-[#B0B8C1] rounded-lg min-h-[100px] p-3 flex flex-wrap gap-2 items-start content-start mb-6 shadow-sm focus-within:ring-1 focus-within:ring-[#EFBD31] focus-within:border-[#EFBD31] transition-all cursor-text"
                onClick={() => inputRef.current?.focus()}
            >
                {words.map((word, index) => (
                    <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D1D8DD] rounded-full text-[13px] font-semibold text-[#222]">
                        {word}
                        <button onClick={(e) => { e.stopPropagation(); removeWord(word); }} className="text-[#888] hover:text-[#ED1F24] outline-none ml-1 cursor-pointer">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </span>
                ))}
                <input 
                    ref={inputRef}
                    type="text" 
                    placeholder={words.length === 0 ? "ex. @word" : ""}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => { if (inputValue.trim()) addWord(); }}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-[13px] font-medium text-[#222] placeholder:text-[#A0A0A0] py-1.5"
                />
            </div>

            <div className="flex justify-end">
                <button 
                    onClick={handleSave}
                    disabled={isSaving || (words.length === 0 && inputValue.trim() === '')}
                    className="bg-[#1A4C8B] text-white px-8 py-2.5 rounded-lg font-bold text-[13px] hover:bg-[#153a6b] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed outline-none"
                >
                    {isSaving ? 'Saving...' : 'Add Word'}
                </button>
            </div>
        </div>
    );
}