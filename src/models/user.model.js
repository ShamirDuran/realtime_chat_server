const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
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
  otp: {
    type: String,
  },
  otpExpiryTime: {
    type: Number,
  },
  socketId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Online', 'Offline'],
  },
});

userSchema.pre('save', async function (next) {
  // Check if otp is modified and hash it
  if (!this.isModified('otp') || !this.otp) return next();

  this.otp = await bcrypt.hash(this.otp.toString(), 12);
  next();
});

userSchema.pre('save', async function (next) {
  // if password is same as before then save the encripted password and ignore the new one
  if (!bcrypt.compare(this.get('password'), this.password) || !this.password) {
    return next();
  }

  this.password = await bcrypt.hash(this.password.toString(), 12);
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

userSchema.methods.toJSON = function () {
  const { __v, _id, password, ...user } = this.toObject();
  user.uid = _id;
  return user;
};

module.exports = mongoose.model('User', userSchema);