

export enum Role {
  Admin = 'Admin',
  Student = 'Student',
  Guest = 'Guest',
}

export interface UserProfile {
  id: string; // This is the user's UUID from Supabase auth
  display_name?: string;
  role: Role;
  settings?: {
    sidebar_collapsed?: boolean;
  };
}

export enum FileType {
  PDF = 'pdf',
  DOCX = 'docx',
  PPTX = 'pptx',
  TXT = 'txt',
  PNG = 'png',
  JPG = 'jpg',
  MP3 = 'mp3',
  WAV = 'wav',
  M4A = 'm4a',
  MP4 = 'mp4',
  MOV = 'mov',
}

export enum FileStatus {
  Idle = 'idle',
  Uploading = 'uploading',
  Scanning = 'scanning',
  Processing = 'processing',
  Ready = 'ready',
  Error = 'error',
  Quarantined = 'quarantined',
}

export enum Visibility {
  Private = 'private',
  Shared = 'shared',
}

export interface Folder {
  id: string;
  owner_id: string;
  title: string;
  parent_id: string | null;
  visibility: Visibility;
  path: string[];
  created_at: Date;
  updated_at: Date;
}

export interface AppFile {
  id:string;
  owner_id: string;
  folder_id: string | null;
  title: string;
  type: FileType;
  size: number; // in bytes
  status: FileStatus;
  progress: number; // 0-100
  visibility: Visibility;
  collection_ids: string[];
  tags: string[];
  created_at: Date;
  updated_at: Date;
  meta?: {
    pages?: number;
    duration?: number; // in seconds
    authors?: string[];
    course_code?: string;
    storage_path?: string;
  };
  ai_content?: AnalysisContent;
}

export interface Collection {
  id: string;
  owner_id: string;
  title: string;
  visibility: Visibility;
  file_ids: string[];
  created_at: Date;
  updated_at: Date;
}

export interface Flashcard {
    question: string;
    answer: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface AnalysisContent {
    summary?: string;
    concepts?: string;
    questions?: string;
    flashcards?: Flashcard[];
    tags?: string[];
    conceptMap?: string;
    prosCons?: string;
    examples?: string;
    timeline?: string;
    chat_history?: ChatMessage[];
}