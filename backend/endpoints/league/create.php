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

    if (empty($data['league_name'])) {
        echo json_encode(["status" => "erro", "msg" => "Nome da liga é obrigatório"]);
        exit;
    }

    $league_name = trim($data['league_name']);
    $league_pass = !empty($data['league_password']) ? $data['league_password'] : null;
    $league_passHash = $league_pass ? password_hash($league_pass, PASSWORD_DEFAULT) : null;

    $stmt = $pdo->prepare("SELECT id FROM leagues WHERE name = ?");
    $stmt->execute([$league_name]);
    if ($stmt->fetch()) {
        echo json_encode(["status" => "erro", "msg" => "Liga já existe"]);
        exit;
    }

    $pdo->beginTransaction();

    try {
        $stmt = $pdo->prepare("INSERT INTO leagues (name, password, owner_id) VALUES (?, ?, ?)");
        $stmt->execute([$league_name, $league_passHash, $userId]);
        $newLeagueId = $pdo->lastInsertId();

        $stmtMember = $pdo->prepare("INSERT INTO league_members (league_id, user_id) VALUES (?, ?)");
        $stmtMember->execute([$newLeagueId, $userId]);

        $stmtProg = $pdo->prepare("INSERT INTO active_runs (user_id, league_id) VALUES (?, ?)");
        $stmtProg->execute([$userId, $newLeagueId]);

        $pdo->commit();

        echo json_encode([
            "status" => "sucesso",
            "msg" => "Liga criada com sucesso!",
            "league_id" => $newLeagueId
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
} catch (Exception $e) {
    echo json_encode(["status" => "erro", "msg" => "Erro ao criar liga: " . $e->getMessage()]);
}
