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


async function run() {
	const furnitureCollections = client.db('furnitureCollection').collection('furnitures')
	const categoriesCollections = client.db('furnitureCollection').collection('categories')
	const usersCollections = client.db('furnitureCollection').collection('users')
	const ordersCollections = client.db('furnitureCollection').collection('orders')

	//   here is post method starts
	app.post('/orders', async (req, res) => {
		const order = req.body
		const result = await ordersCollections.insertOne(order)
		res.send(result)
	})
	//   here is post method ends


	//   here is get method starts  
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
		const query = { categoryId: id }
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

}
run().catch(err => {
	console.log(err);
});
