var SysUtils = {
	/**
	 * 获取本站点Http地址
	 */
	getLocalHttp: function() {
		var protocol = window.location.protocol;
		var host = window.location.host;
		var port = window.location.port;
		var sLocalHttp = protocol + "//" + host;
		return sLocalHttp
	},
	/**
	 * 获取本站点Http地址
	 */
	getContextPath: function() {
		var pathName = document.location.pathname;
		var index = pathName.substr(1).indexOf("/");
		var result = pathName.substr(0, index + 1);
		return result;
	},
	/**
	 * 获取站点根目录
	 */
	getHttpRoot: function() {

		var sUrl = SysUtils.getLocalHttp();
		var sContextPath = SysUtils.getContextPath();
		if(sContextPath != "/") {
			sUrl += SysUtils.getContextPath();
		}
		return sUrl;
	},
	/**
	 * 获取sokect根目录
	 */
	getWsRoot: function() {
		return SysUtils.getWsType() + "://" + window.location.host + "/" +
			SysUtils.getContextPath();
	},
	getWsIp: function() {
		var reg = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
		var ip = reg.exec(window.location.href)[0];
		return ip;
	},
	getWsType: function() {
		var sWsType = "ws";
		if(window.location.protocol == "https:") {
			sWsType = "wss";
		}
		return sWsType;
	},
	/* 获取网址参数 */
	getUrlParams: function(sParmsName) {
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for(var i = 0; i < vars.length; i++) {
			var pair = vars[i].split("=");
			if(pair[0] == sParmsName) {
				return pair[1];
			}
		}
		return null;
	},
	createJs: function(sUrl) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = sUrl;
		document.getElementsByTagName('head')[0].appendChild(script);
	},
	Binary: function(initData, p, l, bl) {
		var data = initData && initData.constructor == Array ? initData.slice() : [],
			p = p | 0,
			l = l | 0,
			bl = Math.max((bl || 8) | 0, 1),
			mask = m(bl),
			_m = 0xFFFFFFFF; // 数据，指针，长度，位长度，遮罩
		this.data = function(index, value) {
			if(!isNaN(value))
				data[index] = (value | 0) || 0;
			if(!isNaN(index))
				return data[index];
			else
				return data.slice();
		}

		this.read = function() {
			var re;
			if(p >= l)
				return 0;
			if(32 - (p % 32) < bl) {
				re = (((data[p >> 5] & m(32 - (p % 32))) << ((p + bl) % 32)) | (data[(p >> 5) + 1] >>> (32 - ((p + bl) % 32)))) &
					mask;
			} else {
				re = (data[p >> 5] >>> (32 - (p + bl) % 32)) & mask;
			}
			p += bl;
			return re;
		}

		this.write = function(i) {
			var i, hi, li;
			i &= mask;
			if(32 - (l % 32) < bl) {
				data[l >> 5] |= i >>> (bl - (32 - (l % 32)));
				data[(l >> 5) + 1] |= (i << (32 - ((l + bl) % 32))) & _m;
			} else {
				data[l >> 5] |= (i << (32 - ((l + bl) % 32))) & _m;
			}
			l += bl;
		}

		this.eof = function() {
			return p >= l;
		}

		this.reset = function() {
			p = 0;
			mask = m(bl);
		}
		this.resetAll = function() {
			data = [];
			p = 0;
			l = 0;
			bl = 8;
			mask = m(bl);
			_m = 0xFFFFFFFF;
		}

		this.setBitLength = function(len) {
			bl = Math.max(len | 0, 1);
			mask = m(bl);
		}

		this.toHexString = function() {
			var re = [];
			for(var i = 0; i < data.length; i++) {
				if(data[i] < 0) {
					re.push(pad((data[i] >>> 16).toString(16), 4) +
						pad((data[i] & 0xFFFF).toString(16), 4));
				} else {
					re.push(pad(data[i].toString(16), 8));
				}
			}
			return re.join("");
		}

		this.toBinaryString = function() {
			var re = [];
			for(var i = 0; i < data.length; i++) {
				if(data[i] < 0) {
					re.push(pad((data[i] >>> 1).toString(2), 31) +
						(data[i] & 1));
				} else {
					re.push(pad(data[i].toString(2), 32));
				}
			}
			return re.join("").substring(0, l);
		}

		this.toCString = function() {
			var _p = p,
				_bl = bl,
				re = [];
			this.setBitLength(13);
			this.reset();
			while(p < l)
				re.push(C(this.read()));
			this.setBitLength(_bl);
			p = _p;
			return C(l >>> 13) + C(l & m(13)) + re.join("");
		}

		this.fromCString = function(str) {
			this.resetAll();
			this.setBitLength(13);
			for(var i = 2; i < str.length; i++)
				this.write(D(str, i));
			l = (D(str, 0) << 13) | (D(str, 1) & m(13));
			return this;
		}

		this.clone = function() {
			return new SysUtils.Binary(data, p, l, bl);
		}

		function m(len) {
			return(1 << len) - 1;
		}

		function pad(s, len) {
			return(new Array(len + 1)).join("0").substring(s.length) + s;
		}

		function C(i) {
			return String.fromCharCode(i + 0x4e00);
		}

		function D(s, i) {
			return s.charCodeAt(i) - 0x4e00;
		}
	},

	// 压缩
	lzw_compress: function(str) {
		var b = new SysUtils.Binary(),
			code_index = -1,
			char_len = 8;
		var str = str.replace(/[\u0100-\uFFFF]/g, function(s) {
			return "\&\#u" + pad(s.charCodeAt(0).toString(16), 4) + ";";
		});
		var dic = {},
			cp = [],
			cpi, bl = 8;
		b.setBitLength(bl);
		for(var i = 0; i < (1 << char_len) + 2; i++)
			dic[i] = ++code_index;
		cp[0] = str.charCodeAt(0);
		for(var i = 1; i < str.length; i++) {
			cp[1] = str.charCodeAt(i);
			cpi = (cp[0] << 16) | cp[1];
			if(dic[cpi] == undefined) {
				dic[cpi] = (++code_index);
				if(cp[0] > m(bl)) {
					b.write(0x80);
					b.setBitLength(++bl);
				}
				b.write(cp[0]);
				cp[0] = cp[1];
			} else {
				cp[0] = dic[cpi];
			}
		}
		b.write(cp[0]);

		function pad(s, len) {
			return(new Array(len + 1)).join("0").substring(s.length) + s;
		}

		function m(len) {
			return(1 << len) - 1;
		}
		return b.toCString();
	},

	// 解压
	lzw_decompress: function(s) {
		var b = new

		function() {
			var d = [],
				p = 0,
				l = 0,
				L = 13,
				k = m(L),
				_m = 0xFFFFFFFF;
			this.r = function() {
				var r;
				if(32 - (p % 32) < L)
					r = (((d[p >> 5] & m(32 - (p % 32))) << ((p + L) % 32)) | (d[(p >> 5) + 1] >>> (32 - ((p + L) % 32)))) &
					k;
				else
					r = (d[p >> 5] >>> (32 - (p + L) % 32)) & k;
				p += L;
				return r;
			};
			this.w = function(i) {
				i &= k;
				if(32 - (l % 32) < L) {
					d[l >> 5] |= i >>> (L - (32 - (l % 32)));
					d[(l >> 5) + 1] |= (i << (32 - ((l + L) % 32))) & _m;
				} else
					d[l >> 5] |= (i << (32 - ((l + L) % 32))) & _m;
				l += L;
			};
			this.e = function() {
				return p >= l;
			};
			this.l = function(len) {
				L = Math.max(len | 0, 1);
				k = m(L);
			};

			function m(len) {
				return(1 << len) - 1;
			}

			function pad(s, l) {
				return(new Array(l + 1)).join("0").substring(s.length) + s;
			}
			for(var i = 2; i < s.length; i++)
				this.w(s.charCodeAt(i) - 0x4e00);
			l = ((s.charCodeAt(0) - 0x4e00) << 13) |
				((s.charCodeAt(1) - 0x4e00) & m(13));
			p = 0;
		};
		var R = [],
			C = -1,
			D = {},
			P = [],
			L = 8;
		for(i = 0; i < (1 << L) + 2; i++)
			D[i] = String.fromCharCode(++C);
		b.l(L);
		P[0] = b.r();
		while(!b.e()) {
			P[1] = b.r();
			if(P[1] == 0x80) {
				b.l(++L);
				P[1] = b.r();
			}
			if(D[P[1]] == undefined)
				D[++C] = D[P[0]] + D[P[0]].charAt(0);
			else
				D[++C] = D[P[0]] + D[P[1]].charAt(0);
			R.push(D[P[0]]);
			P[0] = P[1];
		}
		R.push(D[P[0]]);
		return R.join("").replace(/\&\#u[0-9a-fA-F]{4};/g, function(w) {
			return String.fromCharCode(parseInt(w.substring(3, 7), 16));
		});
	},
	// 获取浏览器类型
	getBrowser: function() {
		var nVer = navigator.appVersion;
		var nAgt = navigator.userAgent;
		var browserName = navigator.appName;
		var fullVersion = '' + parseFloat(navigator.appVersion);
		var majorVersion = parseInt(navigator.appVersion, 10);
		var nameOffset, verOffset, ix;

		// In Opera, the true version is after "Opera" or after "Version"
		if((verOffset = nAgt.indexOf("Opera")) != -1) {
			browserName = "Opera";
			fullVersion = nAgt.substring(verOffset + 6);
			if((verOffset = nAgt.indexOf("Version")) != -1)
				fullVersion = nAgt.substring(verOffset + 8);
		}
		// In MSIE, the true version is after "MSIE" in userAgent
		else if((verOffset = nAgt.indexOf("MSIE")) != -1) {
			browserName = "Microsoft Internet Explorer";
			fullVersion = nAgt.substring(verOffset + 5);
		}
		// In Chrome, the true version is after "Chrome"
		else if((verOffset = nAgt.indexOf("Chrome")) != -1) {
			browserName = "Chrome";
			fullVersion = nAgt.substring(verOffset + 7);
		}
		// In Safari, the true version is after "Safari" or after "Version"
		else if((verOffset = nAgt.indexOf("Safari")) != -1) {
			browserName = "Safari";
			fullVersion = nAgt.substring(verOffset + 7);
			if((verOffset = nAgt.indexOf("Version")) != -1)
				fullVersion = nAgt.substring(verOffset + 8);
		}
		// In Firefox, the true version is after "Firefox"
		else if((verOffset = nAgt.indexOf("Firefox")) != -1) {
			browserName = "Firefox";
			fullVersion = nAgt.substring(verOffset + 8);
		}
		// In most other browsers, "name/version" is at the end of userAgent
		else if((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt
				.lastIndexOf('/'))) {
			browserName = nAgt.substring(nameOffset, verOffset);
			fullVersion = nAgt.substring(verOffset + 1);
			if(browserName.toLowerCase() == browserName.toUpperCase()) {
				browserName = navigator.appName;
			}
		}
		// trim the fullVersion string at semicolon/space if present
		if((ix = fullVersion.indexOf(";")) != -1)
			fullVersion = fullVersion.substring(0, ix);
		if((ix = fullVersion.indexOf(" ")) != -1)
			fullVersion = fullVersion.substring(0, ix);

		majorVersion = parseInt('' + fullVersion, 10);
		if(isNaN(majorVersion)) {
			fullVersion = '' + parseFloat(navigator.appVersion);
			majorVersion = parseInt(navigator.appVersion, 10);
		}

		return browserName;
	},
	encode64: function(input) {
		var output = "";
		var base = new SysUtils.Base64();
		var output = base.encode(input);
		return output;
	},
	decode64: function(input) {
		var output = "";
		var base = new SysUtils.Base64();
		var output = base.decode(input);
		return output;
	},
	// base64对象
	Base64: function() {
		// private property
		_keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

		// public method for encoding
		this.encode = function(input) {
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;
			input = _utf8_encode(input);
			while(i < input.length) {
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);
				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;
				if(isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if(isNaN(chr3)) {
					enc4 = 64;
				}
				output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
					_keyStr.charAt(enc3) + _keyStr.charAt(enc4);
			}
			return output;
		}

		// public method for decoding
		this.decode = function(input) {
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
			while(i < input.length) {
				enc1 = _keyStr.indexOf(input.charAt(i++));
				enc2 = _keyStr.indexOf(input.charAt(i++));
				enc3 = _keyStr.indexOf(input.charAt(i++));
				enc4 = _keyStr.indexOf(input.charAt(i++));
				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;
				output = output + String.fromCharCode(chr1);
				if(enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if(enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}
			}
			output = _utf8_decode(output);
			return output;
		}

		// private method for UTF-8 encoding
		_utf8_encode = function(string) {
			string = string.replace(/\r\n/g, "\n");
			var utftext = "";
			for(var n = 0; n < string.length; n++) {
				var c = string.charCodeAt(n);
				if(c < 128) {
					utftext += String.fromCharCode(c);
				} else if((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				} else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}

			}
			return utftext;
		}

		// private method for UTF-8 decoding
		_utf8_decode = function(utftext) {
			var string = "";
			var i = 0;
			var c = c1 = c2 = 0;
			while(i < utftext.length) {
				c = utftext.charCodeAt(i);
				if(c < 128) {
					string += String.fromCharCode(c);
					i++;
				} else if((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i + 1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				} else {
					c2 = utftext.charCodeAt(i + 1);
					c3 = utftext.charCodeAt(i + 2);
					string += String.fromCharCode(((c & 15) << 12) |
						((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}
			}
			return string;
		}
	},
	// 获取对象位置
	getElementPos: function(elementId) {
		var ua = navigator.userAgent.toLowerCase();
		var isOpera = (ua.indexOf('opera') != -1);
		var isIE = (ua.indexOf('msie') != -1 && !isOpera); // not opera spoof
		var el = document.getElementById(elementId);
		if(el.parentNode === null || el.style.display == 'none') {
			return false;
		}
		var parent = null;
		var pos = [];
		var box;
		if(el.getBoundingClientRect) { // IE
			box = el.getBoundingClientRect();
			var scrollTop = Math.max(document.documentElement.scrollTop,
				document.body.scrollTop);
			var scrollLeft = Math.max(document.documentElement.scrollLeft,
				document.body.scrollLeft);

			return {
				x: box.left + scrollLeft,
				y: box.top + scrollTop,
				width: box.width,
				height: box.height
			};
		} else if(document.getBoxObjectFor) {
			box = document.getBoxObjectFor(el);
			var borderLeft = (el.style.borderLeftWidth) ? parseInt(el.style.borderLeftWidth) :
				0;
			var borderTop = (el.style.borderTopWidth) ? parseInt(el.style.borderTopWidth) :
				0;
			pos = [box.x - borderLeft, box.y - borderTop, box.width,
				box.height
			];
		} else { // safari & opera
			pos = [el.offsetLeft, el.offsetTop];
			parent = el.offsetParent;
			if(parent != el) {
				while(parent) {
					pos[0] += parent.offsetLeft;
					pos[1] += parent.offsetTop;
					parent = parent.offsetParent;
				}
			}
			if(ua.indexOf('opera') != -1 ||
				(ua.indexOf('safari') != -1 && el.style.position == 'absolute')) {
				pos[0] -= document.body.offsetLeft;
				pos[1] -= document.body.offsetTop;
			}
		}
		if(el.parentNode) {
			parent = el.parentNode;
		} else {
			parent = null;
		}
		while(parent && parent.tagName != 'BODY' && parent.tagName != 'HTML') { // account
			// for
			// any
			// scrolled
			// ancestors
			pos[0] -= parent.scrollLeft;
			pos[1] -= parent.scrollTop;
			if(parent.parentNode) {
				parent = parent.parentNode;
			} else {
				parent = null;
			}
		}
		return {
			x: pos[0],
			y: pos[1]
		};
	},
	// 获取当前学年
	getSchoolYear: function() {
		var iYear = SysUtils.getYear();
		var iTerm = SysUtils.getTerm();
		var iMonth = new Date().getMonth() + 1;
		var sYear = "";
		if(iMonth >= 1 && iMonth < 8) {
			sYear = (iYear - 1) + "-" + iYear;
		} else {
			sYear = iYear + "-" + (iYear + 1);
		}
		return sYear;
	},
	// 获取当前年
	getYear: function() {
		var myDate = new Date();
		return myDate.getFullYear();
	},
	// 获取当前学期
	getTerm: function() {
		var myDate = new Date();
		var iMonth = myDate.getMonth() + 1;
		var iDay = myDate.getDate();

		// 学期
		var iTerm = 1;
		if((iMonth >= 1 & iMonth < 3) || (iMonth >= 8 & iMonth <= 12)) {
			iTerm = 1;
		} else {
			iTerm = 2;
		}
		return iTerm;
	},
	getCurrentDate: function() {
		var dDate = new Date();
		dDate.setTime(dDate.getTime());
		var dCurtDay = dDate.getFullYear() + "-" + (dDate.getMonth() + 1) + "-" +
			dDate.getDate();
		return dCurtDay;
	},
	// 获取当前年月日
	getNowYMD: function() {
		var date = new Date();
		var year = date.getFullYear() // 年
		var month = date.getMonth() + 1; // 月
		var day = date.getDate(); // 日

		// 给一位数数据前面加 “0”
		if(month >= 1 && month <= 9) {
			month = "0" + month;
		}
		if(day >= 0 && day <= 9) {
			day = "0" + day;
		}

		var currentdate = year + "-" + month + "-" + day
		return currentdate;
	},
	// 获取当前时间
	getNowDate: function() {
		var date = new Date();
		var sign1 = "-";
		var sign2 = ":";
		var year = date.getFullYear() // 年
		var month = date.getMonth() + 1; // 月
		var day = date.getDate(); // 日
		var hour = date.getHours(); // 时
		var minutes = date.getMinutes(); // 分
		var seconds = date.getSeconds() // 秒
		var weekArr = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
		var week = weekArr[date.getDay()];
		// 给一位数数据前面加 “0”
		if(month >= 1 && month <= 9) {
			month = "0" + month;
		}
		if(day >= 0 && day <= 9) {
			day = "0" + day;
		}
		if(hour >= 0 && hour <= 9) {
			hour = "0" + hour;
		}
		if(minutes >= 0 && minutes <= 9) {
			minutes = "0" + minutes;
		}
		if(seconds >= 0 && seconds <= 9) {
			seconds = "0" + seconds;
		}
		var currentdate = year + sign1 + month + sign1 + day + " " + hour +
			sign2 + minutes + sign2 + seconds + " " + week;
		return currentdate;
	},
	// 获取指定日期前后的日期
	getNextDate: function(sDate, iDay) {
		var dd = new Date(sDate);
		dd.setDate(dd.getDate() + iDay);
		var y = dd.getFullYear();
		var m = dd.getMonth() + 1 < 10 ? "0" + (dd.getMonth() + 1) : dd.getMonth() + 1;
		var d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
		return y + "-" + m + "-" + d;
	},
	//皮肤设置
	setSkinFn: function(value) { // 设置皮肤  blueSkin - 蓝色 greenSkin - 绿色
		var sSkin = value;
		var _link = document.createElement("link");
		_link.rel = "stylesheet";
		_link.type = "text/css";
		_link.id = sSkin;
		if(sSkin != null && sSkin != undefined) {
			if(sSkin == "blueSkin") {
				//蓝色
				_link.href = SysUtils.getHttpRoot() + "/css/index_blue_skin.css";

			} else if(sSkin == "greenSkin") {
				//中大绿
				_link.href = SysUtils.getHttpRoot() + "/css/index_green_skin.css";
			}
			document.getElementsByTagName("head")[0].appendChild(_link);
		} else { // 默认蓝
			_link.href = SysUtils.getHttpRoot() + "/css/index_blue_skin.css";
			document.getElementsByTagName("head")[0].appendChild(_link);
		}
	},
	//获取指定form中的所有的<input>对象  
	getElements: function(sFormId) {
		var form = document.getElementById(sFormId);
		var elements = new Array();
		var tagElements = form.getElementsByTagName('input');
		for(var j = 0; j < tagElements.length; j++) {
			elements.push(tagElements[j]);
		}
		var tagElements = form.getElementsByTagName('select');
		for(var j = 0; j < tagElements.length; j++) {
			elements.push(tagElements[j]);
		}
		var tagElements = form.getElementsByTagName('textarea');
		for(var j = 0; j < tagElements.length; j++) {
			elements.push(tagElements[j]);
		}
		return elements;
	},
	//组合URL 
	serializeElement: function(element, bEncode) {
		var sMethod = element.tagName.toLowerCase();
		var arrParam;
		if(sMethod == 'select') {
			arrParam = [element.name, element.value];
		}
		switch(element.type.toLowerCase()) {
			case 'submit':
			case 'hidden':
			case 'password':
			case 'text':
			case 'date':
			case 'textarea':
				arrParam = [element.name, element.value];
				break;
			case 'checkbox':
			case 'radio':
				if(element.checked) {
					arrParam = [element.name, element.value];
				}
				break;
		}
		if(arrParam) {
			var sKey = arrParam[0];
			if(sKey.length == 0)
				return;
			if(arrParam[1].constructor != Array)
				arrParam[1] = [arrParam[1]];
			var sValues = arrParam[1];
			var results = [];
			for(var i = 0; i < sValues.length; i++) {
				let sValue = sValues[i];
				if(bEncode) {
					sValue = encodeURIComponent(sValues[i]);
				}
				results.push(sKey + '=' + sValue);
			}
			return results.join('&');
		}
	},
	getFormValue: function(sFormId) {
		var elements = SysUtils.getElements(sFormId);
		var objValue = {};
		for(var i = 0; i < elements.length; i++) {
			var sElValue = SysUtils.serializeElement(elements[i]);
			if(!sElValue) {
				continue;
			}
			var arrSplit = sElValue.split('=');
			let sKey = arrSplit[0];
			let sValue = arrSplit[1];
			sValue = sValue == "" ? "''" : "'" + sValue + "'";
			if(sKey != 'select') {
				eval("objValue." + sKey + "=" + sValue);
			}
		}
		return objValue;
	},
	uploadImg: function(sImgId, sInputId) {
		var timer = null;
		var imgBtn = document.getElementById(sImgId);
		//单击
		imgBtn.addEventListener('click', function(e) {
			clearTimeout(timer);
			timer = setTimeout(function() {
				const img = new Image();
				img.src = imgBtn.src;
				if(img.src.indexOf("imgupload.png") > 0) {
					return;
				}
				const newWin = window.open("", "_blank");
				newWin.document.write(img.outerHTML);
				newWin.document.title = "原始图片"
				newWin.document.close();
			}, 250)
		}, false);
		//双击
		imgBtn.addEventListener('dblclick', function() {
			clearTimeout(timer);
			var evt = new MouseEvent("click", {
				bubbles: false,
				cancelable: true,
				view: window
			});
			document.getElementById(sInputId).dispatchEvent(evt);
		}, false);
		//获取上传按钮
		var uploadFile = document.getElementById(sInputId);
		if(typeof FileReader === 'undefined') {
			uploadFile.setAttribute('disabled', 'disabled');
		} else {
			uploadFile.addEventListener('change', readFile, false);
		}

		function readFile() {
			//获取上传文件列表中第一个文件
			var file = this.files[0];
			if(!/image\/\w+/.test(file.type)) {
				//图片文件的type值为image/png或image/jpg
				alert("文件必须为图片！");
				return false;
			}
			var reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = function(e) {
				document.getElementById(sImgId).src = e.target.result;
			}
		};
	}
}