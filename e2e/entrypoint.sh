#!/bin/sh
set -e

API_URL="${VITE_CHAT_BUBBLE_API_URL:-http://localhost:8085}"
ASSISTANT_ID="${VITE_CHAT_BUBBLE_ASSISTANT_ID:-test-admin-assistant}"
API_KEY="${VITE_CHAT_BUBBLE_API_KEY:-}"

# Conditionally build the api-key attribute
API_KEY_ATTR=""
if [ -n "$API_KEY" ]; then
  API_KEY_ATTR=" data-chat-bubble-api-key=\"$API_KEY\""
fi

cat > /app/dist-widget/test.html << HTMLEOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Bubble Test</title>
    <link rel="stylesheet" href="/chat-bubble.css">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .test-info { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="test-info">
        <h1>Chat Bubble E2E Test</h1>
        <p>This page is used for testing the chat bubble widget.</p>
    </div>
    <div id="chat-bubble-container" data-chat-bubble data-chat-bubble-api-url="${API_URL}" data-chat-bubble-assistant-id="${ASSISTANT_ID}"${API_KEY_ATTR}></div>
    <script src="/chat-bubble.js"></script>
</body>
</html>
HTMLEOF

exec http-server dist-widget -p 5174 --cors -o
