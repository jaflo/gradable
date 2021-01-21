<script lang="ts">
	import { homework, student } from "../stores";
	import NegativePointBox from "./NegativePointBox.svelte";

	export let comment: Comment;
	export let commentId: number;

	function toggleComment(add, commentId) {
		if (add) {
			if (!$student.commentIds.includes(commentId)) {
				$student.commentIds = [...$student.commentIds, commentId];
			}
		} else {
			$student.commentIds = $student.commentIds.filter(
				(id) => id !== commentId
			);
		}
	}

	function update() {
		$homework.possibleComments[commentId] = comment;
	}

	$: isSelected = $student.commentIds.includes(commentId);
</script>

<tr class:inactive={!isSelected}>
	<td class="comment">
		<input
			type="text"
			placeholder="Missing name"
			bind:value={comment.text}
			on:change={update}
		/>
	</td>
	<td>
		<NegativePointBox bind:value={comment.points} on:change={update} />
	</td>
	<td class="toggle" on:click={() => toggleComment(!isSelected, commentId)}>
		<input
			type="checkbox"
			checked={isSelected}
			on:change={(e) => toggleComment(e.target.checked, commentId)}
		/>
	</td>
</tr>

<style>
	.inactive {
		opacity: 0.4;
	}

	input {
		margin: 0;
	}

	.comment {
		width: 100%;
	}

	.comment input {
		width: 100%;
	}

	.toggle {
		padding: 0 1em;
	}
</style>
