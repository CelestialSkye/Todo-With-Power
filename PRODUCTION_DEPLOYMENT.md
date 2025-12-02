# 🚀 Production Deployment Checklist

## Pre-Deployment Security Checklist

### Environment Setup
- [ ] Set `NODE_ENV=production` on hosting platform
- [ ] Set `ALLOWED_ORIGINS` to your production domain(s)
- [ ] Set `GROQ_API_KEY` from your Groq dashboard
- [ ] Set `PORT` (default: 8000)

### Security Configuration
- [ ] HTTPS/SSL certificate installed
- [ ] Firewall rules configured
- [ ] Rate limiting properly set (30 req/15min for prod)
- [ ] CORS restricted to your domain only
- [ ] Error messages don't expose sensitive info

### Firebase Configuration
- [ ] Firestore security rules configured (must do in Firebase console)
- [ ] Authentication rules set up
- [ ] Database backup enabled
- [ ] API key restrictions set in Firebase console

### Monitoring & Logging
- [ ] Set up monitoring service (e.g., Sentry, DataDog)
- [ ] Configure alerts for:
  - High rate limit hits
  - API errors (5xx responses)
  - Unusual traffic patterns
- [ ] Set up log aggregation

### Final Testing
- [ ] Test API endpoints with production domain
- [ ] Test rate limiting (try 40+ requests rapidly)
- [ ] Test CORS (requests from other domains should fail)
- [ ] Test input validation (empty message should fail)
- [ ] Verify error messages are generic (no info leakage)
- [ ] Load test with expected traffic volume

## Environment Variables Template

Copy this to your hosting platform's environment variables:

```
NODE_ENV=production
PORT=8000
GROQ_API_KEY=your_groq_api_key
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Hosting Platform Setup

### Vercel / Netlify (Frontend)
1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

### Heroku / Railway / Render (Backend)
1. Connect your repository
2. Set start command: `cd server && npm install && npm start`
3. Add environment variables (NODE_ENV=production, etc.)
4. Enable HTTPS/SSL
5. Deploy

### Manual Deployment
```bash
# SSH into server
ssh user@your-server.com

# Clone repository
git clone https://github.com/yourusername/my-project.git
cd my-project/server

# Install dependencies
npm install --production

# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=8000
GROQ_API_KEY=your_key
ALLOWED_ORIGINS=https://yourdomain.com
