const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'AgroRedUy API is running'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AgroRedUy API - Agricultural Services Marketplace',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api/v1'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AgroRedUy API server running on port ${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});
