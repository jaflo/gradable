<script lang="ts">
	import { loadNextStudent } from "../data/homework";
	import { messageExtension, calculateScore } from "../helpers";
	import { student, homework, collectedRequests } from "../stores";

	$: score = calculateScore($student.commentIds, $homework.possibleComments);

	function previousStudent() {
		const prevStudent = $homework.students.pop();
		$student = prevStudent;
		$homework.students = $homework.students;
		$collectedRequests = [];
	}

	function continueWithNextStudent() {
		messageExtension({ type: "clear-cookies" });
		$homework.students = [...$homework.students, $student];
		loadNextStudent();
	}
</script>

<div class="wrap">
	<button
		on:click={previousStudent}
		class="prev"
		disabled={$homework.students.length === 0}
	>
		Previous
	</button>

	<button on:click={continueWithNextStudent} class="next">
		{#if score === 100}
			Mark as perfect and continue
		{:else}
			Mark as {score}% and continue
		{/if}
	</button>
</div>

<style>
	.wrap {
		display: flex;
	}

	.next {
		background: var(--text-color);
		color: var(--background);
		margin-left: 0.5em;
		margin-right: 0;
		flex: 1;
	}
</style>
