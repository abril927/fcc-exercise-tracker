import * as dotenv from 'dotenv';
dotenv.config();

import { prisma } from './database';
import { User } from '@prisma/client';

import { default as express, Express } from 'express';
import { default as cors } from 'cors';
import { default as BodyParser } from 'body-parser';

import { router as users } from './route/users';
import { router as exercises } from './route/exercises';

let app = express();
app.use(cors({ optionsSuccessStatus: 200 }));

app.get('/', async (req, res) => {
	const count = await prisma.user.count();
	res.send(`
		<p>There are currently ${count} users.</p>
		<p>API:</p>
		<ul>
			<li>GET /api/users</li>
			<li>POST /api/users</li>
			<li>GET /api/users/:user/exercises</li>
			<li>GET /api/users/:user/logs</li>
		</ul>
	`);
});

// Routers
app.use(users);
app.use(exercises);

app.listen(process.env.PORT || 3000, () => {
	console.log('Ready, listening on port ' + (process.env.PORT || 3000));
});