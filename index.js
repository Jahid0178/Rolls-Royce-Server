const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 4000;

require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ffuko.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    const database = client.db("rolls_royce");
    const productCollection = database.collection("products");
    const usersCollection = database.collection("users");
    const purchaseCollection = database.collection("purchase");
    const reviewCollection = database.collection("review");

    // GET API
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find({}).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const email = req.body.email;
      const id = req.params.id;
      const query = ObjectId(id);
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    app.get("/purchaseProduct", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = purchaseCollection.find(query);
      const result = await cursor.toArray();
      res.json(result);
    });

    app.get("/purchaseProducts", async (req, res) => {
      const cursor = purchaseCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/moreProduct", async (req, res) => {
      const cursor = productCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/review", async (req, res) => {
      const cursor = reviewCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    // POST API
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.json(result);
    });

    app.post("/purchaseProduct/:email", async (req, res) => {
      const email = req.params.email;
      const { _id, ...rest } = req.body;
      const doc = { ...rest, email: email };
      const result = await purchaseCollection.insertOne(doc);
      res.json(result);
    });
    // DELETE API
    app.delete("/purchaseProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await purchaseCollection.deleteOne(query);
      res.json(result);
    });

    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });

    // UPDATE API
    app.put("/purchaseProduct", async (req, res) => {
      const updateProduct = req.body;
      const filter = { _id: ObjectId(updateProduct.id) };
      const options = { upsert: false };
      const updateDoc = { $set: { status: updateProduct.status } };
      const result = await purchaseCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("rolls royce server is running");
});

app.listen(port, () => {
  console.log("listening to port", port);
});
