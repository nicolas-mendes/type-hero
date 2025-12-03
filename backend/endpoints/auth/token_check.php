<?php

function authenticateUser($pdo, $token) {
    if (!$token) return false;

    $stmt = $pdo->prepare("SELECT user_id, expires_at FROM user_sessions WHERE token = ?");
    $stmt->execute([$token]);
    $session = $stmt->fetch();

    if ($session && strtotime($session['expires_at']) > time()) {
        return $session['user_id'];
    }

    return false;
}
