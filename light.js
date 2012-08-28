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


 	return lr;

 })(window);