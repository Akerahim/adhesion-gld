<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

// ── Token sécurisé côté serveur ──
$AT_TOKEN = "patHlU3Eo0wAWFnTy.342367a8b0c16b369383297aa6035fbe4454dd0fedb027be20565a4e85a655d5";
$AT_BASE  = "appmgf5OnBCK2rjHB";
$AT_TABLE = "Membres";

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['records'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Données invalides']);
    exit;
}

$url = "https://api.airtable.com/v0/" . $AT_BASE . "/" . rawurlencode($AT_TABLE);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => [
        "Authorization: Bearer " . $AT_TOKEN,
        "Content-Type: application/json"
    ],
    CURLOPT_POSTFIELDS     => json_encode($input),
    CURLOPT_TIMEOUT        => 15
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($httpCode);
echo $response;
