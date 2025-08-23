

import { supabase } from './supabase';
import { AppFile, Folder, Visibility, Collection, UserProfile, FileStatus, FileType, AnalysisContent } from '../types';
import { User } from '@supabase/supabase-js';
import { Database, Json } from './database.types';
import { ONBOARDING_SAMPLE_FILES } from '../pages/constants';
import * as mockApi from './mockApi';


// Helper to map a DB file row to an AppFile, handling type conversions
const toAppFile = (fileFromDb: Database['public']['Tables']['files']['Row']): AppFile => {
    return {
        ...fileFromDb,
        type: fileFromDb.type as FileType,
        status: fileFromDb.status as FileStatus,
        visibility: fileFromDb.visibility as Visibility,
        created_at: new Date(fileFromDb.created_at),
        updated_at: new Date(fileFromDb.updated_at),
        meta: fileFromDb.meta ? (fileFromDb.meta as AppFile['meta']) : undefined,
        ai_content: fileFromDb.ai_content ? (fileFromDb.ai_content as AnalysisContent) : undefined,
    };
};

export const getProfileForUser = async (user: User): Promise<UserProfile | null> => {
    // 1. Try to fetch the profile
    const { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('id, display_name, role, settings')
        .eq('id', user.id)
        .single();

    // 2. If profile exists, return it
    if (existingProfile) {
        return existingProfile as UserProfile;
    }

    // 3. If there was an error other than 'not found', log it and fail.
    if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
        console.error('Error fetching profile:', error);
        return null;
    }
    
    // 4. If profile was not found (PGRST116), it's a new user. Create a profile.
    console.log(`Profile not found for user ${user.id}. Creating a new profile.`);
    const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
            id: user.id,
            // Supabase populates user_metadata from the signUp call's options.
            display_name: user.user_metadata?.display_name || user.email,
            // All new users are 'Student' role by default.
            role: 'Student'
        })
        .select('id, display_name, role, settings')
        .single();

    if (insertError) {
        console.error('Error creating profile for new user:', insertError);
        return null;
    }

    return newProfile as UserProfile;
}

export const getFolders = async (parentId: string | null): Promise<Folder[]> => {
    let query = supabase
        .from('folders')
        .select('id, owner_id, title, parent_id, visibility, path, created_at, updated_at');

    if (parentId === null) {
        query = query.is('parent_id', null);
    } else {
        query = query.eq('parent_id', parentId);
    }
    
    const { data, error } = await query
        .neq('visibility', Visibility.Shared)
        .order('title', { ascending: true });
    
    if (error) throw error;
    return (data || []).map((f) => ({ ...f, visibility: f.visibility as Visibility, created_at: new Date(f.created_at), updated_at: new Date(f.updated_at) }));
};

export const getFiles = async (folderId: string | null): Promise<AppFile[]> => {
    let query = supabase
        .from('files')
        .select('id, owner_id, folder_id, title, type, size, status, progress, visibility, collection_ids, tags, created_at, updated_at, meta, ai_content');

    if (folderId === null) {
        query = query.is('folder_id', null);
    } else {
        query = query.eq('folder_id', folderId);
    }

    const { data, error } = await query
        .neq('visibility', Visibility.Shared)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(toAppFile);
};

export const getAllFiles = async (): Promise<AppFile[]> => {
    const { data, error } = await supabase.from('files').select('id, owner_id, folder_id, title, type, size, status, progress, visibility, collection_ids, tags, created_at, updated_at, meta, ai_content').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(toAppFile);
}

export const getSharedFolders = async (parentId: string | null): Promise<Folder[]> => {
    let query = supabase
        .from('folders')
        .select('id, owner_id, title, parent_id, visibility, path, created_at, updated_at');

    if (parentId === null) {
        query = query.is('parent_id', null);
    } else {
        query = query.eq('parent_id', parentId);
    }

    const { data, error } = await query
        .eq('visibility', Visibility.Shared)
        .order('title', { ascending: true });

    if (error) throw error;
    return (data || []).map((f) => ({ ...f, visibility: f.visibility as Visibility, created_at: new Date(f.created_at), updated_at: new Date(f.updated_at) }));
}

