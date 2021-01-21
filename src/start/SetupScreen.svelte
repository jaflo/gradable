<script lang="ts">
	import NewSession from "./NewSession.svelte";
	import RestoreSession from "./RestoreSession.svelte";
	import { checkpoints, config } from "../stores";

	function resetEverything() {
		if (
			confirm(
				`You are about to DELETE EVERYTHING, including your authentication token and ${$checkpoints.length} checkpoints. Are you sure?`
			)
		) {
			localStorage.clear();
			window.location = window.location;
		}
	}

	let studentIdsRaw = $config.studentIds.join("\n");

	$: $config.studentIds = studentIdsRaw.split("\n").filter((id) => !!id);
</script>

<h1>Grade new homework</h1>
<NewSession />

{#if $checkpoints !== null && $checkpoints.length > 0}
	<h1>Load previous session</h1>
	<RestoreSession />
{/if}

<h1>Configuration</h1>
<label>
	<span>
		{$config.studentIds.length}
		{$config.studentIds.length === 1 ? "student" : "students"}
	</span>
	<textarea bind:value={studentIdsRaw} />
</label>
<div>
	UT CS server endpoint: {$config.endpoint}
</div>

If you messed up or want to reset, use this:
<button on:click={resetEverything}>Delete everything and set up again</button>

<style>
	textarea {
		display: block;
		margin-top: 0.5em;
	}

	h1:not(:first-of-type) {
		margin-top: 1em;
	}
</style>
