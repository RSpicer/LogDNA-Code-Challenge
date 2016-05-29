var express = require('express'),
	app = express(),
	router = express.Router();
	port = process.env.PORT || 8000,
	parseHandler = require('./searchParse');

//NOTES: Only one operation allowed at a time (no AND plus OR)
//Spaces after operators will cause problems
//Invalid operators will cause problems (!+, <>, etc.)
//OR and AND must be uppercase
//Can only nest one level deep

app.use(function(req, res, next){
  if (req.is('text/*')) {
    req.text = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ req.text += chunk });
    req.on('end', next);
  } else {
    next();
  }
});

router.post('/parse', function(req, res) {
	console.error(req.text);
	res.send(parseHandler.mainHandler(req.text));
})

app.use('/api', router);

app.listen(port);
console.error("Express search parsing API running on port:", port);