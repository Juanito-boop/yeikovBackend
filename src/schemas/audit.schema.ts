import { z } from 'zod';

export const listarLogsSchema = z.object({
  entidad: z.string().optional(),
});

export type ListarLogsInput = z.infer<typeof listarLogsSchema>;
