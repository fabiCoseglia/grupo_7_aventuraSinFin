const {validationResult} = require('express-validator');
const {existsSync, unlinkSync} = require('fs')
const db = require('../../database/models');

module.exports = (req, res) => {
    
    const errors = validationResult(req);

    if(errors.isEmpty()){
      
      const {countrie,hotel,description,price,discount} = req.body

      db.Product.create({
        countryId : countrie,
        hotelId : hotel, 
        description : description.trim(),
        price,
        discount : discount || 0,
        images : req.files.images ? req.files.images[0].filename : null
      })
        .then(product => {

          if(req.files.images){
            const images = req.files.images.map((file) => {
                return {
                  file : file.filename,
                  main : false,
                  productId : product.id,
                }
            })

            db.Images.bulkCreate(images, {
              validate : true
            }).then(response => {

              return res.redirect('/dashboard');
            })
          }else{
            return res.redirect('/dashboard');

          }
        })
        .catch(error => console.log(error))
     

    }else {

      const hotels = db.Hotel.findAll({
        order : ['name']
      });
  
      const countries = db.Countrie.findAll({
        order : ['name']
      });
  
      Promise.all([hotels, countries])
        .then(([hotels, countries]) => {
          return res.render("productAdd", {
            hotels,
            countries,
            errors : errors.mapped(),
            old : req.body
          });
        })
        .catch(error => console.log(error))
    }
  
  }