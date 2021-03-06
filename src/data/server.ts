export const ENDPOINT_NAME = "gradable.php";
export const SELF_BASE_PATH = document.location.href;
const MIN_SERVER_VERSION = 6; // match with $SERVER_VERSION in gradable.php

export const SERVER_SETUP_CMD = `cd ~/public_html && wget -O ${ENDPOINT_NAME} "${SELF_BASE_PATH}server/${ENDPOINT_NAME}" && chmod 755 ${ENDPOINT_NAME}`;

export function lock(url, username, config: ConfigOptions) {
	return send(true, username, url, config);
}

export function unlock(url, username, config: ConfigOptions) {
	return send(false, username, url, config);
}

function send(lock, username, url, config: ConfigOptions) {
	const password = config.students.find(
		(student) => student.username === username
	)?.password;

	if (!password) {
		throw new Error("Unknown student");
	} else if (password === "UNKNOWN") {
		throw new Error("Unknown password");
	}

	const data = new URLSearchParams();
	data.append("token", config.token);
	data.append("lock", lock ? "yes" : "no");
	data.append("url", url);
	data.append("user", username);
	data.append("pass", password);

	return fetch(config.endpoint, {
		method: "post",
		body: data,
	}).then((response) => response.json());
}

export function pingServer(config: ConfigOptions) {
	const data = new URLSearchParams();
	data.append("token", config.token);
	data.append("ping", "yes");

	return fetch(config.endpoint, {
		method: "post",
		body: data,
	}).then((response) => response.json());
}

export function removeServerConfig(config: ConfigOptions) {
	const data = new URLSearchParams();
	data.append("token", config.token);
	data.append("remove", "yes");

	return fetch(config.endpoint, {
		method: "post",
		body: data,
	}).then((response) => response.json());
}

export function checkServerVersion(config: ConfigOptions) {
	const data = new URLSearchParams();
	data.append("token", config.token);
	data.append("version", "yes");

	return fetch(config.endpoint, {
		method: "post",
		body: data,
	})
		.then((response) => response.json())
		.then((response) => {
			if (!response.success) {
				throw new Error(
					response.status || response.message || "Server error"
				);
			} else if (response.version < MIN_SERVER_VERSION) {
				return false;
			} else {
				return true;
			}
		});
}

export function getModificationTimes(url, basePath, config: ConfigOptions) {
	const data = new URLSearchParams();
	data.append("token", config.token);
	data.append("ls", "yes");
	data.append("url", url);

	return fetch(config.endpoint, {
		method: "post",
		body: data,
	})
		.then((response) => response.json())
		.then((response) =>
			response.result
				.split("\n")
				.map((entry) => entry.split(" "))
				.map((pieces) => {
					const time = pieces.shift();
					const name = pieces.join(" ");

					return [time, name];
				})
				.map(([time, name]) => ({
					name: basePath + name.replace("./", "/"),
					time: new Date(parseFloat(time) * 1000),
				}))
		);
}

export function getFileContent(url, filePath, config: ConfigOptions) {
	const data = new URLSearchParams();
	data.append("token", config.token);
	data.append("cat", "yes");
	data.append("url", url);
	data.append("file", filePath);

	return fetch(config.endpoint, {
		method: "post",
		body: data,
	})
		.then((response) => response.json())
		.then((response) => response.result);
}
