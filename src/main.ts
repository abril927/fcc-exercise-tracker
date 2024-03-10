import * as dotenv from 'dotenv';
dotenv.config();

import { prisma } from './database';
import { ShortURL } from '@prisma/client';

import { default as express, Express } from 'express';
import { default as cors } from 'cors';
import { default as BodyParser } from 'body-parser';

import { default as dns } from 'dns';

let app = express();
app.use(cors({ optionsSuccessStatus: 200 }));

app.get('/', async (req, res) => {
	const count = await prisma.shortURL.count();
	res.send(`There are currently ${count} short URLs. API: GET /api/shorturl/:id, POST /api/shorturl`);
});

// Status codes are commented out because freeCodeCamp fails the test if they're there...

app.get('/api/shorturl/:id', async (req, res) => {
	const id = parseInt(req.params.id);
	if (isNaN(id)) return res/*.status(401)*/.json({ error: 'Invalid ID' });
	const shortURL = await prisma.shortURL.findUnique({
		where: {
			id: id
		}
	});

	if (shortURL != null) {
		return res.redirect(shortURL.url);
	} else {
		return res/*.status(404)*/.json({ error: 'ID not found' });
	}
});

app.post('/api/shorturl', BodyParser.urlencoded({ extended: false }), async (req, res) => {
	const url = req.body.url;
	let parsed: URL;

	try {
		parsed = new URL(url);
	} catch (e) {
		return res/*.status(400)*/.json({ error: 'invalid url' });
	}
	
	dns.lookup(parsed.hostname, async (err) => {
		if (err) {
			return res/*.status(400)*/.json({ error: 'invalid url' });
		} else {
			let newShortURL: ShortURL;
			try {
				newShortURL = await prisma.shortURL.create({
					data: {
						url: parsed.toString()
					}
				});
			} catch(reason) {
				console.error('error during shorturl creation: ' + reason);
				return res.status(500).json({ error: 'an internal database error occured' });
			}

			return res.json({
				original_url: parsed.toString(),
				short_url: newShortURL.id
			});
		}
	});
});

app.listen(process.env.PORT || 3000, () => {
	console.log('Ready, listening on port ' + (process.env.PORT || 3000));
});