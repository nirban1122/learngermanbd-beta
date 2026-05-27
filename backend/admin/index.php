<?php
/**
 * Admin Dashboard
 */

require_once __DIR__ . '/../config.php';

require_admin();

$user = get_current_user();

// Get stats
$stmt = $db->prepare('SELECT COUNT(*) as total FROM users');
$stmt->execute();
$result = $stmt->get_result();
$users_count = $result->fetch_assoc()['total'];
$stmt->close();

$stmt = $db->prepare('SELECT COUNT(*) as total FROM lessons');
$stmt->execute();
$result = $stmt->get_result();
$lessons_count = $result->fetch_assoc()['total'];
$stmt->close();

$stmt = $db->prepare('SELECT COUNT(*) as total FROM vocabulary');
$stmt->execute();
$result = $stmt->get_result();
$vocab_count = $result->fetch_assoc()['total'];
$stmt->close();

$stmt = $db->prepare('SELECT COUNT(DISTINCT user_id) as total FROM user_progress WHERE DATE(completed_at) = CURDATE()');
$stmt->execute();
$result = $stmt->get_result();
$lessons_today = $result->fetch_assoc()['total'] ?? 0;
$stmt->close();

$stmt = $db->prepare('SELECT COUNT(DISTINCT user_id) as total FROM audit_log WHERE DATE(created_at) = CURDATE()');
$stmt->execute();
$result = $stmt->get_result();
$active_today = $result->fetch_assoc()['total'] ?? 0;
$stmt->close();

// Get recent activity
$stmt = $db->prepare('SELECT al.*, u.email FROM audit_log al
                      LEFT JOIN users u ON al.user_id = u.id
                      ORDER BY al.created_at DESC
                      LIMIT 10');
$stmt->execute();
$result = $stmt->get_result();
$activity = [];
while ($row = $result->fetch_assoc()) {
    $activity[] = $row;
}
$stmt->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Learn German With Fun</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0a0a;
            color: #fff;
        }
        .admin-container {
            display: flex;
            min-height: 100vh;
        }
        .sidebar {
            width: 250px;
            background: #1a1a1a;
            border-right: 1px solid #333;
            padding: 20px;
            position: fixed;
            height: 100vh;
            left: 0;
            top: 0;
            overflow-y: auto;
        }
        .sidebar h2 {
            color: #ffc107;
            font-size: 16px;
            margin-bottom: 20px;
        }
        .nav-menu {
            list-style: none;
        }
        .nav-menu li {
            margin-bottom: 10px;
        }
        .nav-menu a {
            display: block;
            color: #999;
            text-decoration: none;
            padding: 10px 12px;
            border-radius: 5px;
            transition: all 0.3s;
        }
        .nav-menu a:hover,
        .nav-menu a.active {
            background: #ffc107;
            color: #000;
        }
        .main-content {
            margin-left: 250px;
            padding: 30px;
            flex: 1;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #333;
        }
        .header h1 {
            font-size: 28px;
            color: #ffc107;
        }
        .admin-info {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .admin-avatar {
            width: 40px;
            height: 40px;
            background: #ffc107;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #000;
            font-weight: bold;
        }
        .logout-btn {
            padding: 8px 16px;
            background: #f44336;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 13px;
            text-decoration: none;
            display: inline-block;
        }
        .logout-btn:hover {
            background: #d32f2f;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
        }
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: #ffc107;
            margin: 10px 0;
        }
        .stat-label {
            color: #999;
            font-size: 13px;
        }
        .activity-section {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 10px;
            padding: 20px;
        }
        .activity-section h2 {
            margin-bottom: 20px;
            color: #ffc107;
        }
        .activity-list {
            list-style: none;
        }
        .activity-item {
            padding: 15px;
            border-bottom: 1px solid #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .activity-item:last-child {
            border-bottom: none;
        }
        .activity-action {
            color: #ffc107;
            font-weight: bold;
        }
        .activity-time {
            color: #999;
            font-size: 12px;
        }
        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
            }
            .main-content {
                margin-left: 0;
            }
        }
    </style>
</head>
<body>
    <div class="admin-container">
        <!-- Sidebar Navigation -->
        <aside class="sidebar">
            <h2>Admin Menu</h2>
            <ul class="nav-menu">
                <li><a href="/admin" class="active">📊 Dashboard</a></li>
                <li><a href="/admin/users">👥 Users</a></li>
                <li><a href="/admin/lessons">📚 Lessons</a></li>
                <li><a href="/admin/vocabulary">📝 Vocabulary</a></li>
                <li><a href="/admin/exams">✏️ Exams</a></li>
                <li><a href="/admin/seo">🔍 SEO</a></li>
                <li><a href="/admin/settings">⚙️ Settings</a></li>
                <li><a href="/api/auth/logout" class="logout-btn" style="display: block; margin-top: 30px; text-align: center;">Logout</a></li>
            </ul>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <div class="header">
                <h1>Admin Dashboard</h1>
                <div class="admin-info">
                    <span><?php echo htmlspecialchars($user['full_name']); ?></span>
                    <div class="admin-avatar"><?php echo strtoupper(substr($user['full_name'], 0, 1)); ?></div>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Total Users</div>
                    <div class="stat-number"><?php echo $users_count; ?></div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Total Lessons</div>
                    <div class="stat-number"><?php echo $lessons_count; ?></div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Vocabulary Words</div>
                    <div class="stat-number"><?php echo $vocab_count; ?></div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Lessons Today</div>
                    <div class="stat-number"><?php echo $lessons_today; ?></div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Active Today</div>
                    <div class="stat-number"><?php echo $active_today; ?></div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="activity-section">
                <h2>Recent Activity</h2>
                <ul class="activity-list">
                    <?php foreach ($activity as $item): ?>
                        <li class="activity-item">
                            <div>
                                <span class="activity-action"><?php echo htmlspecialchars($item['action']); ?></span>
                                <br>
                                <small style="color: #999;">
                                    <?php echo htmlspecialchars($item['email'] ?? 'System'); ?> - <?php echo htmlspecialchars($item['details']); ?>
                                </small>
                            </div>
                            <div class="activity-time"><?php echo date('Y-m-d H:i', strtotime($item['created_at'])); ?></div>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
        </main>
    </div>
</body>
</html>
<?php
?>
