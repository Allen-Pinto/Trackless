# 🧪 Trackless Backend - Complete Testing Guide

Step-by-step guide to test all features of the Trackless backend.

---

## 📋 Prerequisites

- ✅ Backend server running on `http://localhost:5000`
- ✅ MongoDB connected
- ✅ Postman or curl installed

---

## 🚀 Complete Test Flow

### Test 1️⃣: Health Check

Verify the server is running.

```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "status": "healthy",
  "uptime": 12.345,
  "timestamp": "2025-10-04T10:00:00.000Z",
  "environment": "development"
}
```

✅ **Pass**: Server is running

---

### Test 2️⃣: User Signup

Create a new user account.

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "test123456",
    "name": "Test User"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "6527...",
      "email": "testuser@example.com",
      "name": "Test User",
      "maxSites": 3
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**✅ Save the token** - you'll need it for all authenticated requests!

**💾 For the rest of tests, use:**
```bash
export TOKEN="<paste-your-token-here>"
```

---

### Test 3️⃣: Login

Test login with existing credentials.

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "test123456"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { /* user data */ },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

✅ **Pass**: Login works

---

### Test 4️⃣: Get Current User Profile

Verify authentication is working.

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "6527...",
      "email": "testuser@example.com",
      "name": "Test User",
      "maxSites": 3
    }
  }
}
```

✅ **Pass**: Authentication works

---

### Test 5️⃣: Add First Site

Create a site to track.

```bash
curl -X POST http://localhost:5000/api/sites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "My Test Site",
    "domain": "testsite.com",
    "description": "Testing trackless analytics"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Site added successfully",
  "data": {
    "site": {
      "siteId": "testsite-a1b2c3d4",
      "name": "My Test Site",
      "domain": "testsite.com",
      "description": "Testing trackless analytics"
    }
  }
}
```

**✅ Save the siteId** - you'll need it for tracking and analytics!

**💾 Export it:**
```bash
export SITE_ID="<paste-siteId-here>"
```

---

### Test 6️⃣: Get All Sites

List all sites owned by the user.

```bash
curl http://localhost:5000/api/sites \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "sites": [
      {
        "siteId": "testsite-a1b2c3d4",
        "name": "My Test Site",
        "domain": "testsite.com",
        "totalEvents": 0,
        "lastEventAt": null
      }
    ],
    "total": 1,
    "maxSites": 3
  }
}
```

✅ **Pass**: Site management works

---

### Test 7️⃣: Get Tracking Snippet

Get the JavaScript snippet for your site.

```bash
curl http://localhost:5000/api/sites/$SITE_ID/snippet \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "siteId": "testsite-a1b2c3d4",
    "snippet": "<script async src=\"https://api.trackless.dev/tracker.js\" data-site-id=\"testsite-a1b2c3d4\"></script>",
    "instructions": "Add this snippet to your website before the closing </body> tag"
  }
}
```

✅ **Pass**: Snippet generation works

---

### Test 8️⃣: Track First Event

Simulate tracking a pageview.

```bash
curl -X POST http://localhost:5000/api/track \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "pageview",
    "page": "/home",
    "title": "Home Page",
    "referrer": "https://google.com",
    "siteId": "'$SITE_ID'",
    "language": "en-US",
    "screenWidth": 1920,
    "screenHeight": 1080
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Event tracked successfully"
}
```

✅ **Pass**: Tracking works

**🔄 Repeat this 5-10 times with different pages** to generate test data:

```bash
# Track /about page
curl -X POST http://localhost:5000/api/track \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "pageview",
    "page": "/about",
    "title": "About Page",
    "siteId": "'$SITE_ID'",
    "language": "en-US",
    "screenWidth": 1920,
    "screenHeight": 1080
  }'

# Track /contact page
curl -X POST http://localhost:5000/api/track \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "pageview",
    "page": "/contact",
    "title": "Contact Page",
    "siteId": "'$SITE_ID'",
    "language": "en-US",
    "screenWidth": 1920,
    "screenHeight": 1080
  }'
