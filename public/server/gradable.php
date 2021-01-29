<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

$SERVER_VERSION = 1; // match with MIN_SERVER_VERSION in server.ts
$gradable_folder = "./gradable/";
$token_file = $gradable_folder . "token.txt";

if (!is_file($token_file)) {
	if (!file_exists($gradable_folder)) {
		mkdir($gradable_folder, 0700, true);
	}

	$token = bin2hex(random_bytes(10));
	file_put_contents($token_file, $token);
	chmod($token_file, 0700);

	if (file_get_contents($token_file) === $token) {
		file_put_contents($gradable_folder . ".htaccess", "order deny,allow\ndeny from all");

		echo "<h1>Save this token</h1>";
		echo "You will not see this again! Copy this token and paste it where prompted: ";
		echo $token;
	} else {
		echo "<h1>Permission issue</h1>";
		echo "Token could not be saved. You might need to <code>chmod 700 ~/public_html</code> ";
		echo "<a href=''>retry</a>";
	}

	die();
}

header("Content-type: application/json");

if ($_POST["token"] != file_get_contents($token_file)) {
	echo json_encode(array(
		"success" => false,
		"status" => "unauthorized",
		"message" => "delete " . $token_file . " to regenerate"
	));
	die();
}

if (isset($_POST["ping"])) {
	echo json_encode(array(
		"success" => true,
		"status" => "pong"
	));
	die();
}

if (isset($_POST["version"])) {
	echo json_encode(array(
		"success" => true,
		"version" => $SERVER_VERSION
	));
	die();
}

if (isset($_POST["remove"])) {
	rmdir($gradable_folder);
	unlink($token_file);
	echo json_encode(array(
		"success" => !file_exists($token_file)
	));
	die();
}

if (!isset($_POST["url"])) {
	echo json_encode(array(
		"success" => false,
		"status" => "missing parameters"
	));
	die();
}

// https://fall-2020.cs.utexas.edu/cs329e-bulko/username/HW12
// [..., "fall", "2020", "username", "HW12"]

$matches = [];
preg_match(
	'/https:\/\/(\w+)-(\d{4})\.cs\.utexas\.edu\/cs329e-bulko\/([^\/]+)\/([^\/]+)/',
	$_POST["url"],
	$matches
);

if (count($matches) != 5) {
	echo json_encode(array(
		"success" => false,
		"status" => "invalid url"
	));
	die();
}

$basepath = "/projects/coursework/" . $matches[2] . "-" .
	$matches[1] . "/cs329e-bulko/" . $matches[3];

if (isset($_POST["lock"])) {
	$fullpath = realpath($basepath);

	$shouldunlock = $_POST["lock"] == "no";
	$action = $shouldunlock ? "unlock" : "lock";
	$chmodval = $shouldunlock ? "755" : "700";
	$command = "chmod -R 0" . $chmodval . " " . $fullpath;

	$username = $_POST["user"];
	preg_replace("/[^A-Za-z0-9]/", "", $username);

	$tmp_pass_file = $gradable_folder . bin2hex(random_bytes(10));
	file_put_contents($tmp_pass_file, $_POST["pass"]);
	chmod($tmp_pass_file, 0600);
	$status = exec('sshpass -f ' . $tmp_pass_file . ' ssh ' . $username . '@linux.cs.utexas.edu "' . $command . '"');
	unlink($tmp_pass_file);

	echo json_encode(array(
		"success" => (strpos($status, "denied") == false),
		"result" => $status,
		"status" => $action . "ed folder",
		"path" => $fullpath
	));
} else if (isset($_POST["ls"])) {
	$fullpath = realpath($basepath . "/" . $matches[4]);

	$status = array();
	exec("cd " . $fullpath . "; find . -type f ! -name '*.txt' -printf '%T@ %p\n'", $status);

	echo json_encode(array(
		"result" => join("\n", $status),
		"path" => $fullpath
	));
} else {
	echo json_encode(array(
		"result" => "unknown command",
		"success" => false
	));
	die();
}
