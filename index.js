const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require("cors")
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json())
app.use(cors())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.wgy9amh.mongodb.net/?retryWrites=true&w=majority`;

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
    // -----------------------collection------------------------
    const usersCollection = client.db("CarDealer").collection("users")
    const shopCollection = client.db("CarDealer").collection("shops")
    const shopProductCollection = client.db("CarDealer").collection("shopProduct")
    const salesProductCollection = client.db("CarDealer").collection("salesProduct")



//--------------------------get method --------------------------------
app.get("/users",async(req,res)=>{
    const email = req.query.email
    const query = {email:email}
    const find = await usersCollection.findOne(query)
    if (find?.roll=="manager") {
        return res.send({manager:true})
    }
    
    res.send(find)
})
app.get("/user",async(req,res)=>{
   const email = req.query.email
   const query = {email:email}
    const users = await usersCollection.findOne(query)
    if (users?.roll=="manager") {
        return res.send({dasbord : true,  users})
    }
    else{
        return res.send({ creatshop : true})
    }
   
})
app.get("/shopProduct",async(req,res)=>{
  try {
    const email = req.query.email
    const query = {email:email}
     const users = await shopProductCollection.find(query).toArray()
     res.send(users)
  } catch (error) {
    console.log(error);
  }
   
     
   
})
app.get("/salesProduct",async(req,res)=>{
  try {
    const email = req.query.email
    const query = {email:email}
     const users = await salesProductCollection.find(query).toArray()
     res.send(users)
  } catch (error) {
    console.log(error);
  }
   
     
   
})
app.get("/singleShopProduct/:id",async(req,res)=>{
  try {
    const id = req.params.id
    const query = {_id:new ObjectId(id)}
     const users = await shopProductCollection.findOne(query)
     res.send(users)
  } catch (error) {
    console.log(error);
  }
   
     
   
})

// -------------------------post Method -------------------------------
app.post("/user",async(req,res)=>{
    try {
        const bodyInfo = req.body
        const result = await usersCollection.insertOne(bodyInfo)
        res.send(result)
    } catch (error) {
        console.log("user post erro",error.message);
    }
})
app.post("/salesProduct",async(req,res)=>{
    try {
        const bodyInfo = req.body
        const result = await salesProductCollection.insertOne(bodyInfo)
        res.send(result)
    } catch (error) {
        console.log("user post erro",error.message);
    }
})
app.post("/shopProduct",async(req,res)=>{
    try {
        const bodyInfo = req.body
     
        const query = {email:bodyInfo?.email}
        let update = await usersCollection.findOne(query)
      
       if (update.limit>=0) {
            update.limit -=1
            await usersCollection.updateOne( {email:bodyInfo?.email}, { $set: { limit: update.limit }})
       }
       else{
            return
       }
       
       
     
        const result = await shopProductCollection.insertOne(bodyInfo)
        res.send(result)
    } catch (error) {
        console.log("user post erro",error.message);
    }
})
// -------------------------
app.post("/getPaidUpdateData",async(req,res)=>{
    try {
        const bodyInfo = req.body
   
        const query = {_id:new ObjectId(bodyInfo?.id)}
        let update = await shopProductCollection.findOne(query)
     
       if (update) {
         update.quantity -=1
         update.SaleCount +=1
         await shopProductCollection.updateOne(query, { $set: { quantity: update.quantity , SaleCount:update.SaleCount}})
       }
        res.send(update)
    } catch (error) {
        console.log("user post erro",error.message);
    }
})

app.post("/shop",async(req,res)=>{
    try {
        const bodyInfo = req.body
        const qury = {email:bodyInfo.shopEmail}
        const filter = await usersCollection.findOne(qury)
       
        if (filter.roll == "manager") {
            return res.send({message:true})
        }
        const dataqury = {
            $set :{
                roll:"manager",
                limit:bodyInfo.limit

            }
        }
        const update = await usersCollection.updateOne(qury,dataqury)
   
        const result = await shopCollection.insertOne(bodyInfo)
        res.send(result)
    } catch (error) {
        console.log("shop post erro",error.message);
    }
})


// ------------------------delet method -----------------------------
app.delete('/shopProduct/:id',async(req,res)=>{
    try {
        const id = req.params.id
        const query = {_id:new ObjectId(id)}
        const deletProduct = shopProductCollection.deleteOne(query)
        res.send(deletProduct)
    } catch (error) {
        console.log(error);
    }
})
app.patch("/shopProductUpdate/:id",async(req,res)=>{
   try {
    const id = req.params.id
    const body = req.body
    const query = {_id:new ObjectId(id)}
    const option = {upsert:true}
    const setUpdate ={
        $set:{
            ...body
        }
    }
    const updating = await shopProductCollection.updateOne(query,setUpdate,option)
    res.send(updating)
    
   } catch (error) {
    console.log('update',error);
   }

})


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
  }
}
run().catch(console.dir);











app.get("/",(req,res)=>{
    res.send("Brower is Ranning")
})
app.listen(port,()=>{
    console.log(`ranning port ${port}`);
})