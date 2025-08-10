import { supabase } from './supabase';
import { AppFile, Folder, Visibility, Collection, UserProfile, FileStatus, FileType, AnalysisContent } from '../types';
import { User } from '@supabase/supabase-js';
import { Database, Json } from './database.types';
import { ONBOARDING_SAMPLE_FILES } from '../pages/constants';

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
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching profile:', error);
        return null;
    }
    return data as UserProfile | null;
}

export const getFolders = async (parentId: string | null): Promise<Folder[]> => {
  let query = supabase
    .from('folders')
    .select('*');

  if (parentId === null) {
    query = query.is('parent_id', null);
  } else {
    query = query.eq('parent_id', parentId);
  }
    
  const { data, error } = await query
    .neq('visibility', Visibility.Shared)
    .order('title', { ascending: true });
    
  if (error) throw error;
  return (data || []).map(f => ({ ...f, created_at: new Date(f.created_at), updated_at: new Date(f.updated_at) }));
};

export const getFiles = async (folderId: string | null): Promise<AppFile[]> => {
  let query = supabase
    .from('files')
    .select('*');

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
    const { data, error } = await supabase.from('files').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(toAppFile);
}

export const getSharedFolders = async (parentId: string | null): Promise<Folder[]> => {
    let query = supabase
        .from('folders')
        .select('*');

    if (parentId === null) {
        query = query.is('parent_id', null);
    } else {
        query = query.eq('parent_id', parentId);
    }

    const { data, error } = await query
        .eq('visibility', Visibility.Shared)
        .order('title', { ascending: true });

    if (error) throw error;
    return (data || []).map(f => ({ ...f, created_at: new Date(f.created_at), updated_at: new Date(f.updated_at) }));
}

export const getSharedFiles = async (folderId: string | null): Promise<AppFile[]> => {
    let query = supabase
        .from('files')
        .select('*');
    
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
    .select('*')
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
        // Fallback for local dev if RPC not set up
        const allFolders = await getAllFolders();
        const path: Folder[] = [];
        let currentFolder = allFolders.find(f => f.id === folderId);
        while(currentFolder) {
            path.unshift(currentFolder);
            currentFolder = allFolders.find(f => f.id === currentFolder!.parent_id);
        }
        return path.map(f => ({...f, created_at: new Date(f.created_at), updated_at: new Date(f.updated_at) }));
    }

    return (data || []).map(f => ({...f, created_at: new Date(f.created_at), updated_at: new Date(f.updated_at) }));
}

export const getAllFolders = async (): Promise<Folder[]> => {
    const { data, error } = await supabase.from('folders').select('*');
    if (error) throw error;
    return (data || []).map(f => ({ ...f, created_at: new Date(f.created_at), updated_at: new Date(f.updated_at) }));
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
        status: 'ready', // Reverted from 'processing' to support manual generation
        progress: 100, // Reverted from 50
        visibility: 'private',
        collection_ids: [],
        tags: [],
        meta: {
            storage_path: uploadData.path
        },
        ai_content: null,
    };

    const { data, error } = await supabase.from('files').insert([newFileRecord]).select().single();
    if (error) {
        console.error('Database insert error:', error);
        await supabase.storage.from('academic vault').remove([filePath]);
        throw error;
    }
    return toAppFile(data);
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
        .select()
        .single();
        
    if (error) throw error;
    return toAppFile(data);
}

export const publishFiles = async (fileIds: string[]): Promise<AppFile[]> => {
    const { data, error } = await supabase
        .from('files')
        .update({ visibility: 'shared', updated_at: new Date().toISOString() })
        .in('id', fileIds)
        .select();

    if (error) throw error;
    return (data || []).map(toAppFile);
}

export const createFolder = async (title: string, parentId: string | null, ownerId: string): Promise<Folder> => {
    let parentFolder: Pick<Folder, 'visibility' | 'path'> | null = null;
    if (parentId) {
        const { data, error } = await supabase.from('folders').select('visibility, path').eq('id', parentId).single();
        if (error) throw error;
        parentFolder = data as any;
    }

    const newFolderData: Database['public']['Tables']['folders']['Insert'] = {
        id: crypto.randomUUID(),
        owner_id: ownerId,
        title,
        parent_id: parentId,
        visibility: parentFolder ? (parentFolder.visibility as any) : 'private',
        path: parentFolder ? [...parentFolder.path, parentId!] : [],
    };
    
    const { data, error } = await supabase
        .from('folders')
        .insert([newFolderData])
        .select()
        .single();

    if (error) throw error;
    return { ...data, created_at: new Date(data.created_at), updated_at: new Date(data.updated_at) };
}

