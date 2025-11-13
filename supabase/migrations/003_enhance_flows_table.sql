-- Add analytics metadata
ALTER TABLE public.flows 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{
  "prompt_regeneration_count": 0,
  "dropoff_step": null,
  "completion_time_ms": null,
  "prompt_version": "v1",
  "user_feedback": null,
  "is_demo": false
}'::jsonb;

-- Add soft delete support
ALTER TABLE public.flows 
ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- Add completion tracking
ALTER TABLE public.flows 
ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Create composite unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS flows_user_title_active_idx 
  ON public.flows(user_id, title) 
  WHERE archived_at is null;

-- Performance indexes
CREATE INDEX IF NOT EXISTS flows_step_idx 
  ON public.flows(step) WHERE archived_at is null;
  
CREATE INDEX IF NOT EXISTS flows_archived_idx 
  ON public.flows(archived_at) WHERE archived_at is not null;

-- Analytics view
CREATE OR REPLACE VIEW flow_dropoff_analytics AS
SELECT 
  step,
  count(*) as flow_count,
  avg(extract(epoch from (updated_at - created_at))) as avg_time_in_step_seconds
FROM public.flows
WHERE completed_at is null and archived_at is null
GROUP BY step
ORDER BY flow_count desc;

