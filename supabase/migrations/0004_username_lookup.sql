-- 0004_username_lookup.sql
-- Server-only username -> account id lookup, used by login and signup.
-- Only the service role (the server's secret key) may call it; browsers cannot.

create or replace function public.get_user_id_by_username(p_username text)
returns uuid
language sql stable security definer
set search_path = ''
as $$
  select p.id from public.profiles p where lower(p.username) = lower(p_username);
$$;

revoke all on function public.get_user_id_by_username(text) from public, anon, authenticated;
grant execute on function public.get_user_id_by_username(text) to service_role;
