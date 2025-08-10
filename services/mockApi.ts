

import { AppFile, Folder, Visibility, Collection, FileType } from '../types';

// MOCK_FILES, MOCK_FOLDERS, MOCK_COLLECTIONS are not exported from constants.ts anymore.
// Defining them as empty arrays here so the mock API can function without crashing.
const MOCK_FILES: AppFile[] = [];
const MOCK_FOLDERS: Folder[] = [];
const MOCK_COLLECTIONS: Collection[] = [];


// In a real app, this would be a state management library like Redux, Zustand, or React Query
// For this mock, we'll just manipulate the arrays in memory.
let files: AppFile[] = [...MOCK_FILES];
let folders: Folder[] = [...MOCK_FOLDERS];
let collections: Collection[] = [...MOCK_COLLECTIONS];

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

export const getRootFolders = async (): Promise<Folder[]> => {
    return folders.filter(f => f.parent_id === null);
}

export const getAllFolders = async (): Promise<Folder[]> => {
    return folders;
}

export const addFile = async (file: AppFile): Promise<AppFile> => {
  files.push(file);
  return file;
};

export const updateFileInApi = async (updatedFile: AppFile): Promise<AppFile> => {
    const index = files.findIndex(f => f.id === updatedFile.id);
    if (index !== -1) {
        files[index] = updatedFile;
    }
    return updatedFile;
}

export const publishFile = async (fileId: string): Promise<AppFile | undefined> => {
    const index = files.findIndex(f => f.id === fileId);
    if (index !== -1) {
        files[index].visibility = Visibility.Shared;
        files[index].updated_at = new Date();
        return files[index];
    }
    return undefined;
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
    folders.push(newFolder);
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
    if (file.id.startsWith('sample-1')) { // Sample Lecture Video
        return `
        Transcript: Introduction to Psychology - Sample Lecture

        (00:10) Professor: Hello everyone, and welcome to Introduction to Psychology. In this course, we're going to explore the fascinating world of the human mind and behavior. What makes us tick? Why do we think and feel the way we do?

        (01:15) Professor: Today, we'll start with the major schools of thought. First, we have Structuralism, pioneered by Wilhelm Wundt, which focused on breaking down mental processes into the most basic components. They used a method called introspection.

        (03:45) Professor: Then came Functionalism, influenced by Charles Darwin. Functionalists like William James were more interested in the purpose of consciousness and behavior. They asked 'what do people do, and why do they do it?'

        (05:20) Professor: We'll also touch on Psychoanalysis, Sigmund Freud's theory, which emphasizes the influence of the unconscious mind on behavior. This is where concepts like the id, ego, and superego come from.
        `;
    }
    if (file.id.startsWith('sample-2')) { // Sample Research Paper
        return `
        The Impact of Sleep on Memory Consolidation and Learning

        Abstract:
        This paper reviews the critical role of sleep in learning and memory consolidation. While the functions of sleep are multifaceted, a growing body of evidence suggests that sleep is essential for stabilizing new memories, abstracting general rules from specific experiences, and integrating new information with pre-existing knowledge networks. We explore the neurophysiological mechanisms underlying these processes, focusing on the dialogue between the hippocampus and neocortex during different sleep stages.

        Introduction:
        For centuries, the purpose of sleep was a mystery. Today, we understand it as a dynamic period of brain activity crucial for cognitive function. One of its most important roles is in memory processing. When we learn something new, the memory is initially fragile. Sleep, particularly Slow-Wave Sleep (SWS) and Rapid Eye Movement (REM) sleep, helps to solidify this memory, making it robust and long-lasting. This process is known as consolidation.
        `;
    }

    // Fallback for any other file
    return "The content for this file could not be retrieved or is not available for preview.";
};
