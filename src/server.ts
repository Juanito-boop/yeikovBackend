import 'reflect-metadata';
import { initializeApp } from './app';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    const app = await initializeApp();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📧 Mailpit UI: http://localhost:8025`);
      console.log(`🌐 API URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
