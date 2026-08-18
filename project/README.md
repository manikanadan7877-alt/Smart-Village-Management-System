# AI-Based Smart Village Management System (Digital Twin Village)

A web-based application that creates a digital representation of a village where citizens can report public infrastructure issues with photos and map locations, and administrators can monitor resources, track complaints, and view analytics dashboards. An AI module automatically classifies complaint images and assigns priority levels.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS 3 |
| Maps | Leaflet.js + OpenStreetMap |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router DOM 6 |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| AI Module | Supabase Edge Function (Deno runtime) |

## Features

- **Two roles**: Citizen and Admin with separate dashboards and access levels
- **Complaint submission** with photo upload, interactive map location pinning, and AI-powered image classification
- **Interactive village map** showing all complaints, water tanks, and garbage bins as color-coded markers
- **Complaint tracking** with search, filters, status timeline, and AI analysis display
- **Water tank monitoring** with percentage bars, low-water alerts, and quick level adjustment
- **Garbage bin management** with fill-level tracking, collection alerts, and "mark as collected"
- **Analytics dashboard** with 7-day trend chart, status pie chart, category bar chart, and resource monitoring
- **Profile management** for updating personal information
- **Row Level Security** on all database tables for secure data access

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** v18 or higher — download from https://nodejs.org
2. **Git** — download from https://git-scm.com
3. **VS Code** — download from https://code.visualstudio.com
4. A **Supabase account** (free tier works) — sign up at https://supabase.com
5. A **GitHub account** — sign up at https://github.com

## Setup Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/smart-village-management-system.git
cd smart-village-management-system
```

### Step 2: Open in VS Code

```bash
code .
```

Or open VS Code manually and select File > Open Folder, then choose the project folder.

### Step 3: Install Dependencies

Open the VS Code terminal (Ctrl+` or Cmd+`), then run:

```bash
npm install
```

### Step 4: Set Up Supabase

1. Go to https://supabase.com and sign in
2. Click **New Project**
3. Fill in:
   - **Name**: Smart Village Management System
   - **Database Password**: Set a strong password and save it
   - **Region**: Choose the closest to you
4. Wait 2-3 minutes for provisioning to complete
5. Once ready, go to **Settings > API** (or the gear icon > API)
6. Copy these two values:
   - **Project URL** — looks like `https://xxxxx.supabase.co`
   - **anon public key** — a long JWT string

### Step 5: Configure Environment Variables

1. In the project root, copy the example file:

```bash
cp .env.example .env
```

2. Open `.env` in VS Code and paste your Supabase values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file

### Step 6: Apply the Database Migration

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open the file `supabase/migrations/20260728131929_create_smart_village_schema.sql` from the project
4. Copy the entire SQL content and paste it into the Supabase SQL Editor
5. Click **Run** — this creates all tables, RLS policies, triggers, and the storage bucket
6. To add sample data (water tanks and garbage bins), run this after the migration:

```sql
INSERT INTO public.water_tanks (name, location_label, latitude, longitude, capacity_liters, current_level_liters)
VALUES
  ('North Colony Tank', 'North Residential Colony', 13.0878, 80.2785, 10000, 3200),
  ('Market Square Tank', 'Village Market Area', 13.0830, 80.2700, 15000, 14500),
  ('School Zone Tank', 'Near Government School', 13.0900, 80.2810, 8000, 7500);

INSERT INTO public.garbage_bins (name, location_label, latitude, longitude, capacity_liters, current_level_liters)
VALUES
  ('Main Street Bin 1', 'Main Street Junction', 13.0850, 80.2750, 500, 480),
  ('Park Bin A', 'Central Park Entrance', 13.0860, 80.2760, 400, 90),
  ('Market Bin B', 'Vegetable Market Back', 13.0835, 80.2705, 600, 580),
  ('School Bin', 'School Gate', 13.0900, 80.2812, 300, 120);
```

### Step 7: Deploy the AI Edge Function

1. In Supabase dashboard, go to **Edge Functions** (left sidebar)
2. Click **Deploy a new function**
3. Set the function name to: `classify-complaint`
4. Paste the contents of `supabase/functions/classify-complaint/index.ts` from the project
5. Click **Deploy**
6. Make sure **Verify JWT** is enabled

### Step 8: Run the Project

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Step 9: Create Your First Account

1. Open `http://localhost:5173` in your browser
2. Click **Sign up**
3. Fill in your name, email, password
4. Choose **Admin** role (to access all features)
5. You'll be taken to the dashboard

## VS Code Recommended Extensions

Open VS Code Extensions (Ctrl+Shift+X) and install:

