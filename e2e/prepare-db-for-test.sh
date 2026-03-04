#!/bin/bash

# This script is designed to run INSIDE the Docker container.
# It is mounted into the container and invoked via `docker exec`.

set -euo pipefail

# Install dependencies if any are missing (Debian-based container)
if ! command -v sqlite3 &>/dev/null || ! command -v jq &>/dev/null || ! command -v curl &>/dev/null || ! command -v mkpasswd &>/dev/null; then
  apt-get update -qq && apt-get install -yqq sqlite3 jq curl whois
fi
DB_FILE="/app/backend/data/webui.db"

if [ ! -f "$DB_FILE" ]; then
  echo "Database file not found at $DB_FILE"
  exit 1
fi

WEBUI_PORT="${PORT:-8085}"
WEBUI_URL="http://localhost:${WEBUI_PORT}"

# Wait for backend to be ready before fetching version or writing to DB
echo "Waiting for backend to be ready..."
for i in $(seq 1 30); do
  if curl -s "$WEBUI_URL/api/version" >/dev/null 2>&1; then
    echo "Backend is ready"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "Backend did not become ready in time"
    exit 1
  fi
  echo "Waiting... ($i/30)"
  sleep 2
done

VERSION=$(curl -s "$WEBUI_URL/api/version" | jq -r '.version // "unknown"')

PASSWORD="test"
PASSWORD_HASH=$(mkpasswd -m bcrypt "$PASSWORD")

echo "Preparing DB: $DB_FILE"

# Prepare database for testing

sqlite3 "$DB_FILE" <<EOF
-- After some empty database was prepared in the right way, the following command was used to get the dump and then the important commands were extracted and put into this script
-- sqlite3 webui.db .dump > webui.sql

-- Insertions to 'config' not possible here, as the config is loaded in OWUI on startup and is not read again by the db.

-- Truncate some tables
DELETE FROM auth;
DELETE FROM user;
DELETE FROM model;
DELETE FROM "group";
DELETE FROM prompt;
DELETE FROM access_grant;
-- Don't delete KNOWLEGE and FILE here as they will be cleaned via rest to also clean the actual vectorDB (else we would get duplicate errors on re-runs)

-- Insert test users with explicit column names to ensure correct mapping
INSERT INTO user (id, email, username, role, name, profile_image_url, profile_banner_image_url, bio, gender, date_of_birth, timezone, presence_state, status_emoji, status_message, status_expires_at, info, settings, oauth, scim, last_active_at, updated_at, created_at) 
VALUES('7a9b8155-82f6-41db-920c-d1aceb024c30','test.admin@headwai.org',NULL,'admin','Test Admin','/user.png',NULL,NULL,NULL,NULL,'Europe/Vienna',NULL,NULL,NULL,NULL,'{"ui": {"version": "$VERSION"}}',NULL,NULL,NULL,1771323474,1771323474,1771323916);
INSERT INTO user (id, email, username, role, name, profile_image_url, profile_banner_image_url, bio, gender, date_of_birth, timezone, presence_state, status_emoji, status_message, status_expires_at, info, settings, oauth, scim, last_active_at, updated_at, created_at) 
VALUES('8c890910-86da-4322-9cd8-19afea0b596f','test.user@headwai.org',NULL,'user','Test User','/user.png',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'{"ui": {"version": "$VERSION"}}',NULL,NULL,NULL,1771323906,1771323906,1771323906);

-- Insert auth records
INSERT INTO auth VALUES('7a9b8155-82f6-41db-920c-d1aceb024c30','test.admin@headwai.org','$PASSWORD_HASH',1);
INSERT INTO auth VALUES('8c890910-86da-4322-9cd8-19afea0b596f','test.user@headwai.org','$PASSWORD_HASH',1);

-- Create models public
INSERT INTO model VALUES('gpt-4o','17a9b8155-82f6-41db-920c-d1aceb024c30',NULL,'gpt-4o','{"profile_image_url": "/static/favicon.png", "description": null, "capabilities": null}','{}',1771842399,1771842399,1);
INSERT INTO model VALUES('gpt-4o-mini','7a9b8155-82f6-41db-920c-d1aceb024c30',NULL,'gpt-4o-mini','{"profile_image_url": "/static/favicon.png", "description": null, "capabilities": null}','{}',1771842399,1771842399,1);
INSERT INTO model VALUES('gpt-3.5-turbo','1a0bacae-8ef2-489f-af0e-437b05dd7d13',NULL,'gpt-3.5-turbo','{"profile_image_url": "/static/favicon.png", "description": null, "capabilities": null}','{}',1771842399,1771842399,1);