export const getCollections = async (): Promise<Collection[]> => {
    const { data, error } = await supabase.from('collections').select('*');
    if (error) throw error;
    return (data || []).map(c => ({ ...c, created_at: new Date(c.created_at), updated_at: new Date(c.updated_at) }));
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
        
        // For simplicity in this version, we will try to read all files as text.
        // In a real app, you would use libraries like pdf-lib, mammoth.js etc. for parsing.
        try {
            return await blob.text();
        } catch (e) {
             return `Could not read content from file: ${file.title}. It may be a binary file.`;
        }
    }

    // 2. Fallback to mock content for demo/sample files
    if (file.title.includes('Weeks-2-3-Introduction-to-Ethics')) {
        return `
        Introduction to Ethics: Weeks 2-3 Overview
        
        Week 2: Major Ethical Theories
        This week, we will explore the foundational theories of normative ethics.
        - Consequentialism: The morality of an action is judged solely by its consequences.
            - Utilitarianism (Bentham, Mill): Focuses on the greatest good for the greatest number. We will differentiate between Act and Rule Utilitarianism.
        - Deontology: Morality is based on adherence to rules or duties. Certain actions are inherently right or wrong, regardless of their outcomes.
            - Kant's Categorical Imperative: Act only according to that maxim whereby you can at the same time will that it should become a universal law.
        - Virtue Ethics (Aristotle): Focuses on the character of the moral agent rather than the actions themselves. It asks "What is a good person?" or "What makes for a virtuous life?".
        
        Week 3: Applied Ethics Case Studies
        This week, we apply the theories learned in Week 2 to real-world moral problems.
        - Case Study 1: Medical Ethics - Euthanasia. We will analyze this issue from utilitarian, deontological, and virtue ethics perspectives.
        - Case Study 2: Business Ethics - Whistleblowing. Is there a duty to report wrongdoing, even at great personal cost?
        - Case Study 3: Environmental Ethics - Climate Change. What responsibilities do individuals and corporations have towards the planet?
        
        Reading for Week 2: Rachels, "The Elements of Moral Philosophy", Chapters 7-10.
        Reading for Week 3: Selected articles on Canvas.
        
        Assignment Due: Short paper analyzing one of the case studies from a chosen ethical framework.
        `;
    }
    if (file.title.includes('AI Ethics Paper')) {
        return `
        AI Ethics Comprehensive Review
        
        Introduction:
        This paper delves into the ethical considerations surrounding the development and deployment of artificial intelligence. Key areas of focus include bias in algorithms, accountability, transparency (the "black box" problem), and the potential for job displacement.
        
        Bias in Algorithms:
        AI systems learn from data. If that data reflects existing societal biases, the AI will perpetuate and even amplify them. For example, facial recognition systems have shown lower accuracy for women and people of color.
        
        Accountability:
        When an AI system makes a critical error (e.g., in a self-driving car or medical diagnosis), who is responsible? The programmer, the user, the manufacturer? Establishing clear lines of accountability is a major challenge.
        
        The Black Box Problem:
        Many advanced AI models, like deep neural networks, are "black boxes." We know they work, but we don't fully understand their internal decision-making processes. This lack of transparency is problematic for systems where explainability is crucial.
        `;
    }
    if (file.title.includes('Lecture 1 - Variables')) {
        return `
        CS101 - Lecture 1 Transcript: Variables and Data Types
        
        (00:05) Instructor: Welcome to CS101. Today, we're starting with the absolute fundamentals: variables. Think of a variable as a container in your computer's memory where you can store a piece of information.
        
        (01:30) Instructor: To use a variable, you first have to declare it. This means you give it a name. For example, 'let score = 0;'. Here, 'score' is the name of our variable.
        
        (03:00) Instructor: Variables have types. The 'score' variable holds a number. We call this an 'integer'. Other common types are 'strings' for text, like 'let playerName = "Alice";', and 'booleans' for true/false values.
        `;
    }
     if (file.title.includes('Case Study on Moral Dilemmas')) {
        return `
        Case Study: The Trolley Problem
        
        This classic thought experiment in ethics presents a moral dilemma. A runaway trolley is about to kill five people tied to the main track. You are standing next to a lever that can switch the trolley to a side track, where there is only one person tied up. Do you pull the lever?
        
        Utilitarian Perspective:
        A utilitarian would argue that pulling the lever is the correct choice. Utilitarianism focuses on maximizing overall happiness and minimizing suffering. Saving five lives at the cost of one results in the best outcome for the greatest number of people.
        
        Deontological Perspective:
        A deontologist might argue against pulling the lever. Deontology emphasizes moral duties and rules. By pulling the lever, you are actively participating in causing someone's death, which could be seen as a violation of the moral rule "do not kill." In this view, the five deaths on the main track are a tragedy, but not one you directly caused.
        `;
    }
    if (file.title.includes('Uncategorized Notes')) {
        return "These are my uncategorized notes. I need to remember to buy milk and also review chapter 3 of the physics textbook. The main topics are thermodynamics and kinetic energy. Also, the project deadline is next Friday.";
    }
    if (file.title.includes('Public Syllabus for AI101')) {
        return `
        AI101: Introduction to Artificial Intelligence - Public Syllabus

        Course Description:
        This course provides a broad overview of the fundamental concepts and techniques in artificial intelligence. Topics include problem solving by search, knowledge representation, machine learning, and natural language processing.

        Instructor: Dr. Ada Lovelace
        Office Hours: By appointment

        Grading:
        - Assignments: 40%
        - Midterm Exam: 25%
        - Final Exam: 30%
        - Participation: 5%

        Week-by-week schedule:
        - Week 1: Introduction to AI, history, and agents.
        - Week 2: Problem Solving and Search Algorithms (BFS, DFS).
        - Week 3: Heuristic Search (A* Search).
        - Week 4: Logic and Knowledge Representation.
        - Week 5: Introduction to Machine Learning.
        `;
    }
    if (file.title.includes('Sample Lecture Video')) { // Sample Lecture Video
        return `
        Transcript: Introduction to Psychology - Sample Lecture

        (00:10) Professor: Hello everyone, and welcome to Introduction to Psychology. In this course, we're going to explore the fascinating world of the human mind and behavior. What makes us tick? Why do we think and feel the way we do?

        (01:15) Professor: Today, we'll start with the major schools of thought. First, we have Structuralism, pioneered by Wilhelm Wundt, which focused on breaking down mental processes into the most basic components. They used a method called introspection.

        (03:45) Professor: Then came Functionalism, influenced by Charles Darwin. Functionalists like William James were more interested in the purpose of consciousness and behavior. They asked 'what do people do, and why do they do it?'

        (05:20) Professor: We'll also touch on Psychoanalysis, Sigmund Freud's theory, which emphasizes the influence of the unconscious mind on behavior. This is where concepts like the id, ego, and superego come from.
        `;
    }
    if (file.title.includes('Research Paper Sample')) { // Sample Research Paper
        return `
        The Impact of Sleep on Memory Consolidation and Learning

        Abstract:
        This paper reviews the critical role of sleep in learning and memory consolidation. While the functions of sleep are multifaceted, a growing body of evidence suggests that sleep is essential for stabilizing new memories, abstracting general rules from specific experiences, and integrating new information with pre-existing knowledge networks. We explore the neurophysiological mechanisms underlying these processes, focusing on the dialogue between the hippocampus and neocortex during different sleep stages.

        Introduction:
        For centuries, the purpose of sleep was a mystery. Today, we understand it as a dynamic period of brain activity crucial for cognitive function. One of its most important roles is in memory processing. When we learn something new, the memory is initially fragile. Sleep, particularly Slow-Wave Sleep (SWS) and Rapid Eye Movement (REM) sleep, helps to solidify this memory, making it robust and long-lasting. This process is known as consolidation.
        `;
    }
    
    // 3. Final fallback
    return "File content preview is not implemented for this file. AI features will use mock content based on the file title.";
};

export const deleteItems = async (fileIds: string[], folderIds: string[]) => {
    // First, get storage paths for files to be deleted
    if (fileIds.length > 0) {
        const { data: filesToDelete, error: selectError } = await supabase
            .from('files')
            .select('meta')
            .in('id', fileIds);

        if (selectError) throw selectError;

        const paths = filesToDelete
            .map(f => (f.meta as { storage_path?: string })?.storage_path)
            .filter((p): p is string => !!p);

        if (paths.length > 0) {
            const { error: storageError } = await supabase.storage.from('academic vault').remove(paths);
            if (storageError) throw storageError;
        }

        // Delete from files table
        const { error: deleteFilesError } = await supabase.from('files').delete().in('id', fileIds);
        if (deleteFilesError) throw deleteFilesError;
    }

    // Then, delete folders
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
            type: sampleFile.type as any,
            size: sampleFile.size,
            status: sampleFile.status as any,
            progress: sampleFile.progress,
            visibility: sampleFile.visibility as any,
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
