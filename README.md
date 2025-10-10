# 🎯 Trackless Analytics

> Privacy-first, cookie-free web analytics platform built with Node.js, Express, and MongoDB.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-green)](https://www.mongodb.com/)

Trackless is a lightweight, privacy-focused alternative to Google Analytics. Track your website visitors without cookies, respect user privacy, and gain meaningful insights into your traffic.

---

## ✨ Features

- 🔒 **Privacy-First**: No cookies, no tracking pixels, GDPR compliant
- 🚀 **Lightweight**: <3KB tracking script, minimal impact on page load
- 📊 **Real-time Analytics**: Live visitor tracking and session monitoring
- 🎨 **Beautiful Dashboard**: Clean, modern UI built with React
- 🔐 **Secure**: JWT authentication, rate limiting, and input validation
- 🌍 **Geographic Data**: IP-based location tracking (country/region)
- 📱 **Device Detection**: Track desktop, mobile, and tablet visitors
- 🔄 **SPA Support**: Automatic tracking for React, Vue, Angular apps
- ⚡ **Fast**: MongoDB aggregation pipelines for instant insights
- 🗄️ **Auto-cleanup**: TTL indexes for automatic data expiration


---

## 🏗️ Architecture

```
┌─────────────┐
│   Visitor   │
│  (Browser)  │
└──────┬──────┘
       │ tracker.js (3KB)
       ↓
┌─────────────────────┐
│   Express Backend   │
│   (Node.js + JWT)   │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│   MongoDB Atlas     │
│   (Events + Users)  │
└─────────────────────┘
       │
       ↓
┌─────────────────────┐
│  React Dashboard    │
│  (Charts + Stats)   │
└─────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MongoDB 4.4+ (or MongoDB Atlas account)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/trackless.git
cd trackless

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your MongoDB URI and secrets
nano .env
```

### Configuration

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=<mongo_url>
JWT_SECRET=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:3000
DATA_RETENTION_DAYS=90
```

### Run the Backend

```bash
# Development mode (auto-restart)
npm run dev

# Production mode
npm start
```

Server runs at: `http://localhost:5000`

---

## 📊 Usage

### 1. Create an Account

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "password": "secure123",
    "name": "Your Name"
  }'
```

Save the JWT token from the response.

### 2. Add a Website

```bash
curl -X POST http://localhost:5000/api/sites \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Website",
    "domain": "example.com"
  }'
```

You'll receive a `siteId` in the response.

### 3. Install Tracking Script

Add this snippet to your website before the closing `</body>` tag:

```html
<script async src="http://localhost:5000/tracker.js" data-site-id="YOUR-SITE-ID"></script>
```

### 4. View Analytics

```bash
curl "http://localhost:5000/api/analytics/dashboard?siteId=YOUR-SITE-ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📡 API Documentation

### Authentication

#### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass",
  "name": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass"
}
```

### Sites Management

#### List Sites
```http
GET /api/sites
Authorization: Bearer {token}
```

#### Add Site
```http
POST /api/sites
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My Blog",
  "domain": "myblog.com",
  "description": "Personal blog"
}
```

#### Get Tracking Snippet
```http
GET /api/sites/{siteId}/snippet
Authorization: Bearer {token}
```

### Analytics

#### Dashboard Data
```http
GET /api/analytics/dashboard?siteId={siteId}&startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer {token}
```

#### Overview Stats
```http
GET /api/analytics/overview?siteId={siteId}
Authorization: Bearer {token}
```

#### Top Pages
```http
GET /api/analytics/pages?siteId={siteId}&limit=10
Authorization: Bearer {token}
```

*See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.*

---

## 🎨 Tracking Script Usage

### Basic Tracking

The tracker automatically tracks pageviews. No additional code needed!

```html
<script async src="https://api.trackless.dev/tracker.js" data-site-id="mysite-abc123"></script>
```

### Custom Events

Track custom events from your JavaScript:

```javascript
// Track button click
window.trackless.track('button_click', {
  button: 'Sign Up',
  location: 'header'
});

// Track form submission
window.trackless.track('form_submit', {
  formType: 'contact',
  success: true
});

