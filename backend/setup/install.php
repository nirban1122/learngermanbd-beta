<?php
/**
 * LEARN GERMAN WITH FUN - Database Setup Wizard
 * Creates all tables and seeds initial data
 */

// Disable error reporting for clean output
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Check if already installed
if (file_exists(__DIR__ . '/setup.lock')) {
    die('Application already installed. Delete setup/setup.lock to reinstall.');
}

// Get database credentials from user
$db_host = $_POST['db_host'] ?? 'localhost';
$db_user = $_POST['db_user'] ?? 'root';
$db_pass = $_POST['db_pass'] ?? '';
$db_name = $_POST['db_name'] ?? 'learn_german';

$step = $_POST['step'] ?? 'credentials';

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Learn German With Fun - Setup Wizard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            width: 100%;
            max-width: 600px;
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(255, 215, 0, 0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo h1 {
            color: #ffc107;
            font-size: 28px;
            margin-bottom: 5px;
        }
        .logo p {
            color: #999;
            font-size: 14px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            color: #fff;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
        }
        input[type="text"],
        input[type="password"],
        input[type="email"] {
            width: 100%;
            padding: 12px;
            border: 1px solid #333;
            border-radius: 5px;
            background: #0a0a0a;
            color: #fff;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        input:focus {
            outline: none;
            border-color: #ffc107;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
        }
        .button {
            width: 100%;
            padding: 12px;
            background: #ffc107;
            color: #000;
            border: none;
            border-radius: 5px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
        }
        .button:hover {
            background: #ffb300;
        }
        .button:disabled {
            background: #666;
            cursor: not-allowed;
        }
        .alert {
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        .alert-success {
            background: #1d4620;
            color: #4caf50;
            border: 1px solid #4caf50;
        }
        .alert-error {
            background: #4a1a1a;
            color: #f44336;
            border: 1px solid #f44336;
        }
        .alert-info {
            background: #1a3a4a;
            color: #2196f3;
            border: 1px solid #2196f3;
        }
        .progress {
            display: flex;
            gap: 5px;
            margin-bottom: 30px;
        }
        .progress-step {
            flex: 1;
            height: 4px;
            background: #333;
            border-radius: 2px;
            transition: background 0.3s;
        }
        .progress-step.active {
            background: #ffc107;
        }
        .progress-step.completed {
            background: #4caf50;
        }
        .help-text {
            color: #999;
            font-size: 12px;
            margin-top: 5px;
        }
        .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #ffc107;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        code {
            background: #0a0a0a;
            padding: 2px 6px;
            border-radius: 3px;
            color: #ffc107;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>⚙️ Setup Wizard</h1>
            <p>Learn German With Fun</p>
        </div>

        <div class="progress">
            <div class="progress-step <?php echo $step === 'credentials' ? 'active' : ($step !== 'credentials' ? 'completed' : ''); ?>"></div>
            <div class="progress-step <?php echo $step === 'install' ? 'active' : ($step !== 'install' ? 'completed' : ''); ?>"></div>
            <div class="progress-step <?php echo $step === 'complete' ? 'active' : ($step === 'complete' ? 'completed' : ''); ?>"></div>
        </div>

        <?php if ($step === 'credentials'): ?>
            <h2 style="color: #ffc107; margin-bottom: 20px;">Step 1: Database Credentials</h2>
            <form method="POST">
                <input type="hidden" name="step" value="install">

                <div class="form-group">
                    <label for="db_host">Database Host</label>
                    <input type="text" id="db_host" name="db_host" value="<?php echo htmlspecialchars($db_host); ?>" required>
                    <p class="help-text">Usually "localhost" on shared hosting</p>
                </div>

                <div class="form-group">
                    <label for="db_user">Database User</label>
                    <input type="text" id="db_user" name="db_user" value="<?php echo htmlspecialchars($db_user); ?>" required>
                    <p class="help-text">From cPanel: Database → Users</p>
                </div>

                <div class="form-group">
                    <label for="db_pass">Database Password</label>
                    <input type="password" id="db_pass" name="db_pass" value="<?php echo htmlspecialchars($db_pass); ?>">
                    <p class="help-text">Leave blank if no password</p>
                </div>

                <div class="form-group">
                    <label for="db_name">Database Name</label>
                    <input type="text" id="db_name" name="db_name" value="<?php echo htmlspecialchars($db_name); ?>" required>
                    <p class="help-text">Will be created if it doesn't exist</p>
                </div>

                <button type="submit" class="button">Continue to Installation →</button>
            </form>

        <?php elseif ($step === 'install'): ?>
            <h2 style="color: #ffc107; margin-bottom: 20px;">Step 2: Creating Database & Tables</h2>

            <?php
            // Create database connection
            $conn = new mysqli($db_host, $db_user, $db_pass);

            if ($conn->connect_error) {
                echo '<div class="alert alert-error">❌ Connection failed: ' . htmlspecialchars($conn->connect_error) . '</div>';
                echo '<form method="POST"><input type="hidden" name="step" value="credentials">';
                echo '<input type="hidden" name="db_host" value="' . htmlspecialchars($db_host) . '">';
                echo '<input type="hidden" name="db_user" value="' . htmlspecialchars($db_user) . '">';
                echo '<input type="hidden" name="db_pass" value="' . htmlspecialchars($db_pass) . '">';
                echo '<button type="submit" class="button">← Back</button></form>';
                exit;
            }

            // Create database
            $create_db = "CREATE DATABASE IF NOT EXISTS `$db_name`";
            if (!$conn->query($create_db)) {
                echo '<div class="alert alert-error">❌ Error creating database: ' . htmlspecialchars($conn->error) . '</div>';
                exit;
            }

            // Select database
            $conn->select_db($db_name);
            $conn->set_charset('utf8mb4');

            echo '<div class="alert alert-success">✓ Database connected</div>';

            // Create tables
            $tables_sql = array(
                // Users table
                "CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    full_name VARCHAR(255) NOT NULL,
                    level ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2') DEFAULT 'A1',
                    language VARCHAR(10) DEFAULT 'en',
                    verified BOOLEAN DEFAULT FALSE,
                    otp_code VARCHAR(6),
                    otp_expires DATETIME,
                    otp_attempts INT DEFAULT 0,
                    locked_until DATETIME,
                    last_login DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    is_admin BOOLEAN DEFAULT FALSE,
                    is_active BOOLEAN DEFAULT TRUE,
                    INDEX idx_email (email),
                    INDEX idx_level (level),
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Lessons table
                "CREATE TABLE IF NOT EXISTS lessons (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    level ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2') NOT NULL,
                    type ENUM('grammar', 'vocabulary', 'listening', 'reading', 'writing') NOT NULL,
                    content JSON,
                    duration_minutes INT DEFAULT 10,
                    xp_reward INT DEFAULT 50,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_level (level),
                    INDEX idx_type (type)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // User Progress table
                "CREATE TABLE IF NOT EXISTS user_progress (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    lesson_id INT NOT NULL,
                    status ENUM('started', 'completed', 'in_progress') DEFAULT 'started',
                    score INT DEFAULT 0,
                    completed_at DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_user_lesson (user_id, lesson_id),
                    INDEX idx_user_id (user_id),
                    INDEX idx_lesson_id (lesson_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Vocabulary table
                "CREATE TABLE IF NOT EXISTS vocabulary (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    german_word VARCHAR(255) NOT NULL UNIQUE,
                    english_translation VARCHAR(255) NOT NULL,
                    article ENUM('der', 'die', 'das', '') DEFAULT '',
                    part_of_speech VARCHAR(50),
                    difficulty_level ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2') NOT NULL,
                    example_sentence TEXT,
                    pronunciation VARCHAR(255),
                    image_url VARCHAR(500),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_level (difficulty_level),
                    INDEX idx_german_word (german_word)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // User Vocabulary Progress
                "CREATE TABLE IF NOT EXISTS user_vocabulary (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    vocabulary_id INT NOT NULL,
                    learned BOOLEAN DEFAULT FALSE,
                    learned_at DATETIME,
                    review_count INT DEFAULT 0,
                    last_reviewed DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (vocabulary_id) REFERENCES vocabulary(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_user_vocab (user_id, vocabulary_id),
                    INDEX idx_user_id (user_id),
                    INDEX idx_learned (learned)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Exams table
                "CREATE TABLE IF NOT EXISTS exams (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    level ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2') NOT NULL,
                    duration_minutes INT DEFAULT 180,
                    pass_score INT DEFAULT 60,
                    total_questions INT DEFAULT 100,
                    sections JSON,
                    content JSON,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_level (level)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // User Exam Results table
                "CREATE TABLE IF NOT EXISTS user_exam_results (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    exam_id INT NOT NULL,
                    score INT,
                    max_score INT DEFAULT 100,
                    status ENUM('pending', 'passed', 'failed', 'in_progress') DEFAULT 'pending',
                    answers JSON,
                    time_spent_minutes INT,
                    started_at DATETIME,
                    completed_at DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id),
                    INDEX idx_exam_id (exam_id),
                    INDEX idx_status (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Learning Streaks table
                "CREATE TABLE IF NOT EXISTS learning_streaks (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL UNIQUE,
                    current_streak INT DEFAULT 0,
                    longest_streak INT DEFAULT 0,
                    last_activity_date DATE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // User Points table
                "CREATE TABLE IF NOT EXISTS user_points (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL UNIQUE,
                    total_points INT DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // SEO Settings table
                "CREATE TABLE IF NOT EXISTS seo_settings (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    page_key VARCHAR(100) UNIQUE NOT NULL,
                    title VARCHAR(160),
                    description VARCHAR(160),
                    keywords VARCHAR(255),
                    og_image VARCHAR(500),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_page_key (page_key)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Site Settings table
                "CREATE TABLE IF NOT EXISTS site_settings (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    category VARCHAR(100) NOT NULL,
                    setting_key VARCHAR(100) NOT NULL UNIQUE,
                    value TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_category (category)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

                // Audit Log table
                "CREATE TABLE IF NOT EXISTS audit_log (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    action VARCHAR(100) NOT NULL,
                    details TEXT,
                    status VARCHAR(20),
                    ip_address VARCHAR(45),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_user_id (user_id),
                    INDEX idx_created_at (created_at),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
            );

            $errors = [];
            foreach ($tables_sql as $sql) {
                if (!$conn->query($sql)) {
                    $errors[] = $conn->error;
                    echo '<div class="alert alert-error">❌ Error: ' . htmlspecialchars($conn->error) . '</div>';
                }
            }

            if (empty($errors)) {
                echo '<div class="alert alert-success">✓ All tables created successfully</div>';

                // Insert seed data
                $admin_password = hash_password('admin123!');
                $insert_data = array(
                    "INSERT INTO users (email, password, full_name, level, language, verified, is_admin, created_at)
                     VALUES ('admin@learngermanwith.fun', '$admin_password', 'Administrator', 'C2', 'en', TRUE, TRUE, NOW())"
                );

                foreach ($insert_data as $sql) {
                    if (!$conn->query($sql)) {
                        echo '<div class="alert alert-error">❌ Error inserting data: ' . htmlspecialchars($conn->error) . '</div>';
                    }
                }

                echo '<div class="alert alert-success">✓ Seed data inserted</div>';

                // Create setup.lock file
                if (!file_exists(__DIR__)) {
                    mkdir(__DIR__, 0755, true);
                }
                file_put_contents(__DIR__ . '/setup.lock', date('Y-m-d H:i:s'));

                // Redirect to complete step
                header('Location: ?step=complete');
                exit;
            }

        elseif ($step === 'complete'):
        ?>
            <h2 style="color: #ffc107; margin-bottom: 20px;">✓ Setup Complete!</h2>
            <div class="alert alert-success">
                <strong>Installation Successful!</strong>
                Your database has been created and configured.
            </div>

            <div style="background: #0a0a0a; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                <p style="color: #fff; margin-bottom: 15px;"><strong>Admin Credentials:</strong></p>
                <p style="color: #999; margin-bottom: 10px;">
                    Email: <code>admin@learngermanwith.fun</code>
                </p>
                <p style="color: #999; margin-bottom: 10px;">
                    Password: <code>admin123!</code>
                </p>
                <p style="color: #f44336; font-size: 12px; margin-top: 15px;">
                    ⚠️ Change this password immediately after login!
                </p>
            </div>

            <div class="alert alert-info">
                <strong>Next Steps:</strong>
                <ol style="margin-left: 20px; margin-top: 10px; color: #2196f3;">
                    <li>Delete this setup.php file for security</li>
                    <li>Visit /admin to login to the admin panel</li>
                    <li>Update admin password in profile settings</li>
                    <li>Add lessons and vocabulary content</li>
                    <li>Configure SEO settings</li>
                </ol>
            </div>

            <a href="/admin" style="display: block; text-align: center; text-decoration: none; color: #000; background: #ffc107; padding: 12px; border-radius: 5px; font-weight: 600; margin-top: 20px;">
                Go to Admin Panel →
            </a>
        <?php endif; ?>

    </div>

</body>
</html>

<?php
function hash_password($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}
?>
