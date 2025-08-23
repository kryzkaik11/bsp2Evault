
import { AppFile, Folder, Visibility, Collection, FileType, FileStatus, UserProfile, Role } from '../types';
import { User } from '@supabase/supabase-js';
import { MOCK_USER_ID, MOCK_PROFILE, ALL_MOCK_FILES, ALL_MOCK_FOLDERS, MOCK_COLLECTIONS } from './mockData';
import { ONBOARDING_SAMPLE_FILES } from '../pages/constants';

// In a real app, this would be a state management library. For this mock, we just manipulate the arrays in memory.
let files: AppFile[] = [...ALL_MOCK_FILES];
let folders: Folder[] = [...ALL_MOCK_FOLDERS];
let collections: Collection[] = [...MOCK_COLLECTIONS];

export const getProfileForUser = async (user: User): Promise<UserProfile | null> => {
    if (user.id === MOCK_USER_ID) {
        return MOCK_PROFILE;
    }
    return null;
}

export const getFolders = async (parentId: string | null): Promise<Folder[]> => {
  return folders.filter(f => f.parent_id === parentId && f.visibility !== Visibility.Shared);
};

export const getFiles = async (folderId: string | null): Promise<AppFile[]> => {
  return files.filter(f => f.folder_id === folderId && f.visibility !== Visibility.Shared);
};

export const getAllFiles = async (): Promise<AppFile[]> => {
    return files;
}

export const getSharedFolders = async (parentId: string | null): Promise<Folder[]> => {
    return folders.filter(f => f.parent_id === parentId && f.visibility === Visibility.Shared);
}

export const getSharedFiles = async (folderId: string | null): Promise<AppFile[]> => {
    return files.filter(f => f.folder_id === folderId && f.visibility === Visibility.Shared);
}

export const getFilesByIds = async (fileIds: string[]): Promise<AppFile[]> => {
  return files.filter(f => fileIds.includes(f.id));
}

export const getFolderPath = async (folderId: string | null): Promise<Folder[]> => {
    if (!folderId) return [];
    
    const path: Folder[] = [];
    let currentFolder = folders.find(f => f.id === folderId);

    while (currentFolder) {
        path.unshift(currentFolder);
        currentFolder = folders.find(f => f.id === currentFolder!.parent_id);
    }
    return path;
}

export const getAllFolders = async (): Promise<Folder[]> => {
    return folders;
}

export const addFile = async (file: File, ownerId: string, folderId: string | null): Promise<AppFile> => {
    const newFile: AppFile = {
        id: crypto.randomUUID(),
        owner_id: ownerId,
        folder_id: folderId,
        title: file.name,
        type: (file.name.split('.').pop() || 'txt') as FileType,
        size: file.size,
        status: FileStatus.Ready,
        progress: 100,
        visibility: Visibility.Private,
        collection_ids: [],
        tags: ['newly uploaded'],
        created_at: new Date(),
        updated_at: new Date(),
        meta: {
            storage_path: `mock/${ownerId}/${file.name}`
        },
    };
    files.unshift(newFile);
    return newFile;
};

export const updateFileInApi = async (updatedFile: AppFile): Promise<AppFile> => {
    const index = files.findIndex(f => f.id === updatedFile.id);
    if (index !== -1) {
        files[index] = updatedFile;
    }
    return updatedFile;
}

export const publishFiles = async (fileIds: string[]): Promise<AppFile[]> => {
    const updatedFiles: AppFile[] = [];
    files.forEach(file => {
        if (fileIds.includes(file.id)) {
            file.visibility = Visibility.Shared;
            file.updated_at = new Date();
            updatedFiles.push(file);
        }
    });
    return updatedFiles;
}

export const createFolder = async (title: string, parentId: string | null, ownerId: string): Promise<Folder> => {
    const parentFolder = folders.find(f => f.id === parentId);

    const newFolder: Folder = {
        id: `folder-${Date.now()}`,
        owner_id: ownerId,
        title,
        parent_id: parentId,
        visibility: parentFolder ? parentFolder.visibility : Visibility.Private,
        path: parentFolder ? [...parentFolder.path, parentId!] : [],
        created_at: new Date(),
        updated_at: new Date()
    };
    folders.unshift(newFolder);
    return newFolder;
}

export const getCollections = async (): Promise<Collection[]> => {
    return collections;
}

export const getFileContent = async (fileId: string): Promise<string> => {
    const file = files.find(f => f.id === fileId);
    if (!file) return "File content not found.";

    if (file.title.includes('Weeks-2-3-Introduction-to-Ethics')) {
        return `
        Introduction to Ethics: Weeks 2-3 Overview
        - Consequentialism: Morality judged by consequences (Utilitarianism).
        - Deontology: Morality based on rules/duties (Kant's Categorical Imperative).
        - Virtue Ethics (Aristotle): Focuses on the character of the moral agent.
        `;
    }
    if (file.title.includes('AI Ethics Paper')) {
        return `
        AI Ethics Review: Key areas are bias in algorithms, accountability, transparency (the "black box" problem), and job displacement. AI systems can amplify societal biases present in training data.
        `;
    }
    if (file.title.includes('Lecture 1 - Variables')) {
        return `
        CS101 - Lecture 1 Transcript: Variables are containers in memory. You declare them with a name (e.g., 'let score = 0;'). Common types are integers (numbers), strings (text), and booleans (true/false).
        `;
    }
     if (file.title.includes('Public Syllabus for AI101')) {
        return `
        AI101: Intro to AI. Covers search, knowledge representation, machine learning. Graded on assignments (40%), midterm (25%), final (30%), participation (5%).
        `;
    }
    if (file.title.includes('Sample Lecture Video')) {
        return `
        Transcript: Intro to Psychology - Major schools of thought.
        1. Structuralism (Wundt): Breaking down mental processes. Method: introspection.
        2. Functionalism (James): Purpose of consciousness and behavior.
        3. Psychoanalysis (Freud): Influence of the unconscious mind (id, ego, superego).
        `;
    }
    if (file.title.includes('Research Paper Sample')) {
        return `
        Abstract: Sleep is critical for learning and memory consolidation. It stabilizes new memories and integrates new information. This involves a dialogue between the hippocampus and neocortex during SWS and REM sleep.
        `;
    }

    return "The content for this file could not be retrieved or is not available for preview in demo mode.";
};

export const deleteItems = async (fileIds: string[], folderIds: string[]): Promise<void> => {
    files = files.filter(f => !fileIds.includes(f.id));
    folders = folders.filter(f => !folderIds.includes(f.id));
    return Promise.resolve();
};

export const addSampleFiles = async (userId: string): Promise<void> => {
    const samplesToAdd = ONBOARDING_SAMPLE_FILES.map(sample => ({
        ...sample,
        id: crypto.randomUUID(),
        owner_id: userId,
    }));
    files.unshift(...samplesToAdd);
    return Promise.resolve();
};
