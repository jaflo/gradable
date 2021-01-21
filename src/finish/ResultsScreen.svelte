<script lang="ts">
	import { calculateScore } from "../helpers";
	import { student, homework, checkpoints, config } from "../stores";

	$: students = ($homework
		? $config.studentIds.map(
				(studentId) =>
					$homework?.students.find(
						(student) => student.username === studentId
					) || {}
		  )
		: []) as Student[];

	function exportAndContinue() {
		saveToCheckpoint();

		// generate TSV
		let dump = "name\tscore\tcomments\n";
		students.forEach((student) => {
			dump += student.username;
			dump += "\t";
			dump += calculateScore(
				student.commentIds,
				$homework?.possibleComments
			);
			dump += "\t";
			dump += formatComments(student.commentIds, "; ");
			dump += "\n";
		});

		// download
		const el = document.createElement("a");
		el.setAttribute(
			"href",
			"data:text/tab-separated-values;charset=utf-8," +
				encodeURIComponent(dump)
		);
		el.setAttribute(
			"download",
			`HW${$homework.number}export-${
				(new Date().getTime() / 1000) | 0
			}.csv`
		);
		el.style.display = "none";
		document.body.appendChild(el);
		el.click();
		document.body.removeChild(el);

		// clear and prepare for next
		$homework = null;
	}

	function saveToCheckpoint() {
		$checkpoints = [
			...$checkpoints,
			{
				label: "HW " + $homework.number,
				lastChange: new Date().getTime(),
				homework: $homework,
				currentStudent: null,
			} as Checkpoint,
		];
	}

	function regrade(i) {
		$student = $homework.students[i];
		$homework.students.splice(i, 1);
		$homework = $homework;
	}

	function formatComments(commentIds, separator) {
		return commentIds
			.map((commentId) => $homework.possibleComments[commentId])
			.map(({ points, text }) => `-${points}: ${text}`)
			.join(separator);
	}

	function selectAll(e) {
		e.target.select();
	}
</script>

<table>
	<thead>
		<tr>
			<td>id</td>
			<td>grade</td>
			<td width="99%">comments</td>
			<td>actions</td>
		</tr>
	</thead>
	<tbody>
		{#each students as student, i}
			<tr>
				<td>{student.username}</td>
				<td>
					<input
						readonly
						class="percentage"
						type="text"
						value={calculateScore(
							student.commentIds,
							$homework.possibleComments
						)}
						on:click={selectAll}
						on:focus={selectAll}
					/>%
				</td>
				<td>
					{#if student.commentIds.length > 0}
						<textarea
							readonly
							value={formatComments(student.commentIds, "\n")}
							on:click={selectAll}
							on:focus={selectAll}
						/>
					{:else}
						<i>none</i>
					{/if}
				</td>
				<td>
					<button
						on:click={() => {
							regrade(i);
						}}>regrade</button
					>
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<button on:click={exportAndContinue}>Export and continue</button>

<style>
	.percentage {
		width: 3em;
	}

	textarea {
		width: 100%;
		height: 50px;
	}

	table {
		white-space: nowrap;
	}
</style>
