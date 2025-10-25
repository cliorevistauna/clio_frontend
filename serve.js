const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Verificar que el directorio build existe
const buildPath = path.join(__dirname, 'build');
if (!fs.existsSync(buildPath)) {
  console.error('ERROR: El directorio build no existe. Asegúrate de ejecutar "npm run build" primero.');
  process.exit(1);
}

console.log(`Sirviendo archivos desde: ${buildPath}`);

// Servir archivos estáticos desde el directorio build
app.use(express.static(buildPath, {
  maxAge: '1d',
  etag: true
}));

// Healthcheck endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manejar todas las rutas y devolver index.html (para React Router)
app.get('*', (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('ERROR: index.html no encontrado en:', indexPath);
    return res.status(500).send('Application not properly built');
  }
  res.sendFile(indexPath);
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err);
  res.status(500).send('Error interno del servidor');
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Servidor corriendo en puerto ${PORT}`);
  console.log(`✓ Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Aplicación disponible en http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`ERROR: El puerto ${PORT} ya está en uso`);
  } else {
    console.error('ERROR al iniciar el servidor:', err);
  }
  process.exit(1);
});
