const request = require('supertest');
const expect = require('expect.js');
const app = require('../app');
const mongoose = require("mongoose");
const User = require('../models/user');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const middleware = require('../middlewares/middleware');
const jwt = require("jsonwebtoken");

after(function(done) {
	User.deleteOne({ email: 'fulanito@detal.com'}, function(err) {
		if(err) console.error(err);
	});

	User.deleteOne({ email: 'testuser@mail.com'}, function(err) {
		if(err) console.error(err);
	});
	done();
});

describe('Root test', function() {
  it('Should redirect to Polls', (done) => {
    request(app)
    .get('/')
    .expect(302)
    .end(done);
  });
});

describe('Forms Tests', function() {

	it('GET register form', function(done) {
		request(app)
		.get('/register')
		.expect(200)
		.end(done);
	});

	it('GET login form', function(done) {
		request(app)
		.get('/login')
		.expect(200)
		.end(done);
	});
});

describe('Users model test', function() {

	it('User creation ', function() {
		var email = 'testuser@mail.com';
		var password = '12345678';

		bcrypt.hash(password, 10).then(function(hash) {
			User.create({ email: email, password: hash }, function(err, user) {
				if(err) {
					console.error(err);
				} else {
					expect(user.email).to.be('testuser@mail.com');
					// console.log(' User Created through User module');
				}
			});
		});
	});

	it('Registered user athentication module with correct password', async function() {
		var email = 'edsuescun@gmail.com';
		var password = '12345678';
		const user = await User.authenticate(email, password);
		expect(user.email).to.be('edsuescun@gmail.com');
	});

	it('Registered user athentication module with incorrect password', async function() {
		var email = 'edsuescun@gmail.com';
		var password = '12345679';
		const user = await User.authenticate(email, password);
		expect(user).to.be(null);
	});

	it('Unregistered user athentication module', async function() {
		var email = 'any@raremail.com';
		var password = '12345678';
		const user = await User.authenticate(email, password);
		expect(user).to.be(null);
	});

});


describe('User controller test', () => {

	it('Register test user', async function() {
		const register = await request(app).post('/register').type('form').send({ email: 'fulanito@detal.com', password: '12345678'});
		expect(302);
	});	//Este se ejectua al principio para que la operación de creacion que toma tiempo se pueda completar

	it('Login test user', function(done) {
		request(app).post('/login').type('form').send({ email: 'fulanito@detal.com', password: '12345678'}).end(function(err, res) {
			expect(302);
			// console.log(res);
			// expect(res.locals.user.email).to.be('fulanito@detal.com');
			expect(res.headers).to.have.key('set-cookie');
			done();
		})
	});

	it('Logout', function(done) {
		request(app).get('/logout').end((err, res) => {
			if(err) {
				console.error(err);
			} else {
				expect(302);
				expect(res.headers).not.to.have.key('set-cookie');
			}
			done();
		});
	});
});

describe('Polls controller test', function() {

	it('Creates a poll from test user and returns a view with Poll created successfully!', function(done) {
		request(app)
		.post('/login')
		.type('form')
		.send({ email: 'fulanito@detal.com', password: '12345678'})
		.end(async function(err, res) {
				if(err) {
					console.error(err);
					return done(err);
				} else {
					expect(302);
					// console.log(res.headers);
					expect(res.headers).to.have.key('set-cookie');
					var token;
					// console.log(Object.entries(res.headers));
					Object.entries(res.headers).forEach( function(item, index) {
						if(item[0] === 'set-cookie') {
							token = item[1][0].split('=')[1].split(';')[0];
						}
					});
					if(token) {
						try {
							var decoded = jwt.verify(token, "lasclaves");
							var user = await User.findById(decoded.userId);
							if(user) {
								console.log("User: " + user.email)
								expect(user.email).to.be('fulanito@detal.com');
								request(app)
								.post('/polls/new/' + user._id)
								.type('form')
								.send({ title: 'Test2', decription: 'Description test', "options.0.option": "A", "options.1.option": "B", "options.2.option": "CC", "options.3.option": "DDD" })
								.end( function(err2, res1) {
									expect(200);
									expect(res1.text).to.contain('Poll created successfully!');
									user.polls.forEach((poll, index) => {
										if(poll.title === 'Test2') {
											expect(1).to.be(1);
											done();
										}
									});
								});
							}
						} catch(e) {
							done(e);
						}
					}
				}
			});
		done();	
	});
});

describe('Votes controller test', function() {
	it('Votes a test poll and returns a view with some results, twice!', function(done) {
		request(app).get('/polls').end( async function(err, res) {
			var token;
			Object.entries(res.headers).forEach( function(item, index) {
				if(item[0] === 'set-cookie') {
					token = item[1][0].split('=')[1].split(';')[0];
				}
			});
			if(token) {
				try {
					var decoded = jwt.verify(token, "lasclaves");
					var user = await User.findById(decoded.userId);
					if(user) {
						expect(user.email).to.be('fulanito@detal.com');
						request(app)
						.post('/polls/votes/new' + user._id + '?title=' + 'Test2')
						.type('form')
						.send({ choice: 'A' })
						.expect(302).end( function(err1, res1) {
							if(err1) {
								return console.error(err1);
							} else {
								expect(res1.text).to.contain('1 votes');
								request(app)
								.post('/polls/votes/new' + user._id + '?title=' + 'Test2')
								.type('form')
								.send({ choice: 'A' })
								.expect(302).end( function(err2, res2) {
									if(err2) {
										return console.error(err2);
									} else {
										expect(res2.text).to.contain('2 votes');
										
										done();
									}
								});
							}
						});
					}
				} catch(e) {
					done(e);
				}
			}
		});
		done();
	});
});
