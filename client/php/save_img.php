<?php

$imgDir = 'img_bank/';
is_dir( $imgDir ) ? true: mkdir( $imgDir );
$data = $_POST[ 'imgBase64' ];
$data = str_replace('data:image/png;base64,', '', $data);
$data = str_replace(' ', '+', $data );
$img = base64_decode( $data );
$file = $imgDir . uniqid() . '.png';
$success = file_put_contents( $file, $img );
print !($success === false) ? $file : false;

?>