const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'users.json');

// Initialize users data
let users = {};
async function loadUsers() {
  try {
    if (await fs.access(DATA_FILE).catch(() => false)) {
      const rawData = await fs.readFile(DATA_FILE, 'utf-8');
      users = JSON.parse(rawData) || {};
      for (const username in users) {
        normalizeLevelKeys(users[username]);
      }
    } else {
      users = {};
      await saveUsers();
    }
  } catch (err) {
    console.error('Error reading users.json:', err);
    users = {};
    await saveUsers();
  }
}
loadUsers();

// Helper to save users data
async function saveUsers() {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error writing to users.json:', err);
    throw new Error('Failed to save user data');
  }
}

// Helper to normalize level keys
function normalizeLevelKeys(user) {
  user.levels = Object.fromEntries(
    Object.entries(user.levels || {}).map(([lvl, data]) => [lvl.toString(), data])
  );
  user.hardest_levels = Object.fromEntries(
    Object.entries(user.hardest_levels || {}).map(([lvl, data]) => [lvl.toString(), data])
  );
}

// POST /login - create user if not exist and return full user object
app.post('/login', async (req, res) => {
  const { username, type } = req.body;
  const validTypes = ['Beginner', 'Intermediate', 'Expert'];
  if (!username || !type || !validTypes.includes(type)) {
    console.log(`Invalid input for /login: ${JSON.stringify(req.body)}`);
    return res.status(400).json({ error: 'Invalid username or type' });
  }

  if (!users[username]) {
    users[username] = {
      username,
      type,
      level: 1,
      levels: {},
      hardest_levels: {},
      level_back_count: 0,
    };
    normalizeLevelKeys(users[username]);
  } else if (users[username].type !== type) {
    users[username].type = type;
  }

  try {
    await saveUsers();
    console.log(`Login successful for user: ${username}`);
    res.json(users[username]);
  } catch (err) {
    console.error(`Failed to save user data for ${username}:`, err);
    res.status(500).json({ error: 'Failed to save user data' });
  }
});

// POST /start-level - record started_at if level does not exist
app.post('/start-level', async (req, res) => {
  const { username, type, level } = req.body;
  const validTypes = ['Beginner', 'Intermediate', 'Expert'];
  if (!username || !type || !validTypes.includes(type) || !Number.isInteger(level) || level < 1) {
    console.log(`Invalid input for /start-level: ${JSON.stringify(req.body)}`);
    return res.status(400).json({ error: 'Invalid username, type, or level' });
  }

  const user = users[username];
  if (!user) {
    console.log(`User not found: ${username}`);
    return res.status(404).json({ error: 'User not found' });
  }

  const levelKey = level.toString();
  if (!user.levels[levelKey]) {
    user.levels[levelKey] = {
      started_at: new Date().toISOString(),
      attempts: 0,
      errors: 0,
      time_taken: 0,
    };
  }

  try {
    await saveUsers();
    console.log(`Started level ${level} for user ${username}`);
    res.json(user.levels[levelKey]);
  } catch (err) {
    console.error(`Failed to save user data for ${username}:`, err);
    res.status(500).json({ error: 'Failed to save user data' });
  }
});

// POST /finish-level - update time_taken, attempts, errors, user.level, hardest_levels
app.post('/finish-level', async (req, res) => {
  const { username, type, level, errors } = req.body;
  const validTypes = ['Beginner', 'Intermediate', 'Expert'];
  
  // Validate input
  if (!username || !type || !validTypes.includes(type) || !Number.isInteger(level) || level < 1 || !Number.isInteger(errors) || errors < 0) {
    console.log(`Invalid input for /finish-level: ${JSON.stringify(req.body)}`);
    return res.status(400).json({ error: 'Invalid username, type, level, or errors' });
  }

  const user = users[username];
  if (!user) {
    console.log(`User not found: ${username}`);
    return res.status(404).json({ error: 'User not found' });
  }

  const levelKey = level.toString();
  let levelData = user.levels[levelKey] || {
    started_at: new Date().toISOString(),
    attempts: 0,
    errors: 0,
    time_taken: 0,
  };

  // Calculate time_taken
  const startedAt = new Date(levelData.started_at);
  const timeTakenSeconds = Math.floor((new Date() - startedAt) / 1000);

  // Update level data
  levelData.attempts = Number(levelData.attempts || 0) + (errors > 0 ? errors : 1); // Increment attempts by errors (or 1 if errors = 0)
  levelData.errors = Number(errors);
  levelData.time_taken = timeTakenSeconds;
  levelData.started_at = new Date().toISOString();
  user.levels[levelKey] = levelData;

  // Update hardest_levels based on highest errors
  if (!user.hardest_levels[levelKey] || user.hardest_levels[levelKey] < errors) {
    user.hardest_levels[levelKey] = errors;
    console.log(`Updated hardest_levels for ${username} on level ${level}: ${errors} errors`);
  }

  // Advance level if errors < 3
  if (Number(user.level) === Number(level) && errors < 3) {
    user.level = Number(level) + 1;
    console.log(`User ${username} advanced to level ${user.level}`);
  }

  // Save changes
  try {
    await saveUsers();
    console.log(`Finished level ${level} for user ${username}`, {
      attempts: levelData.attempts,
      errors,
      timeTakenSeconds,
      userLevel: user.level,
      hardestErrors: user.hardest_levels[levelKey]
    });
    res.json({ levelData, userLevel: user.level, hardestErrors: user.hardest_levels[levelKey] });
  } catch (err) {
    console.error(`Failed to save user data for ${username}:`, err);
    res.status(500).json({ error: 'Failed to save user data' });
  }
});

// POST /level-back - increment level_back_count, decrement user.level if >1
app.post('/level-back', async (req, res) => {
  const { username } = req.body;
  if (!username) {
    console.log(`Invalid input for /level-back: ${JSON.stringify(req.body)}`);
    return res.status(400).json({ error: 'Missing username' });
  }

  const user = users[username];
  if (!user) {
    console.log(`User not found: ${username}`);
    return res.status(404).json({ error: 'User not found' });
  }

  user.level_back_count = (user.level_back_count || 0) + 1;
  if (user.level > 1) {
    user.level -= 1;
  }

  try {
    await saveUsers();
    console.log(`User ${username} went back to level ${user.level}, level_back_count: ${user.level_back_count}`);
    res.json({ userLevel: user.level });
  } catch (err) {
    console.error(`Failed to save user data for ${username}:`, err);
    res.status(500).json({ error: 'Failed to save user data' });
  }
});

// GET /users - return all users
app.get('/users', (req, res) => {
  console.log('/users called');
  res.json(users);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});