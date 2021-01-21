const browser = chrome || browser;

document.body.classList.add("gradable-plugin-present");

browser.runtime.onMessage.addListener(({ type, value }) => {
	if (type === "new-request") {
		// externally_connectable not supported in FF, so use workaround
		document.body.dataset.newestRequest = JSON.stringify(value);
	} else if (type === "url-change") {
		document.body.dataset.embeddedUrl = JSON.stringify(value);
	}
});

const observer = new MutationObserver((mutationsList) => {
	if (
		mutationsList.find(
			(mutation) => mutation.attributeName === "data-tell-extension"
		)
	) {
		const { type, value } = JSON.parse(document.body.dataset.tellExtension);
		if (type !== "idle") {
			browser.runtime.sendMessage({ type, value });
			document.body.dataset.tellExtension = JSON.stringify({
				type: "idle",
			});
		}
	}
});
observer.observe(document.body, { attributes: true });