-- Make models all public
INSERT INTO access_grant VALUES('4c65309b-15e2-4d47-b3d3-8043a8587a23','model','gpt-3.5-turbo','user','*','read',1771842399);
INSERT INTO access_grant VALUES('11111111-15e2-4d47-b3d3-8043a8587a21','model','gpt-4o','user','*','read',1771842399);
INSERT INTO access_grant VALUES('22222222-15e2-4d47-b3d3-8043a8587a22','model','gpt-4o-mini','user','*','read',1771842399);

--- Create published model for Chat Bubble
INSERT INTO model VALUES('test-admin-assistant','1a0bacae-8ef2-489f-af0e-437b05dd7d13','gpt-4','Test Admin Assistant','{"profile_image_url": "/static/favicon.png", "description": null, "capabilities": {"file_context": true, "vision": true, "file_upload": true, "web_search": true, "image_generation": true, "code_interpreter": true, "citations": true, "status_updates": true, "builtin_tools": true, "publication": {"enabled": true, "domain_whitelist": "localhost:5174", "user_name": "Test Admin", "user_id": "1a0bacae-8ef2-489f-af0e-437b05dd7d13"}}, "suggestion_prompts": null, "tags": [], "builtinTools": {"time": true, "memory": true, "chats": true, "notes": true, "knowledge": true, "channels": true, "web_search": true, "image_generation": true, "code_interpreter": true}}','{}',1772557393,1772557393,1);

-- Create pvp2 header test group
INSERT INTO "group" VALUES('794c7a11-e5a1-4a84-a726-0f1db788587d','7a9b8155-82f6-41db-920c-d1aceb024c30','Test PVP2 Header Group','','{}','null','{"workspace": {"models": true, "knowledge": true, "prompts": true, "tools": true, "skills": true, "models_import": true, "models_export": true, "prompts_import": true, "prompts_export": true, "tools_import": true, "tools_export": true}, "sharing": {"models": true, "public_models": true, "knowledge": true, "public_knowledge": true, "prompts": true, "public_prompts": true, "tools": true, "public_tools": true, "skills": true, "public_skills": true, "notes": true, "public_notes": true}, "chat": {"controls": true, "valves": true, "system_prompt": true, "params": true, "file_upload": true, "delete": true, "delete_message": true, "continue_response": true, "regenerate_response": true, "rate_response": true, "edit": true, "share": true, "export": true, "stt": true, "tts": true, "call": true, "multiple_models": true, "temporary": true, "temporary_enforced": false}, "features": {"api_keys": false, "notes": true, "channels": true, "folders": true, "direct_tool_servers": false, "web_search": true, "image_generation": true, "code_interpreter": true, "memories": true}, "settings": {"interface": true}}',1772463585,1772463585);

EOF

echo "Database prepared for testing"

# Use internal backend URL for API calls from inside container
API_URL="$WEBUI_URL"

# Try to get admin token (non-fatal if it fails)
echo "Attempting to get admin token..."
ADMIN_BEARER_TOKEN=""
if ADMIN_BEARER_TOKEN=$(curl -s --fail-with-body "$API_URL/api/v1/auths/signin" \
  -H 'Content-Type: application/json' \
  --data-raw '{"email":"test.admin@headwai.org","password":"'$PASSWORD'"}' 2>/dev/null | jq -r .token 2>/dev/null) && [ "$ADMIN_BEARER_TOKEN" != "null" ] && [ -n "$ADMIN_BEARER_TOKEN" ]; then
  
  echo "Got admin token, cleaning up files and knowledge base..."
  
  # Delete all files (non-fatal)
  curl -s --fail-with-body "$API_URL/api/v1/files/all" \
    -X 'DELETE' \
    -H "authorization: Bearer $ADMIN_BEARER_TOKEN" >/dev/null 2>&1 || echo "Warning: Could not delete files"
  
  # Reset retrieval database (non-fatal)
  curl -s --fail-with-body "$API_URL/api/v1/retrieval/reset/db" \
    -X 'POST' \
    -H "authorization: Bearer $ADMIN_BEARER_TOKEN" >/dev/null 2>&1 || echo "Warning: Could not reset retrieval database"
  
  echo "API cleanup completed"
else
  echo "Warning: Could not get admin token - backend may not be ready yet. Database is prepared, tests can proceed."
fi

echo "Test preparation completed"
exit 0
