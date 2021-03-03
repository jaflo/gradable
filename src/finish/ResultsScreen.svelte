<script lang="ts">
	import { calculateScore, getName, selectAll } from "../helpers";
	import {
		student,
		homework,
		checkpoints,
		config,
		collectedRequests,
	} from "../stores";

	interface NamedStudent extends Student {
		realname: string;
	}

	$: students = ($homework
		? $config.students.map((student) => ({
				realname: student.realname,
				...($homework?.students.find(
					(gradedStudent) =>
						gradedStudent.username === student.username
				) || {}),
		  }))
		: []) as NamedStudent[];

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

	function regrade(selectedStudent: Student) {
		$student = selectedStudent;
		$homework.students = $homework.students.filter(
			(student) => student.username !== selectedStudent.username
		);
		$collectedRequests = [];
	}

	function formatComments(commentIds, separator) {
		return commentIds
			.map((commentId) => $homework.possibleComments[commentId])
			.map(({ points, text }) => {
				if (points === 100) {
					return text;
				} else if (points === 0) {
					return `Note: ${text}`;
				} else {
					return `-${points}: ${text}`;
				}
			})
			.join(separator);
	}
</script>

<table>
	<thead>
		<tr>
			<td>name</td>
			<td>grade</td>
			<td width="99%">comments</td>
			<td>actions</td>
		</tr>
	</thead>
	<tbody>
		{#each students as student, i}
			<tr>
				<td>
					{getName(student.realname).last},
					{getName(student.realname).first}
				</td>
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
							regrade(student);
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
