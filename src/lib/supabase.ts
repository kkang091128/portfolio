import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Student = {
  id: string;
  name: string;
  bio: string | null;
  cohort: string | null;
  photo_url: string | null;
  sort_order: number;
  created_at: string;
  user_id: string | null;
};

export type Chapter = {
  id: string;
  student_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
};

export type Artwork = {
  id: string;
  chapter_id: string;
  title: string;
  description: string | null;
  image_url: string;
  sort_order: number;
  created_at: string;
};

export type ChapterWithArtworks = Chapter & {
  artworks: Artwork[];
};

export type StudentWithChapters = Student & {
  chapters: ChapterWithArtworks[];
};
