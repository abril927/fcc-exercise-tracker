import * as express from 'express';
import { default as BodyParser } from 'body-parser';

import { prisma } from '../database';
import { User } from '@prisma/client';
import { APIUser, PartialAPIUser } from '../schema/api_types';

const router = express.Router();

router.get('/api/users', async (req, res) => {
	const users = await prisma.user.findMany({
		include: {
			exercises: false
		}
	});
	return res.json(users.map(user => new PartialAPIUser(user)));
});

router.post('/api/users', BodyParser.urlencoded({ extended: false }), async (req, res) => {
	const username: string = req.body.username;
	if (!username) return res.status(400).json({ error: 'username is required' });

	let newUser: User;
	try {
		newUser = await prisma.user.create({
			data: {
				username: username
			}
		});
	} catch(reason) {
		console.error('error during user creation: ' + reason);
		return res.status(500).json({ error: 'an internal database error occured' });
	}

	return res.json(new PartialAPIUser(newUser));
});

export { router };