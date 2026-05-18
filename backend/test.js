const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Servidor funcionando');
});

app.listen(3000, () => {
  console.log('Servidor activo en puerto 3000');
});

setInterval(() => {
  console.log('SIGUE VIVO...');
}, 5000);