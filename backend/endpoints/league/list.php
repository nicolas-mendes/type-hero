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

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    $page = isset($data['page']) ? (int)$data['page'] : 1;
    $search = isset($data['search']) ? trim($data['search']) : '';
    $limit = 5;
    $offset = ($page - 1) * $limit;

    $sqlCount = "SELECT COUNT(*) FROM leagues WHERE name LIKE :search";
    $stmtCount = $pdo->prepare($sqlCount);
    $stmtCount->bindValue(':search', "%$search%", PDO::PARAM_STR);
    $stmtCount->execute();

    $totalRecords = $stmtCount->fetchColumn();
    $totalPages = ceil($totalRecords / $limit);
    if ($totalPages < 1) $totalPages = 1;

    $sql = "SELECT l.id, l.name, l.is_default, u.username as owner,
            (SELECT COUNT(*) FROM league_members WHERE league_id = l.id) as member_count
            FROM leagues l
            LEFT JOIN users u ON l.owner_id = u.id
            WHERE l.name LIKE :search
            ORDER BY l.created_at
            LIMIT :limit OFFSET :offset";

    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':search', "%$search%", PDO::PARAM_STR);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $leagues = $stmt->fetchAll();

    echo json_encode([
        "status" => "sucesso",
        "data" => $leagues,
        "page" => $page,
        "search" => $search,
        "total_pages" => $totalPages
    ]);
} catch (Exception $e) {
    echo json_encode(["status" => "erro", "msg" => $e->getMessage()]);
}