// Manual pageview
window.trackless.trackPageview();
```

### SPA Support

Automatically tracks route changes in:
- ✅ React Router
- ✅ Vue Router
- ✅ Angular Router
- ✅ Next.js
- ✅ Any History API usage

---

## 🗄️ Database Schema

### Users Collection
```javascript
{
  email: "user@example.com",
  password: "hashed",
  name: "John Doe",
  maxSites: 3,
  isActive: true
}
```

### Sites Collection
```javascript
{
  userId: ObjectId,
  siteId: "mysite-abc123",
  name: "My Site",
  domain: "example.com",
  isActive: true
}
```

### Events Collection
```javascript
{
  eventType: "pageview",
  page: "/home",
  siteId: "mysite-abc123",
  sessionId: "hashed",
  visitorId: "hashed",
  device: "desktop",
  browser: "Chrome 120",
  country: "US",
  timestamp: Date // Auto-expires after 90 days
}
```

---

## 🔒 Privacy & Security

### Privacy Features

- ✅ **No Cookies**: Uses hashed session IDs instead
- ✅ **IP Anonymization**: Only stores country/region, not full IP
- ✅ **No Personal Data**: No names, emails, or identifying info
- ✅ **Auto-deletion**: Data expires after 90 days (configurable)
- ✅ **GDPR Compliant**: Fully respects user privacy
- ✅ **No Cross-site Tracking**: Each site is isolated

### Security Features

- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Rate Limiting**: Prevents abuse (100 req/min)
- ✅ **Input Validation**: All inputs sanitized
- ✅ **Helmet.js**: Security headers enabled
- ✅ **CORS Protection**: Whitelist-based origins
- ✅ **Password Hashing**: bcrypt with salt

---

## 📦 Project Structure

```
trackless/
├── public/                # Static files
│   ├── tracker.js        # Tracking snippet
│   └── test.html         # Test page
├── src/
│   ├── config/           # Configuration
│   │   ├── database.js
│   │   └── env.js
│   ├── models/           # MongoDB models
│   │   ├── User.js
│   │   ├── Site.js
│   │   ├── Event.js
│   │   └── Session.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── sites.js
│   │   ├── track.js
│   │   └── analytics.js
│   ├── middleware/       # Express middleware
│   │   ├── auth.js
│   │   ├── cors.js
│   │   ├── rateLimit.js
│   │   └── validator.js
│   ├── utils/            # Helper functions
│   │   ├── hash.js
│   │   ├── geoip.js
│   │   ├── parser.js
│   │   └── jwt.js
│   ├── services/         # Business logic
│   │   └── analytics.service.js
│   └── server.js         # Entry point
├── .env.example          # Environment template
├── .gitignore
├── package.json
└── README.md
```

---

## 🧪 Testing

### Test with Postman

Import the [Postman Collection](./postman_collection.json) for quick testing.

### Test Tracking

1. Open `http://localhost:5000/test.html`
2. Click test buttons
3. Check MongoDB for events
4. View analytics via API

### Load Testing

```bash
# Simulate 100 events
for i in {1..100}; do
  curl -X POST http://localhost:5000/api/track \
    -H "Content-Type: application/json" \
    -d '{"eventType":"pageview","page":"/test","siteId":"test-123"}'
done
```

---

## 🚀 Deployment

### Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Deploy to Render

1. Push code to GitHub
2. Connect repo to Render
3. Add environment variables
4. Deploy

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://prod-cluster...
JWT_SECRET=strong-random-secret-here
ALLOWED_ORIGINS=https://yourdomain.com
```

---

## 🛠️ Tech Stack

**Backend:**
- Node.js 18+
- Express.js
- MongoDB + Mongoose
- JWT for authentication
- bcryptjs for password hashing

**Tracking:**
- Vanilla JavaScript
- No dependencies
- ~3KB minified

**Security:**
- Helmet.js
- express-rate-limit
- CORS
- Input validation

**Analytics:**
- MongoDB Aggregation Pipeline
- GeoIP-lite
- UA-Parser-JS

---

## 📈 Roadmap

### v1.0 (Current)
- [x] User authentication
- [x] Site management
- [x] Event tracking
- [x] Basic analytics
- [x] Privacy features

### v1.1 (Next)
- [ ] React dashboard UI
- [ ] Real-time visitor counter
- [ ] Custom date ranges
- [ ] CSV export

### v2.0 (Future)
- [ ] Team collaboration
- [ ] Custom events dashboard
- [ ] Funnel analysis
- [ ] A/B testing support
- [ ] Email reports
- [ ] API webhooks

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by [Plausible Analytics](https://plausible.io/)
- Icons from [Lucide Icons](https://lucide.dev/)
- UI inspiration from [Tailwind UI](https://tailwindui.com/)

---


<div align="center">

**Made with ❤️ for privacy-conscious developers**

</div>
