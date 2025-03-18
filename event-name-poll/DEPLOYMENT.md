# Deployment Guide for Event Name Poll

This guide provides step-by-step instructions for deploying your Event Name Poll application to various platforms.

## Option 1: GitHub Pages (Easiest)

GitHub Pages is a free hosting service that makes it simple to publish static websites directly from a GitHub repository.

1. **Create a GitHub repository**
   - Go to [GitHub](https://github.com) and create a new repository
   - Name it something like `event-name-poll`

2. **Initialize Git in your local project folder**
   ```bash
   cd C:\Users\hp\CascadeProjects\event-name-poll
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Connect to your GitHub repository**
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/event-name-poll.git
   git push -u origin main
   ```

4. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click on "Settings"
   - Scroll down to "GitHub Pages" section
   - Select the branch you want to deploy (usually `main`)
   - Click "Save"
   - Your site will be published at `https://YOUR-USERNAME.github.io/event-name-poll/`

## Option 2: Netlify (Free and Easy)

Netlify offers free hosting for static websites with a simple drag-and-drop interface.

1. **Go to [Netlify](https://www.netlify.com/) and create an account**

2. **Deploy your site**
   - Click on "New site from Git" if you want to connect to a GitHub repository
   - Or simply drag and drop your entire project folder onto the Netlify dashboard

3. **Configure your site**
   - Give your site a custom name in the site settings
   - Your site will be available at `https://your-site-name.netlify.app`

## Option 3: Vercel (Free and Developer-Friendly)

Vercel is another excellent platform for hosting static websites.

1. **Go to [Vercel](https://vercel.com/) and create an account**

2. **Install Vercel CLI (optional)**
   ```bash
   npm install -g vercel
   ```

3. **Deploy your site**
   - Using the dashboard: Import your GitHub repository
   - Using the CLI: Run `vercel` in your project directory

4. **Configure your site**
   - Your site will be available at `https://your-project-name.vercel.app`

## Option 4: Using a Python HTTP Server (Temporary)

For quick testing or sharing on a local network:

1. **Install Python** (if not already installed)

2. **Start a simple HTTP server**
   ```bash
   # Navigate to your project directory
   cd C:\Users\hp\CascadeProjects\event-name-poll
   
   # For Python 3
   python -m http.server 8000
   
   # For Python 2
   python -m SimpleHTTPServer 8000
   ```

3. **Access your site**
   - Local access: `http://localhost:8000`
   - Network access: `http://YOUR-IP-ADDRESS:8000`

## Option 5: Using a Node.js Server

If you want to use the included Node.js server:

1. **Install Node.js and npm** (if not already installed)
   - Download from [nodejs.org](https://nodejs.org/)

2. **Install dependencies**
   ```bash
   cd C:\Users\hp\CascadeProjects\event-name-poll
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access your site**
   - Local access: `http://localhost:3000`

## Sharing Your Poll

Once deployed, you can share the URL with your team members so they can vote on the event names. Make sure to:

1. Test the application before sharing
2. Provide clear instructions to your team
3. Set a deadline for voting if needed

## Troubleshooting

- **404 Errors**: Make sure all file paths are correct
- **CORS Issues**: If using APIs, ensure CORS is properly configured
- **Local Storage Not Working**: Make sure users are using modern browsers
- **Deployment Fails**: Check the platform's error logs for specific issues
