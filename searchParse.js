function mainHandler (text) {
	//RegEXP to parse out multiple values in parenthesis, multiple words in quotes, or single words.
	var textArr = text.match(/(\([^(]+\)|[!<>=]{0,2}"[^"]+"|[^"\s]+)/g);
	var filteredObj;

	if (textArr.length === 0) {
		return undefined;
	} else if (textArr.length === 1) {
		//parse
	} else {
		filteredObj = filterOperators(textArr);
		return parseArr(filteredObj);
	}	
}

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

	//If an OR operation, remove ORs and return filteredArray and true. Else, do the same for AND, and fales.
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
		//RegEXP to parse out operators.
		parseOperators = /([!<>=]{1,2})/g,
		//RegEXP to test if len(x)
		isLen = /(len\(\d+\))/g;

	if (filteredObj.isOR === true) {
		finalObj["$or"] = [];
		for (var i = 0; i < filteredArr.length; i++) {
			var testParens = filteredArr[i].match(inParens);
			if (testParens) {
				//Filter out ORs and ANDs, as before
				var tempObj = filterOperators(testParens),
					tempArr = tempObj.values;
				if (tempObj.isOR === true) {
					finalObj["$or"].push({"$or": []});
					for (var x = 0; x < tempArr.length; x++) {
						var operators = tempArr[x].match(parseOperators),
							testLen = tempArr[x].match(isLen);
						if(testLen) {
							var lenDigits = testLen[0].substring(4, tempArr[x].length - 1)
							tempArr[x] = {"$len": lenDigits}
						}

						if (operators) {
							if (operators[0] === "!") {
								finalObj["$or"]["$or"].push({"$not": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === ">") {
								finalObj["$or"]["$or"].push({"$gt": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === "<") {
								finalObj["$or"]["$or"].push({"$lt": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === "=") {
								finalObj["$or"]["$or"].push({"$eq": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === ">=") {
								finalObj["$or"]["$or"].push({"$gte": tempArr[x].substring(2, tempArr[x].length)});
							} else if (operators[0] === "=<") {
								finalObj["$or"]["$or"].push({"$lte": tempArr[x].substring(2, tempArr[x].length)});
							} else {
								//ERROR
							}
						} else {
							finalObj["$or"]["$or"].push(tempArr[x]);
						}
					}
				} else {
					finalObj["$or"].push({"$and": []});
					for (var x = 0; x < tempArr.length; x++) {
						var operators = tempArr[x].match(parseOperators),
							testLen = tempArr[x].match(isLen);
						if(testLen) {
							var lenDigits = testLen[0].substring(4, tempArr[x].length - 1)
							tempArr[x] = {"$len": lenDigits}
						}

						if (operators.length > 0) {
							if (operators[0] === "!") {
								finalObj["$or"]["$and"].push({"$not": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === ">") {
								finalObj["$or"]["$and"].push({"$gt": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === "<") {
								finalObj["$or"]["$and"].push({"$lt": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === "=") {
								finalObj["$or"]["$and"].push({"$eq": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === ">=") {
								finalObj["$or"]["$and"].push({"$gte": tempArr[x].substring(2, tempArr[x].length)});
							} else if (operators[0] === "=<") {
								finalObj["$or"]["$and"].push({"$lte": tempArr[x].substring(2, tempArr[x].length)});
							} else {
								//ERROR
							}
						} else {
							finalObj["$or"]["$and"].push(tempArr[x]);
						}
					}
				}
			} else {
				var operators = filteredArr[i].match(parseOperators),
					testLen = filteredArr[i].match(isLen);

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
				var tempObj = filterOperators(testParens),
					tempArr = tempObj.values;
				if (tempObj.isOR === true) {
					finalObj["$and"].push({"$or": []});
					for (var x = 0; x < tempArr.length; x++) {
						var operators = tempArr[x].match(parseOperators),
							testLen = tempArr[x].match(isLen);
						if(testLen) {
							var lenDigits = testLen[0].substring(4, tempArr[x].length - 1)
							tempArr[x] = {"$len": lenDigits}
						}

						if (operators) {
							if (operators[0] === "!") {
								finalObj["$and"]["$or"].push({"$not": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === ">") {
								finalObj["$and"]["$or"].push({"$gt": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === "<") {
								finalObj["$and"]["$or"].push({"$lt": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === "=") {
								finalObj["$and"]["$or"].push({"$eq": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === ">=") {
								finalObj["$and"]["$or"].push({"$gte": tempArr[x].substring(2, tempArr[x].length)});
							} else if (operators[0] === "=<") {
								finalObj["$and"]["$or"].push({"$lte": tempArr[x].substring(2, tempArr[x].length)});
							} else {
								//ERROR
							}
						} else {
							finalObj["$and"]["$or"].push(tempArr[x]);
						}
					}
				} else {
					finalObj["$and"].push({"$and": []});
					for (var x = 0; x < tempArr.length; x++) {
						var operators = tempArr[x].match(parseOperators),
							testLen = tempArr[x].match(isLen);
						if(testLen) {
							var lenDigits = testLen[0].substring(4, tempArr[x].length - 1)
							tempArr[x] = {"$len": lenDigits}
						}

						if (operators) {
							if (operators[0] === "!") {
								finalObj["$and"]["$and"].push({"$not": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === ">") {
								finalObj["$and"]["$and"].push({"$gt": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === "<") {
								finalObj["$and"]["$and"].push({"$lt": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === "=") {
								finalObj["$and"]["$and"].push({"$eq": tempArr[x].substring(1, tempArr[x].length)});
							} else if (operators[0] === ">=") {
								finalObj["$and"]["$and"].push({"$gte": tempArr[x].substring(2, tempArr[x].length)});
							} else if (operators[0] === "=<") {
								finalObj["$and"]["$and"].push({"$lte": tempArr[x].substring(2, tempArr[x].length)});
							} else {
								//ERROR
							}
						} else {
							finalObj["$and"]["$and"].push(tempArr[x]);
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

console.error(mainHandler("(error OR info) AND (lol OR lel)"));