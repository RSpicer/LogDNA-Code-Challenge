function mainHandler (text) {
	//RegEXP to parse out multiple values in parenthesis, multiple words in quotes, or single words.
	var textArr = text.match(/(\([^(]+\)|[!<>=]{0,2}"[^"]+"|[^"\s]+)/g);
	var filteredObj;

	if (textArr.length === 0) {
		return undefined;
	} else if (textArr.length === 1) {
		return parseArr({values: textArr, isOR: false})
	} else {
		filteredObj = filterOperators(textArr);
		return parseArr(filteredObj);
	}	
}

//Filter ORs and ANDs out of an array of words; then, return an Obj denoting whether it was an OR or AND operation.
function filterOperators (textArr) {
	var filteredArray,
		filteredObj = {};

	//Check if OR exists in array; else, assume AND.
	function _checkOperators(textArr) {
		for (var i = 0; i < textArr.length; i++) {
			if (textArr[i] === "OR") {
		  		return true;
				}
			}
		return false;
	}

	if (_checkOperators(textArr) === true) {
		filteredArray = textArr.filter(function(value){
			return !(value === "OR");
		});
		filteredObj.values = filteredArray;
		filteredObj.isOR = true;
		return filteredObj;
	} else {
		filteredArray = textArr.filter(function(value){
			return !(value === "AND");
		})
		filteredObj.values = filteredArray;
		filteredObj.isOR = false;
		return filteredObj;
	}
}

