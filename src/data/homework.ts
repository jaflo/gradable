import { homework, student } from "../stores";

let gradedStudents = [];
let skipval = 0;

// butchered from Mulberry32 generator
function viaMulberry32(a) {
	let t = (a += 0x6d2b79f5);
	t = Math.imul(t ^ (t >>> 15), t | 1);
	t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
	return (t ^ (t >>> 14)) >>> 0;
}

homework.subscribe((hw) => {
	gradedStudents = hw?.students.map((student) => student.username) || [];
	skipval = viaMulberry32(hw?.number);
});

// get the next student ID, skipAhead can be used to get future
export function getNextStudentId(skipStudentId?: string) {
	const studentIds = JSON.parse(localStorage.getItem("config")).students.map(
		(student) => student.username
	);
	const left = studentIds.filter(
		(id) => !gradedStudents.includes(id) && id !== skipStudentId
	);
	const leftStudentCount = left.length;

	if (leftStudentCount > 0) {
		return left[skipval % leftStudentCount];
	} else {
		return null;
	}
}

export function loadNextStudent() {
	const chosenId = getNextStudentId();

	if (chosenId) {
		student.set({
			username: chosenId,
			commentIds: [],
		});
	} else {
		student.set(null);
	}
}
