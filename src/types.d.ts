interface Comment {
	text: string;
	points: number;
}

interface Homework {
	number: number;
	dueDate: string;
	students: Student[];
	possibleComments: Comment[];
	prefix: string;
}

interface HTTPRequest {
	statusCode: number;
	url: string;
	method: string;
	responseSize: number;
	lastModified: string;
}

interface Student {
	username: string;
	commentIds: number[];
}

interface Checkpoint {
	label: string;
	lastChange: number;
	homework: Homework;
	currentStudent: Student;
}

interface ConfigOptions {
	token: string;
	endpoint: string;
	students: StudentConfig[];
}

interface StudentConfig {
	realname: string;
	username: string;
	password: string;
	canvasId: string; // unused
}
