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

	lr.find = (function(){


		
	});

	return lr;

 })(window);