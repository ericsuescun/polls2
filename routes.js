const express = require('express');
const router = express.Router();
const middleware = require('./middlewares/middleware');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const mongoose = require("mongoose");
const User = require('./models/user');
const PollsController = require('./controllers/PollsController');
const VotesController = require('./controllers/VotesController');
const UsersController = require('./controllers/UsersController');

router.use(middleware.setUser);

router.get('/', async function(req, res) {
	return res.redirect('/polls');
});

// router.get('/', PollsController.index);

router.get('/polls', PollsController.index);

router.get('/polls/new', PollsController.newPoll_get);
router.post('/polls/new/:id', PollsController.newPoll_post);

router.get('/polls/:id', PollsController.showPoll);

router.get('/polls/destroy/:id', PollsController.destroy);

router.get('/polls/votes/new/:id', VotesController.newVote_get);
router.post('/polls/votes/new/:id', VotesController.newVote_post);

router.get('/polls/votes/:id', VotesController.showVotes);

router.get('/login', UsersController.userLogin_get);
router.post('/login', UsersController.userLogin_post);

router.get('/logout', middleware.requireUser, UsersController.userLogout);

router.get('/register', UsersController.userRegister_get);
router.post('/register', UsersController.userRegister_post);

module.exports = router;