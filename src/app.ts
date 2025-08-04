// src/index.js
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import router from './app/router';
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import cors from 'cors'
dotenv.config();

const app: Express = express();
app.use(cors({ origin: '*' }))
//parsers
app.use(express.json());


const port = process.env.PORT || 3000;
// app.use(cookieParser());

/**------------ GLOBAL ERROR HANDLER -------------------*/
app.use(globalErrorHandler);

/** ------------ NOT FOUND URL ------------------- */
app.use(notFound as never);
app.use('/api/v1', router);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});



// app.listen(port, () => {
//   console.log(`[server]: Server is running at http://localhost:${port}`);
// });
// /**------------ GLOBAL ERROR HANDLER -------------------*/
// app.use(globalErrorHandler);

// /** ------------ NOT FOUND URL ------------------- */
// app.use(notFound as never);
export default app;