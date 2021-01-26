<script lang="ts">
	import { pingServer } from "../data/server";
	import { parseStudentConfigDump } from "../helpers";
	import StudentConfig from "../shared/StudentConfig.svelte";
	import { config } from "../stores";

	let token = "";
	let username = "";
	let students = [];

	const ENDPOINT_NAME = "gradable.php";
	const SELF_BASE_PATH = document.location.href;

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

	function selectAll(e) {
		e.target.select();
	}
</script>

<h1>Setup</h1>

<ul>
	<li>
		What is your UT CS username?
		<input type="text" bind:value={username} />
	</li>
	<li>
		Log in to your UT CS account and run
		<input
			type="text"
			on:click={selectAll}
			on:focus={selectAll}
			value={`cd ~/public_html && wget -O ${ENDPOINT_NAME} "${SELF_BASE_PATH}server/${ENDPOINT_NAME}" && chmod +x ${ENDPOINT_NAME}`}
		/>
	</li>
	<li>
		Go to <a href={endpoint} target="_blank">this link</a>, copy the token,
		and paste it here:
		<input type="text" bind:value={token} />
	</li>
	<li>Paste your list of students separated by linebreaks below.</li>
</ul>

<StudentConfig bind:students />

<button on:click={verify} disabled={!username || !token || !students}>
	Save and continue
</button>
