<script lang="ts">
	import { loadNextStudent } from "../data/homework";
	import { homework } from "../stores";

	let homeworkNumber = "";
	let dueDate = "";

	const today = new Date();
	let semester = today.getMonth() < 6 ? "spring" : "fall";
	let year = today.getFullYear();
	let folder = "cs329e-bulko";

	$: prefix = `https://${semester}-${year}.cs.utexas.edu/${folder}`;

	function startGrading() {
		$homework = {
			number: parseInt(homeworkNumber),
			dueDate: dueDate,
			students: [],
			possibleComments: [
				{
					text: "One day late",
					points: 10,
				},
				{
					text: "Two days late",
					points: 20,
				},
				{
					text: "No submission",
					points: 100,
				},
			] as Comment[],
			prefix,
		};
		loadNextStudent();
	}
</script>

<label>
	<span>Homework number</span>
	<input
		type="text"
		placeholder="1"
		class="short"
		bind:value={homeworkNumber}
	/>
</label>
<label>
	<span>Due date (EOD)</span>
	<input type="date" class="date" bind:value={dueDate} />
</label>

<div class="prefix">
	https://<select bind:value={semester}>
		<option>fall</option>
		<option>spring</option>
	</select>-<input
		type="text"
		class="short"
		bind:value={year}
	/>.cs.utexas.edu/<input type="text" bind:value={folder} />
</div>

<button
	disabled={!homeworkNumber || !dueDate || !folder}
	on:click={startGrading}>Start grading</button
>

<style>
	.prefix {
		white-space: nowrap;
	}

	.short {
		width: 4em;
	}
</style>
