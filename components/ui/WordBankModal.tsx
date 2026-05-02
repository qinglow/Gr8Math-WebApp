import React, { useState, useEffect } from 'react';
import { fetchPastQuestionsForWordBank } from '@/app/service/assessment';
import wordBankData from '@/data/gr8-math-bank.json';

type WordBankItem = {
    topic: string;
    questions?: any[];
};

export function WordBankModal({ onClose, onSelectQuestion }: { onClose: () => void, onSelectQuestion: (q: any) => void }) {

    const [dynamicBank, setDynamicBank] = useState<WordBankItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const allBanks: WordBankItem[] = [...(wordBankData as WordBankItem[]), ...dynamicBank];
    const [selectedTopic, setSelectedTopic] = useState(allBanks[0]?.topic || "");

    useEffect(() => {
        async function loadPastTests() {
            const res = await fetchPastQuestionsForWordBank();
            if (res.success && res.data) {
                setDynamicBank(res.data);
            }
            setIsLoading(false);
        }
        loadPastTests();
    }, []);

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
                    <button aria-label='Close' onClick={onClose} className="text-white hover:opacity-70 outline-none">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden min-h-[500px]">
                    {/* Sidebar: Topics */}
                    <div className="w-1/3 border-r border-[#D1D8DD] overflow-y-auto bg-[#F4F6F8] p-4 relative">
                        {isLoading && <p className="text-[12px] font-bold text-gray-400 p-2 text-center mb-4">Loading data...</p>}

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
                        <div className="mt-6">
                            <div className="h-[2px] bg-[#D1D8DD] w-full mb-6 rounded-full opacity-50"></div>
                            <h4 className="text-[11px] font-black text-[#888] uppercase tracking-wider mb-3 px-1">Past Assessments</h4>

                            {!isLoading && (
                                dynamicBank.length > 0 ? (
                                    dynamicBank.map((topicGroup: WordBankItem) => (
                                        <button
                                            key={topicGroup.topic}
                                            onClick={() => setSelectedTopic(topicGroup.topic)}
                                            className={`w-full text-left p-3 rounded-lg font-bold text-[14px] mb-2 transition-all outline-none ${selectedTopic === topicGroup.topic ? 'bg-[#1A4C8B] text-white shadow-md' : 'text-[#222] hover:bg-[#E2E7E9]'}`}
                                        >
                                            {topicGroup.topic}
                                        </button>
                                    ))
                                ) : (
                                    /* SIDEBAR EMPTY STATE */
                                    <div className="px-2 py-4 bg-black/5 rounded-xl border border-dashed border-[#D1D8DD]">
                                        <p className="text-[11px] font-bold text-[#888] text-center leading-relaxed">No topics available</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="w-2/3 overflow-y-auto p-6 flex flex-col gap-4 bg-white">
                        <h3 className="font-black text-[18px] text-[#1E4B95] mb-2">{selectedTopic || "Select a Topic"}</h3>

                        {(() => {
                            const currentTopicData = allBanks.find(t => t.topic === selectedTopic);
                            const questions = currentTopicData?.questions || [];

                            if (questions.length === 0 && !isLoading) {
                                return (
                                    /* MAIN CONTENT EMPTY STATE */
                                    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-[#D1D8DD] rounded-2xl bg-[#F4F6F8] animate-in fade-in zoom-in-95 duration-300">
                                        <div className="bg-[#D1D8DD] p-4 rounded-full mb-4">
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                            </svg>
                                        </div>
                                        <h4 className="text-[16px] font-black text-[#222] uppercase tracking-tight">No questions found.</h4>
                                        <p className="text-[13px] text-[#666] max-w-[280px] mx-auto mt-2 leading-relaxed">
                                            This topic currently has no recorded questions. Try selecting another topic or creating a new question manually.
                                        </p>
                                    </div>
                                );
                            }

                            return questions.map((q: any, idx: number) => (
                                <div key={idx} className="border-2 border-[#D1D8DD] p-5 rounded-xl hover:border-[#EFBD31] transition-colors relative group">
                                    <span className="absolute top-3 right-3 bg-[#F4EFED] text-[#1E4B95] px-3 py-1 rounded text-[10px] font-black uppercase">{q.type}</span>
                                    <p className="font-bold text-[#222] text-[15px] pr-24 mb-4 mt-2">{q.question}</p>

                                    <button onClick={() => onSelectQuestion(q)} className="bg-[#1A4C8B]/10 text-[#1A4C8B] font-black py-2.5 px-4 rounded-lg text-[13px] w-full hover:bg-[#1A4C8B] hover:text-white transition-all outline-none">
                                        + Add to Assessment
                                    </button>
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}