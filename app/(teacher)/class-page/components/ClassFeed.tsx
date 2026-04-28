import { LessonCard } from '@/components/card/LessonCard';
import { AssessmentCard } from '@/components/card/AssessmentCard';
import { ClassContentItem } from '../class-page-client';

interface ClassFeedProps {
    courseContent: ClassContentItem[];
    onEdit: (item: ClassContentItem) => void;
    onSeeMore: (item: ClassContentItem) => void;
    onDelete: (item: ClassContentItem) => void;
}

export function ClassFeed({ courseContent, onEdit, onSeeMore, onDelete }: ClassFeedProps) {
    if (courseContent.length === 0) return <EmptyState />;

    return (
        <div className="flex flex-col gap-y-6">
            {courseContent.map((item: ClassContentItem) => (
                item.type === 'lesson' ? (
                    <LessonCard
                        key={`lesson-${item.id}`}
                        week={`Week ${item.week_number}`}
                        title={item.lesson_title || 'Untitled'}
                        description={item.preview || ''}
                        onEdit={() => onEdit(item)}
                        onSeeMore={() => onSeeMore(item)}
                        onDelete={() => onDelete(item)}
                    />
                ) : (
                    <AssessmentCard
                        key={`assessment-${item.id}`}
                        title={`Assesssment ${item.assessment_number}` || 'Assessment'}
                        onEdit={() => onEdit(item)}
                        onDelete={() => onDelete(item)}
                    />
                )
            ))}
        </div>
    );
}

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-white/40 border-2 border-dashed border-[#B0B8C1] rounded-3xl p-10 md:p-16 max-w-md">
            <h2 className="text-[20px] font-black text-[#222] mb-3 uppercase">No content yet.</h2>
            <p className="text-[14px] text-[#666]">
                Tap <span className="font-black text-[#1A4C8B]">'Add'</span> to create your first lesson or assessment.
            </p>
        </div>
    </div>
);