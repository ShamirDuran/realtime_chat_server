const morgan = require('morgan'); // HTTP request logger middleware for node.js
const bodyParser = require('body-parser'); // Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
const helmet = require('helmet'); // Set security HTTP headers
const xss = require('xss-clean'); // Sanitize user input coming to prevent XSS attacks
const rateLimit = require('express-rate-limit');
const mongosanitize = require('express-mongo-sanitize');
const express = require('express');
const cors = require('cors');
const { port } = require('./src/config/env.config');
const { dbConnection } = require('./src/database/config.db');

const http = require('http');
const app = express();
const server = http.createServer(app);
const routes = require('./src/routes/index');

// Sockets
module.exports.io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});
require('./src/sockets/index');

dbConnection();

// Middlewares
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
);
app.use(express.json({ limit: '10kb' })); // request body size limit
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(helmet());

const limiter = rateLimit({
  limit: 10000,
  windowMs: 15 * 60 * 1000, // 15 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false, // Disable the 'X-RateLimit-*' header
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use(limiter);
app.use(express.urlencoded({ extended: true }));
app.use(mongosanitize());
app.use(xss());
app.use(routes);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
