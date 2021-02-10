<script lang="ts">
	import { calculateScore, getName } from "../helpers";
	import { homework, student, config } from "../stores";

	let selected = $student.username;

	function findCompletedEntry(current, homework): Student {
		return homework.students.find(
			(student) => student.username === current.username
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
			};
		}
	}
</script>

<div>
	<select bind:value={selected}>
		{#each $config.students as student}
			<option value={student.username}>
				{getName(student.realname).last},
				{getName(student.realname).first}
				({student.username})
				{#if findCompletedEntry(student, $homework)}
					({calculateScore(
						findCompletedEntry(student, $homework).commentIds,
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
