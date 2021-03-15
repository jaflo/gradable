export function resetLocalStorage(checkpointCount) {
	if (
		confirm(
			"You are about to DELETE EVERYTHING, including your authentication token and " +
				checkpointCount +
				" checkpoints. Make sure to delete the server config if you do not have a backup of the token. " +
				"Are you sure you want to continue?"
		)
	) {
		localStorage.clear();
		window.location = window.location;
	}
}
