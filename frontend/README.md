# AI Hiring Platform - Frontend

A beautiful, modern React frontend for the AI-powered hiring platform.

## Features

- **Multi-role Dashboard**: Different interfaces for Admin, HR, and Candidates
- **Job Management**: Browse, create, and manage job postings
- **Application System**: Submit and track job applications
- **AI Interview Integration**: Take AI-powered pre-screening interviews
- **User Management**: Manage users and permissions (Admin/HR)
- **Settings Panel**: Configure AI settings and system preferences
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Real-time Notifications**: Toast notifications for user feedback

## Technology Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Heroicons** for beautiful icons
- **Context API** for state management

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on http://localhost:3001

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to http://localhost:3000

### Login Credentials

Use these demo credentials to test the application:

- **Admin**: admin@example.com / Admin123
- **HR Manager**: hr@example.com / HrManager123
- **Candidate**: john.doe@example.com / Candidate123

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Auth/           # Authentication components
│   ├── Layout/         # Layout components (Header, Sidebar)
│   ├── Notifications/  # Notification system
│   └── UI/            # Basic UI components
├── contexts/           # React Context providers
│   ├── AuthContext.tsx
│   └── NotificationContext.tsx
├── pages/              # Page components
│   ├── Auth/          # Login, Register
│   ├── Dashboard/     # Dashboard
│   ├── Jobs/          # Job management
│   ├── Applications/  # Application management
│   ├── Interview/     # AI Interview system
│   ├── Users/         # User management
│   ├── Settings/      # Settings panel
│   └── Profile/       # User profile
├── services/          # API services
│   └── api.ts         # API client and endpoints
├── types/             # TypeScript type definitions
│   └── index.ts
├── App.tsx            # Main App component
└── index.tsx          # Entry point
```

## Key Features

### Dashboard
- Role-specific dashboards with relevant statistics
- Quick actions for common tasks
- Recent activity overview

### Job Management
- Create and edit job postings
- Advanced search and filtering
- Job status management
- Application tracking

### Application System
- Easy application submission
- Application status tracking
- HR notes and status updates
- Withdrawal functionality

### AI Interview System
- AI-powered question generation
- Real-time answer analysis
- Comprehensive evaluation reports
- Score tracking and recommendations

### User Management (Admin/HR)
- User creation and role assignment
- User activation/deactivation
- Role-based permissions

### Settings (Admin)
- AI configuration (OpenRouter API)
- Model selection
- Connection testing
- System preferences

## API Integration

The frontend communicates with the backend API through:

- **Authentication**: JWT-based auth with automatic token refresh
- **Role-based Access**: Different API endpoints based on user roles
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Loading indicators for better UX

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Components**: Reusable styled components
- **Responsive Design**: Mobile-first approach
- **Dark Mode Ready**: Easy to implement dark mode support

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

## Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to your web server or hosting platform

## Contributing

1. Follow the existing code structure and naming conventions
2. Use TypeScript for type safety
3. Add proper error handling
4. Include loading states for async operations
5. Test on different screen sizes

## Support

For issues and questions:
1. Check the browser console for errors
2. Verify the backend API is running
3. Ensure proper environment configuration
4. Check network connectivity

## License

MIT License - see LICENSE file for details.