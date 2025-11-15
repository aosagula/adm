import { api } from './api';
import {
  Agent,
  CreateAgentDto,
  UpdateAgentDto,
  QueryAgentsDto,
  PaginatedResponse,
  AgentMetric,
} from '@/types';

export const agentsService = {
  // Get all agents with filters
  async getAll(params?: QueryAgentsDto): Promise<PaginatedResponse<Agent>> {
    const { data } = await api.get('/agents', { params });
    return data;
  },

  // Get agents by project
  async getByProject(projectId: string): Promise<Agent[]> {
    const { data } = await api.get(`/agents/project/${projectId}`);
    return data;
  },

  // Get agent by id
  async getById(id: string): Promise<Agent> {
    const { data } = await api.get(`/agents/${id}`);
    return data;
  },

  // Create agent
  async create(projectId: string, agentData: CreateAgentDto): Promise<Agent> {
    const { data } = await api.post(`/agents/project/${projectId}`, agentData);
    return data;
  },

  // Update agent
  async update(id: string, agentData: UpdateAgentDto): Promise<Agent> {
    const { data } = await api.patch(`/agents/${id}`, agentData);
    return data;
  },

  // Update agent config
  async updateConfig(id: string, config: Record<string, any>): Promise<Agent> {
    const { data } = await api.patch(`/agents/${id}/config`, { config });
    return data;
  },

  // Toggle active status
  async toggleActive(id: string): Promise<Agent> {
    const { data } = await api.patch(`/agents/${id}/toggle-active`);
    return data;
  },

  // Delete agent
  async delete(id: string): Promise<void> {
    await api.delete(`/agents/${id}`);
  },

  // Get version history
  async getVersionHistory(id: string): Promise<any[]> {
    const { data } = await api.get(`/agents/${id}/versions`);
    return data;
  },

  // Get metrics
  async getMetrics(id: string, days: number = 7): Promise<AgentMetric[]> {
    const { data } = await api.get(`/agents/${id}/metrics`, { params: { days } });
    return data;
  },

  // Clone agent
  async clone(id: string, newName: string, targetProjectId: string): Promise<Agent> {
    const { data } = await api.post(`/agents/${id}/clone`, {
      newName,
      targetProjectId,
    });
    return data;
  },
};
