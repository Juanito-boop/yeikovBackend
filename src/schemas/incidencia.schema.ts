import { z } from 'zod';

export const crearIncidenciaSchema = z.object({
  docenteId: z
    .string({ message: 'El ID del docente es obligatorio' })
    .uuid('ID de docente inválido'),
  descripcion: z
    .string({ message: 'La descripción es obligatoria' })
    .min(5, 'La descripción debe tener al menos 5 caracteres'),
});

export const actualizarEstadoIncidenciaSchema = z.object({
  estado: z.enum(['Pendiente', 'Revisado', 'Archivado'], {
    message: 'El estado debe ser Pendiente, Revisado o Archivado',
  }),
});

export type CrearIncidenciaInput = z.infer<typeof crearIncidenciaSchema>;
export type ActualizarEstadoIncidenciaInput = z.infer<typeof actualizarEstadoIncidenciaSchema>;