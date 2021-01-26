<script lang="ts">
	import { messageExtension } from "../helpers";
	import { displayUrl } from "../stores";

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
</script>

<div class="browser">
	<div class="top">
		<div class="location">{$displayUrl}<span>ignore</span></div>
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
