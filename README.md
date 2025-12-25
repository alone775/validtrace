# ProofWork - Freelancer Proof-of-Work SaaS

A privacy-first proof-of-work tracking application for freelancers and contractors. Track work sessions with evidence-based documentation and generate professional reports for clients.

## Features

### Core Functionality
- **Authentication & User Profiles**: Secure email/password authentication with Supabase
- **Project Management**: Create and manage multiple client projects
- **Work Session Tracking**: Built-in timer for tracking work sessions in real-time
- **Evidence Timeline**: Document work with tasks, commits, milestones, and notes
- **Professional Reports**: Generate beautiful proof-of-work reports with timeline visualization
- **PDF Export**: Export reports as PDFs to share with clients

### Freemium Model
- **Free Tier**: 5 projects, 10 sessions/month, basic reports
- **Pro Tier**: Unlimited projects and sessions, PDF exports, full history
- **Enterprise Tier**: Everything in Pro plus priority support and custom branding

## Tech Stack

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **PDF Generation**: jsPDF + html-to-image

## Project Structure

```
├── app/
│   ├── page.tsx                 # Landing page
│   ├── auth/
│   │   ├── login/              # Login page
│   │   └── signup/             # Signup page
│   └── dashboard/
│       ├── page.tsx            # Dashboard overview
│       ├── projects/           # Projects management
│       ├── sessions/           # Work sessions tracking
│       ├── reports/            # Report generation
│       └── settings/           # User settings & subscription
├── components/
│   ├── dashboard/              # Dashboard components
│   ├── projects/               # Project components
│   ├── sessions/               # Session tracking components
│   ├── reports/                # Report components
│   └── settings/               # Settings components
├── lib/
│   ├── supabase/               # Supabase client utilities
│   └── auth.ts                 # Authentication helpers
└── middleware.ts               # Auth middleware
```

## Database Schema

### Tables
- `profiles`: User profile information and subscription tier
- `projects`: Client projects
- `work_sessions`: Timed work sessions
- `evidence_entries`: Evidence documentation (tasks, commits, milestones, notes)

All tables have Row Level Security (RLS) enabled with policies ensuring users can only access their own data.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Key Features Explained

### Privacy-First Approach
Unlike traditional time tracking tools, ProofWork doesn't use screenshots or keylogging. Instead, it focuses on structured evidence that freelancers manually input, giving them full control over what's shared.

### Evidence Types
- **Tasks**: Completed tasks and deliverables
- **Commits**: Code commits and version control activity
- **Milestones**: Major project milestones achieved
- **Notes**: General work notes and updates

### Report Generation
Reports include:
- Session overview with project and client details
- Total duration and timestamps
- Evidence summary by type
- Complete timeline of work activities
- Professional formatting suitable for client sharing

## Usage Limits

### Free Plan
- 5 projects maximum
- 10 sessions per month
- Basic web reports

### Pro Plan ($9/month)
- Unlimited projects
- Unlimited sessions
- PDF export
- Full history access

### Enterprise Plan ($15/month)
- All Pro features
- Priority support
- Custom branding
- API access

## Security

- All routes are protected with authentication middleware
- Row Level Security on all database tables
- User data isolation
- Secure session management
- Environment variables for sensitive credentials

## Build

Build the application:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## License

Built for Wasay Minhas
