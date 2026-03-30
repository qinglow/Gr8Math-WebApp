'use server';

import { createDllRecord, fetchDllRecords } from '@/app/service/dll';
import { revertIsoToPicker } from '@/lib/utils/utils';

export async function saveDllAction(payload: any) {
    try {
        const mainId = await createDllRecord(payload);
        return { success: true, id: mainId };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to save DLL" };
    }
}

export async function getDllsAction(courseId: string) {
    try {
        const rawDlls = await fetchDllRecords(courseId);

        // Transform relational DB data back into the nested object Gr8DllViewer expects
        const formattedDlls = rawDlls.map((dll: any) => {
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
            
            // Sort entries chronologically to ensure Mon-Fri order
            const sortedEntries = (dll.dll_daily_entry || []).sort((a: any, b: any) => 
                new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
            );

            const objectives = { contentStandards: {} as any, performanceStandards: {} as any, learningCompetencies: {} as any };
            const resources = { content: {} as any, teacherGuide: {} as any, learnerMaterials: {} as any, textbookPages: {} as any, additionalMaterials: {} as any, otherReferences: {} as any };
            const procedures = { A:{} as any, B:{} as any, C:{} as any, D:{} as any, E:{} as any, F:{} as any, G:{} as any, H:{} as any, I:{} as any, J:{} as any };
            
            let remarks = '';
            let reflectionObj = { A:'', B:'', C:'', D:'', E:'', F:'', G:'' };

            // Figure out if Weekly Toggle was used (if Mon and Tue match)
            let isCsWeekly = false;
            let isPsWeekly = false;
            if (sortedEntries.length > 1) {
                isCsWeekly = sortedEntries[0].content_standard === sortedEntries[1].content_standard && sortedEntries[0].content_standard !== '';
                isPsWeekly = sortedEntries[0].performance_standard === sortedEntries[1].performance_standard && sortedEntries[0].performance_standard !== '';
            }

            sortedEntries.forEach((entry: any, index: number) => {
                const day = days[index] || 'monday';

                objectives.contentStandards[day] = entry.content_standard || '';
                objectives.performanceStandards[day] = entry.performance_standard || '';
                objectives.learningCompetencies[day] = entry.learning_comp || '';

                // Map References
                const refs = entry.dll_references || [];
                const getRef = (title: string) => refs.find((r:any) => r.reference_title === title)?.reference_text || '';
                
                resources.content[day] = ''; // Note: 'content' column wasn't in your DB schema!
                resources.teacherGuide[day] = getRef("1. Teacher's Guide pages");
                resources.learnerMaterials[day] = getRef("2. Learner's Materials' pages");
                resources.textbookPages[day] = getRef("3. Textbook pages");
                resources.additionalMaterials[day] = getRef("4. Additional Materials from Learning Resource Portal");
                resources.otherReferences[day] = getRef("5. Other References");

                // Map Procedures
                procedures.A[day] = entry.review || '';
                procedures.B[day] = entry.purpose || '';
                procedures.C[day] = entry.example || '';
                
                // Split Discussion Proper back into D (#1) and E (#2)
                const disc = entry.discussion_proper || '';
                let d1 = '', d2 = '';
                if (disc.includes('#1') && disc.includes('#2')) {
                    const parts = disc.split('#2');
                    d1 = parts[0].replace('#1', '').trim();
                    d2 = parts[1].trim();
                } else if (disc.includes('#1')) {
                    d1 = disc.replace('#1', '').trim();
                } else if (disc.includes('#2')) {
                    d2 = disc.replace('#2', '').trim();
                } else {
                    d1 = disc; 
                }
                procedures.D[day] = d1;
                procedures.E[day] = d2;

                procedures.F[day] = entry.developing_mastery || '';
                procedures.G[day] = entry.application || '';
                procedures.H[day] = entry.generalization || '';
                procedures.I[day] = entry.evaluation || '';
                procedures.J[day] = entry.additional_act || '';

                if (entry.remark) remarks = entry.remark; // Remarks usually apply weekly
                
                // Reconstruct Reflection Object mapping from the strings
                if (entry.reflection) {
                    try {
                        const parsed = JSON.parse(entry.reflection);
                        // We only overwrite the object on the last day so we have the full week's reflection
                        reflectionObj = {
                            A: parsed["A. No. of learners who earned 80% in the evaluation"] || '',
                            B: parsed["B. No. of learners who require additional activities for remediation who scored below 80%"] || '',
                            C: parsed["C. Did the remedial lessons work? No. of learners who have caught up with the lesson"] || '',
                            D: parsed["D. No. of learners who continue to require remediation"] || '',
                            E: parsed["E. Which of my teaching strategies worked well? Why did these work?"] || '',
                            F: parsed["F. What difficulties did I encounter which my principal or supervisor can help me solve?"] || '',
                            G: parsed["G. What innovation or localized materials did I use/discover which I wish to share with other teachers?"] || ''
                        };
                    } catch(e) {}
                }
            });

            return {
                id: dll.id,
                from: revertIsoToPicker(dll.available_from), // Format for display
                to: revertIsoToPicker(dll.available_until),   // Format for display
                data: {
                    toggles: { isCsWeekly, isPsWeekly },
                    objectives,
                    resources,
                    procedures,
                    remarks,
                    reflection: reflectionObj
                }
            };
        });

        return { success: true, data: formattedDlls };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to fetch DLLs" };
    }
}