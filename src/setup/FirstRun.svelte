<script lang="ts">
	import {
		pingServer,
		ENDPOINT_NAME,
		SERVER_SETUP_CMD,
		SELF_BASE_PATH,
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

	const phpseclibInstall = `cd ~/public_html
wget https://github.com/phpseclib/phpseclib/archive/2.0.30.zip
unzip 2.0.30.zip
mv phpseclib-2.0.30/phpseclib phpseclib
rm -rf phpseclib-2.0.30
rm 2.0.30.zip
chmod -R 755 phpseclib`
		.split("\n")
		.join(" && ");

	const RM_ENDPOINT_NAME = "gradable-reset.php";
	$: SERVER_RESET_CMD = `cd ~/public_html
wget -O ${RM_ENDPOINT_NAME} "${SELF_BASE_PATH}server/${RM_ENDPOINT_NAME}"
chmod 755 ${RM_ENDPOINT_NAME}
curl https://www.cs.utexas.edu/~${username}/${RM_ENDPOINT_NAME}
rm ${RM_ENDPOINT_NAME}`
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
		<ul>
			<li>
				Getting errors? Make sure you have phpseclib installed and
				permissions correctly set up.
			</li>
			<li>
				Need to reset your token? Run this and then go to step 3 again:
				<input
					readonly
					type="text"
					on:click={selectAll}
					on:focus={selectAll}
					value={SERVER_RESET_CMD}
				/>
			</li>
		</ul>
	</li>
	<li>Paste your list of students separated by linebreaks below.</li>
</ol>

<StudentConfig bind:students showPasswords={true} />

<button on:click={verify} disabled={!username || !token || !students}>
	Save and continue
</button>
