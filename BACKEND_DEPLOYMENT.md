# Learn German With Fun - PHP Backend Deployment Guide

## Overview

This is a **pure PHP backend** for the React frontend. It uses **MySQL** on cPanel shared hosting with **no Node.js** dependency.

## Project Structure

```
backend/
├── config.php                      # Core configuration & helper functions
├── index.php                       # Main router
├── setup/
│   └── install.php                # Database setup wizard
├── api/
│   ├── auth/                       # Authentication endpoints
│   │   ├── register.php
│   │   ├── login.php
│   │   ├── send-otp.php
│   │   ├── verify-otp.php
│   │   ├── logout.php
│   │   └── me.php
│   ├── lessons/                    # Lesson endpoints
│   │   ├── get-lessons.php
│   │   ├── get-lesson.php
│   │   └── submit-answer.php
│   ├── vocabulary/                 # Vocabulary endpoints
│   │   ├── get-vocabulary.php
│   │   └── mark-learned.php
│   ├── exams/                      # Exam endpoints
│   │   ├── get-exams.php
│   │   ├── get-exam.php
│   │   └── submit-exam.php
│   ├── user/                       # User profile endpoints
│   │   ├── get-profile.php
│   │   ├── update-profile.php
│   │   └── change-password.php
│   └── progress/                   # Progress endpoints
│       └── get-dashboard.php
├── admin/                          # Admin panel (PHP)
│   ├── login.php
│   ├── index.php                   # Dashboard
│   ├── users.php                   # User management
│   ├── lessons.php                 # Lesson management
│   ├── vocabulary.php              # Vocabulary management
│   ├── exams.php                   # Exam management
│   ├── seo.php                     # SEO settings
│   └── settings.php                # Site settings
├── logs/                           # Error & activity logs
└── cache/                          # Cache files
```

## Installation Steps

### 1. Upload Files to cPanel

1. Connect via FTP to your cPanel account
2. Navigate to `public_html` directory
3. Create a `backend` folder
4. Upload all backend files into `public_html/backend/`

**FTP Structure:**
```
public_html/
└── backend/
    ├── api/
    ├── admin/
    ├── setup/
    ├── logs/
    ├── cache/
    ├── config.php
    └── index.php
```

### 2. Create MySQL Database via cPanel

1. Log into **cPanel**
2. Go to **MySQL Databases**
3. Create new database: `learn_german`
4. Create new user: `learn_german` with a strong password
5. Add user to database with **ALL PRIVILEGES**
6. Note the credentials:
   - Host: `localhost` (usually)
   - User: `learn_german` (or `prefix_learn_german`)
   - Password: (your password)
   - Database: `learn_german` (or `prefix_learn_german`)

### 3. Run Database Setup Wizard

1. Visit: `https://yourwebsite.com/backend/setup`
2. Enter your database credentials (from cPanel)
3. Click "Continue to Installation"
4. The wizard will:
   - Create all 11 tables
   - Insert seed data
   - Create `setup.lock` file
5. Save admin credentials shown:
   - Email: `admin@learngermanwith.fun`
   - Password: `admin123!`
   - **Change these immediately!**

### 4. Delete Setup File (Security)

```bash
# Via FTP or cPanel File Manager
Delete: public_html/backend/setup/install.php
```

Or create `setup.lock` manually to prevent re-running.

### 5. Configure Environment (Optional)

Create `.env` file in backend directory (optional - defaults are in config.php):

```ini
DB_HOST=localhost
DB_USER=learn_german
DB_PASS=your_password_here
DB_NAME=learn_german
```

### 6. Set File Permissions

Via SSH or cPanel Terminal:

```bash
# Make directories writable
chmod 755 /home/username/public_html/backend/logs
chmod 755 /home/username/public_html/backend/cache

# Make PHP files readable
chmod 644 /home/username/public_html/backend/**/*.php
```

## API Endpoints

### Authentication
- `POST /backend/api/auth/register` - Register new user
- `POST /backend/api/auth/login` - Login user
- `POST /backend/api/auth/send-otp` - Send OTP email
- `POST /backend/api/auth/verify-otp` - Verify email with OTP
- `POST /backend/api/auth/logout` - Logout user
- `GET /backend/api/auth/me` - Get current user

### Lessons
- `GET /backend/api/lessons/get-lessons?level=A1` - Get lessons by level
- `GET /backend/api/lessons/get-lesson?id=1` - Get single lesson
- `POST /backend/api/lessons/submit-answer` - Submit lesson answer

### Vocabulary
- `GET /backend/api/vocabulary/get-vocabulary?level=A1` - Get vocabulary
- `POST /backend/api/vocabulary/mark-learned` - Mark word as learned

### Exams
- `GET /backend/api/exams/get-exams?level=A1` - Get exams
- `GET /backend/api/exams/get-exam?id=1` - Get single exam
- `POST /backend/api/exams/submit-exam` - Submit exam answers

### User Profile
- `GET /backend/api/user/get-profile` - Get user profile
- `POST /backend/api/user/update-profile` - Update profile
- `POST /backend/api/user/change-password` - Change password

### Progress
- `GET /backend/api/progress/get-dashboard` - Get dashboard data

## Admin Panel

### Access
- URL: `https://yourwebsite.com/backend/admin`
- Default Email: `admin@learngermanwith.fun`
- Default Password: `admin123!`

### Features
- **Dashboard** - Overview stats
- **Users** - Manage user accounts and levels
- **Lessons** - Add/edit lessons (stub)
- **Vocabulary** - Manage vocabulary (stub)
- **Exams** - Create exams (stub)
- **SEO** - Configure SEO settings (stub)
- **Settings** - Site configuration (stub)

