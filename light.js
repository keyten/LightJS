/*!
 * LightJS JavaScript Library v0.1 Beta
 * 
 * Author: Dmitriy Miroshnichenko aka Keyten
 * Released under the MIT License
 * 
 */
 Light = lr = $ = (function(window, undefined){

	var lr = function(selector, context){}

	lr.version = 0.1;


	var objProto = Object.prototype,
		arrayProto = Array.prototype;

	lr.each = function(obj, fn){
		if(+obj.length === obj.length){
			for(var i = 0, l = obj.length; i < l; i++)
				if(objProto.hasOwnProperty.call(obj, i))
					fn.call(obj, obj[i], i);
		}
		else {
			for(var i in obj)
				if(objProto.hasOwnProperty.call(obj, i))
					fn.call(obj, obj[i], i);
		}
	}

	lr.types = {
		'[object String]': 'string',
		'[object Number]': 'number',
		'[object Object]': 'object',
		'[object Array]': 'array',
		'[object Boolean]': 'boolean',
		'[object RegExp]': 'regexp',
		'[object Function]': 'function',
		'[object Date]': 'date',
		'[object Arguments]': 'arguments'
	}

	lr.type = function(arg){

		return arg === null ? 'null' :
				 arg === undefined ? 'undefined' :
				 (function(){

				if(arg.nodeName){
					switch(arg.nodeType){
						case 1: return 'element';
						case 3: return /\S/.test(arg.nodeValue) ? 'whitespace' : 'textnode';
					}
				}
				if(+arg.length === arg.length && lr.isFunction(arg.item)) return 'collection';

				return lr.types[ objProto.toString.call(arg) ] || typeof arg;
		})();

	}

	lr.each(lr.types, function(val){

		lr['is' + val[0].toUpperCase() + val.substring(1)] = lr['is' + val] = lr['is_' + val] = function(a){ return lr.type(a) == val }

	});

	lr.isDefined = lr.isdef = function(v){ return v !== undefined }
	lr.isNull = function(v){ return v === null }
	lr.isCollection = function(v){ return lr.isNumber(v.length) && lr.isFunction(v.item) }
	lr.isNaN = function(v){ return isNaN(v) || v == null || !(/\d/.test(v)) }
	lr.isNumeric = function(v){ return !lr.isNaN(v) }

	lr.extend = lr.ext = function(to, from){
		for(var i in from){
			to[i] = from[i];
		}
		return to;
	}
	lr.implement = function(to, from){
		lr.extend(to.prototype, from.prototype || from);
		return to;
	}

	var identifier = {};
	lr.class = function(parent, properties){

		if(!properties) properties = parent, parent = null;

		var cls = function(){ return (this.initialize || function(){}).apply(this,arguments) }
		if(parent){

			// переход в parent
			cls = function(){
				var parent = this.constructor.parent;
				while(parent){
					if('initialize' in parent.prototype)
						parent.prototype.initialize.apply(this, arguments);
					parent = parent.parent;
				}

				return (this.initialize || function(){}).apply(this,arguments);
			}


			// наследование прототипа
			var sklass = function(){}
			sklass.prototype = parent.prototype;
			cls.prototype = new sklass;
			cls.parent = parent;
			cls.prototype.constructor = cls;

		}
		cls._identifier = identifier;
		lr.implement(cls, properties);

		cls.extend = function(arg){ lr.extend(this, arg) }
		cls.implement = function(arg){ lr.implement(this, arg) }

		return cls;

	}

	lr.isClass = function(cls){
		return typeof cls == 'function' && cls._identifier == identifier;
	}


	lr.eval = function(c){
		if('execScript' in window) return window.execScript(c);

		var s = document.createElement('script');
		s.textContent = c;
		document.head.appendChild(s);
		document.head.removeChild(s);
	}

	lr.try = function(){
		var err = null;
		for(var i = 0, l = arguments.length; i < l; i++){
			try {
				return arguments[i](i, err);
			}
			catch(e){ err = e }
		}
		return null;
	}

	lr.random = function(min, max){
		return Math.floor( Math.random() * (max - min + 1) + min );
	}
	lr.random.pick = function(collection){
		return collection[lr.random(0,collection.length-1)];
	}

	lr.by = function(num, fn){
		for(var i = 0; i < num; i++)
			fn(i);
	}

	lr.provide = function(path, obj){
		var that = window,
			to;
		path = path.split('.');
		lr.each(path, function(val, i){
			to = path[i];
			if(!that[to]) that[to] = {};
			if(i == path.length-1 && typeof obj !== undefined)
				that[to] = obj;
			that = that[to];
		});
	}

	lr.argument = function(i){
		return function(){
			return arguments[i];
		}
	}
	
	lr.chk = function(v){ return !!(v || v == 0 || v == '') }
	
	lr.clear = function(s){
		clearTimeout(s);
		clearInterval(s);
		return null;
	}
	
	lr.empty = function(){}
	
	lr.lambda = function(v){
		return (typeof v == 'function') ? v : function(){ return v };
	}
	
	lr.merge = function(){
		var mix = {}, i, obj, key, op, mp;
		for(i = 0; i < arguments.length; i++){
			obj = arguments[i];
			if(lr.type(obj) != 'object') continue;
			for(key in obj){
				op = obj[key];
				mp = mix[key];
				mix[key] = (mp && lr.type(op) == 'object' && lr.type(mp) == 'object') ? lr.merge(mp, op) : lr.unlink(op);
			}
		}
		return mix;
	}
	
	lr.pick = function(){
		for(var i = 0; i < arguments.length; i++){
			if(arguments[i] != undefined) return arguments[i];
		}
		return null;
	}
		
	lr.splat = function(a){
		var t = lr.type(a);
		return t !== 'undefined' && t !== 'null' ? ((t !== 'array' && t !== 'arguments') ? [a] : arrayProto.slice.call(a,0)) : [];
	}
	
	lr.time = Date.now || function(){ return +new Date; }
	
	lr.unlink = function(obj){
		var unlinked;
		switch(lr.type(obj)){
			case 'object':
				unlinked = {};
				for(var i in obj) unlinked[i] = lr.unlink(obj[i]);
			break;
			case 'array':
				unlinked = [];
				for(var i in obj) unlinked[i] = lr.unlink(obj[i]);
			break;
			default: return obj;
		}
		return unlinked;
	}

	var data = [];
	lr.data = function(obj,key,val){
		if(val !== undefined){
			var obj = { el:obj, props:{} }, is = 0;
			for(var i = 0, l = data.length; i < l; i++){
				if(data[i].el === obj){
					obj = data[i];
					is = 1;
					break;
				}
			}
			if(!is) data.push(obj);
			return obj.props[key] = val;
		}
		else if(val === null){
			return lr.removeData(obj,key);
		}
		else {
			for(var i = 0, l = data.length; i < l; i++){
				if(data[i].el === obj) return data[i].props[key];
			}
		}
	}
	lr.removeData = function(obj,key){
		for(var i = 0, l = data.length; i < l; i++){
			if(data[i] === obj) delete data[i].props[key];
		}
		return null;
	}

	lr.find = (function() {
		/**
		 * Zest (https://github.com/chjj/zest)
		 * A css selector engine.
		 * Copyright (c) 2011-2012, Christopher Jeffrey. (MIT Licensed)
		 */

		/**
		 * Shared
		 */

		var window = this
			, document = this.document
			, old = this.zest;

		/**
		 * Helpers
		 */

		var compareDocumentPosition = (function() {
			if (document.compareDocumentPosition) {
			return function(a, b) {
				return a.compareDocumentPosition(b);
			};
			}
			return function(a, b) {
			var el = a.ownerDocument.getElementsByTagName('*')
				, i = el.length;

			while (i--) {
				if (el[i] === a) return 2;
				if (el[i] === b) return 4;
			}

			return 1;
			};
		})();

		var order = function(a, b) {
			return compareDocumentPosition(a, b) & 2 ? 1 : -1;
		};

		var next = function(el) {
			while ((el = el.nextSibling)
				 && el.nodeType !== 1);
			return el;
		};

		var prev = function(el) {
			while ((el = el.previousSibling)
				 && el.nodeType !== 1);
			return el;
		};

		var child = function(el) {
			if (el = el.firstChild) {
			while (el.nodeType !== 1
					 && (el = el.nextSibling));
			}
			return el;
		};

		var lastChild = function(el) {
			if (el = el.lastChild) {
			while (el.nodeType !== 1
					 && (el = el.previousSibling));
			}
			return el;
		};

		var unquote = function(str) {
			if (!str) return str;
			var ch = str[0];
			return ch === '"' || ch === '\''
			? str.slice(1, -1)
			: str;
		};

		var indexOf = (function() {
			if (Array.prototype.indexOf) {
			return Array.prototype.indexOf;
			}
			return function(obj, item) {
			var i = this.length;
			while (i--) {
				if (this[i] === item) return i;
			}
			return -1;
			};
		})();

		var makeInside = function(start, end) {
			var regex = rules.inside.source
			.replace(/</g, start)
			.replace(/>/g, end);

			return new RegExp(regex);
		};

		var replace = function(regex, name, val) {
			regex = regex.source;
			regex = regex.replace(name, val.source || val);
			return new RegExp(regex);
		};

		var truncateUrl = function(url, num) {
			return url
			.replace(/^(?:\w+:\/\/|\/+)/, '')
			.replace(/(?:\/+|\/*#.*?)$/, '')
			.split('/', num)
			.join('/');
		};

		/**
		 * Handle `nth` Selectors
		 */

		var parseNth = function(param, test) {
			var param = param.replace(/\s+/g, '')
			, cap;

			if (param === 'even') {
			param = '2n+0';
			} else if (param === 'odd') {
			param = '2n+1';
			} else if (!~param.indexOf('n')) {
			param = '0n' + param;
			}

			cap = /^([+-])?(\d+)?n([+-])?(\d+)?$/.exec(param);

			return {
			group: cap[1] === '-'
				? -(cap[2] || 1)
				: +(cap[2] || 1),
			offset: cap[4]
				? (cap[3] === '-' ? -cap[4] : +cap[4])
				: 0
			};
		};

		var nth = function(param, test, last) {
			var param = parseNth(param)
			, group = param.group
			, offset = param.offset
			, find = !last ? child : lastChild
			, advance = !last ? next : prev;

			return function(el) {
			if (el.parentNode.nodeType !== 1) return;

			var rel = find(el.parentNode)
				, pos = 0;

			while (rel) {
				if (test(rel, el)) pos++;
				if (rel === el) {
				pos -= offset;
				return group && pos
					? !(pos % group) && (pos < 0 === group < 0)
					: !pos;
				}
				rel = advance(rel);
			}
			};
		};

		/**
		 * Simple Selectors
		 */

		var selectors = {
			'*': (function() {
			if (function() {
				var el = document.createElement('div');
				el.appendChild(document.createComment(''));
				return !!el.getElementsByTagName('*')[0];
			}()) {
				return function(el) {
				if (el.nodeType === 1) return true;
				};
			}
			return function() {
				return true;
			};
			})(),
			'type': function(type) {
			type = type.toLowerCase();
			return function(el) {
				return el.nodeName.toLowerCase() === type;
			};
			},
			'attr': function(key, op, val, i) {
			op = operators[op];
			return function(el) {
				var attr;
				switch (key) {
				case 'for':
					attr = el.htmlFor;
					break;
				case 'class':
					attr = el.className;
					break;
				case 'href':
					attr = el.getAttribute('href', 2);
					break;
				case 'title':
					attr = el.getAttribute('title') || null;
					break;
				case 'id':
					if (el.getAttribute) {
					attr = el.getAttribute('id');
					break;
					}
				default:
					attr = el[key] != null
					? el[key]
					: el.getAttribute && el.getAttribute(key);
					break;
				}
				if (attr == null) return;
				attr = attr + '';
				if (i) {
				attr = attr.toLowerCase();
				val = val.toLowerCase();
				}
				return op(attr, val);
			};
			},
			':first-child': function(el) {
			return !prev(el) && el.parentNode.nodeType === 1;
			},
			':last-child': function(el) {
			return !next(el) && el.parentNode.nodeType === 1;
			},
			':only-child': function(el) {
			return !prev(el) && !next(el)
				&& el.parentNode.nodeType === 1;
			},
			':nth-child': function(param, last) {
			return nth(param, function() {
				return true;
			}, last);
			},
			':nth-last-child': function(param) {
			return selectors[':nth-child'](param, true);
			},
			':root': function(el) {
			return el.ownerDocument.documentElement === el;
			},
			':empty': function(el) {
			return !el.firstChild;
			},
			':not': function(sel) {
			var test = compileGroup(sel);
			return function(el) {
				return !test(el);
			};
			},
			':first-of-type': function(el) {
			if (el.parentNode.nodeType !== 1) return;
			var type = el.nodeName;
			while (el = prev(el)) {
				if (el.nodeName === type) return;
			}
			return true;
			},
			':last-of-type': function(el) {
			if (el.parentNode.nodeType !== 1) return;
			var type = el.nodeName;
			while (el = next(el)) {
				if (el.nodeName === type) return;
			}
			return true;
			},
			':only-of-type': function(el) {
			return selectors[':first-of-type'](el)
				&& selectors[':last-of-type'](el);
			},
			':nth-of-type': function(param, last) {
			return nth(param, function(rel, el) {
				return rel.nodeName === el.nodeName;
			}, last);
			},
			':nth-last-of-type': function(param) {
			return selectors[':nth-of-type'](param, true);
			},
			':checked': function(el) {
			return !!(el.checked || el.selected);
			},
			':indeterminate': function(el) {
			return !selectors[':checked'](el);
			},
			':enabled': function(el) {
			return !el.disabled && el.type !== 'hidden';
			},
			':disabled': function(el) {
			return !!el.disabled;
			},
			':target': function(el) {
			return el.id === window.location.hash.substring(1);
			},
			':focus': function(el) {
			return el === el.ownerDocument.activeElement;
			},
			':matches': function(sel) {
			return compileGroup(sel);
			},
			':nth-match': function(param, last) {
			var args = param.split(/\s*,\s*/)
				, arg = args.shift()
				, test = compileGroup(args.join(','));

			return nth(arg, test, last);
			},
			':nth-last-match': function(param) {
			return selectors[':nth-match'](param, true);
			},
			':links-here': function(el) {
			return el + '' === window.location + '';
			},
			':lang': function(param) {
			return function(el) {
				while (el) {
				if (el.lang) return el.lang.indexOf(param) === 0;
				el = el.parentNode;
				}
			};
			},
			':dir': function(param) {
			return function(el) {
				while (el) {
				if (el.dir) return el.dir === param;
				el = el.parentNode;
				}
			};
			},
			':scope': function(el, con) {
			var context = con || el.ownerDocument;
			if (context.nodeType === 9) {
				return el === context.documentElement;
			}
			return el === context;
			},
			':any-link': function(el) {
			return typeof el.href === 'string';
			},
			':local-link': function(el) {
			if (el.nodeName) {
				return el.href && el.host === window.location.host;
			}
			var param = +el + 1;
			return function(el) {
				if (!el.href) return;

				var url = window.location + ''
				, href = el + '';

				return truncateUrl(url, param) === truncateUrl(href, param);
			};
			},
			':default': function(el) {
			return !!el.defaultSelected;
			},
			':valid': function(el) {
			return el.willValidate || (el.validity && el.validity.valid);
			},
			':invalid': function(el) {
			return !selectors[':valid'](el);
			},
			':in-range': function(el) {
			return el.value > el.min && el.value <= el.max;
			},
			':out-of-range': function(el) {
			return !selectors[':in-range'](el);
			},
			':required': function(el) {
			return !!el.required;
			},
			':optional': function(el) {
			return !el.required;
			},
			':read-only': function(el) {
			if (el.readOnly) return true;

			var attr = el.getAttribute('contenteditable')
				, prop = el.contentEditable
				, name = el.nodeName.toLowerCase();

			name = name !== 'input' && name !== 'textarea';

			return (name || el.disabled) && attr == null && prop !== 'true';
			},
			':read-write': function(el) {
			return !selectors[':read-only'](el);
			},
			':hover': function() {
			throw new Error(':hover is not supported.');
			},
			':active': function() {
			throw new Error(':active is not supported.');
			},
			':link': function() {
			throw new Error(':link is not supported.');
			},
			':visited': function() {
			throw new Error(':visited is not supported.');
			},
			':column': function() {
			throw new Error(':column is not supported.');
			},
			':nth-column': function() {
			throw new Error(':nth-column is not supported.');
			},
			':nth-last-column': function() {
			throw new Error(':nth-last-column is not supported.');
			},
			':current': function() {
			throw new Error(':current is not supported.');
			},
			':past': function() {
			throw new Error(':past is not supported.');
			},
			':future': function() {
			throw new Error(':future is not supported.');
			},
			// Non-standard, for compatibility purposes.
			':contains': function(param) {
			return function(el) {
				var text = el.innerText || el.textContent || el.value || '';
				return !!~text.indexOf(param);
			};
			},
			':has': function(param) {
			return function(el) {
				return zest(param, el).length > 0;
			};
			}
			// Potentially add more pseudo selectors for
			// compatibility with sizzle and most other
			// selector engines (?).
		};

		/**
		 * Attribute Operators
		 */

		var operators = {
			'-': function() {
			return true;
			},
			'=': function(attr, val) {
			return attr === val;
			},
			'*=': function(attr, val) {
			return attr.indexOf(val) !== -1;
			},
			'~=': function(attr, val) {
			var i = attr.indexOf(val)
				, f
				, l;

			if (i === -1) return;
			f = attr[i - 1];
			l = attr[i + val.length];

			return (!f || f === ' ') && (!l || l === ' ');
			},
			'|=': function(attr, val) {
			var i = attr.indexOf(val)
				, l;

			if (i !== 0) return;
			l = attr[i + val.length];

			return l === '-' || !l;
			},
			'^=': function(attr, val) {
			return attr.indexOf(val) === 0;
			},
			'$=': function(attr, val) {
			return attr.indexOf(val) + val.length === attr.length;
			},
			// non-standard
			'!=': function(attr, val) {
			return attr !== val;
			}
		};

		/**
		 * Combinator Logic
		 */

		var combinators = {
			' ': function(test) {
			return function(el) {
				while (el = el.parentNode) {
				if (test(el)) return el;
				}
			};
			},
			'>': function(test) {
			return function(el) {
				return test(el = el.parentNode) && el;
			};
			},
			'+': function(test) {
			return function(el) {
				return test(el = prev(el)) && el;
			};
			},
			'~': function(test) {
			return function(el) {
				while (el = prev(el)) {
				if (test(el)) return el;
				}
			};
			},
			'noop': function(test) {
			return function(el) {
				return test(el) && el;
			};
			},
			'ref': function(test, name) {
			var node;

			function ref(el) {
				var doc = el.ownerDocument
				, nodes = doc.getElementsByTagName('*')
				, i = nodes.length;

				while (i--) {
				node = nodes[i];
				if (ref.test(el)) {
					node = null;
					return true;
				}
				}

				node = null;
			}

			ref.combinator = function(el) {
				if (!node || !node.getAttribute) return;

				var attr = node.getAttribute(name) || '';
				if (attr[0] === '#') attr = attr.substring(1);

				if (attr === el.id && test(node)) {
				return node;
				}
			};

			return ref;
			}
		};

		/**
		 * Grammar
		 */

		var rules = {
			qname: /^ *([\w\-]+|\*)/,
			simple: /^(?:([.#][\w\-]+)|pseudo|attr)/,
			ref: /^ *\/([\w\-]+)\/ */,
			combinator: /^(?: +([^ \w*]) +|( )+|([^ \w*]))(?! *$)/,
			attr: /^\[([\w\-]+)(?:([^\w]?=)(inside))?\]/,
			pseudo: /^(:[\w\-]+)(?:\((inside)\))?/,
			inside: /(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|<[^"'>]*>|\\["'>]|[^"'>])*/
		};

		rules.inside = replace(rules.inside, '[^"\'>]*', rules.inside);
		rules.attr = replace(rules.attr, 'inside', makeInside('\\[', '\\]'));
		rules.pseudo = replace(rules.pseudo, 'inside', makeInside('\\(', '\\)'));
		rules.simple = replace(rules.simple, 'pseudo', rules.pseudo);
		rules.simple = replace(rules.simple, 'attr', rules.attr);

		/**
		 * Compiling
		 */

		var compile = function(sel) {
			var sel = sel.replace(/^\s+|\s+$/g, '')
			, test
			, filter = []
			, buff = []
			, subject
			, qname
			, cap
			, op
			, ref;

			while (sel) {
			if (cap = rules.qname.exec(sel)) {
				sel = sel.substring(cap[0].length);
				qname = cap[1];
				buff.push(tok(qname, true));
			} else if (cap = rules.simple.exec(sel)) {
				sel = sel.substring(cap[0].length);
				qname = '*';
				buff.push(tok(qname, true));
				buff.push(tok(cap));
			} else {
				throw new Error('Invalid selector.');
			}

			while (cap = rules.simple.exec(sel)) {
				sel = sel.substring(cap[0].length);
				buff.push(tok(cap));
			}

			if (sel[0] === '!') {
				sel = sel.substring(1);
				subject = makeSubject();
				subject.qname = qname;
				buff.push(subject.simple);
			}

			if (cap = rules.ref.exec(sel)) {
				sel = sel.substring(cap[0].length);
				ref = combinators.ref(makeSimple(buff), cap[1]);
				filter.push(ref.combinator);
				buff = [];
				continue;
			}

			if (cap = rules.combinator.exec(sel)) {
				sel = sel.substring(cap[0].length);
				op = cap[1] || cap[2] || cap[3];
				if (op === ',') {
				filter.push(combinators.noop(makeSimple(buff)));
				break;
				}
			} else {
				op = 'noop';
			}

			filter.push(combinators[op](makeSimple(buff)));
			buff = [];
			}

			test = makeTest(filter);
			test.qname = qname;
			test.sel = sel;

			if (subject) {
			subject.lname = test.qname;

			subject.test = test;
			subject.qname = subject.qname;
			subject.sel = test.sel;
			test = subject;
			}

			if (ref) {
			ref.test = test;
			ref.qname = test.qname;
			ref.sel = test.sel;
			test = ref;
			}

			return test;
		};

		var tok = function(cap, qname) {
			// qname
			if (qname) {
			return cap === '*'
				? selectors['*']
				: selectors.type(cap);
			}

			// class/id
			if (cap[1]) {
			return cap[1][0] === '.'
				? selectors.attr('class', '~=', cap[1].substring(1))
				: selectors.attr('id', '=', cap[1].substring(1));
			}

			// pseudo-name
			// inside-pseudo
			if (cap[2]) {
			return cap[3]
				? selectors[cap[2]](unquote(cap[3]))
				: selectors[cap[2]];
			}

			// attr name
			// attr op
			// attr value
			if (cap[4]) {
			var i;
			if (cap[6]) {
				i = cap[6].length;
				cap[6] = cap[6].replace(/ +i$/, '');
				i = i > cap[6].length;
			}
			return selectors.attr(cap[4], cap[5] || '-', unquote(cap[6]), i);
			}

			throw new Error('Unknown Selector.');
		};

		var makeSimple = function(func) {
			var l = func.length
			, i;

			// Potentially make sure
			// `el` is truthy.
			if (l < 2) return func[0];

			return function(el) {
			if (!el) return;
			for (i = 0; i < l; i++) {
				if (!func[i](el)) return;
			}
			return true;
			};
		};

		var makeTest = function(func) {
			if (func.length < 2) {
			return function(el) {
				return !!func[0](el);
			};
			}
			return function(el) {
			var i = func.length;
			while (i--) {
				if (!(el = func[i](el))) return;
			}
			return true;
			};
		};

		var makeSubject = function() {
			var target;

			function subject(el) {
			var node = el.ownerDocument
				, scope = node.getElementsByTagName(subject.lname)
				, i = scope.length;

			while (i--) {
				if (subject.test(scope[i]) && target === el) {
				target = null;
				return true;
				}
			}

			target = null;
			}

			subject.simple = function(el) {
			target = el;
			return true;
			};

			return subject;
		};

		var compileGroup = function(sel) {
			var test = compile(sel)
			, tests = [ test ];

			while (test.sel) {
			test = compile(test.sel);
			tests.push(test);
			}

			if (tests.length < 2) return test;

			return function(el) {
			var l = tests.length
				, i = 0;

			for (; i < l; i++) {
				if (tests[i](el)) return true;
			}
			};
		};

		/**
		 * Selection
		 */

		var find = function(sel, node) {
			var results = []
			, test = compile(sel)
			, scope = node.getElementsByTagName(test.qname)
			, i = 0
			, el;

			while (el = scope[i++]) {
			if (test(el)) results.push(el);
			}

			if (test.sel) {
			while (test.sel) {
				test = compile(test.sel);
				scope = node.getElementsByTagName(test.qname);
				i = 0;
				while (el = scope[i++]) {
				if (test(el) && !~indexOf.call(results, el)) {
					results.push(el);
				}
				}
			}
			results.sort(order);
			}

			return results;
		};

		/**
		 * Native
		 */

		var select = (function() {
			var slice = (function() {
			try {
				Array.prototype.slice.call(document.getElementsByTagName('*'));
				return Array.prototype.slice;
			} catch(e) {
				e = null;
				return function() {
				var a = [], i = 0, l = this.length;
				for (; i < l; i++) a.push(this[i]);
				return a;
				};
			}
			})();

			if (document.querySelectorAll) {
			return function(sel, node) {
				try {
				return slice.call(node.querySelectorAll(sel));
				} catch(e) {
				return find(sel, node);
				}
			};
			}

			return function(sel, node) {
			try {
				if (sel[0] === '#' && /^#[\w\-]+$/.test(sel)) {
				return [node.getElementById(sel.substring(1))];
				}
				if (sel[0] === '.' && /^\.[\w\-]+$/.test(sel)) {
				sel = node.getElementsByClassName(sel.substring(1));
				return slice.call(sel);
				}
				if (/^[\w\-]+$/.test(sel)) {
				return slice.call(node.getElementsByTagName(sel));
				}
			} catch(e) {
				;
			}
			return find(sel, node);
			};
		})();

		/**
		 * Zest
		 */

		var zest = function(sel, node) {
			try {
			sel = select(sel, node || document);
			} catch(e) {
			if (window.ZEST_DEBUG) {
				console.log(e.stack || e + '');
			}
			sel = [];
			}
			return sel;
		};

		/**
		 * Expose
		 */

		zest.selectors = selectors;
		zest.operators = operators;
		zest.combinators = combinators;
		zest.compile = compileGroup;

		zest.matches = function(el, sel) {
			return !!compileGroup(sel)(el);
		};

		zest.cache = function() {
			if (compile.raw) return;

			var raw = compile
			, cache = {};

			compile = function(sel) {
			return cache[sel]
				|| (cache[sel] = raw(sel));
			};

			compile.raw = raw;
			zest._cache = cache;
		};

		zest.noCache = function() {
			if (!compile.raw) return;
			compile = compile.raw;
			delete zest._cache;
		};

		zest.noNative = function() {
			select = find;
		};

		return zest;

	}).call(window);

	return lr;

 })(window);