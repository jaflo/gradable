<script lang="ts">
	import NewSession from "./NewSession.svelte";
	import RestoreSession from "./RestoreSession.svelte";
	import { checkpoints, config } from "../stores";
	import { removeServerConfig } from "../data/server";
	import StudentConfig from "../shared/StudentConfig.svelte";

	function resetServer() {
		removeServerConfig($config).then(({ success }) => {
			if (success) {
				alert("Server reset, you still need to delete gradable.php");
			} else {
				alert("Failed, could not reset");
			}
		});
	}

	function resetEverything() {
		if (
			confirm(
				"You are about to DELETE EVERYTHING, including your authentication token and " +
					$checkpoints.length +
					" checkpoints. Make sure to delete the server config if you do not have a backup of the token. " +
					"Are you sure you want to continue?"
			)
		) {
			localStorage.clear();
			window.location = window.location;
		}
	}
</script>

<h1>Grade new homework</h1>
<NewSession />

{#if $checkpoints !== null && $checkpoints.length > 0}
	<h1>Load previous session</h1>
	<RestoreSession />
{/if}

<h1>Configuration</h1>

<h2>UT CS server endpoint</h2>
{$config.endpoint}

<StudentConfig bind:students={$config.students} />

<h2>Reset</h2>
<button on:click={resetEverything}>Delete local config and set up again</button>
<button on:click={resetServer}>Reset server configuration</button>

<style>
	h1:not(:first-of-type) {
		margin-top: 1em;
	}
</style>
