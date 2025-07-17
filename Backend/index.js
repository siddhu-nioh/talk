
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/posts', require('./routes/posts'));

// DB & Server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.ATLASDB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.error('MongoDB connection error:', err));