**Note:** Lessons, Vocabulary, Exams, and SEO management pages are UI stubs. Implement content management as needed.

## CORS Configuration

The backend is configured to accept requests from React frontend. Default origin:

```php
// config.php
define('APP_URL', 'http://localhost:5173'); // Change to your React URL
```

### Update for Production

In `config.php`, change:

```php
define('APP_URL', 'https://yourdomain.com'); // Your React frontend URL
```

## Email Configuration

### Currently Using: PHP mail()

The backend uses PHP's built-in `mail()` function. On cPanel shared hosting, this should work automatically if:
- Mail functions are enabled (usually are)
- Server can send emails

### Switch to SMTP (Optional)

If `mail()` doesn't work, implement proper SMTP:

```php
// In config.php send_email() function
// Use PHPMailer library:

require 'vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;

$mail = new PHPMailer(true);
$mail->isSMTP();
$mail->Host = BREVO_SMTP_HOST;
$mail->Port = BREVO_SMTP_PORT;
$mail->SMTPAuth = true;
$mail->Username = BREVO_SMTP_USER;
$mail->Password = BREVO_SMTP_PASS;
```

Then run:
```bash
composer require phpmailer/phpmailer
```

## Database Backup & Recovery

### Backup via cPanel

1. Go to **cPanel → Backups**
2. Download backup of `learn_german` database
3. Keep backups in secure location

### Manual SQL Backup

```bash
# Via SSH
mysqldump -u learn_german -p learn_german > backup.sql
```

## Common Issues & Solutions

### 1. "Database connection failed"

**Issue:** Can't connect to MySQL
**Solution:**
- Verify credentials in `config.php`
- Check MySQL is running in cPanel
- Verify database user has privileges

### 2. "OTP emails not sending"

**Issue:** Email function not working
**Solution:**
- Check cPanel → Email Accounts (verify sending domain)
- Check mail logs: `var/log/maillog`
- Test with simple mail() function
- Consider upgrading to SMTP

### 3. "Permission denied" errors

**Issue:** Can't write to cache/logs
**Solution:**
```bash
chmod 755 backend/logs
chmod 755 backend/cache
```

### 4. "Setup.lock" preventing reinstall

**Issue:** Can't run setup wizard again
**Solution:**
```bash
# Delete via FTP: backend/setup/setup.lock
# Or via SSH: rm backend/setup/setup.lock
```

## Performance Optimization

### 1. Enable Caching

The backend includes caching:
```php
get_cache($key);        // Get cached value
set_cache($key, $val);  // Cache with default 1 hour TTL
clear_cache();          // Clear all cache
```

### 2. Enable Gzip Compression

Add to `.htaccess` in backend directory:
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

### 3. Add Indexes to Database

Run in cPanel MySQL:
```sql
ALTER TABLE users ADD INDEX idx_email (email);
ALTER TABLE lessons ADD INDEX idx_level (level);
ALTER TABLE vocabulary ADD INDEX idx_level (difficulty_level);
```

## Security Checklist

- [ ] Delete `setup/install.php` after installation
- [ ] Change default admin password immediately
- [ ] Use HTTPS (not HTTP)
- [ ] Keep PHP updated (cPanel auto-updates)
- [ ] Regularly backup database
- [ ] Monitor `logs/` directory for errors
- [ ] Use strong MySQL passwords
- [ ] Limit admin access by IP (optional)
- [ ] Keep session timeout reasonable (default 30 days)
- [ ] Never hardcode sensitive data - use environment variables

## Connecting React Frontend

In React `.env` file:

```env
VITE_API_URL=https://yourdomain.com/backend
VITE_API_BASE_URL=https://yourdomain.com/backend/api
```

In React API calls:

```typescript
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify(data)
});
```

## Server Requirements

- **PHP:** 7.4+ (preferably 8.0+)
- **MySQL:** 5.7+ or MariaDB 10.2+
- **Extensions:** mysqli (usually included)
- **Disk Space:** ~50MB for code + database
- **cPanel:** Standard shared hosting plan

## Support & Debugging

### Enable Debug Mode (Development Only)

```php
// At top of config.php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/php-errors.log');
```

### Check Activity Log

```sql
SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 20;
```

### Monitor Email Delivery

```sql
SELECT * FROM audit_log WHERE action LIKE '%email%' ORDER BY created_at DESC;
```

## Maintenance Tasks

### Weekly
- Review audit logs for suspicious activity
- Check error logs
- Verify database backups

### Monthly
- Update admin password if shared
- Review user statistics
- Clean up old audit logs (optional):
  ```sql
  DELETE FROM audit_log WHERE DATE(created_at) < DATE_SUB(NOW(), INTERVAL 90 DAY);
  ```

### Quarterly
- Full database backup
- Verify all API endpoints functioning
- Review performance metrics

## Deployment Checklist

- [ ] Files uploaded via FTP
- [ ] Database created in cPanel
- [ ] Database user created with privileges
- [ ] Setup wizard run successfully
- [ ] Admin credentials saved securely
- [ ] setup/install.php deleted
- [ ] File permissions set (755 for dirs, 644 for files)
- [ ] config.php updated with production settings
- [ ] .htaccess configured (if needed)
- [ ] CORS APP_URL updated to React domain
- [ ] React environment variables updated
- [ ] HTTPS enabled (not HTTP)
- [ ] Admin password changed
- [ ] Test all API endpoints
- [ ] Monitor logs for errors

---

**Need help?** Check the logs directory for error details, or review the audit log in the database.

