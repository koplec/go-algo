/*global
uuid
 */

/**
 * document.createElement, document.getElementByIdが長いので、Elで代替する
 */
const El = (function () {
	function create(tagName, opt/* {id, classList, t} */) {
		if (typeof opt == "undefined") opt = {};
		const elem = document.createElement(tagName);
		if (opt.id) {
			elem.id = opt.id;
		} else {
			//elem.id = uuid();
		}
		if (opt.classList) {
			let classList = opt.classList;
			if (classList instanceof Array) {
				elem.className = classList.join(" ");
			}
			if (typeof classList === "string") {
				elem.className = classList;
			}
		}
		if (opt.t) {
			elem.textContent = opt.t;
		}
		return elem
	}

	function get(elemId) {
		return document.getElementById(elemId);
	}

	return function (...args) {
		if (args.length === 1) {
			if (El.tagNames.find((t) => { return t.toLowerCase() === args[0]; })) return create(args[0]);
			return get(...args)
		} else if (args.length === 2 || args.length === 3) {
			return create(...args)
		} else {
			throw "El arguments length invalid";
		}
	}
})();

/**
 * elementを作成するためのショートカット
 */
//要素名のショートカットを作る
El.tagNames = [
	"body",
	"div", "a", "h1", "h2", "h3", "h4", "h5", "h6", "input",
	"ul", "li", "img", "span",
	"button", "input", "label", "select", "option", "textarea",
	"table", "th", "tr", "td", "thead", "tbody",
	"br", "img"
];
El.tagNames.forEach((tag) => {
	El[tag] = function (opt) {
		opt = opt || {};
		return El(tag, opt);
	}
});
Object.assign(El, {
	body: function () {
		return document.getElementsByTagName("body")[0];
	},
	text: function (txt) {
		return document.createTextNode(txt);
	},
	spanText: function (txt, id, classList) {
		let elem = El.span(id, classList);
		let text = El.text(txt);
		elem.appendChild(text);
		return elem;
	},
	spanIcon: function (icon, id, classList) {
		classList = classList || [];
		classList.push("glyphicon");
		classList.push(`glyphicon-${icon}`)
		let elem = El.span(null, classList)
		elem.setAttribute("aria-hidden", true);
		return elem;
	},
	divText: function (t, opt/*txt, id, classList*/) {
		let elem = El.div(opt);
		let text = El.text(t);
		elem.appendChild(text);
		return elem;
	},
	divIcon: function (opt) {
		opt = Object.assign({
			icon: null,
			text: "",
			id: null,
			classList: []
		}, opt);
		let elem = El.div(opt.id, opt.classList);
		let icon = El.spanIcon(opt.icon, null, ["div-icon__icon"]);
		let text = El.spanText(opt.text, null, ["div-icon__text"]);
		elem.appendChild(icon);
		elem.appendChild(text);
		return elem;
	},
	thText: function (txt, id, classList) {
		let elem = El.th(id, classList);
		let text = El.text(txt);
		elem.appendChild(text);
		return elem;
	},
	thIcon: function (icon, id, classList) {
		let i = El.spanIcon(icon);
		let elem = El.th(null, classList)
		elem.appendChild(i);
		return elem;
	},
	tdText: function (txt, id, classList) {
		let elem = El.td(id, classList);
		let text = El.text(txt);
		elem.appendChild(text);
		return elem;
	},
	input: function (id, classList, type) {
		//El.inputを上書きする
		const elem = El("input", id, classList);
		if (type) elem.type = type;
		return elem;
	},
	checkbox: function (id, classList) {
		return El.input(id, classList, "checkbox");
	},
	inputText: function (id, classList, value) {
		var i = El.input(id, classList, "text");
		if (value) i.value = value;
		return i;
	},
	password: function (id, classList) {
		return El.input(id, classList, "password");
	},
	radio: function (id, classList) {
		return El.input(id, classList, "radio");
	}
});

/**
 * 現在のスクロールバーの位置を、オブジェクトのx, yプロパティに格納して返す
 * サイ本第6版 p.426 例15-8より
 */
