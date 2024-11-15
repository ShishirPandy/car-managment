const app = require('../car-management-app-backend/Backend/app');  // Import the app.js (which contains all the routes and middleware)

// Health check route (Vercel also expects a health route to be available)
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Vercel doesn't require app.listen, it automatically handles the serverless environment
module.exports = app;  // Export the app as a serverless function
