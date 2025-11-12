import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

import { AppDataSource } from './database/data-source';

import authRoutes from './routes/auth.routes';
import notificationRoutes from './routes/notification.routes';
import directorRoutes from './routes/director.routes';
import schoolRoutes from './routes/school.routes';
import docenteRoutes from './routes/docente.routes';
import planRoutes from './routes/plan.routes';
import incidenciaRoutes from './routes/incidencia.routes';
import accionRoutes from './routes/accion.routes';
import evidenciaRoutes from './routes/evidencia.routes';
import aprobacionRoutes from './routes/aprobacion.routes';
import auditRoutes from './routes/audit.routes';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/director', directorRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/docentes', docenteRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/incidencias', incidenciaRoutes);
app.use('/api/acciones', accionRoutes);
app.use('/api/evidencias', evidenciaRoutes);
app.use('/api/aprobaciones', aprobacionRoutes);
app.use('/api/auditoria', auditRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'SGPM API is running',
    timestamp: new Date().toISOString()
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Algo salió mal',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

export const initializeApp = async (): Promise<Application> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conexión a base de datos establecida');
    return app;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    throw error;
  }
};

export default app;
