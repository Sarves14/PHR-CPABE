//getting require modules
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const child_process = require('child_process').execSync;
const axios = require('axios');



app.use(cors());
app.use(express.static(__dirname + '/client'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


let n, data, policy;
let encrypted = {};

//handling request from the patient side front end and perform encryption at the front end 
app.post('/', async (req, res) => {
  console.log("Patient requested storage of data");
  n = req.body.n;
  data = req.body.data;
  policy = req.body.POLICY.trim();
  let newpolicy = "";
  policy = policy.replace(/\s\s+/, ' ');

  //getting polices and check the policy manager wheter it already exists
  let policyarray = policy.split(";");
  for (let i = 0; i < policyarray.length - 1; i++) {
    await axios.post('http://localhost/policymanager', { policy: policyarray[i].trim() }).then(async (response) => {
      //false means it does not exists so concatnate into single string
      if (response.data.key == false) {
        newpolicy = newpolicy + policyarray[i].trim() + "; "
      }
      //if present concatnate into single string with '+' so that it will be left when encryption done and directly write the encrypted text
      else {
        console.log("Common policy found: " + response.data[0].policy);
        newpolicy = newpolicy + policyarray[i].trim() + "+; "
        await fs.writeFile("encrypt" + (i + 1) + ".txt", Buffer.from(response.data[0].key.data));
        await fs.writeFile("origkey" + (i + 1) + ".txt", Buffer.from(response.data[0].origkey.data));
      }
    }).catch((err) => { console.log(err) });
  }

  //removing extra spaces so that encryption can be done smoothly
  newpolicy = newpolicy.replace(/\s\s+/g, ' ');

  //generating neccessary files so that java can do the encryption
  await fs.writeFile('nvalue.txt', n);
  await fs.writeFile('policy.txt', newpolicy);
  for (var i = 1; i <= n; i++) {
    await fs.writeFile('data' + i + '.txt', data['data' + i]);
  }
  encrypted.name = req.body.name.toLowerCase();
  encrypted.n = req.body.n;
  let op = "";

  //spawning a child process a java execution comman
  //which will read files and perform encryption and generate keys
  op = child_process('java Setup');
  //printing java output stream which is time taken for encryption
  console.log(new String(op).toString())

  //reading output of java 
  await fs.readFile(path.join(__dirname, "keys", 'public.txt')).then((result) => { encrypted['public'] = result; }).catch(function (error) {
    console.log(error);
  })

  await fs.readFile(path.join(__dirname, 'keys', 'master.txt')).then((result) => { encrypted['master'] = result; }).catch(function (error) {
    console.log(error);
  })
  let arr = [];
  for (let i = 1; i <= n; i++) {
    await fs.readFile('CT' + i + '.txt').then((result) => {
      arr[i - 1] = result;
    }).catch(function (error) {
      console.log(error);
    })
  }
  encrypted.data = arr;
  arr = [];
  for (let i = 1; i <= n; i++) {
    await fs.readFile('encrypt' + i + '.txt').then((result) => { arr[i - 1] = result; }).catch(function (error) {
      console.log(error);
    })
  }
  encrypted.symmetrickeys = arr;
  arr = [];
  for (let i = 1; i <= n; i++) {
    await fs.readFile('origkey' + i + '.txt').then((result) => { arr[i - 1] = result; }).catch(function (error) {
      console.log(error);
    })
  }

  //posting the encrypted records into server
  await axios.post('http://localhost:3000/', encrypted)
    .then(function (response) { })

    .catch(function (error) {
      // handle error
      console.log(error);
    })

  //updating policy manager with new policy  
  await axios.post('http://localhost/updatepolicymanager', { policyarray: policyarray, keys: encrypted.symmetrickeys, origkeys: arr })
    .then(function (response) { })

    .catch(function (error) {
      // handle error
      console.log(error);
    })

  //deleting all generated files 
  child_process('del *.txt');  
  res.json({ msg: "upload successfull" });

})




//hosting the patient front end page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log('App running'));