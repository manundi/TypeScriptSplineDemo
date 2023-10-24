const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('dist')) 

app.get('/', async(req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(8080, () => {
    console.log("Sderver successfully running on port 8080");
  });