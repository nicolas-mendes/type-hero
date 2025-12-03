<?php
require_once __DIR__ . '/../db_connect.php';
require_once __DIR__ . '/token_check.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$json = file_get_contents('php://input');
$dados = json_decode($json, true);
$token = $dados['auth_token'] ?? null;

$pdo = getDatabaseConnection();

$userId = authenticateUser($pdo, $token);

if ($userId) {
    $stmt = $pdo->prepare("SELECT username FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    echo json_encode(["status" => "sucesso", "user_id" => $userId, "nome" => $user['username']]);
} else {
    echo json_encode(["status" => "erro", "msg" => "Sessão inválida"]);
}
