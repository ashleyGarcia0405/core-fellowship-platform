const API_BASE = import.meta.env.VITE_API_BASE || "";
export const ACTIVE_TERM = import.meta.env.VITE_ACTIVE_TERM || "Summer 2026";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
export const TERM_OPTIONS = Array.from(
  new Set([ACTIVE_TERM, "Spring 2026", "Summer 2026", "Fall 2026", "Spring 2027"])
);

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

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    // exp is in seconds, Date.now() is in milliseconds
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true; // Invalid token = treat as expired
  }
}

// Callback for handling auth expiration (set by AuthContext)
let onAuthExpired: (() => void) | null = null;

export function setOnAuthExpired(callback: () => void) {
  onAuthExpired = callback;
}

function handleUnauthorized() {
  clearAuthToken();
  if (onAuthExpired) {
    onAuthExpired();
  }
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

/**
 * Extracts a safe, user-facing error message from an error response.
 * Parses JSON `message` field if present; falls back to generic messages
 * for server errors to avoid leaking stack traces or internal paths.
 */
async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const text = await res.text();
    if (!text) return `Request failed (${res.status})`;
    // Try to parse as JSON Spring error response
    const json = JSON.parse(text);
    if (json.message) return json.message;
    if (json.error) return json.error;
  } catch {
    // Not JSON — fall through
  }
  // Never surface raw server internals for 5xx
  if (res.status >= 500) return 'Something went wrong. Please try again.';
  return `Request failed (${res.status})`;
}

export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized();
    }
    const message = await extractErrorMessage(res);
    throw new Error(message);
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
    // Don't trigger logout for auth endpoints (login/register) - those 401s
    // mean wrong credentials, not an expired session
    if (res.status === 401 && !path.startsWith("/v1/auth/")) {
      handleUnauthorized();
    }
    const message = await extractErrorMessage(res);
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<T>;
}

// Auth types
export type UserType = "STUDENT" | "STARTUP" | "ADMIN" | "VC";
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
  adminToken?: string;
  vcToken?: string;
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

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE}/v1/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to reset password");
  }
}

// Interview types
export type Recommendation = "STRONG_YES" | "YES" | "MAYBE" | "NO";

export interface Interview {
  id: string;
  applicationId: string;
  interviewerId: string;
  interviewerName: string;
  interviewDate: string;
  primaryRoleInterest?: string;
  secondaryRoleInterest?: string;
  roleStructurePreference: string;
  startupInterests?: string;
  skillsAndExperience?: string;
  ambiguityExample?: string;
  criticalFeedbackExample?: string;
  workPreference?: string;
  commitmentsAndConflicts?: string;
  clarifyingQuestions?: string;
  technicalProjectOverview?: string;
  technicalRebuildChanges?: string;
  technicalDebuggingExample?: string;
  technicalTestingApproach?: string;
  technicalOnboardingApproach?: string;
  nonTechnicalOrganization?: string;
  nonTechnicalFirstTwoWeeks?: string;
  nonTechnicalCommunication?: string;
  nonTechnicalProudProject?: string;
  bestFitRoleOrStartup?: string;
  likelihoodToAccept?: string;
  commitmentConcerns?: string;
  recommendation: Recommendation;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInterviewRequest {
  primaryRoleInterest?: string;
  secondaryRoleInterest?: string;
  roleStructurePreference: string;
  startupInterests?: string;
  skillsAndExperience?: string;
  ambiguityExample?: string;
  criticalFeedbackExample?: string;
  workPreference?: string;
  commitmentsAndConflicts?: string;
  clarifyingQuestions?: string;
  technicalProjectOverview?: string;
  technicalRebuildChanges?: string;
  technicalDebuggingExample?: string;
  technicalTestingApproach?: string;
  technicalOnboardingApproach?: string;
  nonTechnicalOrganization?: string;
  nonTechnicalFirstTwoWeeks?: string;
  nonTechnicalCommunication?: string;
  nonTechnicalProudProject?: string;
  bestFitRoleOrStartup?: string;
  likelihoodToAccept?: string;
  commitmentConcerns?: string;
  recommendation: Recommendation;
}

export interface UpdateInterviewRequest {
  primaryRoleInterest?: string;
  secondaryRoleInterest?: string;
  roleStructurePreference?: string;
  startupInterests?: string;
  skillsAndExperience?: string;
  ambiguityExample?: string;
  criticalFeedbackExample?: string;
  workPreference?: string;
  commitmentsAndConflicts?: string;
  clarifyingQuestions?: string;
  technicalProjectOverview?: string;
  technicalRebuildChanges?: string;
  technicalDebuggingExample?: string;
  technicalTestingApproach?: string;
  technicalOnboardingApproach?: string;
  nonTechnicalOrganization?: string;
  nonTechnicalFirstTwoWeeks?: string;
  nonTechnicalCommunication?: string;
  nonTechnicalProudProject?: string;
  bestFitRoleOrStartup?: string;
  likelihoodToAccept?: string;
  commitmentConcerns?: string;
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
    if (res.status === 401) {
      handleUnauthorized();
    }
    const message = await extractErrorMessage(res);
    throw new Error(message);
  }
  return res.json() as Promise<Interview>;
}

