const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();
const app = express();
const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY);
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
// -------------------Varifi Token---------------------------

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.wgy9amh.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // -----------------------collection------------------------
    const usersCollection = client.db("CarDealer").collection("users");
    const shopCollection = client.db("CarDealer").collection("shops");
    const paindInfoCollection = client.db("CarDealer").collection("paindInfo");
    const shopProductCollection = client
      .db("CarDealer")
      .collection("shopProduct");
    const salesProductCollection = client
      .db("CarDealer")
      .collection("salesProduct");
    const limitCollection = client.db("CarDealer").collection("limit");
    const amountCollection = client.db("CarDealer").collection("amount");

    //--------------------------get method --------------------------------
    // -----------admin work ----------------------
    app.get("/alluser", async (req, res) => {
      const find = await usersCollection.find().toArray();

      res.send(find);
    });
    // ---------------shop manager work--------------
    app.get("/amount", async (req, res) => {
      const result = await amountCollection.find().toArray();
      res.send(result);
    });
    app.get("/users", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const find = await usersCollection.findOne(query);
      if (find?.roll == "manager") {
        return res.send({ manager: true });
      } else if (find?.roll == "admin") {
        return res.send({ admin: true });
      }

      res.send(find);
    });
    app.get("/user", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const users = await usersCollection.findOne(query);
      if (users?.roll == "manager" || users?.roll == "admin") {
        return res.send(users);
      } else {
        return res.send({ creatshop: true });
      }
    });
    app.get("/shopProduct", async (req, res) => {
      try {
        const email = req.query.email;
        const query = { email: email };
        const users = await shopProductCollection.find(query).toArray();
        res.send(users);
      } catch (error) {
        console.log(error);
      }
    });
    app.get("/allpaidInfo", async (req, res) => {
      try {
        const users = await paindInfoCollection.find().toArray();
        res.send(users);
      } catch (error) {
        console.log(error);
      }
    });
    app.get("/allShopProduct", async (req, res) => {
      try {
        const users = await shopProductCollection.find().toArray();
        res.send(users);
      } catch (error) {
        console.log(error);
      }
    });
    app.get("/salesProduct", async (req, res) => {
      try {
        const email = req.query.email;
        const query = { email: email };
        const users = await salesProductCollection.find(query).toArray();
        res.send(users);
      } catch (error) {
        console.log(error);
      }
    });
    app.get("/paindInfo", async (req, res) => {
      try {
        const email = req.query.email;
        const query = { email: email };  
        const parpage = 5;
        const page = parseInt(req.query.page);
        const skib = page * parpage;
        const allpayinfo = await paindInfoCollection.find(query).sort().toArray()
        const lengthData = parseInt(allpayinfo.length)
       
        const saleingPrice = allpayinfo?.reduce(
          (sum, totalPrice) => sum + parseFloat(totalPrice.sellingPrice),
          0
        );
        const productCost = allpayinfo?.reduce(
          (sum2, totalPrice2) => sum2 + parseFloat(totalPrice2.ProductionCost),
          0
        );
        const totalSale = saleingPrice-productCost
        const users = await paindInfoCollection.find(query).sort({ date: -1 }).skip(skib).limit(parpage).toArray();
     
        res.send({users,saleingPrice,productCost,totalSale,lengthData});
      } catch (error) {
        console.log(error);
      }
    });
    app.get("/SortpaindInfo", async (req, res) => {
      try {
        const email = req.query.email;
        const query = { email: email };  
       
        const users = await paindInfoCollection
          .find(query)
          .sort({ date: -1 })
          .toArray();
       
        res.send(users);
      } catch (error) {
        console.log(error);
      }
    });
   
    app.get("/singleShopProduct/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const users = await shopProductCollection.findOne(query);
        res.send(users);
      } catch (error) {
        console.log(error);
      }
    });
    app.get("/limit/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const users = await limitCollection.findOne(query);
        res.send(users);
      } catch (error) {
        console.log(error);
      }
    });
    app.get("/limit", async (req, res) => {
      const price = await limitCollection.find().toArray();
      res.send(price);
    });

    // -------------------------post Method -------------------------------
    app.post("/user", async (req, res) => {
      try {
        const users = req.body;

        // const query = { email: users.email }
        // const existingUser = await usersCollection.findOne(query)
        // if (existingUser) {
        //     return res.send({ message: "user already exist", insertedId: null })
        // } 
       
        const result = await usersCollection.insertOne(users);
        res.send(result);
      } catch (error) {
        console.log("user post erro", error.message);
      }
    });
    app.post("/paindInfo", async (req, res) => {
      try {
        const bodyInfo = req.body;
        const result = await paindInfoCollection.insertOne(bodyInfo);
        res.send(result);
      } catch (error) {
        console.log("user post erro", error.message);
      }
    });
    app.post("/salesProduct", async (req, res) => {
      try {
        const bodyInfo = req.body;
        const result = await salesProductCollection.insertOne(bodyInfo);
        res.send(result);
      } catch (error) {
        console.log("user post erro", error.message);
      }
    });
    app.delete('/gaidProductDelete/:id',async (req,res)=>{
      const id = req.params.id
      const qury = {_id:new ObjectId(id)}
      const result = await salesProductCollection.deleteOne(qury)
      res.send(result);
    })
    app.post("/shopProduct", async (req, res) => {
      try {
        const bodyInfo = req.body;

        const query = { email: bodyInfo?.email };
        let update = await usersCollection.findOne(query);

        if (update.limit >= 0) {
          update.limit -= 1;
          await usersCollection.updateOne(
            { email: bodyInfo?.email },
            { $set: { limit: update.limit } }
          );
        } else {
          return;
        }

        const result = await shopProductCollection.insertOne(bodyInfo);
        res.send(result);
      } catch (error) {
        console.log("user post erro", error.message);
      }
    });

    app.post("/getPaidUpdateData", async (req, res) => {
      try {
        const bodyInfo = req.body;
        const date = bodyInfo?.date;
        const time = bodyInfo?.time;
        const query = { _id: new ObjectId(bodyInfo?.id) };
        const query2 = { sId: bodyInfo?.id };
        let update = await shopProductCollection.findOne(query);
        let dateTime = await salesProductCollection.findOne(query2);
        const salesDataUpdate = {
          $set: { date, time },
        };
        await salesProductCollection.updateOne(query2, salesDataUpdate);

        if (update) {
          update.quantity -= 1;
          update.SaleCount += 1;
          await shopProductCollection.updateOne(query, {
            $set: { quantity: update.quantity, SaleCount: update.SaleCount },
          });
        }
   
        res.send(update);
      } catch (error) {
        console.log("user post erro", error.message);
      }
    });

    app.post("/shop", async (req, res) => {
      try {
        const bodyInfo = req.body;
        const qury = { email: bodyInfo.shopEmail };
        const filter = await usersCollection.findOne(qury);
    
        if (filter?.roll == "manager") {
          return res.send({ message: true });
        }
        const dataqury = {
          $set: {
            roll: "manager",
            limit: bodyInfo?.limit,
            shopInfo: bodyInfo?.shopInfo,
            logo: bodyInfo?.display_url,
            shopName: bodyInfo?.sWonerName,
            storeName : bodyInfo?.shopName
          },
        };
        const update = await usersCollection.updateOne(qury, dataqury);

        const result = await shopCollection.insertOne(bodyInfo);
        res.send(result);
      } catch (error) {
        console.log("shop post erro null kano", error.message);
      }
    });
    app.post("/limitUpdate", async (req, res) => {
      try {
        const email = req.query.email;
        const { limit } = req.body;

        const qury = { email: email };
        const filter = await usersCollection.findOne(qury);

        if (filter) {
          filter.limit = limit;
        }
        const dataqury = {
          $set: {
            limit: limit,
          },
        };

        const update = await usersCollection.updateOne(qury, dataqury);

        res.send(update);
      } catch (error) {
        console.log("shop post erro", error.message);
      }
    });
    // ------------------Paymet integration-------------------------------
    app.post("/payment", async (req, res) => {
      const { taka } = req.body;
      const price = parseInt(taka * 100);

      const payment = await stripe.paymentIntents.create({
        amount: price,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: payment.client_secret,
      });
    });
    app.post("/amount", async (req, res) => {
      try {
        const taka = req.body;
        const result = await amountCollection.insertOne(taka);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    // ------------------------delet method -----------------------------
    app.delete("/shopProduct/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const deletProduct = shopProductCollection.deleteOne(query);
        res.send(deletProduct);
      } catch (error) {
        console.log(error);
      }
    });
    app.patch("/shopProductUpdate/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const body = req.body;
        const query = { _id: new ObjectId(id) };
        const option = { upsert: true };
        const setUpdate = {
          $set: {
            ...body,
          },
        };
        const updating = await shopProductCollection.updateOne(
          query,
          setUpdate,
          option
        );
        res.send(updating);
      } catch (error) {
        console.log("update", error);
      }
    });
    // --------------------pagination start -------------------------------
    app.get("/count", async (req, res) => {
      const count = await usersCollection.estimatedDocumentCount();
      res.send({ count });
    });
    app.get("/pagination", async (req, res) => {
      const page = parseInt(req.query.page);
      const parpage = 5
      const totalPage = page * parpage;
      
      const count = await usersCollection
        .find()
        .skip(totalPage)
        .limit(parpage)
        .toArray();
       
      const lengthData = await usersCollection
        .find().toArray();
       
      res.send({count,lengthData});
    });
   
// ------------------------jwt--------------------------------------
app.post("/jwt", async (req, res) => {
 try {
  const email = req.body;
  const token = jwt.sign(email, process.env.ACCESS_TOKEN, {
    expiresIn: "3h",
  });

  res.send( {token} );
 } catch (error) {
  console.log(error);
 }
});

    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Brower is Ranning");
});
app.listen(port, () => {
  console.log(`ranning port ${port}`);
});
