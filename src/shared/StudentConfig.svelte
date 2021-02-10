<script lang="ts">
	import {
		getName,
		parseStudentConfigDump,
		stringifyStudentConfigDump,
	} from "../helpers";

	export let students: StudentConfig[] = [];
	export let showPasswords = false;

	let studentsRaw = stringifyStudentConfigDump(students);
	$: students = parseStudentConfigDump(studentsRaw);
</script>

<label>
	<h2>
		{students.length}
		{students.length === 1 ? "student" : "students"}
	</h2>
	<p>Each row should have the username and password separated by a tab.</p>

	<textarea bind:value={studentsRaw} rows="1" />

	{#if students.length > 0}
		<table>
			<thead>
				<tr>
					<td>last</td>
					<td>first</td>
					<td>username</td>
					<td>
						<label>
							password
							<input
								type="checkbox"
								bind:checked={showPasswords}
							/>
						</label>
					</td>
				</tr>
			</thead>
			<tbody>
				{#each students as student}
					<tr>
						<td>{getName(student.realname).last}</td>
						<td>{getName(student.realname).first}</td>
						<td>{student.username}</td>
						<td>{showPasswords ? student.password : "••••••••"}</td>
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

	textarea {
		white-space: pre;
		overflow-wrap: normal;
		overflow-x: scroll;
	}
</style>
