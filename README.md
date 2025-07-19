# MindSpace – Mental Wellness Web App

## Quick Start

1. **Sign up for Supabase**: https://supabase.com/ and create a new project.
2. **Set up tables**: journals, moods, users (see guide above).
3. **Get your Supabase Project URL and API Key** from Project Settings > API.
4. **Create `.env.local`** in your project root:
    ```
    SUPABASE_URL=your_supabase_url
    SUPABASE_ANON_KEY=your_supabase_anon_key
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    NEXTAUTH_URL=http://localhost:3000
    ```

5. **Install dependencies**:
    ```
    npm install
    ```

6. **Run locally**:
    ```
    npm run dev
    ```

7. **Deploy on Vercel**: https://vercel.com/ (import your GitHub repo, add your env variables).

## Features

- Journaling with writing prompts
- Mood tracking and visualization
- Rule-based AI chatbot for stress and anxiety
- Secure Google OAuth login
- Personalized dashboard