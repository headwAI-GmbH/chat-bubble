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

-- Note: Open WebUI (upstream) may re-read config from the DB at runtime, so the
-- config INSERT below must include all required sections (including "openai").

-- Truncate some tables
DELETE FROM auth;
DELETE FROM user;
DELETE FROM model;
DELETE FROM "group";
DELETE FROM prompt;
DELETE FROM access_grant;
DELETE FROM config;
DELETE FROM api_key;
-- Don't delete KNOWLEDGE and FILE here as they will be cleaned via rest to also clean the actual vectorDB (else we would get duplicate errors on re-runs)

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
INSERT INTO model VALUES('gpt-3.5-turbo','7a9b8155-82f6-41db-920c-d1aceb024c30',NULL,'gpt-3.5-turbo','{"profile_image_url": "/static/favicon.png", "description": null, "capabilities": null}','{}',1771842399,1771842399,1);

-- Make models all public
INSERT INTO access_grant VALUES('4c65309b-15e2-4d47-b3d3-8043a8587a23','model','gpt-3.5-turbo','user','*','read',1771842399);
INSERT INTO access_grant VALUES('11111111-15e2-4d47-b3d3-8043a8587a21','model','gpt-4o','user','*','read',1771842399);
INSERT INTO access_grant VALUES('22222222-15e2-4d47-b3d3-8043a8587a22','model','gpt-4o-mini','user','*','read',1771842399);

--- Create published model for Chat Bubble
INSERT INTO model VALUES('test-admin-assistant','7a9b8155-82f6-41db-920c-d1aceb024c30','gpt-4o','Test Admin Assistant','{"profile_image_url": "/static/favicon.png", "description": null, "capabilities": {"file_context": true, "vision": true, "file_upload": true, "web_search": true, "image_generation": true, "code_interpreter": true, "citations": true, "status_updates": true, "builtin_tools": true, "publication": {"enabled": true, "domain_whitelist": "localhost:5174", "user_name": "Test Admin", "user_id": "7a9b8155-82f6-41db-920c-d1aceb024c30"}}, "suggestion_prompts": null, "tags": [], "builtinTools": {"time": true, "memory": true, "chats": true, "notes": true, "knowledge": true, "channels": true, "web_search": true, "image_generation": true, "code_interpreter": true}}','{}',1772557393,1772557393,1);

-- Create pvp2 header test group
INSERT INTO "group" VALUES('794c7a11-e5a1-4a84-a726-0f1db788587d','7a9b8155-82f6-41db-920c-d1aceb024c30','Test PVP2 Header Group','','{}','null','{"workspace": {"models": true, "knowledge": true, "prompts": true, "tools": true, "skills": true, "models_import": true, "models_export": true, "prompts_import": true, "prompts_export": true, "tools_import": true, "tools_export": true}, "sharing": {"models": true, "public_models": true, "knowledge": true, "public_knowledge": true, "prompts": true, "public_prompts": true, "tools": true, "public_tools": true, "skills": true, "public_skills": true, "notes": true, "public_notes": true}, "chat": {"controls": true, "valves": true, "system_prompt": true, "params": true, "file_upload": true, "delete": true, "delete_message": true, "continue_response": true, "regenerate_response": true, "rate_response": true, "edit": true, "share": true, "export": true, "stt": true, "tts": true, "call": true, "multiple_models": true, "temporary": true, "temporary_enforced": false}, "features": {"api_keys": false, "notes": true, "channels": true, "folders": true, "direct_tool_servers": false, "web_search": true, "image_generation": true, "code_interpreter": true, "memories": true}, "settings": {"interface": true}}',1772463585,1772463585);

