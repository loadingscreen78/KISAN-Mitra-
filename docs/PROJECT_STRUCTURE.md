# 📁 Kisan Mitra - Project Structure

## Overview

This document provides a comprehensive overview of the project's file organization and architecture.

---

## 🗂️ Directory Structure

```
kisanmitra/
│
├── 📂 backend/                          # Python Flask Backend
│   ├── 📂 database/                     # Database Layer
│   │   ├── __init__.py                 # Package initialization
│   │   ├── models.py                   # SQLAlchemy models (User, Diagnosis, Listing, etc.)
│   │   └── init_db.py                  # Database initialization & migrations
│   │
│   ├── plant_diagnosis_api.py          # Main Flask server
│   ├── mitra_chat_api.py               # AI Chat assistant API
│   ├── auth_endpoints.py               # Authentication routes (login, signup)
│   ├── auth_utils.py                   # Auth middleware & utilities
│   ├── supabase_db.py                  # Supabase integration layer
│   └── __init__.py                     # Package initialization
│
├── 📂 src/                              # React Frontend Source
│   ├── 📂 components/                   # React Components
│   │   ├── 📂 ui/                      # shadcn/ui Components
│   │   │   ├── button.tsx              # Button component
│   │   │   ├── card.tsx                # Card component
│   │   │   ├── dialog.tsx              # Dialog/Modal component
│   │   │   ├── input.tsx               # Input component
│   │   │   ├── toast.tsx               # Toast notification
│   │   │   └── ... (50+ UI components)
│   │   │
│   │   ├── AuthButton.tsx              # Authentication button
│   │   ├── CustomInput.tsx             # Custom form input
│   │   ├── LanguageSwitcher.tsx        # i18n language switcher
│   │   ├── LocationPicker.tsx          # Location selection
│   │   ├── NotificationPanel.tsx       # Notifications display
│   │   ├── PlantHealthCard.tsx         # Diagnosis result card
│   │   ├── VoiceAssistant.tsx          # Voice interaction
│   │   └── TextChatFallback.tsx        # Text chat UI
│   │
│   ├── 📂 pages/                        # Route Pages
│   │   ├── Landing.tsx                 # Landing page (/)
│   │   ├── Splash.tsx                  # Splash screen
│   │   ├── Onboarding.tsx              # Onboarding flow
│   │   ├── Login.tsx                   # Login page
│   │   ├── Signup.tsx                  # Signup page
│   │   ├── Home.tsx                    # Dashboard (/home)
│   │   ├── Diagnose.tsx                # Disease diagnosis
│   │   ├── DiagnoseResults.tsx         # Diagnosis results
│   │   ├── Mitra.tsx                   # AI chat assistant
│   │   ├── Weather.tsx                 # Weather forecast
│   │   ├── Shop.tsx                    # Marketplace
│   │   ├── Cart.tsx                    # Shopping cart
│   │   ├── Profile.tsx                 # User profile
│   │   ├── Guides.tsx                  # Crop cultivation guides
│   │   ├── Advisory.tsx                # Farming advisory
│   │   ├── SoilHealth.tsx              # Soil health monitoring
│   │   ├── FertilizerGuide.tsx         # Fertilizer recommendations
│   │   └── ... (30+ pages)
│   │
│   ├── 📂 hooks/                        # Custom React Hooks
│   │   ├── use-mobile.tsx              # Mobile detection hook
│   │   ├── use-toast.ts                # Toast notification hook
│   │   ├── useGeolocation.tsx          # Geolocation hook
│   │   ├── useLocation.ts              # Location state hook
│   │   └── useNotifications.tsx        # Notifications hook
│   │
│   ├── 📂 lib/                          # Utilities & Services
│   │   ├── apiConfig.ts                # API configuration
│   │   ├── authService.ts              # Authentication service
│   │   ├── dataService.ts              # Data fetching service
│   │   ├── weather.ts                  # Weather API integration
│   │   ├── marketData.ts               # Market data service
│   │   ├── cart.ts                     # Shopping cart logic
│   │   ├── places.ts                   # Places/location service
│   │   └── utils.ts                    # Common utilities
│   │
│   ├── 📂 locales/                      # Internationalization
│   │   ├── en.json                     # English translations
│   │   └── hi.json                     # Hindi translations
│   │
│   ├── 📂 assets/                       # Static Assets
│   │   ├── farmer-hero.jpg             # Hero image
│   │   ├── kisanmitra-logo.jpg         # App logo
│   │   ├── onboarding-1.png            # Onboarding screen 1
│   │   ├── onboarding-2.png            # Onboarding screen 2
│   │   ├── onboarding-3.png            # Onboarding screen 3
│   │   └── splash-bg.jpg               # Splash background
│   │
│   ├── 📂 styles/                       # CSS Styles
│   │   └── mobile-fixes.css            # Mobile-specific fixes
│   │
│   ├── App.tsx                         # Root React component
│   ├── App.css                         # App-level styles
│   ├── main.tsx                        # React entry point
│   ├── index.css                       # Global CSS (Tailwind)
│   ├── i18n.ts                         # i18next configuration
│   └── vite-env.d.ts                   # Vite type definitions
│
├── 📂 public/                           # Public Static Files
│   ├── 📂 assets/                       # Public assets
│   │   ├── kisanmitra-logo-clean.png   # Clean logo (transparent)
│   │   └── kisanmitra-logo.jpg         # Logo with background
│   ├── favicon.ico                     # Browser favicon
│   ├── robots.txt                      # SEO robots file
│   └── fertilizervoice.mp3             # Audio file
│
├── 📂 tests/                            # Test Suite
│   ├── test_diagnosis.py               # Diagnosis API tests
│   ├── test_auth.py                    # Authentication tests
│   ├── test_api_keys.py                # API key validation tests
│   ├── test_complete_system.py         # End-to-end tests
│   ├── test_gemini_direct.py           # Gemini AI tests
│   ├── test_gemini_voice.py            # Voice assistant tests
│   ├── test_image_upload.py            # Image upload tests
│   ├── test_simple_endpoints.py        # Basic endpoint tests
│   └── test_supabase_connection.py     # Database connection tests
│
├── 📂 docs/                             # Documentation
│   ├── 📂 screenshots/                  # App screenshots
│   │   └── .gitkeep                    # Placeholder
│   ├── SETUP.md                        # Detailed setup guide
│   ├── GITHUB_UPLOAD_INSTRUCTIONS.md   # GitHub upload guide
│   └── PROJECT_STRUCTURE.md            # This file
│
├── 📂 shared/                           # Shared Code (Frontend/Backend)
│   └── schema.ts                       # Shared TypeScript types
│
├── 📂 node_modules/                     # Node.js dependencies (gitignored)
├── 📂 dist/                             # Build output (gitignored)
├── 📂 .git/                             # Git repository
│
├── 📄 .env                              # Environment variables (gitignored)
├── 📄 .env.example                      # Environment template
├── 📄 .gitignore                        # Git ignore rules
├── 📄 capacitor.config.ts               # Capacitor mobile config
├── 📄 components.json                   # shadcn/ui config
├── 📄 CONTRIBUTING.md                   # Contribution guidelines
├── 📄 drizzle.config.ts                 # Drizzle ORM config
├── 📄 eslint.config.js                  # ESLint configuration
├── 📄 index.html                        # HTML entry point
├── 📄 LICENSE                           # MIT License
├── 📄 package.json                      # Node.js dependencies
├── 📄 package-lock.json                 # Locked dependency versions
├── 📄 postcss.config.js                 # PostCSS config
├── 📄 README.md                         # Main documentation
├── 📄 requirements.txt                  # Python dependencies
├── 📄 supabase_tables.sql               # Database schema SQL
├── 📄 tailwind.config.ts                # Tailwind CSS config
├── 📄 tsconfig.json                     # TypeScript config
├── 📄 tsconfig.app.json                 # App-specific TS config
├── 📄 tsconfig.node.json                # Node-specific TS config
└── 📄 vite.config.ts                    # Vite build config
```

