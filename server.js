const express = require('express');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

connectDB();

//Init Middleware

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Define Routes

app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/auth', require('./routes/api/auth'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('{*splat}', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.send('API Running!'));
}

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;