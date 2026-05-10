# Gr8 Math - Educational Platform

A modern, full-featured educational platform built with Next.js and Supabase, designed for teachers and moderators to manage classes, create lessons, conduct assessments, and facilitate interactive learning experiences.

## Features

### For Teachers
- **Class Management** - Create, organize, and manage multiple classes
- **Virtual Blackboard** - Interactive whiteboard for real-time drawing and explanations
- **Lesson Planning** - Create and organize structured lessons with multimedia support
- **DLL (Detailed Lesson Log)** - Comprehensive lesson documentation with date tracking
- **Assessments** - Create and manage student assessments with various question types
- **Participant Management** - Track student progress and participation
- **Content Upload** - Upload photos and media assets for lessons

### For Moderators
- **Dashboard** - Overview of platform activity and key metrics
- **Audit Trails** - Monitor all user activities and changes
- **Word Filter** - Content moderation with customizable word filtering
- **Account Settings** - Manage moderator accounts and permissions

### General Features
- **User Authentication** - Secure login with support for password reset
- **Role-Based Access Control** - Separate interfaces for teachers, moderators, and administrators
- **Profile Management** - User profile customization
- **Responsive Design** - Works seamlessly on desktop and tablet devices
- **Real-Time Updates** - Dynamic content synchronization using Supabase

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) 15+ with App Router
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Object Storage**: [AWS Tigris](https://www.tigrisdata.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Deployment**: Docker, Vercel-ready
- **Linting**: ESLint
- **CSS Processing**: PostCSS

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- A Supabase account and project
- Docker (optional, for containerized deployment)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/gr8-math.git
cd gr8-math
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key

# API Configuration (optional)
NEXT_PUBLIC_API_URL=http://localhost:3000

# Database URL (for migrations and scripts)
DATABASE_URL=your_database_connection_string
```

You can find these values in your [Supabase project settings](https://supabase.com/dashboard/project/_/settings/api).

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 5. (Optional) Run Supabase Locally

```bash
npm install -g supabase
supabase start
```

For more details, check [Supabase Local Development Documentation](https://supabase.com/docs/guides/getting-started/local-development).

## Project Structure

```
gr8-math/
├── app/                          # Next.js App Router
│   ├── (moderator)/             # Moderator role routes
│   │   ├── dashboard/           # Moderator dashboard
│   │   ├── audit-trails/        # Audit log viewing
│   │   └── account-settings/    # Moderator account management
│   ├── (teacher)/               # Teacher role routes
│   │   ├── class-manager/       # Class creation and management
│   │   ├── class-page/          # Individual class details
│   │   │   ├── lesson/          # Lesson management
│   │   │   ├── assesssment-view/# Assessment creation
│   │   │   ├── participants/    # Student management
│   │   │   └── dll/             # Detailed lesson logs
│   │   └── virtual-blackboard/  # Interactive whiteboard
│   ├── auth/                    # Authentication pages
│   │   ├── login/               # Login page
│   │   ├── sign-up/             # Registration page
│   │   └── update-password/     # Password reset
│   └── (public)/                # Public pages
│       ├── privacy-policy/
│       └── terms-and-conditions/
├── components/                  # Reusable React components
│   ├── ui/                      # shadcn/ui components
│   ├── card/                    # Card components
│   ├── form/                    # Form components
│   ├── dll/                     # DLL-specific components
│   └── admin/                   # Admin-specific components
├── service/                     # API service modules
│   ├── auth.ts                 # Authentication service
│   ├── classes.ts              # Class management
│   ├── lesson.ts               # Lesson service
│   ├── assessment.ts           # Assessment service
│   ├── participants.ts         # Participant service
│   ├── dll.ts                  # DLL service
│   ├── audit-trails.ts         # Audit logging
│   └── upload.ts               # File upload handling
├── lib/                        # Utility functions
│   ├── supabase/              # Supabase client configurations
│   └── utils/                 # Helper utilities
├── hooks/                      # Custom React hooks
├── lib/                        # Shared utilities
├── data/                       # Static data files
├── Dockerfile                  # Docker configuration
├── docker-compose.yml          # Docker Compose setup
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
└── tailwind.config.ts         # Tailwind CSS configuration
```

## Available Scripts

### Development
```bash
npm run dev        # Start development server on port 3000
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Deployment

### Deploy to Vercel

Vercel is the recommended platform for deploying Next.js applications.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/gr8-math)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel project settings
4. Deploy automatically on push or manually

[Learn more about Vercel deployment](https://vercel.com/docs/frameworks/nextjs)

### Deploy to Render

Render is a modern cloud platform that makes deployment simple. Choose either Node or Docker deployment:

#### Option 1: Node Deployment (Recommended)

1. **Connect your repository**
   - Push your code to GitHub
   - Go to [render.com](https://render.com) and sign up

2. **Create a new Web Service**
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Select the branch to deploy (typically `main`)

3. **Configure the service**
   - **Name**: `gr8-math` (or your preferred name)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Region**: Select closest to your users

4. **Add Environment Variables**
   - In the Render dashboard, go to Environment
   - Add the following variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
     NODE_ENV=production
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your app
   - Your app will be live at `https://your-app-name.onrender.com`

#### Option 2: Docker Deployment

1. **Connect your repository**
   - Push your code to GitHub (including `Dockerfile`)
   - Go to [render.com](https://render.com) and sign up

2. **Create a new Web Service**
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Select the branch to deploy (typically `main`)

3. **Configure the service**
   - **Name**: `gr8-math` (or your preferred name)
   - **Runtime**: `Docker`
   - **Region**: Select closest to your users

4. **Add Environment Variables**
   - In the Render dashboard, go to Environment
   - Add the following variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
     NODE_ENV=production
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy using your Dockerfile
   - Your app will be live at `https://your-app-name.onrender.com`

**Automatic Deployments**: Every push to your connected branch will automatically trigger a new deployment.

[Learn more about Render deployment](https://render.com/docs/deploy-nextjs)

### Docker Deployment

Build and run the application using Docker:

```bash
# Build the Docker image
docker build -t gr8-math .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_key \
  gr8-math
```

Using Docker Compose:

```bash
docker-compose up -d
```

Make sure to update `docker-compose.yml` with your environment variables.

### Self-Hosted Deployment

For VPS or self-hosted environments:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set environment variables** on your server
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL=your_url
   export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_key
   ```

3. **Start the server**
   ```bash
   npm run start
   ```

4. **Use a reverse proxy** (nginx/Apache) to serve on port 80/443

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Your Supabase publishable key |
| `NEXT_PUBLIC_API_URL` | No | API endpoint URL (defaults to app URL) |
| `DATABASE_URL` | No | Direct database connection string |

## Authentication Flow

The application uses Supabase Auth with the following features:
- Email/password authentication
- Session management with cookies
- Password reset functionality
- Role-based access control (RBAC)

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## Troubleshooting

### Port Already in Use
```bash
# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Supabase Connection Issues
- Verify your API URL and key are correct
- Check that your Supabase project is active
- Ensure your firewall allows connections to Supabase

### Build Failures
- Clear Node modules and reinstall: `rm -rf node_modules && npm install`
- Clear Next.js cache: `rm -rf .next && npm run build`

## Support

For issues and feature requests, please create an [issue](https://github.com/yourusername/gr8-math/issues) on GitHub.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

Built with:
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
