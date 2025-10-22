// const express = require('express');
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const session = require('express-session');
// const { google } = require('googleapis');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// // Разрешаем фронтенду обращаться к бекенду
// app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// // Сессии
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
// }));

// app.use(passport.initialize());
// app.use(passport.session());

// // Сериализация пользователя
// passport.serializeUser((user, done) => done(null, user));
// passport.deserializeUser((user, done) => done(null, user));

// // Google OAuth2
// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: 'http://localhost:4000/auth/google/callback',
//   scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly']
// }, (accessToken, refreshToken, profile, done) => {
//   if (!accessToken) return done(new Error('No access token received'));
//   return done(null, { profile, accessToken });
// }));

// // Вход через Google
// app.get('/auth/google', passport.authenticate('google'));

// // Callback после входа
// app.get('/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: '/' }),
//   (req, res) => res.redirect(`${process.env.FRONTEND_URL}/events`)
// );

// // Получение событий на сегодня
// app.get('/events', async (req, res) => {
//   if (!req.user || !req.user.accessToken) return res.status(401).send('Не авторизован');

//   const { OAuth2 } = google.auth;
//   const oAuth2Client = new OAuth2(
//     process.env.GOOGLE_CLIENT_ID,
//     process.env.GOOGLE_CLIENT_SECRET
//   );
//   oAuth2Client.setCredentials({ access_token: req.user.accessToken });

//   const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

//   try {
//     const response = await calendar.events.list({
//       calendarId: 'primary',
//       singleEvents: true,
//       orderBy: 'startTime',
//       maxResults: 50,
//     });

//     const now = new Date();
//     const events = response.data.items.filter(event => {
//       const startStr = event.start.dateTime || event.start.date;
//       const startDate = new Date(startStr);
//       return startDate.getFullYear() === now.getFullYear() &&
//              startDate.getMonth() === now.getMonth() &&
//              startDate.getDate() === now.getDate();
//     });

//     res.json(events);
//   } catch (err) {
//     console.error('Ошибка при получении событий:', err);
//     res.status(500).send(err.message || err);
//   }
// });

// // Запуск сервера
// app.listen(4000, () => console.log('Backend running on http://localhost:4000'));



// const express = require('express');
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const session = require('express-session');
// const { google } = require('googleapis');
// const cors = require('cors');
// const { Pool } = require('pg');
// require('dotenv').config();

// const app = express();

// // Разрешаем фронтенду обращаться к бекенду
// app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// // Сессии
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
// }));

// app.use(passport.initialize());
// app.use(passport.session());

// // PostgreSQL подключение
// const pool = new Pool({
//   host: process.env.PG_HOST,
//   user: process.env.PG_USER,
//   password: process.env.PG_PASSWORD,
//   database: process.env.PG_DATABASE,
//   port: process.env.PG_PORT || 5432,
// });

// // Сериализация пользователя
// passport.serializeUser((user, done) => done(null, user));
// passport.deserializeUser((user, done) => done(null, user));

// // Google OAuth2
// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: 'http://localhost:4000/auth/google/callback',
//   scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly']
// }, (accessToken, refreshToken, profile, done) => {
//   if (!accessToken) return done(new Error('No access token received'));
//   return done(null, { profile, accessToken });
// }));

// // Вход через Google
// app.get('/auth/google', passport.authenticate('google'));

// // Callback после входа
// app.get('/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: '/' }),
//   (req, res) => res.redirect(`${process.env.FRONTEND_URL}/events`)
// );

// // Получение событий на сегодня и сохранение в PostgreSQL
// app.get('/events', async (req, res) => {
//   if (!req.user || !req.user.accessToken) return res.status(401).send('Не авторизован');

//   const { OAuth2 } = google.auth;
//   const oAuth2Client = new OAuth2(
//     process.env.GOOGLE_CLIENT_ID,
//     process.env.GOOGLE_CLIENT_SECRET
//   );
//   oAuth2Client.setCredentials({ access_token: req.user.accessToken });

//   const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

//   try {
//     const response = await calendar.events.list({
//       calendarId: 'primary',
//       singleEvents: true,
//       orderBy: 'startTime',
//       maxResults: 50,
//     });

//     const now = new Date();
//     const events = response.data.items.filter(event => {
//       const startStr = event.start.dateTime || event.start.date;
//       const startDate = new Date(startStr);
//       return startDate.getFullYear() === now.getFullYear() &&
//              startDate.getMonth() === now.getMonth() &&
//              startDate.getDate() === now.getDate();
//     });

//     // Сохраняем события в PostgreSQL
//     for (const event of events) {
//       const google_event_id = event.id;
//       const summary = event.summary || '';
//       const start_time = event.start.dateTime || event.start.date;
//       const end_time = event.end.dateTime || event.end.date;

//       await pool.query(`
//         INSERT INTO events (google_event_id, summary, start_time, end_time)
//         VALUES ($1, $2, $3, $4)
//         ON CONFLICT (google_event_id) DO NOTHING
//       `, [google_event_id, summary, start_time, end_time]);
//     }

//     // Отправляем события на фронтенд
//     res.json(events);

//   } catch (err) {
//     console.error('Ошибка при получении событий:', err);
//     res.status(500).send(err.message || err);
//   }
// });

// // Запуск сервера
// app.listen(4000, () => console.log('Backend running on http://localhost:4000'));

const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const { google } = require('googleapis');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Разрешаем фронтенду обращаться к бекенду
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true, // обязательно, чтобы передавались cookies
}));

// Настройка сессий
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // true если HTTPS
    sameSite: 'lax', // важно для работы на разных портах
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// PostgreSQL подключение
const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT || 5432,
});

// Passport: сериализация
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Google OAuth2
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:4000/auth/google/callback',
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly']
}, (accessToken, refreshToken, profile, done) => {
  if (!accessToken) return done(new Error('No access token received'));
  return done(null, { profile, accessToken });
}));

// Вход через Google
app.get('/auth/google', passport.authenticate('google'));

// Callback после входа
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/', session: true }),
  (req, res) => res.redirect(`${process.env.FRONTEND_URL}/events`)
);

// Получение событий на сегодня и сохранение в PostgreSQL
app.get('/events', async (req, res) => {
  if (!req.user || !req.user.accessToken) return res.status(401).send('Не авторизован');

  const { OAuth2 } = google.auth;
  const oAuth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oAuth2Client.setCredentials({ access_token: req.user.accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50,
    });

    const now = new Date();
    const events = response.data.items.filter(event => {
      const startStr = event.start.dateTime || event.start.date;
      const startDate = new Date(startStr);
      return startDate.getFullYear() === now.getFullYear() &&
             startDate.getMonth() === now.getMonth() &&
             startDate.getDate() === now.getDate();
    });

    // Сохраняем события в PostgreSQL
    for (const event of events) {
      await pool.query(`
        INSERT INTO events (google_event_id, summary, start_time, end_time)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (google_event_id) DO NOTHING
      `, [
        event.id,
        event.summary || '',
        event.start.dateTime || event.start.date,
        event.end.dateTime || event.end.date
      ]);
    }

    // Отправляем события на фронтенд
    res.json(events);

  } catch (err) {
    console.error('Ошибка при получении событий:', err);
    res.status(500).send(err.message || err);
  }
});

// Запуск сервера
app.listen(4000, () => console.log('Backend running on http://localhost:4000'));

