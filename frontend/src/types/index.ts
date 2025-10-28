export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'hr' | 'candidate';
  phone?: string;
  skills?: string[];
  experience?: number;
  location?: string;
  department?: string;
  isActive: boolean;
  lastLogin?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  department: string;
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  status: 'draft' | 'active' | 'paused' | 'closed';
  postedBy: User;
  applicationDeadline?: string;
  maxApplications: number;
  aiInterviewEnabled: boolean;
  interviewQuestions: InterviewQuestion[];
  viewCount: number;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
  isExpired: boolean;
  isAcceptingApplications: boolean;
}

export interface Application {
  _id: string;
  job: Job;
  candidate: User;
  status: 'pending' | 'under-review' | 'interview-scheduled' | 'ai-interview-completed' | 'rejected' | 'accepted' | 'withdrawn';
  coverLetter?: string;
  resume?: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    uploadDate: string;
  };
  aiInterviewCompleted: boolean;
  aiInterviewScore?: number;
  aiEvaluationReport?: AIEvaluationReport;
  interviewResponses: InterviewResponse[];
  hrNotes: HRNote[];
  statusHistory: StatusHistory[];
  expectedSalary?: {
    amount: number;
    currency: string;
  };
  availabilityDate?: string;
  noticePeriod?: string;
  source: 'direct' | 'referral' | 'job-board' | 'social-media' | 'other';
  referredBy?: User;
  createdAt: string;
  updatedAt: string;
  daysSinceApplication: number;
  requiresAiInterview: boolean;
}

export interface InterviewQuestion {
  _id: string;
  question: string;
  type: 'technical' | 'behavioral' | 'situational' | 'general';
  expectedAnswer?: string;
}

export interface InterviewResponse {
  questionId: string;
  question: string;
  answer: string;
  aiAnalysis?: string;
  score?: number;
  answeredAt: string;
}

export interface AIEvaluationReport {
  overallAssessment: string;
  technicalSkillsScore: number;
  communicationScore: number;
  culturalFitScore: number;
  strengths: string[];
  weaknesses: string[];
  suitabilityRating: 'excellent' | 'good' | 'average' | 'below-average' | 'poor';
  recommendations: string;
  overallScore: number;
}

export interface HRNote {
  note: string;
  addedBy: User;
  addedAt: string;
  isPrivate: boolean;
}

export interface StatusHistory {
  status: string;
  changedBy?: User;
  changedAt: string;
  reason?: string;
}

export interface Settings {
  _id: string;
  modelName: string;
  aiInterviewSettings: {
    maxQuestions: number;
    questionTimeoutMinutes: number;
    enableTechnicalQuestions: boolean;
    enableBehavioralQuestions: boolean;
    enableSituationalQuestions: boolean;
    passingScore: number;
  };
  applicationSettings: {
    maxApplicationsPerJob: number;
    autoRejectAfterDays: number;
    requireCoverLetter: boolean;
    allowResumeUpload: boolean;
    maxResumeSize: number;
  };
  systemSettings: {
    siteName: string;
    siteUrl: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    defaultUserRole: 'candidate' | 'hr';
  };
  securitySettings: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    requirePasswordChange: boolean;
    passwordExpiryDays: number;
  };
  lastUpdatedBy?: User;
  version: string;
  createdAt: string;
  updatedAt: string;
  isAiConfigured: boolean;
  isEmailConfigured: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  totalUsers?: number;
  totalJobs?: number;
  totalApplications?: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'candidate' | 'hr';
  phone?: string;
  skills?: string[];
  experience?: number;
  location?: string;
  department?: string;
}

export interface JobFilters {
  search?: string;
  department?: string;
  location?: string;
  employmentType?: string;
  experienceLevel?: string;
  status?: string;
}

export interface ApplicationFilters {
  status?: string;
  jobId?: string;
}

export interface UserFilters {
  role?: string;
  search?: string;
  isActive?: boolean;
}

