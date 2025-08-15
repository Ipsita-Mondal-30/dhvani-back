# Dhvani PDF Text Extractor Backend

A Next.js backend service for extracting text from PDF files using Node.js libraries and storing the data in Supabase PostgreSQL database.

## Features

- 📄 PDF file upload and processing
- 🔍 Text extraction using `pdf-parse` library
- 🗄️ Data storage in Supabase PostgreSQL
- 🔄 RESTful API endpoints
- 💾 Prisma ORM for database operations
- 🎨 Beautiful frontend interface for testing
- 🌐 **Multilingual support** with automatic translation (English, Hindi, Bengali)
- 🎤 **Text-to-Speech** with language-appropriate voices
- 🔄 **Translation API** powered by Google Cloud Translate

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase PostgreSQL
- **ORM**: Prisma
- **PDF Processing**: pdf-parse
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://hwedozsnqfayouumvvyq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3ZWRvenNucWZheW91dW12dnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NDIzNDUsImV4cCI6MjA2NzExODM0NX0.9kgoZ0kW2ffh-07XApFsRhHzx6x0YURieCfV9BBbpAw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3ZWRvenNucWZheW91dW12dnlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU0MjM0NSwiZXhwIjoyMDY3MTE4MzQ1fQ.FDjF4llQwqoiwA8SLABQI3ljG0tiJO-tfdnNEYdxjB8

# Database Configuration
DATABASE_URL="postgresql://postgres.hwedozsnqfayouumvvyq:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.hwedozsnqfayouumvvyq:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Google Cloud Configuration (for Translation & TTS)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GCP_API_KEY=your-gcp-api-key
```

**Important**: Replace `[YOUR-PASSWORD]` with your actual Supabase database password.

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Generate Prisma client and run migrations:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Endpoints

### PDF Endpoints

#### POST /api/pdf/upload
Upload a PDF file and extract text.

#### GET /api/pdf
Get all PDF documents.

#### GET /api/pdf/[id]
Get a specific PDF document by ID.

#### DELETE /api/pdf/[id]
Delete a PDF document by ID.

### Multilingual Endpoints

#### GET /api/messages
Get localized messages and instructions.

**Query Parameters:**
- `lang`: Language code (`en`, `hi`, `bn`)
- `type`: Message type (`welcome`, `instructions`, `features`)

**Example:**
```bash
GET /api/messages?type=welcome&lang=hi
```

#### POST /api/messages
Translate custom text.

**Request Body:**
```json
{
  "text": "Your text here",
  "targetLanguage": "hi"
}
```

#### POST /api/tts
Enhanced Text-to-Speech with automatic translation.

**Request Body:**
```json
{
  "text": "Hello world",
  "targetLanguage": "hi",
  "config": {
    "voice": {
      "ssmlGender": "FEMALE"
    }
  }
}
```

**Headers:**
- `x-language`: Preferred language
- `X-Translation-Info`: Translation metadata (response)

## Multilingual Support

The API supports **English (en)**, **Hindi (hi)**, and **Bengali (bn)**.

### How to Request Data in Different Languages

1. **Query Parameter**: `?lang=hi`
2. **Request Header**: `x-language: bn`
3. **Request Body**: `"targetLanguage": "hi"`

**Example:**
```bash
# Get welcome message in Hindi
curl "http://localhost:3000/api/messages?type=welcome&lang=hi"

# Generate speech in Bengali
curl -X POST "http://localhost:3000/api/tts" \
  -H "Content-Type: application/json" \
  -H "x-language: bn" \
  -d '{"text": "Welcome to our application"}'
```

For detailed multilingual API documentation, see [MULTILINGUAL_API.md](./MULTILINGUAL_API.md).

## Database Schema

### PDFDocument Table

- `id`: String (Primary Key)
- `filename`: String
- `originalName`: String
- `fileSize`: Integer
- `mimeType`: String
- `extractedText`: String (Optional)
- `filePath`: String (Optional)
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Usage from React Native

You can send PDF files to this backend from your React Native app:

```javascript
const uploadPDF = async (fileUri) => {
  const formData = new FormData();
  formData.append("file", {
    uri: fileUri,
    type: "application/pdf",
    name: "document.pdf",
  });

  const response = await fetch("http://your-backend-url/api/pdf/upload", {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const result = await response.json();
  return result;
};
```

## Project Structure

```
dhvani-backend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── pdf/
│   │   │       ├── route.ts
│   │   │       ├── upload/
│   │   │       │   └── route.ts
│   │   │       └── [id]/
│   │   │           └── route.ts
│   │   └── page.tsx
│   └── lib/
│       ├── config.ts
│       ├── supabase.ts
│       ├── prisma.ts
│       └── pdf-processor.ts
├── prisma/
│   └── schema.prisma
└── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
