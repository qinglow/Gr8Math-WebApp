export const ROLES = {
  STUDENT: 'Student', 
  TEACHER: 'Teacher', 
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];



/**
 * Data options for the Teacher registration step.
 */
export const TEACHING_POSITIONS = [
  'Teacher I',
  'Teacher II',
  'Teacher III',
  'Teacher IV',
  'Teacher V',
  'Teacher VI',
  'Teacher VII',
  'Master Teacher I',
  'Master Teacher II',
  'Master Teacher III',
  'Master Teacher IV',
  'Master Teacher V',
] as const;

/**
 * Data options for the Student registration step.
 */
export const GENDER_OPTIONS = ['Male', 'Female'] as const;

export const ROLE_CONFIGS = {
  [ROLES.STUDENT]: {
    title: 'Student',
    extraLabel: 'Learner Reference Number',
    extraType: 'text' as const,
    options: [], 
  },
  [ROLES.TEACHER]: {
    title: 'Teacher',
    extraLabel: 'Teaching Position',
    extraType: 'select' as const,
    options: [...TEACHING_POSITIONS],
  },
} as const;