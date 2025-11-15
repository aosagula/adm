import { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '@/services/projectsService';
import { Project, ProjectStatus, ProjectVisibility } from '@/types';
import toast from 'react-hot-toast';

interface EditProjectDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export default function EditProjectDialog({ open, onClose, project }: EditProjectDialogProps) {
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
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

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        slug: project.slug,
        description: project.description || '',
        longDescription: project.longDescription || '',
        status: project.status,
        visibility: project.visibility,
        repositoryUrl: project.repositoryUrl || '',
        repositoryBranch: project.repositoryBranch || '',
      });
    }
  }, [project]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => projectsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Proyecto actualizado exitosamente');
      handleClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al actualizar el proyecto';
      toast.error(message);
    },
  });

  const handleClose = () => {
    setTabValue(0);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    updateMutation.mutate({
      id: project.id,
      data: {
        ...formData,
        // Only include optional fields if they have values
        ...(formData.longDescription && { longDescription: formData.longDescription }),
        ...(formData.repositoryUrl && { repositoryUrl: formData.repositoryUrl }),
        ...(formData.repositoryBranch && { repositoryBranch: formData.repositoryBranch }),
      },
    });
  };

  if (!project) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Editar Proyecto</DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Información Básica" />
            <Tab label="Configuración" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nombre del Proyecto"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                helperText="Identificador único del proyecto"
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
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  <MenuItem value="ARCHIVED">Archivado</MenuItem>
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
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
