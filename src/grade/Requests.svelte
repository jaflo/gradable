<script lang="ts">
	import {
		collectedRequests,
		fileModificationTimes,
		homework,
		student,
	} from "../stores";

	$: dueDate = new Date($homework.dueDate + " 23:59:59").getTime();
	let latest = 0;

	function getLastChangeTime(times, url) {
		url = url.split("?")[0];
		return (
			times[url] ||
			times[url + "index.html"] ||
			times[url + "index.htm"] ||
			times[url + "index.php"]
		);
	}

	$: requests = $collectedRequests
		.map((request) => ({
			...request,
			lastModified: getLastChangeTime(
				$fileModificationTimes,
				request.url
			),
			displayUrl: request.url.split($student.username)[1] || request.url,
		}))
		.map((request) => ({
			...request,
			daysLate: daysLate(request.lastModified, dueDate),
		}));

	$: {
		const daysLateDiffs = requests
			.filter((request) => !!request.lastModified)
			.map((request) => daysLate(request.lastModified, dueDate));
		latest = Math.max(...daysLateDiffs);
		latest = isFinite(latest) ? latest : 0;
	}

	function daysLate(time, dueDateEpoch) {
		const epochTime = new Date(time).getTime();
		const diff = (dueDateEpoch - epochTime) / 1000;
		const days = -Math.floor(Math.min(0, diff / 60 / 60 / 24));
		return days > 0 ? days : 0;
	}

	function clearRequests() {
		$collectedRequests = [];
	}
</script>

<div class="summary" class:late={latest > 0}>
	<div>
		Most recent change made {latest}
		{latest === 1 ? "day" : "days"} late.
	</div>
	<a href="#clear" on:click|preventDefault={clearRequests}>Clear</a>
</div>

<div class="wrap">
	<table>
		{#each requests as request}
			<tr>
				<td>{request.statusCode}</td>
				{#if request.lastModified}
					<td>
						{#if request.daysLate > 0}
							<div class="latebadge">{request.daysLate}</div>
						{/if}
						{new Date(request.lastModified).toLocaleString()}
					</td>
				{:else}
					<td>
						<i>unknown</i>
					</td>
				{/if}
				<td title={request.url}>
					<a href={request.url} target="_blank">
						{request.displayUrl}
					</a>
				</td>
			</tr>
		{:else}
			<tr><i>No requests logged</i></tr>
		{/each}
	</table>
	<div class="fade" />
</div>

<style>
	.wrap {
		padding-bottom: var(--default-pad);
		position: relative;
	}

	.fade {
		position: absolute;
		top: 0;
		right: calc(-1 * var(--default-pad));
		bottom: 0;
		width: calc(2 * var(--default-pad));
		background: linear-gradient(
			90deg,
			rgba(230, 230, 230, 0) 0%,
			rgba(230, 230, 230, 1) 100%
		);
	}

	table {
		white-space: nowrap;
	}

	.summary {
		color: var(--background);
		background: var(--good-dark);
		padding: 0.5em;
		display: flex;
	}

	.summary div {
		flex: 1;
	}

	.summary a {
		color: inherit;
	}

	.late,
	.latebadge {
		color: var(--background);
		background: var(--attention);
	}

	.latebadge {
		display: inline-block;
		border-radius: 9em;
		font-size: 0.8em;
		padding: 0.1em 0.5em;
	}
</style>
