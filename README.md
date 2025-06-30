# MindSpace - Mental Wellness Companion

A simple and beginner-friendly mental health journal and chatbot application built with React, Node.js, and Express.

## Features

- 📖 **Journal Entries** - Write and manage your daily thoughts and experiences
- 🎭 **Mood Tracking** - Track your emotions over time with visual insights
- 🤖 **AI Companion** - Chat with a supportive AI for mental health guidance
- 🔍 **Search & Filter** - Find specific journal entries with advanced search
- 👤 **Profile Management** - Manage your personal information and goals
- 📊 **Dashboard** - View your wellness journey with stats and insights

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express.js
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: TanStack React Query
- **Routing**: Wouter
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/mindspace-app.git
cd mindspace-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5000`

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Application pages
│   │   ├── lib/           # Utilities and configuration
│   │   └── hooks/         # Custom React hooks
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data storage layer
├── shared/                # Shared types and schemas
│   └── schema.ts         # Data models
└── package.json          # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features Overview

### 🏠 Dashboard
- View your wellness statistics
- Quick mood logging
- Recent journal entries
- AI companion quick access

### 📖 Journal
- Write detailed journal entries
- Add mood and tags
- Writing prompts for inspiration
- View recent entries

### 🎭 Mood Tracker
- Log daily moods with scores
- Visual mood trends
- Tracking streaks
- Mood statistics

### 🤖 AI Companion
- Supportive mental health conversations
- Quick action buttons for common topics
- Rule-based responses for anxiety, stress, sleep issues
- Chat history management

### 🔍 Search
- Search journal entries by keywords
- Filter by mood and date range
- Tag-based filtering
- Advanced search options

### 👤 Profile
- Personal information management
- Physical details (height, weight)
- Family and relationship status
- Goals and ambitions

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you're experiencing mental health concerns, please reach out to:
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- Or contact your local mental health professional

## Acknowledgments

- Built with love for mental wellness awareness
- Icons by Font Awesome
- UI components by Radix UI and shadcn/ui