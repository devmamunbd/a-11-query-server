const express = require('express')
const cors = require('cors')
const app = express()
const jwt = require('jsonwebtoken')
const cookiParser = require('cookie-parser')
require('dotenv').config()
const port = process.env.PORT || 9000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



app.use(cors({
  origin: ['http://localhost:5173',
   'http://localhost:5174',
   'http://localhost:5175',
    "https://assignment-eleven-1cdbf.web.app",
    "https://assignment-eleven-1cdbf.firebaseapp.com"
  ],
  credentials: true
}))
app.use(express.json())
app.use(cookiParser())


const uri = `mongodb+srv://${process.env.AS_USER}:${process.env.AS_PASS}@cluster0.lskduub.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


//middleware 
const verifyToken = (req, res, next)=> {
  const token = req?.cookies?.token;
  // console.log("middlware token", token)
  if (!token) {
    return res.status(401).send({message: "Unauthorized access"})
  }
  jwt.verify(token, process.env.USER_SECRET_TOKEN, (err, decoded) => {
      if (err) {
        return res.status(401).send({message: "Unauthorized access"})
      }
      req.user = decoded;
      next()
  })
}

const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
  secure: process.env.NODE_ENV === "production" ? true : false,
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const AssElevenCollenction = client.db('AssEleven').collection('Eleven')
    const RecoCollenction = client.db('AssEleven').collection('Recomen')

    //JWT
    app.post('/jwt', async(req, res)=> {
        const user = req.body;
        const token = jwt.sign(user, process.env.USER_SECRET_TOKEN, {expiresIn: "7d"})

        res.cookie('token', token, cookieOptions).send({ success: true })
      
    })

    // cookie logout
    app.post('/logout', async(req, res)=> {
      const user = req.body;
      console.log('logout', user)
      res.clearCookie('token', {...cookieOptions, maxAge: 0}).send({success: true})
    })


    // post queries item
    app.post('/addquerie', async(req, res)=> {
      const query = req.body;
      // console.log('add cookies', req.cookies)
      const result = await AssElevenCollenction.insertOne(query)
      res.send(result)
    })

    // reco post
    app.post('/addreco', async(req, res)=> {
      const query = req.body;
      const result = await RecoCollenction.insertOne(query)
      res.send(result)
    })

    // get queries item
    app.get('/queries/:email', verifyToken, async(req, res)=> {
      const email = req.params.email;
      // console.log('owner info', req.user)
      if (req.user.email !== req.params.email) {
        return res.status(403).send({message: 'forbidden access'})
      }
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
    app.delete('/delete/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await AssElevenCollenction.deleteOne(query)
      res.send(result)
    })

    //update get
    app.get('/update/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await AssElevenCollenction.findOne(query)
      res.send(result)
    })

    //update
    app.put('/update/:id', async(req, res)=> {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updateCart = req.body;
      const options = {upsert: true}
      const cart = {
        $set: {
          pname: updateCart.pname,
          brand: updateCart.brand,
          query: updateCart.query,
          image: updateCart.image,
          count: updateCart.count,
          boycott: updateCart.boycott 
        }
      }
      const result = await AssElevenCollenction.updateOne(filter, cart, options)
      res.send(result)
    })

    //get recent
    app.get('/recent', async(req, res)=> {
      const cursor = AssElevenCollenction.find()
      const result = await cursor.toArray()
      res.send(result)
    })


    // queries
    app.get('/queries', async(req, res)=> {
      const cursor = AssElevenCollenction.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    //comment
    app.get('/commend/:id', async(req, res)=> {
      const id = req.params.id;
      const filter = {queryId: req.params.id}
      const result = await RecoCollenction.find(filter).toArray()
      res.send(result)
    })

    // my reco
    app.get('/myreco/:RecommenderEmail', async(req, res)=> {
      const RecommenderEmail = req.params.RecommenderEmail;
      const result = await RecoCollenction.find({RecommenderEmail}).toArray()
      res.send(result)
    })

    // reco for me
    app.get('/recoforme/:RecommenderEmail', async(req, res)=> {
      const RecommenderEmail = req.params.RecommenderEmail;
      const result = await RecoCollenction.find({RecommenderEmail}).toArray()
      res.send(result)
    })

    // reco delete
    app.delete('/recodelete/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await RecoCollenction.deleteOne(query)
      res.send(result)
    })

    // pagination

    // all-queries for pagination
    app.get('/all-queries', async(req, res)=> {
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page) - 1;
      const search = req.query.search;

      let query = {
        pname: { $regex: search, $options: 'i' }
      }

      const result = await AssElevenCollenction.find(query).skip(page * size).limit(size).toArray()
      res.send(result)
    })


    // queris count
    app.get('/queries-count', async(req, res)=> {
      const search = req.query.search;

      let query = {
        pname: { $regex: search, $options: 'i' }
      }
      
      const count = await AssElevenCollenction.countDocuments(query)
      res.send({count})
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