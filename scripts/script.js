/*jslint sloppy: true, white: true*/
if(!NodeList.prototype.forEach)
{
	NodeList.prototype.forEach = function(func) {
		Array.prototype.forEach.call(this, func);
	};
}

if(!window.Map)
{
	window.Map = function(){
		var collection = {},
			me = this,
			_size = 0;
		
		me.set = function(key, value){
			if(!collection[key])
				_size++;
			collection[key] = value;
		}
		
		me.get = function(key){
			return collection[key];
		}
		
		me.has = function(key){
			return collection.hasOwnProperty(key);
		}
		
		me.delete = function(key){
			if(me.has(key)){
				delete collection[key];
				return true;
			}
			return false;
		}
		
		Object.defineProperty(me, 'size', {
							   get: function(){
									return _size;
							   },
                               enumerable : true});	
		
		Object.defineProperty(me, 'keys', {
							   get: function(){
								   var k = [];
								   for(b in collection)
									   k.push(b);
									
								   return k;
							   },
                               enumerable : true});			
		
		Object.defineProperty(me, 'values', {
							   get: function(){
								   var k = [];
								   for(b in collection)
									   k.push(collection[b]);
									
								   return k;
							   },
                               enumerable : true});					
		
	}
}

if(!navigator.getUserMedia)
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

if(!window.AudioContext)
	window.AudioContext = window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext;

var draggingCommand;

var myAudio = new function() {
	var toolboxItems = {}
		, wCanvas;
	
 	 function init() {	 
		 var toolboxControls = document.querySelectorAll("#toolbox .controls > li");
		if(toolboxControls) {
			toolboxControls.forEach(function(control, index) {
				toolboxItems[control.dataset.action] = new ToolboxItem(control);
			});
		}
		 		 
		 wCanvas = new WorkFlowCanvas(document.getElementById('workflow'), toolboxItems);
	}
	
	window.addEventListener('load', init);
}();