// Application types
export interface StudentApplication {
  id: string;
  userId: string;
  term: string;
  fullName: string;
  email: string;
  gradYear: string;
  major: string;
  school?: string;
  status: string;
  interviewEligible?: boolean;
  rolePreferences?: string[];
  submittedAt: string;
  updatedAt: string;
}

export interface InterviewBooking {
  id: string;
  applicationId: string;
  studentName: string;
  studentEmail: string;
  interviewType: 'technical' | 'non-technical';
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  interviewers: { userId: string; name: string; email: string }[];
}

export async function getInterviewBookings(term: string): Promise<InterviewBooking[]> {
  return getJson<InterviewBooking[]>(`/v1/admin/interviews?term=${encodeURIComponent(term)}`);
}

export async function getStudentInterviewBookings(): Promise<InterviewBooking[]> {
  return getJson<InterviewBooking[]>('/v1/students/interviews');
}

export async function updateInterviewBooking(
  interviewId: string,
  data: { addInterviewer?: boolean; removeInterviewer?: boolean }
): Promise<InterviewBooking> {
  const res = await fetch(`${API_BASE}/v1/admin/interviews/${interviewId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized();
    }
    const message = await extractErrorMessage(res);
    throw new Error(message);
  }
  return res.json() as Promise<InterviewBooking>;
}

// Application API
export async function getApplications(): Promise<StudentApplication[]> {
  return getJson<StudentApplication[]>("/v1/students/applications");
}

export interface CreateStudentApplicationRequest {
  term: string;
  fullName: string;
  pronouns?: string;
  gradYear: string;
  school?: string;
  major: string;
  email: string;
  linkedinProfile?: string;
  portfolioWebsite?: string;
  resumeUrl: string;
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

export async function uploadResumeBeforeCreate(file: File): Promise<{ message: string; resumeUrl: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/v1/students/applications/resume`, {
    method: 'POST',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized();
    }
    const message = await extractErrorMessage(res);
    throw new Error(message);
  }

  return res.json();
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
    if (res.status === 401) {
      handleUnauthorized();
    }
    const message = await extractErrorMessage(res);
    throw new Error(message);
  }

  return res.json();
}

export async function getResumeSignedUrl(applicationId: string): Promise<{ signedUrl: string; expiresIn: string }> {
  return getJson<{ signedUrl: string; expiresIn: string }>(`/v1/students/applications/${applicationId}/resume`);
}

