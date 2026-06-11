const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'expenses.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const sessions = new Map();

function ensureFile(filePath, fallback) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, fallback, 'utf8');
}

function readJson(filePath) {
  ensureFile(filePath, '[]');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  ensureFile(filePath, '[]');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function readExpenses() {
  return readJson(DATA_FILE);
}

function writeExpenses(items) {
  writeJson(DATA_FILE, items);
}

function readUsers() {
  return readJson(USERS_FILE);
}

function writeUsers(users) {
  writeJson(USERS_FILE, users);
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token || !sessions.has(token)) {
    return res.status(401).json({ message: 'Login required to use Expenzo.' });
  }

  const user = sessions.get(token);
  req.user = user;
  next();
}

function createToken(user) {
  const token = 'expenzo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
  sessions.set(token, user);
  return token;
}

app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  const user = users.find(item => item.username === username && item.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const token = createToken(user);
  res.json({ token, user: { id: user.id, username: user.username } });
});

app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const users = readUsers();
  const exists = users.some(item => item.username.toLowerCase() === username.toLowerCase());
  if (exists) {
    return res.status(409).json({ message: 'That username is already taken.' });
  }

  const user = { id: 'user_' + Date.now(), username: username.trim(), password };
  users.push(user);
  writeUsers(users);

  const token = createToken(user);
  res.status(201).json({ token, user: { id: user.id, username: user.username } });
});

app.get('/api/expenses', authMiddleware, (req, res) => {
  const expenses = readExpenses().filter(item => item.userId === req.user.id);
  res.json(expenses);
});

app.post('/api/expenses', authMiddleware, (req, res) => {
  const { desc, amt, cat, dateVal } = req.body;

  if (!desc || !amt || !dateVal) {
    return res.status(400).json({ message: 'Description, amount, and date are required.' });
  }

  const expenses = readExpenses();
  const record = {
    id: 'exp_' + Date.now(),
    userId: req.user.id,
    desc: desc.trim(),
    amt: Number(amt),
    cat: cat || 'General',
    dateVal
  };

  expenses.unshift(record);
  writeExpenses(expenses);
  res.status(201).json(record);
});

app.delete('/api/expenses/:id', authMiddleware, (req, res) => {
  const expenses = readExpenses();
  const item = expenses.find(entry => entry.id === req.params.id && entry.userId === req.user.id);

  if (!item) {
    return res.status(404).json({ message: 'Expense not found.' });
  }

  const filtered = expenses.filter(entry => !(entry.id === req.params.id && entry.userId === req.user.id));
  writeExpenses(filtered);
  res.json({ message: 'Expense deleted successfully.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Expenzo backend is running at http://localhost:${PORT}`);
});
