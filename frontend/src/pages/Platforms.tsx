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
import { platformsService, Platform } from '@/services/platformsService';
import toast from 'react-hot-toast';

export default function Platforms() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    description: '',
  });

  const { data: platforms, isLoading } = useQuery({
    queryKey: ['platforms'],
    queryFn: platformsService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: platformsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      toast.success('Plataforma creada exitosamente');
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear la plataforma');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => platformsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      toast.success('Plataforma actualizada exitosamente');
      setEditDialogOpen(false);
      setSelectedPlatform(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la plataforma');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: platformsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      toast.success('Plataforma eliminada exitosamente');
      setDeleteDialogOpen(false);
      setSelectedPlatform(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar la plataforma');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      provider: '',
      description: '',
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const handleOpenEdit = (platform: Platform) => {
    setSelectedPlatform(platform);
    setFormData({
      name: platform.name,
      provider: platform.provider,
      description: platform.description || '',
    });
    setEditDialogOpen(true);
  };

  const handleOpenDelete = (platform: Platform) => {
    setSelectedPlatform(platform);
    setDeleteDialogOpen(true);
  };

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (selectedPlatform) {
      updateMutation.mutate({ id: selectedPlatform.id, data: formData });
    }
  };

  const handleDelete = () => {
    if (selectedPlatform) {
      deleteMutation.mutate(selectedPlatform.id);
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
          Plataformas
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenCreate}>
          Nueva Plataforma
        </Button>
      </Box>

      <Grid container spacing={3}>
        {platforms?.map((platform) => (
          <Grid item xs={12} md={6} lg={4} key={platform.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{platform.name}</Typography>
                <Chip label={platform.provider} size="small" sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {platform.description || 'Sin descripción'}
                </Typography>
                {platform._count && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {platform._count.stacks} stack(s) configurado(s)
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" startIcon={<Edit />} onClick={() => handleOpenEdit(platform)}>
                  Editar
                </Button>
                <Button size="small" color="error" startIcon={<Delete />} onClick={() => handleOpenDelete(platform)}>
                  Eliminar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nueva Plataforma</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
              placeholder="AWS, GCP, Azure, etc."
            />
            <TextField
              label="Proveedor"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              required
              fullWidth
              placeholder="Amazon, Google, Microsoft, etc."
            />
            <TextField
              label="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
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
        <DialogTitle>Editar Plataforma</DialogTitle>
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
              label="Proveedor"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
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
        <DialogTitle>Eliminar Plataforma</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar la plataforma <strong>{selectedPlatform?.name}</strong>?
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
