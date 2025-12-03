<?php
require_once __DIR__ . '/../db_connect.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "erro", "msg" => "Método não permitido"]);
    exit;
}

$pdo = getDatabaseConnection();

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!isset($data['user']) || !isset($data['password'])) {
    echo json_encode(["status" => "erro", "msg" => "Usuário e password são obrigatórios"]);
    exit;
}

$user = trim($data['user']);
$password = $data['password'];


try {
    $stmt = $pdo->prepare("SELECT id, username, password_hash FROM users WHERE username = ?");
    $stmt->execute([$user]);

    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {

        $token = bin2hex(random_bytes(32));
        $expire = date('Y-m-d H:i:s', strtotime('+8 hours'));

        $cleanStmt = $pdo->prepare("DELETE FROM user_sessions WHERE user_id = ?");
        $cleanStmt->execute([$user['id']]);
        $stmtSession = $pdo->prepare("INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)");
        $stmtSession->execute([$user['id'], $token, $expire]);

        echo json_encode([
            "status" => "sucesso",
            "msg" => "Login realizado",
            "user_id" => $user['id'],
            "username" => $user['username'],
            "token" => $token
        ]);
    } else {
        echo json_encode(["status" => "erro", "msg" => "Credenciais inválidas"]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "erro", "msg" => "Erro interno no servidor"]);
}
