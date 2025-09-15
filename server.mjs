import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';

const app = express();
const PORT = 3001;
const SECRET_KEY = 'ui-gestor-secret-key-2024';
const EXPIRATION_TIME = '24h';

// Middleware
app.use(cors());
app.use(express.json());

// Función para leer la base de datos
const readDB = () => {
  try {
    const data = fs.readFileSync('db.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { users: [], auth: [], editorialNumbers: [], researchers: [], thematicLines: [] };
  }
};

// Función para escribir la base de datos
const writeDB = (data) => {
  try {
    fs.writeFileSync('db.json', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing database:', error);
  }
};

// Función para generar hash de contraseña
const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

// Función para verificar contraseña
const verifyPassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

// Función para generar JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    SECRET_KEY,
    { expiresIn: EXPIRATION_TIME }
  );
};

// Middleware para verificar JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Endpoint de login
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  const db = readDB();
  const users = db.users || [];
  const authRecords = db.auth || [];

  // Buscar usuario por email
  const user = users.find(u => u.email === email);
  const authRecord = authRecords.find(a => a.email === email);

  if (!user || !authRecord) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  // Por ahora, comparación directa de contraseñas (simula bcrypt)
  // En producción usarías: verifyPassword(password, authRecord.hashedPassword)
  if (authRecord.password !== password) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = generateToken(user);

  res.json({
    user: user,
    token: token
  });
});

// Endpoint para verificar token
app.get('/auth/verify', verifyToken, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  res.json({ user });
});

// Endpoint para logout (opcional)
app.post('/auth/logout', verifyToken, (req, res) => {
  res.json({ message: 'Logout exitoso' });
});

// CRUD básico para usuarios
app.get('/users', verifyToken, (req, res) => {
  const db = readDB();
  res.json(db.users || []);
});

app.get('/users/:id', verifyToken, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  res.json(user);
});

app.post('/users', (req, res) => {
  const db = readDB();
  const newUser = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.users = db.users || [];
  db.users.push(newUser);
  writeDB(db);

  res.status(201).json(newUser);
});

// CRUD básico para números editoriales
app.get('/editorialNumbers', verifyToken, (req, res) => {
  const db = readDB();
  res.json(db.editorialNumbers || []);
});

app.get('/editorialNumbers/:id', verifyToken, (req, res) => {
  const db = readDB();
  const editorialNumber = db.editorialNumbers.find(en => en.id === req.params.id);
  if (!editorialNumber) {
    return res.status(404).json({ error: 'Número editorial no encontrado' });
  }
  res.json(editorialNumber);
});

app.post('/editorialNumbers', verifyToken, (req, res) => {
  const db = readDB();
  const newEditorialNumber = {
    id: Date.now().toString(),
    ...req.body,
    createdBy: req.user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.editorialNumbers = db.editorialNumbers || [];
  db.editorialNumbers.push(newEditorialNumber);
  writeDB(db);

  res.status(201).json(newEditorialNumber);
});

app.put('/editorialNumbers/:id', verifyToken, (req, res) => {
  const db = readDB();
  const index = db.editorialNumbers.findIndex(en => en.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Número editorial no encontrado' });
  }

  db.editorialNumbers[index] = {
    ...db.editorialNumbers[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  writeDB(db);
  res.json(db.editorialNumbers[index]);
});

app.delete('/editorialNumbers/:id', verifyToken, (req, res) => {
  const db = readDB();
  const index = db.editorialNumbers.findIndex(en => en.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Número editorial no encontrado' });
  }

  db.editorialNumbers.splice(index, 1);
  writeDB(db);

  res.json({ message: 'Número editorial eliminado' });
});

// CRUD básico para investigadores
app.get('/researchers', verifyToken, (req, res) => {
  const db = readDB();
  res.json(db.researchers || []);
});

app.get('/researchers/:id', verifyToken, (req, res) => {
  const db = readDB();
  const researcher = db.researchers.find(r => r.id === req.params.id);
  if (!researcher) {
    return res.status(404).json({ error: 'Investigador no encontrado' });
  }
  res.json(researcher);
});

app.post('/researchers', verifyToken, (req, res) => {
  const db = readDB();
  const newResearcher = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.researchers = db.researchers || [];
  db.researchers.push(newResearcher);
  writeDB(db);

  res.status(201).json(newResearcher);
});

app.put('/researchers/:id', verifyToken, (req, res) => {
  const db = readDB();
  const index = db.researchers.findIndex(r => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Investigador no encontrado' });
  }

  db.researchers[index] = {
    ...db.researchers[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  writeDB(db);
  res.json(db.researchers[index]);
});

app.delete('/researchers/:id', verifyToken, (req, res) => {
  const db = readDB();
  const index = db.researchers.findIndex(r => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Investigador no encontrado' });
  }

  db.researchers.splice(index, 1);
  writeDB(db);

  res.json({ message: 'Investigador eliminado' });
});

// Endpoint para líneas temáticas
app.get('/thematicLines', verifyToken, (req, res) => {
  const db = readDB();
  res.json(db.thematicLines || []);
});

app.listen(PORT, () => {
  console.log(`Servidor está corriendo en http://localhost:${PORT}`);
  console.log('Endpoints de autenticación:');
  console.log('POST /auth/login - Iniciar sesión');
  console.log('GET /auth/verify - Verificar token');
  console.log('POST /auth/logout - Cerrar sesión');
  console.log('');
  console.log('CRUD Endpoints:');
  console.log('GET /users - Listar usuarios');
  console.log('GET /editorialNumbers - Listar números editoriales');
  console.log('GET /researchers - Listar investigadores');
  console.log('GET /thematicLines - Listar líneas temáticas');
});