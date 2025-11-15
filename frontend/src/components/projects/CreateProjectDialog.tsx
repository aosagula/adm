import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '@/services/projectsService';
import { ProjectStatus, ProjectVisibility } from '@/types';
import toast from 'react-hot-toast';

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateProjectDialog({ open, onClose }: CreateProjectDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    longDescription: '',
    status: 'DEVELOPMENT' as ProjectStatus,
    visibility: 'PRIVATE' as ProjectVisibility,
    repositoryUrl: '',
    repositoryBranch: '',
  });

  const createMutation = useMutation({
    mutationFn: projectsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Proyecto creado exitosamente');
      handleClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al crear el proyecto';
      toast.error(message);
    },
  });

  const handleClose = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      longDescription: '',
      status: 'DEVELOPMENT',
      visibility: 'PRIVATE',
      repositoryUrl: '',
      repositoryBranch: '',
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate slug from name if not provided
    const slug = formData.slug || formData.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    createMutation.mutate({
      ...formData,
      slug,
      // Only include optional fields if they have values
      ...(formData.longDescription && { longDescription: formData.longDescription }),
      ...(formData.repositoryUrl && { repositoryUrl: formData.repositoryUrl }),
      ...(formData.repositoryBranch && { repositoryBranch: formData.repositoryBranch }),
    });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      // Auto-generate slug if it hasn't been manually edited
      slug: prev.slug === '' || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        : prev.slug,
    }));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nombre del Proyecto"
              value={formData.name}
              onChange={handleNameChange}
              required
              fullWidth
              autoFocus
            />

            <TextField
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              fullWidth
              helperText="Identificador único del proyecto (se genera automáticamente del nombre)"
            />

            <TextField
              label="Descripción Corta"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />

            <TextField
              label="Descripción Detallada"
              value={formData.longDescription}
              onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
              fullWidth
              multiline
              rows={4}
            />

            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.status}
                label="Estado"
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
              >
                <MenuItem value="DEVELOPMENT">Desarrollo</MenuItem>
                <MenuItem value="QA">QA</MenuItem>
                <MenuItem value="PRODUCTION">Producción</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Visibilidad</InputLabel>
              <Select
                value={formData.visibility}
                label="Visibilidad"
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value as ProjectVisibility })}
              >
                <MenuItem value="PRIVATE">Privado</MenuItem>
                <MenuItem value="PUBLIC">Público</MenuItem>
                <MenuItem value="INTERNAL">Interno</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="URL del Repositorio"
              value={formData.repositoryUrl}
              onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
              fullWidth
              placeholder="https://github.com/usuario/repo"
            />

            <TextField
              label="Rama del Repositorio"
              value={formData.repositoryBranch}
              onChange={(e) => setFormData({ ...formData, repositoryBranch: e.target.value })}
              fullWidth
              placeholder="main"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Creando...' : 'Crear Proyecto'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