export const getSharedFiles = async (folderId: string | null): Promise<AppFile[]> => {
    let query = supabase
        .from('files')
        .select('id, owner_id, folder_id, title, type, size, status, progress, visibility, collection_ids, tags, created_at, updated_at, meta, ai_content');
    
    if (folderId === null) {
        query = query.is('folder_id', null);
    } else {
        query = query.eq('folder_id', folderId);
    }

    const { data, error } = await query
        .eq('visibility', Visibility.Shared)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(toAppFile);
}


export const getFilesByIds = async (fileIds: string[]): Promise<AppFile[]> => {
    if (!fileIds || fileIds.length === 0) return [];
    const { data, error } = await supabase
        .from('files')
        .select('id, owner_id, folder_id, title, type, size, status, progress, visibility, collection_ids, tags, created_at, updated_at, meta, ai_content')
        .in('id', fileIds);
    
    if (error) throw error;
    return (data || []).map(toAppFile);
}

export const getFolderPath = async (folderId: string | null): Promise<Folder[]> => {
    if (!folderId) return [];
    
    const { data, error } = await supabase.rpc('get_folder_path', {
        p_folder_id: folderId
    });

    if (error) {
        console.error("Error fetching folder path with RPC, using fallback:", error);
        const allFolders = await getAllFolders();
        const path: Folder[] = [];
        let currentFolder: Folder | undefined = allFolders.find(f => f.id === folderId);
        while(currentFolder) {
            path.unshift(currentFolder);
            currentFolder = allFolders.find(f => f.id === currentFolder!.parent_id);
        }
        return path;
    }

    return (Array.isArray(data) ? data : []).map((f) => ({...f, visibility: f.visibility as Visibility, created_at: new Date(f.created_at), updated_at: new Date(f.updated_at) }));
}

export const getAllFolders = async (): Promise<Folder[]> => {
    const { data, error } = await supabase.from('folders').select('id, owner_id, title, parent_id, visibility, path, created_at, updated_at');
    if (error) throw error;
    return (data || []).map((f) => ({ ...f, visibility: f.visibility as Visibility, created_at: new Date(f.created_at), updated_at: new Date(f.updated_at) }));
}

