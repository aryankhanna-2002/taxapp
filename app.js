const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 3000;


require('dotenv').config();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


app.use(bodyParser.json());

// Authentication Middleware
function authenticateJWT(req, res, next) {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = user;
    next();
  });
}

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/taxpayers', authenticateJWT, require('./routes/taxpayers'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
