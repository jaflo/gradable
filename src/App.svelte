<script lang="ts">
	import SetupScreen from "./start/SetupScreen.svelte";
	import FirstRun from "./setup/FirstRun.svelte";
	import ResultsScreen from "./finish/ResultsScreen.svelte";
	import GradeStudent from "./grade/GradeStudent.svelte";
	import {
		homework,
		student,
		config,
		pluginConnected,
		checkpoints,
	} from "./stores";
	import { messageExtension, selectAll } from "./helpers";
	import EventListener from "./shared/EventListener.svelte";
	import PluginInstallPrompt from "./setup/PluginInstallPrompt.svelte";
	import {
		checkServerVersion,
		SELF_BASE_PATH,
		SERVER_SETUP_CMD,
	} from "./data/server";
	import { resetLocalStorage } from "./data/configData";

	const magicPluginClassName = "gradable-plugin-present";
	let pluginInstalled = document.body.classList.contains(
		magicPluginClassName
	);
	let pluginInstallDetectionTimedOut = false;
	setTimeout(() => (pluginInstallDetectionTimedOut = true), 400);

	new MutationObserver((mutationsList, observer) => {
		if (
			mutationsList.find(
				(mutation) => mutation.attributeName === "class"
			) &&
			document.body.classList.contains(magicPluginClassName)
		) {
			pluginInstalled = true;
			observer.disconnect();
			init();
		}
	}).observe(document.body, { attributes: true });

	function init() {
		setHomeworkNumber();
		messageExtension({ type: "register-active" });
	}

	if (pluginInstalled) init();

	$: $homework && $homework.number && setHomeworkNumber();
	function setHomeworkNumber() {
		if (!$homework) return;
		messageExtension({
			type: "set-homework-number",
			value: $homework.number,
		});
	}

	enum ServerVersionCheck {
		Pending,
		OutOfDate,
		UpToDate,
		Failed,
	}
	let serverVersionCheck = ServerVersionCheck.Pending;
	let serverVersionCheckError = "";
	let prevServerConfig = "";

	const RM_ENDPOINT_NAME = "gradable-reset.php";
	// Below duplicated from FirstRun.svelte
	$: SERVER_RESET_CMD = `cd ~/public_html
wget -O ${RM_ENDPOINT_NAME} "${SELF_BASE_PATH}server/${RM_ENDPOINT_NAME}"
chmod 755 ${RM_ENDPOINT_NAME}
curl ${$config.endpoint.replace("gradable.php", RM_ENDPOINT_NAME)}
rm ${RM_ENDPOINT_NAME}`
		.split("\n")
		.join(" && ");

	$: if ($config && $config.endpoint + $config.token !== prevServerConfig) {
		prevServerConfig = $config.endpoint + $config.token;
		checkServerVersion($config)
			.then(
				(upToDate) =>
					(serverVersionCheck = upToDate
						? ServerVersionCheck.UpToDate
						: ServerVersionCheck.OutOfDate)
			)
			.catch((e) => {
				serverVersionCheck = ServerVersionCheck.Failed;
				serverVersionCheckError = e;
			});
	}

	function resetEverything() {
		resetLocalStorage($checkpoints.length);
	}
</script>

{#if pluginInstalled}
	{#if $config === null}
		<FirstRun />
	{:else if $pluginConnected}
		{#if serverVersionCheck === ServerVersionCheck.Pending}
			Checking server version...
		{:else if serverVersionCheck === ServerVersionCheck.UpToDate}
			{#if $homework !== null}
				{#if $student !== null}
					<GradeStudent />
				{:else}
					<ResultsScreen />
				{/if}
			{:else}
				<SetupScreen />
			{/if}
		{:else if serverVersionCheck === ServerVersionCheck.OutOfDate}
			Looks like your server script is out of date. Please run this
			command again:
			<input
				readonly
				type="text"
				on:click={selectAll}
				on:focus={selectAll}
				value={SERVER_SETUP_CMD}
			/>
		{:else}
			Failed to check server version: {serverVersionCheckError}
			Need to reset your token? Run this:
			<input
				readonly
				type="text"
				on:click={selectAll}
				on:focus={selectAll}
				value={SERVER_RESET_CMD}
			/>
			and
			<button on:click={resetEverything}>
				Delete local config and set up again
			</button>
		{/if}
	{:else}
		<!-- svelte-ignore a11y-invalid-attribute -->
		Plugin disconnected, did you open this website in another tab? Try
		<a href="">refreshing</a> to retry.
	{/if}
{:else if pluginInstallDetectionTimedOut}
	<PluginInstallPrompt />
{:else}
	Checking for plugin...
{/if}

<EventListener />
