'use client';

import React, { useState, useRef, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Gr8MathHeader } from '@/components/ui/Gr8MathHeader';
import { fetchSingleBlackboardAction, saveBlackboardDataAction, uploadBlackboardToTigrisAction } from '@/app/(teacher)/virtual-blackboard/action';
import { Gr8LoadingOverlay } from '@/components/ui/Gr8LoadingOverlay';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// --- HELPER TO GET XY COORDINATES FOR BOTH MOUSE AND TOUCH ---
const getClientXY = (e: any) => {
    if (e.touches && e.touches.length > 0) {
        return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    } else if (e.changedTouches && e.changedTouches.length > 0) {
        return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
};

// --- PIXEL CORNER DECORATIONS ---
const BottomLeftPixels = () => (
    <div className="absolute bottom-0 left-0 flex flex-col items-start pointer-events-none z-20">
        <div className="flex"><div className="w-6 h-6 bg-[#E91D26]"></div></div>
        <div className="flex"><div className="w-6 h-6 bg-[#EFBD31]"></div><div className="w-6 h-6 bg-transparent"></div><div className="w-6 h-6 bg-[#1E4B95]"></div></div>
        <div className="flex"><div className="w-6 h-6 bg-[#1E4B95]"></div><div className="w-6 h-6 bg-[#E91D26]"></div></div>
        <div className="flex"><div className="w-6 h-6 bg-[#E91D26]"></div><div className="w-6 h-6 bg-[#EFBD31]"></div><div className="w-6 h-6 bg-[#E91D26]"></div></div>
        <div className="flex"><div className="w-6 h-6 bg-[#1E4B95]"></div><div className="w-6 h-6 bg-transparent"></div><div className="w-6 h-6 bg-[#EFBD31]"></div><div className="w-6 h-6 bg-[#1E4B95]"></div><div className="w-6 h-6 bg-[#E91D26]"></div></div>
    </div>
);

const TopRightPixels = () => (
    <div className="absolute top-0 right-0 flex flex-col items-end pointer-events-none z-20">
        <div className="flex"><div className="w-6 h-6 bg-[#E91D26]"></div><div className="w-6 h-6 bg-[#1E4B95]"></div><div className="w-6 h-6 bg-[#E91D26]"></div><div className="w-6 h-6 bg-[#1E4B95]"></div><div className="w-6 h-6 bg-[#EFBD31]"></div></div>
        <div className="flex"><div className="w-6 h-6 bg-[#EFBD31]"></div><div className="w-6 h-6 bg-transparent"></div><div className="w-6 h-6 bg-[#E91D26]"></div><div className="w-6 h-6 bg-[#1E4B95]"></div></div>
        <div className="flex"><div className="w-6 h-6 bg-[#EFBD31]"></div><div className="w-6 h-6 bg-[#1E4B95]"></div><div className="w-6 h-6 bg-[#EFBD31]"></div></div>
        <div className="flex"><div className="w-6 h-6 bg-[#1E4B95]"></div><div className="w-6 h-6 bg-transparent"></div><div className="w-6 h-6 bg-[#1E4B95]"></div><div className="w-6 h-6 bg-[#E91D26]"></div></div>
        <div className="flex"><div className="w-6 h-6 bg-[#E91D26]"></div></div>
    </div>
);

// --- COLOR MATH UTILITIES ---
function hsvToRgb(h: number, s: number, v: number) {
    s /= 100; v /= 100;
    const f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [Math.round(f(5) * 255), Math.round(f(3) * 255), Math.round(f(1) * 255)];
}
function rgbToHex(r: number, g: number, b: number) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
}
function hexToRgb(hex: string) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}
function rgbToHsv(r: number, g: number, b: number) {
    r /= 255; g /= 255; b /= 255;
    const v = Math.max(r, g, b), c = v - Math.min(r, g, b);
    const h = c && ((v === r) ? (g - b) / c : ((v === g) ? 2 + (b - r) / c : 4 + (r - g) / c));
    return { h: Math.round(60 * (h < 0 ? h + 6 : h)) || 0, s: Math.round(v && c / v * 100), v: Math.round(v * 100) };
}