El.getScrollOffsets = function (w) {
	// 指定したwindow（引数がないときは現在のwindow）
	w = w || window;

	if (w.scrollX != null) return { x: w.scrollX, y: w.scrollY };
	if (w.pageXOffset != null) return { x: w.pageXOffset, y: w.pageYOffset };

	//標準モードのIE用
	const d = w.document;
	if (document.compatMode === "CSS1Compat")
		return { x: d.documentElement.scrollLeft, y: d.documentElement.scrollTop };

	//quarks mode
	return { x: d.body.scrollLeft, y: d.body.scrollTop }
}
/** 以下、utilitymethod **/
/**
 * ビューポートの大きさを取得
 * サイ本第6版 p.427 例15-9より
 */
El.getViewportSize = function (w) {
	// 指定したwindow（引数がないときは現在のwindow）
	w = w || window;

	if (w.innerWidth != null) return { w: w.innerWidth, h: w.innerHeight };

	//標準モードのIE用
	const d = w.document;
	if (document.compatMode === "CSS1Compat")
		return { w: d.documentElement.clientWidth, h: d.documentElement.clientHeight };

	//quarks mode
	return { w: d.body.clientWidth, h: d.body.clientHeight }
}
/**
 * 要素elmのドキュメント座標を取得する (ブラウザ上の座標)
 * ※絶対座標というと親要素からの座標という意味合いが強いから、「絶対座標」という用語は使わない。
 *
 * サイ本第6版 p.430より
 */
El.getElementPosition = function (elm) {
	let x = 0, y = 0;
	//ループしてオフセットを加算していく
	for (let e = elm; e != null; e = e.offsetParent) {
		x += e.offsetLeft;
		y += e.offsetTop;
	}
	return { x, y }
}
/**
 * 要素elmのビューポート座標を取得する
 *
 * サイ本第6版 p.432より
 * getBoundingClientRect()で代替可能なので、そちらの利用を推奨
 */
El.getElementViewPos = function (elm) {
	if (elm.getBoundingClientRect) console.warn("deprecated method. use getBoundingClientRect")
	const pos = El.getElementPosition(elm); //ドキュメント座標
	let x = pos.x, y = pos.y;
	for (let e = elm.parentNode; e != null && e.nodeType == 1; e = e.parentNode) {
		x -= e.scrollLeft;
		y -= e.scrollTop;
	}
	return { x, y };
}
/**
 * 絶対位置指定されたHTML要素をドラッグできるようにする （サイ本第6版 p.508より写経）
 *
 * この関数は、onmousedownイベントハンドラから呼び出される
 * この後のmousemoveイベントで指定された要素を移動する。
 * mouseupイベントでドラッグをやめる。
 *
 * @param {elementToDrag}
 * mousedownイベントが発生した要素か、その要素を含む要素
 * この要素は、絶対指定していなければならない。
 * style.left, style.topの値が、ユーザのドラッグに応じて変更される
 *
 * @param {evt}
 * mousedownイベントのEventオブジェクト
 */
El.drag = function (elementToDrag, evt) {
	const scroll = El.getScrollOffsets();
	const startX = evt.clientX + scroll.x, startY = evt.clientY + scroll.y;
	//ドラッグされる要素の初期位置（ドキュメント座標）
	//elementToDragは、絶対位置指定されるので、
	//offsetParentがドキュメントボディ（elementToDragから見て、絶対位置の(0, 0)をとる要素）と想定している
	const orgX = elementToDrag.offsetLeft, orgY = elementToDrag.offsetTop;

	//mousedownイベントと要素の左上角の距離を計算する。
	//mouseが移動している間、この距離が維持されるようにする
	const deltaX = startX - orgX, deltaY = startY - orgY;

	//mousemoveイベントとmouseupイベント用のイベントハンドラを登録
	//キャプチャリングイベントハンドラをドキュメントに登録
	document.addEventListener('mousemove', moveHandler, true);
	document.addEventListener('mouseup', upHandler, true);

	//mousedownイベントでの処理が終わったので、ほかの要素が処理をしないようにする
	evt.stopPropagation();
	//デフォルトの動作はさせない。
	evt.preventDefault();

    /**
     * 要素がドラッグされている間、mousemoveイベントをキャプチャする
     */
	function moveHandler(e) {
		//要素を現在のマウス位置まで移動する。
		//スクロールバーの位置や、最初のマウスクリック時のオフセットを計算に入れて調整する必要がある
		const scroll = El.getScrollOffsets();
		elementToDrag.style.left = `${e.clientX + scroll.x - deltaX}px`;
		elementToDrag.style.top = `${e.clientY + scroll.y - deltaY}px`;

		e.stopPropagation();
	}
    /**
     * ドラッグの最後で発生するmouseupイベントをキャプチャする
     */
	function upHandler(e) {
		document.removeEventListener('mouseup', upHandler, true);
		document.removeEventListener('mousemove', moveHandler, true);
		e.stopPropagation();
	}
}

