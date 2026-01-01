<?php
/**
 * Z2B Legacy Builders - Authentication API Endpoint
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../includes/Auth.php';

$auth = new Auth();
$action = $_GET['action'] ?? '';
$response = ['success' => false, 'message' => 'Invalid action'];

switch ($action) {
    case 'login':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $username = $_POST['username'] ?? '';
            $password = $_POST['password'] ?? '';
            $response = $auth->login($username, $password);
        }
        break;

    case 'admin_login':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $_SESSION['admin_access_attempt'] = true; // Enable admin access
            $username = $_POST['admin_username'] ?? '';
            $password = $_POST['admin_password'] ?? '';
            $response = $auth->adminLogin($username, $password);
        }
        break;

    case 'register':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = [
                'username' => $_POST['username'] ?? '',
                'email' => $_POST['email'] ?? '',
                'password' => $_POST['password'] ?? '',
                'first_name' => $_POST['first_name'] ?? '',
                'last_name' => $_POST['last_name'] ?? '',
                'tier' => $_POST['tier'] ?? '',
                'sponsor_code' => $_POST['sponsor_code'] ?? '',
                'phone' => $_POST['phone'] ?? '',
                'whatsapp' => $_POST['whatsapp'] ?? '',
                'country' => $_POST['country'] ?? 'South Africa',
                'city' => $_POST['city'] ?? ''
            ];
            $response = $auth->register($data);
        }
        break;

    case 'logout':
        $response = $auth->logout();
        break;

    case 'check':
        $response = [
            'success' => true,
            'logged_in' => $auth->isLoggedIn(),
            'is_admin' => $auth->isAdmin(),
            'user' => $auth->getCurrentUser()
        ];
        break;

    default:
        $response = ['success' => false, 'message' => 'Unknown action'];
}

echo json_encode($response);