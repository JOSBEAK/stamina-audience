# Vercel Deployment Guide

## Quick Deployment Steps

Follow these steps to deploy your monorepo to Vercel:

### 1. Prerequisites
- Make sure you have a Vercel account (sign up at https://vercel.com)
- Install Vercel CLI: `npm i -g vercel`

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from Root Directory
```bash
vercel --prod
```

### 4. Configuration
The `vercel.json` file has been created with the following configuration:
- **Build Command**: `npx nx build audience-management-web`
- **Output Directory**: `dist/apps/audience-management-web`
- **Framework**: Static (React/Vite)

### 5. Environment Variables (if needed)
If your app requires environment variables, set them in Vercel dashboard:
- Go to your project settings
- Navigate to "Environment Variables"
- Add any required variables

### 6. Custom Domain (optional)
- Go to your project settings in Vercel
- Navigate to "Domains"
- Add your custom domain

## Alternative: Deploy via GitHub

### 1. Push to GitHub
```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### 2. Connect to Vercel
- Go to https://vercel.com/new
- Import your GitHub repository
- Vercel will automatically detect the `vercel.json` configuration

## What's Deployed

This configuration deploys:
- **Frontend**: The React application (`audience-management-web`)
- **Static Assets**: All built assets from the Vite build
- **Routing**: SPA routing with fallback to index.html

## Troubleshooting

### Build Fails
If the build fails, check:
1. All dependencies are properly installed
2. TypeScript compilation passes
3. No linting errors

### Environment Variables
Make sure to set these in Vercel if needed:
- Database connection strings
- API keys
- Any other secrets

### Performance
The build includes:
- Tree-shaking for optimal bundle size
- Static asset optimization
- Gzip compression

## Backend Service

**Note**: The backend service (`audience-management-service`) is a NestJS application that would need to be deployed separately to a Node.js hosting service like:
- Vercel Functions (for serverless)
- Railway
- Heroku
- AWS/Google Cloud

For a complete full-stack deployment, you might want to consider:
1. Deploy the frontend to Vercel (as above)
2. Deploy the backend to a separate service
3. Update the API endpoints in the frontend to point to the deployed backend

## Next Steps After Deployment

1. Test all functionality on the deployed URL
2. Set up monitoring and analytics
3. Configure custom domain if needed
4. Set up CI/CD for automatic deployments 