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
    
    // 1. Receber Dados
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    // 2. Autenticação
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
    $inputPassword = $data['attemptPassword'] ?? null; // Pode vir vazio se for pública

    // 3. Buscar informações da Liga (para checar senha)
    // Buscamos 'password_hash' para ver se é NULL (pública) ou tem hash (privada)
    $stmt = $pdo->prepare("SELECT id, password FROM leagues WHERE id = ?");
    $stmt->execute([$leagueId]);
    $league = $stmt->fetch();

    if (!$league) {
        echo json_encode(["status" => "erro", "msg" => "Liga não encontrada"]);
        exit;
    }

    // 4. Verificação de Senha
    // Se 'password_hash' no banco NÃO for NULL, a liga é privada
    if (!empty($league['password'])) {
        // Se a liga é privada, o usuário TEM que enviar senha
        if (empty($inputPassword)) {
            echo json_encode(["status" => "erro", "msg" => "Esta liga requer senha"]);
            exit;
        }
        // Verifica se a senha bate com o hash
        if (!password_verify($inputPassword, $league['password'])) {
            echo json_encode(["status" => "erro", "msg" => "Senha incorreta"]);
            exit;
        }
    }

    // 5. Verifica se já é membro (Evitar duplicidade e erro SQL)
    $checkMember = $pdo->prepare("SELECT id FROM league_members WHERE league_id = ? AND user_id = ?");
    $checkMember->execute([$leagueId, $userId]);
    if ($checkMember->fetch()) {
        echo json_encode(["status" => "erro", "msg" => "Você já participa desta liga"]);
        exit;
    }

    // 6. Transação de Entrada (Vincular + Inicializar Run)
    $pdo->beginTransaction();

    try {
        // A. Adiciona na tabela de membros
        $stmtJoin = $pdo->prepare("INSERT INTO league_members (league_id, user_id) VALUES (?, ?)");
        $stmtJoin->execute([$leagueId, $userId]);

        // B. Inicializa a Run Ativa (Obrigatório para o jogo funcionar)
        // Se ele já tiver uma run antiga (de ter entrado e saído), usamos REPLACE ou INSERT IGNORE
        // Aqui vou usar INSERT padrão, pois ele acabou de entrar.
        $stmtRun = $pdo->prepare("INSERT INTO active_runs (user_id, league_id, current_world_id, current_level_id, current_hp) VALUES (?, ?, 1, 1, 100)");
        $stmtRun->execute([$userId, $leagueId]);

        $pdo->commit();

        echo json_encode([
            "status" => "sucesso", 
            "msg" => "Você entrou na liga com sucesso!"
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }

} catch (Exception $e) {
    echo json_encode(["status" => "erro", "msg" => "Erro ao entrar na liga: " . $e->getMessage()]);
}