const INITIAL_SAVED_COLORS = [
    '#EF4444', '#F97316', '#FBBF24', '#22C55E', '#06B6D4', '#3B82F6', '#4F46E5', '#8B5CF6',
    '#EC4899', '#E11D48', '#D946EF', '#A855F7', '#0EA5E9', '#14B8A6', '#84CC16'
];

function BlackboardEditorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const courseId = searchParams.get('courseId');

    const [boardId, setBoardId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);

    // --- BOARD STATE ---
    const [boardTitle, setBoardTitle] = useState('Untitled Board 1');
    const [lastSaved, setLastSaved] = useState('');

    // --- TOOL STATE ---
    const [activeTool, setActiveTool] = useState<'pen' | 'eraser' | 'move'>('pen');
    const [brushSize, setBrushSize] = useState(4);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showBrushSizes, setShowBrushSizes] = useState(false);

    // --- PAN & ZOOM STATE ---
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [showZoomIndicator, setShowZoomIndicator] = useState(false);
    const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Using Refs for instantaneous tracking
    const isPanningRef = useRef(false);
    const isDrawingRef = useRef(false);
    const panStartRef = useRef({ x: 0, y: 0 });

    // --- COLOR PICKER STATE ---
    const [hsv, setHsv] = useState({ h: 244, s: 70, v: 90 });
    const [alpha, setAlpha] = useState(100);
    const [colorFormat, setColorFormat] = useState<'Hex' | 'RGB'>('Hex');
    const [showFormatDropdown, setShowFormatDropdown] = useState(false);
    const [savedColors, setSavedColors] = useState<string[]>(INITIAL_SAVED_COLORS);

    const [r, g, b] = hsvToRgb(hsv.h, hsv.s, hsv.v);
    const hexColor = rgbToHex(r, g, b);
    const rgbaString = `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
    const hueColorString = `hsl(${hsv.h}, 100%, 50%)`;

    const svBoxRef = useRef<HTMLDivElement>(null);
    const hueSliderRef = useRef<HTMLDivElement>(null);
    const alphaSliderRef = useRef<HTMLDivElement>(null);
    const [isDraggingSV, setIsDraggingSV] = useState(false);
    const [isDraggingHue, setIsDraggingHue] = useState(false);
    const [isDraggingAlpha, setIsDraggingAlpha] = useState(false);

    // --- CANVAS REF & LOGIC ---
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const [undoStack, setUndoStack] = useState<string[]>([]);
    const [redoStack, setRedoStack] = useState<string[]>([]);

    const handlePopStateRef = useRef<(e: PopStateEvent) => void>(undefined);

    useEffect(() => {
        window.history.pushState(null, '', window.location.href);

        handlePopStateRef.current = (e: PopStateEvent) => {
            window.history.pushState(null, '', window.location.href);
            setShowExitModal(true);
        };

        window.addEventListener('popstate', handlePopStateRef.current);

        return () => {
            if (handlePopStateRef.current) {
                window.removeEventListener('popstate', handlePopStateRef.current);
            }
        };
    }, []);

    const executeExit = () => {
        if (handlePopStateRef.current) {
            window.removeEventListener('popstate', handlePopStateRef.current);
        }
        setShowExitModal(false);

        if (courseId) {
            window.location.href = `/virtual-blackboard?courseId=${courseId}`;
        } else {
            window.location.href = '/virtual-blackboard';
        }
    };

    const handleDiscardAndLeave = () => {
        executeExit();
    };

    const handleSaveAndLeave = async () => {
        setShowExitModal(false);
        await handleSaveAndDownload(false);
        executeExit();
    };

    // --- LOAD BOARD FROM DATABASE ---
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlTitle = params.get('title');
        const urlId = params.get('boardId');

        if (urlTitle) setBoardTitle(urlTitle);

        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!canvas || !context) return;

        canvas.width = 2400 * 2;
        canvas.height = 1600 * 2;
        context.scale(2, 2);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        contextRef.current = context;

        if (urlId) {
            const parsedId = parseInt(urlId);
            setBoardId(parsedId);

            fetchSingleBlackboardAction(parsedId).then(res => {
                if (res.success && res.data?.drawing_data) {
                    const dataObj = res.data.drawing_data;

                    if (dataObj.lastSaved) {
                        setLastSaved(`Saved on ${dataObj.lastSaved}`);
                    }

                    if (dataObj.currentFrameUrl) {
                        const img = new Image();
                        img.crossOrigin = "anonymous";
                        const cleanUrl = dataObj.currentFrameUrl.split('?')[0];
                        img.src = `${cleanUrl}?t=${Date.now()}`;

                        img.onload = () => {
                            const ctx = contextRef.current;
                            if (ctx) {
                                ctx.clearRect(0, 0, 2400, 1600);
                                ctx.drawImage(img, 0, 0, 2400, 1600);
                                setUndoStack([canvas.toDataURL('image/png')]);
                            }
                        };
                    } else {
                        setUndoStack([canvas.toDataURL()]);
                    }
                } else {
                    setUndoStack([canvas.toDataURL()]);
                }
            });
        } else {
            setUndoStack([canvas.toDataURL()]);
        }
    }, []);

    // --- GLOBAL MOUSE & TOUCH FIX ---
    useEffect(() => {
        const handleGlobalEnd = () => {
            if (isDrawingRef.current) finishDrawing();
            if (isPanningRef.current) isPanningRef.current = false;
        };

        window.addEventListener('mouseup', handleGlobalEnd);
        window.addEventListener('touchend', handleGlobalEnd);
        return () => {
            window.removeEventListener('mouseup', handleGlobalEnd);
            window.removeEventListener('touchend', handleGlobalEnd);
        };
    }, []);

    // --- CUSTOM COLOR PICKER LOGIC (UPDATED FOR TOUCH) ---
    const handleSVPick = useCallback((e: any) => {
        if (!svBoxRef.current) return;
        const { clientX, clientY } = getClientXY(e);
        const rect = svBoxRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
        setHsv(prev => ({ ...prev, s: Math.round((x / rect.width) * 100), v: Math.round((1 - y / rect.height) * 100) }));
    }, []);

    const handleHuePick = useCallback((e: any) => {
        if (!hueSliderRef.current) return;
        const { clientX } = getClientXY(e);
        const rect = hueSliderRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        setHsv(prev => ({ ...prev, h: Math.round((x / rect.width) * 360) }));
    }, []);

    const handleAlphaPick = useCallback((e: any) => {
        if (!alphaSliderRef.current) return;
        const { clientX } = getClientXY(e);
        const rect = alphaSliderRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        setAlpha(Math.round((x / rect.width) * 100));
    }, []);

    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (isDraggingSV) handleSVPick(e);
            if (isDraggingHue) handleHuePick(e);
            if (isDraggingAlpha) handleAlphaPick(e);

            if (isPanningRef.current && activeTool === 'move') {
                const { clientX, clientY } = getClientXY(e);
                setPan({
                    x: clientX - panStartRef.current.x,
                    y: clientY - panStartRef.current.y
                });
            }
        };
        const handleEnd = () => {
            setIsDraggingSV(false);
            setIsDraggingHue(false);
            setIsDraggingAlpha(false);
            isPanningRef.current = false;
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchend', handleEnd);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDraggingSV, isDraggingHue, isDraggingAlpha, handleSVPick, handleHuePick, handleAlphaPick, activeTool]);


    // --- DRAWING & PANNING HANDLERS (UPDATED FOR TOUCH) ---
    const getCoordinates = (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const { clientX, clientY } = getClientXY(e);
        return {
            x: (clientX - rect.left) / scale,
            y: (clientY - rect.top) / scale
        };
    };

    const startInteraction = (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) => {
        const { clientX, clientY } = getClientXY(e);

        if (activeTool === 'move') {
            isPanningRef.current = true;
            panStartRef.current = { x: clientX - pan.x, y: clientY - pan.y };
            return;
        }

        if (activeTool !== 'pen' && activeTool !== 'eraser') return;

        const { x, y } = getCoordinates(e);
        contextRef.current?.beginPath();
        contextRef.current?.moveTo(x, y);
        isDrawingRef.current = true;
        setShowColorPicker(false);
        setShowBrushSizes(false);
    };

    const drawOrPan = (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) => {
        const { clientX, clientY } = getClientXY(e);

        if (activeTool === 'move' && isPanningRef.current) {
            setPan({
                x: clientX - panStartRef.current.x,
                y: clientY - panStartRef.current.y
            });
            return;
        }

        if (!isDrawingRef.current || !contextRef.current) return;

        const { x, y } = getCoordinates(e);

        if (activeTool === 'eraser') {
            contextRef.current.globalCompositeOperation = 'destination-out';
            contextRef.current.lineWidth = brushSize * 3;
        } else {
            contextRef.current.globalCompositeOperation = 'source-over';
            contextRef.current.strokeStyle = rgbaString;
            contextRef.current.lineWidth = brushSize;
        }

        contextRef.current.lineTo(x, y);
        contextRef.current.stroke();
    };

    const finishDrawing = () => {
        if (activeTool === 'move') {
            isPanningRef.current = false;
            return;
        }

        if (!isDrawingRef.current || !contextRef.current) return;
        contextRef.current.closePath();
        isDrawingRef.current = false;

        if (canvasRef.current) {
            const newState = canvasRef.current.toDataURL();
            setUndoStack((prev) => [...prev, newState]);
            setRedoStack([]);
        }
    };

    // --- UNDO / REDO ---
    const handleUndo = () => {
        if (undoStack.length <= 1 || !canvasRef.current || !contextRef.current) return;
        const currentState = undoStack[undoStack.length - 1];
        const previousState = undoStack[undoStack.length - 2];

        setUndoStack((prev) => prev.slice(0, -1));
        setRedoStack((prev) => [...prev, currentState]);

        const img = new Image();
        img.src = previousState;
        img.onload = () => {
            contextRef.current?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            contextRef.current?.drawImage(img, 0, 0, canvasRef.current!.width / 2, canvasRef.current!.height / 2);
        };
    };

    const handleRedo = () => {
        if (redoStack.length === 0 || !canvasRef.current || !contextRef.current) return;
        const nextState = redoStack[redoStack.length - 1];

        setRedoStack((prev) => prev.slice(0, -1));
        setUndoStack((prev) => [...prev, nextState]);

        const img = new Image();
        img.src = nextState;
        img.onload = () => {
            contextRef.current?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            contextRef.current?.drawImage(img, 0, 0, canvasRef.current!.width / 2, canvasRef.current!.height / 2);
        };
    };

    // --- ZOOM ---
    const triggerZoomIndicator = () => {
        setShowZoomIndicator(true);
        if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
        zoomTimeoutRef.current = setTimeout(() => {
            setShowZoomIndicator(false);
        }, 1500);
    };

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev + 0.25, 3));
        triggerZoomIndicator();
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev - 0.25, 0.5));
        triggerZoomIndicator();
    };

    // --- SAVE ---
    const handleSaveAndDownload = (shouldDownloadLocal: boolean = true): Promise<void> => {
        return new Promise((resolve) => {
            if (!canvasRef.current || !boardId) {
                resolve();
                return;
            }
            setIsSaving(true);

            canvasRef.current.toBlob(async (blob) => {
                if (!blob) {
                    setIsSaving(false);
                    resolve();
                    return;
                }

                const formData = new FormData();
                formData.append('file', new File([blob], 'board.png', { type: 'image/png' }));
                formData.append('boardId', boardId.toString());

                const uploadRes = await uploadBlackboardToTigrisAction(formData);

                if (uploadRes.success && uploadRes.publicUrl) {
                    const dbRes = await saveBlackboardDataAction(boardId, uploadRes.publicUrl, boardTitle);

                    if (dbRes.success) {
                        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                        setLastSaved(`Saved on ${today}`);

                        if (shouldDownloadLocal) {
                            const link = document.createElement('a');
                            link.download = `${boardTitle.replace(/\s+/g, '_')}.png`;
                            link.href = canvasRef.current!.toDataURL('image/png');
                            link.click();
                        }
                    } else {
                        alert("Failed to save to database.");
                    }
                } else {
                    alert(`Tigris Upload Failed: ${uploadRes.error}`);
                }

                setIsSaving(false);
                resolve();
            }, 'image/png');
        });
    };

    const IconColor = (toolName: string) => activeTool === toolName ? '#EFBD31' : '#0A7F93';

    return (
        <div className="min-h-screen bg-[#E2E7E9] font-sans flex flex-col overflow-hidden">
            <Gr8MathHeader />
            <Gr8LoadingOverlay isLoading={isSaving} message="Saving..." />
            {/* --- TOP BAR --- */}
            <div className="flex flex-col w-full max-w-[1400px] mx-auto px-6 py-6 pt-10 z-30">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <button aria-label='ariaaShow' onClick={() => setShowExitModal(true)} className="p-1.5 -ml-1.5 text-[#0A7F93] hover:bg-black/5 rounded-lg transition-colors outline-none cursor-pointer">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <input
                        aria-label='titleAria'
                            type="text"
                            value={boardTitle}
                            onChange={(e) => setBoardTitle(e.target.value)}
                            className="text-[20px] md:text-[24px] font-black text-[#222] bg-transparent outline-none border-b-2 border-transparent focus:border-[#0A7F93] transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* --- WORKSPACE --- */}
            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 pb-10 flex gap-6 relative">

                {/* CANVAS AREA CONTAINER */}
                <div className="flex-1 flex flex-col h-[70vh] min-h-[500px] relative">

                    <div
                        className="flex-1 w-full bg-[#E9EEF0] border-2 border-[#D1D8DD] rounded-xl relative overflow-hidden shadow-inner"
                        style={{ backgroundImage: 'radial-gradient(#C8D0D5 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                    >
                        <div className={`absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-[#D1D8DD] z-30 text-[12px] font-extrabold text-[#444] pointer-events-none transition-opacity duration-300 ${showZoomIndicator ? 'opacity-100' : 'opacity-0'}`}>
                            Zoom: {Math.round(scale * 100)}%
                        </div>

                        <TopRightPixels />
                        <BottomLeftPixels />

                        <div
                            className="absolute bg-[#F8F5EF] shadow-[0_0_50px_rgba(0,0,0,0.1)] border border-[#C0C8CF] transition-transform duration-75 origin-center"
                            style={{
                                width: '2400px',
                                height: '1600px',
                                left: '50%',
                                top: '50%',
                                marginLeft: '-1200px',
                                marginTop: '-800px',
                                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                            }}
                        >
                            <div className="absolute top-8 left-8 opacity-30 pointer-events-none z-0">
                                <h2 className="text-2xl font-black text-[#1A4C8B]">Gr8 Math Learning Management System</h2>
                            </div>

                            <canvas
                                ref={canvasRef}
                                onMouseDown={startInteraction}
                                onMouseMove={drawOrPan}
                                onMouseUp={finishDrawing}
                                onMouseLeave={finishDrawing}
                                onTouchStart={startInteraction}
                                onTouchMove={drawOrPan}
                                onTouchEnd={finishDrawing}
                                onTouchCancel={finishDrawing}
                                className={`w-full h-full relative z-10 ${activeTool === 'move' ? (isPanningRef.current ? 'cursor-grabbing' : 'cursor-grab') : activeTool === 'eraser' ? 'cursor-crosshair' : 'cursor-default'}`}
                                style={{ touchAction: 'none' }}
                            />
                        </div>
                    </div>

                    {/* SAVE AND DOWNLOAD */}
                    <div className="flex justify-between items-center mt-3 z-30">
                        <span className="text-[13px] font-bold text-[#888]">{lastSaved}</span>
                        <button onClick={() => handleSaveAndDownload(true)} className="flex items-center gap-2 text-[#888] font-bold text-[14px] hover:text-[#0A7F93] transition-colors outline-none cursor-pointer">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Save and Download
                        </button>
                    </div>
                </div>

                {/* --- TOOLBAR --- */}
                <div className="flex flex-col gap-3 shrink-0 relative w-[52px] z-50">

                    <button aria-label='ariaPen' onClick={() => { setActiveTool('pen'); setShowColorPicker(false); setShowBrushSizes(false); }} className={`w-12 h-12 bg-white rounded-xl shadow-sm border-2 flex items-center justify-center outline-none transition-colors ${activeTool === 'pen' ? 'border-[#EFBD31]' : 'border-[#D1D8DD]'}`}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={IconColor('pen')} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </button>

                    <button aria-label='ariaEraser' onClick={() => { setActiveTool('eraser'); setShowColorPicker(false); setShowBrushSizes(false); }} className={`w-12 h-12 bg-white rounded-xl shadow-sm border-2 flex items-center justify-center outline-none transition-colors ${activeTool === 'eraser' ? 'border-[#EFBD31]' : 'border-[#D1D8DD]'}`}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={IconColor('eraser')} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20H7L3 16C2.5 15.5 2.5 14.5 3 14L13 4C13.5 3.5 14.5 3.5 15 4L20 9C20.5 9.5 20.5 10.5 20 11L11 20"></path><line x1="17" y1="14" x2="22" y2="19"></line></svg>
                    </button>

                    {/* --- ADVANCED COLOR PICKER --- */}
                    <div className="relative">
                        <button aria-label='ariaShowColor' onClick={() => { setShowColorPicker(!showColorPicker); setShowBrushSizes(false); }} className="w-12 h-12 bg-white rounded-xl shadow-sm border-2 border-[#D1D8DD] flex items-center justify-center outline-none hover:border-[#EFBD31] transition-colors">
                            <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: hexColor }}></div>
                        </button>

                        {showColorPicker && (
                            <div className="absolute top-0 right-16 w-[260px] bg-white border border-[#D1D8DD] rounded-2xl shadow-xl p-4 z-50 flex flex-col animate-in slide-in-from-right-2 duration-200">
                                {/* Gradient Box */}
                                <div
                                    ref={svBoxRef}
                                    onMouseDown={(e) => { setIsDraggingSV(true); handleSVPick(e); }}
                                    onTouchStart={(e) => { setIsDraggingSV(true); handleSVPick(e); }}
                                    className="w-full h-32 rounded-lg relative overflow-hidden mb-3 cursor-crosshair touch-none"
                                    style={{ backgroundColor: hueColorString }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
                                    <div className="absolute w-4 h-4 rounded-full border-2 border-white shadow-sm pointer-events-none -ml-2 -mt-2" style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, backgroundColor: hexColor }}></div>
                                </div>

                                {/* Hue Slider */}
                                <div
                                    ref={hueSliderRef}
                                    onMouseDown={(e) => { setIsDraggingHue(true); handleHuePick(e); }}
                                    onTouchStart={(e) => { setIsDraggingHue(true); handleHuePick(e); }}
                                    className="w-full h-[10px] rounded-full relative mb-3 cursor-pointer touch-none"
                                    style={{ background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}
                                >
                                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-[2.5px] border-white shadow-sm pointer-events-none -ml-2" style={{ left: `${(hsv.h / 360) * 100}%`, backgroundColor: hueColorString }}></div>
                                </div>

                                {/* Opacity Slider */}
                                <div
                                    ref={alphaSliderRef}
                                    onMouseDown={(e) => { setIsDraggingAlpha(true); handleAlphaPick(e); }}
                                    onTouchStart={(e) => { setIsDraggingAlpha(true); handleAlphaPick(e); }}
                                    className="w-full h-[10px] rounded-full relative mb-4 cursor-pointer touch-none"
                                    style={{ background: 'repeating-conic-gradient(#E5E7EB 0% 25%, white 0% 50%) 50% / 8px 8px' }}
                                >
                                    <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: `linear-gradient(to right, transparent, ${hexColor})` }}></div>
                                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-[2.5px] border-white shadow-sm pointer-events-none -ml-2" style={{ left: `${alpha}%`, backgroundColor: hexColor }}></div>
                                </div>

                                {/* Inputs Row */}
                                <div className="flex items-center gap-2 mb-4 relative">
                                    <div className="relative">
                                        <div onClick={() => setShowFormatDropdown(!showFormatDropdown)} className="flex items-center justify-between border border-[#D1D8DD] rounded px-2 py-1.5 w-[65px] text-[11px] text-[#444] bg-white cursor-pointer hover:border-[#A0A0A0] transition-colors font-semibold">
                                            {colorFormat} <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </div>
                                        {showFormatDropdown && (
                                            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#D1D8DD] rounded shadow-md z-10 overflow-hidden">
                                                {['Hex', 'RGB'].map(fmt => (
                                                    <div key={fmt} onClick={() => { setColorFormat(fmt as any); setShowFormatDropdown(false); }} className="px-2 py-1.5 text-[11px] text-[#444] hover:bg-gray-100 cursor-pointer font-semibold">{fmt}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center border border-[#D1D8DD] rounded px-2 py-1.5 flex-1 text-[11px] text-[#222] font-semibold bg-white focus-within:border-[#4F46E5] transition-colors">
                                        {colorFormat === 'Hex' ? (
                                            <>
                                                <span className="text-[#A0A0A0] mr-1">#</span>
                                                <input type="text" value={hexColor.replace('#', '')} onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '').substring(0, 6);
                                                    if (val.length === 6) {
                                                        const [newR, newG, newB] = hexToRgb(val);
                                                        setHsv(rgbToHsv(newR, newG, newB));
                                                        setActiveTool('pen');
                                                    }
                                                }} className="w-full outline-none uppercase bg-transparent" maxLength={6} />
                                            </>
                                        ) : (<span className="w-full uppercase bg-transparent text-center">{r}, {g}, {b}</span>)}
                                    </div>
                                    <div className="flex items-center justify-center border border-[#D1D8DD] rounded px-2 py-1.5 w-[50px] text-[11px] text-[#222] font-semibold bg-white">{alpha}%</div>
                                </div>

                                {/* Saved Colors */}
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <span className="text-[11px] font-bold text-[#444]">Saved colors:</span>
                                    <button onClick={() => { if (!savedColors.includes(hexColor)) setSavedColors(prev => [...prev, hexColor]); }} className="text-[11px] font-bold text-[#888] hover:text-[#222] transition-colors cursor-pointer">+ Add</button>
                                </div>
                                <div className="grid grid-cols-8 gap-x-1.5 gap-y-2">
                                    {savedColors.map((c, i) => (
                                        <button aria-label='ariaHex' key={`${c}-${i}`} onClick={() => { const [r, g, b] = hexToRgb(c); setHsv(rgbToHsv(r, g, b)); setAlpha(100); setActiveTool('pen'); }} className={`w-6 h-6 rounded-full shadow-sm hover:scale-110 transition-transform cursor-pointer ${hexColor.toUpperCase() === c.toUpperCase() ? 'ring-2 ring-offset-1 ring-[#1A4C8B]' : ''}`} style={{ backgroundColor: c }} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Brush Size Toggle */}
                    <div className="relative">
                        <button aria-label='ariaBrush' onClick={() => { setShowBrushSizes(!showBrushSizes); setShowColorPicker(false); }} className={`w-12 h-12 bg-white rounded-xl shadow-sm border-2 flex items-center justify-center outline-none transition-colors ${showBrushSizes ? 'border-[#EFBD31]' : 'border-[#D1D8DD]'}`}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={showBrushSizes ? '#EFBD31' : '#0A7F93'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="19" r="2" fill="currentColor"></circle><circle cx="12" cy="12" r="3" fill="currentColor"></circle><circle cx="19" cy="5" r="4" fill="currentColor"></circle></svg>
                        </button>

                        {showBrushSizes && (
                            <div className="absolute top-0 right-16 bg-white border border-[#D1D8DD] rounded-xl shadow-xl py-3 px-2 z-50 flex flex-col gap-3 items-center animate-in slide-in-from-right-2 duration-200">
                                {[24, 16, 12, 8, 4, 2].map(size => (
                                    <button aria-label='ariaSize' key={size} onClick={() => { setBrushSize(size); setShowBrushSizes(false); }} className="w-10 h-10 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors outline-none cursor-pointer">
                                        <div className="rounded-full" style={{ width: size + 2, height: size + 2, backgroundColor: hexColor }}></div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button aria-label='ariaColorPick' onClick={() => { setActiveTool('move'); setShowColorPicker(false); setShowBrushSizes(false); }} className={`w-12 h-12 bg-white rounded-xl shadow-sm border-2 flex items-center justify-center outline-none transition-colors ${activeTool === 'move' ? 'border-[#EFBD31]' : 'border-[#D1D8DD]'}`}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={IconColor('move')} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 9 2 12 5 15"></polyline><polyline points="9 5 12 2 15 5"></polyline><polyline points="19 9 22 12 19 15"></polyline><polyline points="9 19 12 22 15 19"></polyline><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>
                    </button>

                    <button aria-label='ariaZoomIn' onClick={handleZoomIn} className="w-12 h-12 bg-white rounded-xl shadow-sm border-2 border-[#D1D8DD] flex items-center justify-center hover:border-[#0A7F93] transition-colors outline-none cursor-pointer">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A7F93" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                    </button>
                    <button aria-label='ariaZoomOut' onClick={handleZoomOut} className="w-12 h-12 bg-white rounded-xl shadow-sm border-2 border-[#D1D8DD] flex items-center justify-center hover:border-[#0A7F93] transition-colors outline-none cursor-pointer">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A7F93" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                    </button>

                    <button aria-label='ariaUndo' onClick={handleUndo} disabled={undoStack.length <= 1} className="w-12 h-12 bg-white rounded-xl shadow-sm border-2 border-[#D1D8DD] flex items-center justify-center hover:border-[#0A7F93] transition-colors outline-none cursor-pointer disabled:opacity-40 disabled:hover:border-[#D1D8DD] mt-2">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A7F93" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
                    </button>
                    <button aria-label='ariaRedo' onClick={handleRedo} disabled={redoStack.length === 0} className="w-12 h-12 bg-white rounded-xl shadow-sm border-2 border-[#D1D8DD] flex items-center justify-center hover:border-[#0A7F93] transition-colors outline-none cursor-pointer disabled:opacity-40 disabled:hover:border-[#D1D8DD]">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0A7F93" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path></svg>
                    </button>

                </div>
            </main>

            {/* --- EXIT CONFIRMATION MODAL --- */}
            {showExitModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 pt-10 w-full max-w-[400px] text-center font-sans animate-in zoom-in-95 relative">

                        {/* X (Cancel) Button on the Top Left */}
                        <button
                            onClick={() => setShowExitModal(false)}
                            disabled={isSaving}
                            className="absolute top-5 right-5 text-[#888] hover:text-[#222] transition-colors outline-none cursor-pointer disabled:opacity-50"
                            aria-label="Cancel"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>

                        <h2 className="text-[18px] font-extrabold text-[#222] mb-2">Leave Editor?</h2>
                        <p className="text-[14px] text-[#666] mb-6">Do you want to save your drawing before leaving?</p>

                        <div className="flex justify-center gap-x-12 mt-4">
                            <button
                                onClick={handleSaveAndLeave}
                                disabled={isSaving}
                                className="text-[#ED1F24] font-black outline-none cursor-pointer hover:opacity-70 transition-opacity disabled:opacity-50"
                            >
                                {"Yes"}
                            </button>
                            <button
                                onClick={handleDiscardAndLeave}
                                disabled={isSaving}
                                className="text-[#ED1F24] font-black outline-none cursor-pointer hover:opacity-70 transition-opacity disabled:opacity-50"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function VirtualBlackboardEditor() {
    return (
        <Suspense fallback={<Gr8LoadingOverlay isLoading={true} message="Loading Blackboard..." />}>
            <BlackboardEditorContent />
        </Suspense>
    );
}