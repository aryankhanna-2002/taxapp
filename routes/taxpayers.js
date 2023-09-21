const express = require('express');
const router = express.Router();
const { Taxpayer, taxex } = require('../models/taxpayer');
require('dotenv').config(); 
const secretKey = process.env.SECRET_KEY;
const app = express();

// List all taxpayers
router.get('/', (req, res) => {
    if (req.query.pkey == secretKey) {
        Taxpayer.find()
            .then((taxpayers) => {
                res.json(taxpayers);
            })
            .catch((error) => {
                console.error('Database query error: ' + error);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    } else {
        const user_search = req.query.name;
        Taxpayer.find({ name: user_search })
            .then(x => {
                res.send(x);
            })
            .catch(err => {
                console.log(err);
            });
    }
});

// Create a new taxpayer
router.post('/', (req, res) => {
    const name_ = req.query.name;
    console.log(name_);
    const taxpayer = new Taxpayer({ name: name_ });

    taxpayer
        .save()
        .then(() => {
            res.status(201).json(taxpayer);
        })
        .catch((error) => {
            console.error('Database query error: ' + error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

router.get("/getmytaxes", (req, res) => {
    const pancard = req.query.pancard; 

    Taxpayer.findOne({ pancard: pancard })
        .then((foundTaxpayer) => {
            if (!foundTaxpayer) {
                throw new Error('Taxpayer not found');
            }
            const taxTypeIds = foundTaxpayer.tax.tax_types;

            return taxex.find({ _id: { $in: taxTypeIds } });
        })
        .then((taxTypes) => {
        
            console.log('TaxTypes:', taxTypes);
            res.send(taxTypes);
        })
        .catch((error) => {
            console.error('Error:', error);
            res.send("error getting data");
        });

});

router.get("/getmytaxes/pay", (req, res) => {
  const pancard = req.query.pancard;
  const taxid = req.query.taxid;

  Taxpayer.findOne({ pancard: pancard })
    .then((userfound) => {
      if (!userfound) {
      
        return res.status(404).send("Taxpayer not found");
      }
      const currentDate = new Date();
    
      taxex.findByIdAndUpdate(taxid, { status: "paid",datepaid :currentDate})
        .then((updated) => {
          if (updated) {
            res.send("tax paid ");
          } else {
            res.status(404).send("Tax record not found");
          }
        })
        .catch((error) => {
          console.error("Error updating tax record:", error);
          res.status(500).send("Internal Server Error");
        });
    })
    .catch((error) => {
      console.error("Error finding taxpayer:", error);
      res.status(500).send("Internal Server Error");
    });
});

router.get("/getmytaxes/total", (req, res) => {
  const pancard = req.query.pancard;

  Taxpayer.findOne({ pancard: pancard })
    .then((foundTaxpayer) => {
      if (!foundTaxpayer) {
        return res.status(404).send("Taxpayer not found");
      }

      const taxTypeIds = foundTaxpayer.tax.tax_types;

    
      return taxex.find({ _id: { $in: taxTypeIds } });
    })
    .then((taxTypes) => {
      if (!taxTypes || taxTypes.length === 0) {
        return res.send("No taxes found for this taxpayer");
      }

      const paidTaxes = taxTypes.filter((taxType) => taxType.status === "paid");
      const unpaidTaxes = taxTypes.filter((taxType) => taxType.status !== "paid");

      const totalPaidTaxAmount = paidTaxes.reduce((total, taxType) => total + taxType.amount, 0);
      const totalUnpaidTaxAmount = unpaidTaxes.reduce((total, taxType) => total + taxType.amount, 0);

      res.send({
        paidTaxes: {
          totalAmount: totalPaidTaxAmount,
          count: paidTaxes.length,
        },
        unpaidTaxes: {
          totalAmount: totalUnpaidTaxAmount,
          count: unpaidTaxes.length,
        },
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
    });
});
router.post("/edittax", (req, res) => {
  if (req.query.pkey == secretKey) {
    const pancard = req.query.pancard;
    const currentDate = new Date(); // Create a new Date object with the current date and time
    const updateFields = { date: currentDate }; // Assign the current date to the 'date' field
    if (req.query.taxtype) {
      updateFields.tax_type = req.query.taxtype;
    }

    // Find the taxpayer by pancard ID (xxx)
    Taxpayer.findOne({ pancard: pancard })
      .then((foundTaxpayer) => {
        if (!foundTaxpayer) {
          throw new Error('Taxpayer not found');
        }
        if (req.query.ammount && foundTaxpayer.tax.is_union_terr === "yes") {
          updateFields.amount = req.query.ammount - 122;
        } else if (req.query.ammount) {
          updateFields.amount = req.query.ammount;
        }
        if(req.query.status){
          updateFields.status = req.query.status;
        }

        const newTaxType = new taxex(updateFields);
        return newTaxType.save()
          .then(() => {
            foundTaxpayer.tax.tax_types.push(newTaxType._id);

          
            return foundTaxpayer.save();
          });
      })
      .then((updatedTaxpayer) => {
        console.log('TaxType created and associated with Taxpayer:', updatedTaxpayer);
        res.send("Tax logged");
      })
      .catch((error) => {
        console.error('Error:', error);
        res.send("error try again later ")
      });
  } 
  else{
      res.send("pkey dosent match not authorised")
  }
});

router.get('/alltax', (req, res) => {
  const pkey = req.query.pkey;

  if (!pkey || pkey !== secretKey) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  taxex.find()
    .then((found) => {
      res.send(found);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    });
});







module.exports = router;