---

## 📊 File Count Summary

| Directory | Files | Purpose |
|-----------|-------|---------|
| `/backend` | 10 | Python Flask API & database |
| `/src/components` | 70+ | React UI components |
| `/src/pages` | 35+ | Application pages/routes |
| `/src/hooks` | 5 | Custom React hooks |
| `/src/lib` | 9 | Utilities & services |
| `/src/locales` | 2 | i18n translations |
| `/tests` | 9 | Test suites |
| `/docs` | 3 | Documentation |
| `/public` | 5 | Static assets |
| **Root** | 20 | Config & metadata |
| **Total** | ~170 | Source files |

---

## 🎯 Key Files Explained

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Node.js dependencies and scripts |
| `requirements.txt` | Python dependencies |
| `vite.config.ts` | Vite build configuration |
| `tsconfig.json` | TypeScript compiler options |
| `tailwind.config.ts` | Tailwind CSS customization |
| `capacitor.config.ts` | Mobile app configuration |
| `.env.example` | Environment variable template |
| `.gitignore` | Git exclusion rules |

### Entry Points

| File | Purpose |
|------|---------|
| `index.html` | HTML template |
| `src/main.tsx` | React application entry |
| `src/App.tsx` | Root React component |
| `backend/plant_diagnosis_api.py` | Flask server entry |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation |
| `docs/SETUP.md` | Installation & setup guide |
| `docs/GITHUB_UPLOAD_INSTRUCTIONS.md` | GitHub deployment guide |
| `CONTRIBUTING.md` | Contribution guidelines |
| `LICENSE` | MIT License |

