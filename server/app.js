//getting required modules
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose=require('mongoose');
const fs=require('fs');

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//connecting to database
mongoose.connect('mongodb://localhost:27017/CPHRS', { useNewUrlParser: true, useUnifiedTopology: true });

//getring instance of database
const db = mongoose.connection;

//checking for connection and error
db.on('error', function (error) {
 throw error;
});

db.once('open', function () {
 console.log('connected to database');
});

//Schema for storing encrypted records along with it keys
const cPHRSchema = new mongoose.Schema({
 name: { type: String},   
 public: { type: Buffer},
 master: { type: Buffer},
 data: [Buffer],
 symmetrickeys: [Buffer],
});

//creating model for the schema
const cPHRModel = mongoose.model('CPHR', cPHRSchema);


//handling the post request for storing the encrypted records and keys
app.post('/',(req,res)=>{
	console.log("request made to store records");
 	const phr = new cPHRModel({
  	name: req.body.name,
  	public: req.body.public,
  	master: req.body.master,
	data:req.body.data,
	symmetrickeys:req.body.symmetrickeys
 	});
 
 	//if record with the requested name already there deleting it and inserting a new record
 	cPHRModel.deleteOne({name:req.body.name},function(err){
		if (err) throw err;
  		phr.save(function(err){
  		if (err) throw err;
  		// console.log("saved");
      res.json({msg:'saved'});
  	});
  	});

  

 });

  //To check whether server running properly (particulary when installed in a cloud)
  app.get('/',(req,res)=>{
    res.send('hello from server');

  });
 
 
  //Policy schema a collection for managing shared policy
const cPolicySchema = new mongoose.Schema({
  policy : {type: String },
  key: {type: Buffer},
  origkey:{type: Buffer}
});

const cPolicyModel = mongoose.model('CPOLICIES',cPolicySchema);


//Checking the policy manager whether the policy already exists
app.post('/policymanager',async(req,res)=>{
    console.log("req made to policymanager");
    let policy=req.body.policy;
 	await cPolicyModel.find({policy:policy},function(err,data){
        if(data.length==0){
          res.json({key:false})
        }
        else{
          res.json(data)
        } 
      })
});


//updataing the policy managers with new encountered policy    
app.post('/updatepolicymanager',(req,res)=>{
    console.log("req made to update policymanager");
    
     let array=req.body.policyarray;
     let array1=req.body.keys;
     let array2=req.body.origkeys;
     
     for(let i=0;i<array.length-1;i++){
     console.log(array[i]);
     cPolicyModel.find({policy:array[i].trim()},function(err,data){
        
        if(data.length==0){
          const policy = new cPolicyModel({
          policy:array[i].trim(),
          key: array1[i],
          origkey:array2[i]
          });
          policy.save(function(err){
              if (err) throw err;
    
          });
        }
         
      })
     }
     res.json({msg:"saved"});
  });


//handling the request made by an medical worker for patients health records
app.post('/getrec',(req,res)=>{
	console.log('url hit')
	cPHRModel.find({name:req.body.name},function(err,data){
     console.log(req.body.name,data);
 	res.json(data);	
 });
})

const port = process.env.PORT||3000;


app.listen(port, () => console.log('Server running on port ' + port));