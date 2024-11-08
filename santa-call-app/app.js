const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const apiClient = require('./aitableConfig'); // AITable API Config

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Set up express session
app.use(
  session({
    secret: 'santa-secret-key',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// Home Page
app.get('/', (req, res) => {
  res.render('form');
});

// Registration Page
app.get('/register', (req, res) => {
  res.render('register');
});

// Handle Registration
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const parentData = {
      fields: {
        name,
        email,
        password: hashedPassword,
      },
    };

    await apiClient.post('', parentData);
    req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/login');
  } catch (error) {
    console.error(error.response ? error.response.data : error);
    res.send('Error registering. Please try again.');
  }
});

// Login Page
app.get('/login', (req, res) => {
  res.render('login');
});

// Handle Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await apiClient.get(`?filterByFormula=email="${email}"`);
    const parent = response.data.records.length ? response.data.records[0] : null;

    if (parent && (await bcrypt.compare(password, parent.fields.password))) {
      req.session.parentId = parent.id;
      res.redirect('/dashboard');
    } else {
      req.flash('error', 'Invalid email or password.');
      res.redirect('/login');
    }
  } catch (error) {
    console.error(error.response ? error.response.data : error);
    res.send('Error logging in. Please try again.');
  }
});

// Dashboard - After Login
app.get('/dashboard', async (req, res) => {
  if (!req.session.parentId) {
    return res.redirect('/login');
  }

  try {
    const response = await apiClient.get(`?filterByFormula=parentId="${req.session.parentId}"`);
    const children = response.data.records;
    res.render('dashboard', { children });
  } catch (error) {
    console.error(error.response ? error.response.data : error);
    res.send('Error loading dashboard. Please try again.');
  }
});

// Add Child Page
app.get('/add-child', (req, res) => {
  if (!req.session.parentId) {
    return res.redirect('/login');
  }
  res.render('addChild');
});

// Handle Adding Child
app.post('/add-child', async (req, res) => {
  if (!req.session.parentId) {
    return res.redirect('/login');
  }

  const { name, age, gender, holidayDetails, interests, familyConnections, callTime } = req.body;
  const childData = {
    fields: {
      parentId: req.session.parentId,
      name,
      age: parseInt(age, 10),
      gender,
      holidayDetails,
      interests,
      familyConnections,
      callTime,
    },
  };

  try {
    await apiClient.post('', childData);
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error.response ? error.response.data : error);
    res.send('Error adding child. Please try again.');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});