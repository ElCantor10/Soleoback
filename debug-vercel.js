// debug-vercel.js en la RAÍZ
import express from 'express';
import mongoose from 'mongoose';

const app = express();

app.get('/', async (req, res) => {
  try {
    console.log('=== INICIANDO DEBUG ===');
    
    // 1. Variables de entorno
    const env = {
      NODE_ENV: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoUriPreview: process.env.MONGODB_URI ? 
        `${process.env.MONGODB_URI.substring(0, 20)}...` : 'NO DEFINIDA',
      port: process.env.PORT
    };
    
    console.log('ENV:', env);
    
    // 2. Intenta importar el modelo problemático
    let workoutLogImport = 'NO INTENTADO';
    try {
      const workoutLogModule = await import('./src/models/workoutLog.js');
      workoutLogImport = `✅ IMPORTADO: ${workoutLogModule.default?.modelName || 'Sin nombre'}`;
      console.log('WorkoutLog import:', workoutLogImport);
    } catch (importError) {
      workoutLogImport = `❌ ERROR IMPORT: ${importError.message}`;
      console.error('Error importando WorkoutLog:', importError);
    }
    
    // 3. Intenta conectar MongoDB
    let mongoStatus = 'NO INTENTADO';
    if (process.env.MONGODB_URI) {
      try {
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000
        });
        mongoStatus = '✅ CONECTADO';
        console.log('MongoDB conectado');
      } catch (mongoError) {
        mongoStatus = `❌ MONGO ERROR: ${mongoError.message}`;
        console.error('Error MongoDB:', mongoError);
      }
    } else {
      mongoStatus = '⚠️ SIN URI';
    }
    
    // 4. Listar archivos en models
    const fs = await import('fs');
    const path = await import('path');
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    
    const modelsPath = path.join(__dirname, 'src/models');
    let modelFiles = [];
    try {
      modelFiles = fs.readdirSync(modelsPath);
    } catch (error) {
      modelFiles = [`ERROR: ${error.message}`];
    }
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: env,
      imports: {
        workoutLog: workoutLogImport,
        mongoose: mongoose.version
      },
      database: {
        status: mongoStatus,
        connectionState: mongoose.connection.readyState,
        // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        stateDescription: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]
      },
      files: {
        modelsDirectory: modelsPath,
        filesInModels: modelFiles,
        workoutLogExists: modelFiles.includes('workoutLog.js') || modelFiles.includes('WorkoutLog.js')
      },
      paths: {
        currentDir: __dirname,
        cwd: process.cwd()
      }
    });
    
  } catch (error) {
    console.error('ERROR GENERAL:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

export default app;