El.removeAllChildren = function (elem) {
	while (elem.firstChild) {
		elem.removeChild(elem.firstChild);
	}
}

/**
 * キーイベントとハンドラ関数のバインド
 *
 * サイ本第6版より
 */
El.Keymap = class {
	constructor(bindings) {
		this.map = {}; //キー識別子->ハンドラのマッピング
		if (bindings) {
			for (let name of Object.keys(bindings)) this.bind(name, bindings[name])
		}
	}
	bind(key, func) {
		//登録される関数はeventとkeyidを引数に持つ
		//keyidを変えるとことで、入力されるキーと処理を決めていく
		this.map[El.Keymap.normalize(key)] = func;
	}
	unbind(key) {
		delete this.map[El.Keymap.normalize(key)]
	}
	install(elem, type, capturing) {
        /** 指定されたHTML要素に、Keymapをインストールする type='keydown' keyup keypressなど
         *
         */
		let keymap = this;
		function handler(event) {
			return keymap.dispatch(event, elem);
		}
		if (!type) type = 'keydown';
		if (!capturing) capturing = false;
		elem.addEventListener(type, handler, capturing);
	}
	dispatch(event, elem) {//キーマップバインディングをもとに、キーイベントをdispatchする
		//修飾キー
		let modifiers = "";
		let keyname = null;
		if (event.altKey) modifiers += "alt_";
		if (event.ctrlKey) modifiers += "ctrl_";
		if (event.metaKey) modifiers += "meta_";
		if (event.shiftKey) modifiers += "shift_";

		// DOM Level 3のkeyプロパティ IE chrome firefox operaはいける。
		// Safariは違うらしい
		if (event.key) keyname = event.key;
		//Safari?
		else if (event.keyIdentifier && event.keyIdentifier.substring(0, 2) !== "U+")
			keyname = event.keyIdentifier
		//それ以外は、keyCodeを使って変換 deprecatedだったので、コメントアウト
		//else keyname = El.Keymap.keyCodeToKeyName[event.keyCode];

		//キー名が分からない場合は、イベントを無視
		if (!keyname) return;

		//標準形式のキーIDは、修飾キー＋キー名（小文字）で定義
		const keyid = modifiers + keyname.toLowerCase();
		const handler = this.map[keyid];
		if (handler) {//handlerがあれば、処理を進める
			const retval = handler.call(elem, event, keyid);
			if (retval === false) {
				event.stopPropagation();
				event.preventDefault();
			}

			return retval;
		}
	}
}
El.Keymap.normalize = function (keyid) {
    /**
     * キー識別子を標準形式に変換するユーティリティ
     *
     */
	keyid = keyid.toLowerCase();
	if (keyid === " ") return " ";
	let words = keyid.split(/\s+|[\-+_]/);
	let keyname = words.pop(); //キー名は最後にあるはず
	keyname = El.Keymap.aliases[keyname] || keyname; //aliasがあればそちらを優先
	words.sort(); //残りの修飾キーをソート
	words.push(keyname);
	return words.join("_"); //標準形式に並べる
}
El.Keymap.aliases = { //広く使われるキーの別名を、公式のキー名に
	"escape": "esc",
	"delete": "del",
	"return": "enter",
	"ctrl": "control",
	"space": "spacebar",
	"ins": "insert"
}

/**
 * eventが発生した要素内での相対座標を返す
 */
El.coord = function (event) {
	let rect = event.target.getBoundingClientRect();
	let x = event.clientX - rect.left;
	let y = event.clientY - rect.top;

	return [x, y];
}

//keyCodeプロパティは標準化されておらず、deprecatedなので、利用しない
/*
El.Keymap.keyCodeToKeyName = {
}
*/

El.hide = function (elem) {
	if (elem instanceof Array) {
		for (let i = 0; i < elem.length; i++) {
			El.hide(elem[i]);
		}
	} else {
		elem.classList.add("hidden");
	}
}

El.show = function (elem) {
	if (elem instanceof Array) {
		for (let i = 0; i < elem.length; i++) {
			El.show(elem[i]);
		}
	} else {
		elem.classList.remove("hidden");
	}
}