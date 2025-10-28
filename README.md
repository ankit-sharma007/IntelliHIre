# AI Hiring Platform

A comprehensive hiring application that helps companies manage job postings, applications, and candidate pre-screening through AI-powered interviews.

## 📸 Screenshots

### Application Overview
![Dashboard Overview](./ReadmeImages/AI-Hiring-Platform-10-29-2025_02_57_AM.png)

### User Interface
![User Interface](./ReadmeImages/AI-Hiring-Platform-10-29-2025_02_57_AM2.png)

### Job Management System
![Job Management](./ReadmeImages/AI-Hiring-Platform-10-29-2025_02_58_AM.png)

### Application Tracking
![Application Tracking](./ReadmeImages/AI-Hiring-Platform-10-29-2025_02_58_AM%20(1).png)

### AI Interview System
![AI Interview System](./ReadmeImages/AI-Hiring-Platform-10-29-2025_02_58_AM3.png)

### Analytics Dashboard
![Analytics Dashboard](./ReadmeImages/AI-Hiring-Platform-10-29-2025_02_59_AM.png)

### User Management
![User Management](./ReadmeImages/AI-Hiring-Platform-10-29-2025_02_59_AM%20(1).png)

### Settings Panel
![Settings Panel](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_00_AM.png)

### Role Management
![Role Management](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_00_AM%20(1).png)

### Interview Configuration
![Interview Configuration](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_00_AM%20(2).png)

### Candidate Experience
![Candidate Experience](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_00_AM%20(3).png)

### Application Details
![Application Details](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_01_AM.png)

### AI Evaluation Reports
![AI Evaluation Reports](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_01_AM%20(1).png)

### System Configuration
![System Configuration](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_02_AM.png)

### Advanced Features
![Advanced Features](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_02_AM%20(1).png)

### Mobile Responsive Design
![Mobile Responsive](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_03_AM.png)

### Additional Interface Views
![Additional Views](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_03_AM%20(1).png)

### Complete System Overview
![System Overview](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_04_AM.png)

## Features

### Multi-Role System
- **Admin**: Manage users, roles, and global AI settings
- **HR**: Create job postings, view applications, and manage AI interviews
- **Candidate**: Browse jobs, apply, and participate in AI pre-interviews

### AI-Powered Pre-Screening
- Automated interview question generation based on job descriptions
- Real-time candidate answer analysis
- Comprehensive evaluation reports with scoring
- Integration with OpenRouter API for AI functionality

### Core Functionality
- Role-based access control and permissions
- Job posting management with advanced filtering
- Application tracking and status management
- AI interview system with customizable settings
- Comprehensive admin settings panel

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **AI Integration**: OpenRouter API
- **Validation**: Express-validator
- **Security**: bcryptjs for password hashing

## Project Structure

```
ai-hiring-platform/
├── models/                 # Database models
│   ├── User.js            # User model with role-based fields
│   ├── Job.js             # Job posting model
│   ├── Application.js     # Job application model
│   └── Settings.js        # Application settings model
├── routes/                # API routes
│   ├── auth.js           # Authentication routes
│   ├── users.js          # User management routes
│   ├── jobs.js           # Job management routes
│   ├── applications.js   # Application management routes
│   ├── interviews.js     # AI interview routes
│   └── settings.js       # Settings management routes
├── middleware/           # Custom middleware
│   ├── auth.js          # Authentication & authorization
│   ├── errorHandler.js  # Error handling
│   └── validation.js    # Request validation
├── services/            # Business logic services
│   └── aiService.js     # AI integration service
├── scripts/             # Utility scripts
│   └── seed.js          # Database seeding script
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
└── README.md           # Project documentation
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- OpenRouter API key for AI functionality

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-hiring-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ai-hiring-platform
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   SERVER_URL=http://localhost:5000
   ```

4. **Database Setup**
   ```bash
   # Seed the database with sample data
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### User Management
- `GET /api/users` - Get all users (Admin/HR)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user (Admin)
- `GET /api/users/stats` - Get user statistics (Admin)

### Job Management
- `GET /api/jobs` - Get jobs (public/filtered by role)
- `POST /api/jobs` - Create job (HR/Admin)
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job (HR/Admin)
- `DELETE /api/jobs/:id` - Delete job (HR/Admin)
- `PUT /api/jobs/:id/status` - Update job status

### Application Management
- `GET /api/applications` - Get applications
- `POST /api/applications` - Submit application (Candidate)
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id/status` - Update application status (HR/Admin)
- `POST /api/applications/:id/notes` - Add HR notes
- `PUT /api/applications/:id/withdraw` - Withdraw application (Candidate)

