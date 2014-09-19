var WorkFlowCanvas = function(el, tbIts){
	var element = el
		,me = this
		,toolboxItems = tbIts
		,nodes = new Map()
		,conns = new Map()
		, svg
		,connecting
		,selectedItem
		,audioContext = new AudioContext();
	
	function init(){
		element.addEventListener('dragover', workflowDragOver);
		element.addEventListener('dragleave', workflowDragLeave);
		element.addEventListener("drop", controlDrop);
		element.dataWorkFlowCanvas = me;	
		
		svg = element.querySelector('svg');
	}	
	
	me.getNode = function(id){
		return nodes.get(new Number(id).valueOf());
	}
	
	me.getConnection = function(id){
		return conns.get(new Number(id).valueOf());	
	}
	
	me.createConnection = function(from){
		var newConn = new AudioConnection(from, me);
		svg.appendChild(newConn.getElement());
		
		newConn.addEventListener(AudioConnection.Events.DESTROYED, connectionDestroyed);
		newConn.addEventListener("click", selectConnection);
		conns.set(newConn.getId(), newConn);
		return newConn;
	}	
	
	function selectConnection(e){
		selectItem(e.target );
	}
		   
   function selectItem(item){
		var cl = 'selected';
		if(selectedItem === item)
		{
			item.classList.remove(cl);
			selectedItem = undefined;
		}
		else
		{
			if(selectedItem)
				selectedItem.classList.remove(cl);
			selectedItem = item;
			item.classList.add(cl);
		}
	}
	
	function connectionDestroyed(e){
		conns.delete(e.connection.getId());
	}
	
	function connectingStart(e){
		connecting = e.connection;
	}
	
	function connectingEnd(e){
		connecting = undefined;	
	}
	
	function workflowDragLeave(e){
		if(validDragCommands(draggingCommand))
			element.classList.remove('dragging-over');
	}
	
	function workflowDragOver(e) {
		if(validDragCommands(draggingCommand))
		{
			e.preventDefault();
			element.classList.add('dragging-over');
			e.dataTransfer.dropEffect = 'copy';
		}
		else if(connecting)
		{
			var x = e.layerX
				,y = e.layerY
				,parent = e.target;
			
			while(parent.offsetTop != 0 && parent.offsetLeft != 0){
				y += parent.offsetTop;
				x += parent.offsetLeft;
				parent = parent.offsetParent;
			}
			
			
			
			connecting.moveEndpoint(x, y);
		}				
	}
	
	function validDragCommands(dragCommand){
		return dragCommand && 
				(dragCommand.indexOf(WorkFlowCanvas.Commands.CREATE + ' ') == 0	
				|| dragCommand.indexOf(WorkFlowCanvas.Commands.MOVE + ' ') == 0);
	}

	
	function controlDrop(e) {
		element.classList.remove('dragging-over');
		
		//check drop type
		
		if(e.dataTransfer.files.length == 0)
		{
			var commands = e.dataTransfer.getData(WorkFlowCanvas.Commands.COMMAND_MIME);
			if(commands)
			{
				commands = commands.split(' ');
				var action = commands[0];

				switch(action)
				{
					case WorkFlowCanvas.Commands.CREATE:
						createControlFromToolbox(commands[1], e.y, e.x);
						break;
					case WorkFlowCanvas.Commands.MOVE:
						var node = nodes.get(new Number(commands[1]).valueOf());
						if(node){
							node.Move(e.y - commands[3], e.x - commands[2]);
						}
						break;
				}
			}
		}
		
		draggingCommand = undefined;
	}
	
	function createControlFromToolbox(action, top, left){
		var newNode = toolboxItems[action].CreateNode(me);
		
		newNode.Move(top || 0, left || 0);
		newNode.addEventListener('connectingstart', connectingStart);
		newNode.addEventListener('connectingend', connectingEnd);		
		element.appendChild(newNode.getElement());
		
		nodes.set(newNode.getMyId(), newNode);
	}
	
	me.getAudioContext = function(){ return audioContext; };
	
	init();
};
WorkFlowCanvas.Commands = {
	COMMAND_MIME: 'text/x-internal-commands',
	CREATE: 'create',
	MOVE: 'move',
	CONNECT: 'connect'
};