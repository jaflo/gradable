<?php

error_reporting(E_ALL);
ini_set("display_errors", 1);

$gradable_folder = "./gradable/";

foreach (glob($gradable_folder . '/{,.}*', GLOB_BRACE) as $file) {
	unlink($file);
}
rmdir($gradable_folder);

if (file_exists($gradable_folder)) {
	echo "Failed to reset";
} else {
	echo "Reset successfully";
}
