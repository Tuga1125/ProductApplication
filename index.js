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
	console.log('/products/:id');
});

let getRequestCounter = 0;
let postRequestCounter = 0;

server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser());

// Middleware to count GET and POST requests
server.use((req, res, next) => {
  if (req.method === 'GET') {
    getRequestCounter++;
  } else if (req.method === 'POST') {
    postRequestCounter++;
  }

  console.log(`Processed Request Count--> Get:${getRequestCounter}, Post:${postRequestCounter}`);
  next();
});

// Get all products in the system
server.get('/products', function (req, res, next) {
	console.log('GET /products params=>' + JSON.stringify(req.params));

	// Find every product within the given collection
	productsSave.find({}, function (error, products) {
		if (error) return next(new errors.InternalServerError(JSON.stringify(error.errors)));
		res.send(products);
	});
});

// Get a single product by its product id
server.get('/products/:id', function (req, res, next) {
	console.log('GET /products/:id params=>' + JSON.stringify(req.params));

	// Find a single product by its id within save
	productsSave.findOne({ _id: req.params.id }, function (error, product) {
		if (error) return next(new errors.InternalServerError(JSON.stringify(error.errors)));
		if (product) {
			res.send(product);
		} else {
			res.send(404);
		}
	});
});

// Create a new product
server.post('/products', function (req, res, next) {
	console.log('POST /products params=>' + JSON.stringify(req.params));
	console.log('POST /products body=>' + JSON.stringify(req.body));

	// Validation of mandatory fields
	if (req.body.name === undefined || req.body.price === undefined || req.body.quantity === undefined) {
		return next(new errors.BadRequestError('name and price and quantity must be supplied'));
	}

	let newProduct = {
		name: req.body.name,
		price: req.body.price,
		quantity: req.body.quantity
	};

	// Create the product using the persistence engine
	productsSave.create(newProduct, function (error, product) {
		if (error) return next(new errors.InternalServerError(JSON.stringify(error.errors)));
		res.send(201, product);
	});
});

// Delete a product by its id
server.del('/products/:id', function (req, res, next) {
  console.log('DELETE /products/:id params=>' + JSON.stringify(req.params));
  
  // Delete the product with the persistence engine
  productsSave.delete(req.params.id, function (error) {
    if (error) return next(new errors.InternalServerError(JSON.stringify(error.errors)));
    res.send(204);
  });
});

