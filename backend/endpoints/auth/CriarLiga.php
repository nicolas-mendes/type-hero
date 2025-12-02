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

    if (isset($dados['nomeLiga']) && isset($dados['palavraLiga']) && isset($dados['id'])) {
        $nome=$dados['nomeLiga'];
        $palavra=$dados['palavraLiga'];
        $id=$dados['id'];
        $stmt = $pdo->prepare("INSERT INTO Liga (nome , palavraChave, criador) Values (?,?,?)");
        $stmt->execute([$nome, $palavra, $id]);
        echo json_encode(["status" => "sucesso", "msg" => "Salvo ID: " . $pdo->lastInsertId()]);

        
    }else{echo json_encode(["status" => "erro", "msg" => "Dados inválidos ou JSON malformado"]);}
    
}   catch (PDOException $e) {
    http_response_code(500); 
    echo json_encode(["status" => "erro_sql", "msg" => $e->getMessage()]);
}
?>