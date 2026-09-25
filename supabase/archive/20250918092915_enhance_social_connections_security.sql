-- Enable pgcrypto extension for token encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create encryption functions
CREATE OR REPLACE FUNCTION encrypt_token(token text, key_id text)
RETURNS text AS $$
DECLARE
    encryption_key text;
BEGIN
    -- In production, fetch key from secure key management service
    -- For development, using a placeholder key derivation
    encryption_key := digest(key_id || '_encryption_key', 'sha256');
    RETURN encode(
        encrypt(
            token::bytea,
            decode(encryption_key, 'hex'),
            'aes-gcm'
        ),
        'base64'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_token(encrypted_token text, key_id text)
RETURNS text AS $$
DECLARE
    encryption_key text;
BEGIN
    -- In production, fetch key from secure key management service
    encryption_key := digest(key_id || '_encryption_key', 'sha256');
    RETURN convert_from(
        decrypt(
            decode(encrypted_token, 'base64'),
            decode(encryption_key, 'hex'),
            'aes-gcm'
        ),
        'utf8'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create encrypted token columns
ALTER TABLE social_connections
    ADD COLUMN encrypted_access_token text,
    ADD COLUMN encrypted_refresh_token text,
    ADD COLUMN encryption_key_id text;

-- Create temporary function for data migration
CREATE OR REPLACE FUNCTION migrate_tokens()
RETURNS void AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id, access_token, refresh_token FROM social_connections
    WHERE access_token IS NOT NULL OR refresh_token IS NOT NULL
    LOOP
        -- Generate unique key ID for each connection
        UPDATE social_connections
        SET 
            encryption_key_id = encode(gen_random_bytes(16), 'hex'),
            encrypted_access_token = CASE 
                WHEN r.access_token IS NOT NULL 
                THEN encrypt_token(r.access_token, encode(gen_random_bytes(16), 'hex'))
                ELSE NULL
            END,
            encrypted_refresh_token = CASE 
                WHEN r.refresh_token IS NOT NULL 
                THEN encrypt_token(r.refresh_token, encode(gen_random_bytes(16), 'hex'))
                ELSE NULL
            END
        WHERE id = r.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Migrate existing data
SELECT migrate_tokens();

-- Drop temporary migration function
DROP FUNCTION migrate_tokens();

-- Drop original token columns
ALTER TABLE social_connections
    DROP COLUMN access_token,
    DROP COLUMN refresh_token;

-- Add validation triggers
CREATE OR REPLACE FUNCTION validate_social_connection()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate platform-specific requirements
    CASE NEW.platform
        WHEN 'instagram' THEN
            IF NEW.scopes @> ARRAY['user_profile', 'user_media']::text[] = false THEN
                RAISE EXCEPTION 'Instagram connections require user_profile and user_media scopes';
            END IF;
        WHEN 'twitter' THEN
            IF NEW.scopes @> ARRAY['tweet.read', 'users.read']::text[] = false THEN
                RAISE EXCEPTION 'Twitter connections require tweet.read and users.read scopes';
            END IF;
        WHEN 'linkedin' THEN
            IF NEW.scopes @> ARRAY['r_liteprofile']::text[] = false THEN
                RAISE EXCEPTION 'LinkedIn connections require r_liteprofile scope';
            END IF;
        WHEN 'youtube' THEN
            IF NEW.scopes @> ARRAY['https://www.googleapis.com/auth/youtube.readonly']::text[] = false THEN
                RAISE EXCEPTION 'YouTube connections require youtube.readonly scope';
            END IF;
        WHEN 'tiktok' THEN
            IF NEW.scopes @> ARRAY['user.info.basic']::text[] = false THEN
                RAISE EXCEPTION 'TikTok connections require user.info.basic scope';
            END IF;
        WHEN 'facebook' THEN
            IF NEW.scopes @> ARRAY['pages_show_list']::text[] = false THEN
                RAISE EXCEPTION 'Facebook connections require pages_show_list scope';
            END IF;
    END CASE;

    -- Validate required fields
    IF NEW.platform_user_id IS NULL OR NEW.platform_username IS NULL THEN
        RAISE EXCEPTION 'platform_user_id and platform_username are required';
    END IF;

    -- Validate token presence
    IF NEW.encrypted_access_token IS NULL THEN
        RAISE EXCEPTION 'access token is required';
    END IF;

    -- Validate token expiration
    IF NEW.token_expires_at IS NOT NULL AND NEW.token_expires_at <= NOW() THEN
        RAISE EXCEPTION 'token cannot be expired on creation';
    END IF;

    -- Set default connection status if not provided
    IF NEW.connection_status IS NULL THEN
        NEW.connection_status := 'active';
    END IF;

    -- Set last_sync_at if not provided
    IF NEW.last_sync_at IS NULL THEN
        NEW.last_sync_at := NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_social_connection_trigger
    BEFORE INSERT OR UPDATE ON social_connections
    FOR EACH ROW
    EXECUTE FUNCTION validate_social_connection();

-- Update safe view to use encrypted tokens
CREATE OR REPLACE VIEW public.social_connections_safe AS
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
    END as is_connected,
    -- Add token status information
    CASE 
        WHEN encrypted_access_token IS NOT NULL THEN TRUE 
        ELSE FALSE 
    END as has_access_token,
    CASE 
        WHEN encrypted_refresh_token IS NOT NULL THEN TRUE 
        ELSE FALSE 
    END as has_refresh_token,
    token_expires_at
FROM social_connections;

-- Add indexes for token-related queries
CREATE INDEX idx_social_connections_token_expiry ON social_connections(token_expires_at);
CREATE INDEX idx_social_connections_has_refresh_token ON social_connections(encrypted_refresh_token)
WHERE encrypted_refresh_token IS NOT NULL;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION encrypt_token(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION decrypt_token(text, text) TO service_role;