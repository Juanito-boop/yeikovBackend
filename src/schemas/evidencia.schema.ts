import { z } from 'zod';

export const subirEvidenciaSchema = z.object({
  accionId: z
    .string({ message: 'El ID de la acción es obligatorio' })
    .uuid('ID de acción inválido'),
  comentario: z.string().optional(),
});

export type SubirEvidenciaInput = z.infer<typeof subirEvidenciaSchema>;
