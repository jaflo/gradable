import { homework, student } from "../stores";

let gradedStudents = [];

homework.subscribe(
	(hw) =>
		(gradedStudents = hw && hw.students.map((student) => student.username))
);

export function loadNextStudent() {
	const studentIds = JSON.parse(localStorage.getItem("config")).students.map(
		(student) => student.username
	);
	const left = studentIds.filter((id) => !gradedStudents.includes(id));

	if (left.length > 0) {
		const chosenId = left[Math.floor(Math.random() * left.length)];

		student.set({
			username: chosenId,
			commentIds: [],
		});
	} else {
		student.set(null);
	}
}
