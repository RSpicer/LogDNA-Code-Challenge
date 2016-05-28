var express = require('express'),
	app = express(),
	port = process.env.PORT || 8000;

//NOTES: Only one operation allowed at a time (no AND plus OR)
//Spaces after operators will cause problems
//Invalid operators will cause problems (!+, <>, etc.)
//OR and AND must be uppercase

app.post('/parse', function(req, res)) {

}

app.listen(port);