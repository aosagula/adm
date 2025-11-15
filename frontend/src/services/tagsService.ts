import { api } from './api';

export interface Tag {
  id: string;
  name: string;
  color?: string;
  description?: string;
  isSystem: boolean;
  organizationId: string;
  createdAt: string;
  _count?: {
    projectTags: number;
    tagSuggestions: number;
  };
}

export const tagsService = {
  async getAll(filters?: any): Promise<Tag[]> {
    const { data } = await api.get('/tags', { params: filters });
    return data;
  },

  async getById(id: string): Promise<Tag> {
    const { data } = await api.get(`/tags/${id}`);
    return data;
  },

  async create(tagData: any): Promise<Tag> {
    const { data } = await api.post('/tags', tagData);
    return data;
  },

  async update(id: string, tagData: any): Promise<Tag> {
    const { data } = await api.patch(`/tags/${id}`, tagData);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tags/${id}`);
  },
};
