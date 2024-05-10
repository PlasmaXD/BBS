import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import postsRouter from './routes/posts';

dotenv.config();

const app: Application = express();
const port: string | number = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const uri: string = process.env.ATLAS_URI!;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

app.use('/posts', postsRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
