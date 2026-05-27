# Learn German With Fun - PHP Backend API

Pure PHP backend for the React frontend. No Node.js required - perfect for cPanel shared hosting.

## Quick Start

### Local Development

1. **Setup Database**
   ```bash
   # Start MySQL server
   # Create database: learn_german
   # Create user: learn_german
   ```

2. **Run Setup Wizard**
   ```
   http://localhost:8000/backend/setup
   ```

3. **Access Admin**
   ```
   http://localhost:8000/backend/admin
   Email: admin@learngermanwith.fun
   Password: admin123!
   ```

### Directory Structure

```
backend/
├── api/              # JSON API endpoints
├── admin/            # Admin panel (PHP web UI)
├── setup/            # Database initialization
├── logs/             # Error & activity logs
├── cache/            # Cache files
├── config.php        # Core configuration
└── index.php         # Router
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-otp` - Verify email
- `GET /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

### Lessons
- `GET /api/lessons/get-lessons` - Get lessons
- `GET /api/lessons/get-lesson?id=X` - Get lesson
- `POST /api/lessons/submit-answer` - Submit answer

### Vocabulary
- `GET /api/vocabulary/get-vocabulary` - Get words
- `POST /api/vocabulary/mark-learned` - Mark learned

### Exams
- `GET /api/exams/get-exams` - Get exams
- `GET /api/exams/get-exam?id=X` - Get exam
- `POST /api/exams/submit-exam` - Submit answers

### User
- `GET /api/user/get-profile` - User profile
- `POST /api/user/update-profile` - Update profile
- `POST /api/user/change-password` - Change password

### Progress
- `GET /api/progress/get-dashboard` - Dashboard stats

## Admin Panel

Access at `/admin`

- **Dashboard** - Stats overview
- **Users** - Manage users and levels
- **Lessons** - Add/edit lessons
- **Vocabulary** - Manage words
- **Exams** - Create exams
- **SEO** - Configure SEO
- **Settings** - Site settings

## Features

✅ OTP-based email verification
✅ Secure password hashing (bcrypt)
✅ Learning streaks & points tracking
✅ Lesson progress tracking
✅ Vocabulary learning system
✅ Exam management & scoring
✅ Admin panel for content management
✅ Audit logging of all actions
✅ CORS enabled for React frontend
✅ Session-based authentication
✅ Caching system
✅ Pure PHP - no npm/Node required

## Database

11 tables with proper relationships:
- `users` - User accounts
- `lessons` - Lesson content
- `user_progress` - Lesson progress
- `vocabulary` - Vocabulary words
- `user_vocabulary` - User vocabulary progress
- `exams` - Exam definitions
- `user_exam_results` - Exam results
- `learning_streaks` - User streaks
- `user_points` - User XP points
- `seo_settings` - SEO configuration
- `site_settings` - Global settings
- `audit_log` - Activity log

## Configuration

Edit `config.php`:

```php
// Database
define('DB_HOST', 'localhost');
define('DB_USER', 'learn_german');
define('DB_PASS', 'password');
define('DB_NAME', 'learn_german');

// Frontend URL (for CORS)
define('APP_URL', 'http://localhost:5173');

// Email
define('BREVO_SMTP_HOST', 'smtp-relay.brevo.com');
define('BREVO_FROM_EMAIL', 'noreply@learngermanwith.fun');
```

## Requirements

- PHP 7.4+
- MySQL 5.7+ or MariaDB 10.2+
- mysqli extension
- Mail function enabled

## For Production

See `../BACKEND_DEPLOYMENT.md` for complete deployment guide.

### Key Steps:
1. Upload files via FTP
2. Create MySQL database in cPanel
3. Run `/setup` wizard
4. Delete setup file
5. Update `config.php` with production URLs
6. Set file permissions
7. Configure CORS for React domain
8. Test all endpoints

## Security Notes

- Delete `/setup/install.php` after setup
- Change default admin password
- Use HTTPS in production
- Keep MySQL user password strong
- Monitor audit logs regularly
- Update PHP version regularly
- Keep database backups

## Troubleshooting

### Database Error
- Verify credentials in `config.php`
- Check MySQL is running
- Verify user has privileges

### Email Not Sending
- Check cPanel email settings
- Test mail() function
- Check `/logs` directory

### Permission Errors
```bash
chmod 755 logs/ cache/
```

### Can't Delete Setup File
- Run once then delete manually via FTP
- Or create `setup/setup.lock` file

## React Frontend Integration

```env
VITE_API_URL=https://yourdomain.com/backend
```

```typescript
const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/auth/login`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  }
);
```

---

**Built for:** Cheap shared hosting (cPanel)
**No:** Node.js, npm, Docker, complex setup
**Yes:** Pure PHP, MySQL, simple FTP deployment