### AI Interview System
- `GET /api/interviews/application/:id` - Get interview questions
- `POST /api/interviews/application/:id/answer` - Submit answer (Candidate)
- `GET /api/interviews/application/:id/report` - Get AI evaluation report
- `POST /api/interviews/application/:id/generate-report` - Generate evaluation report (HR/Admin)
- `POST /api/interviews/job/:id/generate-questions` - Generate interview questions (HR/Admin)

### Settings Management
- `GET /api/settings` - Get settings (Admin)
- `PUT /api/settings/ai` - Update AI settings (Admin)
- `POST /api/settings/ai/test` - Test AI connection (Admin)
- `PUT /api/settings/interview` - Update interview settings (Admin)
- `PUT /api/settings/application` - Update application settings (Admin)
- `PUT /api/settings/system` - Update system settings (Admin)
- `GET /api/settings/public` - Get public settings

## Default Login Credentials

After running the seed script, you can use these credentials:

- **Admin**: admin@example.com / Admin123
- **HR**: hr@example.com / HrManager123
- **Candidates**:
  - john.doe@example.com / Candidate123
  - jane.smith@example.com / Candidate123
  - mike.johnson@example.com / Candidate123

## AI Configuration

1. **Get OpenRouter API Key**
   - Sign up at [OpenRouter](https://openrouter.ai/)
   - Generate an API key

2. **Configure AI Settings**
   - Login as Admin
   - Navigate to Settings → AI Configuration
   - Enter your OpenRouter API key
   - Select your preferred model (default: openai/gpt-4o)
   - Test the connection

3. **AI Interview Features**
   - Automatic question generation based on job descriptions
   - Real-time answer analysis and scoring
   - Comprehensive evaluation reports
   - Customizable interview settings

## Security Features

- JWT-based authentication with configurable expiration
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Input validation and sanitization
- Error handling and logging
- Configurable security settings

## Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

### Code Structure Guidelines
- **Models**: Database schemas with validation and methods
- **Routes**: API endpoints with proper middleware
- **Middleware**: Authentication, validation, and error handling
- **Services**: Business logic and external integrations
- **Clean Architecture**: Separation of concerns and modularity

## Deployment Considerations

1. **Environment Variables**
   - Set all required environment variables
   - Use strong JWT secrets in production
   - Configure proper MongoDB connection

2. **Security**
   - Enable HTTPS in production
   - Set up proper CORS configuration
   - Implement rate limiting
   - Regular security updates

3. **Monitoring**
   - Set up application monitoring
   - Configure error logging
   - Monitor AI API usage and costs

## Future Enhancements

- Resume parsing and analysis
- Interview scheduling system
- Email notifications
- Advanced analytics and reporting
- Integration with external job boards
- Video interview capabilities
- Bulk operations for HR users

## 🖼️ Complete Image Gallery

<div align="center">

### Platform Screenshots Collection

| Dashboard & Analytics | User Management | Job & Application System |
|:---:|:---:|:---:|
| ![Dashboard](./ReadmeImages/AI-Hiring-Platform-10-29-2025_02_57_AM.png) | ![User Management](./ReadmeImages/AI-Hiring-Platform-10-29-2025_02_59_AM%20(1).png) | ![Job Management](./ReadmeImages/AI-Hiring-Platform-10-29-2025_02_58_AM.png) |
| ![Analytics](./ReadmeImages/AI-Hiring-Platform-10-29-2025_02_59_AM.png) | ![Role Management](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_00_AM%20(1).png) | ![Applications](./ReadmeImages/AI-Hiring-Platform-10-29-2025_02_58_AM%20(1).png) |

| AI Interview System | Settings & Configuration | Mobile & Responsive |
|:---:|:---:|:---:|
| ![AI Interview](./ReadmeImages/AI-Hiring-Platform-10-29-2025_02_58_AM3.png) | ![Settings](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_00_AM.png) | ![Mobile](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_03_AM.png) |
| ![AI Reports](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_01_AM%20(1).png) | ![System Config](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_02_AM.png) | ![Responsive](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_03_AM%20(1).png) |

### Additional Platform Views
![Interface View 1](./ReadmeImages/AI-Hiring-Platform-10-29-2025_02_57_AM2.png)
![Interface View 2](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_00_AM%20(2).png)
![Interface View 3](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_00_AM%20(3).png)
![Interface View 4](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_01_AM.png)
![Interface View 5](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_02_AM%20(1).png)
![Complete Overview](./ReadmeImages/AI-Hiring-Platform-10-29-2025_03_04_AM.png)

</div>

## Support

For issues and questions:
1. Check the API documentation
2. Review error logs
3. Ensure proper environment configuration
4. Verify AI service connectivity

## License

MIT License - see LICENSE file for details.
