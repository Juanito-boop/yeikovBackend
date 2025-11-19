import 'reflect-metadata';
import { AppDataSource } from '../database/data-source';
import { User } from '../entities/User';
import { Role, RoleType } from '../entities/Role';
import { School } from '../entities/School';
import * as bcrypt from 'bcryptjs';

async function createDecano() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conexión a base de datos establecida');

    const userRepo = AppDataSource.getRepository(User);
    const roleRepo = AppDataSource.getRepository(Role);
    const schoolRepo = AppDataSource.getRepository(School);

    // Verificar si ya existe
    const existingUser = await userRepo.findOne({
      where: { email: 'decano@usantoto.edu.co' }
    });

    if (existingUser) {
      console.log('\n📧 Usuario ya existe. Actualizando contraseña...');
      const hashedPassword = await bcrypt.hash('decano123', 10);
      existingUser.password = hashedPassword;
      existingUser.activo = true;
      await userRepo.save(existingUser);
      console.log('✅ Contraseña actualizada correctamente');
      await AppDataSource.destroy();
      return;
    }

    // Buscar rol Decano
    const decanoRole = await roleRepo.findOne({
      where: { nombre: RoleType.DECANO }
    });

    if (!decanoRole) {
      console.error('❌ Rol Decano no encontrado');
      await AppDataSource.destroy();
      return;
    }

    // Buscar una facultad (la primera disponible)
    const school = await schoolRepo.findOne({
      where: {},
      order: { nombre: 'ASC' }
    });

    if (!school) {
      console.error('❌ No hay facultades en el sistema');
      await AppDataSource.destroy();
      return;
    }

    // Crear usuario
    const hashedPassword = await bcrypt.hash('decano123', 10);

    const newUser = userRepo.create({
      email: 'decano@usantoto.edu.co',
      password: hashedPassword,
      nombre: 'Decano',
      apellido: 'Prueba',
      roleId: decanoRole.id,
      schoolId: school.id,
      activo: true
    });

    await userRepo.save(newUser);

    console.log('\n✅ Usuario Decano creado exitosamente:');
    console.log('Email: decano@usantoto.edu.co');
    console.log('Contraseña: decano123');
    console.log('Facultad:', school.nombre);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createDecano();
