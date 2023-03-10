const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const { celebrate, Joi, errors } = require('celebrate');
const cors = require('cors');

const router = require('./routes');

const auth = require('./middlewares/auth');
const errorsHandler = require('./middlewares/errorsHandler');

const { login, createUser, signout } = require('./controllers/users');
const { URL_REGEXP } = require('./utils/statusError');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3005 } = process.env;
const app = express();

mongoose.connect('mongodb://0.0.0.0:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: false,
});

app.use(cors(
  {
    origin: ['http://localhost:3000',
      'http://mesto.full.sergey.nomoredomainsclub.ru'],
  },
));

app.use(express.json());
app.use(cookieParser());

app.post('/api/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi
      .string()
      .pattern(URL_REGEXP),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

app.use(requestLogger);

app.post('/api/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);
app.use(auth);
app.get('/api/signout', signout);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use(router);

app.use(errorLogger);
app.use(errors());
app.use(errorsHandler);

app.listen(PORT, () => {
  console.log(`Сервер запущен на ${PORT} порту`);
});
