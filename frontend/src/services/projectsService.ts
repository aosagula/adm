import { api } from './api';
import { Project } from '@/types';

export const projectsService = {
  // Get all projects
  async getAll(): Promise<Project[]> {
    const { data } = await api.get('/projects');
    return data;
  },

  // Get project by id
  async getById(id: string): Promise<Project> {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  },

  // Create project
  async create(projectData: any): Promise<Project> {
    const { data } = await api.post('/projects', projectData);
    return data;
  },

  // Update project
  async update(id: string, projectData: any): Promise<Project> {
    const { data } = await api.patch(`/projects/${id}`, projectData);
    return data;
  },

  // Delete project
  async delete(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
};
