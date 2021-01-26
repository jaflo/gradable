const browser = chrome || browser;

let homeworkNumber = null;
let tabId = null;

function detachEventListener() {
	browser.webRequest.onHeadersReceived.removeListener(handleRequest);
}

function attachRequestListener() {
	detachEventListener();

	browser.webRequest.onHeadersReceived.addListener(handleRequest, {
		urls: ["https://*.cs.utexas.edu/*"],
		tabId,
	});
}

browser.tabs.onRemoved.addListener(detachEventListener);

function handleRequest(details) {
	const { statusCode, url, method, responseSize } = details;

	const request = {
		statusCode,
		url,
		method,
		responseSize,
	};

	if (
		url.includes("gradable.php") &&
		url.startsWith("https://www.cs.utexas.edu/~")
	) {
		// ignore API endpoint requests
		return;
	}

	sendMessage({
		type: "new-request",
		value: request,
	});
}

function sendMessage(message) {
	if (!tabId) return;
	browser.tabs.sendMessage(tabId, message);
}

function messageHandler({ type, value }, sender) {
	if (type === "ping") {
		sendMessage({
			type: "pong",
		});
	} else if (type === "register-active") {
		// disconnect old tab
		sendMessage({
			type: "deactivated",
		});
		// set new tab and activate
		tabId = sender.tab.id;
		sendMessage({
			type: "activated",
		});
		attachRequestListener();
	} else if (type === "clear-cookies") {
		browser.cookies.getAll({ url: value }, (cookies) =>
			cookies.forEach((cookie) =>
				browser.cookies.remove({
					url: value,
					name: cookie.name,
				})
			)
		);
	} else if (type === "refresh-page") {
		sendMessage({
			type: "refresh-page",
		});
	} else if (type === "url") {
		sendMessage({
			type: "url-change",
			value,
		});
		sendMessage({
			type: "highlight-homework-number",
			value: homeworkNumber,
		});
	} else if (type === "set-homework-number") {
		homeworkNumber = value;
		sendMessage({
			type: "highlight-homework-number",
			value: homeworkNumber,
		});
	}
}

browser.runtime.onMessage.addListener(messageHandler);
