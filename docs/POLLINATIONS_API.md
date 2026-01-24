# Pollinations.ai API Documentation

## Info
**Title:** pollinations.ai API
**Version:** 0.3.0
**Base URL:** `https://gen.pollinations.ai`

Documentation for `gen.pollinations.ai` - the pollinations.ai API gateway.

[📝 Edit docs](https://github.com/pollinations/pollinations/edit/master/enter.pollinations.ai/src/routes/docs.ts)

## Quick Start
Get your API key at [https://enter.pollinations.ai](https://enter.pollinations.ai)

### Image Generation
```bash
curl 'https://gen.pollinations.ai/image/a%20cat?model=flux' \
  -H 'Authorization: Bearer YOUR_API_KEY'
```

### Text Generation
```bash
curl 'https://gen.pollinations.ai/v1/chat/completions' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"model": "gemini-fast", "messages": [{"role": "user", "content": "Hello"}]}'
```

### Vision (Image Input)
```bash
curl 'https://gen.pollinations.ai/v1/chat/completions' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"model": "gemini-fast", "messages": [{"role": "user", "content": [{"type": "text", "text": "Describe this image"}, {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}]}]}'
```

**Gemini Tools:** `gemini`, `gemini-large` have `code_execution` enabled (can generate images/plots). `gemini-search` has `google_search` enabled. Responses may include `content_blocks` with `image_url`, `text`, or `thinking` types.

### Simple Text Endpoint
```bash
curl 'https://gen.pollinations.ai/text/hello?key=YOUR_API_KEY'
```

### Streaming
```bash
curl 'https://gen.pollinations.ai/v1/chat/completions' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"model": "gemini-fast", "messages": [{"role": "user", "content": "Write a poem"}], "stream": true}' \
  --no-buffer
```

### Model Discovery
**Always check available models before testing:**

- **Image models:** [/image/models](https://gen.pollinations.ai/image/models)
- **Text models:** [/v1/models](https://gen.pollinations.ai/v1/models)

## Authentication

**Two key types (both consume Pollen from your balance):**
- **Publishable Keys (`pk_`):** ⚠️ **Beta - not yet ready for production use.** For client-side apps, IP rate-limited (1 pollen per IP per hour). **Warning:** Exposing in public code will consume your Pollen if your app gets traffic.
- **Secret Keys (`sk_`):** Server-side only, no rate limits. Keep secret - never expose publicly.

**Auth methods:**
1. Header: `Authorization: Bearer YOUR_API_KEY`
2. Query param: `?key=YOUR_API_KEY`

## Account Management

### Get Account Profile
`GET /account/profile`

Get user profile info (name, email, GitHub username, tier, createdAt, nextResetAt). Requires `account:profile` permission for API keys.

**Response:**
Returns user profile with name, email, githubUsername, tier, createdAt, nextResetAt.

### Get Account Balance
`GET /account/balance`

Get pollen balance. Returns the key's remaining budget if set, otherwise the user's total balance. Requires `account:balance` permission for API keys.

**Response:**
Returns remaining pollen balance.

### Get Account Usage
`GET /account/usage`

Get request history and spending data. Supports JSON and CSV formats. Requires `account:usage` permission for API keys.

**Parameters:**
- `format` (query): Output format (`json` or `csv`). Default: `json`.
- `limit` (query): Number of records to return. Default: 100.
- `before` (query): Pagination cursor.

### Get Daily Account Usage
`GET /account/usage/daily`

Get daily aggregated usage data (last 90 days). Supports JSON and CSV formats. Requires `account:usage` permission for API keys. Results are cached for 1 hour.

**Parameters:**
- `format` (query): Output format (`json` or `csv`). Default: `json`.

## Endpoints

### List Text Models
`GET /v1/models`

Get available text models (OpenAI-compatible). If an API key with model restrictions is provided, only allowed models are returned.

### List Image Models
`GET /image/models`

Get a list of available image generation models with pricing, capabilities, and metadata. If an API key with model restrictions is provided, only allowed models are returned.

### List Text Models (Detailed)
`GET /text/models`

Get a list of available text generation models with pricing, capabilities, and metadata. If an API key with model restrictions is provided, only allowed models are returned.

### Chat Completions
`POST /v1/chat/completions`

OpenAI-compatible chat completions endpoint.

**Legacy endpoint:** `/openai` (deprecated, use `/v1/chat/completions` instead)

**Authentication (Secret Keys Only):**
Include your API key in the `Authorization` header as a Bearer token:
`Authorization: Bearer YOUR_API_KEY`

**Request Body (JSON):**
- `messages` (required): Array of messages.
- `model`: Text model to use (default: `openai`).
- `stream`: Boolean for streaming.
- `json`: Boolean for JSON output.
- `temperature`: Number (0-2).
- `max_tokens`: Integer.
- ... (Standard OpenAI parameters)

### Generate Text (Simple)
`GET /text/{prompt}`

Generates text from text prompts.

**Parameters:**
- `prompt` (path): Text prompt for generation.
- `model` (query): Text model to use.
- `seed` (query): Random seed.
- `system` (query): System prompt.
- `json` (query): Return JSON format.
- `temperature` (query): Controls creativity.
- `stream` (query): Stream response.

### Generate Image
`GET /image/{prompt}`

Generate an image or video from a text prompt.

**Parameters:**
- `prompt` (path): Text description.
- `model` (query): AI model. Image: `flux`, `zimage`, `turbo`, `gptimage`, `kontext`, `seedream`, `seedream-pro`, `nanobanana`. Video: `veo`, `seedance`, `seedance-pro`.
- `width` (query): Image width. Default: 1024.
- `height` (query): Image height. Default: 1024.
- `seed` (query): Random seed.
- `enhance` (query): Let AI improve your prompt.
- `negative_prompt` (query): What to avoid.
- `safe` (query): Enable safety content filters.
- `quality` (query): Image quality level (gptimage only).
- `image` (query): Reference image URL(s).
- `transparent` (query): Generate with transparent background (gptimage only).
- `duration` (query): Video duration in seconds (video models only).
- `aspectRatio` (query): Video aspect ratio (veo, seedance).
- `audio` (query): Enable audio generation (veo only).

## Bring Your Own Pollen (BYOP) 🌸

Users pay for their own AI usage. You pay $0. Ship apps without API costs.

**Auth link:**
```
https://enter.pollinations.ai/authorize?redirect_url=https://myapp.com
```

**With preselected options:**
```
https://enter.pollinations.ai/authorize?redirect_url=https://myapp.com&permissions=profile,balance&models=flux,openai&expiry=7&budget=10
```
