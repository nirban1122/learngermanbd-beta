# Learn German With Fun - cPanel Deployment Guide

Complete guide for deploying the React frontend + PHP backend on cPanel shared hosting.

---

## Prerequisites

- cPanel access with:
  - MySQL Databases
  - File Manager (or FTP access)
  - PHP 7.4+
- Domain: `learngermanwith.fun` (or your domain)

---

## Quick Deployment (15 minutes)

### Step 1: Create MySQL Database

1. Log into **cPanel**
2. Go to **MySQL Databases**
3. Click **Create New Database**:
   - Database Name: `learngerman` (becomes `username_learngerman`)
4. Click **Create New User**:
   - Username: `germanuser`
   - Password: Generate a strong password (save it!)
5. Click **Add User to Database**:
   - Select user and database
   - Check **ALL PRIVILEGES**
6. Note your credentials:
   ```
   Database: username_learngerman
   User: username_germanuser
   Password: [your-password]
   Host: localhost
   ```

### Step 2: Upload Backend Files

**Via File Manager:**
1. Open cPanel **File Manager**
2. Navigate to `public_html`
3. Create folder: `backend`
4. Upload the `backend/` folder contents:
   ```
   public_html/backend/
   ├── api/
   │   ├── auth/
   │   ├── lessons/
   │   ├── vocabulary/
   │   ├── exams/
   │   ├── user/
   │   └── progress/
   ├── admin/
   ├── setup/
   ├── config.php
   ├── index.php
   └── .htaccess
   ```

**Via FTP:**
```
Host: yourdomain.com
User: cpanel_username
Pass: cpanel_password
Port: 21
Remote Path: /public_html/backend/
```

### Step 3: Upload Frontend Build

1. Build the React app locally:
   ```bash
   npm run build
   ```
2. Upload the `dist/` folder contents to `public_html`:
   ```
   public_html/
   ├── index.html
   ├── assets/
   │   ├── index-xxx.css
   │   └── index-xxx.js
   └── vite.svg
   ```

### Step 4: Upload .htaccess Files

**Root .htaccess** (for React SPA):
Upload `.htaccess` to `public_html/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Force HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Exclude backend routes
  RewriteRule ^backend/(.*)$ - [L]

  # SPA routing
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript
</IfModule>

# Security
<FilesMatch "^(config\.php|\.env)">
  Order allow,deny
  Deny from all
</FilesMatch>
```

### Step 5: Configure Backend

Edit `public_html/backend/.env.local` with your credentials:

```ini
# Database
DB_HOST=localhost
DB_NAME=username_learngerman
DB_USER=username_germanuser
DB_PASS=your_mysql_password

# Email (Brevo)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=aca0f0001@smtp-brevo.com
SMTP_PASS=bskQ2hexTBFVAbX

# Frontend
FRONTEND_URL=https://learngermanwith.fun
BACKEND_URL=https://learngermanwith.fun/backend/api
```

### Step 6: Run Setup Wizard

1. Visit: `https://learngermanwith.fun/backend/setup`
2. Enter your database credentials
3. Click **Continue to Installation**
4. Wait for all tables to be created
5. **Save the admin credentials**:
   - Email: `admin@learngermanwith.fun`
   - Password: `admin123!`

### Step 7: Delete Setup File (Security!)

**IMPORTANT:** Delete `public_html/backend/setup/install.php` immediately after setup.

Via File Manager: Right-click > Delete

### Step 8: Change Admin Password

1. Visit: `https://learngermanwith.fun/backend/admin`
2. Login with default credentials
3. Change password immediately!

---

## Directory Structure (After Deployment)

```
public_html/
├── index.html                    # React SPA
├── assets/                       # CSS & JS bundles
├── .htaccess                     # SPA routing + HTTPS
│
└── backend/
    ├── api/                       # API endpoints
    │   ├── auth/
    │   │   ├── register.php
    │   │   ├── login.php
    │   │   ├── send-otp.php
    │   │   ├── verify-otp.php
    │   │   ├── logout.php
    │   │   └── me.php
    │   ├── lessons/
    │   │   ├── get-lessons.php
    │   │   ├── get-lesson.php
    │   │   └── submit-answer.php
    │   ├── vocabulary/
    │   │   ├── get-vocabulary.php
    │   │   └── mark-learned.php
    │   ├── exams/
    │   │   ├── get-exams.php
    │   │   ├── get-exam.php
    │   │   └── submit-exam.php
    │   ├── user/
    │   │   ├── get-profile.php
    │   │   ├── update-profile.php
    │   │   └── change-password.php
    │   └── progress/
    │       └── get-dashboard.php
    │
    ├── admin/                     # Admin panel
    │   ├── login.php
    │   ├── index.php
    │   ├── users.php
    │   ├── lessons.php
    │   ├── vocabulary.php
    │   ├── exams.php
    │   ├── seo.php
    │   └── settings.php
    │
    ├── config.php                 # Core config
    ├── index.php                  # Router
    ├── .env.local                  # Your credentials
    ├── .htaccess                   # Security
    ├── logs/                       # Activity logs
    └── cache/                      # Cache files
```

---

## API Endpoints

