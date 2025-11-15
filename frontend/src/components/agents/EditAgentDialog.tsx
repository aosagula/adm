import { useState, useEffect } from 'react';
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
  Tabs,
  Tab,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { agentsService } from '@/services/agentsService';
import { Agent, UpdateAgentDto } from '@/types';

interface EditAgentDialogProps {
  open: boolean;
  onClose: () => void;
  agent: Agent;
  projectId: string;
}

export default function EditAgentDialog({ open, onClose, agent, projectId }: EditAgentDialogProps) {
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<UpdateAgentDto>({
    name: agent.name,
    description: agent.description || '',
    isActive: agent.isActive,
  });
  const [configJson, setConfigJson] = useState(JSON.stringify(agent.config || {}, null, 2));

  useEffect(() => {
    setFormData({
      name: agent.name,
      description: agent.description || '',
      isActive: agent.isActive,
    });
    setConfigJson(JSON.stringify(agent.config || {}, null, 2));
  }, [agent]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateAgentDto) => agentsService.update(agent.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents', projectId] });
      toast.success('Agente actualizado exitosamente');
      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Error al actualizar el agente';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const config = JSON.parse(configJson);
      updateMutation.mutate({ ...formData, config });
    } catch (error) {
      toast.error('JSON de configuración inválido');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Editar Agente</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              <Tab label="Información" />
              <Tab label="Configuración" />
            </Tabs>
          </Box>

          {tabValue === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Nombre"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
              />

              <TextField
                label="Descripción"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={4}
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
          )}

          {tabValue === 1 && (
            <Box sx={{ pt: 1 }}>
              <TextField
                label="Configuración (JSON)"
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                multiline
                rows={15}
                fullWidth
                sx={{ fontFamily: 'monospace' }}
                helperText="Formato JSON válido. Ejemplo: { 'model': 'gpt-4', 'temperature': 0.7 }"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updateMutation.isPending || !formData.name}
          >
            {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
