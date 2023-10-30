const express=require("express");
const { auth } = require("../Middleware/auth.middleware");
const axios=require("axios")



const apiroute=express.Router()

apiroute.post("/api/chat/completions",auth, async (req, res) => {
    const url = "https://chat.nbox.ai/api/chat/completions";
  
    try {
      const axiosResponse = await axios.post(url, req.body, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": process.env.Secret_Key,
        },
      });
  
      res.status(200).json({msg: axiosResponse.data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Proxy server error" });
    }
  });



  apiroute.get("/weather",auth, async (req, res) => {
    const city=req.body.city
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.Weather_key}`;
  
    try {
      const axiosResponse = await axios.get(url);
  
      res.status(200).json({msg: axiosResponse.data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "weather server error" });
    }
  });


  apiroute.get("/news",auth, async (req, res) => {
    const title=req.body.title
    const url = `https://newsapi.org/v2/everything?q=${title}&sortBy=publishedAt&apiKey=${process.env.News_key}`;
  
    try {
      const axiosResponse = await axios.get(url);
  
      res.status(200).json({msg: axiosResponse.data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "weather server error" });
    }
  });





module.exports={
    apiroute
}