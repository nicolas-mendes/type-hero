<?php

function getDatabaseConnection() {
    $envPath = __DIR__ . '/../.env'; 

    if (!file_exists($envPath)) {
        die(json_encode(["status" => "erro", "msg" => "Arquivo .env não encontrado"]));
    }

    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $env = [];
    
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;

        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $env[trim($key)] = trim($value);
        }
    }

    try {
        $host = $env['DB_HOST'] ?? 'localhost';
        $db   = $env['DB_DATABASE'] ?? 'type-hero';
        $user = $env['DB_USERNAME'] ?? 'root';
        $pass = $env['DB_PASSWORD'] ?? '';
        
        $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        return new PDO($dsn, $user, $pass, $options);

    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "erro", "msg" => "Erro Conexão: " . $e->getMessage()]);
        exit;
    }
}
