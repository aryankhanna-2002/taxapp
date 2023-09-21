const mongoose = require('mongoose');

const taxTypeSchema = new mongoose.Schema({
  tax_type: {
    type: String,
    required: false,
  },
  amount: {
    type: Number,
    required: false,
  },
  date: {
    type: Date,
    required: false,
  },
  datepaid: {
    type: Date,
    required: false,
  },
  status: {
    type: String,
    required: false,
  }
});

const taxex = mongoose.model('Taxex', taxTypeSchema);

const taxpayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  tax: {
    state: String,
    is_union_terr: String,
    tax_types: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Taxex' // Reference to the TaxType model
    }]
  },
  password: {
    type: String,
    required: true
  },
  pancard: {
    type: String,
    required: true
  }
  
});

const Taxpayer = mongoose.model('Taxpayer', taxpayerSchema);

module.exports = { Taxpayer, taxex };
