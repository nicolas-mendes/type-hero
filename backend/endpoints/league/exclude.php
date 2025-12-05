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

    if (empty($data['leagueId'])) {
        echo json_encode(["status" => "erro", "msg" => "ID da liga inválido"]);
        exit;
    }
    $leagueId = $data['leagueId'];

    $stmt = $pdo->prepare("SELECT owner_id, is_default FROM leagues WHERE id = ?");
    $stmt->execute([$leagueId]);
    $league = $stmt->fetch();

    if (!$league) {
        echo json_encode(["status" => "erro", "msg" => "Liga não encontrada"]);
        exit;
    }

    if ($league['owner_id'] != $userId) {
        http_response_code(403);
        echo json_encode(["status" => "erro", "msg" => "Apenas o dono pode excluir a liga."]);
        exit;
    }

    if ($league['is_default'] == 1) {
        http_response_code(403);
        echo json_encode(["status" => "erro", "msg" => "A Liga Geral do sistema não pode ser excluída."]);
        exit;
    }

    $pdo->prepare("DELETE FROM leagues WHERE id = ?")->execute([$leagueId]);

    echo json_encode(["status" => "sucesso", "msg" => "Liga excluída permanentemente."]);
} catch (Exception $e) {
    echo json_encode(["status" => "erro", "msg" => "Erro ao excluir: " . $e->getMessage()]);
}
