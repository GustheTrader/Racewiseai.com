-- Add user-specific RLS policies for api_connections table
-- Users can only access their own API connections

-- Allow users to view their own API connections
CREATE POLICY "Users can view their own API connections"
ON public.api_connections
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to create their own API connections
CREATE POLICY "Users can create their own API connections"
ON public.api_connections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own API connections
CREATE POLICY "Users can update their own API connections"
ON public.api_connections
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own API connections
CREATE POLICY "Users can delete their own API connections"
ON public.api_connections
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);