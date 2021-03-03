<script lang="ts">
	import { student, homework, config, failedUnlocks } from "../stores";
	import { lock, unlock } from "../data/server";
	import { getNextStudentId } from "../data/homework";
	import { onDestroy } from "svelte";

	const MAX_HISTORY = 5;

	enum RequestStatus {
		Pending,
		Success,
		Failed,
	}

	interface LockRequest {
		username: string;
		lock: boolean;
		status: RequestStatus;
		details: string;
	}

	let prefix = $homework.prefix;

	let requests: LockRequest[] = [];
	let lockedCurrentStudent = false;
	let showDetails = false;
	let unseenError = false;
	let aggregateStatus = RequestStatus.Success;
	let inflightBeforeUnloadPending = false;

	let prevUsername = null;

	function unlockLockWhereNeeded() {
		let pendingRequests = [];

		if (prevUsername) {
			pendingRequests.push(queueRequest(prevUsername, true /* lock */));
		} else if ($student) {
			// we just started grading
			pendingRequests.push(
				queueRequest($student.username, false /* unlock */)
			);
		}

		const nextStudentId = $student && getNextStudentId($student.username);
		if (nextStudentId) {
			pendingRequests.push(
				queueRequest(nextStudentId, false /* unlock */)
			);
		}

		lockedCurrentStudent = false;

		return Promise.all(pendingRequests);
	}

	$: if (prevUsername !== $student.username) {
		unlockLockWhereNeeded();
		prevUsername = $student.username;
	}

	onDestroy(() => {
		// lock up last student when homework is about to be finished
		if (prevUsername) {
			queueRequest(prevUsername, true /* lock */);
		}
	});

	function queueRequest(username: string, wantsLock: boolean) {
		const url = `${prefix}/${username}/`;

		const request: LockRequest = {
			username,
			lock: wantsLock,
			status: RequestStatus.Pending,
			details: "",
		};

		requests = [request, ...requests];

		return new Promise<void>((resolve, reject) => {
			(wantsLock ? lock : unlock)(url, username, $config)
				.then((response) => {
					if (!response.success) {
						unseenError = true;
						request.status = RequestStatus.Failed;
						request.details = response.result;
						$failedUnlocks[username] = request.details;
					} else {
						request.status = RequestStatus.Success;
						resolve();
					}
					requests = requests.slice(0, MAX_HISTORY);
				})
				.catch((error) => {
					unseenError = true;
					request.status = RequestStatus.Failed;
					request.details = error;
					requests = requests.slice(0, MAX_HISTORY);
					$failedUnlocks[username] = request.details;

					reject(error);
				});
		});
	}

	function beforeUnload(event) {
		if (!lockedCurrentStudent) {
			event.preventDefault();
			event.returnValue = "";
			inflightBeforeUnloadPending = true;

			let exitRequests = [];
			exitRequests.push(queueRequest($student.username, true /* lock */));

			const nextStudentId =
				$student && getNextStudentId($student.username);
			if (nextStudentId) {
				exitRequests.push(queueRequest(nextStudentId, true /* lock */));
			}

			Promise.all(exitRequests).then(() => {
				lockedCurrentStudent = true;
			});

			return "Locking current student's assignment... You can probably close this tab.";
		}
	}

	function resumeFromCancelledUnload() {
		unlockLockWhereNeeded();
		inflightBeforeUnloadPending = false;
	}

	function unlockCurrent() {
		queueRequest($student.username, false /* unlock */);
	}

	function lockCurrent() {
		queueRequest($student.username, true /* lock */);
	}

	$: {
		if (requests.find((r) => r.status === RequestStatus.Pending)) {
			aggregateStatus = RequestStatus.Pending;
		} else if (unseenError) {
			aggregateStatus = RequestStatus.Failed;
		} else {
			aggregateStatus = RequestStatus.Success;
		}
	}

	function toggleDetails() {
		showDetails = !showDetails;
		unseenError = false;
	}
</script>

<svelte:window on:beforeunload={beforeUnload} />

<button on:click={toggleDetails} class="entry">
	{#if aggregateStatus === RequestStatus.Pending}
		⌛
	{:else if aggregateStatus === RequestStatus.Success}
		✔️
	{:else if aggregateStatus === RequestStatus.Failed}
		❌
	{/if}
</button>

{#if showDetails || inflightBeforeUnloadPending}
	<div class="details">
		<div class="split actions">
			<div>
				{$student.username}
			</div>
			<button on:click={unlockCurrent}>Unlock</button>
			<button on:click={lockCurrent}>Lock</button>
		</div>

		<small>
			Locking and unlocking is not instant. You might need to wait a
			minute or two until changes take effect. Use the refresh button to
			check.
		</small>

		<div class="requests">
			{#each requests as { username, lock, status, details }, i}
				<div style="opacity:{(MAX_HISTORY - i) / MAX_HISTORY}">
					<div class="split">
						<div>{username} ({lock ? "lock" : "unlock"})</div>
						{#if status === RequestStatus.Pending}
							waiting
						{:else if status === RequestStatus.Success}
							done
						{:else if status === RequestStatus.Failed}
							failed
						{/if}
					</div>
					{#if status === RequestStatus.Failed}
						<pre>{details}</pre>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}

{#if inflightBeforeUnloadPending}
	<div
		class="unloadwarning"
		class:pending={!lockedCurrentStudent}
		on:click|once={resumeFromCancelledUnload}
	>
		<div>
			<h3>
				{#if !lockedCurrentStudent}
					One moment...
				{:else}
					You can safely close this tab
				{/if}
			</h3>

			{#if !lockedCurrentStudent}
				Since some folders were unlocked to grade, we need to grade them
				again before closing this session. A request has been sent.
			{:else}
				Cancel and click anywhere to resume grading.
			{/if}
		</div>
	</div>
{/if}

<style>
	.entry {
		margin: 0;
		background: none;
		border: 0;
	}

	.unloadwarning {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 5;
		padding: var(--default-pad);
		background: var(--background);
	}

	.pending {
		background: var(--attention);
	}

	.unloadwarning div {
		margin-top: calc(var(--default-pad) * 3);
		margin-right: 300px;
		padding-right: calc(var(--default-pad) * 5);
		text-align: right;
	}

	.details {
		position: absolute;
		background: var(--background);
		padding: var(--default-pad);
		width: 300px;
		top: 100%;
		margin-top: var(--default-pad);
		right: var(--default-pad);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 4px;
		z-index: 10;
	}

	.actions {
		align-items: center;
		margin-bottom: var(--default-pad);
	}

	.requests {
		margin-top: var(--default-pad);
	}

	pre {
		overflow-x: auto;
	}
</style>
