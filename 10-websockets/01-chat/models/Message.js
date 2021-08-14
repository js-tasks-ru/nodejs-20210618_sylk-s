const mongoose = require('mongoose');
const connection = require('../libs/connection');

const messageSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },

  chat: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  text: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    required: true,
  },
});

messageSchema.methods.toDTO = function() {
  const doc = this.toObject();
  doc.id = doc._id;

  delete doc._id;
  delete doc.__v;
  delete doc.chat;

  return doc;
};

module.exports = connection.model('Message', messageSchema);
