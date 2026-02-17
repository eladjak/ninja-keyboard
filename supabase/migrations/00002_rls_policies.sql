-- Helper functions

-- Get user role from users table
CREATE OR REPLACE FUNCTION get_user_role(uid UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = uid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is teacher of a class
CREATE OR REPLACE FUNCTION is_teacher_of_class(cid UUID, tid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classes
    WHERE id = cid AND teacher_id = tid
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is parent of child
CREATE OR REPLACE FUNCTION is_parent_of(child_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = child_id AND parent_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if teacher can see student (student is in one of teacher's classes)
CREATE OR REPLACE FUNCTION is_teacher_of_student(student_id UUID, teacher_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_members cm
    JOIN public.classes c ON c.id = cm.class_id
    WHERE cm.user_id = student_id AND c.teacher_id = teacher_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ==================
-- USERS policies
-- ==================

-- Users can read their own row
CREATE POLICY users_select_own ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Teachers can see members of their classes
CREATE POLICY users_select_teacher ON public.users
  FOR SELECT USING (
    is_teacher_of_student(id, auth.uid())
  );

-- Parents can see their children
CREATE POLICY users_select_parent ON public.users
  FOR SELECT USING (parent_id = auth.uid());

-- Admins can see all users
CREATE POLICY users_select_admin ON public.users
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

-- Users can update their own row only
CREATE POLICY users_update_own ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow insert for new user registration (service role or self)
CREATE POLICY users_insert ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ==================
-- CLASSES policies
-- ==================

-- Members can see their classes
CREATE POLICY classes_select_member ON public.classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.class_members
      WHERE class_id = id AND user_id = auth.uid()
    )
  );

-- Teachers can see their own classes
CREATE POLICY classes_select_teacher ON public.classes
  FOR SELECT USING (teacher_id = auth.uid());

-- Admins can see all classes
CREATE POLICY classes_select_admin ON public.classes
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

-- Teachers can create classes
CREATE POLICY classes_insert_teacher ON public.classes
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid()
    AND get_user_role(auth.uid()) IN ('teacher', 'admin')
  );

-- Owner teacher can update their class
CREATE POLICY classes_update_teacher ON public.classes
  FOR UPDATE USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- ==================
-- CLASS_MEMBERS policies
-- ==================

-- Members can see who is in their class
CREATE POLICY class_members_select ON public.class_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.class_members cm
      WHERE cm.class_id = class_id AND cm.user_id = auth.uid()
    )
  );

-- Teachers of the class can add members
CREATE POLICY class_members_insert_teacher ON public.class_members
  FOR INSERT WITH CHECK (
    is_teacher_of_class(class_id, auth.uid())
  );

-- Students can join a class (insert their own membership)
CREATE POLICY class_members_insert_self ON public.class_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ==================
-- SESSIONS policies
-- ==================

-- Users can see their own sessions
CREATE POLICY sessions_select_own ON public.sessions
  FOR SELECT USING (user_id = auth.uid());

-- Teachers can see sessions of their students
CREATE POLICY sessions_select_teacher ON public.sessions
  FOR SELECT USING (
    is_teacher_of_student(user_id, auth.uid())
  );

-- Users can insert their own sessions
CREATE POLICY sessions_insert_own ON public.sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ==================
-- PROGRESS policies
-- ==================

-- Users can see their own progress
CREATE POLICY progress_select_own ON public.progress
  FOR SELECT USING (user_id = auth.uid());

-- Teachers can see progress of their students
CREATE POLICY progress_select_teacher ON public.progress
  FOR SELECT USING (
    is_teacher_of_student(user_id, auth.uid())
  );

-- Users can insert their own progress
CREATE POLICY progress_insert_own ON public.progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own progress
CREATE POLICY progress_update_own ON public.progress
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ==================
-- GAMIFICATION policies
-- ==================

-- Users can see their own gamification
CREATE POLICY gamification_select_own ON public.gamification
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own gamification
CREATE POLICY gamification_update_own ON public.gamification
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can insert their own gamification row
CREATE POLICY gamification_insert_own ON public.gamification
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ==================
-- CONSENTS policies
-- ==================

-- Users can see consents about them
CREATE POLICY consents_select_user ON public.consents
  FOR SELECT USING (user_id = auth.uid());

-- Parents can see consents for their children
CREATE POLICY consents_select_parent ON public.consents
  FOR SELECT USING (parent_id = auth.uid());

-- Parents can create consents
CREATE POLICY consents_insert_parent ON public.consents
  FOR INSERT WITH CHECK (parent_id = auth.uid());

-- Parents can update consents they created
CREATE POLICY consents_update_parent ON public.consents
  FOR UPDATE USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());
