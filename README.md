# TypeLess AI

**Speak freely. Capture perfectly.**

A full-stack AI-powered voice note-taking application that converts speech to well-formatted text using OpenAI Whisper for transcription and GPT-4o-mini for intelligent text formatting.

## 🎯 Features

### Core Features
- **🔐 User Authentication** - Secure email/password authentication with JWT tokens
- **🎤 Real-time Voice Dictation** - Record audio and get instant transcriptions
- **⚡ Incremental Transcription** - Audio is sliced into 5-second chunks for efficient processing
- **📝 Intelligent Text Formatting** - AI-powered formatting with proper punctuation, capitalization, and grammar
- **📚 Custom Dictionary** - Define word/phrase replacements for accurate transcriptions
- **💾 Persistent Storage** - All transcriptions saved to PostgreSQL database
- **📱 Fully Responsive** - Works seamlessly on mobile, tablet, and desktop
- **🌓 Dark Mode** - Toggle between light and dark themes
- **📋 Copy & Delete** - Easy text management with copy-to-clipboard and delete functionality

### User Experience
- **Real-time Visual Feedback** - Recording animation that responds to voice intensity
- **Loading States** - Clear indicators for transcription and formatting processes
- **Skeleton Loaders** - Smooth loading experience for data fetching
- **Confirmation Modals** - Safe deletion with confirmation dialogs

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router) - React framework with server-side rendering
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible UI components
- **next-themes** - Dark mode support
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **PostgreSQL** - Relational database (hosted on Railway)
- **Drizzle ORM** - Type-safe database queries and migrations
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

### AI Services
- **OpenAI Whisper API** - Speech-to-text transcription
- **OpenAI GPT-4o-mini** - Text formatting and enhancement

## 📁 Project Structure

```
ai-notetaker/
├── src/
│   ├── app/
│   │   ├── (app)/              # Protected app routes
│   │   │   ├── dictation/     # Voice dictation page
│   │   │   ├── dictionary/    # Dictionary management page
│   │   │   ├── settings/      # User settings page
│   │   │   └── layout.tsx     # App layout with sidebar
│   │   ├── (auth)/            # Public auth routes
│   │   │   ├── login/        # Login page
│   │   │   ├── signup/        # Signup page
│   │   │   └── layout.tsx    # Auth layout
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── transcribe-slice/  # Audio slice transcription
│   │   │   ├── transcription/     # Transcription completion
│   │   │   ├── transcriptions/     # Transcription CRUD
│   │   │   ├── dictionary/        # Dictionary CRUD
│   │   │   └── user/              # User profile updates
│   │   ├── layout.tsx        # Root layout with theme provider
│   │   └── globals.css       # Global styles
│   ├── components/           # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── AppSidebar.tsx    # Navigation sidebar
│   │   ├── RecorderButton.tsx
│   │   ├── RecordingAnimation.tsx
│   │   ├── TranscriptionList.tsx
│   │   └── ThemeToggle.tsx
│   ├── hooks/
│   │   └── useAudioRecorder.tsx  # Audio recording logic
│   └── lib/
│       ├── db/
│       │   ├── schema.ts     # Drizzle schema definitions
│       │   └── client.ts     # Database connection
│       ├── auth/
│       │   ├── hash.ts        # Password hashing
│       │   ├── jwt.ts        # JWT utilities
│       │   └── getUserFromReq.ts  # Auth middleware
│       ├── stt/
│       │   └── openai-stt.ts # Whisper API integration
│       └── processing/
│           ├── merge.ts      # Text merging logic
│           ├── stabilizer.ts # Text stabilization
│           └── formatter.ts # GPT formatting
├── drizzle/                  # Database migrations
├── drizzle.config.ts         # Drizzle configuration
├── components.json           # shadcn/ui configuration
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (local or hosted on Railway)
- OpenAI API key with credits

### Installation

1. **Clone the repository**
   ```bash
   cd ai-notetaker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   OPENAI_API_KEY=sk-your-openai-api-key
   JWT_SECRET=your-random-secret-key-here
   ```

4. **Set up the database**
   
   Push the schema to your database:
   ```bash
   npm run drizzle:push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key for Whisper and GPT | Yes |
| `JWT_SECRET` | Secret key for JWT token signing | Yes |

### Getting Your Database URL

**For Railway:**
1. Create a PostgreSQL service on Railway
2. Copy the `DATABASE_URL` from the service variables
3. Use the public URL (note: may incur egress fees) or private URL if available

