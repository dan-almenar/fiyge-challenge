import express from 'express';

/* ANSI */
const greenFont = '\x1b[38;5;10m';
const redFont = '\x1b[38;5;9m';
const boldFont = '\x1b[1m';
const resetFont = '\x1b[0m';

/* BASIC SERVER CONFIG */
const app = express();
const PORT = process.env.PORT ?? 3000;

/* MIDDLEWARE */
app.use(express.json());

/* ROUTES */
app.get('/api/forms/list', (req, res, next) => {
	console.log(req.headers);
	res.send('Hello World');
	next();
})

try{
	app.listen(PORT, () => {
		console.log(`${boldFont}${greenFont} Server listening in PORT: ${PORT}${resetFont}`);
	})
} catch(err){
	console.error(`${boldFont}${redFont}Server initialization error${resetFont}`, err);
}


/* SUPPORT FUNCTIONS */
