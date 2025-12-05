<?php
require_once __DIR__ . '/../db_connect.php';
require_once __DIR__ . '/../auth/token_check.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
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

    $leagueId = $data['leagueId'] ?? 1;

    $stmtBest = $pdo->prepare("SELECT max_world_reached, max_level_reached, total_score FROM run_history WHERE user_id = ? AND league_id = ? ORDER BY total_score DESC LIMIT 1");
    $stmtBest->execute([$userId, $leagueId]);
    $bestRun = $stmtBest->fetch(PDO::FETCH_ASSOC);

    $stmtLast = $pdo->prepare("SELECT max_world_reached, max_level_reached, total_score FROM run_history WHERE user_id = ? AND league_id = ? ORDER BY played_at DESC LIMIT 1");
    $stmtLast->execute([$userId, $leagueId]);
    $lastRun = $stmtLast->fetch(PDO::FETCH_ASSOC);

    $stmtActive = $pdo->prepare("SELECT current_world_id, current_level_id FROM active_runs WHERE user_id = ? AND league_id = ?");
    $stmtActive->execute([$userId, $leagueId]);
    $activeRun = $stmtActive->fetch(PDO::FETCH_ASSOC);

    $worlds = [];
    $stmtWorlds = $pdo->query("SELECT id, name, order_index FROM worlds ORDER BY order_index ASC");
    while ($w = $stmtWorlds->fetch(PDO::FETCH_ASSOC)) {
        $stmtLevels = $pdo->prepare("SELECT id, name, order_index, boss_monster_id FROM levels WHERE world_id = ? ORDER BY order_index ASC");
        $stmtLevels->execute([$w['id']]);
        $w['levels'] = $stmtLevels->fetchAll(PDO::FETCH_ASSOC);
        $worlds[] = $w;
    }

    echo json_encode([
        "status" => "sucesso",
        "data" => [
            "stats" => [
                "best" => $bestRun,
                "last" => $lastRun,
                "active" => $activeRun
            ],
            "map_structure" => $worlds
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "erro", "msg" => $e->getMessage()]);
}