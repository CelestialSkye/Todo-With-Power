require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 8000;
const nodeEnv = process.env.NODE_ENV || 'development';
const { getChatCompletion } = require('./groqClient');


app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || ['http://localhost:5173', 'http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  maxAge: 3600
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '1mb' }));

// Rate limiting 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: nodeEnv === 'production' ? 50 : 100, 
  message: 'Too many requests, please try again later',
  standardHeaders: true, 
  legacyHeaders: false, 
  skip: (req) => {
    return nodeEnv === 'development' && req.path === '/test-ai-connection';
  }
});

app.use(limiter);

if (nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

const validateChatInput = (req, res, next) => {
  const { userMessage, conversationHistory, todoList, recaptchaToken } = req.body;

  if (!recaptchaToken || typeof recaptchaToken !== 'string') {
    return res.status(400).json({ error: 'recaptchaToken must be a non-empty string' });
  }

  if (!userMessage || typeof userMessage !== 'string') {
    return res.status(400).json({ error: 'userMessage must be a non-empty string' });
  }

  if (userMessage.length > 5000) {
    return res.status(400).json({ error: 'Message too long (max 5000 characters)' });
  }

  if (conversationHistory && !Array.isArray(conversationHistory)) {
    return res.status(400).json({ error: 'conversationHistory must be an array' });
  }

  if (todoList && !Array.isArray(todoList)) {
    return res.status(400).json({ error: 'todoList must be an array' });
  }

  next();
};

const chatRoutes = require('./routes/chat');
app.use('/api/chat', validateChatInput, chatRoutes);

app.get('/test-ai-connection', async (req, res) => {
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
    });

  } catch (error) {
    console.error("Test Error:", error.message);
    const errorMessage = nodeEnv === 'development' 
      ? error.message 
      : 'Failed to connect to AI service';
    
    res.status(500).json({ 
      error: errorMessage
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: nodeEnv });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  
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

app.listen(port, () => {
  console.log(`Server listening on port ${port} (${nodeEnv})`);
  if (nodeEnv === 'production') {
    console.log('🔒 Security features enabled: Helmet, Rate Limiting, CORS restricted');
  }
});
