import React, { useState, useEffect } from 'react';
import { fetchPastQuestionsForWordBank } from '@/app/service/assessment';
import wordBankData from '@/data/gr8-math-bank.json';


type WordBankItem = {
    topic: string;
    questions: any[];
};

export function WordBankModal({ onClose, onSelectQuestion }: { onClose: () => void, onSelectQuestion: (q: any) => void}) {
    
    const [dynamicBank, setDynamicBank] = useState<WordBankItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Combine JSON data + Database data
    const allBanks: WordBankItem[] = [...wordBankData, ...dynamicBank];
    const [selectedTopic, setSelectedTopic] = useState(allBanks[0]?.topic || "");

   useEffect(() => {
        async function loadPastTests() {
            //  FIX 3: Call the function without any arguments
            const res = await fetchPastQuestionsForWordBank(); 
            if (res.success && res.data) {
                setDynamicBank(res.data);
            }
            setIsLoading(false);
        }
        loadPastTests();
    }, []);

    // Force select the first topic once data loads if none is selected
    useEffect(() => {
        if (allBanks.length > 0 && !selectedTopic) {
            setSelectedTopic(allBanks[0].topic);
        }
    }, [allBanks, selectedTopic]);

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[85vh]">
                
                {/* Header */}
                <div className="bg-[#1A4C8B] px-6 py-5 flex justify-between items-center shrink-0">
                    <h2 className="text-white font-black uppercase text-[15px] tracking-wider">Grade 8 Math Word Bank</h2>
                    <button aria-label='ee' onClick={onClose} className="text-white hover:opacity-70 outline-none">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                
                <div className="flex flex-1 overflow-hidden min-h-[500px]">
                   {/* Sidebar: Topics */}
                    <div className="w-1/3 border-r border-[#D1D8DD] overflow-y-auto bg-[#F4F6F8] p-4 relative">
                        {isLoading && <p className="text-[12px] font-bold text-gray-400 p-2 text-center mb-4">Loading past tests...</p>}
                        
                        {/* --- 1. PRESET JSON TOPICS --- */}
                        <div className="mb-2">
                            <h4 className="text-[11px] font-black text-[#888] uppercase tracking-wider mb-3 px-1">Preset Topics</h4>
                            {wordBankData.map((topicGroup: WordBankItem) => (
                                <button 
                                    key={topicGroup.topic} 
                                    onClick={() => setSelectedTopic(topicGroup.topic)} 
                                    className={`w-full text-left p-3 rounded-lg font-bold text-[14px] mb-2 transition-all outline-none ${selectedTopic === topicGroup.topic ? 'bg-[#1A4C8B] text-white shadow-md' : 'text-[#222] hover:bg-[#E2E7E9]'}`}
                                >
                                    {topicGroup.topic}
                                </button>
                            ))}
                        </div>

                        {/* --- 2. DIVIDER & PAST ASSESSMENTS --- */}
                        {dynamicBank.length > 0 && (
                            <div className="mt-6">
                                <div className="h-[2px] bg-[#D1D8DD] w-full mb-6 rounded-full"></div>
                                <h4 className="text-[11px] font-black text-[#888] uppercase tracking-wider mb-3 px-1">Past Assessments</h4>
                                {dynamicBank.map((topicGroup: WordBankItem) => (
                                    <button 
                                        key={topicGroup.topic} 
                                        onClick={() => setSelectedTopic(topicGroup.topic)} 
                                        className={`w-full text-left p-3 rounded-lg font-bold text-[14px] mb-2 transition-all outline-none ${selectedTopic === topicGroup.topic ? 'bg-[#1A4C8B] text-white shadow-md' : 'text-[#222] hover:bg-[#E2E7E9]'}`}
                                    >
                                        {topicGroup.topic}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Main: Questions */}
                    <div className="w-2/3 overflow-y-auto p-6 flex flex-col gap-4 bg-white">
                        <h3 className="font-black text-[18px] text-[#1E4B95] mb-2">{selectedTopic}</h3>
                        
                        
                        {allBanks.find(t => t.topic === selectedTopic)?.questions.map((q: any, idx: number) => (
                            <div key={idx} className="border-2 border-[#D1D8DD] p-5 rounded-xl hover:border-[#EFBD31] transition-colors relative group">
                                <span className="absolute top-3 right-3 bg-[#F4EFED] text-[#1E4B95] px-3 py-1 rounded text-[10px] font-black uppercase">{q.type}</span>
                                <p className="font-bold text-[#222] text-[15px] pr-24 mb-4 mt-2">{q.question}</p>
                                
                                <button onClick={() => onSelectQuestion(q)} className="bg-[#1A4C8B]/10 text-[#1A4C8B] font-black py-2.5 px-4 rounded-lg text-[13px] w-full hover:bg-[#1A4C8B] hover:text-white transition-all outline-none">
                                    + Add to Assessment
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}