```

---

### Test 9️⃣: Verify Data in MongoDB

**Using MongoDB Compass or Atlas:**

1. Go to your database → `events` collection
2. You should see events like:
```json
{
  "_id": "...",
  "eventType": "pageview",
  "page": "/home",
  "title": "Home Page",
  "sessionId": "hashed-session-id",
  "visitorId": "hashed-visitor-id",
  "device": "desktop",
  "browser": "Unknown",
  "country": "Unknown",
  "siteId": "testsite-a1b2c3d4",
  "timestamp": "2025-10-04T10:30:00.000Z"
}
```

3. Check `sessions` collection for session data

✅ **Pass**: Data is being stored correctly

---

### Test 🔟: Get Analytics Overview

Now that we have data, test analytics.

```bash
curl "http://localhost:5000/api/analytics/overview?siteId=$SITE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "pageviews": 10,
    "uniqueVisitors": 1,
    "sessions": 1,
    "avgDuration": 0,
    "bounceRate": 0,
    "activeSessions": 0
  }
}
```

✅ **Pass**: Analytics aggregation works

---

### Test 1️⃣1️⃣: Get Dashboard Data

Get complete dashboard with all charts.

```bash
curl "http://localhost:5000/api/analytics/dashboard?siteId=$SITE_ID&startDate=2025-10-01&endDate=2025-10-05" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "pageviews": 10,
      "uniqueVisitors": 1,
      "sessions": 1,
      "avgDuration": 0,
      "bounceRate": 0,
      "activeSessions": 0
    },
    "charts": {
      "pageviewsOverTime": [...],
      "topPages": [...],
      "referrers": [...],
      "devices": [...],
      "browsers": [...],
      "countries": [...]
    }
  }
}
```

✅ **Pass**: Full dashboard works

---

### Test 1️⃣2️⃣: Test Site Ownership Protection

Try to access analytics for a non-existent site.

```bash
curl "http://localhost:5000/api/analytics/overview?siteId=fake-site-123" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "You do not have access to this site"
}
```

✅ **Pass**: Authorization works correctly

---

### Test 1️⃣3️⃣: Test Without Authentication

Try to access protected route without token.

```bash
curl http://localhost:5000/api/sites
```

**Expected Response:**
```json
{
  "success": false,
  "error": "No token provided. Please login."
}
```

✅ **Pass**: Authentication middleware works

---

### Test 1️⃣4️⃣: Update Site Details

Update site information.

```bash
curl -X PUT http://localhost:5000/api/sites/$SITE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Updated Test Site",
    "description": "Updated description",
    "isPublic": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Site updated successfully",
  "data": {
    "site": {
      "siteId": "testsite-a1b2c3d4",
      "name": "Updated Test Site",
      "description": "Updated description",
      "isPublic": true
    }
  }
}
```

✅ **Pass**: Site updates work

---

### Test 1️⃣5️⃣: Change Password

Test password change functionality.

```bash
curl -X PUT http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "currentPassword": "test123456",
    "newPassword": "newpass123456"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Now login with new password:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "newpass123456"
  }'
```

✅ **Pass**: Password change works

---

## 📊 Load Testing (Optional)

Test with multiple events quickly:

```bash
#!/bin/bash
for i in {1..100}
do
  curl -X POST http://localhost:5000/api/track \
    -H "Content-Type: application/json" \
    -d '{
      "eventType": "pageview",
      "page": "/page-'$i'",
      "siteId": "'$SITE_ID'"
    }' &
done
wait
```

Then check analytics to see all 100+ events.

---

## ✅ Complete Checklist

- [ ] Server health check passes
- [ ] User signup works
- [ ] User login works
- [ ] Authentication middleware protects routes
- [ ] Site creation works
- [ ] Site listing works
- [ ] Snippet generation works
- [ ] Event tracking works
- [ ] Data stored in MongoDB
- [ ] Sessions created correctly
- [ ] Analytics overview works
- [ ] Dashboard data returns correctly
- [ ] Site ownership protection works
- [ ] Site updates work
- [ ] Password change works
- [ ] Rate limiting works (try 101+ requests/minute)

---

## 🐛 Troubleshooting

### Events not showing in analytics?
- Check MongoDB `events` collection
- Verify `siteId` matches exactly
- Check timestamp is recent

### Authentication fails?
- Token might be expired (7 days)
- Check `JWT_SECRET` in `.env`
- Try logging in again

### MongoDB connection issues?
- Verify connection string
- Check IP whitelist
- Test with MongoDB Compass

---

**🎉 If all tests pass, your backend is ready for production!**