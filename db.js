import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();
mongoose.pluralize(null);

const db = mongoose.createConnection(process.env.mongo, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export default db;
