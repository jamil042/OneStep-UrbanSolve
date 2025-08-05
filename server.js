const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // 

app.use(express.static('public'));

app.use('/api', authRoutes); // Signup/Login routes

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
