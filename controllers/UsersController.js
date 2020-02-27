const User = require('../models/user');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

const UsersController = {

	async userLogin_get(req, res) {
		res.render('../views/users/login');
	},

	async userLogin_post(req, res) {
		const email = req.body.email;
		const password = req.body.password;

		try {
			const user = await User.authenticate(email, password);
			if(user) {
				const token = jwt.sign({ userId: user._id }, "lasclaves");
				res.cookie("token", token, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), httpOnly: true});
				return res.redirect('/');
			} else {
				return res.render('login', { error: "Wrong email or password. Try again!"});
			}
		} catch(e) {
			return next(e);
		}
	},

	async userLogout(req, res) {
		res.clearCookie('token');
		// console.log("Estado de cookie: " + req.cookies.token);
		res.redirect('/');
	},

	async userRegister_get(req, res) {
		res.render('../views/users/register');
	},

	async userRegister_post(req, res) {
		var password;
		bcrypt.hash(req.body.password, 10).then(function(hash) {
			User.create({ email: req.body.email, password: hash }, function(err, user) {
				if(err) {
					// console.log("Error message: " + err.message);
					res.render('../views/users/register', { errors: err } );
					// return console.error(err);
				} else {
					User.find(function(err, users) {
						if(err) {
							return console.error(err);
						} else {
							return res.redirect('/');
						}
					});
				}
			});
		});
	},

	async index(req, res) {
		const users = await User.find()
		res.render('users');
	},

	async show(req, res) {
		const user = await User.findById(req.params.id);
		res.render('user');
	}
}

module.exports = UsersController;