/*
# Restrict write access to authenticated users

The portfolio exhibition was previously a no-auth app where anyone (anon) could
add, edit, and delete students, chapters, and artworks. The owner now wants
content creation and deletion restricted to logged-in users only, while viewing
remains public.

1. Security changes (RLS)
- SELECT policies stay open to `anon, authenticated` so anyone can browse the
  exhibition.
- INSERT / UPDATE / DELETE policies are changed to `TO authenticated` only, so
  only signed-in users can add, edit, or remove content.
- No schema changes; no data is touched.

2. Tables affected
- students
- chapters
- artworks

3. Important notes
- The frontend must build a sign-in / sign-up flow so users can create an
  authenticated session. Without it, every write will fail the RLS check.
- Email confirmation stays OFF so new sign-ups can log in immediately.
*/

-- students: SELECT stays public, writes restricted to authenticated
DROP POLICY IF EXISTS "anon_select_students" ON students;
CREATE POLICY "anon_select_students" ON students FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_students" ON students;
CREATE POLICY "auth_insert_students" ON students FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_students" ON students;
CREATE POLICY "auth_update_students" ON students FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_students" ON students;
CREATE POLICY "auth_delete_students" ON students FOR DELETE
  TO authenticated USING (true);

-- chapters: SELECT stays public, writes restricted to authenticated
DROP POLICY IF EXISTS "anon_select_chapters" ON chapters;
CREATE POLICY "anon_select_chapters" ON chapters FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chapters" ON chapters;
CREATE POLICY "auth_insert_chapters" ON chapters FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_chapters" ON chapters;
CREATE POLICY "auth_update_chapters" ON chapters FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chapters" ON chapters;
CREATE POLICY "auth_delete_chapters" ON chapters FOR DELETE
  TO authenticated USING (true);

-- artworks: SELECT stays public, writes restricted to authenticated
DROP POLICY IF EXISTS "anon_select_artworks" ON artworks;
CREATE POLICY "anon_select_artworks" ON artworks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_artworks" ON artworks;
CREATE POLICY "auth_insert_artworks" ON artworks FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_artworks" ON artworks;
CREATE POLICY "auth_update_artworks" ON artworks FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_artworks" ON artworks;
CREATE POLICY "auth_delete_artworks" ON artworks FOR DELETE
  TO authenticated USING (true);