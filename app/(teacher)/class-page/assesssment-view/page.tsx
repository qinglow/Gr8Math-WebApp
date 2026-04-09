'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchStudentAssessmentReview } from '@/app/service/assessment'; 

export default function AssessmentViewPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center font-bold text-[#1E4B95]">Loading Review Page...</div>}>
            <AssessmentReviewContent />
        </Suspense>
    );
}

function AssessmentReviewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const assessmentId = searchParams.get('aid');
    const studentId = searchParams.get('sid');
    const title = searchParams.get('title') || "Assessment Review";

    const [responses, setResponses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

useEffect(() => {

        async function getDetails() {
            try {
                const res = await fetchStudentAssessmentReview(Number(assessmentId), Number(studentId));
                if (res.success) {
                    setResponses(res.data || []); 
                } else {
                }
            } catch (err) {
            }
            setLoading(false);
        }
        getDetails();
    }, [assessmentId, studentId]);

    // Helper: Remove [X pts] tags from the teacher's key
    const stripPts = (s: string) => s?.replace(/^\s*\[\s*\d+(?:\.\d+)?\s*pts?\s*\]\s*/gi, '').trim() || "";

    // Helper: Render MathLive formulas ($...$)
    const renderTextWithMath = (text: string) => {
        if (!text || !text.includes('$')) return text;
        const parts = text.split(/(\$.*?\$)/g);
        return (
            <>
                {parts.map((part, i) => {
                    if (part.startsWith('$') && part.endsWith('$')) {
                        const latex = part.slice(1, -1);
                        return <img key={i} src={`https://math.now.sh?from=${encodeURIComponent(latex)}&color=black`} alt="math" className="inline-block align-middle max-h-[1.4em] mx-0.5" />;
                    }
                    return <span key={i}>{part}</span>;
                })}
            </>
        );
    };

    return (
        <div className="min-h-screen bg-[#FDF8F2] flex flex-col font-lexend pb-20">
            {/* Nav Header */}
            <div className="bg-[#1E4B95] p-6 shadow-lg flex items-center gap-6 sticky top-0 z-50">
                <button aria-label='back' onClick={() => router.back()} className="text-white hover:scale-110 transition-transform bg-white/10 p-2 rounded-full">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <div className="text-white">
                    <h1 className="text-xl md:text-2xl font-black">Detailed Answer Review</h1>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{title}</p>
                </div>
            </div>

            <div className="max-w-4xl w-full mx-auto p-6 space-y-8 mt-4">
                {loading ? (
                    <div className="flex flex-col items-center py-20 gap-4">
                        <div className="w-10 h-10 border-4 border-[#1E4B95] border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-bold text-[#1E4B95]">Loading...</p>
                    </div>
                ) : responses.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[24px] border-2 border-dashed border-gray-300">
                        <p className="text-gray-400 font-bold text-lg">No answers found for this assessment.</p>
                    </div>
                ) : responses.map((q, i) => {
                    
                    // --- 1. PARSING TEXT AND IMAGES ---
                    const [fullText, imageUrl] = (q.question_text || "").split(" ||| ");
                    const typeMatch = fullText.match(/\[(.*?)\]/);
                    const qType = typeMatch ? typeMatch[1] : "Multiple Choice";
                    const qCleanText = fullText.replace(/\[.*?\]/, "").trim();

                    // --- 2. GRAB STUDENT ANSWERS ---
                    const sAnswers = q.student_answers || [];
                    const sAns = sAnswers[0] || {}; // For text/image answers, there is only 1 row.

                    // Group types exactly as defined by your database saving logic
                    const isChoiceBased = ['Multiple Choice', 'Checkboxes', 'Dropdown'].includes(qType);
                    const isUpload = qType === 'Upload Image';
                    const isTextBased = ['Short Answer', 'Paragraph'].includes(qType);

                    // --- 3. TEXT-BASED CORRECTNESS LOGIC ---
                    let isTextOverallCorrect = false;
                    const correctChoice = q.assessment_choices?.find((c: any) => c.is_correct);

                    if (isTextBased) {
                        const correctText = stripPts(correctChoice?.choice_text);
                        const studentText = sAns.text_answer?.trim() || "";
                        isTextOverallCorrect = studentText.toLowerCase() === correctText.toLowerCase();
                    }

                    return (
                        <div key={q.id} className="bg-white border border-[#D1D8DD] rounded-[24px] p-6 md:p-8 shadow-sm relative overflow-hidden">
                            {/* Question Type Badge */}
                            <div className="absolute top-0 right-0 bg-[#F4EFED] px-5 py-1.5 text-[11px] font-black text-[#1E4B95] uppercase tracking-wider rounded-bl-xl">
                                {qType}
                            </div>

                            {/* Question Header */}
                            <div className="flex gap-x-5 mb-6 mt-2">
                                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#F4EFED] text-[#1E4B95] flex items-center justify-center font-black text-lg shadow-inner">
                                    {i + 1}
                                </span>
                                <h4 className="text-[#101720] font-bold text-[17px] md:text-[19px] leading-snug mt-1">
                                    {renderTextWithMath(qCleanText)}
                                </h4>
                            </div>

                            {/* Question Image (If provided by teacher) */}
                            {imageUrl && (
                                <div className="ml-0 md:ml-14 mb-8 rounded-2xl overflow-hidden border-2 border-[#D1D8DD] max-w-sm bg-gray-50">
                                    <img src={imageUrl} alt="Assessment visual" className="w-full h-auto object-contain" />
                                </div>
                            )}

                            {/* ========================================================= */}
                            {/* SCENARIO A: CHOICES (Multiple Choice / Checkboxes)        */}
                            {/* Uses ONLY `choice_id`. DOES NOT USE `text_answer`         */}
                            {/* ========================================================= */}
                            {isChoiceBased && (
                                <div className="flex flex-col gap-y-3 ml-0 md:ml-14 mt-4">
                                    {q.assessment_choices.map((choice: any) => {
                                        // Check if the student's selected IDs include this choice's ID
                                        const isSelectedByStudent = sAnswers.some((a: any) => a.choice_id === choice.id);
                                        const isActuallyCorrect = choice.is_correct;
                                        const cleanChoiceText = stripPts(choice.choice_text);

                                        let boxStyle = "border-[#D1D8DD] bg-white text-gray-700";
                                        let icon = null;

                                        // Apply colors to the choices
                                        if (isSelectedByStudent && isActuallyCorrect) {
                                            boxStyle = "border-green-500 bg-green-50 text-green-900";
                                            icon = <span className="text-green-600 font-black text-lg">✓ Correct</span>;
                                        } else if (isSelectedByStudent && !isActuallyCorrect) {
                                            boxStyle = "border-red-500 bg-red-50 text-red-900";
                                            icon = <span className="text-red-600 font-black text-lg">✗ Incorrect</span>;
                                        } else if (!isSelectedByStudent && isActuallyCorrect) {
                                            boxStyle = "border-[#1E4B95] bg-[#1E4B95]/5 text-[#1E4B95] border-dashed";
                                            icon = <span className="text-[#1E4B95] font-bold text-sm tracking-wide uppercase">Correct Answer</span>;
                                        }

                                        return (
                                            <div key={choice.id} className={`p-4 rounded-xl border-2 flex items-center justify-between transition-colors ${boxStyle}`}>
                                                <span className="font-bold text-[15px]">{renderTextWithMath(cleanChoiceText) || "[Empty Choice]"}</span>
                                                {icon && <div>{icon}</div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ========================================================= */}
                            {/* SCENARIO B: UPLOAD IMAGE                                  */}
                            {/* Uses ONLY `text_answer` as an image URL                   */}
                            {/* ========================================================= */}
                            {isUpload && (
                                <div className="ml-0 md:ml-14 mt-4">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Student Uploaded Image:</p>
                                    {sAns.text_answer ? (
                                        <a href={sAns.text_answer} target="_blank" rel="noopener noreferrer">
                                            <img src={sAns.text_answer} alt="Student Answer" className="max-w-xs h-auto rounded-xl border-4 border-gray-200 hover:border-[#1E4B95] transition-colors cursor-pointer" />
                                        </a>
                                    ) : (
                                        <p className="text-red-500 font-bold italic">No image provided.</p>
                                    )}
                                </div>
                            )}

                            {/* ========================================================= */}
                            {/* SCENARIO C: SHORT ANSWER / PARAGRAPH                      */}
                            {/* Uses ONLY `text_answer` for typed text                    */}
                            {/* ========================================================= */}
                            {isTextBased && (
                                <div className="ml-0 md:ml-14 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {/* Student's Typed Answer */}
                                    <div className={`p-5 rounded-2xl border-2 ${isTextOverallCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Student Wrote:</p>
                                        <p className={`text-base font-bold whitespace-pre-wrap ${isTextOverallCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                            {renderTextWithMath(sAns.text_answer || "No response provided")}
                                        </p>
                                    </div>

                                    {/* The Teacher's Expected Answer Key */}
                                    {!isTextOverallCorrect && (
                                        <div className="p-5 rounded-2xl border-2 bg-blue-50 border-blue-100">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Expected Answer:</p>
                                            <p className="text-base font-bold text-[#1E4B95] whitespace-pre-wrap">
                                                {renderTextWithMath(stripPts(correctChoice?.choice_text)) || "Refer to teacher manual"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}