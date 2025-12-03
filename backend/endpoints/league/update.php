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

    // 3. Validação Básica
    if (empty($data['leagueId'])) {
        echo json_encode(["status" => "erro", "msg" => "ID da liga ausente"]);
        exit;
    }

    if (empty($data['name']) || trim($data['name']) === '') {
        echo json_encode(["status" => "erro", "msg" => "O nome da liga não pode ser vazio"]);
        exit;
    }

    $leagueId = $data['leagueId'];
    $newName = trim($data['name']);

    $stmt = $pdo->prepare("SELECT owner_id FROM leagues WHERE id = ?");
    $stmt->execute([$leagueId]);
    $league = $stmt->fetch();

    if (!$league) {
        echo json_encode(["status" => "erro", "msg" => "Liga não encontrada"]);
        exit;
    }

    if ($league['owner_id'] != $userId) {
        http_response_code(403);
        echo json_encode(["status" => "erro", "msg" => "Permissão negada. Apenas o dono pode editar."]);
        exit;
    }

    $sql = "UPDATE leagues SET name = ?";
    $params = [$newName];

    if (!empty($data['password'])) {
        $sql .= ", password = ?"; 
        $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
    }

    $sql .= " WHERE id = ?";
    $params[] = $leagueId;

    $stmtUpdate = $pdo->prepare($sql);
    $stmtUpdate->execute($params);

    echo json_encode([
        "status" => "sucesso", 
        "msg" => "Liga atualizada com sucesso!"
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "erro", "msg" => "Erro ao atualizar: " . $e->getMessage()]);
}
?>