function parseArr (filteredObj) {
	var finalObj = {},
		filteredArr = filteredObj.values,
		//RegEXP to test if the given value is in parens
		inParens = /(\([^(]+\))/g,
		//RegEXP to break out words in parens
		filterWords = /([^\(\)"\s]+)/g
		//RegEXP to parse out operators.
		parseOperators = /([!<>=]{1,2})/g

	//If OR operation...
	if (filteredObj.isOR === true) {
		finalObj["$or"] = [];
		for (var i = 0; i < filteredArr.length; i++) {
			//Test if an operation inside parens
			var testParens = filteredArr[i].match(inParens);
			if (testParens) {
				//Filter out ORs and ANDs from inside the parens
				var tempObj = filterOperators(testParens[0].match(filterWords)),
					tempArr = tempObj.values;

				//If OR operation inside parens...
				if (tempObj.isOR === true) {
					finalObj["$or"].push({"$or": []});
					for (var x = 0; x < tempArr.length; x++) {
						//Test if operators (!=<>) for each individual search term
						var operators = tempArr[x].match(parseOperators);

						if (operators) {
							if (operators[0] === "!") {
								finalObj["$or"][i]["$or"].push({"$not": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === ">") {
								finalObj["$or"][i]["$or"].push({"$gt": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === "<") {
								finalObj["$or"][i]["$or"].push({"$lt": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === "=") {
								finalObj["$or"][i]["$or"].push({"$eq": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === ">=") {
								finalObj["$or"][i]["$or"].push({"$gte": tempArr[x].substring(2, tempArr[x].length)});
							} else if (operators[0] === "=<") {
								finalObj["$or"][i]["$or"].push({"$lte": tempArr[x].substring(2, tempArr[x].length)});
							} else {
								//ERROR
							}
						} else {
							//If no operators...
							finalObj["$or"][i]["$or"].push(tempArr[x]);
						}
					}
				} else {
					finalObj["$or"].push({"$and": []});
					for (var x = 0; x < tempArr.length; x++) {
						var operators = tempArr[x].match(parseOperators);

						if (operators) {
							if (operators[0] === "!") {
								finalObj["$or"][i]["$and"].push({"$not": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === ">") {
								finalObj["$or"][i]["$and"].push({"$gt": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === "<") {
								finalObj["$or"][i]["$and"].push({"$lt": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === "=") {
								finalObj["$or"][i]["$and"].push({"$eq": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === ">=") {
								finalObj["$or"][i]["$and"].push({"$gte": tempArr[x].substring(2, tempArr[x].length)});
							} else if (operators[0] === "=<") {
								finalObj["$or"][i]["$and"].push({"$lte": tempArr[x].substring(2, tempArr[x].length)});
							} else {
								//ERROR
							}
						} else {
							finalObj["$or"][i]["$and"].push(tempArr[x]);
						}
					}
				}
			} else {
				var operators = filteredArr[i].match(parseOperators);

				if (operators) {
					if (operators[0] === "!") {
						finalObj["$or"].push({"$not": filteredArr[i].substring(1, filteredArr[i].length)});
					} else if (operators[0] === ">") {
						finalObj["$or"].push({"$gt": filteredArr[i].substring(1, filteredArr[i].length)});
					} else if (operators[0] === "<") {
						finalObj["$or"].push({"$lt": filteredArr[i].substring(1, filteredArr[i].length)});
					} else if (operators[0] === "=") {
						finalObj["$or"].push({"$eq": filteredArr[i].substring(1, filteredArr[i].length)});
					} else if (operators[0] === ">=") {
						finalObj["$or"].push({"$gte": filteredArr[i].substring(2, filteredArr[i].length)});
					} else if (operators[0] === "=<") {
						finalObj["$or"].push({"$lte": filteredArr[i].substring(2, filteredArr[i].length)});
					} else {
						//ERROR
					}
				} else {
					finalObj["$or"].push(filteredArr[i]);
				}
			}
		}
	} else {
		finalObj["$and"] = [];
		for (var i = 0; i < filteredArr.length; i++) {
			var testParens = filteredArr[i].match(inParens);
			if (testParens) {
				//Filter out ORs and ANDs, as before
				var tempObj = filterOperators(testParens[0].match(filterWords)),
					tempArr = tempObj.values;
				if (tempObj.isOR === true) {
					finalObj["$and"].push({"$or": []});
					for (var x = 0; x < tempArr.length; x++) {
						var operators = tempArr[x].match(parseOperators);

						if (operators) {
							if (operators[0] === "!") {
								finalObj["$and"][i]["$or"].push({"$not": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === ">") {
								finalObj["$and"][i]["$or"].push({"$gt": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === "<") {
								finalObj["$and"][i]["$or"].push({"$lt": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === "=") {
								finalObj["$and"][i]["$or"].push({"$eq": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === ">=") {
								finalObj["$and"][i]["$or"].push({"$gte": tempArr[x].substring(2, tempArr[x].length)});
							} else if (operators[0] === "=<") {
								finalObj["$and"][i]["$or"].push({"$lte": tempArr[x].substring(2, tempArr[x].length)});
							} else {
								//ERROR
							}
						} else {
							finalObj["$and"][i]["$or"].push(tempArr[x]);
						}
					}
				} else {
					finalObj["$and"].push({"$and": []});
					for (var x = 0; x < tempArr.length; x++) {
						var operators = tempArr[x].match(parseOperators)

						if (operators) {
							if (operators[0] === "!") {
								finalObj["$and"][i]["$and"].push({"$not": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === ">") {
								finalObj["$and"][i]["$and"].push({"$gt": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === "<") {
								finalObj["$and"][i]["$and"].push({"$lt": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === "=") {
								finalObj["$and"][i]["$and"].push({"$eq": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === ">=") {
								finalObj["$and"][i]["$and"].push({"$gte": tempArr[x].substring(2, tempArr[x].length)});
							} else if (operators[0] === "=<") {
								finalObj["$and"][i]["$and"].push({"$lte": tempArr[x].substring(2, tempArr[x].length)});
							} else {
								//ERROR
							}
						} else {
							finalObj["$and"][i]["$and"].push(tempArr[x]);
						}
					}
				}
			} else {
				var operators = filteredArr[i].match(parseOperators),
					testLen = filteredArr[i].match(isLen);

				if (operators) {
					if (operators[0] === "!") {
						finalObj["$and"].push({"$not": filteredArr[i].substring(1, filteredArr[i].length)});
					} else if (operators[0] === ">") {
						finalObj["$and"].push({"$gt": filteredArr[i].substring(1, filteredArr[i].length)});
					} else if (operators[0] === "<") {
						finalObj["$and"].push({"$lt": filteredArr[i].substring(1, filteredArr[i].length)});
					} else if (operators[0] === "=") {
						finalObj["$and"].push({"$eq": filteredArr[i].substring(1, filteredArr[i].length)});
					} else if (operators[0] === ">=") {
						finalObj["$and"].push({"$gte": filteredArr[i].substring(2, filteredArr[i].length)});
					} else if (operators[0] === "=<") {
						finalObj["$and"].push({"$lte": filteredArr[i].substring(2, filteredArr[i].length)});
					} else {
						//ERROR
					}
				} else {
					finalObj["$and"].push(filteredArr[i]);
				}
			}
		}
	}
	return finalObj;
}

module.exports = {mainHandler: mainHandler, filterOperators: filterOperators, parseArr: parseArr};