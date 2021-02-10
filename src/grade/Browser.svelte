<script lang="ts">
	import { messageExtension } from "../helpers";
	import { config, displayUrl, student } from "../stores";
	import { lock, unlock } from "../data/server";

	export let embeddedUrl = "about:blank";
	export let iframeRef;

	let waitingOnServer = false;

	function refreshEmbed() {
		messageExtension({ type: "refresh-page" });
	}

	function clearCookies() {
		messageExtension({
			type: "clear-cookies",
			value: $displayUrl,
		});
	}

	function checkServerResponse(response) {
		if (!response.success) {
			catchServerError("Failed. " + response.result);
		} else {
			messageExtension({ type: "refresh-page" });
			waitingOnServer = false;
		}
	}

	function catchServerError(error) {
		alert(error);
		waitingOnServer = false;
	}

	function unlockCurrent() {
		waitingOnServer = true;
		unlock($displayUrl, $student.username, $config)
			.then(checkServerResponse)
			.catch(catchServerError);
	}

	function lockCurrent() {
		waitingOnServer = true;
		lock($displayUrl, $student.username, $config)
			.then(checkServerResponse)
			.catch(catchServerError);
	}
</script>

<div class="browser">
	<div class="top">
		<a href={$displayUrl} class="location" target="_blank">
			{$displayUrl}<span>ignore</span>
		</a>
		<button on:click={unlockCurrent} disabled={waitingOnServer}>
			Unlock
		</button>
		<button on:click={lockCurrent} disabled={waitingOnServer}>Lock</button>
		<button on:click={clearCookies}>Clear cookies</button>
		<button on:click={refreshEmbed}>Refresh</button>
	</div>
	<iframe
		src={embeddedUrl}
		frameborder="0"
		title="Embedded website to grade"
		bind:this={iframeRef}
	/>
</div>

<style>
	.browser {
		display: flex;
		flex-direction: column;
		flex: 1;
		height: 100%;
	}

	.top {
		margin-bottom: 0.5em;
		display: flex;
		align-items: center;
	}

	.location {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		direction: rtl;
		text-align: left;
	}

	.location span {
		font-size: 0;
		user-select: none;
	}

	button {
		margin: 0 0 0 5px;
	}

	iframe {
		flex: 1;
		background: white;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
	}
</style>