---

## 🔧 Technology Stack by Directory

### `/backend` - Python Stack
- **Flask 3.1.2** - Web framework
- **SQLAlchemy 2.0.43** - ORM
- **Transformers 4.36.2** - HuggingFace AI models
- **Pillow 11.3.0** - Image processing
- **Supabase 2.8.1** - Auth & database client

### `/src` - Frontend Stack
- **React 18.3.1** - UI library
- **TypeScript 5.8.3** - Type safety
- **Vite 5.4.19** - Build tool
- **Tailwind CSS 3.4.17** - Styling
- **shadcn/ui** - Component library
- **React Router 6.30.1** - Routing
- **TanStack Query 5.83.0** - Data fetching
- **i18next 25.5.2** - Internationalization

### `/tests` - Testing Stack
- **pytest** - Python testing
- **unittest** - Python unit tests
- Custom test suites

---

## 📦 Build Outputs (Gitignored)

These directories are generated during build and **not committed to Git**:

```
node_modules/        # npm packages (500MB+)
dist/                # Production build output
.cache/              # Build cache
.vite/               # Vite cache
__pycache__/         # Python bytecode
*.pyc                # Compiled Python files
.env                 # Environment secrets
```

---

## 🚀 How to Navigate

### For Frontend Development:
1. Start in `/src/pages/` to find route components
2. Check `/src/components/` for reusable UI
3. Use `/src/lib/` for services and utilities
4. Modify `/src/index.css` for global styles

### For Backend Development:
1. Start in `/backend/plant_diagnosis_api.py` - main server
2. Check `/backend/database/models.py` for data models
3. See `/backend/auth_endpoints.py` for auth routes
4. Review `/backend/supabase_db.py` for DB operations

### For Testing:
1. Navigate to `/tests/` directory
2. Run `pytest tests/` for backend tests
3. Check individual test files for specific features

### For Documentation:
1. Read `README.md` for overview
2. Check `docs/SETUP.md` for installation
3. See `docs/GITHUB_UPLOAD_INSTRUCTIONS.md` for deployment

---

## 📝 Naming Conventions

### Files
- **React Components**: PascalCase (`HomePage.tsx`, `UserProfile.tsx`)
- **Utilities**: camelCase (`apiConfig.ts`, `authService.ts`)
- **Tests**: snake_case with `test_` prefix (`test_diagnosis.py`)
- **Config**: kebab-case or standard names (`vite.config.ts`, `.gitignore`)

### Directories
- **Root folders**: lowercase (`backend`, `src`, `docs`)
- **Component folders**: lowercase (`components`, `pages`)
- **Special folders**: PascalCase for component-specific (`ui`)

---

## 🔐 Security Notes

### Files Never Committed (in .gitignore):
- `.env` - Contains API keys and secrets
- `node_modules/` - Third-party packages
- `dist/` - Build outputs
- `__pycache__/` - Python cache
- `*.pyc` - Compiled Python
- `*.log` - Log files
- `*.db` - Local databases

### Files Always Committed:
- `.env.example` - Template (no secrets)
- Source code (`.ts`, `.tsx`, `.py`)
- Configuration files
- Documentation

---

## 📈 Project Metrics

- **Total Lines of Code**: ~38,000+
- **React Components**: 70+
- **API Endpoints**: 20+
- **Database Models**: 5
- **Test Suites**: 9
- **Supported Languages**: 2 (English, Hindi)
- **Supported Platforms**: Web, Android, iOS

---

## 🎓 Learning Path

**For New Contributors:**

1. **Start Here**: `README.md`
2. **Setup**: `docs/SETUP.md`
3. **Code Style**: `CONTRIBUTING.md`
4. **Structure**: This file
5. **API Docs**: Coming soon in `/docs`

**Then Explore:**
- `/src/pages/Home.tsx` - Dashboard example
- `/backend/plant_diagnosis_api.py` - API example
- `/src/components/ui/` - Component library
- `/tests/` - Testing examples

---

## 🔄 Git Workflow

```bash
# Check current state
git status

# View file tree
tree -L 2          # Linux/Mac
# or
dir /s /b          # Windows

# Check specific directory
ls src/pages/      # Linux/Mac
dir src\pages\     # Windows
```

---

## 📞 Questions?

If you're unsure where a file should go:

- **React components** → `/src/components/`
- **Page components** → `/src/pages/`
- **API routes** → `/backend/`
- **Tests** → `/tests/`
- **Documentation** → `/docs/`
- **Static assets** → `/public/`
- **Config files** → Root directory

---

**Last Updated**: 2025-01-13  
**Maintainer**: Kisan Mitra Team

