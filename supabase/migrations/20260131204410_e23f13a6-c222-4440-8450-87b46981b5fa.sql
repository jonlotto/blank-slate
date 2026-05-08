-- Remove overly permissive policy
DROP POLICY IF EXISTS "Service role full access" ON public.push_subscriptions;