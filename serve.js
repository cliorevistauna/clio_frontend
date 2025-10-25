const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos desde el directorio build
app.use(express.static(path.join(__dirname, 'build')));

// Manejar todas las rutas y devolver index.html (para React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Aplicaci\u00f3n disponible en http://localhost:${PORT}`);
});
