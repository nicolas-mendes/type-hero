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
        echo json_encode(["status" => "erro", "msg" => "ID da liga é obrigatório"]);
        exit;
    }

    $leagueId = (int)$data['leagueId'];

    if ($leagueId == 1) {
        echo json_encode(["status" => "erro", "msg" => "Você não pode sair da Liga Geral."]);
        exit;
    }

    $stmtOwner = $pdo->prepare("SELECT owner_id FROM leagues WHERE id = ?");
    $stmtOwner->execute([$leagueId]);
    $league = $stmtOwner->fetch();

    if ($league && $league['owner_id'] == $userId) {
        echo json_encode(["status" => "erro", "msg" => "O dono não pode sair da liga. Vá em 'Gerenciar' para excluir a liga."]);
        exit;
    }

    $pdo->beginTransaction();

    try {
        $stmtMember = $pdo->prepare("DELETE FROM league_members WHERE league_id = ? AND user_id = ?");
        $stmtMember->execute([$leagueId, $userId]);

        $stmtRun = $pdo->prepare("DELETE FROM active_runs WHERE league_id = ? AND user_id = ?");
        $stmtRun->execute([$leagueId, $userId]);

        $pdo->commit();

        echo json_encode(["status" => "sucesso", "msg" => "Você saiu da liga."]);
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
} catch (Exception $e) {
    echo json_encode(["status" => "erro", "msg" => "Erro ao sair: " . $e->getMessage()]);
}
