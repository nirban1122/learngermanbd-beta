# Quick Start Guide - React Frontend + PHP Backend

## Overview

You have a **complete full-stack application** ready to deploy:

- ✅ **React Frontend** - Interactive learning platform
- ✅ **PHP Backend** - API server + Admin panel
- ✅ **MySQL Database** - All 11 tables defined
- ✅ **Email System** - OTP verification

---

## For Development (Local Testing)

### Backend Setup (10 minutes)

```bash
# 1. Start your local MySQL server
# (XAMPP, WAMP, MAMP, or Docker)

# 2. Create database in phpMyAdmin
# Database: learn_german
# User: learn_german
# Password: your_password

# 3. Visit setup wizard
# http://localhost:8000/backend/setup
# OR
# http://localhost/backend/setup

# 4. Enter credentials and run setup

# 5. Login to admin
# http://localhost:8000/backend/admin
# Email: admin@learngermanwith.fun
# Password: admin123!

# 6. Delete setup file
# rm backend/setup/install.php
```

### Frontend Setup (5 minutes)

```bash
cd frontend/  # React project directory

npm install
npm run dev

# Visit http://localhost:5173
```

### Test the Flow

1. Go to http://localhost:5173
2. Click "Get Started"
3. Register new account
4. Check console/logs for OTP
5. Verify email with OTP (use `123456` in demo)
6. Access dashboard
7. Try lessons, vocabulary, exams

---

## For Production (cPanel Deployment)

### Step 1: Upload Backend via FTP (15 minutes)

```
1. Open FTP client (FileZilla, WinSCP, etc.)
2. Connect to your cPanel account
3. Navigate to public_html
4. Create folder: backend
5. Upload all files from backend/ directory
```

**FTP Structure After Upload:**
```
public_html/
└── backend/
    ├── api/
    ├── admin/
    ├── setup/
    ├── logs/
    ├── cache/
    ├── config.php
    ├── index.php
    ├── .htaccess
    └── README.md
```

### Step 2: Create MySQL Database (5 minutes)

```
1. Log into cPanel
2. Click "MySQL Databases"
3. Create database: learn_german
4. Create user: learn_german (strong password!)
5. Add user to database (ALL PRIVILEGES)
6. Note the credentials
```

### Step 3: Run Setup Wizard (5 minutes)

```
1. Visit: https://yourdomain.com/backend/setup
2. Enter MySQL credentials:
   - Host: localhost
   - User: learn_german
   - Password: (your password)
   - Database: learn_german
3. Click "Continue"
4. Wizard creates all tables
5. Save admin credentials shown
```

### Step 4: Secure Setup (1 minute)

```
Via FTP: Delete backend/setup/install.php

OR: Create backend/setup/setup.lock file
```

### Step 5: Deploy React Frontend

```bash
# Build for production
npm run build

# This creates a dist/ folder with static files
# Upload dist/ contents to your domain root (public_html)
# OR to a subdomain
```

### Step 6: Configure React

Update `src/.env` (or .env.production):

```env
VITE_API_URL=https://yourdomain.com/backend
VITE_API_BASE_URL=https://yourdomain.com/backend/api
```

Rebuild if needed:
```bash
npm run build
```

---

## Verification Checklist

### Backend ✅

- [ ] Visit `/backend/admin`
- [ ] Login with: admin@learngermanwith.fun / admin123!
- [ ] See dashboard with stats
- [ ] Test user management
- [ ] Check audit log

### Frontend ✅

- [ ] Visit your domain
- [ ] Register new user
- [ ] Verify email (use `123456` in test, or real email in production)
- [ ] Access dashboard
- [ ] Try lesson
- [ ] Try vocabulary
- [ ] Try exam

### Database ✅

- [ ] Login to cPanel
- [ ] Go to phpMyAdmin
- [ ] Select learn_german database
- [ ] See 11 tables created
- [ ] See admin user in users table

---

## Important: Change Credentials Immediately

After deployment, **change these immediately:**

### Change Admin Password

