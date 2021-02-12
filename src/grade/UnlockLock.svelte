<script lang="ts">
	import { student, homework, config } from "../stores";
	import { lock, unlock } from "../data/server";
	import { getNextStudentId } from "../data/homework";
	import { onDestroy } from "svelte";
	import { messageExtension } from "../helpers";

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

	let requests: LockRequest[] = [];
	let lockedCurrentStudent = false;
	let waitingOnServer = false;
	let showDetails = false;

	let prevUsername = null;
	$: if (prevUsername !== $student.username) {
		if (prevUsername) {
			queueRequest(prevUsername, true /* lock */);
		} else if ($student) {
			// we just started grading
			queueRequest($student.username, false /* unlock */);
		}

		const nextStudentId = $student && getNextStudentId($student.username);
		if (nextStudentId) {
			queueRequest(nextStudentId, false /* unlock */);
		}

		lockedCurrentStudent = false;
		prevUsername = $student.username;
	}

	onDestroy(() => {
		// lock up last student when homework is about to be finished
		if (prevUsername) {
			queueRequest(prevUsername, true /* lock */);
		}
	});

	function queueRequest(
		username: string,
		wantsLock: boolean,
		callback?: Function
	) {
		const url = `${$homework.prefix}/${username}/`;

		const request: LockRequest = {
			username,
			lock: wantsLock,
			status: RequestStatus.Pending,
			details: "",
		};

		requests = [request, ...requests];

		(wantsLock ? lock : unlock)(url, username, $config)
			.then((response) => {
				if (!response.success) {
					request.status = RequestStatus.Failed;
					request.details = response.result;
				} else {
					request.status = RequestStatus.Success;
					if (callback) callback();
				}
				requests = requests.slice(0, 5);
			})
			.catch((error) => {
				request.status = RequestStatus.Failed;
				request.details = error;
				requests = requests.slice(0, 5);
			});
	}

	function beforeUnload(event) {
		if (!lockedCurrentStudent) {
			queueRequest(
				$student.username,
				true /* lock */,
				() => (lockedCurrentStudent = true)
			);

			event.preventDefault();
			event.returnValue = "";
			return "Locking current student's assignment... You can probably close this tab.";
		}
	}

	function unlockCurrent() {
		queueRequest($student.username, false /* unlock */, () => {
			waitingOnServer = true;
			messageExtension({ type: "refresh-page" });
		});
	}

	function lockCurrent() {
		queueRequest($student.username, true /* lock */, () => {
			waitingOnServer = true;
			messageExtension({ type: "refresh-page" });
		});
	}

	let aggregateStatus = RequestStatus.Success;
	$: {
		if (requests.find((r) => r.status === RequestStatus.Failed)) {
			aggregateStatus = RequestStatus.Failed;
		} else if (requests.find((r) => r.status === RequestStatus.Pending)) {
			aggregateStatus = RequestStatus.Pending;
		} else {
			aggregateStatus = RequestStatus.Success;
		}
	}
</script>

<svelte:window on:beforeunload={beforeUnload} />

<button on:click={() => (showDetails = !showDetails)} class="entry">
	{#if aggregateStatus === RequestStatus.Pending}
		⌛
	{:else if aggregateStatus === RequestStatus.Success}
		✔️
	{:else if aggregateStatus === RequestStatus.Failed}
		❌
	{/if}
</button>

{#if showDetails}
	<div class="details">
		<div class="split actions">
			<div>
				{$student.username}
			</div>
			<button on:click={unlockCurrent} disabled={waitingOnServer}>
				Unlock
			</button>
			<button on:click={lockCurrent} disabled={waitingOnServer}>
				Lock
			</button>
		</div>

		<small>
			Locking and unlocking is not instant. You might need to wait a
			minute or two until changes take effect. Use the refresh button to
			check.
		</small>

		<div class="requests">
			{#each requests as { username, lock, status, details }}
				<div>
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

<style>
	.entry {
		margin: 0;
		background: none;
		border: 0;
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
