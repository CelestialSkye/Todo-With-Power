require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 8000;
const nodeEnv = process.env.NODE_ENV || 'development';
const { getChatCompletion } = require('./groqClient');

// ============ SECURITY MIDDLEWARE ============

// Helmet - Set security HTTP headers
app.use(helmet());

// CORS - Restrict to specific origins in production
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  maxAge: 3600
};
app.use(cors(corsOptions));

// Body parser with size limits
app.use(express.json({ limit: '1mb' }));

// Rate limiting - Prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: nodeEnv === 'production' ? 30 : 100, // 30 requests per window in production, 100 in dev
  message: 'Too many requests, please try again later',
  standardHeaders: true, // Return info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skip: (req) => {
    // Skip rate limiting for test endpoint in development
    return nodeEnv === 'development' && req.path === '/test-ai-connection';
  }
});

// Apply rate limiting to all routes
app.use(limiter);

// ============ LOGGING MIDDLEWARE (Development only) ============
if (nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ============ INPUT VALIDATION MIDDLEWARE ============
const validateChatInput = (req, res, next) => {
  const { userMessage, conversationHistory, todoList } = req.body;

  // Validate userMessage
  if (!userMessage || typeof userMessage !== 'string') {
    return res.status(400).json({ error: 'userMessage must be a non-empty string' });
  }

  if (userMessage.length > 5000) {
    return res.status(400).json({ error: 'Message too long (max 5000 characters)' });
  }

  // Validate conversationHistory
  if (conversationHistory && !Array.isArray(conversationHistory)) {
    return res.status(400).json({ error: 'conversationHistory must be an array' });
  }

  // Validate todoList
  if (todoList && !Array.isArray(todoList)) {
    return res.status(400).json({ error: 'todoList must be an array' });
  }

  next();
};

// ============ ROUTES ============
const chatRoutes = require('./routes/chat');
app.use('/api/chat', validateChatInput, chatRoutes);

// Test endpoint (development only, rate limit skipped)
app.get('/test-ai-connection', async (req, res) => {
  // Only allow in development
  if (nodeEnv === 'production') {
    return res.status(403).json({ error: 'This endpoint is disabled in production' });
  }

  try {
    const testMessages = [
      { role: "system", content: "You are a straightforward AI assistant. Respond with exactly one sentence." },
      { role: "user", content: "Tell me if the Groq API connection is successful." }
    ];

    const aiResponse = await getChatCompletion(testMessages);

    res.json({ 
      status: "Success!", 
      test_response: aiResponse
      // DO NOT expose api_key_loaded in production
    });

  } catch (error) {
    console.error("Test Error:", error.message);
    // Don't leak error details in production
    const errorMessage = nodeEnv === 'development' 
      ? error.message 
      : 'Failed to connect to AI service';
    
    res.status(500).json({ 
      error: errorMessage
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: nodeEnv });
});

// ============ ERROR HANDLING MIDDLEWARE ============
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't expose error details in production
  const message = nodeEnv === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(err.status || 500).json({ 
    error: message,
    ...(nodeEnv === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ============ START SERVER ============
app.listen(port, () => {
  console.log(`Server listening on port ${port} (${nodeEnv})`);
  if (nodeEnv === 'production') {
    console.log('🔒 Security features enabled: Helmet, Rate Limiting, CORS restricted');
  }
});
