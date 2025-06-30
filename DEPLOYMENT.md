# Deployment Guide

## GitHub Deployment

Follow these steps to deploy your MindSpace app to GitHub:

### 1. Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click "New" or "Create repository"
3. Name your repository (e.g., `mindspace-mental-health-app`)
4. Add a description: "Mental health journal and chatbot app built with React and Node.js"
5. Keep it public (or private if you prefer)
6. Don't initialize with README (we already have one)
7. Click "Create repository"

### 2. Initialize Git and Push to GitHub

Open your terminal/command prompt in the project folder and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: MindSpace mental health app"

# Add your GitHub repository as origin (replace with your actual repository URL)
git remote add origin https://github.com/your-username/mindspace-mental-health-app.git

# Push to GitHub
git push -u origin main
```

### 3. Deploy to GitHub Pages (Optional)

To deploy the frontend to GitHub Pages:

1. Install gh-pages package:
```bash
npm install --save-dev gh-pages
```

2. Add deployment scripts to package.json:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://your-username.github.io/mindspace-mental-health-app"
}
```

3. Deploy:
```bash
npm run deploy
```

### 4. Deploy to Vercel (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with your GitHub account
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: Vite
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click "Deploy"

### 5. Deploy to Netlify (Alternative)

1. Go to [netlify.com](https://netlify.com)
2. Sign up/login with your GitHub account
3. Click "New site from Git"
4. Choose GitHub and authorize
5. Select your repository
6. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
7. Click "Deploy site"

### 6. Environment Variables

For production deployment, you may want to add environment variables:

- `MONGODB_URI` - MongoDB connection string
- `OPENAI_API_KEY` - OpenAI API key (optional)
- `NODE_ENV` - Set to "production"

## Database Setup for Production

### Option 1: MongoDB Atlas (Free)
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free account and cluster
3. Get connection string
4. Add to environment variables

### Option 2: Keep In-Memory Storage
The app works perfectly with in-memory storage for personal use or demos.

## Git Workflow

For ongoing development:

```bash
# Make changes to your code
# Add and commit changes
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin main
```

## Troubleshooting

### Common Issues:

1. **Build errors**: Make sure all dependencies are installed with `npm install`
2. **Port conflicts**: The app uses port 5000, make sure it's available
3. **Environment variables**: Check that all required environment variables are set

### Getting Help:

- Check the GitHub Issues section of your repository
- Review the build logs in your deployment platform
- Ensure all dependencies are properly listed in package.json