-- Add api-key for test admin and llmock config
INSERT INTO config VALUES(1,'{"version": 0, "ui": {"enable_signup": false, "default_user_role": "pending", "default_group_id": "", "enable_community_sharing": true, "enable_message_rating": true, "enable_user_webhooks": true, "pending_user_overlay_title": "", "pending_user_overlay_content": "", "watermark": ""}, "user": {"permissions": {"workspace": {"models": true, "knowledge": true, "prompts": true, "tools": true, "skills": true, "models_import": true, "models_export": true, "prompts_import": true, "prompts_export": true, "tools_import": true, "tools_export": true}, "sharing": {"models": true, "public_models": true, "knowledge": true, "public_knowledge": true, "prompts": true, "public_prompts": true, "tools": true, "public_tools": true, "skills": true, "public_skills": true, "notes": true, "public_notes": true}, "chat": {"controls": true, "valves": true, "system_prompt": true, "params": true, "file_upload": true, "delete": true, "delete_message": true, "continue_response": true, "regenerate_response": true, "rate_response": true, "edit": true, "share": true, "export": true, "stt": true, "tts": true, "call": true, "multiple_models": true, "temporary": true, "temporary_enforced": false}, "features": {"api_keys": true, "notes": true, "channels": true, "folders": true, "direct_tool_servers": false, "web_search": true, "image_generation": true, "code_interpreter": true, "memories": true}, "settings": {"interface": true}}}, "rag": {"embedding_engine": "", "embedding_model": "sentence-transformers/all-MiniLM-L6-v2", "embedding_batch_size": 1, "enable_async_embedding": true, "template": "### Task:\nRespond to the user query using the provided context, incorporating inline citations in the format [id] **only when the <source> tag includes an explicit id attribute** (e.g., <source id=\"1\">).\n\n### Guidelines:\n- If you don''t know the answer, clearly state that.\n- If uncertain, ask the user for clarification.\n- Respond in the same language as the user''s query.\n- If the context is unreadable or of poor quality, inform the user and provide the best possible answer.\n- If the answer isn''t present in the context but you possess the knowledge, explain this to the user and provide the answer using your own understanding.\n- **Only include inline citations using [id] (e.g., [1], [2]) when the <source> tag includes an id attribute.**\n- Do not cite if the <source> tag does not contain an id attribute.\n- Do not use XML tags in your response.\n- Ensure citations are concise and directly related to the information provided.\n\n### Example of Citation:\nIf the user asks about a specific topic and the information is found in a source with a provided id attribute, the response should include the citation like in the following example:\n* \"According to the study, the proposed method increases efficiency by 20% [1].\"\n\n### Output:\nProvide a clear and direct response to the user''s query, including inline citations in the format [id] only when the <source> tag with id attribute is present in the context.\n\n<context>\n{{CONTEXT}}\n</context>\n", "top_k": 3, "bypass_embedding_and_retrieval": false, "full_context": false, "enable_hybrid_search": false, "enable_hybrid_search_enriched_texts": false, "top_k_reranker": 3, "relevance_threshold": 0.0, "hybrid_bm25_weight": 0.5, "CONTENT_EXTRACTION_ENGINE": "", "pdf_extract_images": false, "pdf_loader_mode": "page", "datalab_marker_api_key": "", "datalab_marker_api_base_url": "", "datalab_marker_additional_config": "", "datalab_marker_skip_cache": false, "datalab_marker_force_ocr": false, "datalab_marker_paginate": false, "datalab_marker_strip_existing_ocr": false, "datalab_marker_disable_image_extraction": false, "datalab_marker_format_lines": false, "datalab_marker_output_format": "markdown", "DATALAB_MARKER_USE_LLM": false, "external_document_loader_url": "", "external_document_loader_api_key": "", "tika_server_url": "http://tika:9998", "docling_server_url": "http://docling:5001", "docling_api_key": "", "docling_params": {}, "document_intelligence_endpoint": "", "document_intelligence_key": "", "document_intelligence_model": "prebuilt-layout", "MISTRAL_OCR_API_BASE_URL": "https://api.mistral.ai/v1", "mistral_ocr_api_key": "", "mineru_api_mode": "local", "mineru_api_url": "http://localhost:8000", "mineru_api_key": "", "mineru_api_timeout": "300", "mineru_params": {}, "reranking_engine": "", "external_reranker_url": "", "external_reranker_api_key": "", "external_reranker_timeout": "", "reranking_model": "", "text_splitter": "token", "enable_markdown_header_text_splitter": true, "chunk_size": 512, "chunk_min_size_target": 0, "chunk_overlap": 128, "file": {"max_size": null, "max_count": null, "allowed_extensions": []}, "web": {"search": {"enable": false, "engine": "", "trust_env": false, "result_count": 3, "concurrent_requests": 0, "domain": {"filter_list": []}, "bypass_embedding_and_retrieval": false, "bypass_web_loader": false, "searxng_query_url": "", "searxng_language": "all", "yacy_query_url": "", "yacy_username": "", "google_pse_engine_id": "", "serpstack_https": true, "tavily_api_key": "", "searchapi_engine": "", "serpapi_engine": "", "jina_api_base_url": "", "bing_search_v7_endpoint": "https://api.bing.microsoft.com/v7.0/search", "perplexity_model": "sonar", "perplexity_search_context_usage": "medium", "perplexity_search_api_url": "https://api.perplexity.ai/search", "sougou_api_sid": "", "external_web_search_url": "", "tavily_extract_depth": "basic", "yandex_web_search_url": "", "yandex_web_search_api_key": "", "yandex_web_search_config": ""}, "loader": {"concurrent_requests": 10, "engine": "", "timeout": "", "ssl_verification": true, "playwright_ws_url": "", "playwright_timeout": 10000, "firecrawl_api_url": "https://api.firecrawl.dev", "firecrawl_timeout": "", "external_web_loader_url": ""}}, "youtube_loader_language": ["en"], "youtube_loader_proxy_url": ""}, "file": {"image_compression_width": null, "image_compression_height": null}, "google_drive": {"enable": false}, "onedrive": {"enable": false}, "webhook_url": "", "auth": {"admin": {"show": true, "email": null}, "enable_api_keys": true, "api_key": {"endpoint_restrictions": false, "allowed_endpoints": ""}, "jwt_expiry": "4w"}, "webui": {"url": "http://localhost:8085"}, "folders": {"enable": true, "max_file_count": ""}, "channels": {"enable": false}, "memories": {"enable": true}, "notes": {"enable": true}, "users": {"enable_status": true}, "ldap": {"enable": false}, "openai": {"enable": true, "api_base_urls": ["http://mock-llm:8000"], "api_keys": ["your-secret-api-key"]}}',0,'2026-02-23 10:26:04','2026-03-05 10:06:23.523575');
INSERT INTO api_key VALUES('key_7a9b8155-82f6-41db-920c-d1aceb024c30','7a9b8155-82f6-41db-920c-d1aceb024c30','sk-a17db10484dd4ab0b35626c78cad6aad',NULL,NULL,NULL,1772705231,1772705231);

