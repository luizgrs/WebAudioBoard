var MyAudioNode = function(type, flow){
	var me = this
		,myType = type
		,element
		,myId = new Date().getTime()
		,endPoint
		,startPoint
		,audioFlow = flow
		,inputConn
		,outputConn
		,audioNode
		,divConfig;
	
	me.getMyType = function(){ return myType; };
	me.getElement = function(){ return element; };
	me.getMyId = function(){ return myId; };
	me.getNode = function(){ return audioNode; };
	me.getOutputConnection = function(){ return outputConn; };
	me.isReady = function(){ return true;   };
	
	function init(){	
		audioNode = new MyAudioNode.Config[myType](flow.getAudioContext());
		
		if(audioNode.getNodeType() == MyAudioNode.NodeTypes.SOURCE)
			audioNode.onended = audioNodePlaybackEnded;
		createNodeUI();
		
		if(audioNode.setSpecificUI){
			audioNode.setSpecificUI(element);
		}
	}
	
	function isPlaying(){
		return element.classList.contains('playing');
	}
	
	function audioNodePlaybackEnded(){
		if(isPlaying())
			me.Stop();
	}
	
	me.Play = function(){
		if(audioNode.getNodeType() == MyAudioNode.NodeTypes.SOURCE){
			audioNode.requestPlay(startPlaying, playingFailed);
		}
		else
			throw 'only Source nodes can play';
	}
	
	me.Stop = function(){
		if(audioNode.getNodeType() == MyAudioNode.NodeTypes.SOURCE && isPlaying()){		
			element.classList.remove('playing');	
			
			if(audioNode.stop && audioNode.isPlaying())
				audioNode.stop();

			var conn = outputConn;
			while(conn)
			{
				conn.getElement().classList.remove('playing');
				if(conn.getTo())
					conn = conn.getTo().getOutputConnection();			
			}
		}
	}
	
	function playingFailed(){
		console.log(arguments);	
		throw 'start playing failure';
	}
	
	function startPlaying(){
		element.classList.add('playing');
		
		var conn = outputConn;
		while(conn)
		{
			conn.getElement().classList.add('playing');
			if(conn.getTo())
				conn = conn.getTo().getOutputConnection();			
		}
			
	}
	
	me.Move = function(top, left){
		element.style.top = top;
		element.style.left = left;
		
		if(outputConn)
			outputConn.moveStartPoint();
		
		if(inputConn)
			inputConn.moveEndpoint();
	}
	
	me.connect = function(toNode){	
		if(!outputConn.isConnected())
		{
			fireConnectingEnd(outputConn);
			outputConn.connect(toNode);
			audioNode.connect(toNode.getNode());
		}
		else
			throw 'node is already connected';
	};	
	
	function playStopButtonClick(e){
		if(isPlaying()){
			me.Stop();
		}
		else
			me.Play();
	}
	
	function createNodeUI(){
		element = document.createElement('div');
		element.setAttribute('draggable', 'true');
		element.classList.add('node');
		element.classList.add(myType);
		element.innerText = 'Test - ' + myType;				
		
		element.addEventListener('dragstart', moveNodeStart);
		element.addEventListener('dragend', moveNodeEnd);
		element.addEventListener('dragenter', dragEnterNode);
		element.addEventListener('dragover', dragOverNode);
		element.addEventListener('dragleave', dragLeaveNode);
		element.addEventListener('drop', dropConnection);
		
		var divButtons = document.createElement('div');
		divButtons.classList.add('buttons-list');
		divButtons.classList.add('cf');
		element.appendChild(divButtons);
		
		divConfig = document.createElement('div');
		divConfig.classList.add('config-list');
		element.appendChild(divConfig);
		
		if(audioNode.getOutputsCount() > 0)
		{
			startPoint = document.createElement('div');
			startPoint.setAttribute('draggable', 'true');
			startPoint.addEventListener('dragstart', moveConnectionStartPointStart);
			startPoint.addEventListener('dragend', moveConnectionStartPointEnd);
			startPoint.classList.add('startpoint');		
			element.appendChild(startPoint);
		}
		
		if(audioNode.getNodeType() == MyAudioNode.NodeTypes.SOURCE || audioNode.hasConfig)
		{
			var configButton = document.createElement('button');
			configButton.classList.add('icon-gear')
			configButton.classList.add('config-button');
			configButton.addEventListener('click', configButtonClick);
			divButtons.appendChild(configButton);
		}
		
		if(audioNode.getNodeType() == MyAudioNode.NodeTypes.SOURCE){
			var startButton = document.createElement('button');
			startButton.classList.add('play-stop-button');
			startButton.classList.add('icon-button');
			startButton.addEventListener('click', playStopButtonClick);
			
			divButtons.appendChild(startButton);
		}		
	}
	
	function configButtonClick(e){
		var configButton = e.target;
		if(configButton.classList.contains('active'))
		{
			configButton.classList.remove('active');
			divConfig.style.display = 'none';
		}
		else
		{
			configButton.classList.add('active');
			divConfig.style.display = 'block';			
		}
	}
	
	function dropConnection(e){
		element.classList.remove('end-connecting');
		var commands = e.dataTransfer.getData(WorkFlowCanvas.Commands.COMMAND_MIME);
		if(commands)
		{
			commands = commands.split(' ');
			if(commands[0] == WorkFlowCanvas.Commands.CONNECT)
			{
				var outputNode = audioFlow.getNode(commands[1]);
				var conn = audioFlow.getConnection(commands[2]);
				
				outputNode.connect(me);
				conn.addEventListener(AudioConnection.Events.DISCONNECTING, inputConnectionDisconnected);
				inputConn = conn;
			}
		}
		
		draggingCommand = undefined;		
	}
	
	function dragEnterNode(e){
		if(canReceiveConnection())
			element.classList.add('end-connecting');
	}
	
	function dragOverNode(e){
		if(canReceiveConnection())
		{
			element.classList.add('end-connecting');
			e.dataTransfer.dropEffect = 'link';
			e.preventDefault();
		}			
	}
	
	function canReceiveConnection()
	{
		return draggingCommand 
		 		&& draggingCommand.indexOf(WorkFlowCanvas.Commands.CONNECT + ' ') == 0
				&& !element.classList.contains('start-connecting')
				&& audioNode.getInputsCount() > 0;
	}
	
	function dragLeaveNode(e){
		element.classList.remove('end-connecting');
	}	
	
	function moveNodeStart(e){
		element.classList.add('dragging');
		
		draggingCommand = WorkFlowCanvas.Commands.MOVE + ' ' + myId + ' ' + e.layerX + ' ' + e.layerY;
		e.dataTransfer.setData(WorkFlowCanvas.Commands.COMMAND_MIME, draggingCommand);
	}
	
	function moveNodeEnd(e){
		element.classList.remove('dragging');
	}
	
	function moveConnectionStartPointStart(e){
		e.stopPropagation();
		
		element.classList.add('start-connecting');
		
		if(!outputConn)
		{
			outputConn = audioFlow.createConnection(me);
			outputConn.addEventListener(AudioConnection.Events.DISCONNECTING, outputConnectionDisconnected);
		}
		else
			outputConn.disconnect();
		
		draggingCommand = WorkFlowCanvas.Commands.CONNECT + ' ' + myId + ' ' + outputConn.getId();
		e.dataTransfer.setData(WorkFlowCanvas.Commands.COMMAND_MIME, draggingCommand);		
		e.dataTransfer.effectAllowed = 'link';
		
		var connectingStart = new Event('connectingstart');
		connectingStart.connection = outputConn;
		element.dispatchEvent(connectingStart);
	}
	
	
	function fireConnectingEnd(conn){
		var connectingEnd = new Event('connectingend');
		connectingEnd.connection = outputConn;
		element.dispatchEvent(connectingEnd);		
	}
	
	function moveConnectionStartPointEnd(){
		element.classList.remove('start-connecting');
		fireConnectingEnd(outputConn);
		
		if(!outputConn.isConnected())
		{
			outputConn.destroy();
			outputConn = undefined;
		}
	}
	
	function inputConnectionDisconnected(e){
		inputConn.removeEventListener(AudioConnection.Events.DISCONNECTING, inputConnectionDisconnected);
		inputConn = undefined;
	}
	
	function outputConnectionDisconnected(e){
		if(isPlaying())
			me.Stop();
		else if(audioNode.disconnect)
			audioNode.disconnect();
	}
	
	me.addEventListener = function(){
		element.addEventListener.apply(element, arguments);
	}	
	
	init();
}

