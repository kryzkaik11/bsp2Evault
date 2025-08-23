
import { AppFile, Folder, Collection, FileType, FileStatus, Visibility, Role, UserProfile } from '../types';
import { ONBOARDING_SAMPLE_FILES } from '../pages/constants';

export const MOCK_USER_ID = 'mock-user-123';

export const MOCK_PROFILE: UserProfile = {
    id: MOCK_USER_ID,
    display_name: 'Demo User',
    role: Role.Student,
    settings: { sidebar_collapsed: false }
};

export const MOCK_FOLDERS: Folder[] = [
    {
        id: 'folder-1',
        owner_id: MOCK_USER_ID,
        title: 'PSYCH101 - Intro to Psychology',
        parent_id: null,
        visibility: Visibility.Private,
        path: [],
        created_at: new Date('2023-10-01T10:00:00Z'),
        updated_at: new Date('2023-10-01T10:00:00Z')
    },
    {
        id: 'folder-2',
        owner_id: MOCK_USER_ID,
        title: 'CS101 - Computer Science',
        parent_id: null,
        visibility: Visibility.Private,
        path: [],
        created_at: new Date('2023-10-02T11:00:00Z'),
        updated_at: new Date('2023-10-02T11:00:00Z')
    },
    {
        id: 'folder-3',
        owner_id: MOCK_USER_ID,
        title: 'Lecture Slides',
        parent_id: 'folder-1',
        visibility: Visibility.Private,
        path: ['folder-1'],
        created_at: new Date('2023-10-03T12:00:00Z'),
        updated_at: new Date('2023-10-03T12:00:00Z')
    },
];

export const MOCK_SHARED_FOLDERS: Folder[] = [
    {
        id: 'shared-folder-1',
        owner_id: 'admin-user-id',
        title: 'Course Materials - AI101',
        parent_id: null,
        visibility: Visibility.Shared,
        path: [],
        created_at: new Date('2023-09-15T09:00:00Z'),
        updated_at: new Date('2023-09-15T09:00:00Z'),
    }
]

export const MOCK_FILES: AppFile[] = [
    {
        id: 'file-3',
        owner_id: MOCK_USER_ID,
        folder_id: null,
        title: 'AI Ethics Paper Draft.docx',
        type: FileType.DOCX,
        size: 1.2 * 1024 * 1024,
        status: FileStatus.Ready,
        progress: 100,
        visibility: Visibility.Private,
        collection_ids: ['collection-1'],
        tags: ['ai', 'ethics', 'draft'],
        created_at: new Date('2023-10-10T09:30:00Z'),
        updated_at: new Date('2023-10-10T09:30:00Z'),
    },
    {
        id: 'file-1',
        owner_id: MOCK_USER_ID,
        folder_id: 'folder-3',
        title: 'Weeks 2-3 Introduction to Ethics.pptx',
        type: FileType.PPTX,
        size: 5 * 1024 * 1024,
        status: FileStatus.Ready,
        progress: 100,
        visibility: Visibility.Private,
        collection_ids: ['collection-1'],
        tags: ['ethics', 'philosophy', 'slides'],
        created_at: new Date('2023-10-05T14:00:00Z'),
        updated_at: new Date('2023-10-05T14:00:00Z'),
        meta: { course_code: 'PSYCH101' },
    },
    {
        id: 'file-2',
        owner_id: MOCK_USER_ID,
        folder_id: 'folder-2',
        title: 'Lecture 1 - Variables.mp4',
        type: FileType.MP4,
        size: 150 * 1024 * 1024,
        status: FileStatus.Ready,
        progress: 100,
        visibility: Visibility.Private,
        collection_ids: [],
        tags: ['lecture', 'cs101', 'video'],
        created_at: new Date('2023-10-04T16:00:00Z'),
        updated_at: new Date('2023-10-04T16:00:00Z'),
        meta: { duration: 3600, course_code: 'CS101' },
    },
     ...ONBOARDING_SAMPLE_FILES.map(f => ({...f, owner_id: MOCK_USER_ID, id: crypto.randomUUID() })),
];

export const MOCK_SHARED_FILES: AppFile[] = [
    {
        id: 'shared-file-1',
        owner_id: 'admin-user-id',
        folder_id: 'shared-folder-1',
        title: 'Public Syllabus for AI101.pdf',
        type: FileType.PDF,
        size: 256 * 1024,
        status: FileStatus.Ready,
        progress: 100,
        visibility: Visibility.Shared,
        collection_ids: [],
        tags: ['syllabus', 'ai101', 'public'],
        created_at: new Date('2023-09-15T09:05:00Z'),
        updated_at: new Date('2023-09-15T09:05:00Z'),
        meta: { pages: 3 },
    },
]

export const MOCK_COLLECTIONS: Collection[] = [
    {
        id: 'collection-1',
        owner_id: MOCK_USER_ID,
        title: 'Ethics Research',
        visibility: Visibility.Private,
        file_ids: ['file-1', 'file-3'],
        created_at: new Date('2023-10-11T15:00:00Z'),
        updated_at: new Date('2023-10-11T15:00:00Z'),
    }
];

// Combine all for easier management in mockApi
export const ALL_MOCK_FILES = [...MOCK_FILES, ...MOCK_SHARED_FILES];
export const ALL_MOCK_FOLDERS = [...MOCK_FOLDERS, ...MOCK_SHARED_FOLDERS];
