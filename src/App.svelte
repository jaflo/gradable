<script lang="ts">
	import SetupScreen from "./start/SetupScreen.svelte";
	import FirstRun from "./FirstRun.svelte";
	import ResultsScreen from "./finish/ResultsScreen.svelte";
	import GradeStudent from "./grade/GradeStudent.svelte";
	import { homework, student, config } from "./stores";
	import { messageExtension } from "./helpers";

	const magicPluginClassName = "gradable-plugin-present";
	let pluginInstalled = document.body.classList.contains(
		magicPluginClassName
	);

	new MutationObserver((mutationsList, observer) => {
		if (
			mutationsList.find(
				(mutation) => mutation.attributeName === "class"
			) &&
			document.body.classList.contains(magicPluginClassName)
		) {
			pluginInstalled = true;
			updateExtension();
			observer.disconnect();
		}
	}).observe(document.body, { attributes: true });

	$: $homework && $homework.number && updateExtension();

	function updateExtension() {
		if (!$homework) return;
		messageExtension({
			type: "set-homework-number",
			value: $homework.number,
		});
	}
</script>

{#if pluginInstalled && $config !== null}
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
	<FirstRun {pluginInstalled} />
{/if}
