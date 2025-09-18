-- Social Connections Table for SocialSpark
-- This table stores user connections to various social media platforms

CREATE TABLE public.social_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'facebook')),
    platform_user_id TEXT NOT NULL, -- The user's ID on the platform
    platform_username TEXT, -- Display username/handle
    platform_display_name TEXT, -- Full name on platform
    avatar_url TEXT, -- Profile picture URL from platform
    
    -- OAuth tokens (encrypted)
    access_token TEXT, -- OAuth access token
    refresh_token TEXT, -- OAuth refresh token (if available)
    token_expires_at TIMESTAMP WITH TIME ZONE, -- When the token expires
    
    -- Connection details
    scopes TEXT[], -- Granted permissions
    connection_status TEXT DEFAULT 'active' CHECK (connection_status IN ('active', 'expired', 'revoked', 'error')),
    last_sync_at TIMESTAMP WITH TIME ZONE, -- Last successful sync
    
    -- Platform-specific data
    platform_data JSONB DEFAULT '{}', -- Store platform-specific info
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one connection per platform per user
    UNIQUE(user_id, platform)
);

-- Create indexes for performance
CREATE INDEX idx_social_connections_user_id ON social_connections(user_id);
CREATE INDEX idx_social_connections_platform ON social_connections(platform);
CREATE INDEX idx_social_connections_status ON social_connections(connection_status);
CREATE INDEX idx_social_connections_user_platform ON social_connections(user_id, platform);

-- Enable RLS
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own social connections" ON social_connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social connections" ON social_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social connections" ON social_connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social connections" ON social_connections
    FOR DELETE USING (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_social_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_social_connections_updated_at_trigger
    BEFORE UPDATE ON social_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_social_connections_updated_at();

-- Create view for safe social connections (without tokens)
CREATE VIEW public.social_connections_safe AS
SELECT 
    id,
    user_id,
    platform,
    platform_user_id,
    platform_username,
    platform_display_name,
    avatar_url,
    scopes,
    connection_status,
    last_sync_at,
    platform_data,
    created_at,
    updated_at,
    -- Add convenience fields
    CASE 
        WHEN connection_status = 'active' AND (token_expires_at IS NULL OR token_expires_at > NOW()) 
        THEN TRUE 
        ELSE FALSE 
    END as is_connected
FROM social_connections;

-- Grant access to the view
GRANT SELECT ON social_connections_safe TO authenticated;

-- RLS for the view
ALTER VIEW social_connections_safe SET (security_barrier = true);