/*
# Portfolio exhibition schema for editing/publishing vocational training

Single-tenant, no-auth app. The site is a public exhibition — anyone can view,
and anyone (anon) can add/edit students and artworks. RLS uses `TO anon, authenticated`
with `USING (true)` because the data is intentionally public/shared.

1. New Tables
- `students`
  - id (uuid, pk)
  - name (text, not null) — student name
  - bio (text) — short bio / introduction
  - cohort (text) — training batch/term, e.g. "2025 1기"
  - photo_url (text) — profile/cover image URL
  - sort_order (int, default 0) — display ordering
  - created_at (timestamptz)
- `chapters`
  - id (uuid, pk)
  - student_id (uuid, fk -> students, cascade)
  - title (text, not null) — chapter name, e.g. "챕터 1: 타이포그래피"
  - description (text)
  - sort_order (int, default 0)
  - created_at (timestamptz)
- `artworks`
  - id (uuid, pk)
  - chapter_id (uuid, fk -> chapters, cascade)
  - title (text, not null) — artwork title
  - description (text) — work description / concept
  - image_url (text, not null) — artwork image URL
  - sort_order (int, default 0)
  - created_at (timestamptz)

2. Security
- RLS enabled on all three tables.
- anon + authenticated CRUD allowed (public exhibition, editable by all).

3. Indexes
- students(sort_order)
- chapters(student_id, sort_order)
- artworks(chapter_id, sort_order)
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bio text,
  cohort text,
  photo_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS artworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_sort ON students(sort_order);
CREATE INDEX IF NOT EXISTS idx_chapters_student ON chapters(student_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_artworks_chapter ON artworks(chapter_id, sort_order);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

-- students policies
DROP POLICY IF EXISTS "anon_select_students" ON students;
CREATE POLICY "anon_select_students" ON students FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_students" ON students;
CREATE POLICY "anon_insert_students" ON students FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_students" ON students;
CREATE POLICY "anon_update_students" ON students FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_students" ON students;
CREATE POLICY "anon_delete_students" ON students FOR DELETE
  TO anon, authenticated USING (true);

-- chapters policies
DROP POLICY IF EXISTS "anon_select_chapters" ON chapters;
CREATE POLICY "anon_select_chapters" ON chapters FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chapters" ON chapters;
CREATE POLICY "anon_insert_chapters" ON chapters FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_chapters" ON chapters;
CREATE POLICY "anon_update_chapters" ON chapters FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chapters" ON chapters;
CREATE POLICY "anon_delete_chapters" ON chapters FOR DELETE
  TO anon, authenticated USING (true);

-- artworks policies
DROP POLICY IF EXISTS "anon_select_artworks" ON artworks;
CREATE POLICY "anon_select_artworks" ON artworks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_artworks" ON artworks;
CREATE POLICY "anon_insert_artworks" ON artworks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_artworks" ON artworks;
CREATE POLICY "anon_update_artworks" ON artworks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_artworks" ON artworks;
CREATE POLICY "anon_delete_artworks" ON artworks FOR DELETE
  TO anon, authenticated USING (true);