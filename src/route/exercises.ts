import * as express from 'express';
import { default as BodyParser } from 'body-parser';

import { prisma } from '../database';
import { Exercise, User } from '@prisma/client';
import { APIExercise, APIUser, PartialAPIUser } from '../schema/api_types';

const router = express.Router();

router.get('/api/users/:id/logs', async (req, res) => {
	const from: Date = new Date(req.query.from as string);
	const to: Date = new Date(req.query.to as string);
	const limit: number = parseInt(req.query.limit as string);

	const user = await prisma.user.findUnique({
		where: {
			id: req.params.id
		},
		include: {
			exercises: true
		}
	});
	if (!user) return res.status(404).json({ error: 'user not found' });

	let apiUser = new APIUser(user);
	apiUser.log = apiUser.log.filter(exercise => 
		(isNaN(from.getTime()) || new Date(exercise.date) >= from) && 
		(isNaN(to.getTime()) || new Date(exercise.date) <= to)
	);
	if (!isNaN(limit)) apiUser.log = apiUser.log.slice(0, limit);
	apiUser.count = apiUser.log.length;

	return res.json(apiUser);
});

router.post('/api/users/:id/exercises', BodyParser.urlencoded({ extended: false }), async (req, res) => {
	let user = await prisma.user.findUnique({
		where: {
			id: req.params.id
		},
		include: {
			exercises: false
		}
	});
	if (!user) return res.status(404).json({ error: 'user not found' });

	const description: string = req.body.description;
	const duration: number = parseInt(req.body.duration);
	let date: Date = new Date(req.body.date);
	if (!description) return res.status(400).json({ error: 'description is required' });
	if (!duration) return res.status(400).json({ error: 'duration is required' });
	if (isNaN(duration)) return res.status(400).json({ error: 'duration must be a number' });
	if (isNaN(date.getTime())) date = new Date(); // default to now... // FIXME: we could handle this better (give an error if date *is* included but is invalid)

	let newExercise: Exercise;
	try {
		newExercise = await prisma.exercise.create({
			data: {
				userId: user.id,
				description: description,
				duration: duration,
				date: date
			}
		});
	} catch(reason) {
		console.error('error during exercise creation: ' + reason);
		return res.status(500).json({ error: 'an internal database error occured' });
	}

	return res.json({...new APIExercise(newExercise), ...new PartialAPIUser(user)});
});

export { router };