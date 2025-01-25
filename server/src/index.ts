import express from 'express';

/* ANSI */
const greenFont = '\x1b[38;5;10m';
const redFont = '\x1b[38;5;10m';
const boldFont = '\x1b[1m';
const resetFont = '\x1b[0m';

/* BASIC SERVER CONFIG */
const app = express();
const PORT = process.env.PORT ?? 3000;

/* MIDDLEWARE */

/* HANDLERS */


app.listen(PORT, () => {
	console.log(`${boldFont}${greenFont} Server listening in PORT: ${PORT}${resetFont}`);
})

/* SUPPORT FUNCTIONS */
