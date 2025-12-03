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
        echo json_encode(["status" => "erro", "msg" => "Sessão inválida"]);
        exit;
    }

    if (empty($data['leagueId'])) {
        echo json_encode(["status" => "erro", "msg" => "ID da liga não informado"]);
        exit;
    }
    $leagueId = $data['leagueId'];

    $sql = "SELECT u.id, u.username, lm.joined_at 
        FROM league_members lm
        JOIN users u ON lm.user_id = u.id
        WHERE lm.league_id = ?
        ORDER BY lm.joined_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$leagueId]);

    $members = $stmt->fetchAll();

    echo json_encode([
        "status" => "sucesso",
        "data" => $members
    ]);
} catch (Exception $e) {
    echo json_encode(["status" => "erro", "msg" => $e->getMessage()]);
}
