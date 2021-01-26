<script lang="ts">
	import {
		parseStudentConfigDump,
		stringifyStudentConfigDump,
	} from "../helpers";

	export let students: StudentConfig[] = [];

	let studentsRaw = stringifyStudentConfigDump(students);
	$: students = parseStudentConfigDump(studentsRaw);
</script>

<label>
	<h2>
		{students.length}
		{students.length === 1 ? "student" : "students"}
	</h2>
	<p>Each row should have the username and password separated by a tab.</p>

	<textarea bind:value={studentsRaw} />

	{#if students.length > 0}
		<table>
			<thead>
				<tr>
					<td>username</td>
					<td>password</td>
				</tr>
			</thead>
			<tbody>
				{#each students as student}
					<tr>
						<td>{student.username}</td>
						<td>{student.password}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</label>

<style>
	table {
		width: auto;
	}
</style>
