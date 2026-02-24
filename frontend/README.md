# NeuroCloak Frontend

A modern React dashboard for the NeuroCloak Cognitive Digital Twin platform.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Query** for server state management
- **React Router** for navigation
- **Axios** for API communication

## Features

- 🎯 Real-time dashboard with live metrics
- 📊 Interactive charts and visualizations
- 🔔 Multi-tenant organization management
- 🤖 AI model registry and monitoring
- 📈 Evaluation results and trust scores
- 🚨 Alert management and notifications
- ⚙️ Project settings and configuration
- 📱 Responsive design for all devices

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API server running on port 8000

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd neurocloak/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws

# Application Configuration
VITE_APP_NAME=NeuroCloak
VITE_APP_VERSION=1.0.0
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/            # Base UI components
│   ├── Layout.tsx     # Main layout component
│   └── ProtectedRoute.tsx
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard page
│   ├── projects/       # Project management
│   ├── models/         # Model registry
│   ├── evaluations/    # Evaluation results
│   ├── alerts/         # Alert management
│   └── settings/       # Settings pages
├── services/           # API services
├── stores/             # Zustand stores
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Authentication

The frontend uses JWT-based authentication with access and refresh tokens:

- Login via `/login` page
- Registration via `/register` page
- Automatic token refresh
- Protected routes require authentication

## API Integration

The frontend communicates with the backend via:

- RESTful API for most operations
- WebSocket for real-time data ingestion
- Automatic token management
- Error handling and retry logic

## State Management

Using Zustand for global state:

- `authStore` - Authentication state
- `projectStore` - Current project context
- `themeStore` - UI theme preferences

## Styling

- Tailwind CSS for utility-first styling
- Responsive design with mobile-first approach
- Dark/light theme support
- Consistent design system

## Development

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Component-based architecture

### Testing

```bash
# Run tests (when implemented)
npm run test

# Run with coverage
npm run test:coverage
```

## Build & Deployment

### Production Build

```bash
npm run build
```

The build will be in the `dist/` directory.

### Environment Variables for Production

```env
VITE_API_URL=https://your-api-domain.com/api/v1
VITE_WS_URL=wss://your-api-domain.com/ws
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **Dependencies not found**
   ```bash
   npm install
   ```

2. **API connection issues**
   - Check backend is running on port 8000
   - Verify VITE_API_URL in .env
   - Check CORS configuration

3. **TypeScript errors**
   ```bash
   npm run build
   # Fix any type errors
   ```

4. **Styling issues**
   - Ensure Tailwind CSS is properly configured
   - Check PostCSS configuration

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - see LICENSE file for details.
