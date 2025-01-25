import express from 'express';
import fs from 'fs';
import path from 'path';

/* CONSTANTS */
// ANSI
const greenFont = '\x1b[38;5;10m';
const redFont = '\x1b[38;5;9m';
const yellowFont = '\x1b[38;5;11m'
const boldFont = '\x1b[1m';
const resetFont = '\x1b[0m';
// GLOBAL
const logFile = path.join(__dirname, '../../server.log');

/* BASIC SERVER CONFIG */
const app = express();
const PORT = process.env.PORT ?? 3000;

/* MIDDLEWARE */
app.use(express.json());

/* ROUTES */
app.get('/api/forms/list', (req, res, next) => {
	logMessage(`${yellowFont}Received GET Request /api/forms/list${resetFont}`);
	res.send('Hello World');
	next();
})

try{
	app.listen(PORT, () => {
		console.log(`${boldFont}${greenFont}Server listening in PORT: ${PORT}${resetFont}\n`);
	})
} catch(err){
	console.error(`ERR: ${boldFont}${redFont}Server initialization error${resetFont}`, err);
}


/* SUPPORT FUNCTIONS */
function logMessage(message: string){
	const timestamp = new Date().toISOString();
	fs.appendFileSync(logFile, `${message}\n`, 'utf-8');
}
