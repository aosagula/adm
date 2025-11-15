import { api } from './api';

export interface Technology {
  id: string;
  name: string;
  type: string;
  description?: string;
  iconUrl?: string;
  websiteUrl?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    stackTechnologies: number;
    versions: number;
  };
}

export const technologiesService = {
  async getAll(filters?: any): Promise<Technology[]> {
    const { data } = await api.get('/technologies', { params: filters });
    return data;
  },

  async getById(id: string): Promise<Technology> {
    const { data } = await api.get(`/technologies/${id}`);
    return data;
  },

  async create(technologyData: any): Promise<Technology> {
    const { data } = await api.post('/technologies', technologyData);
    return data;
  },

  async update(id: string, technologyData: any): Promise<Technology> {
    const { data } = await api.patch(`/technologies/${id}`, technologyData);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/technologies/${id}`);
  },
};
