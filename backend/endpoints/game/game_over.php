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
    $data = json_decode(file_get_contents('php://input'), true);
    
    // 1. Autenticação
    $userId = authenticateUser($pdo, $data['auth_token'] ?? null);
    if (!$userId) { 
        echo json_encode(["status" => "erro", "msg" => "Sessão inválida"]); 
        exit; 
    }

    $leagueId = $data['leagueId'];
    
    // Dados da partida atual (antes de morrer/desistir)
    $scoreInLevel = $data['score'] ?? 0;
    
    // Stats opcionais (se o front não mandar, salva 0 ou padrão)
    $wpm = $data['avg_wpm'] ?? 0;
    $acc = $data['accuracy'] ?? 0;
    $words = $data['total_words'] ?? 0;
    $time = $data['total_time'] ?? 0; // Tempo total da run ou da fase

    // 2. Busca dados da Run Ativa (Onde ele estava e quanto tinha acumulado)
    $stmtActive = $pdo->prepare("
        SELECT accumulated_score, current_world_id, current_level_id 
        FROM active_runs 
        WHERE user_id = ? AND league_id = ?
    ");
    $stmtActive->execute([$userId, $leagueId]);
    $activeRun = $stmtActive->fetch(PDO::FETCH_ASSOC);

    if ($activeRun) {
        // Calcula pontuação final (Acumulado das fases anteriores + o que fez agora)
        $finalScore = $activeRun['accumulated_score'] + $scoreInLevel;
        $maxWorld = $activeRun['current_world_id'];
        $maxLevel = $activeRun['current_level_id'];

        // 3. Salva no Histórico (Para Ranking)
        $stmtHist = $pdo->prepare("
            INSERT INTO run_history 
            (user_id, league_id, max_world_reached, max_level_reached, total_score, 
             total_time_seconds, accuracy, total_words, avg_wpm, played_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
            
        $stmtHist->execute([
            $userId, 
            $leagueId, 
            $maxWorld, 
            $maxLevel, 
            $finalScore, 
            $time, 
            $acc, 
            $words, 
            $wpm
        ]);

        // 4. MATA A RUN ATIVA (Reset do Roguelite)
        $pdo->prepare("DELETE FROM active_runs WHERE user_id = ? AND league_id = ?")->execute([$userId, $leagueId]);
        
        echo json_encode([
            "status" => "sucesso", 
            "msg" => "Run finalizada.", 
            "final_score" => $finalScore
        ]);

    } else {
        echo json_encode(["status" => "erro", "msg" => "Nenhuma run ativa encontrada para finalizar."]);
    }

} catch (Exception $e) {
    echo json_encode(["status" => "erro", "msg" => "Erro no servidor: " . $e->getMessage()]);
}
?>