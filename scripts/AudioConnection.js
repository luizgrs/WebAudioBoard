var AudioConnection = function(nodeFrom, aFlow){
	var me = this,
		from = nodeFrom,
		audioFlow = aFlow,
		myId = new Date().getTime(),
		to,
		element;

	function init(){
		createUI();
		
		element.myAudioConn = me;
		
	}
	
	function createUI(){
		element = AuxHelper.createSvgElement('line');
	
		element.classList.add('node-connection');
		element.setAttribute('id', 'node-connection-' + myId);
		
		me.UpdateEndPoints();
	}
	
	me.connect = function(toNode){
		if(to == undefined)
		{
			to = toNode;
			me.moveEndpoint();
		}
	}
	
	me.disconnect = function(){
		if(to){
			
			var e = new Event(AudioConnection.Events.DISCONNECTING);
			element.dispatchEvent(e);
			
			to = undefined;
			me.moveEndpoint();
		}
	}
	
	me.isConnected = function(){
		return to !== undefined;	
	}
	
	me.destroy = function(){
		me.disconnect();
		
		var e = new Event(AudioConnection.Events.DESTROYED);
		e.connection = me;
		element.dispatchEvent(e);
		
		if(element.parentElement)
			element.parentElement.removeChild(element);
		
		delete me;		
	}
	
	me.UpdateEndPoints = function(){
		me.moveStartPoint();	
		me.moveEndpoint();
	};
	
	me.moveStartPoint = function(){
		var start = { x: from.getElement().offsetLeft + from.getElement().offsetWidth,
					  y: from.getElement().offsetTop + (from.getElement().offsetHeight / 2) };
		element.setAttribute('x1', start.x);
		element.setAttribute('y1', start.y);
	}
	
	me.moveEndpoint = function(x,y){
		if(to == undefined){
			x = x || element.getAttribute('x1');
			y = y || element.getAttribute('y1');
		}
		else
		{
			if(x === undefined && y === undefined)
			{
				x = to.getElement().offsetLeft;
				y = to.getElement().offsetTop + (to.getElement().offsetHeight / 2);
			}
			else
				throw "cannot set specific positions to endpoint of a connected connection";
		}
		
		element.setAttribute('x2', x);
		element.setAttribute('y2', y);		
	};
	
	me.getFrom = function(){ return from; };
	me.getTo = function(){ return to; };
	me.getId = function(){ return myId; };
	me.getElement = function(){ return element; };
	
  	me.addEventListener = function(){
		element.addEventListener.apply(element, arguments);
   	}
	
  	me.removeEventListener = function(){
		element.removeEventListener.apply(element, arguments);
   	}	
	
	init();
}

AudioConnection.Events = {
	DISCONNECTING: 'disconnecting',
	DESTROYED: 'destroyed'
}