const browser = chrome || browser;

document.body.classList.add("gradable-plugin-present");
const commEl = document.getElementById("comms");

function sendMessage(type, value) {
	// externally_connectable not supported in FF, so use workaround
	document.getElementById("comms").dataset[type] = JSON.stringify(value);
}

let eventListener = browser.runtime.onMessage.addListener(({ type, value }) => {
	const eventMap = {
		"new-request": "newestRequest",
		"url-change": "embeddedUrl",
		activated: "activated",
		deactivated: "deactivated",
	};
	if (eventMap[type]) {
		sendMessage(eventMap[type], value);
	}
});

const observer = new MutationObserver((mutationsList) => {
	if (
		mutationsList.find(
			(mutation) => mutation.attributeName === "data-tell-extension"
		)
	) {
		const { type, value } = JSON.parse(commEl.dataset.tellExtension);
		if (type !== "idle") {
			browser.runtime.sendMessage({ type, value });
			sendMessage("tellExtension", {
				type: "idle",
			});
		}
	}
});
observer.observe(commEl, { attributes: true });
