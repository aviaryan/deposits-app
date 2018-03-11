export function sortOnKeys(dict) {
	let sorted = [];
	for (let key in dict) {
		sorted.push(key);
	}
	sorted.sort();

	let tempDict = {};
	for (let i = 0; i < sorted.length; i++) {
		tempDict[sorted[i]] = dict[sorted[i]];
	}

	return tempDict;
}
