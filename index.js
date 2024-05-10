const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const port = process.env.PORT || 9000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.AS_USER}:${process.env.AS_PASS}@cluster0.lskduub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection

    const AssElevenCollenction = client.db('AssEleven').collection('Eleven')


    // post queries item
    app.post('/addquerie', async(req, res)=> {
      const query = req.body;
      const result = await AssElevenCollenction.insertOne(query)
      res.send(result)
    })

    // get queries item
    app.get('/queries/:email', async(req, res)=> {
      const email = req.params.email
      const result = await AssElevenCollenction.find({email}).toArray()
      res.send(result)
    })

    //details
    app.get('/details/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await AssElevenCollenction.findOne(query)
      res.send(result)
    })

    //delete 
    app.get('/delete/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await AssElevenCollenction.deleteOne(query)
      res.send(result)
    })



    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', async(req, res) => {
    res.send('Assignment Eleven Sever Is Running')
})

app.listen(port, ()=> console.log(`Server Side in Running ${port}`))