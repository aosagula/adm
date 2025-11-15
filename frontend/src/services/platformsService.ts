import { api } from './api';

export interface Platform {
  id: string;
  name: string;
  provider: string;
  description?: string;
  config: Record<string, any>;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    stacks: number;
  };
}

export const platformsService = {
  async getAll(filters?: any): Promise<Platform[]> {
    const { data } = await api.get('/platforms', { params: filters });
    return data;
  },

  async getById(id: string): Promise<Platform> {
    const { data } = await api.get(`/platforms/${id}`);
    return data;
  },

  async create(platformData: any): Promise<Platform> {
    const { data } = await api.post('/platforms', platformData);
    return data;
  },

  async update(id: string, platformData: any): Promise<Platform> {
    const { data } = await api.patch(`/platforms/${id}`, platformData);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/platforms/${id}`);
  },
};
