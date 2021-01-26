<script lang="ts">
	import SetupScreen from "./start/SetupScreen.svelte";
	import FirstRun from "./setup/FirstRun.svelte";
	import ResultsScreen from "./finish/ResultsScreen.svelte";
	import GradeStudent from "./grade/GradeStudent.svelte";
	import { homework, student, config, pluginConnected } from "./stores";
	import { messageExtension } from "./helpers";
	import EventListener from "./EventListener.svelte";
	import PluginInstallPrompt from "./setup/PluginInstallPrompt.svelte";

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
</script>

{#if pluginInstalled}
	{#if $config === null}
		<FirstRun />
	{:else if $pluginConnected}
		{#if $homework !== null}
			{#if $student !== null}
				<GradeStudent />
			{:else}
				<ResultsScreen />
			{/if}
		{:else}
			<SetupScreen />
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
