# HeadwAI Chat Bubble

The chat bubble is based on a Svelte integration for the [deep-chat](https://www.npmjs.com/package/deep-chat) component, providing an easy-to-use AI chat interface for your web applications.

## Development

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Setup

1. Clone this repository:

```bash
git clone <your-repo-url>
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

4. Configure your environment variables (see [Configuration](#configuration) section)

5. Start the development server:

```bash
npm run dev
```

6. Open embedded HeadwAI Chat Bubble in Browser

```bash
 http://localhost:5174/
```

## Configuration

The HeadwAI Chat Bubble can be configured using environment variables or by changing the attributes of the instance.

### Environment Variables

Create a `.env` by copying `.env.example` file in your project root with the following variables:

All configuration attributes listed in the [Configuration section of README.md](README.md#configuration) can be overwritten using VITE\_ environment variables. For example:

```bash
# Production .env file - Core API Configuration
VITE_CHAT_BUBBLE_API_URL=https://company.headwai-one.at
VITE_CHAT_BUBBLE_ASSISTANT_ID=customer-support-assistant-id

# Message Configuration
VITE_CHAT_BUBBLE_MAX_MESSAGES=50
VITE_CHAT_BUBBLE_INITIAL_MESSAGE=Welcome! How can we help you today?
VITE_CHAT_BUBBLE_PLACEHOLDER_TEXT=Type your message here...

# UI Styling Configuration
VITE_CHAT_BUBBLE_USER_MESSAGE_BG_COLOR=#0066cc
VITE_CHAT_BUBBLE_AI_MESSAGE_BG_COLOR=#f8f9fa
VITE_CHAT_BUBBLE_FAVICON_BG_COLOR=#0066cc

# Branding Configuration
VITE_CHAT_BUBBLE_CHAT_TITLE=Customer Support
```

### Window Object Configuration

```html
<script>
  // Runtime configuration override
  window.HEADWAI_CHAT_BUBBLE_CONFIG = {
    apiUrl: 'https://company.headwai-one.at',
    assistantId: 'customer-support-assistant-id',
  };
</script>
```

### Data attributes (Multiple chat bubbles):\*\*

```html
<div
  data-chat-bubble
  data-chat-bubble-api-url="https://company.headwai-one.at"
  data-chat-bubble-user-message-background-color="#ff9500"
  data-chat-bubble-ai-message-background-color="#00c851"
  data-chat-bubble-user-message-text-color="#ffffff"
  data-chat-bubble-ai-message-text-color="#004225"
  data-chat-bubble-favicon-background-color="#ff6f00"
></div>
```

## Including HeadwAI Chat Bubble in Customer Websites

For simple integration instructions, see [README.md](README.md) which provides a streamlined guide for customers.

## Deployment

### Automated Publishing

The GitHub Actions workflow automatically builds and publishes to npm when:

1. A version bump is created and committed to a PR
2. The PR is merged to the `main` branch

**Version bump commands:**

```bash
# Patch version bump (e.g., 6.3.0 -> 6.3.1)
npm version patch

# Minor version bump (e.g., 6.3.0 -> 6.4.0)
npm version minor

# Major version bump (e.g., 6.3.0 -> 7.0.0)
npm version major
```

### jsDelivr CDN Access

Once published to NPM, your package is automatically available on jsDelivr:

**For Widget/Script Embed:**

```html
<!-- Latest version -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@headwai/chat-bubble@latest/dist-widget/chat-bubble.css"
/>
<script src="https://cdn.jsdelivr.net/npm/@headwai/chat-bubble@latest/dist-widget/chat-bubble.js"></script>

<!-- Specific version -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@headwai/chat-bubble@1.0.0/dist-widget/chat-bubble.css"
/>
<script src="https://cdn.jsdelivr.net/npm/@headwai/chat-bubble@1.0.0/dist-widget/chat-bubble.js"></script>
```

## API Reference

### Workflow

#### Chat

1. Create a new chat by calling the Chat Creation API
2. Use the chatId from the response in the request of the Chat Completions API
3. Store the messages from the Chat Completions API via the Chat Storage API

#### Feedback

1. Give feedback by calling the Feedback API
2. Add the feedback in the Chat Storage API

### APIs Called

The HeadwAI Chat Bubble makes requests to the following API endpoints:

#### 1. Chat Creation API

- **Endpoint**: `{apiUrl}/api/v1/chats/new`
- **Method**: POST
- **Purpose**: Create a new chat session when starting a conversation
- **Header**:
  The value of the Origin header must include the a white listed domain in the `Publish Model` configuration.

Origin: http://localhost:5174

##### Create new chat

For a brand new chat without any initial messages and the a with the title New Chat

- **Request Body**:

```javascript
{
    "assistantId": "customer-support-assistant-id",
    "chat": {
    },
    "folder_id": null
}
```

- **Response Body**:

```javascript
{
  "id": "3cd6f38c-effc-4038-948a-4fd345ea19b1", //chatId
  "user_id": "e12c1cb7-f768-42a5-bb45-59846d2406fa",
  "title": "New Chat",
  "chat": {},
  "updated_at": 1760361654,
  "created_at": 1760361654,
  "share_id": null,
  "archived": false,
  "pinned": false,
  "meta": {},
  "folder_id": null
}
```

##### Create new chat with inital message and title

- **Request Body**:

```javascript
{
    "assistantId": "customer-support-assistant-id",
    "chat": {
        "id": "",
        "title": "New Chatbubble Chat", // Choose Title
        "models": [
            "customer-support-assistant-id"
        ],
        "params": {},
        "history": {
            "messages": {
                "f55b5f5e-d3be-4bb3-8afc-cc3d322ef70f": {
                    "id": "f55b5f5e-d3be-4bb3-8afc-cc3d322ef70f",
                    "parentId": null,
                    "childrenIds": [],
                    "role": "assistant",
                    "content": "Hey, how can I help you?",
                    "timestamp": 1760360854,
                    "models": [
                        "customer-support-assistant-id"
                    ],
                    "model": "customer-support-assistant-id",
                    "modelId": "customer-support-assistant-id",
                    "modelIdx": 0
                }
            },
            "currentId": "f55b5f5e-d3be-4bb3-8afc-cc3d322ef70f"
        },
        "messages": [
            {
                "id": "f55b5f5e-d3be-4bb3-8afc-cc3d322ef70f",
                "parentId": null,
                "childrenIds": [],
                "role": "assistant",
                "content": "Hey, how can I help you?",
                "timestamp": 1760360854,
                "models": [
                    "customer-support-assistant-id"
                ],
                "model": "customer-support-assistant-id",
                "modelId": "customer-support-assistant-id",
                "modelIdx": 0
            }
        ],
        "tags": [],
        "timestamp": 1760360854542
    },
    "folder_id": null
}

```

- **Response Body**:

```javascript
{
    "id": "1e09dc64-f984-4859-90dd-5552fa8047f7", //chatId
    "user_id": "e12c1cb7-f768-42a5-bb45-59846d2406fa",
    "title": "New Chatbubble Chat",
    "chat": {
        "id": "",
        "title": "New Chatbubble Chat",
        "models": [
            "customer-support-assistant-id"
        ],
        "params": {},
        "history": {
            "messages": {
                "f55b5f5e-d3be-4bb3-8afc-cc3d322ef70f": {
                    "id": "f55b5f5e-d3be-4bb3-8afc-cc3d322ef70f",
                    "parentId": null,
                    "childrenIds": [],
                    "role": "assistant",
                    "content": "Hey, how can I help you?",
                    "timestamp": 1760360854,
                    "models": [
                        "customer-support-assistant-id"
                    ],
                    "model": "customer-support-assistant-id",
                    "modelId": "customer-support-assistant-id",
                    "modelIdx": 0
                }
            },
            "currentId": "f55b5f5e-d3be-4bb3-8afc-cc3d322ef70f"
        },
        "messages": [
            {
                "id": "f55b5f5e-d3be-4bb3-8afc-cc3d322ef70f",
                "parentId": null,
                "childrenIds": [],
                "role": "assistant",
                "content": "Hey, how can I help you?",
                "timestamp": 1760360854,
                "models": [
                    "customer-support-assistant-id"
                ],
                "model": "customer-support-assistant-id",
                "modelId": "customer-support-assistant-id",
                "modelIdx": 0
            }
        ],
        "tags": [],
        "timestamp": 1760360854542
    },
    "updated_at": 1760360854,
    "created_at": 1760360854,
    "share_id": null,
    "archived": false,
    "pinned": false,
    "meta": {},
    "folder_id": null
}
```

#### 2. Chat Completions API

- **Endpoint**: `{apiUrl}/api/chat/completions`
- **Method**: WebSocket (streaming)
- **Purpose**: Main chat conversation endpoint for sending messages and receiving AI responses
- **Header**:
  The value of the Origin header must include the a white listed domain in the `Publish Assistant` configuration.

Origin: http://localhost:5174

- **Request Format**:

```javascript
{
    "messages": [ // whole message history
        {
            "role": "user", // user|assistant
            "content": "how are you"
        }
    ],
    "model": "customer-support-assistant-id",
    "stream": true, // false for a non streaming answer
    "variables": { // optional
        "{{USER_NAME}}": "David Schneebauer | headwAI GmbH",
        "{{USER_LOCATION}}": "Unknown",
        "{{CURRENT_DATETIME}}": "2025-10-13 13:07:34",
        "{{CURRENT_DATE}}": "2025-10-13",
        "{{CURRENT_TIME}}": "14:07:34",
        "{{CURRENT_WEEKDAY}}": "Monday",
        "{{CURRENT_TIMEZONE}}": "Europe/Lisbon",
        "{{USER_LANGUAGE}}": "en-GB"
    },
    "chat_id": "3cd6f38c-effc-4038-948a-4fd345ea19b1",
    "parent_message_id": "2860fdae-4c43-4f59-8217-33dfc92b47d3", // ID of the parent user message
    "parent_message": { // complete parent user message object
        "id": "2860fdae-4c43-4f59-8217-33dfc92b47d3",
        "role": "user",
        "content": "previous user message",
        "timestamp": 1760362655
    },
    "id": "29948ec6-6975-4d3a-b019-ceb8b7f7c698", // ID for the new assistant message being created
    "params": {}, // optional - additional parameters
    "tool_servers": [], // optional - tool server configurations
    "features": { // optional - feature flags
        "image_generation": false,
        "code_interpreter": false,
        "web_search": false,
        "memory": false
    },
    "background_tasks": { // optional - background task configurations
        "title_generation": true,
        "tags_generation": false,
        "follow_up_generation": false
    }
}

```

- **Response Format**: Server-sent events with OpenAI-compatible streaming format

##### Streaming

Many chunks (objects like this) are returned, until the `[DONE]` message is sent. The content in `choices.delta.content` needs to be saved and concatenated with content of previous chunks.

```javascript
{
    "id": "chatcmpl-CQTfHBjGODmuDFi1WpPSSePX0kl23",
    "object": "chat.completion.chunk",
    "created": 1760426595,
    "model": "gpt-4-0613",
    "service_tier": "default",
    "system_fingerprint": null,
    "choices": [
        {
            "index": 0,
            "delta": {
                "content": " feelings"
            },
            "logprobs": null,
            "finish_reason": null
        }
    ],
    "obfuscation": "8ducrYPe"
}
```

##### Non Streaming

The content is returned in `choices.message.content` as a whole

```javascript
{
  "id": "chatcmpl-CQDZLxuep7oEuWBqIvOdw2j7fk8G4",
  "object": "chat.completion",
  "created": 1760364723,
  "model": "gpt-4-0613",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "As an AI, I don't have feelings, but I'm here and ready to assist you. How can I help you today?",
        "refusal": null,
        "annotations": []
      },
      "logprobs": null,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 21,
    "completion_tokens": 39,
    "total_tokens": 60,
    "prompt_tokens_details": {
      "cached_tokens": 0,
      "audio_tokens": 0
    },
    "completion_tokens_details": {
      "reasoning_tokens": 0,
      "audio_tokens": 0,
      "accepted_prediction_tokens": 0,
      "rejected_prediction_tokens": 0
    }
  },
  "service_tier": "default",
  "system_fingerprint": null
}
```

#### 3. Chat Storage API

- **Endpoint**: `{apiUrl}/api/v1/chats/{chatId}`
- **Method**: POST
- **Purpose**: Store/update chat history and conversation state
- **Header**:
  The value of the Origin header must include the a white listed domain in the `Publish Assistant` configuration.

Origin: http://localhost:5174

- **Request Body**:

```javascript
{
    "assistantId": "customer-support-assistant-id",
    "chat": {
        "models": [
            "customer-support-assistant-id"
        ],
        "history": {
            "messages": {
                "2860fdae-4c43-4f59-8217-33dfc92b47d3": {
                    "id": "2860fdae-4c43-4f59-8217-33dfc92b47d3",
                    "parentId": null,
                    "childrenIds": [
                        "29948ec6-6975-4d3a-b019-ceb8b7f7c698"
                    ],
                    "role": "user",
                    "content": "how are you",
                    "timestamp": 1760362655,
                    "models": [
                        "customer-support-assistant-id"
                    ]
                },
                "29948ec6-6975-4d3a-b019-ceb8b7f7c698": {
                    "annotation": { // add only after giving feedback
                      "rating": 1 // 1 for postive, -1 for negative
                    },
                    "id": "29948ec6-6975-4d3a-b019-ceb8b7f7c698",
                    "parentId": "2860fdae-4c43-4f59-8217-33dfc92b47d3",
                    "childrenIds": [],
                    "role": "assistant",
                    "content": "As an AI, I don't have feelings, but I'm here and ready to assist you. How can I help you today?",
                    "model": "customer-support-assistant-id",
                    "modelId": "customer-support-assistant-id",
                    "modelIdx": 0,
                    "timestamp": 1760362655,
                    "sources": []
                }
            },
            "currentId": "29948ec6-6975-4d3a-b019-ceb8b7f7c698"
        },
        "messages": [
            {
                "id": "2860fdae-4c43-4f59-8217-33dfc92b47d3",
                "parentId": "f55b5f5e-d3be-4bb3-8afc-cc3d322ef70f",
                "childrenIds": [
                    "29948ec6-6975-4d3a-b019-ceb8b7f7c698"
                ],
                "role": "user",
                "content": "how are you",
                "timestamp": 1760362655,
                "models": [
                    "customer-support-assistant-id"
                ]
            },
            {
                "annotation": { // add only after giving feedback
                  "rating": 1 // 1 for postive, -1 for negative
                },
                "id": "29948ec6-6975-4d3a-b019-ceb8b7f7c698",
                "parentId": "2860fdae-4c43-4f59-8217-33dfc92b47d3",
                "childrenIds": [],
                "role": "assistant",
                "content": "As an AI, I don't have feelings, but I'm here and ready to assist you. How can I help you today?",
                "model": "customer-support-assistant-id",
                "modelId": "customer-support-assistant-id",
                "modelIdx": 0,
                "timestamp": 1760362655,
                "sources": []
            }
        ],
        "params": {}
    }
}
```

- **Response Body**:

```javascript
{
  "id": "3cd6f38c-effc-4038-948a-4fd345ea19b1", //chatId
  "user_id": "e12c1cb7-f768-42a5-bb45-59846d2406fa",
  "title": "New Chat",
  "chat": {
    "models": ["customer-support-assistant-id"],
    "history": {
      "messages": {
        "2860fdae-4c43-4f59-8217-33dfc92b47d3": {
          "id": "2860fdae-4c43-4f59-8217-33dfc92b47d3",
          "parentId": null,
          "childrenIds": ["29948ec6-6975-4d3a-b019-ceb8b7f7c698"],
          "role": "user",
          "content": "how are you",
          "timestamp": 1760362655,
          "models": ["customer-support-assistant-id"]
        },
        "29948ec6-6975-4d3a-b019-ceb8b7f7c698": {
          "annotation": { // add only after giving feedback
            "rating": 1 // 1 for postive, -1 for negative
          },
          "id": "29948ec6-6975-4d3a-b019-ceb8b7f7c698",
          "parentId": "2860fdae-4c43-4f59-8217-33dfc92b47d3",
          "childrenIds": [],
          "role": "assistant",
          "content": "As an AI, I don't have feelings, but I'm here and ready to assist you. How can I help you today?",
          "model": "customer-support-assistant-id",
          "modelId": "customer-support-assistant-id",
          "modelIdx": 0,
          "timestamp": 1760362655,
          "sources": []
        }
      },
      "currentId": "29948ec6-6975-4d3a-b019-ceb8b7f7c698"
    },
    "messages": [
      {
        "id": "2860fdae-4c43-4f59-8217-33dfc92b47d3",
        "parentId": "f55b5f5e-d3be-4bb3-8afc-cc3d322ef70f",
        "childrenIds": ["29948ec6-6975-4d3a-b019-ceb8b7f7c698"],
        "role": "user",
        "content": "how are you",
        "timestamp": 1760362655,
        "models": ["customer-support-assistant-id"]
      },
      {
        "annotation": { // add only after giving feedback
          "rating": 1 // 1 for postive, -1 for negative
        },
        "id": "29948ec6-6975-4d3a-b019-ceb8b7f7c698",
        "parentId": "2860fdae-4c43-4f59-8217-33dfc92b47d3",
        "childrenIds": [],
        "role": "assistant",
        "content": "As an AI, I don't have feelings, but I'm here and ready to assist you. How can I help you today?",
        "model": "customer-support-assistant-id",
        "modelId": "customer-support-assistant-id",
        "modelIdx": 0,
        "timestamp": 1760362655,
        "sources": []
      }
    ],
    "params": {}
  },
  "updated_at": 1760433576,
  "created_at": 1760361654,
  "share_id": null,
  "archived": false,
  "pinned": false,
  "meta": {},
  "folder_id": null
}
```

#### 4. Feedback API

- **Endpoint**: `{apiUrl}/api/v1/evaluations/feedback`
- **Method**: POST
- **Purpose**: Submit user feedback (thumbs up/down) for AI responses
- **Request Body**:

```javascript
{
    "assistantId": "customer-support-assistant-id",
    "type": "rating",
    "data": {
        "rating": 1, // 1 for postive, -1 for negative
        "model_id": "customer-support-assistant-id"
    },
    "meta": {
        "model_id": "customer-support-assistant-id",
        "message_id": "29948ec6-6975-4d3a-b019-ceb8b7f7c698",
        "message_index": 1,
        "chat_id": "3cd6f38c-effc-4038-948a-4fd345ea19b1",
        "base_models": {
            "customer-support-assistant-id": "customer-support-assistant-id"
        }
    },
    "snapshot": {
        "chat": {
            "id": "3cd6f38c-effc-4038-948a-4fd345ea19b1",
            "user_id": null,
            "title": "New Chat",
            "chat": {
                "id": "",
                "title": "New Chat",
                "models": [
                    "customer-support-assistant-id"
                ],
                "params": {},
                "history": {
                    "messages": {
                        "2860fdae-4c43-4f59-8217-33dfc92b47d3": {
                            "id": "2860fdae-4c43-4f59-8217-33dfc92b47d3",
                            "parentId": null,
                            "childrenIds": [
                                "29948ec6-6975-4d3a-b019-ceb8b7f7c698"
                            ],
                            "role": "user",
                            "content": "how are you",
                            "timestamp": 1760362655,
                            "models": [
                                "customer-support-assistant-id"
                            ]
                        },
                        "29948ec6-6975-4d3a-b019-ceb8b7f7c698": {
                            "id": "29948ec6-6975-4d3a-b019-ceb8b7f7c698",
                            "parentId": "2860fdae-4c43-4f59-8217-33dfc92b47d3",
                            "childrenIds": [],
                            "role": "assistant",
                            "content": "As an AI, I don't have feelings, but I'm here and ready to assist you. How can I help you today?",
                            "model": "customer-support-assistant-id",
                            "modelId": "customer-support-assistant-id",
                            "modelIdx": 0,
                            "timestamp": 1760362655,
                            "sources": []
                        }
                    },
                    "currentId": "29948ec6-6975-4d3a-b019-ceb8b7f7c698"
                },
                "messages": [
                    {
                        "id": "2860fdae-4c43-4f59-8217-33dfc92b47d3",
                        "parentId": "f55b5f5e-d3be-4bb3-8afc-cc3d322ef70f",
                        "childrenIds": [
                            "29948ec6-6975-4d3a-b019-ceb8b7f7c698"
                        ],
                        "role": "user",
                        "content": "how are you",
                        "timestamp": 1760362655,
                        "models": [
                            "customer-support-assistant-id"
                        ]
                    },
                    {
                        "id": "29948ec6-6975-4d3a-b019-ceb8b7f7c698",
                        "parentId": "2860fdae-4c43-4f59-8217-33dfc92b47d3",
                        "childrenIds": [],
                        "role": "assistant",
                        "content": "As an AI, I don't have feelings, but I'm here and ready to assist you. How can I help you today?",
                        "model": "customer-support-assistant-id",
                        "modelId": "customer-support-assistant-id",
                        "modelIdx": 0,
                        "timestamp": 1760362655,
                        "sources": []
                    }
                ]
            },
            "updated_at": 1760433800173,
            "created_at": 1760433800173,
            "share_id": null,
            "archived": false,
            "pinned": false,
            "meta": {},
            "folder_id": null
        }
    }
}
```

```javascript
{
  "assistantId": "customer-support-assistant-id",
  "type": "rating",
  "data": {
    "rating": 1, // 1 for positive, -1 for negative
    "model_id": "customer-support-assistant-id"
  },
  "meta": {
    "model_id": "customer-support-assistant-id",
    "message_id": "message-uuid",
    "message_index": 2,
    "chat_id": "chat-uuid",
    "base_models": {"customer-support-assistant-id": "customer-support-assistant-id"}
  },
  "snapshot": {
    "chat": {
      // Complete chat state for context
    }
  }
}
```

- **Response Body**:

```javascript
{
  "id": "6e6503ff-8f59-4995-a2f4-6b07f02a4723",
  "user_id": "e12c1cb7-f768-42a5-bb45-59846d2406fa",
  "version": 0,
  "type": "rating",
  "data": {
    "rating": 1,
    "model_id": "customer-support-assistant-id",
    "sibling_model_ids": null,
    "reason": null,
    "comment": null
  },
  "meta": {
    "model_id": "customer-support-assistant-id",
    "message_id": "29948ec6-6975-4d3a-b019-ceb8b7f7c698",
    "message_index": 1,
    "chat_id": "3cd6f38c-effc-4038-948a-4fd345ea19b1",
    "base_models": {
      "customer-support-assistant-id": "customer-support-assistant-id"
    }
  },
  "snapshot": {
    "chat": {
      "id": "3cd6f38c-effc-4038-948a-4fd345ea19b1",
      "user_id": null,
      "title": "New Chat",
      "chat": {
        "id": "",
        "title": "New Chat",
        "models": ["customer-support-assistant-id"],
        "params": {},
        "history": {
          "messages": {
            "2860fdae-4c43-4f59-8217-33dfc92b47d3": {
              "id": "2860fdae-4c43-4f59-8217-33dfc92b47d3",
              "parentId": null,
              "childrenIds": ["29948ec6-6975-4d3a-b019-ceb8b7f7c698"],
              "role": "user",
              "content": "how are you",
              "timestamp": 1760362655,
              "models": ["customer-support-assistant-id"]
            },
            "29948ec6-6975-4d3a-b019-ceb8b7f7c698": {
              "id": "29948ec6-6975-4d3a-b019-ceb8b7f7c698",
              "parentId": "2860fdae-4c43-4f59-8217-33dfc92b47d3",
              "childrenIds": [],
              "role": "assistant",
              "content": "As an AI, I don't have feelings, but I'm here and ready to assist you. How can I help you today?",
              "model": "customer-support-assistant-id",
              "modelId": "customer-support-assistant-id",
              "modelIdx": 0,
              "timestamp": 1760362655,
              "sources": []
            }
          },
          "currentId": "29948ec6-6975-4d3a-b019-ceb8b7f7c698"
        },
        "messages": [
          {
            "id": "2860fdae-4c43-4f59-8217-33dfc92b47d3",
            "parentId": "f55b5f5e-d3be-4bb3-8afc-cc3d322ef70f",
            "childrenIds": ["29948ec6-6975-4d3a-b019-ceb8b7f7c698"],
            "role": "user",
            "content": "how are you",
            "timestamp": 1760362655,
            "models": ["customer-support-assistant-id"]
          },
          {
            "id": "29948ec6-6975-4d3a-b019-ceb8b7f7c698",
            "parentId": "2860fdae-4c43-4f59-8217-33dfc92b47d3",
            "childrenIds": [],
            "role": "assistant",
            "content": "As an AI, I don't have feelings, but I'm here and ready to assist you. How can I help you today?",
            "model": "customer-support-assistant-id",
            "modelId": "customer-support-assistant-id",
            "modelIdx": 0,
            "timestamp": 1760362655,
            "sources": []
          }
        ]
      },
      "updated_at": 1760433800173,
      "created_at": 1760433800173,
      "share_id": null,
      "archived": false,
      "pinned": false,
      "meta": {},
      "folder_id": null
    }
  },
  "created_at": 1760434499,
  "updated_at": 1760434499
}
```

## Troubleshooting

### Common Issues

**CORS Errors**: Ensure your API endpoint allows requests from your domain
**Environment Variables Not Loading**: Ensure variables are prefixed with `VITE_CHAT_BUBBLE_`
**CDN Version Delays**: Sometimes the `@latest` tag on jsDelivr CDN takes time to propagate to all edge servers and may not deliver the newest version immediately. If you need the latest features or fixes, specify the exact version number instead of using `@latest`:

```html
<!-- Instead of @latest -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@headwai/chat-bubble@1.2.3/dist-widget/chat-bubble.css"
/>
<script src="https://cdn.jsdelivr.net/npm/@headwai/chat-bubble@1.2.3/dist-widget/chat-bubble.js"></script>
```

## Support

For issues and questions:

- Create an issue in this repository
- Check the [deep-chat documentation](https://deepchat.dev/)
- Review the [API compatibility guide](https://deepchat.dev/docs/connect)
