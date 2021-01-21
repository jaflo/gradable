<script lang="ts">
	import { onDestroy } from "svelte";
	import { loadNextStudent } from "../data/homework";
	import { getModificationTimes } from "../data/server";
	import {
		messageExtension,
		calculateScore,
		getHomeworkFolder,
	} from "../helpers";
	import {
		student,
		homework,
		collectedRequests,
		fileModificationTimes,
		config,
	} from "../stores";
	import Browser from "./Browser.svelte";
	import Comments from "./Comments.svelte";
	import Requests from "./Requests.svelte";
	import StudentJumper from "./StudentJumper.svelte";

	$: score = calculateScore($student.commentIds, $homework.possibleComments);
	$: embeddedUrl = `${$homework.prefix}/${$student.username}/`;
	$: progress = $homework.students.length / $config.studentIds.length;

	let displayUrl = "";
	let iframeRef;

	const observer = new MutationObserver((mutationsList) => {
		if (
			mutationsList.find(
				(mutation) => mutation.attributeName === "data-newest-request"
			)
		) {
			const newRequest = JSON.parse(document.body.dataset.newestRequest);
			$collectedRequests = [newRequest, ...$collectedRequests];
		}
		if (
			mutationsList.find(
				(mutation) => mutation.attributeName === "data-embedded-url"
			)
		) {
			const prevUrl = displayUrl;
			displayUrl = JSON.parse(document.body.dataset.embeddedUrl);
			// if the part after the username changed
			if (getHomeworkFolder(prevUrl) !== getHomeworkFolder(displayUrl)) {
				$collectedRequests = [$collectedRequests[0]];
				const basePath = displayUrl.substring(
					0,
					displayUrl.lastIndexOf("/")
				);
				getModificationTimes(displayUrl, basePath, $config)
					.then((files) => {
						files.forEach(({ name, time }) => {
							$fileModificationTimes[name] = time;
						});
						$fileModificationTimes = $fileModificationTimes;
					})
					.catch((e) => {
						// ignore error
					});
			}
		}
	});
	observer.observe(document.body, { attributes: true });

	onDestroy(() => {
		observer.disconnect();
	});

	function continueWithNextStudent() {
		messageExtension({ type: "clear-cookies" });
		$homework.students = [...$homework.students, $student];
		$collectedRequests = [];
		loadNextStudent();
	}

	function resetAndRegrade() {
		messageExtension({ type: "clear-cookies", value: displayUrl });
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

<div class="progress">
	<div style="width:{progress * 100}%" />
</div>

<div class="wrapper">
	<div class="sidebar">
		<h1>Grading homework {$homework.number}</h1>
		<div>
			Due <input type="date" bind:value={$homework.dueDate} />
			<button on:click={clearHomework}>Discard all progress</button>
		</div>
		<h2>
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

		<div class="actions">
			<!-- <button on:click={unlockCurrent} disabled={!getHomeworkFolder(url)}>
				Unlock {getHomeworkFolder(url) || ""}
			</button>
			<button on:click={lockCurrent} disabled={!getHomeworkFolder(url)}>
				Lock {getHomeworkFolder(url) || ""}
			</button> -->
		</div>

		<Requests />
	</div>

	<div class="browser">
		<Browser {embeddedUrl} {displayUrl} bind:iframeRef />
	</div>
</div>

<style>
	h1 {
		margin: 0 0 0.3em 0;
	}

	.wrapper {
		display: flex;
		width: 100%;
		height: 100%;
	}

	.sidebar {
		flex-grow: 1;
		flex-basis: 400px;
		width: 400px;
		margin-right: 20px;
		display: flex;
		flex-direction: column;
	}

	.browser {
		flex-grow: 9999;
		flex-basis: 0;
		display: flex;
	}

	.next {
		background: #39393a;
		color: #e6e6e6;
		margin-right: 0;
	}

	.progress {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
	}

	.progress div {
		background: #297373;
		height: 4px;
	}

	h2 {
		display: flex;
		margin-bottom: 0;
	}

	h2 div {
		flex: 1;
	}
</style>
