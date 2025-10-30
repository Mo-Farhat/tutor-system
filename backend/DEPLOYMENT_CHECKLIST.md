# Deployment Checklist for CORS Configuration

## Pre-Deployment

### 1. Environment Variables
Ensure these environment variables are set on your Hostinger VPS:

```bash
# Required
FRONTEND_URL=https://striveacademics.com.au
NODE_ENV=production
PORT=8000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/striveacademy

# JWT
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. SSL/HTTPS Setup
- [ ] Backend API is served over HTTPS
- [ ] SSL certificates are valid and not expired
- [ ] Both www and non-www versions of frontend work
- [ ] Mixed content warnings are resolved

### 3. Network Configuration
- [ ] Backend port (8000) is accessible from the internet
- [ ] Firewall allows incoming connections on the backend port
- [ ] DNS records point correctly to your servers

## Deployment Steps

### 1. Deploy Backend Code
```bash
# On your Hostinger VPS
git pull origin main
npm install
npm run build  # if you have a build step
```

### 2. Update Environment Variables
```bash
# Create or update .env file
cp .env.example .env
nano .env  # Edit with your production values
```

### 3. Restart Backend Service
```bash
# Using PM2 (recommended)
pm2 restart backend

# Or using systemd
sudo systemctl restart your-backend-service

# Or direct node
npm start
```

### 4. Test CORS Configuration
```bash
# Test locally first
npm run test:cors

# Test against production
API_URL=https://your-api-domain.com npm run test:cors
```

## Post-Deployment Verification

### 1. Health Check
Visit: `https://your-api-domain.com/health`
Should return:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "origin": "No origin",
  "cors": {
    "origin_allowed": true,
    "credentials_enabled": true
  }
}
```

### 2. CORS Headers Check
Use browser dev tools or curl to verify CORS headers:
```bash
curl -H "Origin: https://striveacademics.com.au" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -X OPTIONS \
     https://your-api-domain.com/api/auth/login
```

Expected headers:
- `Access-Control-Allow-Origin: https://striveacademics.com.au`
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`
- `Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-Access-Token`

### 3. Frontend Integration Test
- [ ] Login works from frontend
- [ ] API calls succeed without CORS errors
- [ ] Authenticated requests work properly
- [ ] No console errors related to CORS

### 4. Browser Testing
Test in multiple browsers:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Troubleshooting

### Common Issues

1. **CORS Error: "Access to fetch blocked by CORS policy"**
   - Check that `FRONTEND_URL` matches exactly
   - Verify origin is in allowed origins list
   - Check for typos in domain names

2. **Credentials not being sent**
   - Ensure `credentials: true` in backend CORS config
   - Ensure frontend uses `credentials: 'include'` in fetch

3. **Preflight requests failing**
   - Check OPTIONS method is allowed
   - Verify all required headers are in allowed headers list

4. **Mixed content errors**
   - Ensure both frontend and backend use HTTPS
   - Check for any HTTP resources being loaded

### Debug Steps

1. Enable CORS debugging:
   ```bash
   DEBUG_CORS=true npm start
   ```

2. Check server logs for blocked origins

3. Use browser dev tools Network tab

4. Test with curl commands

5. Run the CORS test script:
   ```bash
   npm run test:cors:prod
   ```

## Monitoring

Set up monitoring for:
- CORS-related 403 errors
- Failed preflight requests
- Origin validation failures
- SSL certificate expiration

## Rollback Plan

If CORS issues occur:
1. Check recent changes to CORS configuration
2. Verify environment variables
3. Restart backend service
4. If needed, rollback to previous working version
5. Test thoroughly before re-deploying

## Contact Information

For deployment issues:
- Check server logs: `/var/log/your-app/`
- Monitor service status: `pm2 status` or `systemctl status your-service`
- Review environment variables: `printenv | grep -E "(FRONTEND|CORS|NODE_ENV)"`