- **ES7+ React/Redux/React-Native snippets** — by dsznajder
- **Tailwind CSS IntelliSense** — by Tailwind Labs
- **TypeScript Vue Plugin (Volar)** — for TS support
- **Prettier** — code formatter
- **ESLint** — by Microsoft

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (localhost:5173) |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run typecheck` | Run TypeScript type checking |

## Project Structure

```
smart-village-management-system/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Badges.tsx       # Category, priority, status badges
│   │   ├── Layout.tsx       # Sidebar navigation + header
│   │   ├── Modal.tsx        # Reusable modal dialog
│   │   ├── ProgressBar.tsx  # Level indicators + color helpers
│   │   ├── StatCard.tsx     # Dashboard statistics cards
│   │   └── VillageMap.tsx   # Leaflet map with markers
│   ├── context/
│   │   └── AuthContext.tsx  # Auth state provider
│   ├── lib/
│   │   ├── api.ts           # Supabase API functions
│   │   ├── constants.ts     # Map center, colors
│   │   ├── supabase.ts      # Supabase client init
│   │   └── types.ts         # TypeScript interfaces
│   ├── pages/
│   │   ├── AnalyticsPage.tsx        # Admin charts & reports
│   │   ├── AuthPage.tsx             # Login / signup
│   │   ├── ComplaintDetailPage.tsx  # Single complaint view
│   │   ├── ComplaintsPage.tsx       # Complaint list with filters
│   │   ├── DashboardPage.tsx        # Role-based dashboard
│   │   ├── GarbageBinsPage.tsx      # Garbage bin management
│   │   ├── MapPage.tsx              # Full village map
│   │   ├── ProfilePage.tsx          # User profile
│   │   ├── SubmitComplaintPage.tsx  # New complaint form
│   │   └── WaterTanksPage.tsx       # Water tank management
│   ├── App.tsx              # Router + route guards
│   ├── main.tsx             # App entry point
│   └── index.css            # Tailwind + custom styles
├── supabase/
│   ├── migrations/
│   │   └── ..._create_smart_village_schema.sql  # Database schema
│   └── functions/
│       └── classify-complaint/
│           └── index.ts     # AI classification edge function
├── .env.example             # Template for environment variables
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Database Tables

### profiles
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Links to auth.users |
| full_name | text | User's display name |
| phone | text | Contact number |
| role | text | `citizen` or `admin` |
| created_at | timestamptz | Account creation date |

### complaints
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique complaint ID |
| user_id | uuid | Who submitted it |
| title | text | Short complaint title |
| category | text | road_damage, garbage_overflow, water_leakage, street_light, drainage, other |
| priority | text | high, medium, low |
| description | text | Detailed issue description |
| image_url | text | Path to uploaded photo |
| latitude, longitude | numeric | GPS coordinates |
| location_label | text | Human-readable place name |
| status | text | pending, in_progress, resolved, rejected |
| ai_category | text | AI predicted category |
| ai_confidence | numeric | AI confidence score (0-1) |
| admin_notes | text | Internal admin notes |
| created_at, updated_at | timestamptz | Timestamps |

### water_tanks
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique tank ID |
| name | text | Tank name |
| location_label | text | Location description |
| latitude, longitude | numeric | GPS coordinates |
| capacity_liters | integer | Total capacity |
| current_level_liters | integer | Current water level |

### garbage_bins
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Unique bin ID |
| name | text | Bin name |
| location_label | text | Location description |
| latitude, longitude | numeric | GPS coordinates |
| capacity_liters | integer | Total capacity |
| current_level_liters | integer | Current fill level |

## Pushing to GitHub

### Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Set repository name: `smart-village-management-system`
3. Set to **Public** or **Private** as you prefer
4. **Do not** add a README, .gitignore, or license (the project already has these)
5. Click **Create repository**

### Step 2: Initialize Git and Push

Open terminal in VS Code and run these commands (replace YOUR_USERNAME and YOUR_EMAIL):

```bash
# Configure git (only needed once per machine)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Initialize the repository
git init

# Add all files
git add .

# Create your first commit
git commit -m "AI-Based Smart Village Management System - Digital Twin Village"

# Set the remote and push
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/smart-village-management-system.git
git push -u origin main
```

If you get an auth error, GitHub now requires a Personal Access Token instead of your password:
1. Go to GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Click **Generate new token (classic)**
3. Check the **repo** scope
4. Click **Generate token**
5. Copy the token — use it as your password when prompted

### Step 3: Verify on GitHub

Refresh your GitHub repository page — you should see all project files uploaded.

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env` exists in the project root (not in `src/`)
- Ensure it contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the dev server after creating `.env` (Ctrl+C, then `npm run dev` again)

### Map is not displaying
- Check your internet connection (Leaflet loads map tiles from OpenStreetMap)
- Open browser DevTools (F12) > Console for errors

### Cannot sign up / login
- Verify your Supabase URL and anon key in `.env` are correct
- Ensure the database migration has been run (Step 6)
- Check Supabase dashboard > Authentication > Users to see if users are being created

### AI classification not working
- Ensure the edge function is deployed (Step 7)
- Check Supabase dashboard > Edge Functions > classify-complaint > Logs for errors

### Water tanks / garbage bins pages are empty
- Run the sample data SQL (Step 6, second SQL block)
- Ensure you signed up as Admin (citizens can't add tanks/bins)

### Build errors
- Run `npm install` again to ensure all dependencies are installed
- Run `npm run typecheck` to identify TypeScript errors

## License

This project is for educational purposes as part of a college project.
