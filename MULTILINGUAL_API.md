# Multilingual API Documentation

This document describes how to use the multilingual features of the Dhvani backend API.

## Supported Languages

- **English (en)** - Default language
- **Hindi (hi)** - हिंदी
- **Bengali (bn)** - বাংলা

## How to Request Data in Different Languages

### Method 1: Query Parameter

Add `?lang=<language_code>` to any API endpoint:

```bash
# Get messages in Hindi
GET /api/messages?lang=hi

# Get messages in Bengali
GET /api/messages?type=welcome&lang=bn

# Text-to-Speech in Hindi
POST /api/tts?lang=hi
```

### Method 2: Request Header

Add `x-language: <language_code>` header to your request:

```bash
curl -X GET "http://localhost:3000/api/messages" \
  -H "x-language: hi"

curl -X POST "http://localhost:3000/api/tts" \
  -H "x-language: bn" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world"}'
```

### Method 3: Request Body (for POST requests)

Include `targetLanguage` in the request body:

```json
{
  "text": "Hello world",
  "targetLanguage": "hi"
}
```

## API Endpoints

### 1. Messages API (`/api/messages`)

Get localized messages and instructions.

#### GET Request

**Parameters:**
- `type` (optional): Message type (`welcome`, `instructions`, `features`, `errors.fileNotFound`, etc.)
- `lang` (optional): Language code

**Example:**
```bash
GET /api/messages?type=welcome&lang=hi
```

**Response:**
```json
{
  "language": "hi",
  "messageType": "welcome",
  "message": "ध्वनि में आपका स्वागत है! आपका आवाज़-पहला पहुंच एप्लिकेशन।",
  "originalMessage": "Welcome to Dhvani! Your voice-first accessibility application.",
  "translated": true
}
```

#### POST Request

Translate custom text.

**Body:**
```json
{
  "text": "Your custom text here",
  "targetLanguage": "hi"
}
```

**Response:**
```json
{
  "originalText": "Your custom text here",
  "translatedText": "आपका कस्टम टेक्स्ट यहाँ",
  "language": "hi",
  "translated": true
}
```

### 2. Text-to-Speech API (`/api/tts`)

Convert text to speech with automatic translation.

**Enhanced Features:**
- Automatic text translation before TTS
- Language-appropriate voice selection
- Translation metadata in response headers

**Request:**
```json
{
  "text": "Hello, how are you?",
  "targetLanguage": "hi",
  "config": {
    "voice": {
      "ssmlGender": "FEMALE"
    },
    "audioConfig": {
      "speakingRate": 1.0,
      "pitch": 0.0
    }
  }
}
```

**Response Headers:**
- `X-Translation-Info`: JSON string with translation details
- `X-Language-Used`: Final language used for TTS
- `X-TTS-Language`: TTS language code used

**Response Body:** Audio file (MP3)

## Language Priority

The API determines the target language in this order:

1. **Request body** `targetLanguage` field (highest priority)
2. **Query parameter** `?lang=<code>`
3. **Request header** `x-language: <code>`
4. **Accept-Language header** (browser default)
5. **Default** to English (`en`)

## Error Handling

If translation fails, the API will:
- Return the original English text
- Include error information in the response
- Continue processing the request

**Example error response:**
```json
{
  "message": "Original English text",
  "translatedText": "Original English text",
  "translated": false,
  "translationError": "Translation service unavailable"
}
```

## Usage Examples

### Frontend Integration

```javascript
// React/React Native example
const fetchTranslatedMessage = async (messageType, language) => {
  const response = await fetch(`/api/messages?type=${messageType}&lang=${language}`);
  const data = await response.json();
  return data.message;
};

// Text-to-Speech with translation
const generateSpeech = async (text, language) => {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-language': language
    },
    body: JSON.stringify({ text })
  });
  
  const audioBlob = await response.blob();
  const translationInfo = response.headers.get('X-Translation-Info');
  
  return { audioBlob, translationInfo };
};
```

### cURL Examples

```bash
# Get welcome message in Hindi
curl "http://localhost:3000/api/messages?type=welcome&lang=hi"

# Get features list in Bengali
curl "http://localhost:3000/api/messages?type=features&lang=bn"

# Generate speech in Hindi
curl -X POST "http://localhost:3000/api/tts" \
  -H "Content-Type: application/json" \
  -H "x-language: hi" \
  -d '{"text": "Welcome to our application"}' \
  --output speech_hindi.mp3

# Translate custom text
curl -X POST "http://localhost:3000/api/messages" \
  -H "Content-Type: application/json" \
  -d '{"text": "Custom message", "targetLanguage": "bn"}'
```

## Configuration

### Environment Variables

Make sure these are set in your `.env` file:

```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GCP_API_KEY=your-gcp-api-key
```

### Service Account

Place your Google Cloud service account key file at:
```
./gcp-service-key.json
```

The service account needs these permissions:
- Cloud Translation API
- Cloud Text-to-Speech API

## Extending Language Support

To add more languages:

1. Update `SUPPORTED_LANGUAGES` in `src/utils/translate.js`
2. Add language mapping in TTS route (`src/app/api/tts/route.ts`)
3. Ensure Google Cloud supports the language for both Translation and TTS
4. Update frontend language options

## Best Practices

1. **Cache translations** on the frontend to reduce API calls
2. **Handle fallbacks** gracefully when translation fails
3. **Use appropriate TTS voices** for each language
4. **Test with native speakers** to ensure translation quality
5. **Monitor API usage** to stay within Google Cloud quotas

## Troubleshooting

### Common Issues

1. **Translation not working**: Check Google Cloud API key and permissions
2. **TTS voice not available**: Verify language code mapping in TTS route
3. **Text too long**: API has 5000 character limit after translation
4. **Quota exceeded**: Monitor Google Cloud API usage

### Debug Headers

Check these response headers for debugging:
- `X-Response-Language`: Language used for response
- `X-Translation-Info`: Translation metadata
- `X-Language-Used`: Final language code
- `X-TTS-Language`: TTS language code used