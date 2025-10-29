# CORS Configuration for Strive Academics

## Overview
This document explains the CORS (Cross-Origin Resource Sharing) configuration for the Strive Academics backend API to ensure proper communication with the frontend hosted at https://striveacademics.com.au.

## Current Configuration

### Allowed Origins
The backend is configured to accept requests from:
- `https://striveacademics.com.au` (Production)
- `https://www.striveacademics.com.au` (Production with www)
- `http://localhost:3000` (Development)
- `http://localhost:3001` (Development alternative)
- Any URL specified in `FRONTEND_URL` environment variable

### Allowed Methods
- GET
- POST
- PUT
- DELETE
- OPTIONS
- PATCH

### Allowed Headers
- Origin
- X-Requested-With
- Content-Type
- Accept
- Authorization
- Cache-Control
- X-Access-Token

### Security Features
- Credentials support enabled (`credentials: true`)
- Preflight request caching (24 hours)
- Security headers added (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- Origin validation with logging for blocked requests

## Environment Variables

### Required
```bash
FRONTEND_URL=https://striveacademics.com.au
```

### Optional (for debugging)
```bash
DEBUG_CORS=true  # Enables CORS debug logging
NODE_ENV=development  # Enables debug logging
```

## Deployment Checklist

### 1. Environment Variables
Ensure the following environment variables are set on your Hostinger VPS:
```bash
FRONTEND_URL=https://striveacademics.com.au
NODE_ENV=production
```

### 2. SSL/HTTPS Configuration
- Ensure your backend API is served over HTTPS in production
- Verify SSL certificates are valid
- Check that the API endpoint URLs use HTTPS

### 3. Domain Configuration
- Verify that `striveacademics.com.au` resolves to your frontend
- Ensure both `www` and non-`www` versions work
- Check DNS settings for proper domain resolution

### 4. Firewall/Network Configuration
- Ensure the backend port (default 8000) is accessible
- Check that no firewall rules block the communication
- Verify network routing between frontend and backend

## Testing CORS Configuration

### 1. Browser Developer Tools
Open browser dev tools and check:
- Network tab for failed requests
- Console for CORS error messages
- Response headers for CORS headers

### 2. Manual Testing
Test with curl:
```bash
# Test preflight request
curl -X OPTIONS \
  -H "Origin: https://striveacademics.com.au" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  https://your-api-domain.com/api/auth/login

# Test actual request
curl -X POST \
  -H "Origin: https://striveacademics.com.au" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  https://your-api-domain.com/api/health
```

### 3. Debug Logging
Enable debug logging by setting:
```bash
DEBUG_CORS=true
```

This will log detailed CORS information for each request.

## Common Issues and Solutions

### Issue 1: "Access to fetch at '...' from origin '...' has been blocked by CORS policy"
**Solution**: Verify that the frontend origin is included in the allowed origins list.

### Issue 2: Credentials not being sent
**Solution**: Ensure both frontend and backend have credentials enabled:
- Backend: `credentials: true` in CORS config
- Frontend: `credentials: 'include'` in fetch requests

### Issue 3: Preflight requests failing
**Solution**: Check that OPTIONS method is allowed and proper headers are set.

### Issue 4: Mixed content (HTTP/HTTPS)
**Solution**: Ensure both frontend and backend use the same protocol (HTTPS in production).

## Security Considerations

1. **Origin Validation**: Only specific origins are allowed, not wildcards
2. **Credentials**: Enabled only for trusted origins
3. **Headers**: Limited to necessary headers only
4. **Methods**: Only required HTTP methods are allowed
5. **Caching**: Preflight responses are cached to reduce overhead

## Monitoring

Monitor CORS issues by:
1. Checking server logs for blocked origin warnings
2. Monitoring frontend error logs for CORS failures
3. Using the debug middleware in development
4. Setting up alerts for 403/CORS-related errors

## Contact
For CORS-related issues, check:
1. Server logs for blocked origins
2. Environment variable configuration
3. Network connectivity between frontend and backend
4. SSL certificate validity