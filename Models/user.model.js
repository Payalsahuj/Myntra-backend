const mongoose=require("mongoose")

const userschema=mongoose.Schema({
    name:String,
    email:String,
    password:String,
    chats:{type:Object,default:{}},
    weatherchats:{type:Object,default:{}},
    newschats:{type:Object,default:{}},
    taskchat:{type:Object,default:{}}
})

const usermodule=mongoose.model("user",userschema)


module.exports={
    usermodule
}