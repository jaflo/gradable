<?php

error_reporting(E_ALL);
ini_set("display_errors", 1);

$gradable_folder = "./gradable/";
$token_file = $gradable_folder . "token.txt";

unlink($token_file);
rmdir($gradable_folder);

if (file_exists($token_file)) {
	echo "Failed to reset";
} else {
	echo "Reset successfully";
}