export interface NotificationType {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// New Analytics & Reporting Types
export interface AnalyticsData {
  jobMetrics: {
    totalJobs: number;
    activeJobs: number;
    jobsThisMonth: number;
    avgApplicationsPerJob: number;
    topPerformingJobs: JobPerformance[];
  };
  applicationMetrics: {
    totalApplications: number;
    applicationsThisMonth: number;
    avgTimeToHire: number;
    conversionRate: number;
    statusDistribution: StatusDistribution[];
  };
  candidateMetrics: {
    totalCandidates: number;
    activeCandidates: number;
    topSkills: SkillCount[];
    experienceDistribution: ExperienceDistribution[];
  };
  aiMetrics: {
    totalInterviews: number;
    avgScore: number;
    passRate: number;
    timesSaved: number;
  };
}

export interface JobPerformance {
  jobId: string;
  title: string;
  applications: number;
  views: number;
  conversionRate: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface SkillCount {
  skill: string;
  count: number;
}

export interface ExperienceDistribution {
  level: string;
  count: number;
}

// Calendar & Scheduling Types
export interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: 'interview' | 'meeting' | 'deadline' | 'reminder';
  participants: User[];
  applicationId?: string;
  jobId?: string;
  location?: string;
  meetingLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

// Communication & Messaging Types
export interface Message {
  _id: string;
  sender: User;
  recipient: User;
  subject: string;
  content: string;
  isRead: boolean;
  applicationId?: string;
  jobId?: string;
  attachments?: MessageAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageAttachment {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
}

// Template Management Types
export interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  content: string;
  type: 'application-received' | 'interview-invitation' | 'rejection' | 'acceptance' | 'custom';
  variables: string[];
  isActive: boolean;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

// Bulk Operations Types
export interface BulkOperation {
  _id: string;
  type: 'status-update' | 'email-send' | 'export' | 'import';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  targetCount: number;
  processedCount: number;
  successCount: number;
  failureCount: number;
  results?: BulkOperationResult[];
  createdBy: User;
  createdAt: string;
  completedAt?: string;
}

export interface BulkOperationResult {
  itemId: string;
  success: boolean;
  error?: string;
}

// Advanced Search & Filtering Types
export interface AdvancedSearchFilters {
  keywords?: string;
  skills?: string[];
  experience?: {
    min: number;
    max: number;
  };
  location?: string[];
  salary?: {
    min: number;
    max: number;
  };
  education?: string[];
  availability?: string;
  lastActive?: string;
}

// Talent Pool & Candidate Management Types
export interface TalentPool {
  _id: string;
  name: string;
  description: string;
  candidates: User[];
  tags: string[];
  createdBy: User;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateProfile {
  _id: string;
  user: User;
  resume?: {
    filename: string;
    parsedData?: ParsedResumeData;
  };
  portfolio?: string;
  linkedIn?: string;
  github?: string;
  website?: string;
  education: Education[];
  workExperience: WorkExperience[];
  certifications: Certification[];
  languages: Language[];
  preferences: CandidatePreferences;
  notes: CandidateNote[];
  tags: string[];
  rating?: number;
  isBlacklisted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedResumeData {
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  summary: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: number;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  skills: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface Language {
  language: string;
  proficiency: 'basic' | 'intermediate' | 'advanced' | 'native';
}

export interface CandidatePreferences {
  jobTypes: string[];
  locations: string[];
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  remoteWork: boolean;
  availabilityDate: string;
  noticePeriod: string;
}

export interface CandidateNote {
  note: string;
  addedBy: User;
  addedAt: string;
  isPrivate: boolean;
  tags: string[];
}

// Workflow & Automation Types
export interface Workflow {
  _id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  isActive: boolean;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTrigger {
  type: 'application-received' | 'status-change' | 'time-based' | 'score-threshold';
  conditions: Record<string, any>;
}

export interface WorkflowAction {
  type: 'send-email' | 'update-status' | 'assign-interviewer' | 'add-to-pool' | 'create-task';
  parameters: Record<string, any>;
}

// Task Management Types
export interface Task {
  _id: string;
  title: string;
  description: string;
  type: 'review-application' | 'schedule-interview' | 'follow-up' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo: User;
  assignedBy: User;
  dueDate?: string;
  applicationId?: string;
  jobId?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Reporting Types
export interface Report {
  _id: string;
  name: string;
  type: 'hiring-funnel' | 'time-to-hire' | 'source-effectiveness' | 'ai-performance' | 'custom';
  parameters: Record<string, any>;
  schedule?: ReportSchedule;
  recipients: User[];
  isActive: boolean;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
}

// Integration Types
export interface Integration {
  _id: string;
  name: string;
  type: 'job-board' | 'ats' | 'calendar' | 'email' | 'slack' | 'teams';
  config: Record<string, any>;
  isActive: boolean;
  lastSync?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}