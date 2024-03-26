'use strict';

const express = require('express');

// Constants
const PORT = process.env.APP_PORT_NUMBER || 80;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.send('Jay Shree Krishna! Welcome to the world of DevOps!...');
});

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});
