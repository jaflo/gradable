<script lang="ts">
	import { loadNextStudent } from "../data/homework";
	import {
		collectedRequests,
		config,
		fileModificationTimes,
		homework,
	} from "../stores";
	import shuffle from "shuffle-array";

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
		$collectedRequests = [];
		$fileModificationTimes = {};
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
	/>.cs.utexas.edu/<input type="text" bind:value={folder} readonly />
</div>

The recommended workflow is as follows:

<ol>
	<li>
		Wait for the student's directory to be unlocked (use the refresh button
		to check)
	</li>
	<li>Grade the student shown (chosen randomly)</li>
	<li>
		Click the next student button to load the next student randomly
		<ul>
			<li>
				This should load faster because gradable already unlocked the
				folder in the background
			</li>
			<li>
				Sometimes stuff goes wrong and you will see an ❌, click it to
				see what happened
			</li>
		</ul>
	</li>
	<li>
		Once you are done, you will get a table of students, copy everything
		into Canvas
	</li>
	<li>You're done!</li>
</ol>

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
