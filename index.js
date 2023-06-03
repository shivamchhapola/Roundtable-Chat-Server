import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import groupRouter from './Routes/group.js';
import joinRouter from './Routes/join.js';
import userRouter from './Routes/user.js';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send("Nothin' here");
});

app.use('/api', joinRouter);
app.use('/api/user', userRouter);
app.use('/api/group', groupRouter);

const server = app.listen(process.env.PORT, () => {
  console.log(`Roundtable Chat Server listening on port ${process.env.PORT}`);
});
