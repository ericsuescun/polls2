const User = require('../models/user');

function removeDots(err) {
	var dots = 2;
	var n = [];
	var c = err.split('.');
	for(i = 2; i < c.length; i++) {
		n.push(c[i]);
	}
	return n.join('.');
}

const PollsController = {

	async index(req, res) {
		const users = await User.find()
		let allPolls = [];
		users.forEach((user, index) =>{
			user.polls.forEach((poll) => {
				allPolls.push(poll);
			});
		});
		return res.render("../views/polls/index", { polls: allPolls.length > 0 ? true : false, users: users, loggedUser: res.locals.user });
	},


	async showPoll(req, res) {
		const user = await User.findById(req.params.id);
		const polls = user.polls;
		return res.render("../views/polls/show", { polls: polls, loggedUser: res.locals.user });
	},


	async newPoll_get(req, res) {
		return res.render("../views/polls/new", { loggedUser: res.locals.user });
	},


	async newPoll_post(req, res) {
		var error = [];
		const user = await User.findById(req.params.id);
		var polls = user.polls;

		var title;
		var description;
		var options = [];
		Object.values(req.body).forEach((item, index) => {
			if(index === 0) {
				title = item;
			} else {
				if(index === 1) {
					description = item;
				} else {
					options.push({ option: item, votes: 0 })
				}
			}
		});

		var url = req.protocol + "://" + req.headers.host + "/polls/votes/" + user._id + "?title=" + title;
		var newPoll = { title: title,
						description: description,
						options: options
		};

		var data = Object.entries(req.body);

		user.polls.push(newPoll);

		user.save(function(err) {
			if(!err) {

				return res.render('results', { loggedUser: res.locals.user, poll: newPoll, user: user, votes: 0, url: url, flash: "Poll created successfully!" });

			} else {

				Object.entries(err.errors).forEach((item, index) => {
					console.log("Error in: " + removeDots(item[0]) + " message: " + item[1]);
				});

				var m = [];
				Object.entries(err.errors).forEach((item, index) => {
					item[0] = removeDots(item[0]);
					m.push(item);
				});


				data.forEach((item) => {
					m.forEach((error) => {
						if(item[0] === error[0]) {
							item.push(error[1]);
							console.log("Match: " + item[0]);
							console.log("New Item: " + item);
						}
					});
					if(item[1] !== '') {
						item.push(false);
					}
				});

				return res.render("../views/polls/new", { loggedUser: res.locals.user, errors: data, poll: newPoll });
			}
		});
	},

	async destroy(req, res) {
		const user = await User.findById(req.params.id);
		var users;
		let allPolls = [];
		var loggedUser = res.locals.user;
		const polls = user.polls;
		var notDeletedPolls = [];
		polls.forEach((poll, index) => {
			if(poll.title !== req.query.title) {
				notDeletedPolls.push(poll);
			}
		});
		User.updateOne({ email: user.email }, { $set: { polls: notDeletedPolls } }, async function(err, user) {
			if(err) {
				return console.error(err);
			} else {
				users = await User.find();
				users.forEach((usr, index) =>{
					usr.polls.forEach((poll, index2) => {
						allPolls.push(poll);
					});
				});
				return res.render("pollList", { users: users, polls: allPolls, loggedUser: loggedUser, flash: "Poll deleted successfully!" });
			}
		});
	}
}

module.exports = PollsController;