<script lang="ts">
	import UnlockLock from "./UnlockLock.svelte";
	import { messageExtension } from "../helpers";
	import {
		collectedRequests,
		displayUrl,
		failedUnlocks,
		student,
	} from "../stores";

	export let embeddedUrl = "about:blank";
	export let iframeRef;

	function refreshEmbed() {
		messageExtension({ type: "refresh-page" });
	}

	function clearCookies() {
		messageExtension({
			type: "clear-cookies",
			value: $displayUrl,
		});
	}

	function handleKeydown(event) {
		if (event.keyCode === 82 && event.ctrlKey) {
			refreshEmbed();
			event.preventDefault();
		}
	}

	let waitingOnUnlock = true;
	$: if ($collectedRequests[0]) {
		if ($collectedRequests[0].statusCode === 403) {
			waitingOnUnlock = true;
			setTimeout(refreshEmbed, 1000);
		} else {
			waitingOnUnlock = false;
		}
	}

	$: failedReason = $failedUnlocks[$student.username];
	$: console.log($failedUnlocks, $student.username, failedReason);
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="browser">
	<div class="top">
		<a href={$displayUrl} class="location" target="_blank">
			{$displayUrl}<span>ignore</span>
		</a>
		<UnlockLock />
		<button on:click={clearCookies}>Clear cookies</button>
		<button on:click={refreshEmbed}>Refresh</button>
	</div>
	<div class="main">
		{#if failedReason !== undefined}
			<div class="message">
				<h3>Failed to load</h3>
				You might need to manually SSH in to investigate.
				<pre>{failedReason}</pre>
			</div>
		{:else if waitingOnUnlock}
			<div class="waiting message">
				<h3>Waiting on unlock</h3>
				This shouldn't take longer than five minutes.
			</div>
		{/if}
		<iframe
			src={embeddedUrl}
			frameborder="0"
			title="Embedded website to grade"
			class:faded={failedReason !== undefined || waitingOnUnlock}
			bind:this={iframeRef}
		/>
	</div>
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
		position: relative;
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

	:global(.browser button) {
		margin: 0 0 0 5px;
	}

	.main {
		flex: 1;
		background: white;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
		position: relative;
	}

	iframe {
		width: 100%;
		height: 100%;
	}

	.faded {
		opacity: 0.5;
	}

	@keyframes fade {
		to {
			opacity: 0.3;
		}
	}

	.message {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 380px;
		text-align: center;
	}

	.waiting {
		animation: fade 1s ease-in-out infinite alternate;
	}

	pre {
		text-align: left;
		overflow-x: auto;
	}
</style>
