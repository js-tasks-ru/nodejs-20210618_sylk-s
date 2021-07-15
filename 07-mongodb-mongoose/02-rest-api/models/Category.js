const mongoose = require('mongoose');
const connection = require('../libs/connection');

const subCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
});

const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  subcategories: [subCategorySchema],
});

categorySchema.method('toDTO', function() {
  const doc = this.toObject();
  return {
    id: doc._id,
    title: doc.title,
    subcategories: doc.subcategories.map((cat) => ({
      id: cat._id,
      title: cat.title,
    })),
  };
});

module.exports = connection.model('Category', categorySchema);
