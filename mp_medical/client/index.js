function submit(event) {
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


	document.getElementById("details").innerHTML="";
	var name = document.getElementById("namefield").value;
	var speciality = document.getElementById("specialityfield").value;
	var patientname = document.getElementById("patientfield").value;

	

	axios.post('http://localhost:2000/', { name:patientname,attribute:speciality,dname:name })
		.then(function (response) {
			// handle success
			submit.setAttribute("class","btn btn-primary");
			submit.innerHTML="Submit";

			console.log(response.data.details);
			var namenode=document.createElement("div");
			var namenodeele = document.createTextNode(patientname.toUpperCase());
			namenode.appendChild(namenodeele);
			// document.getElementById("details").innerHTML=response.data.details;
			response.data.details.forEach( item => {
				var ele = document.createElement("div");
				var textnode = document.createTextNode(item.toUpperCase());
				
				ele.appendChild(textnode);
				document.getElementById("details").appendChild(ele);
			});
		})
		.catch(function (error) {
			// handle error
			console.log(error);
		})

}
