<script lang="ts">
	import { pingServer } from "./data/server";
	import { config } from "./stores";

	export let pluginInstalled = false;

	let token = "";
	let username = "";
	let studentIdsRaw = "";

	const ENDPOINT_NAME = "gradable.php";

	$: endpoint = `https://www.cs.utexas.edu/~${username}/${ENDPOINT_NAME}`;
	$: proposedConfig = {
		token,
		endpoint,
		studentIds: studentIdsRaw.split("\n"),
	};

	function verify() {
		pingServer(proposedConfig)
			.then((response) => {
				if (response.success) {
					$config = proposedConfig;
				} else {
					throw new Error("Failed connection");
				}
			})
			.catch(() => {
				alert("Could not connect to server");
			});
	}
</script>

<h1>Needs setup before running</h1>

{#if !pluginInstalled}
	Install the companion browser extension for
	<a href="https://addons.mozilla.org/en-US/firefox/addon/gradable-companion/"
		>Firefox</a
	>
	or
	<a
		href="https://chrome.google.com/webstore/detail/njijmdbjijgeodnhcnkknkeopbhfgpbg"
		>Chrome</a
	>
	and
	<!-- svelte-ignore a11y-invalid-attribute -->
	<a href="">refresh</a>.
{:else}
	<ul>
		<li>
			What is your UT CS username?
			<input type="text" bind:value={username} />
		</li>
		<li>
			Log in to your UT CS account and run <code
				>cd ~/public_html; wget {document.location
					.href}server/{ENDPOINT_NAME}; chmod +x {ENDPOINT_NAME}</code
			>
		</li>
		<li>
			Go to <a href={endpoint} target="_blank">this link</a>, copy the
			token, and paste it here:
			<input type="text" bind:value={token} />
		</li>
		<li>
			Paste your list of student IDs separated by linebreaks here:
			<textarea bind:value={studentIdsRaw} />
		</li>
	</ul>

	<button on:click={verify} disabled={!username || !token || !studentIdsRaw}>
		I finished all steps
	</button>
{/if}