MyAudioNode.NodeTypes = {
	SOURCE: 0
	,DESTINATION: 1
}


MyAudioNode.Config = {};
MyAudioNode.Config['source-mic'] = function(audioContext){
		var me = this
			,inputs = 0
			,outputs = 1
			,webAudioNode
			,playing = false
			,targetAudioNode	
			,ac = audioContext;

		me.getOutputsCount = function(){ return outputs; };
		me.getInputsCount = function(){ return inputs; };
		me.getWebAudioNode = function(){ return webAudioNode; };
		me.isPlaying = function(){ return playing; };
		me.getNodeType = function(){ return MyAudioNode.NodeTypes.SOURCE; };
	
		me.requestPlay = function(sucess, failure){
			if(!targetAudioNode)
				throw 'there is no node to connect to'
			
			navigator.getUserMedia({ audio: true }
					   ,function(stream){
						   webAudioNode = ac.createMediaStreamSource(stream);
						   webAudioNode.connect(targetAudioNode.getWebAudioNode());
						   playing = true; sucess(); }
					   ,failure);	
		};
	
		me.stop = function(node, myAudioNode){
			if(webAudioNode)
			{
				playing = false;
				me.disconnect();
			}
		};
	
		me.setSpecificUI = function(){
			
		}
		
		me.connect = function(target){
			targetAudioNode = target;
		}
		
		me.disconnect = function(){
			if(webAudioNode)
			{
				webAudioNode.mediaStream.stop();
				webAudioNode.disconnect();

				delete webAudioNode;
				webAudioNode = undefined;
				
				if(playing)
					me.stop();				
			}
		}
};

