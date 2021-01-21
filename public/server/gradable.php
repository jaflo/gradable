<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

$token_file = "gradable-token.txt";

if (!is_file($token_file)) {
	$token = bin2hex(random_bytes(10));
	file_put_contents($token_file, $token);

	if (file_get_contents($token_file) === $token) {
		echo "<h1>Save this token</h1>";
		echo "You will not see this again! Copy this token and paste it where prompted: ";
		echo $token;
	} else {
		echo "<h1>Permission issue</h1>";
		echo "Token could not be saved. You might need to <code>chmod 777 ~/public_html</code> ";
		echo "<a href=''>retry</a>";
	}

	die();
}

header("Content-type: application/json");

if ($_POST["token"] != file_get_contents($token_file)) {
	echo json_encode(array(
		"success" => false,
		"status" => "unauthorized",
		"message" => "delete gradable-token.txt to regenerate"
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
	$matches[1] . "/cs329e-bulko/" . $matches[3] .
	"/" . $matches[4];
$fullpath = realpath($basepath);


if (isset($_POST["lock"])) {
	$shouldunlock = $_POST["lock"] == "no";
	$action = $shouldunlock ? "unlock" : "lock";
	$chmodval = $shouldunlock ? "755" : "700";

	$status = exec("chmod -R 0" . $chmodval . " " . $fullpath);

	echo json_encode(array(
		"result" => $status,
		"status" => $action . "ed folder",
		"path" => $fullpath
	));
} else if (isset($_POST["ls"])) {
	$status = array();
	exec("cd " . $fullpath . "; find . -type f ! -name '*.txt' -printf '%T@ %p\n'", $status);

	echo json_encode(array(
		"result" => join("\n", $status),
		"path" => $fullpath
	));
}