// Startup types and API
export interface Startup {
  id: string;
  userId: string;
  companyName: string;
  email?: string;
  website?: string;
  industry?: string;
  description?: string;
  stage?: string;
  teamSize?: string;
  foundedYear?: string;
  contactName?: string;
  contactTitle?: string;
  contactEmail?: string;
  contactPhone?: string;
  operatingMode?: string;
  timeZone?: string;
  internsSupervisor?: string;
  hasHiredInternsPreviously?: boolean;
  numberOfInternsNeeded?: number;
  positions?: Position[];
  willPayInterns?: string;
  payAmount?: string;
  lookingForPermanentIntern?: string;
  projectDescriptionUrl?: string;
  referralSource?: string;
  commitmentAcknowledged?: boolean;
  term?: string;
  status: string;
  submittedAt: string;
  updatedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface Position {
  roleType: string;
  description: string;
  requiredSkills?: string[];
  timeCommitment?: string;
}

export interface CreateStartupRequest {
  term: string;
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

export async function getStartups(params?: { term?: string; status?: string }): Promise<Startup[]> {
  const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
  return getJson<Startup[]>(`/v1/startups${query}`);
}

// Admin API functions
export async function getAllApplications(params?: {
  status?: string;
  term?: string;
  page?: number;
  size?: number;
}): Promise<any[]> {
  if (params?.page !== undefined) {
    const query = `?${new URLSearchParams(params as any).toString()}`;
    return getJson<any[]>(`/v1/students/applications${query}`);
  }

  const size = Math.min(params?.size ?? 200, 200);
  const allApplications: any[] = [];
  let page = 0;

  while (true) {
    const queryParams = new URLSearchParams({
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.term ? { term: params.term } : {}),
      page: String(page),
      size: String(size),
    });

    const batch = await getJson<any[]>(`/v1/students/applications?${queryParams.toString()}`);
    allApplications.push(...batch);

    if (batch.length < size) {
      break;
    }

    page += 1;
  }

  return allApplications;
}

export async function updateApplicationStatus(
  applicationId: string,
  status: 'SUBMITTED' | 'INTERVIEW_SCHEDULED' | 'INTERVIEWED' | 'FINALIST' | 'REJECTED' | 'MATCHED' | 'NOT_MATCHED',
  reviewNotes?: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/v1/students/applications/${applicationId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status, reviewNotes }),
  });
  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized();
    }
    const message = await extractErrorMessage(res);
    throw new Error(message);
  }
}

export async function updateInterviewEligibility(
  applicationId: string,
  interviewEligible: boolean
): Promise<void> {
  const res = await fetch(`${API_BASE}/v1/students/applications/${applicationId}/interview-eligible`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ interviewEligible }),
  });
  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized();
    }
    const message = await extractErrorMessage(res);
    throw new Error(message);
  }
}

export async function exportApplicationsCSV(): Promise<Blob> {
  const res = await fetch(`${API_BASE}/v1/export/students.csv`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized();
    }
    const message = await extractErrorMessage(res);
    throw new Error(message);
  }
  return res.blob();
}

export async function exportApplicationsJSON(): Promise<Blob> {
  const res = await fetch(`${API_BASE}/v1/export/students.json`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized();
    }
    const message = await extractErrorMessage(res);
    throw new Error(message);
  }
  return res.blob();
}

// Match Preference types
export interface RoleReference {
  startupId: string;
  positionIndex: number;
}

