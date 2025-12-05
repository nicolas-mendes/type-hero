<?php

$envPath = __DIR__ . '/../.env';
if (!file_exists($envPath)) die(json_encode(["status" => "erro", "msg" => ".env não encontrado"]));

$lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
$env = [];
foreach ($lines as $line) {
    if (strpos(trim($line), '#') === 0) continue;
    if (strpos($line, '=') !== false) {
        list($key, $value) = explode('=', $line, 2);
        $env[trim($key)] = trim($value);
    }
}

$keyReceived = $_GET['key'] ?? '';
$migrationKey = $env['MIGRATION_KEY'] ?? 'admin';

if ($keyReceived !== $migrationKey) {
    http_response_code(403);
    echo json_encode(["status" => "erro", "msg" => "Acesso Negado. Chave de migracao invalida."]);
    exit;
}

try {
    $host = $env['DB_HOST'] ?? 'localhost';
    $user = $env['DB_USERNAME'] ?? 'root';
    $pass = $env['DB_PASSWORD'] ?? '';

    $dsn = "mysql:host=$host;charset=utf8mb4";
    $options = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION];

    $pdo = new PDO(
        "$dsn",
        $user,
        $pass,
        $options
    );
} catch (PDOException $e) {
    die(json_encode(["status" => "erro", "msg" => "Falha ao conectar no MySQL: " . $e->getMessage()]));
}

$dbName = $env['DB_DATABASE'];

$sql = "
    CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    USE `$dbName`;

    SET FOREIGN_KEY_CHECKS = 0;

    CREATE TABLE IF NOT EXISTS `users` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `username` VARCHAR(50) NOT NULL UNIQUE,
        `password_hash` VARCHAR(255) NOT NULL,
        `icon_path` VARCHAR(255) DEFAULT 'icons/default_icon.png',
        `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS `user_sessions` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `user_id` INT NOT NULL,
        `token` VARCHAR(64) NOT NULL,
        `expires_at` DATETIME NOT NULL,
        `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS `monsters` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(50) NOT NULL,
        `sprite_key` VARCHAR(50) NOT NULL,
        `base_hp` INT NOT NULL,
        `damage` INT DEFAULT 10,
        `word_streak_attack` INT DEFAULT 3,
        `attack_time` INT DEFAULT 15
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS `worlds` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(50) NOT NULL,
        `order_index` INT NOT NULL,
        `bg_image` VARCHAR(100) NOT NULL
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS `levels` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `world_id` INT NOT NULL,
        `order_index` INT NOT NULL,
        `name` VARCHAR(50) NOT NULL,
        `boss_monster_id` INT NULL,
        FOREIGN KEY (`world_id`) REFERENCES `worlds`(`id`) ON DELETE CASCADE,
        FOREIGN KEY (`boss_monster_id`) REFERENCES `monsters`(`id`)
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS `level_enemies` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `level_id` INT NOT NULL,
        `monster_id` INT NOT NULL,
        `quantity` INT DEFAULT 1,
        FOREIGN KEY (`level_id`) REFERENCES `levels`(`id`) ON DELETE CASCADE,
        FOREIGN KEY (`monster_id`) REFERENCES `monsters`(`id`)
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS `leagues` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(100) NOT NULL,
        `password` VARCHAR(255) NULL,
        `owner_id` INT NULL,
        `is_default` BOOLEAN DEFAULT FALSE,
        `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS `league_members` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `league_id` INT NOT NULL,
        `user_id` INT NOT NULL,
        `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`league_id`) REFERENCES `leagues`(`id`) ON DELETE CASCADE,
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
        UNIQUE KEY `unique_membership` (`league_id`, `user_id`)
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS `active_runs` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `user_id` INT NOT NULL,
        `league_id` INT NOT NULL,
        `current_world_id` INT DEFAULT 1,
        `current_level_id` INT DEFAULT 1,
        `current_hp` INT DEFAULT 100, 
        `accumulated_score` INT DEFAULT 0, 
        `damage` INT DEFAULT 10,
        `attack_time` INT DEFAULT 15,
        `word_streak_attack` INT DEFAULT 5,
        `started_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
        `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
        FOREIGN KEY (`league_id`) REFERENCES `leagues`(`id`) ON DELETE CASCADE,
        UNIQUE KEY `unique_run` (`user_id`, `league_id`)
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS `run_history` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `user_id` INT NOT NULL,
        `league_id` INT NOT NULL,
        `max_world_reached` INT NOT NULL,
        `max_level_reached` INT NOT NULL,
        `total_score` INT NOT NULL,
        `total_time_seconds` INT NOT NULL,
        `accuracy` INT NOT NULL,
        `total_words` INT NOT NULL,
        `avg_wpm` INT NOT NULL,
        `played_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
        FOREIGN KEY (`league_id`) REFERENCES `leagues`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB;

    SET FOREIGN_KEY_CHECKS = 1;
";

try {
    $pdo->exec($sql);

    // Liga Padrão
    $pdo->exec("INSERT INTO leagues (name, is_default, owner_id) 
                SELECT 'Liga Geral', 1, NULL 
                WHERE NOT EXISTS (SELECT 1 FROM leagues WHERE is_default = 1)");

    echo json_encode(["status" => "sucesso", "msg" => "Banco de dados configurado e populado com sucesso!"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "erro", "msg" => "Erro SQL: " . $e->getMessage()]);
}
