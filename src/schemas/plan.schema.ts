import { z } from 'zod';

export const crearPlanSchema = z.object({
  titulo: z
    .string({ message: 'El título es obligatorio' })
    .min(5, 'El título debe tener al menos 5 caracteres'),
  descripcion: z
    .string({ message: 'La descripción es obligatoria' })
    .min(10, 'La descripción debe tener al menos 10 caracteres'),
  docenteId: z
    .string({ message: 'El docente es obligatorio' })
    .uuid('ID de docente inválido'),
  incidenciaId: z
    .string()
    .uuid('ID de incidencia inválido')
    .optional(),
});

export const aprobarPlanSchema = z.object({
  aprobado: z.boolean({ message: 'El campo aprobado es obligatorio' }),
  comentarios: z.string().optional(),
});

export const cerrarPlanSchema = z.object({
  motivo: z.string().optional(), // opcional, por si se guarda motivo de cierre
});

export type CrearPlanInput = z.infer<typeof crearPlanSchema>;
export type AprobarPlanInput = z.infer<typeof aprobarPlanSchema>;
export type CerrarPlanInput = z.infer<typeof cerrarPlanSchema>;
