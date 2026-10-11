const express = require('express');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

//Init Middleware

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Define Routes

app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    res.status(503).json({ msg: 'Database connection unavailable' });
  }
});

app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/auth', require('./routes/api/auth'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.resolve(__dirname, 'client', 'build');
  app.use(express.static(clientBuildPath));

  app.get('{*splat}', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.send('API Running!'));
}

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;