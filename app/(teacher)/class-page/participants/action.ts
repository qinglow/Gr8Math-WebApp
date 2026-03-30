'use server';

import { getStudentsFromDb, getStudentScoresFromDb } from '@/app/service/participants';

export async function fetchParticipantsAction(courseId: string) {
    try {
        const cId = parseInt(courseId);
        
        // 1. Get the students
        const students = await getStudentsFromDb(cId);

        // 2. Get scores for every student
        const participantsWithScores = await Promise.all(students.map(async (s) => {
            const scores = await getStudentScoresFromDb(cId, s.id);
            const totalScore = scores.reduce((sum, entry) => sum + Number(entry.score), 0);
            
            return {
                ...s,
                totalScore,
                reportData: scores
            };
        }));

        // 3. Sort by total score (Highest to Lowest)
        participantsWithScores.sort((a, b) => b.totalScore - a.totalScore);

        // 4. Update the rank based on score
        const finalRanked = participantsWithScores.map((s, i) => ({
            ...s,
            rank: i + 1
        }));

        return { success: true, data: { participants: finalRanked } };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}