export interface MatchPreference {
  id: string;
  applicationId: string;
  rankedRoles: RoleReference[];
  notes?: string;
  submitted: boolean;
  matchedRoles?: RoleReference[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export interface AvailableStartup {
  id: string;
  companyName: string;
  website?: string;
  industry?: string;
  description?: string;
  stage?: string;
  teamSize?: string;
  foundedYear?: string;
  operatingMode?: string;
  timeZone?: string;
  numberOfInternsNeeded?: number;
  positions?: Position[];
  willPayInterns?: string;
  payAmount?: string;
}

// Match Preference API
export async function getAvailableStartups(term: string): Promise<AvailableStartup[]> {
  return getJson<AvailableStartup[]>(`/v1/startups/available?term=${encodeURIComponent(term)}`);
}

export async function createMatchPreferences(
  applicationId: string,
  data: { rankedRoles: RoleReference[]; notes?: string; submit?: boolean }
): Promise<MatchPreference> {
  return postJson<MatchPreference>(`/v1/students/applications/${applicationId}/match-preferences`, data);
}

export async function getMatchPreferences(applicationId: string): Promise<MatchPreference> {
  return getJson<MatchPreference>(`/v1/students/applications/${applicationId}/match-preferences`);
}

export async function updateMatchPreferences(
  applicationId: string,
  data: { rankedRoles?: RoleReference[]; notes?: string; submit?: boolean }
): Promise<MatchPreference> {
  const res = await fetch(`${API_BASE}/v1/students/applications/${applicationId}/match-preferences`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized();
    }
    const message = await extractErrorMessage(res);
    throw new Error(message);
  }
  return res.json() as Promise<MatchPreference>;
}

// VC types
export interface VcFavorite {
  id: string;
  vcUserId: string;
  applicationId: string;
  notes?: string;
  portfolioCompany?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface VcPortfolioInvite {
  id: string;
  vcUserId: string;
  vcName: string;
  companyEmail: string;
  companyName: string;
  token: string;
  status: string;
  invitedAt: string;
  registeredAt?: string;
  expiresAt: string;
}

// VC API
export async function getVcFavorites(): Promise<VcFavorite[]> {
  return getJson<VcFavorite[]>('/v1/vc/favorites');
}

export async function saveVcFavorite(
  applicationId: string,
  notes?: string,
  portfolioCompany?: string
): Promise<VcFavorite> {
  return postJson<VcFavorite>('/v1/vc/favorites', { applicationId, notes, portfolioCompany });
}

export async function removeVcFavorite(applicationId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/v1/vc/favorites/${applicationId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) handleUnauthorized();
    const message = await extractErrorMessage(res);
    throw new Error(message);
  }
}

export async function updateVcFavorite(
  applicationId: string,
  data: { notes?: string; portfolioCompany?: string }
): Promise<VcFavorite> {
  const res = await fetch(`${API_BASE}/v1/vc/favorites/${applicationId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    if (res.status === 401) handleUnauthorized();
    const message = await extractErrorMessage(res);
    throw new Error(message);
  }
  return res.json() as Promise<VcFavorite>;
}

export async function exportVcFavoritesCsv(): Promise<Blob> {
  const res = await fetch(`${API_BASE}/v1/vc/favorites/export.csv`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) handleUnauthorized();
    const message = await extractErrorMessage(res);
    throw new Error(message);
  }
  return res.blob();
}

export async function getVcPortfolioInvites(): Promise<VcPortfolioInvite[]> {
  return getJson<VcPortfolioInvite[]>('/v1/vc/portfolio-invites');
}

export async function createVcPortfolioInvite(data: {
  companyEmail: string;
  companyName: string;
}): Promise<VcPortfolioInvite> {
  return postJson<VcPortfolioInvite>('/v1/vc/portfolio-invites', data);
}

// AI Recommendation types
export interface RoleScore {
  startupId: string;
  positionIndex: number;
  startupName: string;
  roleType: string;
  score: number;
  reasoning: string;
}

export interface AiRecommendation {
  id: string;
  applicationId: string;
  roleScores: RoleScore[];
  generatedAt: string;
  updatedAt: string;
}

// Admin Matching API
export async function getAllSubmittedMatchPreferences(term: string): Promise<MatchPreference[]> {
  const query = new URLSearchParams({ term }).toString();
  return getJson<MatchPreference[]>(`/v1/admin/matching/preferences?${query}`);
}

export async function getAiRecommendation(applicationId: string): Promise<AiRecommendation> {
  return getJson<AiRecommendation>(`/v1/admin/matching/recommendations/${applicationId}`);
}

export async function generateAiRecommendation(applicationId: string): Promise<AiRecommendation> {
  return postJson<AiRecommendation>(`/v1/admin/matching/recommendations/${applicationId}`, {});
}

export async function assignMatchRole(
  applicationId: string,
  action: 'add' | 'remove' | 'clear',
  role?: RoleReference
): Promise<MatchPreference> {
  const res = await fetch(`${API_BASE}/v1/admin/matching/preferences/${applicationId}/assign`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ action, role }),
  });
  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized();
    }
    const message = await extractErrorMessage(res);
    throw new Error(message);
  }
  return res.json() as Promise<MatchPreference>;
}
