<?php
/**
 * Admin Users Management
 */

require_once __DIR__ . '/../config.php';

require_admin();

$user = get_current_user();

// Handle actions
$action = $_GET['action'] ?? '';
$user_id = (int)($_GET['id'] ?? 0);

if ($action === 'delete' && $user_id > 0) {
    $stmt = $db->prepare('DELETE FROM users WHERE id = ? AND id != ?');
    $self_id = $user['id'];
    $stmt->bind_param('ii', $user_id, $self_id);
    if ($stmt->execute()) {
        // Also delete related data
        $db->query("DELETE FROM user_progress WHERE user_id = $user_id");
        $db->query("DELETE FROM user_vocabulary WHERE user_id = $user_id");
        $db->query("DELETE FROM user_exam_results WHERE user_id = $user_id");
        $db->query("DELETE FROM learning_streaks WHERE user_id = $user_id");
        $db->query("DELETE FROM user_points WHERE user_id = $user_id");
    }
    $stmt->close();
    header('Location: /admin/users');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_user'])) {
    $update_id = (int)$_POST['user_id'];
    $new_level = $_POST['level'] ?? 'A1';

    if (in_array($new_level, ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])) {
        $stmt = $db->prepare('UPDATE users SET level = ? WHERE id = ?');
        $stmt->bind_param('si', $new_level, $update_id);
        $stmt->execute();
        $stmt->close();
    }
    header('Location: /admin/users');
    exit;
}

// Get users with pagination
$page = (int)($_GET['page'] ?? 1);
$limit = 20;
$offset = ($page - 1) * $limit;

$filter_level = $_GET['level'] ?? '';

$query = 'SELECT id, email, full_name, level, verified, created_at, last_login FROM users WHERE 1=1';
$count_query = 'SELECT COUNT(*) as total FROM users WHERE 1=1';

if ($filter_level && in_array($filter_level, ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])) {
    $query .= " AND level = '$filter_level'";
    $count_query .= " AND level = '$filter_level'";
}

// Get total count
$count_result = $db->query($count_query);
$count_row = $count_result->fetch_assoc();
$total = $count_row['total'];
$pages = ceil($total / $limit);

$query .= ' ORDER BY created_at DESC LIMIT ' . $limit . ' OFFSET ' . $offset;
$result = $db->query($query);

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Users Management - Admin</title>
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
            font-size: 24px;
            color: #ffc107;
        }
        .filters {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        .filter-btn {
            padding: 8px 16px;
            background: #333;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 13px;
            transition: background 0.3s;
        }
        .filter-btn.active {
            background: #ffc107;
            color: #000;
        }
        .filter-btn:hover {
            background: #444;
        }
        .users-table {
            width: 100%;
            border-collapse: collapse;
            background: #1a1a1a;
            border-radius: 10px;
            overflow: hidden;
        }
        .users-table th {
            background: #333;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            color: #ffc107;
        }
        .users-table td {
            padding: 15px;
            border-bottom: 1px solid #333;
        }
        .users-table tr:hover {
            background: #252525;
        }
        .action-btn {
            padding: 6px 12px;
            background: #ffc107;
            color: #000;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            margin-right: 5px;
            transition: background 0.3s;
        }
        .action-btn:hover {
            background: #ffb300;
        }
        .delete-btn {
            background: #f44336;
            color: #fff;
        }
        .delete-btn:hover {
            background: #d32f2f;
        }
        .pagination {
            margin-top: 20px;
            text-align: center;
        }
        .pagination a, .pagination span {
            padding: 8px 12px;
            margin: 0 5px;
            background: #333;
            color: #ffc107;
            text-decoration: none;
            border-radius: 4px;
            display: inline-block;
        }
        .pagination span {
            background: #ffc107;
            color: #000;
        }
    </style>
</head>
<body>
    <div class="admin-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <h2>Admin Menu</h2>
            <ul class="nav-menu">
                <li><a href="/admin">📊 Dashboard</a></li>
                <li><a href="/admin/users" class="active">👥 Users</a></li>
                <li><a href="/admin/lessons">📚 Lessons</a></li>
                <li><a href="/admin/vocabulary">📝 Vocabulary</a></li>
                <li><a href="/admin/exams">✏️ Exams</a></li>
                <li><a href="/admin/seo">🔍 SEO</a></li>
                <li><a href="/admin/settings">⚙️ Settings</a></li>
                <li><a href="/api/auth/logout" class="logout-btn" style="display: block; margin-top: 30px; text-align: center; background: #f44336; color: #fff; padding: 10px; border-radius: 5px;">Logout</a></li>
            </ul>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <div class="header">
                <h1>Users Management</h1>
            </div>

            <div class="filters">
                <a href="/admin/users" class="filter-btn <?php echo !$filter_level ? 'active' : ''; ?>">All Users</a>
                <?php foreach (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as $level): ?>
                    <a href="/admin/users?level=<?php echo $level; ?>" class="filter-btn <?php echo $filter_level === $level ? 'active' : ''; ?>"><?php echo $level; ?></a>
                <?php endforeach; ?>
            </div>

            <table class="users-table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Level</th>
                        <th>Verified</th>
                        <th>Joined</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($users as $u): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($u['email']); ?></td>
                            <td><?php echo htmlspecialchars($u['full_name']); ?></td>
                            <td>
                                <form method="POST" style="display: flex; gap: 5px;">
                                    <input type="hidden" name="user_id" value="<?php echo $u['id']; ?>">
                                    <select name="level" onchange="this.form.submit()">
                                        <?php foreach (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as $level): ?>
                                            <option value="<?php echo $level; ?>" <?php echo $u['level'] === $level ? 'selected' : ''; ?>><?php echo $level; ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                    <input type="hidden" name="update_user" value="1">
                                </form>
                            </td>
                            <td><?php echo $u['verified'] ? '✓' : '✗'; ?></td>
                            <td><?php echo date('Y-m-d', strtotime($u['created_at'])); ?></td>
                            <td><?php echo $u['last_login'] ? date('Y-m-d H:i', strtotime($u['last_login'])) : 'Never'; ?></td>
                            <td>
                                <a href="/admin/users?action=delete&id=<?php echo $u['id']; ?>" class="action-btn delete-btn" onclick="return confirm('Delete this user?');">Delete</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>

            <?php if ($pages > 1): ?>
                <div class="pagination">
                    <?php for ($i = 1; $i <= $pages; $i++): ?>
                        <a href="/admin/users?page=<?php echo $i; ?><?php echo $filter_level ? '&level=' . $filter_level : ''; ?>" <?php echo $i === $page ? 'style="background: #ffc107; color: #000;"' : ''; ?>>
                            <?php echo $i; ?>
                        </a>
                    <?php endfor; ?>
                </div>
            <?php endif; ?>
        </main>
    </div>
</body>
</html>
<?php
?>
