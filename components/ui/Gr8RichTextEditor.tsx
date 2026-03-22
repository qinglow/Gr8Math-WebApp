'use client';

import React, { useState, useEffect, useRef } from 'react';

// --- GOOGLE DOCS STYLE COLOR PALETTE ---
const colorPalette = [
    ['#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff'],
    ['#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff'],
    ['#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc'],
    ['#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd'],
    ['#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0'],
    ['#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79'],
    ['#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47'],
    ['#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130']
];

type CopiedFormatType = {
    bold: boolean; italic: boolean; underline: boolean; strikeThrough: boolean;
    foreColor: string; hiliteColor: string; fontSize: string;
    justifyLeft: boolean; justifyCenter: boolean; justifyRight: boolean; justifyFull: boolean;
} | null;

interface Gr8RichTextEditorProps {
    initialContent: string;
    onChange: (content: string) => void;
    onSave: () => void;
    onBack: () => void;
    isEditing: boolean;
}

export function Gr8RichTextEditor({ initialContent, onChange, onSave, onBack, isEditing }: Gr8RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const colorMenuRef = useRef<HTMLDivElement>(null);

    const [currentFontSize, setCurrentFontSize] = useState(12);
    const [fontSizeInputValue, setFontSizeInputValue] = useState('12');
    const [showTextColorPicker, setShowTextColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const [copiedFormat, setCopiedFormat] = useState<CopiedFormatType>(null);

    const [activeFormats, setActiveFormats] = useState({
        bold: false, italic: false, underline: false, strikeThrough: false,
        justifyLeft: false, justifyCenter: false, justifyRight: false, justifyFull: false,
        insertOrderedList: false, insertUnorderedList: false, formatBlock: '',
    });

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.innerHTML = initialContent || '';
            document.execCommand('defaultParagraphSeparator', false, 'p');
            checkFormats();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (colorMenuRef.current && !colorMenuRef.current.contains(event.target as Node)) {
                setShowTextColorPicker(false);
                setShowHighlightPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const checkFormats = () => {
        if (!editorRef.current) return;
        setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            strikeThrough: document.queryCommandState('strikeThrough'),
            justifyLeft: document.queryCommandState('justifyLeft'),
            justifyCenter: document.queryCommandState('justifyCenter'),
            justifyRight: document.queryCommandState('justifyRight'),
            justifyFull: document.queryCommandState('justifyFull'),
            insertOrderedList: document.queryCommandState('insertOrderedList'),
            insertUnorderedList: document.queryCommandState('insertUnorderedList'),
            formatBlock: document.queryCommandValue('formatBlock') || '',
        });

        const fontSize = document.queryCommandValue('fontSize');
        if (fontSize) {
            setCurrentFontSize(parseInt(fontSize));
            setFontSizeInputValue(fontSize);
        } else {
            setCurrentFontSize(12);
            setFontSizeInputValue('12');
        }
    };

    const handleEditorInput = () => {
        if (editorRef.current) onChange(editorRef.current.innerHTML);
        checkFormats();
    };

    const execCmd = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            editorRef.current.focus();
            onChange(editorRef.current.innerHTML);
            checkFormats();
        }
    };

    const handlePaintFormatClick = () => {
        if (copiedFormat) setCopiedFormat(null);
        else {
            setCopiedFormat({
                bold: document.queryCommandState('bold'), italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline'), strikeThrough: document.queryCommandState('strikeThrough'),
                foreColor: document.queryCommandValue('foreColor'), hiliteColor: document.queryCommandValue('hiliteColor'),
                fontSize: document.queryCommandValue('fontSize'), justifyLeft: document.queryCommandState('justifyLeft'),
                justifyCenter: document.queryCommandState('justifyCenter'), justifyRight: document.queryCommandState('justifyRight'),
                justifyFull: document.queryCommandState('justifyFull'),
            });
        }
    };

    const handleEditorMouseUp = () => {
        checkFormats();
        if (copiedFormat) {
            const selection = window.getSelection();
            if (selection && !selection.isCollapsed) {
                if (copiedFormat.bold !== document.queryCommandState('bold')) execCmd('bold');
                if (copiedFormat.italic !== document.queryCommandState('italic')) execCmd('italic');
                if (copiedFormat.underline !== document.queryCommandState('underline')) execCmd('underline');
                if (copiedFormat.strikeThrough !== document.queryCommandState('strikeThrough')) execCmd('strikeThrough');
                if (copiedFormat.foreColor) execCmd('foreColor', copiedFormat.foreColor);
                if (copiedFormat.hiliteColor && copiedFormat.hiliteColor !== 'transparent') execCmd('hiliteColor', copiedFormat.hiliteColor);
                if (copiedFormat.fontSize) execCmd('fontSize', copiedFormat.fontSize);
                if (copiedFormat.justifyLeft) execCmd('justifyLeft');
                if (copiedFormat.justifyCenter) execCmd('justifyCenter');
                if (copiedFormat.justifyRight) execCmd('justifyRight');
                if (copiedFormat.justifyFull) execCmd('justifyFull');
                setCopiedFormat(null);
                checkFormats();
            }
        }
    };

    const toggleHeading = (headingTag: string) => {
        const currentBlock = document.queryCommandValue('formatBlock');
        if (currentBlock && currentBlock.toLowerCase() === headingTag.toLowerCase()) execCmd('formatBlock', 'P');
        else execCmd('formatBlock', headingTag);
    };

    const handleFontSizeChange = (direction: 'up' | 'down') => {
        let newSize = currentFontSize;
        if (direction === 'up') newSize++;
        if (direction === 'down' && newSize > 1) newSize--;
        applyFontSize(newSize);
    };

    const handleFontSizeInputBlur = () => {
        const newSize = parseInt(fontSizeInputValue);
        if (!isNaN(newSize) && newSize > 0) applyFontSize(newSize);
        else setFontSizeInputValue(currentFontSize.toString());
    };

    const applyFontSize = (size: number) => {
        setCurrentFontSize(size);
        setFontSizeInputValue(size.toString());
        execCmd('fontSize', size.toString());
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
        handleEditorInput();
    };

    const isSaveDisabled = !editorRef.current?.innerHTML.replace(/<[^>]*>/g, '').trim();

    return (
        <>
            <div className="p-4 md:p-8 lg:p-12 pb-2 md:pb-4 flex items-center w-full max-w-6xl mx-auto shrink-0">
                <button onClick={onBack} className="flex items-center gap-x-3 group cursor-pointer outline-none">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                    <h1 className="text-[20px] md:text-[26px] font-black text-[#222] m-0 group-hover:text-[#0A7F93] transition-colors">
                        {isEditing ? 'Edit Lesson' : 'Lesson Content'}
                    </h1>
                </button>
            </div>

            <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 md:px-8 lg:px-12 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                
                <div className="sticky top-0 bg-[#F4F6F8] border border-[#D1D8DD] border-b-0 rounded-t-xl p-3 md:p-4 flex flex-wrap items-center gap-y-3 gap-x-2 shadow-md z-50 shrink-0 text-[#666]">
                    <div className="flex items-center gap-x-0.5 border-r border-[#D1D8DD] pr-2">
                        <button onClick={() => execCmd('undo')} className="p-2 rounded outline-none transition-colors hover:bg-[#EBB637]/20 hover:text-[#EBB637]" title="Undo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg></button>
                        <button onClick={() => execCmd('redo')} className="p-2 rounded outline-none transition-colors hover:bg-[#EBB637]/20 hover:text-[#EBB637]" title="Redo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path></svg></button>
                    </div>

                    <div ref={colorMenuRef} className="relative flex items-center gap-x-0.5 border-r border-[#D1D8DD] pr-2">
                        <button onClick={() => { setShowTextColorPicker(!showTextColorPicker); setShowHighlightPicker(false); }} className={`flex items-center gap-x-0.5 p-2 rounded outline-none transition-colors ${showTextColorPicker ? 'bg-[#EBB637]/20 text-[#EBB637]' : 'hover:bg-[#EBB637]/20 hover:text-[#EBB637]'}`} title="Text Color">
                            <span className="border-b-[3px] border-current leading-none font-serif text-[16px] font-bold pb-0.5">A</span>
                        </button>
                        {showTextColorPicker && (
                            <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-[100] w-[240px] animate-in zoom-in-95 duration-100">
                                <div className="grid grid-cols-8 gap-1">
                                    {colorPalette.flat().map((color, i) => (
                                        <button key={i} onMouseDown={(e) => { e.preventDefault(); execCmd('foreColor', color); setShowTextColorPicker(false); }} className="w-5 h-5 rounded-sm border border-gray-200 hover:scale-125 transition-transform" style={{ backgroundColor: color }} />
                                    ))}
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Custom</span>
                                    <label className="relative cursor-pointer hover:bg-gray-100 p-1.5 rounded-full transition-colors flex items-center justify-center">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                                        <input type="color" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" onChange={(e) => { execCmd('foreColor', e.target.value); setShowTextColorPicker(false); }} />
                                    </label>
                                </div>
                            </div>
                        )}

                        <button onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowTextColorPicker(false); }} className={`flex items-center gap-x-0.5 p-2 rounded outline-none transition-colors ${showHighlightPicker ? 'bg-[#EBB637]/20 text-[#EBB637]' : 'hover:bg-[#EBB637]/20 hover:text-[#EBB637]'}`} title="Highlight Color">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11-6 6v3h9l3-3"></path><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"></path></svg>
                        </button>
                        {showHighlightPicker && (
                            <div className="absolute top-full left-10 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-[100] w-[240px] animate-in zoom-in-95 duration-100">
                                <button onMouseDown={(e) => { e.preventDefault(); execCmd('hiliteColor', 'transparent'); setShowHighlightPicker(false); }} className="w-full text-left text-[12px] font-medium py-1.5 px-2 rounded hover:bg-gray-100 mb-2 border border-gray-200 flex items-center gap-x-2">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2l20 20"></path><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"></path><path d="M13.59 13.59a2 2 0 1 0 2.83 2.83"></path></svg>
                                    None
                                </button>
                                <div className="grid grid-cols-8 gap-1">
                                    {colorPalette.flat().map((color, i) => (
                                        <button key={i} onMouseDown={(e) => { e.preventDefault(); execCmd('hiliteColor', color); setShowHighlightPicker(false); }} className="w-5 h-5 rounded-sm border border-gray-200 hover:scale-125 transition-transform" style={{ backgroundColor: color }} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center border-r border-[#D1D8DD] pr-2">
                        <button onClick={handlePaintFormatClick} className={`p-2 rounded outline-none transition-colors ${copiedFormat ? 'bg-[#EBB637]/20 text-[#EBB637]' : 'hover:bg-[#EBB637]/20 hover:text-[#EBB637]'}`} title="Paint Format">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="6" x="2" y="2" rx="2"></rect><path d="M10 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V7"></path><rect width="4" height="6" x="8" y="16" rx="1"></rect></svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-x-0.5 border-r border-[#D1D8DD] pr-2">
                        <button onClick={() => execCmd('bold')} className={`p-2 rounded outline-none transition-colors ${activeFormats.bold ? 'bg-[#EBB637]/20 text-[#EBB637]' : 'hover:bg-[#EBB637]/20 hover:text-[#EBB637]'}`} title="Bold">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>
                        </button>
                        <button onClick={() => execCmd('italic')} className={`p-2 rounded outline-none transition-colors ${activeFormats.italic ? 'bg-[#EBB637]/20 text-[#EBB637]' : 'hover:bg-[#EBB637]/20 hover:text-[#EBB637]'}`} title="Italic">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>
                        </button>
                        <button onClick={() => execCmd('underline')} className={`p-2 rounded outline-none transition-colors ${activeFormats.underline ? 'bg-[#EBB637]/20 text-[#EBB637]' : 'hover:bg-[#EBB637]/20 hover:text-[#EBB637]'}`} title="Underline">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4v6a6 6 0 0 0 12 0V4"></path><line x1="4" y1="20" x2="20" y2="20"></line></svg>
                        </button>
                        <button onClick={() => execCmd('strikeThrough')} className={`p-2 rounded outline-none transition-colors ${activeFormats.strikeThrough ? 'bg-[#EBB637]/20 text-[#EBB637]' : 'hover:bg-[#EBB637]/20 hover:text-[#EBB637]'}`} title="Strikethrough">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4H9a3 3 0 0 0-2.83 4"></path><path d="M14 12a4 4 0 0 1 0 8H6"></path><line x1="4" y1="12" x2="20" y2="12"></line></svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-x-0.5 border-r border-[#D1D8DD] pr-2">
                        <div className="flex items-center border border-[#D1D8DD] rounded bg-white shadow-sm overflow-hidden text-black h-8 mx-1">
                            <button onClick={() => handleFontSizeChange('down')} className="px-2 h-full hover:bg-gray-100 outline-none transition-colors">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                            <input 
                                type="text" 
                                value={fontSizeInputValue} 
                                onChange={(e) => setFontSizeInputValue(e.target.value)}
                                onBlur={handleFontSizeInputBlur}
                                onKeyDown={(e) => e.key === 'Enter' && handleFontSizeInputBlur()}
                                className="w-8 h-full text-center text-[13px] font-medium bg-transparent !text-[#222] border-x border-[#D1D8DD] outline-none m-0 p-0 focus:bg-white"
                            />
                            <button onClick={() => handleFontSizeChange('up')} className="px-2 h-full hover:bg-gray-100 outline-none transition-colors">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-x-0.5 border-r border-[#D1D8DD] pr-2">
                        <button onClick={() => execCmd('justifyLeft')} className={`p-2 rounded outline-none transition-colors ${activeFormats.justifyLeft ? 'bg-[#EBB637]/20 text-[#EBB637]' : 'hover:bg-[#EBB637]/20 hover:text-[#EBB637]'}`} title="Left Align"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="15" y1="12" x2="3" y2="12"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg></button>
                        <button onClick={() => execCmd('justifyCenter')} className={`p-2 rounded outline-none transition-colors ${activeFormats.justifyCenter ? 'bg-[#EBB637]/20 text-[#EBB637]' : 'hover:bg-[#EBB637]/20 hover:text-[#EBB637]'}`} title="Center Align"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="6"></line><line x1="21" y1="12" x2="3" y2="12"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg></button>
                        <button onClick={() => execCmd('justifyRight')} className={`p-2 rounded outline-none transition-colors ${activeFormats.justifyRight ? 'bg-[#EBB637]/20 text-[#EBB637]' : 'hover:bg-[#EBB637]/20 hover:text-[#EBB637]'}`} title="Right Align"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="12" x2="9" y2="12"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg></button>
                        <button onClick={() => execCmd('justifyFull')} className={`p-2 rounded outline-none transition-colors ${activeFormats.justifyFull ? 'bg-[#EBB637]/20 text-[#EBB637]' : 'hover:bg-[#EBB637]/20 hover:text-[#EBB637]'}`} title="Justify"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
                    </div>

                    <div className="flex items-center gap-x-1 border-r border-[#D1D8DD] pr-2 font-bold text-[14px] text-[#888]">
                        <button onClick={() => toggleHeading('H1')} className={`px-2 py-1.5 rounded outline-none transition-colors ${activeFormats.formatBlock.match(/h1/i) ? 'bg-[#EBB637]/20 text-[#EBB637]' : 'hover:bg-[#EBB637]/20 hover:text-[#EBB637]'}`}>H1</button>
                        <button onClick={() => toggleHeading('H2')} className={`px-2 py-1.5 rounded outline-none transition-colors ${activeFormats.formatBlock.match(/h2/i) ? 'bg-[#EBB637]/20 text-[#EBB637]' : 'hover:bg-[#EBB637]/20 hover:text-[#EBB637]'}`}>H2</button>
                        <button onClick={() => toggleHeading('H3')} className={`px-2 py-1.5 rounded outline-none transition-colors ${activeFormats.formatBlock.match(/h3/i) ? 'bg-[#EBB637]/20 text-[#EBB637]' : 'hover:bg-[#EBB637]/20 hover:text-[#EBB637]'}`}>H3</button>
                        <button onClick={() => toggleHeading('H4')} className={`px-2 py-1.5 rounded outline-none transition-colors ${activeFormats.formatBlock.match(/h4/i) ? 'bg-[#EBB637]/20 text-[#EBB637]' : 'hover:bg-[#EBB637]/20 hover:text-[#EBB637]'}`}>H4</button>
                        <button onClick={() => toggleHeading('H5')} className={`px-2 py-1.5 rounded outline-none transition-colors ${activeFormats.formatBlock.match(/h5/i) ? 'bg-[#EBB637]/20 text-[#EBB637]' : 'hover:bg-[#EBB637]/20 hover:text-[#EBB637]'}`}>H5</button>
                    </div>

                    <div className="flex items-center gap-x-0.5 border-r border-[#D1D8DD] pr-2">
                        <button onClick={() => execCmd('insertOrderedList')} className={`p-2 rounded outline-none transition-colors ${activeFormats.insertOrderedList ? 'bg-[#EBB637]/20 text-[#EBB637]' : 'hover:bg-[#EBB637]/20 hover:text-[#EBB637]'}`} title="Numbered List"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg></button>
                        <button onClick={() => execCmd('insertUnorderedList')} className={`p-2 rounded outline-none transition-colors ${activeFormats.insertUnorderedList ? 'bg-[#EBB637]/20 text-[#EBB637]' : 'hover:bg-[#EBB637]/20 hover:text-[#EBB637]'}`} title="Bulleted List"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg></button>
                        <button onClick={() => execCmd('outdent')} className="p-2 rounded outline-none hover:bg-[#EBB637]/20 hover:text-[#EBB637] transition-colors" title="Decrease Indent"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7"></polyline><line x1="18" y1="18" x2="18" y2="6"></line><line x1="6" y1="12" x2="18" y2="12"></line></svg></button>
                        <button onClick={() => execCmd('indent')} className="p-2 rounded outline-none hover:bg-[#EBB637]/20 hover:text-[#EBB637] transition-colors" title="Increase Indent"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"></polyline><line x1="6" y1="18" x2="6" y2="6"></line><line x1="6" y1="12" x2="18" y2="12"></line></svg></button>
                    </div>
                    
                    <div className="flex items-center">
                        <button className="flex items-center gap-x-2 text-[13px] font-bold text-[#0A7F93] hover:text-[#EBB637] transition-colors outline-none px-2 py-1.5 rounded hover:bg-[#EBB637]/10">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            Add Media
                        </button>
                    </div>
                </div>

                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleEditorInput}
                    onPaste={handlePaste} 
                    onMouseUp={handleEditorMouseUp} 
                    onKeyUp={checkFormats}     
                    onClick={checkFormats}     
                    className="w-full bg-white border border-[#D1D8DD] rounded-b-xl p-8 md:p-12 text-[16px] text-black font-medium leading-relaxed outline-none transition-all focus:border-[#EBB637] focus:ring-4 focus:ring-[#EBB637]/20 shadow-sm min-h-[500px]
                        [&_p]:mb-4
                        [&_h1]:text-4xl [&_h1]:font-black [&_h1]:text-[#222] [&_h1]:mb-4
                        [&_h2]:text-3xl [&_h2]:font-extrabold [&_h2]:text-[#222] [&_h2]:mb-3
                        [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-[#222] [&_h3]:mb-3
                        [&_h4]:text-xl [&_h4]:font-bold [&_h4]:text-[#222] [&_h4]:mb-2
                        [&_h5]:text-lg [&_h5]:font-bold [&_h5]:text-[#222] [&_h5]:mb-2
                        [&_ul]:list-disc [&_ul]:ml-8 [&_ul]:mb-4
                        [&_ol]:list-decimal [&_ol]:ml-8 [&_ol]:mb-4
                        [&_li]:pl-2 [&_li]:mb-1
                        [&_b]:font-bold [&_i]:italic [&_u]:underline [&_strike]:line-through
                    "
                />

                <div className="flex justify-center mt-10 shrink-0">
                    <button
                        onClick={onSave}
                        disabled={isSaveDisabled}
                        className={`w-full md:w-auto md:px-32 py-4 rounded-xl font-black text-[15px] uppercase tracking-wide transition-all shadow-md outline-none
                            ${!isSaveDisabled ? 'bg-[#0A7F93] text-white hover:bg-[#086a7a] hover:shadow-lg hover:-translate-y-1' : 'bg-[#D1D8DD] text-gray-400 cursor-not-allowed shadow-none'}
                        `}
                    >
                        {isEditing ? 'Update' : 'Save'}
                    </button>
                </div>
            </div>
        </>
    );
}