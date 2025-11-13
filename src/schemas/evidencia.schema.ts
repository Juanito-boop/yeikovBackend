import { z } from 'zod';

export const subirEvidenciaSchema = z.object({
  accionId: z
    .string({ message: 'El ID de la acción es obligatorio' })
    .uuid('ID de acción inválido'),
  comentario: z
    .string({ message: 'El comentario es obligatorio' })
    .min(10, 'El comentario debe tener al menos 10 caracteres')
    .max(1000, 'El comentario no puede exceder 1000 caracteres'),
});

export type SubirEvidenciaInput = z.infer<typeof subirEvidenciaSchema>;
