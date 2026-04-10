ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS prompt_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS prompt_limit integer NOT NULL DEFAULT 50,
ADD COLUMN IF NOT EXISTS access_blocked boolean NOT NULL DEFAULT false;

UPDATE public.profiles
SET prompt_limit = 50
WHERE prompt_limit IS DISTINCT FROM 50;

CREATE OR REPLACE FUNCTION public.consume_prompt_quota(_user_id uuid)
RETURNS TABLE (
  allowed boolean,
  prompt_count integer,
  prompt_limit integer,
  access_blocked boolean,
  remaining integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_profile public.profiles%ROWTYPE;
BEGIN
  SELECT *
  INTO current_profile
  FROM public.profiles
  WHERE id = _user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 50, true, 0;
    RETURN;
  END IF;

  IF current_profile.access_blocked OR current_profile.prompt_count >= current_profile.prompt_limit THEN
    UPDATE public.profiles
    SET access_blocked = true
    WHERE id = _user_id;

    RETURN QUERY
    SELECT false,
           current_profile.prompt_count,
           current_profile.prompt_limit,
           true,
           GREATEST(current_profile.prompt_limit - current_profile.prompt_count, 0);
    RETURN;
  END IF;

  UPDATE public.profiles
  SET prompt_count = prompt_count + 1,
      access_blocked = (prompt_count + 1) >= prompt_limit
  WHERE id = _user_id
  RETURNING * INTO current_profile;

  RETURN QUERY
  SELECT true,
         current_profile.prompt_count,
         current_profile.prompt_limit,
         current_profile.access_blocked,
         GREATEST(current_profile.prompt_limit - current_profile.prompt_count, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_prompt_quota(uuid) TO authenticated;