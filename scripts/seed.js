const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');
const Job = require('../models/Job');
const Settings = require('../models/Settings');
const Role = require('../models/Role');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

// Sample data
const sampleUsers = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'Admin123',
    role: 'admin',
    isActive: true
  },
  {
    firstName: 'HR',
    lastName: 'Manager',
    email: 'hr@example.com',
    password: 'HrManager123',
    role: 'hr',
    department: 'Human Resources',
    isActive: true
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'Candidate123',
    role: 'candidate',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    experience: 3,
    location: 'New York, NY',
    isActive: true
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    password: 'Candidate123',
    role: 'candidate',
    skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
    experience: 5,
    location: 'San Francisco, CA',
    isActive: true
  },
  {
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@example.com',
    password: 'Candidate123',
    role: 'candidate',
    skills: ['Java', 'Spring Boot', 'MySQL', 'Docker'],
    experience: 2,
    location: 'Austin, TX',
    isActive: true
  }
];

const sampleJobs = [
  {
    title: 'Senior Full Stack Developer',
    description: 'We are looking for an experienced Full Stack Developer to join our dynamic team. The ideal candidate will have strong experience in both frontend and backend development, with expertise in modern web technologies. You will be responsible for developing and maintaining web applications, collaborating with cross-functional teams, and ensuring high-quality code delivery.',
    requirements: [
      '5+ years of experience in full stack development',
      'Proficiency in JavaScript, React, and Node.js',
      'Experience with databases (MongoDB, PostgreSQL)',
      'Knowledge of cloud platforms (AWS, Azure)',
      'Strong problem-solving skills',
      'Excellent communication skills'
    ],
    responsibilities: [
      'Develop and maintain web applications using modern technologies',
      'Collaborate with designers and product managers',
      'Write clean, maintainable, and efficient code',
      'Participate in code reviews and technical discussions',
      'Troubleshoot and debug applications',
      'Stay updated with latest technology trends'
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS', 'Docker'],
    department: 'Engineering',
    location: 'San Francisco, CA',
    employmentType: 'full-time',
    experienceLevel: 'senior',
    salaryRange: {
      min: 120000,
      max: 160000,
      currency: 'USD'
    },
    status: 'active',
    aiInterviewEnabled: true,
    maxApplications: 50
  },
  {
    title: 'Frontend Developer',
    description: 'Join our frontend team to build beautiful and responsive user interfaces. We are seeking a talented Frontend Developer with a passion for creating exceptional user experiences. You will work closely with our design team to implement pixel-perfect interfaces and ensure optimal performance across all devices.',
    requirements: [
      '3+ years of frontend development experience',
      'Expert knowledge of HTML, CSS, and JavaScript',
      'Experience with React or Vue.js',
      'Understanding of responsive design principles',
      'Familiarity with version control (Git)',
      'Attention to detail and design aesthetics'
    ],
    responsibilities: [
      'Develop responsive and interactive user interfaces',
      'Collaborate with UX/UI designers',
      'Optimize applications for maximum speed and scalability',
      'Ensure cross-browser compatibility',
      'Implement and maintain design systems',
      'Write unit tests for frontend components'
    ],
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Vue.js', 'Sass', 'Webpack'],
    department: 'Engineering',
    location: 'New York, NY',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: {
      min: 80000,
      max: 110000,
      currency: 'USD'
    },
    status: 'active',
    aiInterviewEnabled: true,
    maxApplications: 30
  },
  {
    title: 'Backend Developer',
    description: 'We are hiring a skilled Backend Developer to design and implement server-side logic, databases, and APIs. The successful candidate will have strong experience in server-side technologies and database management. You will be responsible for ensuring high performance and responsiveness of our backend services.',
    requirements: [
      '4+ years of backend development experience',
      'Proficiency in Python, Java, or Node.js',
      'Experience with RESTful API development',
      'Strong database design and optimization skills',
      'Knowledge of microservices architecture',
      'Experience with cloud services and deployment'
    ],
    responsibilities: [
      'Design and develop scalable backend services',
      'Create and maintain RESTful APIs',
      'Optimize database queries and performance',
      'Implement security best practices',
      'Monitor and troubleshoot production issues',
      'Collaborate with frontend developers and DevOps team'
    ],
    skills: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS'],
    department: 'Engineering',
    location: 'Austin, TX',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: {
      min: 95000,
      max: 130000,
      currency: 'USD'
    },
    status: 'active',
    aiInterviewEnabled: true,
    maxApplications: 40
  },
  {
    title: 'DevOps Engineer',
    description: 'Looking for a DevOps Engineer to streamline our development and deployment processes. The ideal candidate will have experience with CI/CD pipelines, containerization, and cloud infrastructure. You will play a crucial role in automating our deployment processes and ensuring system reliability.',
    requirements: [
      '3+ years of DevOps or infrastructure experience',
      'Experience with CI/CD tools (Jenkins, GitLab CI, GitHub Actions)',
      'Proficiency in containerization (Docker, Kubernetes)',
      'Knowledge of cloud platforms (AWS, GCP, Azure)',
      'Scripting skills (Bash, Python)',
      'Understanding of monitoring and logging tools'
    ],
    responsibilities: [
      'Design and maintain CI/CD pipelines',
      'Manage cloud infrastructure and deployments',
      'Implement monitoring and alerting systems',
      'Automate repetitive tasks and processes',
      'Ensure security and compliance standards',
      'Collaborate with development teams on deployment strategies'
    ],
    skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform', 'Ansible', 'Python'],
    department: 'Engineering',
    location: 'Remote',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: {
      min: 100000,
      max: 140000,
      currency: 'USD'
    },
    status: 'active',
    aiInterviewEnabled: true,
    maxApplications: 25
  },
  {
    title: 'Junior Software Developer',
    description: 'Great opportunity for a Junior Software Developer to start their career in a supportive environment. We are looking for enthusiastic individuals who are eager to learn and grow. You will work alongside senior developers and contribute to various projects while developing your technical skills.',
    requirements: [
      '0-2 years of professional development experience',
      'Basic knowledge of programming languages (JavaScript, Python, or Java)',
      'Understanding of web development fundamentals',
      'Familiarity with version control systems',
      'Strong willingness to learn and adapt',
      'Good communication and teamwork skills'
    ],
    responsibilities: [
      'Assist in developing and maintaining applications',
      'Write clean and well-documented code',
      'Participate in code reviews and team meetings',
      'Learn new technologies and best practices',
      'Debug and fix software issues',
      'Contribute to project documentation'
    ],
    skills: ['JavaScript', 'HTML', 'CSS', 'Git', 'SQL'],
    department: 'Engineering',
    location: 'Chicago, IL',
    employmentType: 'full-time',
    experienceLevel: 'entry',
    salaryRange: {
      min: 60000,
      max: 80000,
      currency: 'USD'
    },
    status: 'active',
    aiInterviewEnabled: true,
    maxApplications: 100
  }
];

const defaultSettings = {
  openRouterApiKey: 'your-openrouter-api-key-here',
  modelName: 'openai/gpt-4o',
  aiInterviewSettings: {
    maxQuestions: 5,
    questionTimeoutMinutes: 10,
    enableTechnicalQuestions: true,
    enableBehavioralQuestions: true,
    enableSituationalQuestions: true,
    passingScore: 70
  },
  applicationSettings: {
    maxApplicationsPerJob: 100,
    autoRejectAfterDays: 30,
    requireCoverLetter: false,
    allowResumeUpload: true,
    maxResumeSize: 5242880
  },
  systemSettings: {
    siteName: 'AI Hiring Platform',
    siteUrl: 'http://localhost:3000',
    maintenanceMode: false,
    allowRegistration: true,
    defaultUserRole: 'candidate'
  },
  securitySettings: {
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    requirePasswordChange: false,
    passwordExpiryDays: 90
  }
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-hiring-platform');
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Job.deleteMany({});
    await Settings.deleteMany({});
    await Role.deleteMany({});
    await ActivityLog.deleteMany({});
    await Notification.deleteMany({});

    // Create system roles first
    console.log('Creating system roles...');
    const roles = [
      {
        name: 'admin',
        description: 'Full system access with all permissions',
        permissions: [
          'user_management', 'role_management', 'system_settings', 'analytics',
          'candidate_management', 'interview_scheduling', 'job_posting', 'reports',
          'interview_conduct', 'candidate_evaluation', 'profile_management', 'application_tracking'
        ],
        color: 'purple',
        isSystem: true
      },
      {
        name: 'hr',
        description: 'Manage hiring process and candidates',
        permissions: ['candidate_management', 'interview_scheduling', 'job_posting', 'reports', 'analytics', 'profile_management'],
        color: 'blue',
        isSystem: true
      },
      {
        name: 'interviewer',
        description: 'Conduct interviews and evaluate candidates',
        permissions: ['interview_conduct', 'candidate_evaluation', 'profile_management'],
        color: 'indigo',
        isSystem: true
      },
      {
        name: 'candidate',
        description: 'Apply for jobs and track applications',
        permissions: ['profile_management', 'application_tracking'],
        color: 'orange',
        isSystem: true
      }
    ];

    const createdRoles = {};
    for (const roleData of roles) {
      const role = new Role(roleData);
      await role.save();
      createdRoles[role.name] = role;
      console.log(`Created role: ${role.name}`);
    }

    // Create users with enhanced data
    console.log('Creating users...');
    const enhancedUsers = sampleUsers.map((user, index) => ({
      ...user,
      status: user.role === 'candidate' && index === 4 ? 'pending' : 'active',
      permissions: createdRoles[user.role]?.permissions || [],
      avatar: `https://images.unsplash.com/photo-${1472099645785 + index}?w=150`,
      jobTitle: user.role === 'admin' ? 'System Administrator' : 
                user.role === 'hr' ? 'HR Manager' : 
                user.role === 'candidate' ? 'Software Developer' : 'Interviewer',
      bio: `Experienced ${user.role} with expertise in their field.`,
      loginHistory: [],
      sessions: []
    }));

    const createdUsers = [];
    for (const userData of enhancedUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.email} (${user.role})`);
    }

    // Find HR user for job creation
    const hrUser = createdUsers.find(user => user.role === 'hr');
    
    // Create jobs
    console.log('Creating jobs...');
    for (const jobData of sampleJobs) {
      const job = new Job({
        ...jobData,
        postedBy: hrUser._id
      });
      await job.save();
      console.log(`Created job: ${job.title}`);
    }

    // Create default settings
    console.log('Creating default settings...');
    const settings = new Settings(defaultSettings);
    await settings.save();
    console.log('Created default settings');

    // Create sample activity logs
    console.log('Creating activity logs...');
    const activities = [
      {
        userId: createdUsers[0]._id, // Admin
        action: 'System Initialized',
        details: 'Database seeded with initial data',
        category: 'system',
        severity: 'medium',
        ipAddress: '127.0.0.1',
        userAgent: 'Seed Script'
      },
      {
        userId: createdUsers[1]._id, // HR
        action: 'Jobs Created',
        details: `Created ${sampleJobs.length} job postings`,
        category: 'user_management',
        severity: 'low',
        ipAddress: '127.0.0.1',
        userAgent: 'Seed Script'
      }
    ];

    for (const activity of activities) {
      await ActivityLog.logActivity(activity);
    }
    console.log(`Created ${activities.length} activity logs`);

    // Create sample notifications
    console.log('Creating notifications...');
    const notifications = [
      {
        userId: createdUsers[0]._id, // Admin
        title: 'System Setup Complete',
        message: 'The AI Hiring Platform has been successfully initialized with sample data.',
        type: 'success',
        category: 'system',
        priority: 'medium'
      },
      {
        userId: createdUsers[1]._id, // HR
        title: 'Welcome to the Platform',
        message: 'Your HR account is ready. You can now start posting jobs and managing candidates.',
        type: 'info',
        category: 'user',
        priority: 'medium'
      }
    ];

    // Add notifications for all candidates
    for (let i = 2; i < createdUsers.length; i++) {
      notifications.push({
        userId: createdUsers[i]._id,
        title: 'Welcome to the Platform!',
        message: 'Your candidate account has been created. Complete your profile to start applying for jobs.',
        type: 'success',
        category: 'user',
        priority: 'medium'
      });
    }

    for (const notification of notifications) {
      await Notification.createNotification(notification);
    }
    console.log(`Created ${notifications.length} notifications`);

    console.log('\n=== Seed Data Summary ===');
    console.log(`Roles created: ${Object.keys(createdRoles).length}`);
    console.log(`Users created: ${createdUsers.length}`);
    console.log(`Jobs created: ${sampleJobs.length}`);
    console.log('Settings created: 1');
    console.log(`Activity logs created: ${activities.length}`);
    console.log(`Notifications created: ${notifications.length}`);
    
    console.log('\n=== Login Credentials ===');
    console.log('Admin: admin@example.com / Admin123');
    console.log('HR: hr@example.com / HrManager123');
    console.log('Candidates:');
    console.log('  - john.doe@example.com / Candidate123');
    console.log('  - jane.smith@example.com / Candidate123');
    console.log('  - mike.johnson@example.com / Candidate123');
    
    console.log('\n=== Important Notes ===');
    console.log('1. Update the OpenRouter API key in settings to enable AI features');
    console.log('2. All users have simple passwords for demo purposes');
    console.log('3. Jobs are posted by the HR user');
    console.log('4. AI interviews are enabled for all jobs');

    console.log('\nDatabase seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();