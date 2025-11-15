import { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { technologiesService, Technology } from '@/services/technologiesService';
import toast from 'react-hot-toast';

export default function Technologies() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTechnology, setSelectedTechnology] = useState<Technology | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    iconUrl: '',
    websiteUrl: '',
  });

  const { data: technologies, isLoading } = useQuery({
    queryKey: ['technologies'],
    queryFn: technologiesService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: technologiesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] });
      toast.success('Tecnología creada exitosamente');
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear la tecnología');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => technologiesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] });
      toast.success('Tecnología actualizada exitosamente');
      setEditDialogOpen(false);
      setSelectedTechnology(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la tecnología');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: technologiesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] });
      toast.success('Tecnología eliminada exitosamente');
      setDeleteDialogOpen(false);
      setSelectedTechnology(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar la tecnología');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      description: '',
      iconUrl: '',
      websiteUrl: '',
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const handleOpenEdit = (technology: Technology) => {
    setSelectedTechnology(technology);
    setFormData({
      name: technology.name,
      type: technology.type,
      description: technology.description || '',
      iconUrl: technology.iconUrl || '',
      websiteUrl: technology.websiteUrl || '',
    });
    setEditDialogOpen(true);
  };

  const handleOpenDelete = (technology: Technology) => {
    setSelectedTechnology(technology);
    setDeleteDialogOpen(true);
  };

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (selectedTechnology) {
      updateMutation.mutate({ id: selectedTechnology.id, data: formData });
    }
  };

  const handleDelete = () => {
    if (selectedTechnology) {
      deleteMutation.mutate(selectedTechnology.id);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Tecnologías
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}>
          Nueva Tecnología
        </Button>
      </Box>

      <Grid container spacing={3}>
        {technologies?.map((technology) => (
          <Grid item xs={12} md={6} lg={4} key={technology.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{technology.name}</Typography>
                <Chip label={technology.type} size="small" sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {technology.description || 'Sin descripción'}
                </Typography>
                {technology._count && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {technology._count.versions} versión(es)
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<Edit />} onClick={() => handleOpenEdit(technology)}>
                  Editar
                </Button>
                <Button size="small" color="error" startIcon={<Delete />} onClick={() => handleOpenDelete(technology)}>
                  Eliminar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nueva Tecnología</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Tipo"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
              fullWidth
              placeholder="Runtime, Framework, Library, etc."
            />
            <TextField
              label="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="URL del Icono"
              value={formData.iconUrl}
              onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
              fullWidth
            />
            <TextField
              label="URL del Sitio Web"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} variant="contained" disabled={createMutation.isPending}>
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Tecnología</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Tipo"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="URL del Icono"
              value={formData.iconUrl}
              onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
              fullWidth
            />
            <TextField
              label="URL del Sitio Web"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleUpdate} variant="contained" disabled={updateMutation.isPending}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Eliminar Tecnología</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar la tecnología <strong>{selectedTechnology?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleteMutation.isPending}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
