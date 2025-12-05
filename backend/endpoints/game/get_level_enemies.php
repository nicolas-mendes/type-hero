<?php
require_once __DIR__ . '/../db_connect.php';
require_once __DIR__ . '/../auth/token_check.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

try {
    $pdo = getDatabaseConnection();
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Autenticação básica
    if (!authenticateUser($pdo, $data['auth_token'] ?? null)) {
        echo json_encode(["status" => "erro", "msg" => "Auth inválida"]);
        exit;
    }

    $levelId = $data['levelId'];

    $sql = "SELECT m.name, m.sprite_key, m.base_hp, m.damage, 
            m.word_streak_attack as enemyAttackWord, m.attack_time as enemyAttackTime,
            le.quantity
            FROM level_enemies le
            JOIN monsters m ON le.monster_id = m.id
            WHERE le.level_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$levelId]);
    $enemies = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "sucesso", "enemies" => $enemies]);

} catch (Exception $e) {
    echo json_encode(["status" => "erro", "msg" => $e->getMessage()]);
}
