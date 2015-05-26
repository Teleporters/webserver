var express = require('express');
var router = express.Router();
var mongo = require('mongojs');

var db = mongo(process.env.MONGOLAB_URI, ['teleports']);

/* GET home page. */
router.get('/:file', function(req, res, next) {
  db.teleports.findOne({file: req.params.file}, function(err, spot) {
    if(err) {
      res.render('error', {message: 'Unknown location'})
      return
    }

    res.render('index', {
      title: spot.title,
      id: req.params.id,
      imageUrl: 'http://teleports.s3-website-eu-west-1.amazonaws.com/portals/' + spot.file + '.jpg',
      previewUrl: 'http://teleports.s3-website-eu-west-1.amazonaws.com/thumbs/' + spot.file + '.png',
      file: spot.file
    });
  })
});

module.exports = router;
