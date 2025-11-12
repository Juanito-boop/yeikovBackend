import { z } from 'zod';

export const crearAprobacionSchema = z.object({
  planId: z
    .string({ message: 'El ID del plan es obligatorio' })
    .uuid('ID de plan inválido'),
  nivel: z
    .string({ message: 'El nivel de aprobación es obligatorio' })
    .min(3, 'El nivel debe tener al menos 3 caracteres'),
  aprobado: z.boolean({ message: 'Debe indicar si está aprobado o no' }),
  comentarios: z.string().optional(),
});

export type CrearAprobacionInput = z.infer<typeof crearAprobacionSchema>;
