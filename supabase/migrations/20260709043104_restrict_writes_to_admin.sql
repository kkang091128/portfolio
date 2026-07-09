/*
# Restrict writes to the admin account only

Previously, any authenticated user could add, edit, and delete students,
chapters, and artworks. The owner now wants content management restricted to a
single admin account (admin@portfolio.local).

1. Security changes (RLS)
- SELECT policies stay open to `anon, authenticated` so anyone can browse.
- INSERT / UPDATE / DELETE policies are restricted to the admin email via
  `auth.jwt() ->> 'email' = 'admin@portfolio.local'`. This checks the JWT of
  the requesting session, so only the admin account can perform writes.
- No schema changes; no data is touched.

2. Tables affected
- students
- chapters
- artworks

3. Important notes
- The admin account already exists in auth.users with email
  admin@portfolio.local and password 000000.
- The frontend login maps the username "admin" to this email.
*/

-- students: writes restricted to admin
DROP POLICY IF EXISTS "auth_insert_students" ON students;
CREATE POLICY "admin_insert_students" ON students FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'admin@portfolio.local');

DROP POLICY IF EXISTS "auth_update_students" ON students;
CREATE POLICY "admin_update_students" ON students FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'email' = 'admin@portfolio.local')
  WITH CHECK (auth.jwt() ->> 'email' = 'admin@portfolio.local');

DROP POLICY IF EXISTS "auth_delete_students" ON students;
CREATE POLICY "admin_delete_students" ON students FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'email' = 'admin@portfolio.local');

-- chapters: writes restricted to admin
DROP POLICY IF EXISTS "auth_insert_chapters" ON chapters;
CREATE POLICY "admin_insert_chapters" ON chapters FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'admin@portfolio.local');

DROP POLICY IF EXISTS "auth_update_chapters" ON chapters;
CREATE POLICY "admin_update_chapters" ON chapters FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'email' = 'admin@portfolio.local')
  WITH CHECK (auth.jwt() ->> 'email' = 'admin@portfolio.local');

DROP POLICY IF EXISTS "auth_delete_chapters" ON chapters;
CREATE POLICY "admin_delete_chapters" ON chapters FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'email' = 'admin@portfolio.local');

-- artworks: writes restricted to admin
DROP POLICY IF EXISTS "auth_insert_artworks" ON artworks;
CREATE POLICY "admin_insert_artworks" ON artworks FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'admin@portfolio.local');

DROP POLICY IF EXISTS "auth_update_artworks" ON artworks;
CREATE POLICY "admin_update_artworks" ON artworks FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'email' = 'admin@portfolio.local')
  WITH CHECK (auth.jwt() ->> 'email' = 'admin@portfolio.local');

DROP POLICY IF EXISTS "auth_delete_artworks" ON artworks;
CREATE POLICY "admin_delete_artworks" ON artworks FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'email' = 'admin@portfolio.local');