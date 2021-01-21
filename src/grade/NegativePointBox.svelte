<script lang="ts">
	export let value;
</script>

<div class="join">
	<div class="minus">-</div>
	<input
		type="number"
		class="points"
		placeholder="5"
		bind:value
		on:keyup|preventDefault
		on:blur
		on:change
	/>
</div>

<style>
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	input[type="number"] {
		-moz-appearance: textfield;
	}

	input {
		margin: 0;
	}

	.join {
		display: flex;
	}

	.minus {
		position: absolute;
		padding: 0.4em;
		pointer-events: none;
	}

	.points {
		width: 3.5em;
		padding-left: 1em;
	}
</style>
