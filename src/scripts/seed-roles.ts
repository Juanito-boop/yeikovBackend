import 'reflect-metadata';
import { AppDataSource } from '../database/data-source';
import { Role, RoleType } from '../entities/Role';

const seedRoles = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conexión establecida');

    const roleRepository = AppDataSource.getRepository(Role);

    const roles = [
      { nombre: RoleType.DOCENTE, descripcion: 'Profesor que gestiona planes de mejoramiento' },
      { nombre: RoleType.ADMIN, descripcion: 'Administrador del sistema' },
      { nombre: RoleType.DECANO, descripcion: 'Decano de la facultad' },
      { nombre: RoleType.DIRECTOR, descripcion: 'Director del programa' }
    ];

    for (const roleData of roles) {
      const existingRole = await roleRepository.findOne({
        where: { nombre: roleData.nombre }
      });

      if (!existingRole) {
        const role = roleRepository.create(roleData);
        await roleRepository.save(role);
        console.log(`✅ Role creado: ${roleData.nombre}`);
      } else {
        console.log(`ℹ️  Role ya existe: ${roleData.nombre}`);
      }
    }

    console.log('✅ Seed de roles completado');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

seedRoles();
