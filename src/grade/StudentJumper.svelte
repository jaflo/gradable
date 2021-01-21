<script lang="ts">
	import { calculateScore } from "../helpers";
	import { homework, student, config } from "../stores";

	const studentIds = $config.studentIds;
	let selected = $student.username;

	function findCompletedEntry(studentId, homework): Student {
		return homework.students.find(
			(student) => student.username === studentId
		);
	}

	function jump() {
		const previous = findCompletedEntry(selected, $homework);

		if (previous) {
			$student = previous;
			$homework.students = $homework.students.filter(
				(student) => student.username !== selected
			);
		} else {
			$student = {
				username: selected,
				commentIds: [],
				submissionTime: "",
			};
		}
	}
</script>

<div>
	<select bind:value={selected}>
		{#each studentIds as studentId}
			<option value={studentId}>
				{studentId}
				{#if findCompletedEntry(studentId, $homework)}
					({calculateScore(
						findCompletedEntry(studentId, $homework).commentIds,
						$homework.possibleComments
					)}%)
				{/if}
			</option>
		{/each}
	</select>
	<button on:click={jump}>Discard current and jump</button>
</div>

<style>
	div {
		display: flex;
	}

	select {
		flex: 1;
		margin-right: 5px;
	}
</style>