export const addFile = async (file: File, ownerId: string, folderId: string | null): Promise<AppFile> => {
    const fileId = crypto.randomUUID();
    const filePath = `${ownerId}/${fileId}/${file.name}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('academic vault')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
    }

    const newFileRecord: Database['public']['Tables']['files']['Insert'] = {
        id: fileId,
        owner_id: ownerId,
        folder_id: folderId,
        title: file.name,
        type: (file.name.split('.').pop() || 'txt') as Database['public']['Enums']['file_type'],
        size: file.size,
        status: 'ready',
        progress: 100,
        visibility: 'private',
        collection_ids: [],
        tags: [],
        meta: {
            storage_path: uploadData.path
        },
        ai_content: null,
    };

    const { data, error } = await supabase.from('files').insert([newFileRecord]).select();
    if (error) {
        console.error('Database insert error:', error);
        await supabase.storage.from('academic vault').remove([filePath]);
        throw error;
    }
     if (!data || data.length === 0) {
        await supabase.storage.from('academic vault').remove([filePath]);
        throw new Error("File record creation failed.");
    }
    return toAppFile(data[0]);
};

export const updateFileInApi = async (updatedFile: AppFile): Promise<AppFile> => {
    const dbPayload: Database['public']['Tables']['files']['Update'] = {
      title: updatedFile.title,
      tags: updatedFile.tags,
      visibility: updatedFile.visibility,
      status: updatedFile.status,
      progress: updatedFile.progress,
      collection_ids: updatedFile.collection_ids,
      meta: updatedFile.meta as Json,
      ai_content: updatedFile.ai_content as Json,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from('files')
        .update(dbPayload)
        .eq('id', updatedFile.id)
        .select('id, owner_id, folder_id, title, type, size, status, progress, visibility, collection_ids, tags, created_at, updated_at, meta, ai_content')
        .single();
        
    if (error) throw error;
    return toAppFile(data);
}

export const publishFiles = async (fileIds: string[]): Promise<AppFile[]> => {
    const { data, error } = await supabase
        .from('files')
        .update({ visibility: 'shared', updated_at: new Date().toISOString() })
        .in('id', fileIds)
        .select('id, owner_id, folder_id, title, type, size, status, progress, visibility, collection_ids, tags, created_at, updated_at, meta, ai_content');

    if (error) throw error;
    return (data || []).map(toAppFile);
}

export const createFolder = async (title: string, parentId: string | null, ownerId: string): Promise<Folder> => {
    let parentFolder: { visibility: "private" | "shared"; path: string[]; } | null = null;
    if (parentId) {
        const { data, error } = await supabase.from('folders').select('visibility, path').eq('id', parentId).single();
        if (error) throw error;
        parentFolder = data;
    }

    const newFolderData: Database['public']['Tables']['folders']['Insert'] = {
        id: crypto.randomUUID(),
        owner_id: ownerId,
        title,
        parent_id: parentId,
        visibility: parentFolder ? parentFolder.visibility : 'private',
        path: parentFolder ? [...parentFolder.path, parentId!] : [],
    };
    
    const { data, error } = await supabase
        .from('folders')
        .insert([newFolderData])
        .select('id, owner_id, title, parent_id, visibility, path, created_at, updated_at');

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Folder creation failed.");
    
    const newFolder = data[0];
    return { ...newFolder, visibility: newFolder.visibility as Visibility, created_at: new Date(newFolder.created_at), updated_at: new Date(newFolder.updated_at) };
}

export const getCollections = async (): Promise<Collection[]> => {
    const { data, error } = await supabase.from('collections').select('id, owner_id, title, visibility, file_ids, created_at, updated_at');
    if (error) throw error;
    return (data || []).map((c) => ({ ...c, visibility: c.visibility as Visibility, created_at: new Date(c.created_at), updated_at: new Date(c.updated_at) }));
}

export const getFileContent = async (file: AppFile): Promise<string> => {
    // 1. Check for real file in storage
    if (file.meta?.storage_path) {
        const { data: blob, error } = await supabase.storage
            .from('academic vault')
            .download(file.meta.storage_path);

        if (error) {
            console.error("Error downloading file content:", error);
            throw error;
        }
        
        try {
            return await blob.text();
        } catch (e) {
             return `Could not read content from file: ${file.title}. It may be a binary file.`;
        }
    }

    // 2. Fallback to mock content for sample files if storage path is missing
    return mockApi.getFileContent(file.id);
};

export const deleteItems = async (fileIds: string[], folderIds: string[]) => {
    if (fileIds.length > 0) {
        const { data: filesToDelete, error: selectError } = await supabase
            .from('files')
            .select('meta')
            .in('id', fileIds);

        if (selectError) throw selectError;

        const paths = filesToDelete
            .map((f: any) => (f.meta as { storage_path?: string })?.storage_path)
            .filter((p): p is string => !!p);

        if (paths.length > 0) {
            const { error: storageError } = await supabase.storage.from('academic vault').remove(paths);
            if (storageError) throw storageError;
        }

        const { error: deleteFilesError } = await supabase.from('files').delete().in('id', fileIds);
        if (deleteFilesError) throw deleteFilesError;
    }

    if (folderIds.length > 0) {
        const { error: deleteFoldersError } = await supabase.from('folders').delete().in('id', folderIds);
        if (deleteFoldersError) throw deleteFoldersError;
    }
};

export const addSampleFiles = async (userId: string) => {
    const sampleFileRecords: Database['public']['Tables']['files']['Insert'][] = ONBOARDING_SAMPLE_FILES.map(sampleFile => {
        return {
            id: crypto.randomUUID(),
            owner_id: userId,
            folder_id: sampleFile.folder_id,
            title: sampleFile.title,
            type: sampleFile.type as Database['public']['Enums']['file_type'],
            size: sampleFile.size,
            status: sampleFile.status as Database['public']['Enums']['file_status'],
            progress: sampleFile.progress,
            visibility: sampleFile.visibility as Database['public']['Enums']['visibility'],
            collection_ids: sampleFile.collection_ids,
            tags: sampleFile.tags,
            meta: sampleFile.meta as Json,
            ai_content: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    });

    const { error } = await supabase.from('files').insert(sampleFileRecords);

    if (error) {
        console.error('Error adding sample files:', error);
        throw error;
    }
};
