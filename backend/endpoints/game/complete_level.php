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
    $data = json_decode(file_get_contents('php://input'), true);
    $userId = authenticateUser($pdo, $data['auth_token'] ?? null);

    if (!$userId) {
        echo json_encode(["status" => "erro", "msg" => "Sessão inválida"]);
        exit;
    }

    $leagueId = $data['leagueId'];
    $currentLevelId = $data['levelId'];
    $hpCurrent = $data['hp'] ?? 0;
    $totalScoreAcc = $data['totalScoreAcc'] ?? 0;
    $scoreGained = $data['score'] ?? 0;
    $newDamage = $data['damage'] ?? 10;
    $newTime = $data['playerAttackTime'] ?? 15;
    $newStreak = $data['playerAttackWord'] ?? 5;

    $stmtCur = $pdo->prepare("SELECT l.order_index, l.world_id, w.order_index as world_order 
                              FROM levels l JOIN worlds w ON l.world_id = w.id WHERE l.id = ?");
    $stmtCur->execute([$currentLevelId]);
    $currentData = $stmtCur->fetch();

    if (!$currentData) throw new Exception("Nível atual inválido");

    $sqlNext = "SELECT l.id, l.world_id, l.name, l.boss_monster_id 
                FROM levels l 
                WHERE l.world_id = ? AND l.order_index > ? 
                ORDER BY l.order_index ASC LIMIT 1";
    $stmtNext = $pdo->prepare($sqlNext);
    $stmtNext->execute([$currentData['world_id'], $currentData['order_index']]);
    $nextLevel = $stmtNext->fetch(PDO::FETCH_ASSOC);

    if (!$nextLevel) {
        $sqlNextWorld = "SELECT l.id, l.world_id, l.name, l.boss_monster_id 
                         FROM levels l 
                         JOIN worlds w ON l.world_id = w.id 
                         WHERE w.order_index > ? 
                         ORDER BY w.order_index ASC, l.order_index ASC LIMIT 1";
        $stmtNextW = $pdo->prepare($sqlNextWorld);
        $stmtNextW->execute([$currentData['world_order']]);
        $nextLevel = $stmtNextW->fetch(PDO::FETCH_ASSOC);
    }

    if ($nextLevel) {
        $stmtUpd = $pdo->prepare("UPDATE active_runs SET 
            current_world_id = ?, 
            current_level_id = ?, 
            current_hp = ?, 
            accumulated_score = accumulated_score + ?,
            damage = ?,
            attack_time = ?,
            word_streak_attack = ?,
            updated_at = NOW()
            WHERE user_id = ? AND league_id = ?");

        $stmtUpd->execute([
            $nextLevel['world_id'],
            $nextLevel['id'],
            $hpCurrent,
            $scoreGained,
            $newDamage,
            $newTime,
            $newStreak,
            $userId,
            $leagueId
        ]);

        echo json_encode([
            "status" => "proxima_fase",
            "next_level_data" => [
                "world_id" => $nextLevel['world_id'],
                "level_id" => $nextLevel['id'],
                "level_name" => $nextLevel['name'],
                "hp" => $hpCurrent,
                "score" => $totalScoreAcc + $scoreGained,
                "boss_id" => $nextLevel['boss_monster_id'],
                "player_stats" => [
                    "hp" => $hpCurrent,
                    "damage" => $newDamage,
                    "playerAttackTime" => $newTime,
                    "playerAttackWord" => $newStreak
                ]
            ]
        ]);
    } else {
        $finalScore = $totalScoreAcc + $scoreGained;
        $wpm = $data['avg_wpm'] ?? 0;
        $acc = $data['accuracy'] ?? 0;
        $words = $data['total_words'] ?? 0;
        $time = $data['total_time'] ?? 0;

        $stmtHist = $pdo->prepare("INSERT INTO run_history 
            (user_id, league_id, max_world_reached, max_level_reached, total_score, 
             total_time_seconds, accuracy, total_words, avg_wpm, played_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");

        $stmtHist->execute([
            $userId,
            $leagueId,
            $currentData['world_id'],
            $currentLevelId,
            $finalScore,
            $time,
            $acc,
            $words,
            $wpm
        ]);

        $pdo->prepare("DELETE FROM active_runs WHERE user_id = ? AND league_id = ?")->execute([$userId, $leagueId]);
        echo json_encode(["status" => "vitoria_total", "msg" => "Parabéns! Você completou a liga."]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "erro", "msg" => $e->getMessage()]);
}
