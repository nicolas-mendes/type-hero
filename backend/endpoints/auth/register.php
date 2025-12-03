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

try {
    $pdo = getDatabaseConnection();

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (empty($data['user']) || empty($data['password']) || empty($data['password_confirm'])) {
        echo json_encode(["status" => "erro", "msg" => "Preencha todos os campos"]);
        exit;
    }

    if ($data['password'] !== $data['password_confirm']) {
        echo json_encode(["status" => "erro", "msg" => "As senhas não coincidem"]);
        exit;
    }

    $user = trim($data['user']);
    $password = $data['password'];

    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$user]);
    if ($stmt->fetch()) {
        echo json_encode(["status" => "erro", "msg" => "Usuário já existe"]);
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");
    $stmt->execute([$user, $hash]);

    $userId = $pdo->lastInsertId();

    $token = bin2hex(random_bytes(32));
    $expire = date('Y-m-d H:i:s', strtotime('+8 hours'));
    $cleanStmt = $pdo->prepare("DELETE FROM user_sessions WHERE user_id = ?");
    $cleanStmt->execute([$userId]);
    $stmtSession = $pdo->prepare("INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)");
    $stmtSession->execute([$userId, $token, $expire]);

    echo json_encode([
        "status" => "sucesso",
        "msg" => "Usuário criado e Logado!",
        "user_id" => $userId,
        "username" => $user,
        "token" => $token,
    ]);
} catch (PDOException $e) {
    echo json_encode(["status" => "erro", "msg" => "Erro ao registrar: " . $e->getMessage()]);
}
