const express = require("express");
const cors=require("cors");
const { userroute } = require("./Routes/user.route");
const { Connections } = require("./db");
const { apiroute } = require("./Routes/apidata.route");

require("dotenv").config()
const app = express();

app.use(express.json());
app.use(cors())


app.get("/", (req, res) => {
  res.send("Proxy server is running");
});
app.use("/user",userroute)
app.use("/apis",apiroute)




app.listen(process.env.port, async() => {
  try{
    await Connections
    console.log("DB is connected")
    console.log(`port is running at ${process.env.port}`)
}
catch(err){
    console.log(err)
}
});