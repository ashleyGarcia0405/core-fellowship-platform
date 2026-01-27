const API_BASE = import.meta.env.VITE_API_BASE || "";

// Auth token management
const TOKEN_KEY = "auth_token";

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// HTTP helpers
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// Auth types
export type UserType = "STUDENT" | "STARTUP" | "ADMIN";
export type UserRole = "ROLE_USER" | "ROLE_ADMIN";

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  email: string;
  userType: UserType;
  role: UserRole;
}

export interface RegisterRequest {
  email: string;
  password: string;
  userType: UserType;
  fullName?: string;
  companyName?: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  userType: UserType;
  message: string;
}

// Auth API
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await postJson<LoginResponse>("/v1/auth/login", {
    email,
    password,
  });
  setAuthToken(response.accessToken);
  return response;
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  return postJson<RegisterResponse>("/v1/auth/register", data);
}

export function logout() {
  clearAuthToken();
}

// Interview types
export type Recommendation = "STRONG_YES" | "YES" | "MAYBE" | "NO";

export interface Interview {
  id: string;
  applicationId: string;
  interviewerId: string;
  interviewerName: string;
  interviewDate: string;
  technicalScore: number;
  communicationScore: number;
  motivationScore: number;
  cultureFitScore: number;
  overallScore: number;
  strengths?: string;
  concerns?: string;
  notes?: string;
  recommendation: Recommendation;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInterviewRequest {
  interviewDate: string;
  technicalScore: number;
  communicationScore: number;
  motivationScore: number;
  cultureFitScore: number;
  strengths?: string;
  concerns?: string;
  notes?: string;
  recommendation: Recommendation;
}

export interface UpdateInterviewRequest {
  interviewDate?: string;
  technicalScore?: number;
  communicationScore?: number;
  motivationScore?: number;
  cultureFitScore?: number;
  strengths?: string;
  concerns?: string;
  notes?: string;
  recommendation?: Recommendation;
}

// Interview API
export async function createInterview(applicationId: string, data: CreateInterviewRequest): Promise<Interview> {
  return postJson<Interview>(`/v1/students/applications/${applicationId}/interview`, data);
}

export async function getInterview(applicationId: string): Promise<Interview> {
  return getJson<Interview>(`/v1/students/applications/${applicationId}/interview`);
}

export async function updateInterview(applicationId: string, data: UpdateInterviewRequest): Promise<Interview> {
  const res = await fetch(`${API_BASE}/v1/students/applications/${applicationId}/interview`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<Interview>;
}

// Application types
export interface StudentApplication {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  gradYear: string;
  major: string;
  school?: string;
  status: string;
  submittedAt: string;
  updatedAt: string;
}

// Application API
export async function getApplications(): Promise<StudentApplication[]> {
  return getJson<StudentApplication[]>("/v1/students/applications");
}

export interface CreateStudentApplicationRequest {
  fullName: string;
  pronouns?: string;
  gradYear: string;
  school?: string;
  major: string;
  email: string;
  linkedinProfile?: string;
  portfolioWebsite?: string;
  resumeUrl?: string;
  howDidYouHear?: string;
  referralSource?: string;
  rolePreferences?: string[];
  startupsAndIndustries: string;
  contributionAndExperience: string;
  workMode: string;
  timeCommitment: string;
  isUSCitizen: string;
  workAuthorization?: string;
  additionalComments?: string;
  previouslyApplied: boolean;
  previouslyParticipated?: boolean;
  hasUpcomingInternshipOffers: boolean;
}

export async function createStudentApplication(data: CreateStudentApplicationRequest): Promise<StudentApplication> {
  return postJson<StudentApplication>("/v1/students/applications", data);
}

export async function uploadResume(applicationId: string, file: File): Promise<{ message: string; resumeUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/v1/students/applications/${applicationId}/resume`, {
    method: 'POST',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return res.json();
}

// Startup types and API
export interface Startup {
  id: string;
  userId: string;
  companyName: string;
  email: string;
  status: string;
  submittedAt: string;
}

export interface Position {
  roleType: string;
  description: string;
  requiredSkills?: string[];
  timeCommitment?: string;
}

export interface CreateStartupRequest {
  companyName: string;
  website?: string;
  industry?: string;
  description?: string;
  stage?: string;
  teamSize?: string;
  foundedYear?: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone?: string;
  operatingMode: string;
  timeZone?: string;
  internsSupervisor: string;
  hasHiredInternsPreviously: boolean;
  numberOfInternsNeeded?: number;
  positions?: Position[];
  willPayInterns: string;
  payAmount?: string;
  lookingForPermanentIntern: string;
  projectDescriptionUrl?: string;
  referralSource?: string;
  commitmentAcknowledged?: boolean;
}

export async function createStartup(data: CreateStartupRequest): Promise<Startup> {
  return postJson<Startup>("/v1/startups/intake", data);
}

export async function getStartups(): Promise<Startup[]> {
  return getJson<Startup[]>("/v1/startups");
}
