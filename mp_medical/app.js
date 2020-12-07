//getting required modules
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const fs = require('fs').promises;
const child_process = require('child_process').execSync;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/client'));
  
let prevname='';
let keyobj={};

//hosting medical worker side front end
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

let request={},attribute_string="";

//handling medical worker request from front end
app.post('/', (req, res) => {
	console.log('Medical worker requesting for PHR');
	request.name=req.body.name;
	attribute_string=req.body.attribute;
	
	async function callback(){
		await axios.post('http://localhost:3000/getrec',request)
		.then(async function(response) {
				// handle success
			const data=response.data;
			if(prevname===req.body.dname){
				console.log("matched prevuser");
				for(let i=0;i<data[0].symmetrickeys.length;i++){
				if(keyobj.hasOwnProperty(Buffer.from(data[0].symmetrickeys[i]).toString().toString())){	
					await fs.writeFile('symmetrickeys'+i+'.txt',"true");
					   await fs.writeFile('decrypt'+i+'.txt',keyobj[Buffer.from(data[0].symmetrickeys[i]).toString().toString()]);
				}
				else{
					await fs.writeFile('symmetrickeys'+i+'.txt',Buffer.from(data[0].symmetrickeys[i]));
				}
				}	
			}
			else{
				for(let i=0;i<data[0].symmetrickeys.length;i++){
				await fs.writeFile('symmetrickeys'+i+'.txt',Buffer.from(data[0].symmetrickeys[i]));
				}	
			}

			//writing required files for decryption
			await fs.writeFile('attributes.txt', data[0].data.length+'\n'+attribute_string+','+req.body.dname);
			await fs.writeFile('public.txt',Buffer.from(data[0].public));
			await fs.writeFile('master.txt',Buffer.from(data[0].master));
			for(let i=0;i<data[0].data.length;i++){
				await fs.writeFile('data'+i+'.txt',Buffer.from(data[0].data[i]));
			}
			
			//if response contains no data alerting the same
			if(data[0].data.length==0){
				res.json({msg:'no data'});
			}

			//else call java decryption
			else{
			let op= child_process('java Setup');

			//printing the ouput stream of java which is time for decryption
			console.log(op.toString().toString());

			//getting the decrypted data
			for(let i=0;i<data[0].symmetrickeys.length;i++){
				await fs.readFile('decrypt'+i+'.txt').then((result) => { keyobj[Buffer.from(data[0].symmetrickeys[0]).toString().toString()]=result }).catch(function (error) {
      		console.log(error);});
			}

			let patientdetails=[];
    		for(let i=0;i<data[0].symmetrickeys.length;i++){
				await fs.readFile('plaintext'+i+'.txt').then((result) => { patientdetails[i] = result.toString(); }).catch(function (error) {
      		console.log(error);});
			}
    		
    		//deleting all generated files 
  			child_process('del *.txt');  

      		//provide response as decrypted patients health record
	  		res.json({details:patientdetails});
    		}	
		})
		.catch(function (error) {
			// handle error
			console.log(error);
			res.json({msg:'error occured'});
		})		
	}
	callback();
});


app.listen(2000, () => console.log('App running'));