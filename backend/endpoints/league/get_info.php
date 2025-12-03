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

try {
    $pdo = getDatabaseConnection();

    // Ler JSON
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    // Autenticação
    $userId = authenticateUser($pdo, $data['auth_token'] ?? null);
    if (!$userId) {
        echo json_encode(["status" => "erro", "msg" => "Sessão inválida"]);
        exit;
    }

    $leagueId = $data['leagueId'] ?? 1;

    $sql = "SELECT l.id, l.name, l.owner_id, u.username as owner_name, l.created_at, l.password,
            (SELECT COUNT(*) FROM league_members WHERE league_id = l.id) as member_count
            FROM leagues l
            LEFT JOIN users u ON l.owner_id = u.id
            WHERE l.id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$leagueId]);
    $league = $stmt->fetch();

    if (!$league) {
        echo json_encode(["status" => "erro", "msg" => "Liga não encontrada"]);
        exit;
    }

    $isMember = false;
    $checkMember = $pdo->prepare("SELECT 1 FROM league_members WHERE league_id = ? AND user_id = ?");
    $checkMember->execute([$leagueId, $userId]);
    if ($checkMember->fetch()) {
        $isMember = true;
    }

    $isOwner = ($league['owner_id'] == $userId);
    $filter = $data['rankFilter'] ?? 'all_time';

    $sqlRank = "SELECT u.username, MAX(m.total_score) as total_score
                FROM run_history m
                JOIN users u ON m.user_id = u.id
                WHERE m.league_id = ?";
    if ($filter === 'weekly') {
        $sqlRank .= " AND m.played_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)";
    }
    $sqlRank .= " GROUP BY m.user_id ORDER BY total_score DESC LIMIT 50";

    $stmtRank = $pdo->prepare($sqlRank);
    $stmtRank->execute([$leagueId]);
    $ranking = $stmtRank->fetchAll();

    $responseInfo = $league;
    $responseInfo['is_private'] = !empty($league['password']);
    unset($responseInfo['password']);

    echo json_encode([
        "status" => "sucesso",
        "data" => [
            "info" => $responseInfo,
            "user_relation" => [
                "is_member" => $isMember,
                "is_owner" => $isOwner
            ],
            "ranking_preview" => $ranking,
            "filter_applied" => $filter
        ]
    ]);
} catch (Exception $e) {
    echo json_encode(["status" => "erro", "msg" => $e->getMessage()]);
}
