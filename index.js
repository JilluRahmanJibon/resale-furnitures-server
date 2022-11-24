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


	app.get('/categories', async (req, res) => {
		const query = {}
		const result = await furnitureCollections.find(query).toArray()
		res.send(result)
	})
}
run().catch(err => {
	console.log(err);
});
