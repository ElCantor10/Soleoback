// src/db/connect.js - VERSIÓN MEJORADA (más tolerante)
import mongoose from "mongoose";

let cached = global._mongooseConn;
if (!cached) cached = global._mongooseConn = { conn: null, promise: null };

export async function connectToDB() {
  // Si ya estamos conectados, devolver la conexión
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }
  
  if (!cached.promise) {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ Falta MONGODB_URI en variables de entorno');
      // En producción, no lances error, solo retorna null
      if (process.env.NODE_ENV === 'production') {
        console.log('⚠️  Continuando sin MongoDB en producción');
        return null;
      }
      throw new Error("Falta MONGODB_URI en variables de entorno");
    }
    
    console.log('🔗 Conectando a MongoDB...');
    
    cached.promise = mongoose.connect(mongoUri, { 
      dbName: "soleo",
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // 5 segundos timeout
    })
    .then((m) => {
      console.log('✅ MongoDB conectado');
      return m.connection;
    })
    .catch((error) => {
      console.error('❌ Error conectando a MongoDB:', error.message);
      cached.promise = null; // Reset para reintentar
      
      // En producción, no lances error
      if (process.env.NODE_ENV === 'production') {
        console.log('⚠️  Continuando sin MongoDB');
        return null;
      }
      throw error; // Solo en desarrollo
    });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    return null;
  }
}