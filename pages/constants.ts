import { AppFile, FileStatus, FileType, Visibility } from '../types';

export const ONBOARDING_SAMPLE_FILES: AppFile[] = [
    {
        id: 'sample-1',
        owner_id: 'new-user', // ownerId will be replaced with actual user's id
        folder_id: null,
        title: 'Sample Lecture Video - Intro to Psychology.mp4',
        type: FileType.MP4,
        size: 128 * 1024 * 1024,
        status: FileStatus.Ready,
        progress: 100,
        visibility: Visibility.Private,
        collection_ids: [],
        tags: ['sample', 'lecture', 'psychology'],
        created_at: new Date(),
        updated_at: new Date(),
        meta: { duration: 2700, course_code: 'DEMO101' },
    },
    {
        id: 'sample-2',
        owner_id: 'new-user',
        folder_id: null,
        title: 'Research Paper Sample - The Impact of Sleep on Learning.pdf',
        type: FileType.PDF,
        size: 3 * 1024 * 1024,
        status: FileStatus.Ready,
        progress: 100,
        visibility: Visibility.Private,
        collection_ids: [],
        tags: ['sample', 'research', 'learning'],
        created_at: new Date(),
        updated_at: new Date(),
        meta: { pages: 15 },
    },
];
