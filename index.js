import express from 'express';
import joinRouter from './Routes/join.js';
import userRouter from './Routes/user.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send("Nothin' here");
});

app.use('/api', joinRouter);
app.use('/api/user', userRouter);

const server = app.listen(process.env.PORT, () => {
  console.log(`Roundtable Chat Server listening on port ${process.env.port}`);
});
