<script lang="ts">
	import { homework, student } from "../stores";
	import CommentRow from "./CommentRow.svelte";
	import NegativePointBox from "./NegativePointBox.svelte";

	let points = "";
	let commentText = "";

	function handleKeyup(e) {
		if (e.code == "Enter") {
			checkForAdd();
		}
	}

	function checkForAdd() {
		if (points && commentText) {
			let index = $homework.possibleComments
				.map((comment) => comment.text)
				.indexOf(commentText);
			// update shared store
			if (index === -1) {
				index = $homework.possibleComments.length;
				$homework.possibleComments = [
					...$homework.possibleComments,
					{
						text: commentText,
						points: parseInt(points, 10),
					} as Comment,
				];
			} else {
				$homework.possibleComments[index].points = parseInt(points, 10);
			}
			// and add to student
			if (!$student.commentIds.includes(index)) {
				$student.commentIds = [...$student.commentIds, index];
			}
			// clear inputs
			points = commentText = "";
		}
	}
</script>

<table>
	{#each $homework.possibleComments as comment, commentId}
		<CommentRow {comment} {commentId} />
	{/each}
	<tr>
		<td class="comment">
			<input
				type="text"
				bind:value={commentText}
				placeholder="Missing name"
				on:keyup|preventDefault={handleKeyup}
				on:blur={checkForAdd}
			/>
		</td>
		<td>
			<NegativePointBox
				bind:value={points}
				on:keyup={handleKeyup}
				on:blur={checkForAdd}
			/>
		</td>
		<td />
	</tr>
</table>

<small>
	Use the checkboxes to the right to mark off points. To add a new penalty,
	enter a comment and the number of points to remove. Changing text or points
	will update for all students.
</small>

<style>
	table {
		border-collapse: collapse;
		padding: 0;
		margin-bottom: 0.5em;
	}

	.comment {
		width: 100%;
	}

	.comment input {
		width: 100%;
		margin: 0;
	}

	small {
		margin-bottom: 1em;
	}
</style>
