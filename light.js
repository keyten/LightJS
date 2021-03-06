/*!
 * LightJS JavaScript Library v0.1 Beta
 * 
 * Author: Dmitriy Miroshnichenko aka Keyten
 * Released under the MIT License
 * 
 */
 Light = lr = $ = (function(window, undefined){

	var lr = function(selector, context){

		if(lr.isFunction(selector)) lr.ready(selector);

		else if(selector == 'body' && !context && document.body) return new lr.element(document.body);

		else if(selector.nodeName || selector instanceof NodeList || selector instanceof lr.element)
			return new lr.element(selector);

		else if(lr.isArray(selector)){
			var arr = [];
			lr.each(selector, function(val){
				if(lr.isString(val))
					arr = arr.concat(lr.find(val, context));
				else if(val instanceof lr.element)
					arr = arr.concat(val.get());
				else arr.push(val);
			});
			return new lr.element(arr);
		}

		else if(lr.isString(selector)){

			if(selector[0] == '<' && selector[ selector.length-1 ] == '>')
				return new lr.element( lr.element.create(selector, context) );

			return new lr.element( lr.find(selector, context), selector );

		}
		
	}

	lr.version = 0.1;


	var objProto = Object.prototype,
		arrayProto = Array.prototype;

	lr.each = function(obj, fn){
		if(lr.isString && lr.isString(fn)){
			var command = fn,
				args = arrayProto.slice.call(arguments,2);
			fn = function(v){
				v[command].apply(v, args)
			}
		}
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

	lr.map = function(obj, fn){
		if(lr.isString && lr.isString(fn)){
			var command = fn,
				args = arrayProto.slice.call(arguments,2);
			fn = function(v){
				return v[command].apply(v, args);
			}
		}
		var arr = [];
		lr.each(obj, function(v,i){
			arr.push( fn.call(this, v, i) );
		});
		return arr;
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
		if('extend' in properties){
			lr.extend(cls, properties.extend);
		}
		// todo: add 'implement' in properties

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

	lr.find = (function( window, undefined ) {
		/*!
		 * Sizzle CSS Selector Engine
		 *  Copyright 2012 jQuery Foundation and other contributors
		 *  Released under the MIT license
		 *  http://sizzlejs.com/
		 */

		var dirruns,
			cachedruns,
			assertGetIdNotName,
			Expr,
			getText,
			isXML,
			contains,
			compile,
			sortOrder,
			hasDuplicate,

			baseHasDuplicate = true,
			strundefined = "undefined",

			expando = ( "sizcache" + Math.random() ).replace( ".", "" ),

			document = window.document,
			docElem = document.documentElement,
			done = 0,
			slice = [].slice,
			push = [].push,

			// Augment a function for special use by Sizzle
			markFunction = function( fn, value ) {
				fn[ expando ] = value || true;
				return fn;
			},

			createCache = function() {
				var cache = {},
					keys = [];

				return markFunction(function( key, value ) {
					// Only keep the most recent entries
					if ( keys.push( key ) > Expr.cacheLength ) {
						delete cache[ keys.shift() ];
					}

					return (cache[ key ] = value);
				}, cache );
			},

			classCache = createCache(),
			tokenCache = createCache(),
			compilerCache = createCache(),

			// Regex

			// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
			whitespace = "[\\x20\\t\\r\\n\\f]",
			// http://www.w3.org/TR/css3-syntax/#characters
			characterEncoding = "(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+",

			// Loosely modeled on CSS identifier characters
			// An unquoted value should be a CSS identifier (http://www.w3.org/TR/css3-selectors/#attribute-selectors)
			// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
			identifier = characterEncoding.replace( "w", "w#" ),

			// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
			operators = "([*^$|!~]?=)",
			attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
				"*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

			// Prefer arguments not in parens/brackets,
			//   then attribute selectors and non-pseudos (denoted by :),
			//   then anything else
			// These preferences are here to reduce the number of selectors
			//   needing tokenize in the PSEUDO preFilter
			pseudos = ":(" + characterEncoding + ")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:" + attributes + ")|[^:]|\\\\.)*|.*))\\)|)",

			// For matchExpr.POS and matchExpr.needsContext
			pos = ":(nth|eq|gt|lt|first|last|even|odd)(?:\\(((?:-\\d)?\\d*)\\)|)(?=[^-]|$)",

			// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
			rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

			rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
			rcombinators = new RegExp( "^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*" ),
			rpseudo = new RegExp( pseudos ),

			// Easily-parseable/retrievable ID or TAG or CLASS selectors
			rquickExpr = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,

			rnot = /^:not/,
			rsibling = /[\x20\t\r\n\f]*[+~]/,
			rendsWithNot = /:not\($/,

			rheader = /h\d/i,
			rinputs = /input|select|textarea|button/i,

			rbackslash = /\\(?!\\)/g,

			matchExpr = {
				"ID": new RegExp( "^#(" + characterEncoding + ")" ),
				"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
				"NAME": new RegExp( "^\\[name=['\"]?(" + characterEncoding + ")['\"]?\\]" ),
				"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
				"ATTR": new RegExp( "^" + attributes ),
				"PSEUDO": new RegExp( "^" + pseudos ),
				"CHILD": new RegExp( "^:(only|nth|last|first)-child(?:\\(" + whitespace +
					"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
					"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
				"POS": new RegExp( pos, "ig" ),
				// For use in libraries implementing .is()
				"needsContext": new RegExp( "^" + whitespace + "*[>+~]|" + pos, "i" )
			},

			// Support

			// Used for testing something on an element
			assert = function( fn ) {
				var div = document.createElement("div");

				try {
					return fn( div );
				} catch (e) {
					return false;
				} finally {
					// release memory in IE
					div = null;
				}
			},

			// Check if getElementsByTagName("*") returns only elements
			assertTagNameNoComments = assert(function( div ) {
				div.appendChild( document.createComment("") );
				return !div.getElementsByTagName("*").length;
			}),

			// Check if getAttribute returns normalized href attributes
			assertHrefNotNormalized = assert(function( div ) {
				div.innerHTML = "<a href='#'></a>";
				return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
					div.firstChild.getAttribute("href") === "#";
			}),

			// Check if attributes should be retrieved by attribute nodes
			assertAttributes = assert(function( div ) {
				div.innerHTML = "<select></select>";
				var type = typeof div.lastChild.getAttribute("multiple");
				// IE8 returns a string for some attributes even when not present
				return type !== "boolean" && type !== "string";
			}),

			// Check if getElementsByClassName can be trusted
			assertUsableClassName = assert(function( div ) {
				// Opera can't find a second classname (in 9.6)
				div.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>";
				if ( !div.getElementsByClassName || !div.getElementsByClassName("e").length ) {
					return false;
				}

				// Safari 3.2 caches class attributes and doesn't catch changes
				div.lastChild.className = "e";
				return div.getElementsByClassName("e").length === 2;
			}),

			// Check if getElementById returns elements by name
			// Check if getElementsByName privileges form controls or returns elements by ID
			assertUsableName = assert(function( div ) {
				// Inject content
				div.id = expando + 0;
				div.innerHTML = "<a name='" + expando + "'></a><div name='" + expando + "'></div>";
				docElem.insertBefore( div, docElem.firstChild );

				// Test
				var pass = document.getElementsByName &&
					// buggy browsers will return fewer than the correct 2
					document.getElementsByName( expando ).length === 2 +
					// buggy browsers will return more than the correct 0
					document.getElementsByName( expando + 0 ).length;
				assertGetIdNotName = !document.getElementById( expando );

				// Cleanup
				docElem.removeChild( div );

				return pass;
			});

		// If slice is not available, provide a backup
		try {
			slice.call( docElem.childNodes, 0 )[0].nodeType;
		} catch ( e ) {
			slice = function( i ) {
				var elem, results = [];
				for ( ; (elem = this[i]); i++ ) {
					results.push( elem );
				}
				return results;
			};
		}

		function Sizzle( selector, context, results, seed ) {
			results = results || [];
			context = context || document;
			var match, elem, xml, m,
				nodeType = context.nodeType;

			if ( nodeType !== 1 && nodeType !== 9 ) {
				return [];
			}

			if ( !selector || typeof selector !== "string" ) {
				return results;
			}

			xml = isXML( context );

			if ( !xml && !seed ) {
				if ( (match = rquickExpr.exec( selector )) ) {
					// Speed-up: Sizzle("#ID")
					if ( (m = match[1]) ) {
						if ( nodeType === 9 ) {
							elem = context.getElementById( m );
							// Check parentNode to catch when Blackberry 4.6 returns
							// nodes that are no longer in the document #6963
							if ( elem && elem.parentNode ) {
								// Handle the case where IE, Opera, and Webkit return items
								// by name instead of ID
								if ( elem.id === m ) {
									results.push( elem );
									return results;
								}
							} else {
								return results;
							}
						} else {
							// Context is not a document
							if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
								contains( context, elem ) && elem.id === m ) {
								results.push( elem );
								return results;
							}
						}

					// Speed-up: Sizzle("TAG")
					} else if ( match[2] ) {
						push.apply( results, slice.call(context.getElementsByTagName( selector ), 0) );
						return results;

					// Speed-up: Sizzle(".CLASS")
					} else if ( (m = match[3]) && assertUsableClassName && context.getElementsByClassName ) {
						push.apply( results, slice.call(context.getElementsByClassName( m ), 0) );
						return results;
					}
				}
			}

			// All others
			return select( selector, context, results, seed, xml );
		}

		Sizzle.matches = function( expr, elements ) {
			return Sizzle( expr, null, null, elements );
		};

		Sizzle.matchesSelector = function( elem, expr ) {
			return Sizzle( expr, null, null, [ elem ] ).length > 0;
		};

		// Returns a function to use in pseudos for input types
		function createInputPseudo( type ) {
			return function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return name === "input" && elem.type === type;
			};
		}

		// Returns a function to use in pseudos for buttons
		function createButtonPseudo( type ) {
			return function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return (name === "input" || name === "button") && elem.type === type;
			};
		}

		/**
		 * Utility function for retrieving the text value of an array of DOM nodes
		 * @param {Array|Element} elem
		 */
		getText = Sizzle.getText = function( elem ) {
			var node,
				ret = "",
				i = 0,
				nodeType = elem.nodeType;

			if ( nodeType ) {
				if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
					// Use textContent for elements
					// innerText usage removed for consistency of new lines (see #11153)
					if ( typeof elem.textContent === "string" ) {
						return elem.textContent;
					} else {
						// Traverse its children
						for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
							ret += getText( elem );
						}
					}
				} else if ( nodeType === 3 || nodeType === 4 ) {
					return elem.nodeValue;
				}
				// Do not include comment or processing instruction nodes
			} else {

				// If no nodeType, this is expected to be an array
				for ( ; (node = elem[i]); i++ ) {
					// Do not traverse comment nodes
					ret += getText( node );
				}
			}
			return ret;
		};

		isXML = Sizzle.isXML = function isXML( elem ) {
			// documentElement is verified for cases where it doesn't yet exist
			// (such as loading iframes in IE - #4833)
			var documentElement = elem && (elem.ownerDocument || elem).documentElement;
			return documentElement ? documentElement.nodeName !== "HTML" : false;
		};

		// Element contains another
		contains = Sizzle.contains = docElem.contains ?
			function( a, b ) {
				var adown = a.nodeType === 9 ? a.documentElement : a,
					bup = b && b.parentNode;
				return a === bup || !!( bup && bup.nodeType === 1 && adown.contains && adown.contains(bup) );
			} :
			docElem.compareDocumentPosition ?
			function( a, b ) {
				return b && !!( a.compareDocumentPosition( b ) & 16 );
			} :
			function( a, b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
				return false;
			};

		Sizzle.attr = function( elem, name ) {
			var attr,
				xml = isXML( elem );

			if ( !xml ) {
				name = name.toLowerCase();
			}
			if ( Expr.attrHandle[ name ] ) {
				return Expr.attrHandle[ name ]( elem );
			}
			if ( assertAttributes || xml ) {
				return elem.getAttribute( name );
			}
			attr = elem.getAttributeNode( name );
			return attr ?
				typeof elem[ name ] === "boolean" ?
					elem[ name ] ? name : null :
					attr.specified ? attr.value : null :
				null;
		};

		Expr = Sizzle.selectors = {

			// Can be adjusted by the user
			cacheLength: 50,

			createPseudo: markFunction,

			match: matchExpr,

			order: new RegExp( "ID|TAG" +
				(assertUsableName ? "|NAME" : "") +
				(assertUsableClassName ? "|CLASS" : "")
			),

			// IE6/7 return a modified href
			attrHandle: assertHrefNotNormalized ?
				{} :
				{
					"href": function( elem ) {
						return elem.getAttribute( "href", 2 );
					},
					"type": function( elem ) {
						return elem.getAttribute("type");
					}
				},

			find: {
				"ID": assertGetIdNotName ?
					function( id, context, xml ) {
						if ( typeof context.getElementById !== strundefined && !xml ) {
							var m = context.getElementById( id );
							// Check parentNode to catch when Blackberry 4.6 returns
							// nodes that are no longer in the document #6963
							return m && m.parentNode ? [m] : [];
						}
					} :
					function( id, context, xml ) {
						if ( typeof context.getElementById !== strundefined && !xml ) {
							var m = context.getElementById( id );

							return m ?
								m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ?
									[m] :
									undefined :
								[];
						}
					},

				"TAG": assertTagNameNoComments ?
					function( tag, context ) {
						if ( typeof context.getElementsByTagName !== strundefined ) {
							return context.getElementsByTagName( tag );
						}
					} :
					function( tag, context ) {
						var results = context.getElementsByTagName( tag );

						// Filter out possible comments
						if ( tag === "*" ) {
							var elem,
								tmp = [],
								i = 0;

							for ( ; (elem = results[i]); i++ ) {
								if ( elem.nodeType === 1 ) {
									tmp.push( elem );
								}
							}

							return tmp;
						}
						return results;
					},

				"NAME": function( tag, context ) {
					if ( typeof context.getElementsByName !== strundefined ) {
						return context.getElementsByName( name );
					}
				},

				"CLASS": function( className, context, xml ) {
					if ( typeof context.getElementsByClassName !== strundefined && !xml ) {
						return context.getElementsByClassName( className );
					}
				}
			},

			relative: {
				">": { dir: "parentNode", first: true },
				" ": { dir: "parentNode" },
				"+": { dir: "previousSibling", first: true },
				"~": { dir: "previousSibling" }
			},

			preFilter: {
				"ATTR": function( match ) {
					match[1] = match[1].replace( rbackslash, "" );

					// Move the given value to match[3] whether quoted or unquoted
					match[3] = ( match[4] || match[5] || "" ).replace( rbackslash, "" );

					if ( match[2] === "~=" ) {
						match[3] = " " + match[3] + " ";
					}

					return match.slice( 0, 4 );
				},

				"CHILD": function( match ) {
					/* matches from matchExpr.CHILD
						1 type (only|nth|...)
						2 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
						3 xn-component of xn+y argument ([+-]?\d*n|)
						4 sign of xn-component
						5 x of xn-component
						6 sign of y-component
						7 y of y-component
					*/
					match[1] = match[1].toLowerCase();

					if ( match[1] === "nth" ) {
						// nth-child requires argument
						if ( !match[2] ) {
							Sizzle.error( match[0] );
						}

						// numeric x and y parameters for Expr.filter.CHILD
						// remember that false/true cast respectively to 0/1
						match[3] = +( match[3] ? match[4] + (match[5] || 1) : 2 * ( match[2] === "even" || match[2] === "odd" ) );
						match[4] = +( ( match[6] + match[7] ) || match[2] === "odd" );

					// other types prohibit arguments
					} else if ( match[2] ) {
						Sizzle.error( match[0] );
					}

					return match;
				},

				"PSEUDO": function( match, context, xml ) {
					var unquoted, excess;
					if ( matchExpr["CHILD"].test( match[0] ) ) {
						return null;
					}

					if ( match[3] ) {
						match[2] = match[3];
					} else if ( (unquoted = match[4]) ) {
						// Only check arguments that contain a pseudo
						if ( rpseudo.test(unquoted) &&
							// Get excess from tokenize (recursively)
							(excess = tokenize( unquoted, context, xml, true )) &&
							// advance to the next closing parenthesis
							(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

							// excess is a negative index
							unquoted = unquoted.slice( 0, excess );
							match[0] = match[0].slice( 0, excess );
						}
						match[2] = unquoted;
					}

					// Return only captures needed by the pseudo filter method (type and argument)
					return match.slice( 0, 3 );
				}
			},

			filter: {
				"ID": assertGetIdNotName ?
					function( id ) {
						id = id.replace( rbackslash, "" );
						return function( elem ) {
							return elem.getAttribute("id") === id;
						};
					} :
					function( id ) {
						id = id.replace( rbackslash, "" );
						return function( elem ) {
							var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
							return node && node.value === id;
						};
					},

				"TAG": function( nodeName ) {
					if ( nodeName === "*" ) {
						return function() { return true; };
					}
					nodeName = nodeName.replace( rbackslash, "" ).toLowerCase();

					return function( elem ) {
						return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
					};
				},

				"CLASS": function( className ) {
					var pattern = classCache[ expando ][ className ];
					if ( !pattern ) {
						pattern = classCache( className, new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)") );
					}
					return function( elem ) {
						return pattern.test( elem.className || (typeof elem.getAttribute !== strundefined && elem.getAttribute("class")) || "" );
					};
				},

				"ATTR": function( name, operator, check ) {
					if ( !operator ) {
						return function( elem ) {
							return Sizzle.attr( elem, name ) != null;
						};
					}

					return function( elem ) {
						var result = Sizzle.attr( elem, name ),
							value = result + "";

						if ( result == null ) {
							return operator === "!=";
						}

						switch ( operator ) {
							case "=":
								return value === check;
							case "!=":
								return value !== check;
							case "^=":
								return check && value.indexOf( check ) === 0;
							case "*=":
								return check && value.indexOf( check ) > -1;
							case "$=":
								return check && value.substr( value.length - check.length ) === check;
							case "~=":
								return ( " " + value + " " ).indexOf( check ) > -1;
							case "|=":
								return value === check || value.substr( 0, check.length + 1 ) === check + "-";
						}
					};
				},

				"CHILD": function( type, argument, first, last ) {

					if ( type === "nth" ) {
						var doneName = done++;

						return function( elem ) {
							var parent, diff,
								count = 0,
								node = elem;

							if ( first === 1 && last === 0 ) {
								return true;
							}

							parent = elem.parentNode;

							if ( parent && (parent[ expando ] !== doneName || !elem.sizset) ) {
								for ( node = parent.firstChild; node; node = node.nextSibling ) {
									if ( node.nodeType === 1 ) {
										node.sizset = ++count;
										if ( node === elem ) {
											break;
										}
									}
								}

								parent[ expando ] = doneName;
							}

							diff = elem.sizset - last;

							if ( first === 0 ) {
								return diff === 0;

							} else {
								return ( diff % first === 0 && diff / first >= 0 );
							}
						};
					}

					return function( elem ) {
						var node = elem;

						switch ( type ) {
							case "only":
							case "first":
								while ( (node = node.previousSibling) ) {
									if ( node.nodeType === 1 ) {
										return false;
									}
								}

								if ( type === "first" ) {
									return true;
								}

								node = elem;

								/* falls through */
							case "last":
								while ( (node = node.nextSibling) ) {
									if ( node.nodeType === 1 ) {
										return false;
									}
								}

								return true;
						}
					};
				},

				"PSEUDO": function( pseudo, argument, context, xml ) {
					// pseudo-class names are case-insensitive
					// http://www.w3.org/TR/selectors/#pseudo-classes
					// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
					var args,
						fn = Expr.pseudos[ pseudo ] || Expr.pseudos[ pseudo.toLowerCase() ];

					if ( !fn ) {
						Sizzle.error( "unsupported pseudo: " + pseudo );
					}

					// The user may use createPseudo to indicate that
					// arguments are needed to create the filter function
					// just as Sizzle does
					if ( !fn[ expando ] ) {
						if ( fn.length > 1 ) {
							args = [ pseudo, pseudo, "", argument ];
							return function( elem ) {
								return fn( elem, 0, args );
							};
						}
						return fn;
					}

					return fn( argument, context, xml );
				}
			},

			pseudos: {
				"not": markFunction(function( selector, context, xml ) {
					// Trim the selector passed to compile
					// to avoid treating leading and trailing
					// spaces as combinators
					var matcher = compile( selector.replace( rtrim, "$1" ), context, xml );
					return function( elem ) {
						return !matcher( elem );
					};
				}),

				"enabled": function( elem ) {
					return elem.disabled === false;
				},

				"disabled": function( elem ) {
					return elem.disabled === true;
				},

				"checked": function( elem ) {
					// In CSS3, :checked should return both checked and selected elements
					// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
					var nodeName = elem.nodeName.toLowerCase();
					return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
				},

				"selected": function( elem ) {
					// Accessing this property makes selected-by-default
					// options in Safari work properly
					if ( elem.parentNode ) {
						elem.parentNode.selectedIndex;
					}

					return elem.selected === true;
				},

				"parent": function( elem ) {
					return !Expr.pseudos["empty"]( elem );
				},

				"empty": function( elem ) {
					// http://www.w3.org/TR/selectors/#empty-pseudo
					// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
					//   not comment, processing instructions, or others
					// Thanks to Diego Perini for the nodeName shortcut
					//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
					var nodeType;
					elem = elem.firstChild;
					while ( elem ) {
						if ( elem.nodeName > "@" || (nodeType = elem.nodeType) === 3 || nodeType === 4 ) {
							return false;
						}
						elem = elem.nextSibling;
					}
					return true;
				},

				"contains": markFunction(function( text ) {
					return function( elem ) {
						return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
					};
				}),

				"has": markFunction(function( selector ) {
					return function( elem ) {
						return Sizzle( selector, elem ).length > 0;
					};
				}),

				"header": function( elem ) {
					return rheader.test( elem.nodeName );
				},

				"text": function( elem ) {
					var type, attr;
					// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
					// use getAttribute instead to test this case
					return elem.nodeName.toLowerCase() === "input" &&
						(type = elem.type) === "text" &&
						( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === type );
				},

				// Input types
				"radio": createInputPseudo("radio"),
				"checkbox": createInputPseudo("checkbox"),
				"file": createInputPseudo("file"),
				"password": createInputPseudo("password"),
				"image": createInputPseudo("image"),

				"submit": createButtonPseudo("submit"),
				"reset": createButtonPseudo("reset"),

				"button": function( elem ) {
					var name = elem.nodeName.toLowerCase();
					return name === "input" && elem.type === "button" || name === "button";
				},

				"input": function( elem ) {
					return rinputs.test( elem.nodeName );
				},

				"focus": function( elem ) {
					var doc = elem.ownerDocument;
					return elem === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(elem.type || elem.href);
				},

				"active": function( elem ) {
					return elem === elem.ownerDocument.activeElement;
				}
			},

			setFilters: {
				"first": function( elements, argument, not ) {
					return not ? elements.slice( 1 ) : [ elements[0] ];
				},

				"last": function( elements, argument, not ) {
					var elem = elements.pop();
					return not ? elements : [ elem ];
				},

				"even": function( elements, argument, not ) {
					var results = [],
						i = not ? 1 : 0,
						len = elements.length;
					for ( ; i < len; i = i + 2 ) {
						results.push( elements[i] );
					}
					return results;
				},

				"odd": function( elements, argument, not ) {
					var results = [],
						i = not ? 0 : 1,
						len = elements.length;
					for ( ; i < len; i = i + 2 ) {
						results.push( elements[i] );
					}
					return results;
				},

				"lt": function( elements, argument, not ) {
					return not ? elements.slice( +argument ) : elements.slice( 0, +argument );
				},

				"gt": function( elements, argument, not ) {
					return not ? elements.slice( 0, +argument + 1 ) : elements.slice( +argument + 1 );
				},

				"eq": function( elements, argument, not ) {
					var elem = elements.splice( +argument, 1 );
					return not ? elements : elem;
				}
			}
		};

		function siblingCheck( a, b, ret ) {
			if ( a === b ) {
				return ret;
			}

			var cur = a.nextSibling;

			while ( cur ) {
				if ( cur === b ) {
					return -1;
				}

				cur = cur.nextSibling;
			}

			return 1;
		}

		sortOrder = docElem.compareDocumentPosition ?
			function( a, b ) {
				if ( a === b ) {
					hasDuplicate = true;
					return 0;
				}

				return ( !a.compareDocumentPosition || !b.compareDocumentPosition ?
					a.compareDocumentPosition :
					a.compareDocumentPosition(b) & 4
				) ? -1 : 1;
			} :
			function( a, b ) {
				// The nodes are identical, we can exit early
				if ( a === b ) {
					hasDuplicate = true;
					return 0;

				// Fallback to using sourceIndex (in IE) if it's available on both nodes
				} else if ( a.sourceIndex && b.sourceIndex ) {
					return a.sourceIndex - b.sourceIndex;
				}

				var al, bl,
					ap = [],
					bp = [],
					aup = a.parentNode,
					bup = b.parentNode,
					cur = aup;

				// If the nodes are siblings (or identical) we can do a quick check
				if ( aup === bup ) {
					return siblingCheck( a, b );

				// If no parents were found then the nodes are disconnected
				} else if ( !aup ) {
					return -1;

				} else if ( !bup ) {
					return 1;
				}

				// Otherwise they're somewhere else in the tree so we need
				// to build up a full list of the parentNodes for comparison
				while ( cur ) {
					ap.unshift( cur );
					cur = cur.parentNode;
				}

				cur = bup;

				while ( cur ) {
					bp.unshift( cur );
					cur = cur.parentNode;
				}

				al = ap.length;
				bl = bp.length;

				// Start walking down the tree looking for a discrepancy
				for ( var i = 0; i < al && i < bl; i++ ) {
					if ( ap[i] !== bp[i] ) {
						return siblingCheck( ap[i], bp[i] );
					}
				}

				// We ended someplace up the tree so do a sibling check
				return i === al ?
					siblingCheck( a, bp[i], -1 ) :
					siblingCheck( ap[i], b, 1 );
			};

		// Always assume the presence of duplicates if sort doesn't
		// pass them to our comparison function (as in Google Chrome).
		[0, 0].sort( sortOrder );
		baseHasDuplicate = !hasDuplicate;

		// Document sorting and removing duplicates
		Sizzle.uniqueSort = function( results ) {
			var elem,
				i = 1;

			hasDuplicate = baseHasDuplicate;
			results.sort( sortOrder );

			if ( hasDuplicate ) {
				for ( ; (elem = results[i]); i++ ) {
					if ( elem === results[ i - 1 ] ) {
						results.splice( i--, 1 );
					}
				}
			}

			return results;
		};

		Sizzle.error = function( msg ) {
			throw new Error( "Syntax error, unrecognized expression: " + msg );
		};

		function tokenize( selector, context, xml, parseOnly ) {
			var matched, match, tokens, type,
				soFar, groups, group, i,
				preFilters, filters,
				checkContext = !xml && context !== document,
				// Token cache should maintain spaces
				key = ( checkContext ? "<s>" : "" ) + selector.replace( rtrim, "$1<s>" ),
				cached = tokenCache[ expando ][ key ];

			if ( cached ) {
				return parseOnly ? 0 : slice.call( cached, 0 );
			}

			soFar = selector;
			groups = [];
			i = 0;
			preFilters = Expr.preFilter;
			filters = Expr.filter;

			while ( soFar ) {

				// Comma and first run
				if ( !matched || (match = rcomma.exec( soFar )) ) {
					if ( match ) {
						soFar = soFar.slice( match[0].length );
						tokens.selector = group;
					}
					groups.push( tokens = [] );
					group = "";

					// Need to make sure we're within a narrower context if necessary
					// Adding a descendant combinator will generate what is needed
					if ( checkContext ) {
						soFar = " " + soFar;
					}
				}

				matched = false;

				// Combinators
				if ( (match = rcombinators.exec( soFar )) ) {
					group += match[0];
					soFar = soFar.slice( match[0].length );

					// Cast descendant combinators to space
					matched = tokens.push({
						part: match.pop().replace( rtrim, " " ),
						string: match[0],
						captures: match
					});
				}

				// Filters
				for ( type in filters ) {
					if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
						( match = preFilters[ type ](match, context, xml) )) ) {

						group += match[0];
						soFar = soFar.slice( match[0].length );
						matched = tokens.push({
							part: type,
							string: match.shift(),
							captures: match
						});
					}
				}

				if ( !matched ) {
					break;
				}
			}

			// Attach the full group as a selector
			if ( group ) {
				tokens.selector = group;
			}

			// Return the length of the invalid excess
			// if we're just parsing
			// Otherwise, throw an error or return tokens
			return parseOnly ?
				soFar.length :
				soFar ?
					Sizzle.error( selector ) :
					// Cache the tokens
					slice.call( tokenCache(key, groups), 0 );
		}

		function addCombinator( matcher, combinator, context, xml ) {
			var dir = combinator.dir,
				doneName = done++;

			if ( !matcher ) {
				// If there is no matcher to check, check against the context
				matcher = function( elem ) {
					return elem === context;
				};
			}
			return combinator.first ?
				function( elem ) {
					while ( (elem = elem[ dir ]) ) {
						if ( elem.nodeType === 1 ) {
							return matcher( elem ) && elem;
						}
					}
				} :
				xml ?
					function( elem ) {
						while ( (elem = elem[ dir ]) ) {
							if ( elem.nodeType === 1 ) {
								if ( matcher( elem ) ) {
									return elem;
								}
							}
						}
					} :
					function( elem ) {
						var cache,
							dirkey = doneName + "." + dirruns,
							cachedkey = dirkey + "." + cachedruns;
						while ( (elem = elem[ dir ]) ) {
							if ( elem.nodeType === 1 ) {
								if ( (cache = elem[ expando ]) === cachedkey ) {
									return elem.sizset;
								} else if ( typeof cache === "string" && cache.indexOf(dirkey) === 0 ) {
									if ( elem.sizset ) {
										return elem;
									}
								} else {
									elem[ expando ] = cachedkey;
									if ( matcher( elem ) ) {
										elem.sizset = true;
										return elem;
									}
									elem.sizset = false;
								}
							}
						}
					};
		}

		function addMatcher( higher, deeper ) {
			return higher ?
				function( elem ) {
					var result = deeper( elem );
					return result && higher( result === true ? elem : result );
				} :
				deeper;
		}

		// ["TAG", ">", "ID", " ", "CLASS"]
		function matcherFromTokens( tokens, context, xml ) {
			var token, matcher,
				i = 0;

			for ( ; (token = tokens[i]); i++ ) {
				if ( Expr.relative[ token.part ] ) {
					matcher = addCombinator( matcher, Expr.relative[ token.part ], context, xml );
				} else {
					matcher = addMatcher( matcher, Expr.filter[ token.part ].apply(null, token.captures.concat( context, xml )) );
				}
			}

			return matcher;
		}

		function matcherFromGroupMatchers( matchers ) {
			return function( elem ) {
				var matcher,
					j = 0;
				for ( ; (matcher = matchers[j]); j++ ) {
					if ( matcher(elem) ) {
						return true;
					}
				}
				return false;
			};
		}

		compile = Sizzle.compile = function( selector, context, xml ) {
			var group, i, len,
				cached = compilerCache[ expando ][ selector ];

			// Return a cached group function if already generated (context dependent)
			if ( cached && cached.context === context ) {
				return cached;
			}

			// Generate a function of recursive functions that can be used to check each element
			group = tokenize( selector, context, xml );
			for ( i = 0, len = group.length; i < len; i++ ) {
				group[i] = matcherFromTokens(group[i], context, xml);
			}

			// Cache the compiled function
			cached = compilerCache( selector, matcherFromGroupMatchers(group) );
			cached.context = context;
			cached.runs = cached.dirruns = 0;
			return cached;
		};

		function multipleContexts( selector, contexts, results, seed ) {
			var i = 0,
				len = contexts.length;
			for ( ; i < len; i++ ) {
				Sizzle( selector, contexts[i], results, seed );
			}
		}

		function handlePOSGroup( selector, posfilter, argument, contexts, seed, not ) {
			var results,
				fn = Expr.setFilters[ posfilter.toLowerCase() ];

			if ( !fn ) {
				Sizzle.error( posfilter );
			}

			if ( selector || !(results = seed) ) {
				multipleContexts( selector || "*", contexts, (results = []), seed );
			}

			return results.length > 0 ? fn( results, argument, not ) : [];
		}

		function handlePOS( groups, context, results, seed ) {
			var group, part, j, groupLen, token, selector,
				anchor, elements, match, matched,
				lastIndex, currentContexts, not,
				i = 0,
				len = groups.length,
				rpos = matchExpr["POS"],
				// This is generated here in case matchExpr["POS"] is extended
				rposgroups = new RegExp( "^" + rpos.source + "(?!" + whitespace + ")", "i" ),
				// This is for making sure non-participating
				// matching groups are represented cross-browser (IE6-8)
				setUndefined = function() {
					var i = 1,
						len = arguments.length - 2;
					for ( ; i < len; i++ ) {
						if ( arguments[i] === undefined ) {
							match[i] = undefined;
						}
					}
				};

			for ( ; i < len; i++ ) {
				group = groups[i];
				part = "";
				elements = seed;
				for ( j = 0, groupLen = group.length; j < groupLen; j++ ) {
					token = group[j];
					selector = token.string;
					if ( token.part === "PSEUDO" ) {
						// Reset regex index to 0
						rpos.exec("");
						anchor = 0;
						while ( (match = rpos.exec( selector )) ) {
							matched = true;
							lastIndex = rpos.lastIndex = match.index + match[0].length;
							if ( lastIndex > anchor ) {
								part += selector.slice( anchor, match.index );
								anchor = lastIndex;
								currentContexts = [ context ];

								if ( rcombinators.test(part) ) {
									if ( elements ) {
										currentContexts = elements;
									}
									elements = seed;
								}

								if ( (not = rendsWithNot.test( part )) ) {
									part = part.slice( 0, -5 ).replace( rcombinators, "$&*" );
									anchor++;
								}

								if ( match.length > 1 ) {
									match[0].replace( rposgroups, setUndefined );
								}
								elements = handlePOSGroup( part, match[1], match[2], currentContexts, elements, not );
							}
							part = "";
						}

					}

					if ( !matched ) {
						part += selector;
					}
					matched = false;
				}

				if ( part ) {
					if ( rcombinators.test(part) ) {
						multipleContexts( part, elements || [ context ], results, seed );
					} else {
						Sizzle( part, context, results, seed ? seed.concat(elements) : elements );
					}
				} else {
					push.apply( results, elements );
				}
			}

			// Do not sort if this is a single filter
			return len === 1 ? results : Sizzle.uniqueSort( results );
		}

		function select( selector, context, results, seed, xml ) {
			// Remove excessive whitespace
			selector = selector.replace( rtrim, "$1" );
			var elements, matcher, cached, elem,
				i, tokens, token, lastToken, findContext, type,
				match = tokenize( selector, context, xml ),
				contextNodeType = context.nodeType;

			// POS handling
			if ( matchExpr["POS"].test(selector) ) {
				return handlePOS( match, context, results, seed );
			}

			if ( seed ) {
				elements = slice.call( seed, 0 );

			// To maintain document order, only narrow the
			// set if there is one group
			} else if ( match.length === 1 ) {

				// Take a shortcut and set the context if the root selector is an ID
				if ( (tokens = slice.call( match[0], 0 )).length > 2 &&
						(token = tokens[0]).part === "ID" &&
						contextNodeType === 9 && !xml &&
						Expr.relative[ tokens[1].part ] ) {

					context = Expr.find["ID"]( token.captures[0].replace( rbackslash, "" ), context, xml )[0];
					if ( !context ) {
						return results;
					}

					selector = selector.slice( tokens.shift().string.length );
				}

				findContext = ( (match = rsibling.exec( tokens[0].string )) && !match.index && context.parentNode ) || context;

				// Reduce the set if possible
				lastToken = "";
				for ( i = tokens.length - 1; i >= 0; i-- ) {
					token = tokens[i];
					type = token.part;
					lastToken = token.string + lastToken;
					if ( Expr.relative[ type ] ) {
						break;
					}
					if ( Expr.order.test(type) ) {
						elements = Expr.find[ type ]( token.captures[0].replace( rbackslash, "" ), findContext, xml );
						if ( elements == null ) {
							continue;
						} else {
							selector = selector.slice( 0, selector.length - lastToken.length ) +
								lastToken.replace( matchExpr[ type ], "" );

							if ( !selector ) {
								push.apply( results, slice.call(elements, 0) );
							}

							break;
						}
					}
				}
			}

			// Only loop over the given elements once
			if ( selector ) {
				matcher = compile( selector, context, xml );
				dirruns = matcher.dirruns++;
				if ( elements == null ) {
					elements = Expr.find["TAG"]( "*", (rsibling.test( selector ) && context.parentNode) || context );
				}

				for ( i = 0; (elem = elements[i]); i++ ) {
					cachedruns = matcher.runs++;
					if ( matcher(elem) ) {
						results.push( elem );
					}
				}
			}

			return results;
		}

		if ( document.querySelectorAll ) {
			(function() {
				var disconnectedMatch,
					oldSelect = select,
					rescape = /'|\\/g,
					rattributeQuotes = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,
					rbuggyQSA = [],
					// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
					// A support test would require too much code (would include document ready)
					// just skip matchesSelector for :active
					rbuggyMatches = [":active"],
					matches = docElem.matchesSelector ||
						docElem.mozMatchesSelector ||
						docElem.webkitMatchesSelector ||
						docElem.oMatchesSelector ||
						docElem.msMatchesSelector;

				// Build QSA regex
				// Regex strategy adopted from Diego Perini
				assert(function( div ) {
					// Select is set to empty string on purpose
					// This is to test IE's treatment of not explictly
					// setting a boolean content attribute,
					// since its presence should be enough
					// http://bugs.jquery.com/ticket/12359
					div.innerHTML = "<select><option selected=''></option></select>";

					// IE8 - Some boolean attributes are not treated correctly
					if ( !div.querySelectorAll("[selected]").length ) {
						rbuggyQSA.push( "\\[" + whitespace + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)" );
					}

					// Webkit/Opera - :checked should return selected option elements
					// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
					// IE8 throws error here (do not put tests after this one)
					if ( !div.querySelectorAll(":checked").length ) {
						rbuggyQSA.push(":checked");
					}
				});

				assert(function( div ) {

					// Opera 10-12/IE9 - ^= $= *= and empty values
					// Should not select anything
					div.innerHTML = "<p test=''></p>";
					if ( div.querySelectorAll("[test^='']").length ) {
						rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:\"\"|'')" );
					}

					// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
					// IE8 throws error here (do not put tests after this one)
					div.innerHTML = "<input type='hidden'/>";
					if ( !div.querySelectorAll(":enabled").length ) {
						rbuggyQSA.push(":enabled", ":disabled");
					}
				});

				rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );

				select = function( selector, context, results, seed, xml ) {
					// Only use querySelectorAll when not filtering,
					// when this is not xml,
					// and when no QSA bugs apply
					if ( !seed && !xml && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
						if ( context.nodeType === 9 ) {
							try {
								push.apply( results, slice.call(context.querySelectorAll( selector ), 0) );
								return results;
							} catch(qsaError) {}
						// qSA works strangely on Element-rooted queries
						// We can work around this by specifying an extra ID on the root
						// and working up from there (Thanks to Andrew Dupont for the technique)
						// IE 8 doesn't work on object elements
						} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
							var groups, i, len,
								old = context.getAttribute("id"),
								nid = old || expando,
								newContext = rsibling.test( selector ) && context.parentNode || context;

							if ( old ) {
								nid = nid.replace( rescape, "\\$&" );
							} else {
								context.setAttribute( "id", nid );
							}

							groups = tokenize(selector, context, xml);
							// Trailing space is unnecessary
							// There is always a context check
							nid = "[id='" + nid + "']";
							for ( i = 0, len = groups.length; i < len; i++ ) {
								groups[i] = nid + groups[i].selector;
							}
							try {
								push.apply( results, slice.call( newContext.querySelectorAll(
									groups.join(",")
								), 0 ) );
								return results;
							} catch(qsaError) {
							} finally {
								if ( !old ) {
									context.removeAttribute("id");
								}
							}
						}
					}

					return oldSelect( selector, context, results, seed, xml );
				};

				if ( matches ) {
					assert(function( div ) {
						// Check to see if it's possible to do matchesSelector
						// on a disconnected node (IE 9)
						disconnectedMatch = matches.call( div, "div" );

						// This should fail with an exception
						// Gecko does not error, returns false instead
						try {
							matches.call( div, "[test!='']:sizzle" );
							rbuggyMatches.push( matchExpr["PSEUDO"].source, matchExpr["POS"].source, "!=" );
						} catch ( e ) {}
					});

					// rbuggyMatches always contains :active, so no need for a length check
					rbuggyMatches = /* rbuggyMatches.length && */ new RegExp( rbuggyMatches.join("|") );

					Sizzle.matchesSelector = function( elem, expr ) {
						// Make sure that attribute selectors are quoted
						expr = expr.replace( rattributeQuotes, "='$1']" );

						// rbuggyMatches always contains :active, so no need for an existence check
						if ( !isXML( elem ) && !rbuggyMatches.test( expr ) && (!rbuggyQSA || !rbuggyQSA.test( expr )) ) {
							try {
								var ret = matches.call( elem, expr );

								// IE 9's matchesSelector returns false on disconnected nodes
								if ( ret || disconnectedMatch ||
										// As well, disconnected nodes are said to be in a document
										// fragment in IE 9
										elem.document && elem.document.nodeType !== 11 ) {
									return ret;
								}
							} catch(e) {}
						}

						return Sizzle( expr, null, null, [ elem ] ).length > 0;
					};
				}
			})();
		}

		// Deprecated
		Expr.setFilters["nth"] = Expr.setFilters["eq"];

		// Back-compat
		Expr.filters = Expr.pseudos;

		return Sizzle;

	})( window );
	

	var ready = false;
	lr.ready = function(fn){

		if(ready) fn(lr);

		var exec = false,
			func = function(){
				if(exec) return;
				fn(lr);
				exec = ready = true;
			}

		if(document.readyState){
			if(document.readyState == 'loaded' || document.readyState == 'complete') func();
			else
				var s = setInterval(function(){
					if(document.readyState == 'loaded' || document.readyState == 'complete') func();
				}, 50);
		}
		else {
			window.addEventListener('load', func, false);
			document.addEventListener('DOMContentLoaded', func, false);
		}

	}


	lr.element = lr.class({

		initialize:function(element, selector){
			if(selector) this.selector;
			if(lr.isNumber(element.length)){
				for(var i = 0, l = this.length = element.length; i < l; i++)
					this[i] = element[i];
			}
			else if(element instanceof DocumentFragment)
				for(var i = 0, l = this.length = element.childNodes.length; i < l; i++)
					this[i] = element.childNodes[i];
			else
				this.length = 1,
				this[0] = element;
		},

		extend:{
			create:function(text){

				var div = document.createElement('div');
				div.innerHTML = text;
				text = document.createDocumentFragment();
				lr.each(arrayProto.slice.call(div.childNodes), function(v){
					text.appendChild(v);
				});
				return text;

			}
		},

		selector:'',
		each:function(fn){
			for(var i = 0, l = this.length; i < l; i++)
				fn.call(this[i], i, this);
			return this;
		},
		map:function(fn){
			var arr = [];
			for(var i = 0, l = this.length; i < l; i++)
				arr.push( fn.call(this[i], i, this) );
			return arr;
		},
		size:function(){ return this.length },
		get:function(){
			return this.map(function(){ return this; });
		},

		getFragment:function(){
			var frag = document.createDocumentFragment();
			this.each(function(){ frag.appendChild(this) });
			return frag;
		},

		html:function(code){
			return code != null ? this.each(function(){ this.innerHTML = code }) : this[0].innerHTML;
		},

		text:function(text){
			return text != null ? this.each(function(){ this.textContent = text }) : this[0].textContent;
		},
		
		append:function(code){
			return this.each(function(){ lr.isString(code) ? this.insertAdjacentHTML('beforeEnd', code) : this.appendChild(code) });
		},
		
		prepend:function(code){
			return this.each(function(){ lr.isString(code) ? this.insertAdjacentHTML('afterBegin', code) : this.insertBefore(code, this.childNodes[0]) });
		},
		
		before:function(code){
			return this.each(function(){ lr.isString(code) ? this.insertAdjacentHTML('beforeBegin', code) : this.parentNode.insertBefore(code, this) });
		},
		
		after:function(code){
			return this.each(function(){ lr.isString(code) ? this.insertAdjacentHTML('afterEnd', code) : this.parentNode.insertBefore(code, this.nextSibling) });
		},
		
		replace:function(code){
			code = lr.isString(code) ? lr.element.create(code) : code;
			return this.each(function(){ this.parentNode.replaceChild( code, this ) });
		},
		
		replaceAll:function(element){
			element = lr(element);
			var that = this;
			element.each(function(){
				lr(this).replace(that.clone().getFragment());
			});
		},
		
		clone:function(){
			return new lr.element( this.map(function(){ return this.cloneNode(true) }) );
		},
		
		empty:function(){
			return this.html('');
		},
		
		remove:function(){
			return this.each(function(){ this.parentNode.removeChild(this) });
		},
		
		appendTo:function(element){
			element = lr(element)[0];
			return this.each(function(){ element.appendChild(this) });
		},
		
		prependTo:function(element){
			element = lr(element)[0];
			var child = element.childNodes[0];
			return this.each(function(){ element.insertBefore(this, child) });
		},
		
		insertBefore:function(element){
			element = lr(element)[0];
			return this.each(function(){
				element.parentNode.insertBefore(this, element);
			});
		},
		
		insertAfter:function(element){
			element = lr(element)[0];
			return this.each(function(){
				element.parentNode.insertBefore(this, element.nextSibling)
			})
		},

		wrap:function(element){
			element = lr(element);
			return this.each(function(){
				var cl = element.clone().insertBefore(this);
				cl.append(this);
			});
		},

		wrapAll:function(element){
			element = lr(element);
			return this.each(function(i){
				if(i == 0) element = element.clone().insertBefore(this);
				element.append(this);
			});
		},

		wrapInner:function(element){
			element = lr(element);
			return this.each(function(){
				var elem = element.clone(); //.prependTo(this);
				for(var i = 0, l = this.childNodes.length; i < l; i++)
					elem.append(this.childNodes[i]);
				elem.appendTo(this);
			});
		},

		// traversing
		slice:function(){
			var t  = lr(arrayProto.slice.apply(this, arguments));
			t.self = this;
			return t;
		},

		eq:function(n){
			return this.slice(n, n+1);
		},

		first:function(){ return this.slice(0,1); },

		last:function(){ return this.slice(this.length-1, this.length); },

		is:function(selector){
			return this.filter(selector).length > 0;
		},

		has:function(selector){
			var elements = [];
			this.each(function(){
				if( lr.find(selector, this).length > 0 )
					elements.push(this);
			});
			return lr(elements);
		},

		filter:function(selector){
			var elements = [];
			this.each(function(){
				var temp = lr.find(selector, this.parentNode);
				for(var i = 0, l = temp.length; i < l; i++)
					if(temp[i] == this)
						elements.push(this);
			});
			return lr(elements);
		},

		not:function(selector){
			var elements = [];
			this.each(function(){
				var temp = lr.find(selector, this.parentNode),
					is   = true;
				for(var i = 0, l = temp.length; i < l; i++)
					if(temp[i] == this)
						is = false;
				if(is)
					elements.push(this);
			});
			return lr(elements);
		},

		add:function(selector, context){
			selector = lr.find(selector, context);
			for(var i = 0, l = selector.length; i < l; i++)
				this[this.length++] = selector[i];
			return this;
		},

		children:function(){},

		contents:function(){},

		find:function(selector){
			var elements = [];
			this.each(function(){
				elements = elements.concat( lr.find(selector, this) );
			});
			return lr(elements);
		},

		next:function(){},

		nextAll:function(){},

		prev:function(){},

		prevAll:function(){},

		parent:function(){},

		parents:function(){},

		siblings:function(){},

		andSelf:function(){},

		end:function(){},



	});

	
	lr.anim = function(from,to,dur,ease){ // alias for creating anim object without "new" operator
		return new lr.anim.class(from,to,dur,ease);
	}

	lr.anim.class = lr.class({

		initialize : function(from,to,dur,ease){
			this.from  = from;
			this.delta = to - from;
			this.dur   = dur || 500;
			this.ease  = ease || 'linear';
		},

		start : function(fn){

			var delta  = this.delta,
				from   = this.from,
				dur    = this.dur,
				ease   = lr.anim.easing[ this.ease ] || lr.argument(0),
				start  = +new Date,
				finish = start + dur,
				interval;

			interval = this.interval = setInterval(function(){

				var time  = +new Date,
					frame = ease( time > finish ? 1 : (time - start) / dur );

				fn(from + delta * frame, frame);

				if(time > finish)
					clearInterval(interval)

			}, 10);

			return this;

		},

		stop : function(){
			clearInterval(this.interval);
			return this;
		}

	});

	lr.anim.easing = {
		
		linear : lr.argument(0),
		swing  : function(n){ return (-Math.cos(n*Math.PI)/2) + 0.5 },
		spring : function(n){ return 1 - (Math.cos(n * 4.5 * Math.PI) * Math.exp(-n * 6)) },
		pulse  : function(n){ return (-Math.cos((n*((5)-.5)*2)*Math.PI)/2) + .5 },
		wobble : function(n){ return (-Math.cos(n*Math.PI*(9*n))/2) + 0.5 },
		flicker : function(n){ return lr.anim.easing.swing((n += (Math.random()-0.5)/5) < 0 ? 0 : n > 1 ? 1 : n) }, // or Math.pow(n, Math.cos(Math.random()))
		mirror : function(n){ return lr.anim.easing.swing(n > 0.5 ? n * 2 : 1-(n-0.5)*2) },
		back   : function(n){ return -n },
		return : function(n){ return 1-n },
		futIn  : function(n){ return Math.pow(n, n * 10) },
		futOut : function(n){ return Math.pow(n, n) },

		easeOut:function(n){ return Math.sin(n * Math.PI / 2) },
		easeOutStrong:function(n){ return n == 1 ? 1 : 1 - Math.pow(2, -10*n) },
		easeIn:function(n){ return Math.pow(n, 2) },
		easeInStrong:function(n){ return n == 0 ? 0 : Math.pow(2, 10 * (n-1)) },
		quadIn:function(n){ return Math.pow(n, 2) },
		quadOut:function(n){ return n * (n - 2) * -1; },
		quadInOut:function(n){
			n *= 2;
			if(n < 1) return Math.pow(n, 2) / 2;
			return -1 * ((--n) * (n - 2) - 1) / 2;
		},
		cubicIn:function(n){ return Math.pow(n, 3) },
		cubicOut:function(n){ return Math.pow(n - 1, 3) + 1 },
		cubicInOut:function(n){
			n *= 2;
			if(n < 1) return Math.pow(n, 3) / 2;
			n -= 2;
			return (Math.pow(n,3) + 2) / 2;
		},
		quartIn:function(n){ return Math.pow(n,4) },
		quartOut:function(n){ return -1 * (Math.pow(n - 1, 4) - 1) },
		quartInOut:function(n){
			n *= 2;
			if(n < 1) return Math.pow(n, 4) / 2;
			n -= 2;
			return -0.5 * (Math.pow(n, 4) - 2);
		},
		quintIn:function(n){ return Math.pow(n, 5) },
		quintOut:function(n){ return Math.pow(n - 1, 5) + 1 },
		quintInOut:function(n){
			n *= 2;
			if(n < 1) return Math.pow(n, 5) / 2;
			n -= 2;
			return (Math.pow(n, 5) + 2) / 2;
		},
		sineIn:function(n){ return -1 * Math.cos(n * pi) + 1 },
		sineOut:function(n){ return Math.sin(n * pi) },
		sineInOut:function(n){ return -1 * (Math.cos(Math.PI * n) -1) / 2 },
		expoIn:function(n){ return (n==0) ? 0 : Math.pow(2, 10 * (n - 1)) },
		expoOut:function(n){ return (n==1) ? 1 : (-1 * Math.pow(2, -10 * n) + 1) },
		expoInOut:function(n){
			if(n == 0 || n == 1) return n;
			n *= 2;
			if(n < 1) return Math.pow(2, 10 * (n - 1)) / 2;
			--n;
			return (-1 * Math.pow(2, -10 * n) + 2) / 2;
		},
		circIn:function(n){ return -1 * (Math.sqrt(1 - Math.pow(n, 2)) - 1) },
		circOut:function(n){
			n -= 1;
			return Math.sqrt(1 - Math.pow(n, 2));
		},
		circInOut:function(n){
			n *= 2;
			if(n < 1) return -1 / 2 * (Math.sqrt(1 - Math.pow(n, 2)) - 1);
			n -= 2;
			return 1 / 2 * (Math.sqrt(1 - Math.pow(n, 2)) + 1);
		},
		backIn:function(n){
			return Math.pow(n, 2) * ((1.70158 + 1) * n - 1.70158);
		},
		backOut:function(n){
			n -= 1;
			return Math.pow(n, 2) * ((1.70158 + 1) * n + 1.70158) + 1;
		},
		backInOut:function(n){
			n *= 2;
			if(n < 1) return (Math.pow(n, 2) * (b * n - a)) / 2;
			n -= 2;
			return (Math.pow(n, 2) * (b * n + a) + 2) / 2;
		},
		elasticIn:function(n){
			if(n == 0 || n == 1) return n;
			n -= 1;
			return -1 * Math.pow(2, 10 * n) * Math.sin((n - 0.075) * (2 * Math.PI) / 0.3);
		},
		elasticOut:function(n){
			if(n == 0 || n == 1) return n;
			return Math.pow(2, -10 * n) * Math.sin((n - 0.075) * (2 * Math.PI) / 0.3) + 1;
		},
		elasticInOut:function(n){
			if(n == 0 || n == 1) return n;
			n *= 2;
			if(n < 1){
				n -= 1;
				return -0.5 * (Math.pow(2, 10 * n) * Math.sin((n - d) * (2 * Math.PI) / c));
			}
			n -= 1;
			return 0.5 * (Math.pow(2, -10 * n) * Math.sin((n - d) * (2 * Math.PI) / c)) + 1;
		},
		bounceIn:function(n){ return (1 - lr.anim.easing.bounceOut(1 - n)) },
		bounceOut:function(n){
			var l;
			if(n < (1 / 2.75)){
				l= 7.5625 * Math.pow(n,2);
			}
			else{ // упростить!
				if(n < (2 / 2.75)){
					n -= (1.5 / 2.75);
					l = 7.5625 * Math.pow(n, 2) + 0.75;
				}
				else{
					if(n < (2.5 / 2.75)){
						n -= (2.25 / 2.75);
						l = 7.5625 * Math.pow(n, 2) + 0.9375;
					}
					else{
						n -= (2.625 / 2.75);
						l = 7.5625 * Math.pow(n, 2) + 0.984375;
					}
				}
			}
			return l;
		},
		bounceInOut:function(n){
			if(n < 0.5) return lr.anim.easing.bounceIn(n * 2) / 2;
			return (lr.anim.easing.bounceOut(n * 2 - 1) / 2) + 0.5;
		},
		bouncePast: function (pos) {
			if (pos < (1 / 2.75)) {
				return (7.5625 * pos * pos);
			}
			else if (pos < (2 / 2.75)) {
				return 2 - (7.5625 * (pos -= (1.5 / 2.75)) * pos + .75);
			} else if (pos < (2.5 / 2.75)) {
				return 2 - (7.5625 * (pos -= (2.25 / 2.75)) * pos + .9375);
			} else {
			return 2 - (7.5625 * (pos -= (2.625 / 2.75)) * pos + .984375);
			}
		}

	};

	return lr;

 })(window);