**For Local PostgreSQL:**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_notetaker
```

## 📊 Database Schema

### Tables

**users**
- `id` (UUID, Primary Key)
- `name` (VARCHAR 200)
- `email` (VARCHAR 200, Unique)
- `password_hash` (TEXT)
- `created_at` (TIMESTAMP)

**transcriptions**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `status` (VARCHAR 50, default: "processing")
- `final_text` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**slices**
- `id` (UUID, Primary Key)
- `transcription_id` (UUID, Foreign Key → transcriptions.id)
- `slice_index` (INTEGER)
- `partial_text` (TEXT)
- `created_at` (TIMESTAMP)

**dictionary**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `phrase` (VARCHAR 200)
- `replacement` (VARCHAR 200)
- `created_at` (TIMESTAMP)

All foreign keys have `ON DELETE CASCADE` for data integrity.

## 🔄 Application Flow

### Voice Dictation Process

1. **User starts recording** → Browser requests microphone access
2. **Audio slicing** → MediaRecorder captures audio in 5-second chunks
3. **Incremental transcription** → Each slice is sent to `/api/transcribe-slice`
4. **Whisper processing** → OpenAI Whisper transcribes each audio slice
5. **Real-time merging** → Frontend merges partial transcriptions as they arrive
6. **User stops recording** → Final chunk is processed
7. **Formatting** → Merged text is sent to `/api/transcription/complete`
8. **Dictionary application** → Custom replacements are applied
9. **GPT formatting** → GPT-4o-mini adds punctuation, capitalization, and fixes grammar
10. **Storage** → Final formatted text is saved to database

### Authentication Flow

1. User signs up/logs in → Credentials validated
2. JWT token generated → Stored in HTTP-only cookie
3. Protected routes check token → Via `/api/auth/me`
4. Unauthorized requests → Redirected to login

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Clear authentication cookie
- `GET /api/auth/me` - Get current user info

### Transcription
- `POST /api/transcribe-slice` - Transcribe audio slice (Whisper)
- `POST /api/transcription/complete` - Complete and format transcription
- `GET /api/transcriptions` - Get all user transcriptions
- `DELETE /api/transcriptions/[id]` - Delete a transcription

### Dictionary
- `GET /api/dictionary` - Get all dictionary entries
- `POST /api/dictionary` - Create new dictionary entry
- `PATCH /api/dictionary/[id]` - Update dictionary entry
- `DELETE /api/dictionary` - Delete dictionary entry

### User
- `PATCH /api/user/update` - Update user name

## 🚢 Deployment

### Deploying to Railway

1. **Create a Railway account** and install the Railway CLI (optional)

2. **Create a new project** on Railway

3. **Add PostgreSQL service**
   - Create a new PostgreSQL service
   - Copy the `DATABASE_URL` to your environment variables

4. **Deploy your Next.js app**
   - Connect your GitHub repository
   - Or use Railway CLI: `railway up`

5. **Set environment variables** in Railway dashboard:
   - `DATABASE_URL` (from PostgreSQL service)
   - `OPENAI_API_KEY`
   - `JWT_SECRET`

6. **Run database migrations**
   ```bash
   railway run npm run drizzle:push
   ```

7. **Your app is live!** 🎉

### Build for Production

```bash
npm run build
npm start
```

## 💡 Usage Guide

### Creating an Account
1. Navigate to the signup page
2. Enter your name, email, and password (min 6 characters)
3. Click "Sign Up"
4. You'll be automatically logged in and redirected to the dictation page

### Recording Voice Notes
1. Click "Start Recording" button
2. Speak into your microphone
3. Watch the real-time recording animation
4. Click "Stop Recording" when finished
5. Wait for transcription and formatting to complete
6. Copy the formatted text using the copy button

### Managing Dictionary
1. Go to the Dictionary page
2. Add entries: phrase (as spoken) → replacement (how it should appear)
3. Edit entries: Click the edit icon, modify, and save
4. Delete entries: Click the delete icon and confirm

### Settings
- Update your name
- Toggle between light and dark mode
- Logout from your account

## 🎨 UI Components

Built with **shadcn/ui** components:
- Button, Card, Input, Label
- AlertDialog (for confirmations)
- Sheet (for mobile sidebar)
- Skeleton (for loading states)
- Separator, Tooltip

All components are fully responsive and accessible.

## 🔒 Security Features

- **Password Hashing** - bcryptjs with salt rounds
- **JWT Authentication** - Secure token-based auth
- **HTTP-only Cookies** - Prevents XSS attacks
- **User Isolation** - All data queries filtered by user ID
- **Input Validation** - Server-side validation for all inputs

## 🐛 Troubleshooting

### "OpenAI API quota exceeded"
- Add credits to your OpenAI account
- Check your API key is valid
- The app will still return text without GPT formatting if quota is exceeded

### "Database connection failed"
- Verify `DATABASE_URL` is correct
- Check database is accessible
- For Railway, ensure you're using the correct URL (public vs private)

### "Microphone not working"
- Grant browser permissions for microphone
- Check system microphone settings
- Try a different browser

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (18+ required)
- Clear `.next` folder and rebuild

## 📝 Development

### Adding New Features

1. **Database changes**: Update `src/lib/db/schema.ts`, then run `npm run drizzle:push`
2. **API routes**: Add new files in `src/app/api/`
3. **Components**: Add to `src/components/`
4. **Hooks**: Add to `src/hooks/`

### Code Style
- TypeScript strict mode enabled
- ESLint configured for Next.js
- Components use functional React with hooks
- API routes use Next.js App Router conventions

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- OpenAI for Whisper and GPT APIs
- shadcn for beautiful UI components
- Next.js team for the amazing framework
- Railway for easy database hosting

---

**Built with ❤️ for efficient voice-to-text transcription**

