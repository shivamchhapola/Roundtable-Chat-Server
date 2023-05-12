import { Router } from 'express';
import { login, register } from '../Controllers/join.js';

const joinRouter = Router();

joinRouter.post('/register', register);
joinRouter.post('/login', login);

export default joinRouter;
