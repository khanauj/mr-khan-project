# AI-Powered Career & Skills Advisor - Frontend

Modern, responsive React frontend for the AI-Powered Career & Skills Advisor application.

## 🚀 Features

- **Modern UI/UX**: Clean, minimal design with smooth animations
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Fast Performance**: Built with Vite for lightning-fast development and builds
- **Beautiful Animations**: Framer Motion for smooth, professional animations
- **7 Complete Pages**: All pages fully implemented and functional

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Production-ready motion library
- **React Router** - Declarative routing for React
- **Axios** - Promise-based HTTP client
- **Lucide React** - Beautiful icon library

## 📦 Installation

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env and set your FastAPI backend URL
   # Default: VITE_API_URL=http://localhost:8000
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## 🏗️ Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

Preview production build:
```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx       # Navigation bar
│   │   ├── Footer.jsx       # Footer component
│   │   ├── AnimatedButton.jsx # Animated button component
│   │   ├── SkillCard.jsx    # Skill display card
│   │   └── Chatbot.jsx      # Floating chatbot component
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Landing page
│   │   ├── Profile.jsx      # User profile form
│   │   ├── Dashboard.jsx    # Career prediction dashboard
│   │   ├── SkillGap.jsx     # Skill gap analysis
│   │   ├── ResumeMatch.jsx  # Resume-job matching
│   │   ├── CareerSwitch.jsx # Career switch roadmap
│   │   └── Chatbot.jsx      # Full-page chatbot
│   ├── services/            # API services
│   │   └── api.js           # API client (Axios)
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # App entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── package.json             # Dependencies and scripts
```

## 🎨 Pages & Features

### 1. Landing Page (`/`)
- Hero section with animated headline
- Feature cards with hover effects
- Call-to-action buttons
- Smooth scroll animations

### 2. User Profile Page (`/profile`)
- Form for education, skills, interest, experience
- Multi-select skill chips
- Experience slider
- Form validation and error handling

### 3. Career Prediction Dashboard (`/dashboard`)
- Displays predicted career with confidence score
- Animated progress bar
- Career insights and recommendations
- Next steps guidance

### 4. Skill Gap Analysis (`/skill-gap`)
- Current skills display (green badges)
- Missing skills identification (red badges)
- Readiness level indicator
- Interactive skill selection

### 5. Resume-Job Matching (`/resume-match`)
- Dual text areas for resume and job description
- Circular match percentage chart
- Missing keywords list
- Match insights and tips

### 6. Career Switch Roadmap (`/career-switch`)
- Timeline-style roadmap visualization
- Step-by-step progression with animations
- Task lists for each stage
- Duration estimates

### 7. AI Career Chatbot (`/chatbot`)
- Full-page chat interface
- Real-time messaging
- Typing indicators
- Smooth message animations

## 🎭 Design System

### Colors
- **Primary**: Blue gradient (from-primary-500 to-primary-600)
- **Background**: Dark gradient (dark-900, dark-800)
- **Text**: Gray scale with white accents
- **Status Colors**:
  - Success: Green (green-400, green-500)
  - Warning: Yellow (yellow-400, yellow-500)
  - Error: Red (red-400, red-500)

### Components
- **Glass Cards**: Frosted glass effect with backdrop blur
- **Animated Buttons**: Hover and click animations
- **Skill Badges**: Color-coded skill indicators
- **Progress Bars**: Animated progress indicators

### Typography
- **Headings**: Bold, gradient text for emphasis
- **Body**: Clean, readable gray text
- **Font Sizes**: Responsive sizing (sm, base, lg, xl, 2xl, etc.)

## 🔌 API Integration

The frontend connects to the FastAPI backend using Axios. All API calls are centralized in `src/services/api.js`.

### API Endpoints Used:
- `POST /predict-career` - Career prediction
- `POST /skill-gap` - Skill gap analysis
- `POST /resume-match` - Resume matching
- `POST /api/chat` - AI chatbot (optional)

### Error Handling:
- Network errors are caught and displayed to users
- Graceful fallbacks for missing endpoints
- Loading states for all async operations

## 🎬 Animations

All animations use Framer Motion for smooth, performant motion:

- **Page Transitions**: Fade and slide effects
- **Card Animations**: Scale and hover effects
- **Loading States**: Spinner and skeleton loaders
- **Micro-interactions**: Button clicks, hover states
- **Scroll Animations**: Elements animate on scroll into view

## 📱 Responsive Design

The app is fully responsive:
- **Mobile**: Single column layout, stacked components
- **Tablet**: 2-column grid for feature sections
- **Desktop**: Multi-column layouts, optimal spacing

Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 🐛 Troubleshooting

### API Connection Issues
- Ensure backend is running on the correct port (default: 8000)
- Check `.env` file has correct `VITE_API_URL`
- Verify CORS is enabled on backend if accessing from different origin

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check `tailwind.config.js` includes all content paths
- Verify PostCSS is installed and configured

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy!

### Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Set environment variables
4. Deploy!

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📝 License

For academic and portfolio purposes.

## 👨‍💻 Development Notes

- Uses functional components with hooks
- No class components
- Follows React best practices
- Clean, readable code with comments
- Modular and reusable components
- Proper error boundaries (can be added)

---

**Built with ❤️ using React, Vite, Tailwind CSS, and Framer Motion**
