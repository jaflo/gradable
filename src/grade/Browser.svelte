<script lang="ts">
	import UnlockLock from "./UnlockLock.svelte";
	import { messageExtension } from "../helpers";
	import { config, displayUrl, homework } from "../stores";

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
</script>

<svelte:window on:keydown={handleKeydown} />

<svelte:head>
	<title
		>Grading student {$homework.students.length + 1} of {$config.students
			.length} | Gradable
	</title>
</svelte:head>

<div class="browser">
	<div class="top">
		<a href={$displayUrl} class="location" target="_blank">
			{$displayUrl}<span>ignore</span>
		</a>
		<UnlockLock />
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

	iframe {
		flex: 1;
		background: white;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
	}
</style>
