const SERVER_NAME = 'product-api';
const PORT = 5000;
const HOST = '127.0.0.1';

const restify = require('restify');
const save = require('save');
const errors = require('restify-errors');

const productsSave = save('products');
const server = restify.createServer({ name: SERVER_NAME });

server.listen(PORT, HOST, function () {
  console.log('Server %s listening at %s', server.name, server.url);
  console.log('**** Resources: ****');
  console.log('********************');
  console.log('/products');
});

server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser());

// Get all products in the system
server.get('/products', function (req, res, next) {
  console.log('GET /products params=>' + JSON.stringify(req.params));

  // Find every product within the given collection
  productsSave.find({}, function (error, products) {
    if (error) return next(new errors.InternalServerError(JSON.stringify(error.errors)));
    res.send(products);
  });
});
