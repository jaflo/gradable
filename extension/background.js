const browser = chrome || browser;

let homeworkNumber = null;

browser.webRequest.onHeadersReceived.addListener(
	function (details) {
		const { statusCode, url, method, responseSize } = details;

		const request = {
			statusCode,
			url,
			method,
			responseSize,
		};

		if (!url.includes("www.cs.utexas.edu")) {
			sendMessage({
				type: "new-request",
				value: request,
			});
		}
	},
	{ urls: ["https://*.cs.utexas.edu/*"] },
	["responseHeaders"]
);

function sendMessage(message) {
	browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		tabs.forEach((tab) => browser.tabs.sendMessage(tab.id, message));
	});
}

function messageHandler({ type, value }, sender, respond) {
	if (type === "ping") {
		respond({
			type: "pong",
		});
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
