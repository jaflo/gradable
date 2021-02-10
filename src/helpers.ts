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

const commEl = document.getElementById("comms");
export function messageExtension(message) {
	commEl.dataset.tellExtension = JSON.stringify(message);
}

export function getHomeworkFolder(url) {
	return url.split("/")[5];
}

export function getName(combined: string) {
	const [last, first] = combined
		// uppercase first letter of each word
		.split(" ")
		.map(
			(part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
		)
		.join(" ")
		// split into first name, last name
		.split(";")
		.map((s) => s.trim());

	return {
		first,
		last,
	};
}

export function parseStudentConfigDump(string: string): StudentConfig[] {
	return string
		.split("\n")
		.filter((line) => !!line)
		.map((line) => line.split("\t"))
		.map(([realname, username, password]) => ({
			realname,
			username,
			password,
			canvasId: "",
		}));
}

export function stringifyStudentConfigDump(students: StudentConfig[]): string {
	return students
		.map(
			(student) =>
				`${student.realname}\t${student.username}\t${student.password}`
		)
		.join("\n");
}

export function selectAll(e) {
	e.target.select();
}
