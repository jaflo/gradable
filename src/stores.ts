import { writable } from "svelte/store";

function restoredWritable<T>(key, initValue?) {
	const fromStorage = localStorage.getItem(key);
	let value = initValue || null;
	if (fromStorage) {
		value = JSON.parse(fromStorage);
	}

	const store = writable<T>(value);
	store.subscribe((newValue) =>
		localStorage.setItem(key, JSON.stringify(newValue))
	);
	return store;
}

export const config = restoredWritable<ConfigOptions>("config");
export const homework = restoredWritable<Homework>("homework");
export const student = restoredWritable<Student>("student");
export const checkpoints = restoredWritable<Checkpoint[]>("checkpoints", []);

export const collectedRequests = writable<HTTPRequest[]>([]);
export const fileModificationTimes = writable<Record<string, Date>>({});
export const displayUrl = writable<string>("");
export const pluginConnected = writable<boolean>(false);
