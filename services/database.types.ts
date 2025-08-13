


export type Json = any;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          role: "Admin" | "Student" | "Guest"
          settings: Json | null
        }
        Insert: {
          id: string
          display_name?: string | null
          role?: "Admin" | "Student" | "Guest"
          settings?: Json | null
        }
        Update: {
          id?: string
          display_name?: string | null
          role?: "Admin" | "Student" | "Guest"
          settings?: Json | null
        }
      }
      folders: {
        Row: {
          id: string
          owner_id: string
          title: string
          parent_id: string | null
          visibility: "private" | "shared"
          path: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          parent_id?: string | null
          visibility?: "private" | "shared"
          path: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          parent_id?: string | null
          visibility?: "private" | "shared"
          path?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      files: {
        Row: {
          id: string
          owner_id: string
          folder_id: string | null
          title: string
          type: "pdf" | "docx" | "pptx" | "txt" | "png" | "jpg" | "mp3" | "wav" | "m4a" | "mp4" | "mov"
          size: number
          status: "idle" | "uploading" | "scanning" | "processing" | "ready" | "error" | "quarantined"
          progress: number
          visibility: "private" | "shared"
          collection_ids: string[]
          tags: string[]
          created_at: string
          updated_at: string
          meta: Json | null
          ai_content: Json | null
        }
        Insert: {
          id?: string
          owner_id: string
          folder_id?: string | null
          title: string
          type: "pdf" | "docx" | "pptx" | "txt" | "png" | "jpg" | "mp3" | "wav" | "m4a" | "mp4" | "mov"
          size: number
          status?: "idle" | "uploading" | "scanning" | "processing" | "ready" | "error" | "quarantined"
          progress?: number
          visibility?: "private" | "shared"
          collection_ids?: string[]
          tags?: string[]
          created_at?: string
          updated_at?: string
          meta?: Json | null
          ai_content?: Json | null
        }
        Update: {
          id?: string
          owner_id?: string
          folder_id?: string | null
          title?: string
          type?: "pdf" | "docx" | "pptx" | "txt" | "png" | "jpg" | "mp3" | "wav" | "m4a" | "mp4" | "mov"
          size?: number
          status?: "idle" | "uploading" | "scanning" | "processing" | "ready" | "error" | "quarantined"
          progress?: number
          visibility?: "private" | "shared"
          collection_ids?: string[]
          tags?: string[]
          created_at?: string
          updated_at?: string
          meta?: Json | null
          ai_content?: Json | null
        }
      }
      collections: {
        Row: {
          id: string
          owner_id: string
          title: string
          visibility: "private" | "shared"
          file_ids: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          visibility?: "private" | "shared"
          file_ids?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          visibility?: "private" | "shared"
          file_ids?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_folder_path: {
        Args: {
          p_folder_id: string
        }
        Returns: {
            id: string
            owner_id: string
            title: string
            parent_id: string | null
            visibility: "private" | "shared"
            path: string[]
            created_at: string
            updated_at: string
        }[]
      }
    }
    Enums: {
      "file_status": "idle" | "uploading" | "scanning" | "processing" | "ready" | "error" | "quarantined"
      "file_type": "pdf" | "docx" | "pptx" | "txt" | "png" | "jpg" | "mp3" | "wav" | "m4a" | "mp4" | "mov"
      "role": "Admin" | "Student" | "Guest"
      "visibility": "private" | "shared"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
