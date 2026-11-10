// NovaBlog Enterprise - TypeScript DTO Definitions matching Spring Boot Backend

export type BlogLifecycleStatus = 'ACTIVE' | 'SOFT_DELETED' | 'PURGE_ELIGIBLE';
export type CommentModerationStatus = 'PENDING_MODERATION' | 'APPROVED' | 'FLAGGED_TOXIC' | 'SOFT_DELETED';
export type TwoFactorEnrollmentStatus = 'DISABLED' | 'PENDING_VERIFICATION' | 'ENABLED';
export type AuthState = 'ANONYMOUS' | 'PRE_AUTH_2FA_REQUIRED' | 'AUTHENTICATED' | 'REFRESHING' | 'REVOKED';

export interface ApiResult<T> {
  status: 'SUCCESS' | 'ERROR';
  message?: string;
  data: T;
  error?: string;
  path?: string;
  timestamp?: string;
}

export interface BlogCategoryDto {
  categoryId?: number;
  categoryName: string;
  categoryDescription?: string;
}

export interface BlogDto {
  id?: number;
  blogId?: number;
  header: string;
  title: string;
  content: string;
  author?: string;
  authorId?: number;
  authorUsername?: string;
  imagePath?: string;
  image?: string;
  views?: number;
  viewsCount?: number;
  likes?: number;
  likesCount?: number;
  version?: number;
  commentCount?: number;
  isPublished?: boolean;
  isDeleted?: boolean;
  publishedAt?: string;
  createdDate?: string;
  updatedDate?: string;
  category?: BlogCategoryDto;
  blogCategoryDto?: BlogCategoryDto;
  tags?: string[];
  aiSummary?: string;
  hasVectorEmbedding?: boolean;
  hasEmbedding?: boolean;
  lifecycleStatus?: BlogLifecycleStatus;
  isLiked?: boolean; // Client-side Optimistic UI state
}

export interface BlogFilterRequestDto {
  search?: string;
  categoryId?: number;
  tag?: string;
  author?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface PagedResponseDto<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface BlogSemanticSearchResultDto {
  blog: BlogDto;
  similarityScore: number;
  matchedKeywords?: string[];
  searchMode: 'SEMANTIC' | 'KEYWORD' | 'HYBRID';
  explanation?: string;
}

export interface AiSummaryRequestDto {
  text: string;
  title?: string;
}

export interface AiSummaryResponseDto {
  summary: string;
  originalLength: number;
  summaryLength: number;
  compressionRatio: number; // e.g. 0.65 (65% reduction)
  executionTimeMs: number;
  model: string;
}

export interface AiTagSuggestionRequestDto {
  title: string;
  content: string;
}

export interface AiTagSuggestionResponseDto {
  suggestedTags: string[];
  suggestedCategory: string;
  confidenceScore: number;
  keywords: string[];
}

export interface AiModerationRequestDto {
  text: string;
}

export interface AiModerationResponseDto {
  toxic: boolean;
  toxicityScore: number;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  sentimentScore: number;
  flaggedCategories: string[];
  reason?: string;
}

export interface CommentResponseDto {
  id: number;
  blogId: number;
  content: string;
  authorName: string;
  authorEmail?: string;
  authorAvatar?: string;
  createdAt: string;
  isApproved: boolean;
  moderationStatus?: CommentModerationStatus;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  moderationReason?: string;
  isOptimistic?: boolean; // Optimistic UI pending indicator
}

export interface CommentCreateRequestDto {
  content: string;
  authorName?: string;
  authorEmail?: string;
}

export interface UserProfileDto {
  id: number;
  name: string;
  email: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN';
  twoFactorEnabled: boolean;
  twoFactorEnrollmentStatus?: TwoFactorEnrollmentStatus;
  createdAt?: string;
}

export interface TwoFactorStatusDto {
  is2faEnabled: boolean;
  enrollmentStatus?: TwoFactorEnrollmentStatus;
  remainingBackupCodes: number;
}

export interface TwoFactorSetupResponseDto {
  secret: string;
  qrCodeDataUri: string;
  manualEntryKey: string;
  otpAuthUrl: string;
}

export interface TwoFactorRecoveryCodesDto {
  recoveryCodes: string[];
  message: string;
}

export interface JwtResponseDto {
  token: string;
  refreshToken?: string;
  tokenType: string;
  userId: number;
  email: string;
  name: string;
  roles: string[];
  twoFactorRequired?: boolean;
  authState?: AuthState;
}

export interface JobExecutionResponseDto {
  jobExecutionId: number;
  jobName: string;
  status: 'STARTING' | 'STARTED' | 'STOPPING' | 'STOPPED' | 'FAILED' | 'COMPLETED' | 'ABANDONED';
  exitCode: string;
  startTime?: string;
  endTime?: string;
  stepSummaries?: string[];
  processedCount?: number;
}

