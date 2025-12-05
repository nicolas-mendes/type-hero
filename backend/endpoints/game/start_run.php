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
    $data = json_decode(file_get_contents('php://input'), true);
    $userId = authenticateUser($pdo, $data['auth_token'] ?? null);

    if (!$userId) {
        echo json_encode(["status" => "erro", "msg" => "Sessão inválida"]);
        exit;
    }

    $leagueId = $data['leagueId'];

    if ($data['isNew']) {
        $action = 'new';
    } else {
        $action = 'continue';
    }

    if ($action === 'continue') {
        $stmt = $pdo->prepare("SELECT ar.*, l.name as level_name, l.boss_monster_id, w.name as world_name
                               FROM active_runs ar
                               JOIN levels l ON ar.current_level_id = l.id
                               JOIN worlds w ON l.world_id = w.id
                               WHERE ar.user_id = ? AND ar.league_id = ?");
        $stmt->execute([$userId, $leagueId]);
        $run = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "status" => "sucesso",
            "level_data" => [
                "world_id" => $run['current_world_id'],
                "level_id" => $run['current_level_id'],
                "hp" => $run['current_hp'],
                "score" => $run['accumulated_score'],
                "level_name" => $run['level_name'],
                "boss_id" => $run['boss_monster_id'],
                "player_stats" => [
                    "hp" => $run['current_hp'],
                    "damage" => $run['damage'],
                    "playerAttackTime" => $run['attack_time'],
                    "playerAttackWord" => $run['word_streak_attack']
                ]
            ]
        ]);
        exit;
    }

    if ($action === 'new') {
        $pdo->prepare("DELETE FROM active_runs WHERE user_id = ? AND league_id = ?")->execute([$userId, $leagueId]);
        $stmtFirst = $pdo->query("
            SELECT l.id, l.world_id, l.name, l.boss_monster_id 
            FROM levels l 
            JOIN worlds w ON l.world_id = w.id 
            ORDER BY w.order_index ASC, l.order_index ASC 
            LIMIT 1
        ");
        $firstLevel = $stmtFirst->fetch(PDO::FETCH_ASSOC);

        if (!$firstLevel) {
            echo json_encode(["status" => "erro", "msg" => "Nenhum nível configurado no jogo."]);
            exit;
        }

        $stmtInsert = $pdo->prepare("INSERT INTO active_runs 
            (user_id, league_id, current_world_id, current_level_id, current_hp, accumulated_score, damage, attack_time, word_streak_attack) 
            VALUES (?, ?, ?, ?, 100, 0, 10, 15, 5)
            ");

        $stmtInsert->execute([$userId, $leagueId, $firstLevel['world_id'], $firstLevel['id']]);

        echo json_encode([
            "status" => "sucesso",
            "level_data" => [
                "world_id" => $firstLevel['world_id'],
                "level_id" => $firstLevel['id'],
                "level_name" => $firstLevel['name'],
                "boss_id" => $firstLevel['boss_monster_id'],
                "player_stats" => [
                    "hp" => 100,
                    "damage" => 10,
                    "playerAttackTime" => 15,
                    "playerAttackWord" => 5
                ]
            ]
        ]);
        exit;
    }
} catch (Exception $e) {
    echo json_encode(["status" => "erro", "msg" => $e->getMessage()]);
}
