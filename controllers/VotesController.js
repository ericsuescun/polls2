const User = require('../models/user');

const VotesController = {
	async showVotes(req, res) {
		console.log("Results for ID: " + req.params.id);
		const user = await User.findById(req.params.id);
		var loggedUser = res.locals.user;
		var polls = user.polls;
		const title = req.query.title;
		var allVotes = 0;
		var selectedPoll;
		var url = req.protocol + "://" + req.headers.host + "/polls/votes/" + req.params.id + "?title=" + req.query.title;

		polls.forEach((poll, index) => {
			if(poll.title === title) {
				poll.options.forEach((option, index) => {
					allVotes = allVotes + option.votes;
				});
				selectedPoll = poll;
				return res.render('results', { loggedUser: loggedUser, poll: selectedPoll, user: user, votes: allVotes, url: url });
			} else {
				
			}
		});
	},

	async newVote_get(req, res) {
		const user = await User.findById(req.params.id);
		var loggedUser = res.locals.user;
		const polls = user.polls;
		var selectedPoll;
		polls.forEach((poll, index) => {
			if(poll.title === req.query.title) {
				selectedPoll = poll;
			}
		});
		return res.render('../views/votes/new', { poll: selectedPoll, user: user, loggedUser: loggedUser });
	},

	async newVote_post(req, res) {
		const user = await User.findById(req.params.id);
		var polls = user.polls;
		const title = req.query.title;
		var newVotes;
		var votedPolls = [];
		var votedOptions = [];
		console.log('Title: ' + title);
		console.log('Req Body: ' + Object.keys(req.body));
		console.log('Other Req Body: ' + req.body.choice);


		polls.forEach((poll, index) => {
			if(poll.title === title) {
				poll.options.forEach((option, index) => {
					console.log('Picked: ' + Object.keys(req.body) + ' Option: ' + option.option + ' votes: ' + option.votes);
					if(option.option === req.body.choice) {
						newVotes = option.votes + 1;
						console.log(option.option + " queda en : " + newVotes);
						votedOptions.push({ option: option.option, votes: newVotes });
					} else {
						votedOptions.push(option);
					}
				});
				votedPolls.push({ title: poll.title, description: poll.description, options: votedOptions });
			} else {
				votedPolls.push(poll);
			}
		});

		User.updateOne({ email: user.email }, { $set: { polls: votedPolls } }, function(err, user) {
			if(err) {
				return console.error(err);
			} else {
				console.log("Redirecting to: " + `/polls/votes/${req.params.id}?title=${title}`);
				return res.redirect(`/polls/votes/${req.params.id}?title=${title}`);
			}
		});
	}
};

module.exports = VotesController;