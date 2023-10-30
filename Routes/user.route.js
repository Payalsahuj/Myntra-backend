const express=require("express")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const { usermodule } = require("../Models/user.model")

const userroute=express.Router()


userroute.post("/register",async(req,res)=>{
    let {name,email,password}=req.body
    if(/\d/.test(password) && /[A-Z]/.test(password) && /[!@#$%^&*]/.test(password) && password.length >= 8){
        const data=await usermodule.find({email})
        if(data.length!=0){
            res.status(400).json({ error: "This Account has already been registered" })
        }
        else{
            try{
                bcrypt.hash(password,5,async(err,hash)=>{
                    if(err){
                        res.status(400).json({error:err})
                    }
                    else{
                        const user = new usermodule({ name, email,password: hash })
                        await user.save()
                        
                        res.status(200).json({ msg: "The new user has been registered", registeredUser: req.body })
                    }
                })
            }
            catch(err){
                res.status(400).json({error:err})
            }
        }
    }
    else {
        res.status(400).json({ error: "Password should contain atleast one numeric value, special character, uppercase letter and the length should be of 8 or long" })
    }
})


userroute.post("/login", async(req, res) =>{
    const {email,password}=req.body
    try{
        const user=await usermodule.findOne({email})
        if(user){
            bcrypt.compare(password,user.password, (err,result)=>{
                if(result){
                    var token=jwt.sign({course:"backend",email:user.email},"payal")
                    res.status(200).json({msg:"Login successfull!",token:token})
                }
                else{
                    res.status(400).json({error:"Wrong Credential"})
                }
            })
        }
        else{
            res.status(400).json({msg:"User not found"})
        }
    }
    catch(err){
        res.status(400).json({ error: err.message })
    }
})






module.exports={
    userroute
}