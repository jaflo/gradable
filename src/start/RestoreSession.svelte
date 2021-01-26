<script lang="ts">
	import { timeago } from "../helpers";
	import {
		student,
		homework,
		checkpoints,
		collectedRequests,
		fileModificationTimes,
	} from "../stores";

	let chosenCheckpoint = 0;
	$: sortedCheckpoints =
		$checkpoints?.sort((a, b) => b.lastChange - a.lastChange) || [];

	function restore() {
		$collectedRequests = [];
		$fileModificationTimes = {};
		const checkpoint = $checkpoints[chosenCheckpoint];
		$homework = checkpoint.homework;
		$student = checkpoint.currentStudent;
		$checkpoints.splice(chosenCheckpoint, 1);
		$checkpoints = $checkpoints;
	}
</script>

<select bind:value={chosenCheckpoint}>
	{#each sortedCheckpoints as checkpoint, i}
		<option value={i}>
			{checkpoint.label}, saved {timeago(checkpoint.lastChange)}
		</option>
	{/each}
</select>
<button on:click={restore}>Restore from save</button>
