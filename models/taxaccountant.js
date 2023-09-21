const mongoose = require('mongoose');

const accountant = new mongoose.Schema({
    name: {
        type:String,
        required :true
    },
    password :{
        type :String,
        required:true
    }
})

const Taxaccountant = mongoose.model('Taxaccountant', accountant);

module.exports = Taxaccountant;

