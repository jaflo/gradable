function isEmbedded() {
	try {
		return window.self !== window.top;
	} catch (e) {
		return true;
	}
}

if (isEmbedded()) {
	const browser = chrome || browser;

	browser.runtime.onMessage.addListener(({ type, value }) => {
		if (type === "refresh-page") {
			window.location = window.location;
		} else if (type === "highlight-homework-number") {
			const regex = new RegExp(`H*W\\D*${value}\\b`, "gi");
			[...document.getElementsByTagName("a")].forEach((el) => {
				const candidate = regex.exec(el.href);

				if (candidate) {
					el.style.borderRadius = "3px";
					el.style.background = "#297373"; // var(--good-dark)
					el.style.boxShadow = "0 0 0 10px #297373";
					el.style.color = "#E6E6E6"; // var(--background)
				}
			});
		}
	});

	browser.runtime.sendMessage({ type: "url", value: document.location.href });
}
