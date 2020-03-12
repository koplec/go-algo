
// remove equaled value
Array.prototype.remove = function (v, /* optional */f) {
	if (f) {
		for (var i = 0; i < this.length; i++) {
			if (f(this[i], v)) {
				this.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	var ps = this.indexOf(v);
	if (ps > -1) {
		this.splice(ps, 1);
		return true;
	}
	return false;
};

//keyの値に応じてarrayを分ける
//{keyvalue0: [...], keyvalue1: [...], ...}のようにkeyの値に対して、配列が分けられる
Array.prototype.groupBy = function (key) {
	let items = this;
	let keys = [];
	for (var i = 0; i < items.length; i++) {
		let item = items[i];
		let k = item[key];
		if (!keys.includes(k)) {
			keys.push(k)
		}
	}

	let ret = {};
	keys.forEach((k) => {
		ret[k] = [];
	});

	for (var i = 0; i < items.length; i++) {
		let item = items[i]
		let k = item[key];
		ret[k].push(item);
	}

	return ret;
}

//複数のkeyの値に応じてarrayを分ける
Array.prototype.groupByKeys = function (keys, itemsKeyName) {
	let items = this;
	if (!itemsKeyName) itemsKeyName = "items";
	if (keys.length == 0) {
		return items;
	}

	let key0 = keys[0];
	if (keys.length == 1) {
		let ret = [];

		//key0の値を収集
		let key0Vals = [];
		items.forEach((i) => {
			let key0Val = i[key0];
			if (!key0Vals.includes(key0Val)) {
				key0Vals.push(key0Val);
				let obj = {};
				obj[key0] = key0Val;
				obj[itemsKeyName] = [];
				ret.push(obj);
			}
		});

		items.forEach((i) => {
			let key0Val = i[key0];
			let obj = ret.find((r) => {
				return r[key0] === key0Val;
			});
			obj[itemsKeyName].push(i);
		});
		return ret;
	} else {
		let ret = [];
		//1番目以降のkeyで分けた結果
		let ret1 = items.groupByKeys(keys.slice(1), itemsKeyName);

		ret1.forEach((obj1) => {
			let items = obj1[itemsKeyName];
			let keys1 = Object.keys(obj1);
			keys1.remove(itemsKeyName);

			//0番目のkeyで分ける
			let ret0 = items.groupByKeys([key0], itemsKeyName);
			ret0.forEach((obj0) => {
				keys1.forEach((k1) => {
					obj0[k1] = obj1[k1];
				});
				ret.push(obj0);
			});
		})
		return ret;
	}
}
/**
 * 複数のkeyの値に応じてsortする asc以外にしたいときは、fnで調整
 * */
Array.prototype.sortByKeys = function (keys, fns) {
	if (!fns) fns = {};
	let items = this;
	if (keys.length == 0) {
		return items;
	} else {
		return items.sort((a, b) => {
			for (let i = 0; i < keys.length; i++) {
				let key = keys[i];
				let fn = fns[key];
				if (!fn) {
					fn = (a, b) => {
						if (a[key] > b[key]) return 1;
						if (a[key] < b[key]) return -1;
						return false;
					};
				}
				let val = fn(a, b);
				if (val != false) return val;
			}
			return 0;
		});
	}
}

if (!HTMLElement.prototype.removeChildAll) {
	HTMLElement.prototype.removeChildAll = function () {
		while (this.firstChild) {
			this.removeChild(this.firstChild);
		}
	}
}