<?php

error_reporting(E_ALL);
ini_set("display_errors", 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

$SERVER_VERSION = 4; // match with MIN_SERVER_VERSION in server.ts
$gradable_folder = "./gradable/";
$token_file = $gradable_folder . "token.txt";

spl_autoload_register(function ($class) {
	include str_replace("\\", "/", $class) . ".php";
});

$ssh = new \phpseclib\Net\SSH2("linux.cs.utexas.edu", 22);

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
		echo "Token could not be saved. You might need to <code>chmod 755 ~/public_html</code> ";
		echo "<a href=''>retry</a>";
	}

	die();
}

header("Content-type: application/json");

if ($_POST["token"] !== file_get_contents($token_file)) {
	echo json_encode(array(
		"success" => false,
		"status" => "unauthorized",
		"message" => "Follow the instructions to reset your token in the setup guide if needed."
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
	foreach (glob($gradable_folder . '/{,.}*', GLOB_BRACE) as $file) {
		unlink($file);
	}
	rmdir($gradable_folder);

	echo json_encode(array(
		"success" => !file_exists($gradable_folder)
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

function get_path_from_url($homework_subfolder)
{
	// https://fall-2020.cs.utexas.edu/cs329e-bulko/username/HW12
	// -> [..., "fall", "2020", "username"(, "HW12")]

	$regex = '/https:\/\/(\w+)-(\d{4})\.cs\.utexas\.edu\/cs329e-bulko\/([^\/]+)/';
	$expected_count = 4;

	if ($homework_subfolder) {
		$regex = '/https:\/\/(\w+)-(\d{4})\.cs\.utexas\.edu\/cs329e-bulko\/([^\/]+)\/([^\/]+)/';
		$expected_count = 5;
	}

	$matches = [];
	preg_match(
		$regex,
		$_POST["url"],
		$matches
	);

	if (count($matches) !== $expected_count) {
		echo json_encode(array(
			"success" => false,
			"status" => "invalid url"
		));
		die();
	}

	$basepath = "/projects/coursework/" . $matches[2] . "-" .
		$matches[1] . "/cs329e-bulko/" . $matches[3];

	if ($homework_subfolder) {
		// add the homework folder
		return realpath($basepath . "/" . $matches[4]);
	} else {
		return realpath($basepath);
	}
}

if (isset($_POST["lock"])) {
	$fullpath = get_path_from_url(false);

	$shouldunlock = $_POST["lock"] === "no";
	$action = $shouldunlock ? "unlock" : "lock";
	$command = $shouldunlock ?
		// set all folders to 755 and files to 644
		"(find " . $fullpath . " -type d -print0 | xargs -0 chmod 755) && (find " . $fullpath . " -type f -print0 | xargs -0 chmod 644) && echo success"
		:
		// only lock top folder
		"chmod 700 " . $fullpath . " && echo success";

	$ssh->login($_POST["user"], $_POST["pass"]);
	$status = $ssh->exec($command);

	echo json_encode(array(
		"success" => (strpos($status, "success") !== false),
		"action" => $action,
		"result" => $status
	));
} else if (isset($_POST["ls"])) {
	$fullpath = get_path_from_url(true);

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
