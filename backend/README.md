# 🎯 Trackless Backend

Privacy-first analytics backend for Trackless. Built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd trackless-backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Configuration

Edit `.env` file with your settings:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trackless
API_SECRET=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4000,http://localhost:5000
```

### Run the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Tracking

- `POST /api/track` - Track events
- `GET /api/health` - Health check

### Analytics

- `GET /api/analytics/dashboard` - Complete dashboard data
- `GET /api/analytics/overview` - Overview statistics
- `GET /api/analytics/pageviews` - Pageviews over time
- `GET /api/analytics/pages` - Top pages
- `GET /api/analytics/referrers` - Referrer statistics
- `GET /api/analytics/devices` - Device breakdown
- `GET /api/analytics/browsers` - Browser statistics
- `GET /api/analytics/countries` - Geographic data

## 📊 Request Examples

### Track a Pageview

```bash
curl -X POST http://localhost:5000/api/track \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "pageview",
    "page": "/home",
    "title": "Home Page",
    "referrer": "https://google.com",
    "siteId": "demo-site-001",
    "language": "en-US",
    "screenWidth": 1920,
    "screenHeight": 1080
  }'
```

### Get Analytics Dashboard

```bash
curl "http://localhost:5000/api/analytics/dashboard?siteId=demo-site-001&startDate=2025-09-01&endDate=2025-10-04"
```

### Get Overview Stats

```bash
curl "http://localhost:5000/api/analytics/overview?siteId=demo-site-001"
```

## 🗄️ Database Schema

### Events Collection

Stores all tracking events with TTL index for auto-deletion.

```javascript
{
  eventType: "pageview",
  page: "/home",
  title: "Home Page",
  sessionId: "hashed-session-id",
  visitorId: "hashed-visitor-id",
  device: "desktop",
  browser: "Chrome 120",
  os: "Windows 11",
  country: "IN",
  region: "KA",
  siteId: "demo-site-001",
  timestamp: "2025-10-04T12:00:00Z"
}
```

### Sessions Collection

Tracks user sessions with activity updates.

```javascript
{
  sessionId: "hashed-session-id",
  visitorId: "hashed-visitor-id",
  siteId: "demo-site-001",
  startTime: "2025-10-04T12:00:00Z",
  pageviews: 5,
  duration: 180,
  entryPage: "/home",
  exitPage: "/contact",
  isActive: true
}
```

## 🔒 Privacy Features

- ✅ No cookies stored
- ✅ IP addresses are hashed
- ✅ Session IDs are anonymized
- ✅ Visitor IDs are hashed
- ✅ Automatic data expiration (90 days default)
- ✅ GDPR/ePrivacy compliant

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Security**: Helmet, CORS, Rate Limiting
- **Parsing**: ua-parser-js, geoip-lite
- **Utilities**: Compression, Morgan logging

## 📦 Project Structure

```
trackless-backend/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── utils/           # Helper utilities
│   ├── services/        # Business logic
│   └── server.js        # Main server file
├── .env.example         # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🧪 Testing

### Using Postman

1. Import the tracking endpoint
2. Send POST request to `/api/track`
3. Check MongoDB for stored events
4. Query `/api/analytics/dashboard` to see data

### Using curl

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test tracking
curl -X POST http://localhost:5000/api/track \
  -H "Content-Type: application/json" \
  -d '{"eventType":"pageview","page":"/test","siteId":"test-001"}'
```

## 🚀 Deployment

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add MongoDB plugin
railway add

# Deploy
railway up
```

### Render

1. Connect your GitHub repo
2. Create new Web Service
3. Set environment variables
4. Deploy

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-production-mongodb-uri
API_SECRET=strong-random-secret
ALLOWED_ORIGINS=https://yourdomain.com,https://dashboard.yourdomain.com
RATE_LIMIT_MAX_REQUESTS=100
DATA_RETENTION_DAYS=90
```

## 📈 Performance Tips

1. **Database Indexes**: Already configured on commonly queried fields
2. **Rate Limiting**: Adjust based on your traffic
3. **Compression**: Enabled by default
4. **Connection Pooling**: MongoDB pool size set to 10
5. **TTL Indexes**: Automatic data cleanup after retention period

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check connection string format
mongodb+srv://username:password@cluster.mongodb.net/database

# Ensure IP whitelist includes your server
# Add 0.0.0.0/0 for testing (not recommended for production)
```

### CORS Errors

```bash
# Add your frontend domain to ALLOWED_ORIGINS in .env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4000,http://localhost:5000
```

### Rate Limit Exceeded

```bash
# Adjust rate limits in .env
RATE_LIMIT_MAX_REQUESTS=200
RATE_LIMIT_WINDOW_MS=60000
```

## 🔄 Data Retention

Events and sessions are automatically deleted after the configured retention period (default: 90 days) using MongoDB TTL indexes.

To change retention period:

```env
DATA_RETENTION_DAYS=30  # Keep data for 30 days
```

## 📝 API Response Format

### Success Response

```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🔗 Related Projects

- **Trackless Frontend**: Dashboard UI (coming soon)
- **Trackless Snippet**: Client-side tracking script (coming soon)

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for privacy-conscious developers