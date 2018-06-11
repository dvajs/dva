const express = require('express');
const fs = require('fs');

const app = express();

app.use(
  express.static(__dirname + '/build', {
    maxAge: 60000,
  })
);

app.listen(5000);
console.log('Listening on port 5000');
