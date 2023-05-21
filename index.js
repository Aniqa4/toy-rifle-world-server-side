const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


//middleware
app.use(cors())
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cmzevah.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();

    const toyCollection = client.db('toy-marketplace').collection('all-toys');

    //get 20 documents from collection (read operation)
    app.get('/alltoys', async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.limit(20).toArray();
      res.send(result);
    })


    //get data by subcategory from collection
    app.get('/arCategory', async (req, res) => {
      const query = { subcategory: "Assault Rifle" };
      const cursor = toyCollection.find(query);
      const result = await cursor.limit(2).toArray();
      res.send(result);
    })
    app.get('/srCategory', async (req, res) => {
      const query = { subcategory: "Sniper Rifle" };
      const cursor = toyCollection.find(query);
      const result = await cursor.limit(2).toArray();
      res.send(result);
    })
    app.get('/smgCategory', async (req, res) => {
      const query = { subcategory: "Submachine Gun" };
      const cursor = toyCollection.find(query);
      const result = await cursor.limit(2).toArray();
      res.send(result);
    })


    //get all data
    app.get('/myToys', async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    //get a single toy by specific id
    app.get('/myToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    })


    app.get('/myToys', async (req, res) => {
      const { sort } = req.query;
      const cursor = toyCollection.find();

      if (sort === 'price') {
        cursor.sort({ price: 1 }); // Sort by price in ascending order
      }

      const result = await cursor.toArray();
      res.send(result);
    });


    //add new documents to the collection
    app.post('/addToys', async (req, res) => {
      const newToy = req.body;
      const result = await toyCollection.insertOne(newToy);
      res.send(result);
    })

    //search by name
    app.post('/searchedToys', async (req, res) => {
      const searchQuery = req.body.toy;
      const query = { name: { $regex: searchQuery, $options: 'i' } };
      const results = await toyCollection.find(query).toArray();
      res.json(results);
    });



    //update data
    app.put('/myToys/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToy = req.body;
      const newInfo = {
        $set: {
          price: updatedToy.price,
          availableQuantity: updatedToy.availableQuantity,
          description: updatedToy.description
        }
      }
      const result = await toyCollection.updateOne(filter, newInfo, options);
      res.send(result);

    })


    //delete data from collection
    app.delete('/myToys/:id', async (req, res) => {
      const id = req.params.id;
      console.log('id');
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Server is runnng')
})

app.listen(port, () => {
  console.log(`server is running at port ${port}`);
})