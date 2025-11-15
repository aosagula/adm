import { api } from './api';

export interface Template {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isPublic: boolean;
  baseConfig: Record<string, any>;
  dockerCompose?: string;
  readme?: string;
  thumbnailUrl?: string;
  organizationId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    projects: number;
    stacks: number;
  };
}

export const templatesService = {
  async getAll(filters?: any): Promise<Template[]> {
    const { data } = await api.get('/templates', { params: filters });
    return data;
  },

  async getById(id: string): Promise<Template> {
    const { data } = await api.get(`/templates/${id}`);
    return data;
  },

  async create(templateData: any): Promise<Template> {
    const { data } = await api.post('/templates', templateData);
    return data;
  },

  async update(id: string, templateData: any): Promise<Template> {
    const { data } = await api.patch(`/templates/${id}`, templateData);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/templates/${id}`);
  },
};
