require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const passwordProtect = require('./middlewares/passwordProtect');

app.use(express.json());
app.use(cookieParser());

app.use('/index.html', passwordProtect);
app.use('/edit.html', passwordProtect);
app.use('/user-dashboard.html', passwordProtect);
app.use('/draw.html', passwordProtect);

app.use(express.static(path.join(__dirname, 'public')));

const quizRegisterRouter = require('./api/quiz-register');
app.use('/api/quiz', quizRegisterRouter);

const userRegisterRouter = require('./api/user-register');
app.use('/api/users', userRegisterRouter);

const PASSWORD = process.env.PASSWORD;

app.post('/login', (req, res) => {
    const { password } = req.body;
  
    if (password === PASSWORD) {
      res.status(200).send();
    } else {
      res.status(401).send('Invalid password');
    }
  });
  
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