MyAudioNode.Config['source-file'] = function(audioContext){
		var me = this
			,inputs = 0
			,outputs = 1
			,webAudioNode
			,playing = false
			,targetAudioNode	
			,ac = audioContext
			,inputFile
			,audioBuffer
			,offsetConfig
			,delayConfig
			,playTime;

		me.getOutputsCount = function(){ return outputs; };
		me.getInputsCount = function(){ return inputs; };
		me.getWebAudioNode = function(){ return webAudioNode; };
		me.isPlaying = function(){ return playing; };
		me.getNodeType = function(){ return MyAudioNode.NodeTypes.SOURCE; };
	
		me.requestPlay = function(sucess, failure){
			if(!targetAudioNode)
				throw 'there is no node to connect to'
			
			playing = true;
			webAudioNode.start(ac.currentTime + delayConfig.value, offsetConfig.value, durationConfig.value);
			sucess();
		};
	
		me.stop = function(){
			if(webAudioNode)
			{
				if(playing)
					webAudioNode.stop();				
				
				playing = false;
				
				//in order to play again we have to recreate the node
				recreateWebAudioNode();
			}
		};
	
		me.setSpecificUI = function(element){
			buttonsList = element.querySelector('.buttons-list');
			
			var selectFileButton = document.createElement('button');
			selectFileButton.classList.add('icon-file');
			selectFileButton.addEventListener('click', selectFile);
			buttonsList.insertBefore(selectFileButton, buttonsList.childNodes[0]);
			
			inputFile = document.createElement('input');
			inputFile.setAttribute('type', 'file');
			inputFile.style.display = 'none';
			inputFile.setAttribute('accept', MyAudioNode.Config['source-file'].AllowedAudioTypes.join(','));
			inputFile.addEventListener('change', fileSelected);
			element.appendChild(inputFile);
			
			
			
			var divConfig = element.querySelector('.config-list');
			offsetConfig = document.createElement('x-range-config');
			offsetConfig.textContent = 'Start Offset:';
			offsetConfig.addEventListener('change', offsetConfigChanged);
			divConfig.appendChild(offsetConfig);	
			
			delayConfig = document.createElement('x-range-config');
			delayConfig.textContent = 'Delay Playback:';
			delayConfig.max = 9999999;
			divConfig.appendChild(delayConfig);
			
			durationConfig = document.createElement('x-range-config');
			durationConfig.textContent = 'Playback Duration:';
			divConfig.appendChild(durationConfig);
		}
		
		function offsetConfigChanged(e){
			var maxPlaybackDuration = offsetConfig.max - offsetConfig.value;
			if(durationConfig.value > maxPlaybackDuration)
				durationConfig.value = maxPlaybackDuration;
			
			var isMax = durationConfig.value == durationConfig.max;
			
			durationConfig.max = maxPlaybackDuration;
			
			if(isMax)
				durationConfig.value = durationConfig.max;
				
		}
		
		function fileSelected(e){
			if(inputFile.files)
			{
				var reader = new FileReader();
				reader.onloadend = fileLoaded;
				reader.onerror = fileLoadError;
				reader.readAsArrayBuffer(inputFile.files[0]);
			}
		}
	
		function fileLoadError(){
			console.log(arguments);
		}
	
		function decodeAudioFailed(){
			console.log(arguments);
		}
	
		function recreateWebAudioNode(){
			if(webAudioNode)
			{
				webAudioNode.disconnect();
				delete webAudioNode;
			}
				
			webAudioNode = ac.createBufferSource();
			webAudioNode.onended = playbackEnded;			
  			webAudioNode.buffer = audioBuffer; 
				
			if(targetAudioNode)
				webAudioNode.connect(targetAudioNode.getWebAudioNode());
		}
	
		function playbackEnded(e){
			playing = false;
			me.stop();
			
			if(me.onended)
				me.onended();
		}
	
		function fileLoaded(e){
			ac.decodeAudioData(this.result, function(fileAudioBuffer) {
				audioBuffer = fileAudioBuffer;
      			
				var rangeMax = Math.floor(audioBuffer.duration);
				if(offsetConfig.value > rangeMax)
					offsetConfig.value = rangeMax;
				
				if(durationConfig.value > rangeMax)
					durationConfig.value = rangeMax;				
				
				var maxPlayback = durationConfig.value == durationConfig.max;
				
				durationConfig.max = rangeMax;
				offsetConfig.max = rangeMax;
				
				if(maxPlayback)
					durationConfig.value = rangeMax;
				
				recreateWebAudioNode();
				
				console.log('file load complete');
    		}, decodeAudioFailed);
		}
		
		function selectFile(){
			inputFile.click();
		}
		
		me.connect = function(target){
			targetAudioNode = target;
			
			if(webAudioNode)
				webAudioNode.connect(targetAudioNode.getWebAudioNode());
		}
		
		me.disconnect = function(){
			if(webAudioNode)
			{
				webAudioNode.disconnect();

				if(playing)
					me.stop();				
			}
		}
		
		me.onended = undefined;
};
MyAudioNode.Config['source-file'].AllowedAudioTypes = function(){
	var types = ['audio/wave', 'audio/wav', 'audio/x-wav', 'audio/x-pn-wav', "audio/vnd.wave"
												,'audio/ogg',"audio/vorbis"
												,'audio/webm'
												,'audio/mpeg', 'audio/mp3', "audio/x-mp3", "audio/mpeg3"
												,"audio/mp4", "audio/x-m4a"
												,"audio/aac"
												,"audio/aiff"
												,"audio/amr"
												,"audio/basic"
												,"audio/midi"
												,"audio/x-ms-wma"
												,"audio/vnd.rn-realaudio"];
	
	var acceptedTypes = [];
	var testAudio = document.createElement('audio');
	types.forEach(function(mime){
		if(testAudio.canPlayType(mime))
			acceptedTypes.push(mime);
	});
	
	return acceptedTypes;
}();
	




MyAudioNode.Config['dest-speaker'] = function(audioContext){
			var me = this
			,inputs = 1
			,outputs = 0
			,ac = audioContext
			,webAudioNode = ac.destination;

		me.getOutputsCount = function(){ return outputs; };
		me.getInputsCount = function(){ return inputs; };
		me.getWebAudioNode = function(){ return webAudioNode; };
	
		me.getNodeType = function(){ return MyAudioNode.NodeTypes.DESTINATION; };
};