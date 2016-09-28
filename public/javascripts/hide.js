function getFile(filename) {
	document.getElementById('download').addEventListener('click', function() {
		var req = new XMLHttpRequest(),
		url = "/api/uploads/"+filename;

		req.open('GET', url, true);

		req.addEventListener('load', function() {
			if (req.status >= 200 && req.status < 400){
				console.log('Success!');
				window.location.href = url;
			} 
		});
		req.send();
	});
}



