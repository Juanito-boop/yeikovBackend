import { z } from 'zod';

const ALLOWED_DOMAINS = ['usantoto.edu.co', 'ustatunja.edu.co'];

const validateInstitutionalEmail = (email: string) => {
  const domain = email.split('@')[1];
  return ALLOWED_DOMAINS.includes(domain);
};

export const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

export const registerSchema = z.object({
  email: z.email('Email inválido').refine(validateInstitutionalEmail, {
    message: `Solo se permiten correos institucionales (${ALLOWED_DOMAINS.join(', ')})`
  }),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  roleId: z.uuid('Role ID inválido').optional(),
  role: z.string().optional(),
  schoolId: z.uuid('School ID inválido').optional(),
  sendWelcomeEmail: z.boolean().optional()
}).refine((data) => data.roleId || data.role, {
  message: 'Debe proporcionar roleId o role',
  path: ['roleId']
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirma la nueva contraseña')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
