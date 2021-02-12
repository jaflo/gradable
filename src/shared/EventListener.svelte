<script lang="ts">
	import { onDestroy } from "svelte";
	import { getModificationTimes } from "../data/server";
	import { getHomeworkFolder } from "../helpers";
	import {
		collectedRequests,
		config,
		displayUrl,
		fileModificationTimes,
		pluginConnected,
	} from "../stores";

	const commEl = document.getElementById("comms");
	const observer = new MutationObserver((mutationsList) => {
		function isType(type) {
			return !!mutationsList.find(
				(mutation) => mutation.attributeName === "data-" + type
			);
		}

		if (isType("deactivated")) {
			$pluginConnected = false;
		} else if (isType("activated")) {
			$pluginConnected = true;
		} else if (isType("newest-request")) {
			const newRequest = JSON.parse(commEl.dataset.newestRequest);
			$collectedRequests = [newRequest, ...$collectedRequests];
		} else if (isType("embedded-url")) {
			const prevUrl = $displayUrl;
			$displayUrl = JSON.parse(commEl.dataset.embeddedUrl);
			// if the part after the username changed
			if (getHomeworkFolder(prevUrl) !== getHomeworkFolder($displayUrl)) {
				const basePath = $displayUrl.substring(
					0,
					$displayUrl.lastIndexOf("/")
				);
				$fileModificationTimes = {};
				getModificationTimes($displayUrl, basePath, $config)
					.then((files) => {
						files.forEach(({ name, time }) => {
							$fileModificationTimes[encodeURI(name)] = time;
						});
						$fileModificationTimes = $fileModificationTimes;
					})
					.catch((e) => {
						// ignore error
					});
			}
		}
	});
	observer.observe(commEl, { attributes: true });

	onDestroy(() => {
		observer.disconnect();
	});
</script>
