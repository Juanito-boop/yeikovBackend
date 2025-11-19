import { AppDataSource } from '../database/data-source';
import { User } from '../entities/User';

async function checkUser() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conexión a base de datos establecida');

    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({
      where: { email: 'decano@usantoto.edu.co' },
      relations: ['role', 'school']
    });

    if (user) {
      console.log('\n📧 Usuario encontrado:');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Nombre:', user.nombre, user.apellido);
      console.log('Rol:', user.role?.nombre || 'Sin rol');
      console.log('Facultad:', user.school?.nombre || 'Sin facultad');
      console.log('Activo:', user.activo);
      console.log('Contraseña (hash):', user.password.substring(0, 20) + '...');
    } else {
      console.log('\n❌ Usuario no encontrado con email: decano@usantoto.edu.co');

      // Buscar todos los decanos
      console.log('\n📋 Buscando todos los usuarios con rol Decano...');
      const decanos = await userRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .leftJoinAndSelect('user.school', 'school')
        .where('role.nombre = :roleName', { roleName: 'Decano' })
        .getMany();

      if (decanos.length > 0) {
        console.log(`\n✅ Se encontraron ${decanos.length} decano(s):`);
        decanos.forEach(d => {
          console.log(`  - ${d.email} | ${d.nombre} ${d.apellido} | ${d.school?.nombre || 'Sin facultad'} | Activo: ${d.activo}`);
        });
      } else {
        console.log('❌ No se encontraron usuarios con rol Decano');
      }
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUser();
