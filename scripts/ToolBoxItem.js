var ToolboxItem = function(li){
	var element = li;
	var me = this;
	element.dataToolBoxItem = me;
	
	function init(){
		element.setAttribute('draggable', true);
		element.addEventListener("dragstart", controlStartDrag);
		element.addEventListener("dragend", controlEndDrag);		
	}
	
	function controlStartDrag(e) {
		element.classList.add('dragging');
		
		draggingCommand = WorkFlowCanvas.Commands.CREATE + ' ' + element.dataset.action;
		e.dataTransfer.setData(WorkFlowCanvas.Commands.COMMAND_MIME, draggingCommand);
	}
	
	function controlEndDrag(e) {
		element.classList.remove('dragging');		
	}
	
	me.CreateNode = function(flow){		
		return new MyAudioNode(element.dataset.action, flow);
	}
	
	init();
};
