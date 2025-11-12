import { z } from 'zod';

export const crearAccionSchema = z.object({
  planId: z
    .string({ message: 'El ID del plan es obligatorio' })
    .uuid('ID de plan inválido'),
  descripcion: z
    .string({ message: 'La descripción es obligatoria' })
    .min(5, 'La descripción debe tener al menos 5 caracteres'),
  fechaObjetivo: z
    .string()
    .datetime('Formato de fecha inválido')
    .optional(),
});

export const actualizarEstadoAccionSchema = z.object({
  estado: z.enum(['Pendiente', 'EnProgreso', 'Completada'], {
    message: 'El estado debe ser Pendiente, EnProgreso o Completada',
  }),
});

export type CrearAccionInput = z.infer<typeof crearAccionSchema>;
export type ActualizarEstadoAccionInput = z.infer<typeof actualizarEstadoAccionSchema>;