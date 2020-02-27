const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const User = require('./models/user');	//Importo el modelo creado para User
const routes = require('./routes');	//Importo el enrutador

require('dotenv').config();

// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').config();
// }

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/polls', { useNewUrlParser: true });
mongoose.connection.on("error", function(e) { 
	if(e) {
		console.error(e);
	} else {
		console.log('Conexión Exitosa!');
	}
});

app.set('view engine', 'pug');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
	secret: "ABCDEFGH",
	maxAge: 24 * 60 * 60 * 1000
}));

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/js', express.static(__dirname + '/node_modules/popper.js/dist'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));

app.use('/', routes);	//Agrego a la ruta / (sin prefijo) lo que tengo en routes.js

module.exports = app;