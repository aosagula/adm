export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
}

export enum ProjectStatus {
  DEVELOPMENT = 'DEVELOPMENT',
  QA = 'QA',
  PRODUCTION = 'PRODUCTION',
  ARCHIVED = 'ARCHIVED',
}

export enum ProjectVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  longDescription?: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  repositoryUrl?: string;
  repositoryBranch?: string;
  organizationId: string;
  ownerId: string;
  owner?: User;
  members?: ProjectMember[];
  agents?: Agent[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    agents: number;
    members: number;
  };
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
  user?: User;
  createdAt: string;
}

export interface Agent {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  isActive: boolean;
  config: Record<string, any>;
  project?: Project;
  prompts?: AgentPrompt[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    prompts: number;
    metrics: number;
    testSessions: number;
  };
}

export interface AgentPrompt {
  id: string;
  agentId: string;
  name: string;
  content: string;
  parameters: any;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentDto {
  name: string;
  description?: string;
  config?: Record<string, any>;
  isActive?: boolean;
}

export interface UpdateAgentDto {
  name?: string;
  description?: string;
  config?: Record<string, any>;
  isActive?: boolean;
}

export interface QueryAgentsDto {
  projectId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AgentMetric {
  id: string;
  projectId: string;
  agentId: string;
  timestamp: string;
  executionCount: number;
  tokensConsumed: number;
  averageLatency?: number;
  errorRate?: number;
  successRate?: number;
  costEstimate?: number;
}
