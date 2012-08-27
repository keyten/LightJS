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


 	var objProto = Object.prototype;

 	lr.each = function(obj, fn){

 		if(+obj.length == obj.length){
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


 	return lr;

 })(window);