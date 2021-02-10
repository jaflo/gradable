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

	const phpseclibInstall = `wget https://github.com/phpseclib/phpseclib/archive/2.0.30.zip
unzip 2.0.30.zip
mv phpseclib-2.0.30/phpseclib phpseclib
rm -rf phpseclib-2.0.30
rm 2.0.30.zip`
		.split("\n")
		.join(" && ");
</script>

<h1>Setup</h1>

<ol>
	<li>
		Enter your UT CS username:
		<input type="text" bind:value={username} />
	</li>
	<li>
		Log in to your UT CS account and download the phpseclib library:
		<input
			readonly
			type="text"
			on:click={selectAll}
			on:focus={selectAll}
			value={phpseclibInstall}
		/>
	</li>
	<li>
		Then install the server integration script:
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

<StudentConfig bind:students showPasswords={true} />

<button on:click={verify} disabled={!username || !token || !students}>
	Save and continue
</button>
