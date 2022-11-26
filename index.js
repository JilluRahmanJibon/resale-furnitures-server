const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("furniture server is running now ");
});
app.listen(port, () => {
	console.log("port is running", port);
});
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.jf2skzr.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
	const authHeader = req.headers.authorization
	if (!authHeader) {
		return res.status(401).send('unAuthorized')
	}
	const token = authHeader.split(' ')[1]
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
		if (err) {
			return res.status(403).send({ message: "forbidden access" })
		}
		req.decoded = decoded
		next()
	})
}

async function run() {
	const furnitureCollections = client.db('furnitureCollection').collection('furnitures')
	const categoriesCollections = client.db('furnitureCollection').collection('categories')
	const usersCollections = client.db('furnitureCollection').collection('users')
	const ordersCollections = client.db('furnitureCollection').collection('orders')


	// verify admin 
	const verifyAdmin = async (req, res, next) => {
		const decodedEmail = req.decoded.email
		const query = { email: decodedEmail }
		const user = await usersCollections.findOne(query)

		if (user?.role !== 'Admin') {
			return res.status(403).send({ message: 'forbidden access' })
		}
		next()
	}
	// verify admin 
	const verifySeller = async (req, res, next) => {
		const decodedEmail = req.decoded.email
		const query = { email: decodedEmail }
		const user = await usersCollections.findOne(query)

		if (user?.role !== 'seller') {
			return res.status(403).send({ message: 'forbidden access' })
		}
		next()
	}

	//   here is post method starts
	app.post('/orders', async (req, res) => {
		const order = req.body
		const query = {
			productId: order.productId,
			buyerEmail: order.buyerEmail,
			productImage: order.productImage
		}
		const alreadyOrder = await ordersCollections.findOne(query)
		if (alreadyOrder) {
			return res.send({ message: 'You already buy this product' })
		}
		const result = await ordersCollections.insertOne(order)
		res.send(result)
	})
	app.post('/furnitures', async (req, res) => {
		const product = req.body
		const result = await furnitureCollections.insertOne(product)
		res.send(result)
	})
	app.post('/users', async (req, res) => {
		const user = req.body
		const query = { email: user.email }
		const alreadyUser = await usersCollections.findOne(query)
		if (alreadyUser) {
			return res.send({ acknowledged: true })
		}
		const result = await usersCollections.insertOne(user)
		res.send(result)

	})
	//   here is post method ends


	//   here is get method starts  
	app.get('/jwt', async (req, res) => {
		const email = req.query.email;
		const query = { email: email };
		const user = await usersCollections.findOne(query);
		if (user) {
			const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5d' })
			return res.send({ accessToken: token });
		}
		res.status(403).send({ accessToken: '' })
	});

	app.get('/categories', async (req, res) => {
		const query = {}
		const result = await categoriesCollections.find(query).toArray()
		res.send(result)
	})
	app.get("/furnitures", async (req, res) => {
		const query = {}
		const result = await furnitureCollections.find(query).toArray()
		res.send(result)
	})

	app.get('/categoriesProducts/:id', async (req, res) => {
		const { id } = req.params
		const query = { categoryName: id }
		const result = await furnitureCollections.find(query).toArray()
		res.send(result)
	})
	app.get('/furnitures/:id', async (req, res) => {
		const { id } = req.params
		const query = { _id: ObjectId(id) }
		const result = await furnitureCollections.findOne(query)
		res.send(result)
	})
	//   here is get method ends

	//   here is put method starts

	//   here is put method ends  
}
run().catch(err => {
	console.log(err);
});
