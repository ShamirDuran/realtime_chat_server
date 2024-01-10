const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
  },
  about: {
    type: String,
  },
  avatar: {
    type: String,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: (email) => {
        return String(email)
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
      },
      message: (props) => `Email (${props.value}) is invalid!`,
    },
  },
  password: {
    type: String,
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
  },
  lastSeen: {
    type: Date,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  socketId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Online', 'Offline'],
    default: 'Offline',
  },
  deleted: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre('save', async function (next) {
  // if password is same as before then save the encripted password and ignore the new one
  if (!this.isModified('password') || !this.password) return next();

  this.password = await bcrypt.hash(this.password.toString(), 12);
  next();
});

userSchema.pre('findOneAndUpdate', async function (next) {
  const user = await this.model.findOne(this.getQuery());
  const updatedUser = this.getUpdate();

  // if password is same as before then save the encripted password and ignore the new one
  if (!bcrypt.compare(updatedUser.password, user.password) || !this.password) {
    this.getUpdate().password = user.password;

    return next();
  }

  this.getUpdate().password = await bcrypt.hash(updatedUser.password.toString(), 12);
  next();
});

userSchema.pre('save', function (next) {
  // Check if password is modified, if not is new or password is not set then return next
  if (!this.isModified('password') || this.isNew || !this.password) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.validatePassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimeStamp < changedTimeStamp;
  }

  return false;
};

userSchema.methods.toJSON = function () {
  const { __v, _id, password, ...user } = this.toObject();
  user.uid = _id;
  return user;
};

module.exports = mongoose.model('User', userSchema);
