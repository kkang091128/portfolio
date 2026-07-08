import { supabase, type Student, type Chapter, type Artwork, type StudentWithChapters, type ChapterWithArtworks } from './supabase';

export async function fetchStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Student[];
}

export async function fetchStudent(id: string): Promise<StudentWithChapters | null> {
  const { data: student, error: sErr } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (sErr) throw sErr;
  if (!student) return null;

  const { data: chapters, error: cErr } = await supabase
    .from('chapters')
    .select('*')
    .eq('student_id', id)
    .order('sort_order', { ascending: true });
  if (cErr) throw cErr;

  const chapterIds = (chapters as Chapter[]).map((c) => c.id);
  let artworks: Artwork[] = [];
  if (chapterIds.length > 0) {
    const { data: aw, error: aErr } = await supabase
      .from('artworks')
      .select('*')
      .in('chapter_id', chapterIds)
      .order('sort_order', { ascending: true });
    if (aErr) throw aErr;
    artworks = aw as Artwork[];
  }

  const chaptersWithArtworks: ChapterWithArtworks[] = (chapters as Chapter[]).map((c) => ({
    ...c,
    artworks: artworks.filter((a) => a.chapter_id === c.id),
  }));

  return { ...(student as Student), chapters: chaptersWithArtworks };
}

export async function fetchAllChaptersByTitle(): Promise<Map<string, { student: Student; chapter: Chapter; artworks: Artwork[] }[]>> {
  const { data: students, error: sErr } = await supabase
    .from('students')
    .select('*')
    .order('sort_order', { ascending: true });
  if (sErr) throw sErr;

  const { data: chapters, error: cErr } = await supabase
    .from('chapters')
    .select('*')
    .order('sort_order', { ascending: true });
  if (cErr) throw cErr;

  const { data: artworks, error: aErr } = await supabase
    .from('artworks')
    .select('*')
    .order('sort_order', { ascending: true });
  if (aErr) throw aErr;

  const studentMap = new Map<string, Student>();
  (students as Student[]).forEach((s) => studentMap.set(s.id, s));

  const result = new Map<string, { student: Student; chapter: Chapter; artworks: Artwork[] }[]>();
  (chapters as Chapter[]).forEach((c) => {
    const student = studentMap.get(c.student_id);
    if (!student) return;
    const chArtworks = (artworks as Artwork[]).filter((a) => a.chapter_id === c.id);
    const list = result.get(c.title) || [];
    list.push({ student, chapter: c, artworks: chArtworks });
    result.set(c.title, list);
  });

  return result;
}

export async function createStudent(input: Omit<Student, 'id' | 'created_at' | 'sort_order'> & { sort_order?: number }): Promise<Student> {
  const { data, error } = await supabase
    .from('students')
    .insert(input)
    .select('*')
    .single();
  if (error) throw error;
  return data as Student;
}

export async function updateStudent(id: string, input: Partial<Omit<Student, 'id' | 'created_at'>>): Promise<Student> {
  const { data, error } = await supabase
    .from('students')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Student;
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw error;
}

export async function createChapter(input: Omit<Chapter, 'id' | 'created_at' | 'sort_order'> & { sort_order?: number }): Promise<Chapter> {
  const { data, error } = await supabase
    .from('chapters')
    .insert(input)
    .select('*')
    .single();
  if (error) throw error;
  return data as Chapter;
}

export async function updateChapter(id: string, input: Partial<Omit<Chapter, 'id' | 'created_at'>>): Promise<Chapter> {
  const { data, error } = await supabase
    .from('chapters')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Chapter;
}

export async function deleteChapter(id: string): Promise<void> {
  const { error } = await supabase.from('chapters').delete().eq('id', id);
  if (error) throw error;
}

export async function createArtwork(input: Omit<Artwork, 'id' | 'created_at' | 'sort_order'> & { sort_order?: number }): Promise<Artwork> {
  const { data, error } = await supabase
    .from('artworks')
    .insert(input)
    .select('*')
    .single();
  if (error) throw error;
  return data as Artwork;
}

export async function updateArtwork(id: string, input: Partial<Omit<Artwork, 'id' | 'created_at'>>): Promise<Artwork> {
  const { data, error } = await supabase
    .from('artworks')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Artwork;
}

export async function deleteArtwork(id: string): Promise<void> {
  const { error } = await supabase.from('artworks').delete().eq('id', id);
  if (error) throw error;
}
