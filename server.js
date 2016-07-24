var morgan = require('morgan');
var methodOverride = require('method-override');
var express = require('express');
var app = express();
var path = require('path');
// var querystring = require('querystring');
var bodyParser = require('body-parser');

var Gallery = require('./Gallery');

app.set('view engine', 'pug');
app.set('views', path.resolve(__dirname, 'views'));

app.use(express.static('public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride('_method'));
app.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

//GET /index.html
app.get('/', function (req, res) {
  res.render('index');
});

//GET /gallery/new (page with form to add new photo to gallery)
app.get('/gallery/new', function (req, res) {
  res.render('add-form');
});

//POST to /gallery (from the form of /gallery/new)
app.post('/gallery', function (req, res) {
  Gallery.create(req.body, function (err, result) {
    if (err) throw err;
    // res.redirect('/'); //redirect to home page
    res.render('photo', {link: req.body.link, author: req.body.author, description: req.body.description});
  });
});

//GET /gallery/[photo id] (page with single photo and links to delete/edit)
app.get('/gallery/:id', function (req, res) {
  var id = req.params.id;
  Gallery.find(id, function (err, object) {
    if (err){
      res.status(404).render('404');
    }else{
      res.render('photo', object);
    }
  });
});

//GET /gallery/[photo id]/edit (page with form to edit current photo)
app.get('/gallery/:id/edit', function (req, res) {
  var id = req.params.id;
  Gallery.form(id, function (err) {
    if (err){
      res.status(404).render('404');
    }else{
      res.render('edit-form', {id: id});
    }
  });
});

//PUT to /gallery/[photo id]
app.put('/gallery/:id', function (req, res) {
  var id = req.params.id;
  Gallery.edit(req.body, id, function (err, object) {
    if (err){
      res.status(404).render('404');
    }else{
      res.render('photo', object);
    }
  });
});

//DELETE [photo id]
app.delete('/gallery/:id', function (req, res) {
  var id = req.params.id;
  Gallery.delete(id, function (err) {
    if (err){
      res.status(404).render('404');
    }else{
      res.render('index');
    }
  });
});

app.use('*', function (err, res, next) {
  res.status(404).render('404');
});

var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});