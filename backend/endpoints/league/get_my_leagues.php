<?php
require_once __DIR__ . '/../db_connect.php';
require_once __DIR__ . '/../auth/token_check.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "erro", "msg" => "Método inválido"]);
    exit;
}

try {
    $pdo = getDatabaseConnection();
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $userId = authenticateUser($pdo, $data['auth_token'] ?? null);
    if (!$userId) {
        http_response_code(401);
        echo json_encode(["status" => "erro", "msg" => "Sessão expirada"]);
        exit;
    }

    $sql = "SELECT l.id, l.name 
            FROM leagues l
            JOIN league_members lm ON l.id = lm.league_id
            WHERE lm.user_id = ?
            ORDER BY l.is_default DESC, lm.joined_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId]);
    $leagues = $stmt->fetchAll();

    echo json_encode(["status" => "sucesso", "data" => $leagues]);
} catch (Exception $e) {
    echo json_encode(["status" => "erro", "msg" => $e->getMessage()]);
}
