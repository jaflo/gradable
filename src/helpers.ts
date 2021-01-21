import * as timeagoJS from "timeago.js";

export function timeago(time) {
	return timeagoJS.format(new Date(time));
}

export function calculateScore(
	commentIds: number[],
	possibleComments: Comment[]
): number {
	let points = 100;
	for (const comment of commentIds) {
		points -= possibleComments[comment].points;
	}
	return points;
}

export function messageExtension(message) {
	document.body.dataset.tellExtension = JSON.stringify(message);
}

export function getHomeworkFolder(url) {
	return url.split("/")[5];
}
