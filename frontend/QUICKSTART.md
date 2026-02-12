# Frontend Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure Environment

Create a `.env` file in the `frontend` directory:

```bash
cp .env.example .env
```

Edit `.env` and set your backend URL:
```
VITE_API_URL=http://localhost:8000
```

### Step 3: Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

## 📋 Prerequisites

- **Node.js** 18+ and npm/yarn
- **Backend running** on http://localhost:8000 (or your configured URL)

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📱 Pages Overview

1. **Home** (`/`) - Landing page with hero and features
2. **Profile** (`/profile`) - User profile form for career prediction
3. **Dashboard** (`/dashboard`) - Career prediction results
4. **Skill Gap** (`/skill-gap`) - Analyze skill gaps
5. **Resume Match** (`/resume-match`) - Match resume with job descriptions
6. **Career Switch** (`/career-switch`) - Career transition roadmap
7. **Chatbot** (`/chatbot`) - Full-page AI chatbot

## 🎨 Features

- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Smooth animations with Framer Motion
- ✅ Dark theme with glassmorphism effects
- ✅ Interactive components with micro-interactions
- ✅ Form validation and error handling
- ✅ Loading states and skeleton loaders
- ✅ Floating chatbot on all pages (except chatbot page)

## 🔧 Troubleshooting

### Port Already in Use
If port 3000 is taken, Vite will automatically use the next available port.

### API Connection Failed
- Ensure backend is running
- Check `.env` file has correct `VITE_API_URL`
- Verify CORS is enabled on backend

### Styling Not Working
- Ensure Tailwind CSS is properly installed
- Check `tailwind.config.js` includes correct content paths
- Clear cache and restart dev server

### Build Errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📦 Production Build

```bash
npm run build
```

The `dist/` folder contains the production build ready for deployment.

## 🚀 Deployment Options

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy!

### Netlify
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variables
5. Deploy!

## 📚 Next Steps

1. Review the full `README.md` for detailed documentation
2. Customize colors in `tailwind.config.js`
3. Modify components in `src/components/`
4. Add new pages in `src/pages/`
5. Update API calls in `src/services/api.js`

---

**Happy Coding! 🎉**
