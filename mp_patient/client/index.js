var ln2data="";

function getFile() {
	
  var fileToLoad = document.getElementById(id).files[0];

  var fileReader = new FileReader();
  fileReader.onload = function(fileLoadedEvent){
      var textFromFileLoaded = fileLoadedEvent.target.result;
      ln2data=ln2data+"textFromFileLoaded"+"; ";
  };

  fileReader.readAsText(fileToLoad, "UTF-8");

    
  
}

function generateRows(event) {
	event.preventDefault();
	console.log(1);
	var val = document.getElementById("form-number").value;
	console.log(val);
	var myNode = document.getElementById("generated");
	console.log(myNode);
	myNode.innerHTML = "";
	console.log(myNode)

	for (i = 1; i <= val; i++) {
		console.log("hi")
		var inputfield1id;
		var inputfield2id;


		inputfield1id = "inputfield1" + i;
		inputfield2id = "inputfield2" + i;






		var breakele = document.createElement("br");
		var spanele = document.createElement("span");

		var labelPHR = document.createElement("label");
		labelPHR.setAttribute("for", inputfield1id);
		labelPHR.setAttribute("class", "btn-warning col-2");
		var textnode = document.createTextNode("PHR: ");
		labelPHR.appendChild(textnode);

		var labelPOLICY = document.createElement("label");
		labelPOLICY.setAttribute("for", inputfield2id);
		labelPOLICY.setAttribute("class", "btn-warning col-2");

		var textnode = document.createTextNode("POLICY: ");
		labelPOLICY.appendChild(textnode);

		var newel1 = document.createElement("input");
		newel1.setAttribute("type","file");
		newel1.setAttribute("id", inputfield1id);
		
		newel1.setAttribute("class", "inputfields col-9");

		var newel2 = document.createElement("input");
		newel2.setAttribute("id", inputfield2id);
		newel2.setAttribute("class", "inputfields col-9");

		document.getElementById("generated").appendChild(labelPHR);
		document.getElementById("generated").appendChild(newel1);
		document.getElementById("generated").appendChild(breakele);
		document.getElementById("generated").appendChild(labelPOLICY);
		document.getElementById("generated").appendChild(newel2);

	}
}
async function submit(event) {
	event.preventDefault();
	var submit=document.getElementById("submit");
	
	var spanele1=document.createElement("span");
	var spanele2=document.createElement("span");

	spanele1.setAttribute("class","spinner-border spinner-border-sm");
	spanele1.setAttribute("role","status");
	spanele1.setAttribute("aria-hidden","true");

	var txtnode	= document.createElement("Loading");
	spanele2.appendChild(txtnode);
	spanele2.setAttribute("class","sr-only");
	submit.appendChild(spanele1);
	submit.appendChild(spanele2);


	
	var line1DataValue = document.getElementById("form-number").value;
	var line1Data = new String(line1DataValue);
	var name = document.getElementById("name").value;
	var data={};
	var line3Data = "";

	for (let i = 1; i <= line1DataValue; i++) {
		var fileToLoad = document.getElementById("inputfield1"+i).files[0];
   		var fileReader = new FileReader();
	
			async function callme () {
				return new Promise((resolve,reject)=>{
					fileReader.onload = event => resolve(event.target.result)
    				fileReader.onerror = error => reject(error)
   					fileReader.readAsText(fileToLoad)
				});
			}
		await callme().then(content=>{data["data"+i]=content;})
			.catch(err=>{console.log(err)});
        	//console.log(textFromFileLoaded);
    }

	
	for (let j = 1; j <= line1DataValue; j++) {
		line3Data += document.getElementById("inputfield2" + j).value;
		line3Data += "; ";
	}
	console.log(data);

	axios.post('http://localhost:5000/', { n: line1DataValue, name: name, data, POLICY: line3Data })
		.then(function (response) {
			// handle success
			submit.setAttribute("class","btn btn-primary");
			submit.innerHTML="Submit";
			console.log(response);
		})
		.catch(function (error) {
			// handle error
			console.log(error);
		})

}

/*
newel1.addEventListener("change", 
		function getFile(inputfield1id) {
	
		    
         }		
			);
*/