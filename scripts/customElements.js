var RangeConfigProto = Object.create(HTMLElement.prototype);

RangeConfigProto.createdCallback = function() {
  
	var me = this;
	
	function offsetChanged(e){
		me.value = e.target.value;
		
		me.dispatchEvent(new Event('change'));
		
	};
	
	var min = 0, max = 0;
	
	var shadow = this.createShadowRoot();	
	
	var style = document.createElement('style');
	style.innerText = ":host {display: block;}label{font-weight: bold;} input[type=range]{display:block; width:100%;}input[type=number]{width: 50px;}";
	shadow.appendChild(style);
	
	var range = document.createElement('input');
	range.setAttribute('type', 'range');
	range.setAttribute('id', new Date().getTime());
	range.setAttribute('min', min);
	range.setAttribute('max', max);
	range.value = 0;
	range.addEventListener('change', offsetChanged);

	var label = document.createElement('label');
	label.setAttribute('for', range.id);
	label.appendChild(document.createElement('content'));
	
	shadow.appendChild(label);

	var textBox = document.createElement('input');
	textBox.setAttribute('type', 'number');
	textBox.setAttribute('id', 'text-' + range.id);
	textBox.setAttribute('min', min);
	textBox.setAttribute('pattern', '[0-9]');
	textBox.setAttribute('max', max); //change this when sound is loaded
	textBox.addEventListener('change', offsetChanged);
	textBox.value = 0;
	
	shadow.appendChild(textBox);
	shadow.appendChild(range);
	
	Object.defineProperty(this, "min", {
							   get: function(){ return min; },
							   set: function(newMin){
									textBox.min = min;
								   	range.min = min;   
							   },
                               enumerable : true});
	
	Object.defineProperty(this, "max", {
							   get: function() { return max; },
							   set: function(newMax){
								   max = newMax;
								   textBox.max = max;
								   range.max = max;
							   },
                               enumerable : true});	
	
	Object.defineProperty(this, "value", {
							   get: function() { 
								   return parseInt(textBox.value); 
							   },
							   set: function(newValue){
								   if(newValue >= min && newValue <= max)
								   {
									   if(newValue != range.value)
								   			range.value = newValue;
									   
									   if(newValue != textBox.value)
								   			textBox.value = newValue;
								   }
								   else
									throw 'invalud value, must be between min and max';
							   },
                               enumerable : true});		
};

var RangeConfig = document.registerElement('x-range-config', {prototype: RangeConfigProto});