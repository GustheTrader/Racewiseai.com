# Racewise AI - Professional Horse Racing Handicapping & Analytics Platform

**Racewise AI** (5D Collective) is an advanced data analytics platform designed for serious handicappers, bettors, and racing enthusiasts. Leverage AI-powered insights, real-time odds tracking, and sophisticated analytical tools to make data-driven decisions in horse racing.

## 🎯 Key Features

### Core Analytics
- **Quantum Rankings** - AI-powered horse ranking system analyzing multiple dimensions
- **5D Model Analysis** - Proprietary analysis framework covering Speed Metrics, Form Cycle, Class Assessment, Connections, and Track Bias
- **Live Odds Tracking** - Real-time race odds monitoring with automatic updates across 14+ major tracks
- **Race Results Dashboard** - Comprehensive race outcome data and historical analysis

### Advanced Tools
- **Exotic Bet Builder** - Intelligent ticket construction and optimization
- **Sharp Money Movement Detection** - Track professional betting activity
- **Pool Analysis** - Will-pay projections and payout analysis
- **Personal Model Builder** - Customizable weighting for personalized analysis
- **Live Paddock Analysis** - Computer vision-based horse performance insights
- **Video Performance Analysis** - AI-powered video-based handicapping
- **AI Race Agent** - Real-time strategic betting recommendations
- **Betting Timeline** - Visual race sequence analysis

### Data Management
- **Automated Web Scraping** - Job-based data collection for odds, results, entries, and payouts
- **Multi-Track Support** - 14+ major racing venues including Belmont, Churchill Downs, Santa Anita, and more
- **Data Import Pipeline** - Odds Pulse API integration and external data sources
- **Admin Dashboard** - Comprehensive data management and system configuration

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - Modern UI framework
- **Vite 5.4** - Lightning-fast build tool
- **TypeScript 5.5** - Type-safe development
- **Tailwind CSS 3.4** - Utility-first styling
- **shadcn/ui** - High-quality React components
- **Recharts 2.12** - Data visualization and charts
- **React Router v6** - Client-side routing
- **React Hook Form 7.53** - Form state management
- **Zod 3.23** - Runtime type validation

### Backend & Services
- **Supabase** - PostgreSQL database, authentication, and edge functions
- **React Query** - Server state management and data fetching
- **Radix UI** - Accessible component primitives

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Supabase project with PostgreSQL database
- Environment variables configured

### Installation

```bash
# Clone the repository
git clone https://github.com/GustheTrader/Racewiseai.com.git
cd Racewiseai.com

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Update .env.local with your Supabase credentials

# Start development server
npm run dev
```

Visit `http://localhost:5173` to access the application.

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── pages/              # Main application routes
├── components/
│   ├── admin/          # Admin dashboard components
│   ├── auth/           # Authentication flows
│   ├── charts/         # Data visualization
│   ├── dashboard/      # Main dashboard UI
│   ├── races/          # Race-related components
│   ├── rankings/       # Quantum rankings display
│   ├── results/        # Race results view
│   ├── ticket/         # Bet ticket builder
│   └── ai-agents/      # AI chat and recommendations
├── contexts/           # React Context providers
├── integrations/       # Supabase and external APIs
├── types/              # TypeScript definitions
├── utils/              # Utility functions
├── data/               # Static and mock data
├── lib/                # Library utilities
└── assets/             # Images and static files
```

## 📊 Database Schema

Key tables in Supabase:
- `profiles` - User accounts with admin role management
- `race_results` - Historical race outcome data
- `scrape_jobs` - Automated data collection job configurations
- `api_connections` - External API credentials and settings

## 🏁 Supported Racing Tracks

Aqueduct, Belmont Park, Churchill Downs, Del Mar, Gulfstream Park, Keeneland, Kentucky Downs, Los Alamitos (Day & Night), Oaklawn Park, Pimlico, Santa Anita, Saratoga, and Hawera (NZ)

## 🔐 Authentication

- **Email-based authentication** - Simplified login without passwords
- **Session persistence** - Automatic login state management
- **Admin role system** - Role-based access control for admin features
- **Supabase auth** - Secure authentication and user management

## 📝 Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run lint         # Run ESLint checks
npm run preview      # Preview production build locally
```

## 🤝 Contributing

Contributions are welcome! Please ensure code follows our linting standards:

```bash
npm run lint
```

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For questions or issues, please open a GitHub issue or contact the development team.

---

**Built with ❤️ for the racing community**
