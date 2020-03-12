const Ajax = {
	get: function (url, params) {
		return new Promise(function (resolve, reject) {
			var req = new XMLHttpRequest();
			url = url + Ajax._buildParams(params);
			req.open("GET", url, true/* async:true */);
			req.setRequestHeader("Content-Type", "application/json");
			req.onload = function () {
				try {
					if (req.status != 200) {
						reject(req.response);
						return;
					}
					var response = JSON.parse(req.response);
					resolve(response);
				} catch (e) {
					reject(req.response);
				}
			}
			req.onerror = function (err) {
				reject(err);
			};
			req.send(JSON.stringify(data));
		});
	},
	post: function (url, payload) {
		return new Promise(function (resolve, reject) {
			let req = new XMLHttpRequest();
			req.open("POST", url, true);
			req.setRequestHeader("Content-Type", "application/json")
			req.onload = function () {
				try {
					if (req.status != 200) {
						reject(req.response);
						return;
					}
					var response = JSON.parse(req.response);
					resolve(response);
				} catch (e) {
					reject(req.response);
				}
			};
			req.onerror = function (error) {
				reject(error);
			}
			req.send(JSON.stringify(payload));
		});
	},

	_buildParams: function (params) {
		var ret = [];
		for (var i in params) {
			ret.push(encodeURIComponent(i) + "=" + encodeURIComponent(params[i]));
		}
		ret.push("" + new Date().getTime());
		//スペースを+にする
		return ret.join("&").replace(/%20/g, "+");
	}
}