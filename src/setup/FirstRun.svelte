<script lang="ts">
	import {
		pingServer,
		ENDPOINT_NAME,
		SERVER_SETUP_CMD,
	} from "../data/server";
	import { selectAll } from "../helpers";
	import StudentConfig from "../shared/StudentConfig.svelte";
	import { config } from "../stores";

	let token = "";
	let username = "";
	let students = [];

	$: endpoint = `https://www.cs.utexas.edu/~${username}/${ENDPOINT_NAME}`;
	$: proposedConfig = {
		token,
		endpoint,
		students,
	};

	function verify() {
		pingServer(proposedConfig)
			.then((response) => {
				if (response.success) {
					$config = proposedConfig;
				} else {
					alert("Invalid token");
				}
			})
			.catch(() => {
				alert("Could not connect to server");
			});
	}
</script>

<h1>Setup</h1>

<ol>
	<li>
		Enter your UT CS username:
		<input type="text" bind:value={username} />
	</li>
	<li>
		Log in to your UT CS account and run
		<input
			readonly
			type="text"
			on:click={selectAll}
			on:focus={selectAll}
			value={SERVER_SETUP_CMD}
		/>
	</li>
	<li>
		Go to <a href={endpoint} target="_blank">this link</a>, copy the token,
		and paste it here:
		<input type="text" bind:value={token} />
	</li>
	<li>Paste your list of students separated by linebreaks below.</li>
</ol>

<StudentConfig bind:students />

<button on:click={verify} disabled={!username || !token || !students}>
	Save and continue
</button>
