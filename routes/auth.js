const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Taxpayer} = require('../models/taxpayer');
const Taxaccountant = require('../models/taxaccountant');
const bcrypt = require('bcrypt');
const saltRounds = 9;

// Login route
router.get('/login', (req, res) => {
  const { username, password } = req.query;
  
  Taxpayer.findOne({ name: username })
    .then((user) => {
      if (!user) {
        return Taxaccountant.findOne({ name: username });
      }
      return user;
    })
    .then((user) => {
      
      if (user) {
        bcrypt.compare(password, user.password, function(err, result) {
          if(result == true){
            const token = jwt.sign({ username: user.name }, process.env.SECRET_KEY);
            res.json({ token });
          }
          else{
            res.status(401).json({ message: 'Authentication failed' });
          }
      });
      
      } 
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    });
});

// Registration routes


router.post('/register', (req, res) => {
  const name = req.query.name;
  const passwordcreate = req.query.password;
  const state = req.query.state;
  const union = req.query.union;
  const pancard = req.query.pancard;
  bcrypt.hash(passwordcreate, saltRounds, function (err, hash) {
      const userr = new Taxpayer({
          name: name,
          tax: {
              state: state,
              is_union_terr: union, 
          },
          password: hash,
          pancard: pancard
      });
      userr.save()
          .then((x) => {
              console.log(x);
              res.send("User registered successfully");
          })
          .catch((err) => {
              console.error(err);
              res.status(500).send("Error registering user");
          });
  });
});


router.post("/registeraccountant",(req,res)=>{
    const name = req.query.name;
    const password = req.query.password;
    bcrypt.hash(password, saltRounds, function(err, hash) {
      const userr = new Taxaccountant({
        name: name,
        password: hash

    });
    userr.save()
    .then((x)=>{
        res.send("accountant registered")
        console.log(x);
        
    })
    .catch((err)=>{
        console.log(err);
        res.send("error")
    });

  });
    
})

module.exports = router;