All endpoints return JSON with format:
```json
{"success": true, "message": "...", "data": {...}}
```

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/backend/api/auth/register.php` | Register new user |
| POST | `/backend/api/auth/login.php` | Login user |
| POST | `/backend/api/auth/send-otp.php` | Send OTP email |
| POST | `/backend/api/auth/verify-otp.php` | Verify email |
| GET | `/backend/api/auth/logout.php` | Logout |
| GET | `/backend/api/auth/me.php` | Get current user |

### Lessons
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/backend/api/lessons/get-lessons.php?level=A1` | Get lessons |
| GET | `/backend/api/lessons/get-lesson.php?id=1` | Get lesson |
| POST | `/backend/api/lessons/submit-answer.php` | Submit answer |

### Vocabulary
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/backend/api/vocabulary/get-vocabulary.php?level=A1` | Get words |
| POST | `/backend/api/vocabulary/mark-learned.php` | Mark learned |

### Exams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/backend/api/exams/get-exams.php?level=A1` | Get exams |
| GET | `/backend/api/exams/get-exam.php?id=1` | Get exam |
| POST | `/backend/api/exams/submit-exam.php` | Submit answers |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/backend/api/user/get-profile.php` | Get profile |
| POST | `/backend/api/user/update-profile.php` | Update profile |
| POST | `/backend/api/user/change-password.php` | Change password |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/backend/api/progress/get-dashboard.php` | Dashboard stats |

---

## Testing Your Deployment

### Test API
```bash
# Test auth endpoint
curl -X POST https://learngermanwith.fun/backend/api/auth/register.php \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test12345"}'

# Test login
curl -X POST https://learngermanwith.fun/backend/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@learngermanwith.fun","password":"admin123!"}' \
  -c cookies.txt

# Test protected endpoint
curl https://learngermanwith.fun/backend/api/progress/get-dashboard.php \
  -b cookies.txt
```

### Test Frontend
1. Visit `https://learngermanwith.fun`
2. Click **Get Started**
3. Register a new account
4. Check for OTP email (or use any 6-digit code in development)
5. Login and access dashboard

### Test Admin Panel
1. Visit `https://learngermanwith.fun/backend/admin`
2. Login with admin credentials
3. View dashboard stats
4. Test user management

---

## Environment Variables

`backend/.env.local` supports:

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | localhost |
| `DB_NAME` | Database name | learn_german |
| `DB_USER` | Database user | root |
| `DB_PASS` | Database password | (empty) |
| `FRONTEND_URL` | React frontend URL | http://localhost:5173 |
| `SMTP_HOST` | Email SMTP host | smtp-relay.brevo.com |
| `SMTP_PORT` | SMTP port | 587 |
| `SMTP_USER` | SMTP username | (brevo) |
| `SMTP_PASS` | SMTP password | (brevo) |

---

## Troubleshooting

### "Database connection failed"
- Verify `.env.local` credentials
- Check database exists in cPanel
- Confirm user has ALL PRIVILEGES
- Try `localhost` as host

### "OTP emails not sending"
- Check cPanel -> Email Accounts
- Verify sending domain is configured
- Check mail logs in cPanel
- Test: `php -r "mail('test@example.com','Test','Test');"`

### "404 Not Found" on API
- Verify `.htaccess` exists in `backend/`
- Check `mod_rewrite` is enabled
- Confirm Apache allows `.htaccess`

### "CORS error" in browser
- Check `FRONTEND_URL` in `.env.local`
- Must match your domain exactly (including https://)
- Clear browser cache

### "Setup page 404"
- Ensure `backend/setup/install.php` exists
- Delete `backend/setup/setup.lock` if reinstalling

### "Permission denied" errors
```bash
chmod 755 public_html/backend/logs
chmod 755 public_html/backend/cache
chmod 644 public_html/backend/**/*.php
```

### Session not persisting
- Ensure cookies enabled in browser
- Check `session.cookie_samesite` setting
- Verify HTTPS (cookies require secure context)

---

## Security Checklist

- [ ] Delete `backend/setup/install.php`
- [ ] Change admin password from `admin123!`
- [ ] Enable HTTPS (not HTTP)
- [ ] Strong MySQL password
- [ ] Set file permissions (644 files, 755 folders)
- [ ] Block access to `.env.local` (in .htaccess)
- [ ] Regular database backups
- [ ] Monitor `/backend/logs/` for suspicious activity

---

## Database Backup

### Manual Backup (cPanel)
1. Go to cPanel -> **Backups**
2. Click **Download a MySQL Database Backup**
3. Select `learn_german`
4. Save `.sql.gz` file

### Automated Backup (Cron)
Add to cPanel -> **Cron Jobs**:
```bash
0 2 * * * /usr/bin/mysqldump -u username_germanuser -p'PASSWORD' username_learngerman > /home/username/backups/db_$(date +\%Y\%m\%d).sql
```

---

## URL Reference

| Service | URL |
|---------|-----|
| Frontend | `https://learngermanwith.fun/` |
| Admin Panel | `https://learngermanwith.fun/backend/admin` |
| API Base | `https://learngermanwith.fun/backend/api/` |
| Setup Wizard | `https://learngermanwith.fun/backend/setup` |

---

## Support

For issues:
1. Check `public_html/backend/logs/` for error details
2. Review audit_log table in phpMyAdmin
3. Consult QUICKSTART.md and BACKEND_DEPLOYMENT.md

---

**Ready to deploy!** Follow Steps 1-8 above.
