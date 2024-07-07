import express from 'express';
import { getBugId, router } from './routes';

const port = Number(process.env.PORT) || 3000;
const basename = '/hw/store';

const app = express();

process.env.BUG_ID = ""

// custom logger for debugging
app.use(async (req, res, next) => {
  if (["css", "js"].includes(req.url.split(".")[1])) {
    console.log("\tstatic: " + req.url);
  } else {
    console.log("BUG_ID = " + getBugId(req));
    console.log("Request on: " + req.url);
  }

  next();
});

app.use(express.json());
app.use(basename, express.static('dist', { index: false }));
app.use(basename, router);

app.listen(port, '::', () => {
    console.log(`Example app listening at http://localhost:${port}${basename}`);
});