1. Login to `/backend/admin`
2. Go to Settings (when implemented)
3. Change password from `admin123!`

### Change Admin Email (Optional)

Update in database:
```sql
UPDATE users SET email = 'new-admin@yourdomain.com' 
WHERE email = 'admin@learngermanwith.fun' AND is_admin = TRUE;
```

---

## API Endpoint Testing

Test endpoints with curl:

### Register User
```bash
curl -X POST https://yourdomain.com/backend/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

### Login
```bash
curl -X POST https://yourdomain.com/backend/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

### Get Dashboard
```bash
curl -X GET https://yourdomain.com/backend/api/progress/get-dashboard \
  -b cookies.txt
```

---

## Troubleshooting

### "Database connection failed"

```
1. Check cPanel MySQL is running
2. Verify credentials in backend/config.php
3. Check user has ALL PRIVILEGES
4. Verify database exists
```

### "OTP emails not sending"

```
1. Check cPanel → Email Accounts
2. Verify sending domain
3. Check mail logs: /var/log/maillog
4. Test with: php -r "mail('test@example.com', 'Test', 'Test');"
```

### "Setup page not found"

```
Solution: Reupload backend/setup/install.php
OR: Delete backend/setup/setup.lock file
```

### "Permission denied" on logs/cache

```bash
Via cPanel Terminal or SSH:
chmod 755 backend/logs
chmod 755 backend/cache
```

### React frontend not connecting

```
1. Check VITE_API_URL in React .env
2. Verify CORS headers in backend/.htaccess
3. Check browser console for CORS errors
4. Verify /backend/api endpoints are accessible
```

---

## File Locations After Deployment

### On cPanel (public_html)

```
public_html/
├── index.html                    (React built index)
├── assets/                       (React bundle)
├── backend/
│   ├── api/
│   ├── admin/
│   ├── config.php
│   ├── index.php
│   └── .htaccess
```

### Database

```
MySQL: learn_german
Tables:
  - users
  - lessons
  - user_progress
  - vocabulary
  - user_vocabulary
  - exams
  - user_exam_results
  - learning_streaks
  - user_points
  - seo_settings
  - site_settings
  - audit_log
```

---

## URLs After Deployment

```
Frontend:      https://yourdomain.com/
Admin Panel:   https://yourdomain.com/backend/admin
API Base:      https://yourdomain.com/backend/api
```

---

## Next Steps

1. **Seed Content**
   - Add lessons
   - Add vocabulary words
   - Create exams

2. **Customize**
   - Update logo/branding
   - Configure SEO
   - Add more lessons

3. **Monitor**
   - Check admin dashboard daily
   - Review audit logs
   - Monitor email delivery
   - Backup database weekly

4. **Optimize**
   - Enable caching
   - Optimize images
   - Monitor performance
   - Set up alerts

---

## Documentation Links

| File | Purpose |
|------|---------|
| `BACKEND_SUMMARY.md` | Complete build overview |
| `BACKEND_DEPLOYMENT.md` | Detailed deployment guide |
| `backend/README.md` | Backend API reference |
| `backend/config.php` | Configuration options |

---

## Support & Help

### If Something Doesn't Work:

1. **Check logs**: `backend/logs/` directory
2. **Check database**: Open phpMyAdmin and verify tables
3. **Check permissions**: Make sure files/directories are readable
4. **Check credentials**: Verify MySQL user/password
5. **Check network**: Verify both frontend and backend are on same server/domain

### Common Fixes:

```bash
# Clear cache
rm -rf backend/cache/*

# Reset permissions
chmod 755 backend/{logs,cache}
chmod 644 backend/**/*.php

# Recreate setup if needed
rm backend/setup/setup.lock
# Then visit /backend/setup again
```

---

## Success! 🎉

If you see:
- ✅ Frontend loads
- ✅ Can register/login
- ✅ Admin panel accessible
- ✅ Lessons load
- ✅ Exams work

**You're ready to go live!**

---

**Questions?** Check the comprehensive documentation files or review the code comments.

