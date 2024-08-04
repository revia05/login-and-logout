require('dotenv').config();
const express=require('express');
const path=require('path');
const app=express();
const hbs=require('hbs')
const bcrypt=require("bcryptjs")
const jwt=require('jsonwebtoken')
require("./conn")
const Register=require("./register")
const port=process.env.PORT || 3000;

const static_path=path.join(__dirname,"./public");
const template_path=path.join(__dirname,"./views");
const partials_path=path.join(__dirname,"./partials");

app.use(express.static(static_path));

//for connecting to the server data
app.use(express.urlencoded({extended:false}));
app.set("view engine","hbs");
app.set("views",template_path)

hbs.registerPartials(partials_path)

//console.log(process.env.SECRET_KEY)

app.get("/",(req,res)=>{
    res.render("index");
})

app.get("/register.hbs",(req,res)=>{
    res.render("register.hbs");
})

app.get("/login.hbs",(req,res)=>{
    res.render("login.hbs");
})

app.post("/register.hbs",async(req,res)=>{
    try{
        const password=req.body.password;
        const cpassword=req.body.confirmpassword;
        if(password===cpassword){
            const registerEmployee=new Register({
                name:req.body.name,
                email:req.body.email,
                password:password,
                confirmpassword:cpassword
            })
            console.log("the success part"+registerEmployee)

            const token =await registerEmployee.generateAuthToken();
            console.log("the token part is" + token)

            const registered=await registerEmployee.save();
            console.log("the page part is"+ registered)
            res.status(201).render("index");
        }
        else{
            res.send("password is not matching...")
        }
    }
    catch(err){
        res.status(404).send(err)
    }
    
})

app.post("/login.hbs",async(req,res)=>{
   try{
        const email = req.body.email;
        const password=req.body.password;
        const useremail=await Register.findOne({email:email});
        //console.log(`${email}and password is${password}`)
        //FINDING THE USER PASSWORD..
        //res.send(useremail.password) 
        const isMatch=await bcrypt.compare(password,useremail.password);

        const token =await useremail.generateAuthToken();
        console.log("the token part is" + token)

        if(isMatch){
            res.status(201).render("index");
        }
        else{
            res.send("Invalid Login details")
        }
        //console.log(useremail)
   }
   catch(error){
        res.status(400).send("invalid Login Details")
   }
})

app.listen(port,()=>{
    console.log(`server is running at port no. ${port}`);
})