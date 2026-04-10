
-- 1. Add quality_engineer to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'quality_engineer';

-- 2. Add assigned_qe_id to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS assigned_qe_id uuid REFERENCES public.profiles(user_id);

-- 3. Create tasks table
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name text NOT NULL,
  assigned_to_user_id uuid REFERENCES public.profiles(user_id),
  assigned_to_name text,
  due_date date,
  status text NOT NULL DEFAULT 'not-started',
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tasks" ON public.tasks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create tasks" ON public.tasks
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update tasks" ON public.tasks
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete tasks" ON public.tasks
  FOR DELETE TO authenticated USING (true);

-- 4. Create sequence for auto-generated bug IDs
CREATE SEQUENCE public.bug_id_seq START 1;

-- 5. Create bugs table
CREATE TABLE public.bugs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bug_number text NOT NULL DEFAULT 'RBUG' || LPAD(nextval('public.bug_id_seq')::text, 3, '0'),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  raised_by uuid NOT NULL,
  description text NOT NULL,
  photo_url text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.bugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view bugs" ON public.bugs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create bugs" ON public.bugs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update bugs" ON public.bugs
  FOR UPDATE TO authenticated USING (true);

-- 6. Create bug_comments table
CREATE TABLE public.bug_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bug_id uuid NOT NULL REFERENCES public.bugs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  comment text NOT NULL,
  photo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.bug_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view bug comments" ON public.bug_comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create bug comments" ON public.bug_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 7. Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'bug',
  related_bug_id uuid REFERENCES public.bugs(id) ON DELETE SET NULL,
  related_event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 8. Create bug_photos storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('bug-photos', 'bug-photos', true);

CREATE POLICY "Anyone can view bug photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'bug-photos');

CREATE POLICY "Authenticated users can upload bug photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'bug-photos');

-- 9. Update timestamps trigger for new tables
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_events_updated_at();

CREATE TRIGGER update_bugs_updated_at
  BEFORE UPDATE ON public.bugs
  FOR EACH ROW EXECUTE FUNCTION public.update_events_updated_at();
