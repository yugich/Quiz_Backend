const PASSWORD = process.env.PASSWORD; // Defina sua senha aqui

// Middleware para proteção por senha
const passwordProtect = (req, res, next) => {
  const urlPath = req.path;

  // Permitir acesso a qualquer coisa que comece com /chat e login.html sem senha
  if (urlPath.startsWith('/chat') || urlPath === '/login.html' || urlPath === '/login') {
    return next();
  }

  const authToken = req.cookies.authToken;

  if (authToken && authToken === PASSWORD) {
    return next();
  }
  
  res.redirect('/login.html');
};

module.exports = passwordProtect;
