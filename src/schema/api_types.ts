// freeCodeCamp requires specific fields to be returned from the API that aren't in the DB schema so we define them here

import { Exercise, Prisma, User } from "@prisma/client";

export class PartialAPIUser {
	_id: string;
	username: string;

	constructor(user: User) {
		this._id = user.id;
		this.username = user.username;
	}
}

export class APIUser extends PartialAPIUser {
	log: APIExercise[];
	count: number;

	constructor(user: Prisma.UserGetPayload<{ 
		include: { exercises: true }
	}>) {
		super(user as User);
		this.log = user.exercises.map(exercise => new APIExercise(exercise));
		this.count = user.exercises.length;
	}	
}

export class APIExercise {
	_id: string;
	description: string;
	duration: number;
	date: string;

	constructor(exercise: Exercise) {
		this._id = exercise.id;
		this.description = exercise.description;
		this.duration = exercise.duration;
		this.date = exercise.date.toDateString();
	}
}