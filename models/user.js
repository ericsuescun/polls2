const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

function emptyNess(n) {
	return n !== '';
}

const OptionSchema = mongoose.Schema({
	option: {
		type: String,
		required: [true, 'Option text is required'],
		validate: [emptyNess, "Text can't be empty"]
	}, 
	votes: {
		type: Number
	}
});

const PollSchema = mongoose.Schema({
	title: {
		type: String,
		required: [true, 'Poll title text is required'],
		validate: [emptyNess, "Text can't be empty"]
	},
	description: {
		type: String,
		required: [true, 'Poll description text is required'],
		validate: [emptyNess, "Text can't be empty"]
	},
	options: [OptionSchema]
});

const UserSchema = mongoose.Schema({
	email: {
		type: String,
		validate: [emptyNess, "Email can't be empty"],
		required: [true, 'Email is required'],
		unique: [true, 'Email taken, please use another account']
	},
	password: {
		type: String,
		required: [true, 'Password is required'],
		minlength: [ 6, 'Must be 6+ characters']
	},
	polls: [ PollSchema ]
});

UserSchema.statics.authenticate = async (email, password, next) => {
	const user = await mongoose.model("User").findOne({ email: email });

	if(user) {
		return new Promise((resolve, reject) => {
			bcrypt.compare(password, user.password, (err, result) => {
				if(err) reject(err);
				resolve(result === true ? user : null);
			})
		})
	}
	return null;
};

module.exports = mongoose.model('User', UserSchema);