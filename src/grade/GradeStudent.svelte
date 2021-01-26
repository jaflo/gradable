<script lang="ts">
	import { loadNextStudent } from "../data/homework";
	import { messageExtension, calculateScore } from "../helpers";
	import {
		student,
		homework,
		collectedRequests,
		config,
		displayUrl,
		fileModificationTimes,
	} from "../stores";
	import Browser from "./Browser.svelte";
	import Comments from "./Comments.svelte";
	import Requests from "./Requests.svelte";
	import StudentJumper from "./StudentJumper.svelte";

	$: score = calculateScore($student.commentIds, $homework.possibleComments);
	$: embeddedUrl = `${$homework.prefix}/${$student.username}/`;
	$: progress = $homework.students.length / ($config.students.length + 1);

	let prevUsername = $student.username;
	$: if (prevUsername !== $student.username) {
		prevUsername = $student.username;
		$collectedRequests = [];
		$fileModificationTimes = {};
	}

	let iframeRef;

	function continueWithNextStudent() {
		messageExtension({ type: "clear-cookies" });
		$homework.students = [...$homework.students, $student];
		loadNextStudent();
	}

	function resetAndRegrade() {
		messageExtension({ type: "clear-cookies", value: $displayUrl });
		$homework.students = $homework.students.filter(
			(storedStudent) => storedStudent.username !== $student.username
		);
		$student.commentIds = [];
		$collectedRequests = [];
		iframeRef.src = embeddedUrl;
	}

	function clearHomework() {
		$homework = null;
		$student = null;
	}
</script>

<div class="wrapper">
	<div class="sidebar">
		<h1>Grading homework {$homework.number}</h1>
		<div class="split">
			<div>
				Due <input type="date" bind:value={$homework.dueDate} />
			</div>
			<button on:click={clearHomework}>Discard all progress</button>
		</div>
		<h2 class="split">
			<div>
				<code>{$student.username}</code>
				({score}%)
			</div>
			<button on:click={resetAndRegrade}>Reset and regrade</button>
		</h2>

		<Comments />

		<button on:click={continueWithNextStudent} class="next">
			{#if score === 100}
				Mark as perfect and continue
			{:else}
				Mark as {score}% and continue
			{/if}
		</button>

		<StudentJumper />

		<Requests />
	</div>

	<div class="browser">
		<Browser {embeddedUrl} bind:iframeRef />
	</div>
</div>

<div class="progress">
	<div style="width:{progress * 100}%" />
</div>

<style>
	h1 {
		margin: 0 0 0.3em 0;
	}

	.wrapper {
		display: flex;
		width: 100%;
		height: 100%;
		--sidebar-width: 400px;
	}

	.sidebar {
		width: var(--sidebar-width);
		margin-right: var(--default-pad);
		display: flex;
		flex-direction: column;
	}

	.browser {
		position: fixed;
		padding: var(--default-pad) 0;
		top: 0;
		bottom: 0;
		right: var(--default-pad);
		left: calc(2 * var(--default-pad) + var(--sidebar-width));
		background: var(--background);
	}

	.next {
		background: var(--text-color);
		color: var(--background);
		margin-right: 0;
	}

	.progress {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
	}

	.progress div {
		background: var(--good-dark);
		height: 4px;
		transition: width 0.3s ease-out;
	}

	.split {
		display: flex;
		margin-bottom: 0;
	}

	.split div {
		flex: 1;
	}
</style>
