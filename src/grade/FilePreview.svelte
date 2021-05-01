<script lang="ts">
	import { fade } from "svelte/transition";

	export let content = "";
</script>

<pre
	class="content"
	transition:fade={{ duration: 100, delay: 300 }}>{content}</pre>

<style>
	.content {
		position: fixed;
		display: block;
		z-index: 5;
		left: calc(var(--sidebar-width) + 3 * var(--default-pad));
		top: 50%;
		--preview-height: 600px;
		--preview-width: 600px;
		height: var(--preview-height);
		margin-top: calc(var(--preview-height) / -2);
		width: var(--preview-width);
		padding: var(--default-pad);
		background: var(--text-color);
		color: var(--background);
		white-space: pre-wrap;
		overflow-y: scroll;
	}
</style>
