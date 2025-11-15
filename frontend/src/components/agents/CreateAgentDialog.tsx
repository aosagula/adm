import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { agentsService } from '@/services/agentsService';
import { CreateAgentDto } from '@/types';

interface CreateAgentDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

export default function CreateAgentDialog({ open, onClose, projectId }: CreateAgentDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateAgentDto>({
    name: '',
    description: '',
    config: {},
    isActive: true,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAgentDto) => agentsService.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', projectId] });
      toast.success('Agente creado exitosamente');
      handleClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al crear el agente';
      toast.error(message);
    },
  });

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      config: {},
      isActive: true,
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Crear Nuevo Agente</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
              autoFocus
            />

            <TextField
              label="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Agente activo"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createMutation.isPending || !formData.name}
          >
            {createMutation.isPending ? 'Creando...' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
