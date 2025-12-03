// test-vercel.js en la RAÍZ del proyecto
import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();

app.get('/', (req, res) => {
  try {
    // Verifica si el archivo existe en diferentes nombres
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const possiblePaths = [
      'src/models/WorkoutLog.js',
      'src/models/workoutLog.js',
      './src/models/WorkoutLog.js',
      './src/models/workoutLog.js',
      '/var/task/src/models/WorkoutLog.js',
      '/var/task/src/models/workoutLog.js'
    ];
    
    const results = {};
    possiblePaths.forEach(filePath => {
      try {
        const fullPath = path.join(__dirname, filePath);
        const exists = fs.existsSync(fullPath);
        results[filePath] = exists ? 'EXISTS' : 'NOT FOUND';
      } catch (err) {
        results[filePath] = `ERROR: ${err.message}`;
      }
    });
    
    // Lista todos los archivos en models
    const modelsDir = path.join(__dirname, 'src/models');
    const modelFiles = fs.existsSync(modelsDir) 
      ? fs.readdirSync(modelsDir) 
      : [];
    
    res.json({
      status: 'Test endpoint',
      timestamp: new Date().toISOString(),
      fileCheck: results,
      modelFiles: modelFiles,
      currentDir: __dirname,
      cwd: process.cwd()
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
});

export default app;