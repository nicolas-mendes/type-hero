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

    if (empty($data['leagueId']) || empty($data['targetUserId'])) {
        echo json_encode(["status" => "erro", "msg" => "Dados incompletos"]);
        exit;
    }

    $leagueId = $data['leagueId'];
    $targetId = $data['targetUserId'];

    $stmt = $pdo->prepare("SELECT owner_id FROM leagues WHERE id = ?");
    $stmt->execute([$leagueId]);
    $league = $stmt->fetch();

    if (!$league) {
        echo json_encode(["status" => "erro", "msg" => "Liga não encontrada"]);
        exit;
    }

    if ($league['owner_id'] != $userId) {
        echo json_encode(["status" => "erro", "msg" => "Permissão negada. Apenas o dono pode expulsar."]);
        exit;
    }

    if ($targetId == $userId) {
        echo json_encode(["status" => "erro", "msg" => "Você não pode se expulsar da própria liga."]);
        exit;
    }

    $pdo->beginTransaction();

    try {
        $stmtKick = $pdo->prepare("DELETE FROM league_members WHERE league_id = ? AND user_id = ?");
        $stmtKick->execute([$leagueId, $targetId]);

        $stmtReset = $pdo->prepare("DELETE FROM active_runs WHERE league_id = ? AND user_id = ?");
        $stmtReset->execute([$leagueId, $targetId]);

        $pdo->commit();

        echo json_encode(["status" => "sucesso", "msg" => "Membro expulso."]);
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
} catch (Exception $e) {
    echo json_encode(["status" => "erro", "msg" => "Erro no servidor: " . $e->getMessage()]);
}