EOF

# Verify critical tables have expected data
echo "Verifying database contents..."
ERRORS=0

verify_count() {
  local table="$1"
  local expected="$2"
  local actual
  actual=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM $table;")
  if [ "$actual" -ne "$expected" ]; then
    echo "ERROR: Expected $expected rows in '$table', got $actual"
    ERRORS=$((ERRORS + 1))
  else
    echo "  OK: $table has $actual rows"
  fi
}

verify_count "user" 2
verify_count "auth" 2
verify_count "model" 4
verify_count "access_grant" 3
verify_count "config" 1
verify_count "api_key" 1
verify_count '"group"' 1

# Verify the OpenAI config is present in config table
OPENAI_CHECK=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM config WHERE data LIKE '%openai%api_base_urls%';")
if [ "$OPENAI_CHECK" -eq 0 ]; then
  echo "ERROR: config table is missing OpenAI connection settings"
  ERRORS=$((ERRORS + 1))
else
  echo "  OK: config contains OpenAI settings"
fi

if [ "$ERRORS" -gt 0 ]; then
  echo "Database verification FAILED with $ERRORS error(s)"
  exit 1
fi

echo "Database verified successfully"

# Log OpenAI connection config from DB
echo ""
echo "=== OpenAI config in DB ==="
sqlite3 "$DB_FILE" "SELECT data FROM config WHERE id=1;" | python3 -c "
import sys, json
try:
    data = json.loads(sys.stdin.read())
    openai = data.get('openai', 'NOT FOUND')
    print(json.dumps(openai, indent=2))
except Exception as e:
    print(f'Could not parse config JSON: {e}')
" 2>/dev/null || echo "(python3 not available, falling back to grep)"
sqlite3 "$DB_FILE" "SELECT data FROM config WHERE id=1;" | grep -o '"openai":[^}]*}[^}]*}' || echo "Could not extract openai section with grep"

# Log OpenAI-related environment variables
echo ""
echo "=== OpenAI environment variables ==="
env | grep -iE 'OPENAI|ENABLE_OPENAI' | sort || echo "(no OpenAI env vars found)"

# Test connectivity from backend container to mock-llm
echo ""
echo "=== Testing connectivity to mock-llm ==="
curl -sf --max-time 5 http://mock-llm:8000/ && echo "mock-llm reachable at http://mock-llm:8000/" || echo "WARNING: Cannot reach mock-llm at http://mock-llm:8000/"
curl -sf --max-time 5 http://mock-llm:8000/v1/models && echo "mock-llm /v1/models endpoint OK" || echo "WARNING: mock-llm /v1/models endpoint not reachable"
echo ""

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
