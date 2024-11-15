const express = require('express');
const connectDB = require('../car-management-app-backend/Backend/config/db');
const cors = require('cors');
const path = require('path');  // Ensure 'path' is imported
require('dotenv').config();

const app = express();
connectDB();

// Allow only specific origin for CORS
app.use(cors({
  origin: 'https://car-managemet-frontend-9hdwjrgkp.vercel.app',  // Replace this with your frontend URL if deployed
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Specify the allowed HTTP methods
  credentials: true  // Allow credentials (e.g., cookies, authorization headers)
}));

app.use(express.json());

// Serve static files from the 'uploads' folder
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads'));


// Routes
app.use('/api/auth', require('../car-management-app-backend/Backend/routes/auth'));
app.use('/api/cars', require('../car-management-app-backend/Backend/routes/cars'));

module.exports = app;
