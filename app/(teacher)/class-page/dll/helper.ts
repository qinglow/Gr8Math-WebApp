export const prepareDllForDatabase = (editorData: any, startDateStr: string, endDateStr: string, courseId: string, quarterNumber: string, dllWeekNumber: string) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const start = new Date(startDateStr);

    const payload = {
        courseId: parseInt(courseId),
        quarterNumber: parseInt(quarterNumber) || 1,
        weekNumber: parseInt(dllWeekNumber),
        availableFrom: startDateStr,
        availableUntil: endDateStr,
        dailyEntries: [] as any[],
        references: [] as any[]
    };

    days.forEach((day, index) => {
        const entryDate = new Date(start);
        entryDate.setDate(entryDate.getDate() + index);
        const dateString = entryDate.toISOString().split('T')[0];

        let discussionCombined = '';
        const d1 = editorData.procedures.D[day];
        const d2 = editorData.procedures.E[day];
        if (d1 || d2) {
            discussionCombined = `${d1 ? `#1 ${d1} ` : ''}${d2 ? `#2 ${d2}` : ''}`.trim();
        }

        const reflectionObject = {
            "A. No. of learners who earned 80% in the evaluation": editorData.reflection.A,
            "B. No. of learners who require additional activities for remediation who scored below 80%": editorData.reflection.B,
            "C. Did the remedial lessons work? No. of learners who have caught up with the lesson": editorData.reflection.C,
            "D. No. of learners who continue to require remediation": editorData.reflection.D,
            "E. Which of my teaching strategies worked well? Why did these work?": editorData.reflection.E,
            "F. What difficulties did I encounter which my principal or supervisor can help me solve?": editorData.reflection.F,
            "G. What innovation or localized materials did I use/discover which I wish to share with other teachers?": editorData.reflection.G
        };

        payload.dailyEntries.push({
            entry_date: dateString,
            content_standard: editorData.toggles.isCsWeekly ? editorData.objectives.contentStandards.monday : editorData.objectives.contentStandards[day],
            performance_standard: editorData.toggles.isPsWeekly ? editorData.objectives.performanceStandards.monday : editorData.objectives.performanceStandards[day],
            learning_comp: editorData.objectives.learningCompetencies[day],
            review: editorData.procedures.A[day],
            purpose: editorData.procedures.B[day],
            example: editorData.procedures.C[day],
            discussion_proper: discussionCombined,
            developing_mastery: editorData.procedures.F[day],
            application: editorData.procedures.G[day],
            generalization: editorData.procedures.H[day],
            evaluation: editorData.procedures.I[day],
            additional_act: editorData.procedures.J[day],
            remark: editorData.remarks,
            reflection: JSON.stringify(reflectionObject)
        });

        const addReference = (title: string, text: string) => {
            if (text && text.trim() !== '') {
                payload.references.push({ reference_title: title, reference_text: text, date: dateString });
            }
        };

        addReference("1. Teacher's Guide pages", editorData.resources.teacherGuide[day]);
        addReference("2. Learner's Materials' pages", editorData.resources.learnerMaterials[day]);
        addReference("3. Textbook pages", editorData.resources.textbookPages[day]);
        addReference("4. Additional Materials from Learning Resource Portal", editorData.resources.additionalMaterials[day]);
        addReference("5. Other References", editorData.resources.otherReferences[day]);
    });

    return payload;
};

// FIX FOR THE WEEKLY BUG: Forces the local UI to mimic the database perfectly so you don't need to refresh!
export const rebuildDllLocalState = (editorData: any, dbPayload: any) => {
    const rebuiltData = JSON.parse(JSON.stringify(editorData));
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

    days.forEach((day, index) => {
        const dbEntry = dbPayload.dailyEntries[index];
        // Spread the Monday data across all 5 days locally to match DB behavior
        rebuiltData.objectives.contentStandards[day] = dbEntry.content_standard;
        rebuiltData.objectives.performanceStandards[day] = dbEntry.performance_standard;
        rebuiltData.procedures.D[day] = dbEntry.discussion_proper;
        rebuiltData.procedures.E[day] = '';
    });

    // Turn off UI toggles so the viewer renders 5 full columns immediately
    rebuiltData.toggles.isCsWeekly = false;
    rebuiltData.toggles.isPsWeekly = false;

    return rebuiltData;
};