const express=require("express");
const { auth } = require("../Middleware/auth.middleware");
const axios=require("axios");
const { usermodule } = require("../Models/user.model");

const apiroute=express.Router()

const { Configuration, OpenAIApi } = require("openai");

apiroute.get("/data",auth,async(req,res)=>{
  const email = req.body.email;
  try{
    const data = await usermodule.findOne({ email });
    res.status(200).json({msg: data});
  }
  catch(error){
    res.status(400).json({error: error});
  }
})

let conversationHistory = [];
apiroute.post("/api/chat/completions",auth, async (req, res) => {
    const url = "https://chat.nbox.ai/api/chat/completions";
    const email = req.body.email;
    const status = req.body.status;
    const user = await usermodule.findOne({ email });
    console.log(user.chats)
    if (status === "new chat" && user.email === req.body.email) {
      conversationHistory = []
      let chatKey = 1;
      while (user.chats[`chat${chatKey}`]) {
        chatKey++;
      }
      const sendTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata"
      });
      conversationHistory.push({ role:req.body.role, content: req.body.content ,time:sendTime});
      
      try {
        axios
       .post(url, {
         temperature: 0.5,
         messages: [
           {
             role: "system",
             content: "Answer the given questions in a friendy manner and follow certain rules: 1. If some one ask about weather of any city then say refer to your Nimblechat.ai weather section, tell that we have seperate section of weather informations 2. If some one ask about news information then say refer to your Nimblechat.ai news section, tell that we have seperate section of news informations "
           },
           req.body
         ],
         model: "llama2-chat-13b-4k",
         stream: false,
         max_tokens: 1000
       }, {
         headers: {
           "Content-Type": "application/json",
           "Authorization": process.env.Secret_Key
         }
       })
       .then(async(response) => {
        const recTime = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata"
        });
        response.data.choices[0].message["time"]=recTime
         conversationHistory.push(response.data.choices[0].message)
         console.log(response.data.choices[0].message);
         await usermodule.findByIdAndUpdate({_id:user._id}, { $set: { [`chats.chat${chatKey}`]: conversationHistory } })
         const data = await usermodule.findOne({ email });
         res.status(200).json({msg: data});
       })
       .catch((error) => {
         res.status(400).json({error: error});
       });
   
       
     } catch (error) {
       console.error(error);
       res.status(400).json({ error: "Proxy server error" });
     }
      
    }
    else{
      
        conversationHistory=[]
        const sendTime = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata"
        });
        conversationHistory.push({ role:req.body.role, content: req.body.content,time:sendTime });
      
      try {
        axios
       .post(url, {
         temperature: 0.5,
         messages: [
           {
             role: "system",
             content: "Answer the given questions in a friendy manner and follow certain rules: 1. If some one ask about weather of any city then say refer to your Nimblechat.ai weather section, tell that we have seperate section of weather informations 2. If some one ask about news information then say refer to your Nimblechat.ai news section, tell that we have seperate section of news informations "
           },
           req.body
         ],
         model: "llama2-chat-13b-4k",
         stream: false,
         max_tokens: 1000
       }, {
         headers: {
           "Content-Type": "application/json",
           "Authorization": process.env.Secret_Key
         }
       })
       .then(async(response) => {
        const recTime = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata"
        });
        response.data.choices[0].message["time"]=recTime
         conversationHistory.push(response.data.choices[0].message)
         await usermodule.findByIdAndUpdate({_id:user._id}, { $push: { [`chats.${status}`]:  {$each: conversationHistory}} })
         const data = await usermodule.findOne({ email });
         res.status(200).json({msg: data});
       })
       .catch((error) => {
        res.status(400).json({error: error});
       });
   
       
     } catch (error) {
       console.error(error);
       res.status(400).json({ error: "Proxy server error" });
     }
       
    }
    
  });








  const configuration = new Configuration({
    apiKey: process.env.API_KEY,
  });
  
  const openai = new OpenAIApi(configuration);



  apiroute.post("/weather",auth, async (req, res) => {
    
    const city=req.body.city
    const email = req.body.email;
    const status = req.body.status;
    const location="chennai"
    const user = await usermodule.findOne({ email });
    



    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Please act like a city shorting machine which go through all the content and only give city name 'Example: if input is waht is the temperature of Raipur then olny return Raipur' after checking the data and if there is no city name and the question is like the current lcation or near by area related to that then just say 'Current' and if there is nothing related to city temperature or current then just return 'Nothing'. IMPORTANT: Do not give answer other then that 'city name','Current' and 'Nothing'",
        },
        {
          role:"user",
          content:city
        },
      ],
      max_tokens: 130,
      temperature: 0,
    });


    let chatbotResponse =
        response.data.choices[0].message.content ;
        if(chatbotResponse=="I am an AI language model designed to assist with answering questions and providing information. How can I assist you today?"){
          chatbotResponse= "I'm a AI model Designspecifically for Weather informations, How can I assist you today?" 
        }
        else if(chatbotResponse=="Current"){
          chatbotResponse=location
        }
    
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${chatbotResponse}&units=metric&appid=${process.env.Weather_key}`;

  
    if (status === "new chat" && user.email === req.body.email) {
      conversationHistory=[]
      let chatKey = 1;
      while (user.weatherchats[`chat${chatKey}`]) {
        chatKey++;
      }
      const sendTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata"
      });
      
     
      conversationHistory.push({ role:"user", content: chatbotResponse,time:sendTime });
      try {
        if(chatbotResponse==="I'm a AI model Designspecifically for Weather informations, How can I assist you today?"){
          let response={"data":{}}
          const recTime = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Kolkata"
          });
          response.data.time=recTime
          response.data.role="assistant"
          conversationHistory.push(response.data)
          
          await usermodule.findByIdAndUpdate({_id:user._id}, { $set: { [`weatherchats.chat${chatKey}`]:  conversationHistory} })
          const data = await usermodule.findOne({ email });
          res.status(200).json({msg: data});
        }
        else{

        

          axios.get(url)
          .then(async(response)=>{
           
            const recTime = new Date().toLocaleString("en-US", {
              timeZone: "Asia/Kolkata"
            });
            response.data.time=recTime
            response.data.role="assistant"
            conversationHistory.push(response.data)
            
            await usermodule.findByIdAndUpdate({_id:user._id}, { $set: { [`weatherchats.chat${chatKey}`]:  conversationHistory} })
            const data = await usermodule.findOne({ email });
            res.status(200).json({msg: data});
          })
          .catch((err)=>{
            res.status(400).json({ error: err });
          })
        }
            
    }
    catch (error) {
      // console.error(error);
      res.status(400).json({ error: "Proxy server error" });
    }
  }
    else{
      
        conversationHistory=[]
        const sendTime = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata"
        });
        conversationHistory.push({ role:"user", content: chatbotResponse,time:sendTime });
      
      try {
        if(chatbotResponse==="I'm a AI model Designspecifically for Weather informations, How can I assist you today?"){
          let response={"data":{}}
          const recTime = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Kolkata"
          });
          response.data.time=recTime
          response.data.role="assistant"
          conversationHistory.push(response.data)
          
          await usermodule.findByIdAndUpdate({_id:user._id}, { $set: { [`weatherchats.chat${chatKey}`]:  conversationHistory} })
          const data = await usermodule.findOne({ email });
          res.status(200).json({msg: data});
        }
        else{
        axios.get(url)
          .then(async(response)=>{
            
            const recTime = new Date().toLocaleString("en-US", {
              timeZone: "Asia/Kolkata"
            });
            response.data.time=recTime
            response.data.role="assistant"
            conversationHistory.push(response.data)
            await usermodule.findByIdAndUpdate({_id:user._id}, { $push: { [`weatherchats.${status}`]:  {$each: conversationHistory}} })
            const data = await usermodule.findOne({ email });
            res.status(200).json({msg: data});
          })
          .catch((err)=>{
            res.status(400).json({error: err});
          })

        }
       
    }
    catch (error) {
      console.error(error);
      res.status(400).json({ error: error });
    }
  }
    
    
  }
  );


  apiroute.post("/news",auth, async (req, res) => {
    const title=req.body.title
    const url = `https://newsapi.org/v2/everything?q=${title}&sortBy=publishedAt&apiKey=${process.env.News_key}`;
    const email = req.body.email;
    const status = req.body.status;
    const user = await usermodule.findOne({ email });

    if (status === "new chat" && user.email === req.body.email) {
      conversationHistory=[]
      let chatKey = 1;
      while (user.newschats[`chat${chatKey}`]) {
        chatKey++;
      }
      const sendTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata"
      });
      
     
      conversationHistory.push({ role:"user", content: title,time:sendTime });
      try {
        
          axios.get(url)
          .then(async(response)=>{
           let obj={}
            const recTime = new Date().toLocaleString("en-US", {
              timeZone: "Asia/Kolkata"
            });
            obj.time=recTime
            if(response.data.articles.length==0){
              res.status(200).json({msg: "No news are there"});
            }
            else if(response.data.articles.length==1){
              obj.news1=response.data.articles[0]
              obj.role="assistant"
            }
            else if(response.data.articles.length==2){
              obj.news1=response.data.articles[0]
            obj.news2=response.data.articles[1]
            obj.role="assistant"
            }
            else{
              obj.news1=response.data.articles[0]
            obj.news2=response.data.articles[1]
            obj.news3=response.data.articles[2]
            obj.role="assistant"
            }
            
            conversationHistory.push(obj)
            
            await usermodule.findByIdAndUpdate({_id:user._id}, { $set: { [`newschats.chat${chatKey}`]:  conversationHistory} })
            const data = await usermodule.findOne({ email });
            res.status(200).json({msg: data});
          })
          .catch((err)=>{
            res.status(400).json({ error: err });
          })
            
    }
    catch (error) {
      // console.error(error);
      res.status(400).json({ error: "news server error" });
    }
  }

  else{
    conversationHistory=[]
      
      const sendTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata"
      });
      
     
      conversationHistory.push({ role:"user", content: title,time:sendTime });
      console.log(conversationHistory) 
      try {
        
          axios.get(url)
          .then(async(response)=>{
           let obj={}
            const recTime = new Date().toLocaleString("en-US", {
              timeZone: "Asia/Kolkata"
            });
            obj.time=recTime
            if(response.data.articles.length==0){
              res.status(200).json({msg: "No news are there"});
            }
            else if(response.data.articles.length==1){
              obj.news1=response.data.articles[0]
              obj.role="assistant"
            }
            else if(response.data.articles.length==2){
              obj.news1=response.data.articles[0]
            obj.news2=response.data.articles[1]
            obj.role="assistant"
            }
            else{
              obj.news1=response.data.articles[0]
            obj.news2=response.data.articles[1]
            obj.news3=response.data.articles[2]
            obj.role="assistant"
            }
            
            conversationHistory.push(obj)
           
            await usermodule.findByIdAndUpdate({_id:user._id}, { $push: { [`newschats.${status}`]:  {$each: conversationHistory}} })
            const data = await usermodule.findOne({ email });
            res.status(200).json({msg: data});
          })
          .catch((err)=>{
            res.status(400).json({ error: err });
          })
            
    }
    catch (error) {
      // console.error(error);
      res.status(400).json({ error: "news server error" });
    }
  }
    
  });





module.exports={
    apiroute
}


// {
//   "name":"Payal",
//   "email":"sahupayal220@gmail.com",
//   "password":"Payalsahu@26"
// }



// {
  
//   "email":"sahupayal220@gmail.com",
//   "password":"Payalsahu@26"
// }




// {
//   "role":"user",
//   "content":"Who are you",
//   "status":"new chat"
// }