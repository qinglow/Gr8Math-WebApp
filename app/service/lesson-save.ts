import { saveLessonWithNotifications } from '@/app/service/lesson';
import { uploadLessonMediaToTigris } from '@/app/service/upload';
import { updateLesson } from '@/app/service/lesson';

interface SaveLessonParams {
    courseId: string;
    lessonContent: string;
    pendingMedia: { id: string; file: File; localUrl: string }[];
    isEditingLesson: boolean;
    editingLessonId: number | null;
    weekNumber: string;
    lessonTitle: string;
}

export async function handleLessonSave({
    courseId,
    lessonContent,
    pendingMedia,
    isEditingLesson,
    editingLessonId,
    weekNumber,
    lessonTitle
}: SaveLessonParams) {
    let finalHtmlContent = lessonContent;
    const parsedCourseId = parseInt(courseId, 10);

    if (pendingMedia && pendingMedia.length > 0) {
        for (const media of pendingMedia) {
            // FIX 1: Check by media.id instead of localUrl. This is 100% bulletproof.
            if (finalHtmlContent.includes(media.id)) {
                const formData = new FormData();
                formData.append('file', media.file);
                formData.append('courseId', courseId);

                const response = await uploadLessonMediaToTigris(formData);
                if (!response.success) throw new Error(response.error);

                const publicUrl = response.publicUrl;

                let finalTag = '';
                if (media.file.type.startsWith('image/')) {
                    finalTag = `<div id="${media.id}" align="center"><img src="${publicUrl}" width="100%" style="max-width: 800px; border-radius: 8px;" /></div>`;
                } else if (media.file.type.startsWith('video/')) {
                    // FIX 2: Use the native video player for the final save
                    finalTag = `<div id="${media.id}" align="center"><video src="${publicUrl}" width="100%" style="max-width: 800px; border-radius: 8px;" controls></video></div>`;
                } else if (media.file.type === 'application/pdf') {
                    // FIX 3: Render the PDF in an inline viewer for the final save
                    finalTag = `<div id="${media.id}" align="center" style="width: 100%; max-width: 800px; height: 600px; margin: 0 auto; border: 2px solid #D1D8DD; border-radius: 8px; overflow: hidden;"><iframe src="${publicUrl}" width="100%" height="100%" frameborder="0"></iframe></div>`;
                } else {
                    finalTag = `<div id="${media.id}" align="center"><a href="${publicUrl}" target="_blank" style="color: #1A4C8B; font-weight: bold;">📄 Attached File: ${media.file.name}</a></div>`;
                }

                const regex = new RegExp(`<div id="${media.id}"[^>]*>[\\s\\S]*?<\\/div>`, 'g');
                finalHtmlContent = finalHtmlContent.replace(regex, finalTag);
            } else {
                const ghostRegex = new RegExp(`<div id="${media.id}"[^>]*>[\\s\\S]*?<\\/div>`, 'g');
                finalHtmlContent = finalHtmlContent.replace(ghostRegex, '');
            }
        }
    }

    const cleanPreview = finalHtmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 100) + '...';

    if (isEditingLesson && editingLessonId) {
        try {
            const updatedData = await updateLesson(
                editingLessonId,
                parseInt(weekNumber),
                lessonTitle,
                finalHtmlContent
            );

            return {
                success: true,
                isEdit: true,
                message: 'Lesson updated!',
                lesson: {
                    ...updatedData,
                    preview: cleanPreview
                }
            };
        } catch (dbError: any) {
            throw new Error(`Database Update Failed: ${dbError.message}`);
        }
    } else {
        const response = await saveLessonWithNotifications(
            parsedCourseId,
            parseInt(weekNumber),
            lessonTitle,
            finalHtmlContent
        );

        if (response.success && response.lesson) {
            return {
                success: true,
                isEdit: false,
                message: 'Lesson posted!',
                lesson: {
                    type: 'lesson',
                    id: response.lesson.id,
                    week_number: response.lesson.week_number,
                    lesson_title: response.lesson.lesson_title,
                    lesson_content: response.lesson.lesson_content,
                    preview: cleanPreview
                }
            };
        } else {
            throw new Error('Failed to post lesson to database.');
        }
    }
}

