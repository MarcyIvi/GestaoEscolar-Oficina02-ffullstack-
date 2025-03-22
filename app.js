const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Rota para uma URL raiz
app.get('/', (req, res) => {
    // res.send('Página Inicial')
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/sobre', (req, res) => {
    // res.send('Página Sobre')
    res.sendFile(path.join(__dirname, 'sobre.html'));

});

app.listen(port, () => { 
    console.log(`Servidor rodando em http://localhost:3000/`)
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servido rodando na porta ${PORT}`);
});