/*
# Per-student ownership: students manage their own works

Previously, only the admin account could add, edit, and delete content. The
owner now wants students to sign up and manage their own portfolio: each
student can create their own profile, chapters, and artworks, and edit/delete
only what they own. The admin retains full access to everything.

1. Schema changes
- `students` gets a new `user_id` column (uuid, nullable, defaults to
  auth.uid() on insert). Nullable so existing rows (created before this
  change) and admin-created rows without an owner are not forced to have one.
  FK -> auth.users ON DELETE SET NULL.
- `chapters` and `artworks` have no user_id column; ownership is derived
  through the parent student row (see RLS below).

2. Security changes (RLS)
- SELECT stays open to `anon, authenticated` (public exhibition).
- students INSERT: allowed for any authenticated user (they create their own
  profile). `user_id` defaults to `auth.uid()`.
- students UPDATE/DELETE: allowed if the row's `user_id = auth.uid()` (owner)
  OR the requester is the admin.
- chapters INSERT: allowed if the parent student's `user_id = auth.uid()` OR
  the requester is admin (checked via a subquery on students).
- chapters UPDATE/DELETE: allowed if the parent student's `user_id =
  auth.uid()` OR admin.
- artworks INSERT/UPDATE/DELETE: same ownership-through-parent logic as
  chapters, checked through chapters -> students.
- Admin is identified by `auth.jwt() ->> 'email' = 'admin@portfolio.local'`.

3. Important notes
- The `user_id` column is added with `DEFAULT auth.uid()` so student-created
  profiles are automatically stamped with the logged-in user's id.
- Existing rows keep `user_id = null`; only the admin can modify them (since
  no regular user owns them).
- No data is lost; the column addition is non-destructive.
*/

-- Add user_id to students
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE students
  ALTER COLUMN user_id SET DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS idx_students_user ON students(user_id);

-- Helper: admin email check as a stable expression
-- (used inline in policies below)

-- students policies
DROP POLICY IF EXISTS "anon_select_students" ON students;
CREATE POLICY "anon_select_students" ON students FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_students" ON students;
CREATE POLICY "owner_or_admin_insert_students" ON students FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_students" ON students;
CREATE POLICY "owner_or_admin_update_students" ON students FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR auth.jwt() ->> 'email' = 'admin@portfolio.local')
  WITH CHECK (user_id = auth.uid() OR auth.jwt() ->> 'email' = 'admin@portfolio.local');

DROP POLICY IF EXISTS "admin_delete_students" ON students;
CREATE POLICY "owner_or_admin_delete_students" ON students FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR auth.jwt() ->> 'email' = 'admin@portfolio.local');

-- chapters policies (ownership through parent student)
DROP POLICY IF EXISTS "anon_select_chapters" ON chapters;
CREATE POLICY "anon_select_chapters" ON chapters FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_chapters" ON chapters;
CREATE POLICY "owner_or_admin_insert_chapters" ON chapters FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = chapters.student_id
      AND (s.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'admin@portfolio.local')
    )
  );

DROP POLICY IF EXISTS "admin_update_chapters" ON chapters;
CREATE POLICY "owner_or_admin_update_chapters" ON chapters FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = chapters.student_id
      AND (s.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'admin@portfolio.local')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = chapters.student_id
      AND (s.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'admin@portfolio.local')
    )
  );

DROP POLICY IF EXISTS "admin_delete_chapters" ON chapters;
CREATE POLICY "owner_or_admin_delete_chapters" ON chapters FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = chapters.student_id
      AND (s.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'admin@portfolio.local')
    )
  );

-- artworks policies (ownership through parent chapter -> student)
DROP POLICY IF EXISTS "anon_select_artworks" ON artworks;
CREATE POLICY "anon_select_artworks" ON artworks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_artworks" ON artworks;
CREATE POLICY "owner_or_admin_insert_artworks" ON artworks FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM chapters c
      JOIN students s ON s.id = c.student_id
      WHERE c.id = artworks.chapter_id
      AND (s.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'admin@portfolio.local')
    )
  );

DROP POLICY IF EXISTS "admin_update_artworks" ON artworks;
CREATE POLICY "owner_or_admin_update_artworks" ON artworks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chapters c
      JOIN students s ON s.id = c.student_id
      WHERE c.id = artworks.chapter_id
      AND (s.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'admin@portfolio.local')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chapters c
      JOIN students s ON s.id = c.student_id
      WHERE c.id = artworks.chapter_id
      AND (s.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'admin@portfolio.local')
    )
  );

DROP POLICY IF EXISTS "admin_delete_artworks" ON artworks;
CREATE POLICY "owner_or_admin_delete_artworks" ON artworks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chapters c
      JOIN students s ON s.id = c.student_id
      WHERE c.id = artworks.chapter_id
      AND (s.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'admin@portfolio.local')
    )
  );