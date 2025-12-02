<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// -------------------------------------------------------------------------

try {
    $pdo = new PDO("mysql:host=DB_HOST;dbname=DB_DATABASE;charset=utf8", "DB_USERNAME", "DB_PASSWORD");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $json = file_get_contents('php://input');
    $dados = json_decode($json, true);

    if (isset($dados['usuario']) && isset($dados['senha'])) {
        $usuario=$dados['usuario'];
        $senha=$dados['senha'];
        $stmt = $pdo->prepare("SELECT * FROM Usuario 
        WHERE nomeuse = ?");
        $stmt->execute([$usuario]);
        $datausuario = $stmt->fetch(PDO::FETCH_ASSOC);
        $senha_hash_db = $datausuario['senha_hash']; 

    if (password_verify($senha, $senha_hash_db)) {
        unset($datausuario['senha_hash']);
        echo json_encode(["status" => "sucesso", "msg" => "Salvo ID: " . $pdo->lastInsertId()]);
    } else {
        echo json_encode(["status" => "erro", "msg" => "Dados inválidos ou JSON malformado"]);
    }
    
}} catch (PDOException $e) {
    http_response_code(500); 
    echo json_encode(["status" => "erro_sql", "msg" => $e->getMessage()]);
}
?>