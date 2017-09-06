var editor = null;
var selection = null;
var path = "res/tiles.png";
var Download = 
    {
        click : function(node) {
            var ev = document.createEvent("MouseEvents");
            ev.initMouseEvent("click", true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            return node.dispatchEvent(ev);
        },
        encode : function(data) {
                return 'data:application/octet-stream;base64,' + btoa( data );
        },
        link : function(data, name){
            var a = document.createElement('a');
            a.download = name || self.location.pathname.slice(self.location.pathname.lastIndexOf('/')+1);
            a.href = data || self.location.href;
            return a;
        }
    };
    Download.save = function(data, name)
    {
        this.click(
            this.link(
                this.encode( data ),
                name
            )
        );
    };


/*
window.onerror = function(msg, url, linenumber) {
	return true;
}
*/
function StartEditor(){ 
	editor = new Editor(20,10); 
}

function Editor(areaW, areaH){  
	//working area
	this.areaW = areaW;
	this.areaH = areaH;
	
	this.cellSize = 16;
	this.spacing = 0;
	
	this.SetSize = function(){
		this.div = $("EditorDiv");
		this.div.style.width = ((window.innerWidth)/4*3 - 8) + "px";
		this.div.style.height = (window.innerHeight-5 - 8) + "px";
		this.div.style.cursor = "copy";  
	}
	this.SetSize();
	
	 
	this.canvas = $("EditorCanvas");
	
	this.ResizeCanvas = function(){
		this.canvas.setAttribute("width",this.areaW * this.cellSize);
		this.canvas.setAttribute("height",this.areaH * this.cellSize);
	}
	
	this.ResizeCanvas();
	
	
	this.canvas.addEventListener('contextmenu', function (event) {
		event.preventDefault();
	});  
	this.canvas.addEventListener("mousedown", function(e){
		if(e.which == 1){
			editor.mouseLeft = true;
			if(selection.selected != null)
				editor.placeBlock();
		}
		else if(e.which == 3){  
			editor.mouseRight = true;
			editor.removeBlock();
		}
		
	});
	
	this.ctx = this.canvas.getContext("2d");
	
	// views
	this.viewX = 0;
	this.viewY = 0;
	//mouse
	this.mouseX = 0;
	this.mouseY = 0;
	this.mouseLeft = false;
	this.mouseRight = false;
	
	this.drawGrid = true;
	this.drawTiles = true;
	this.drawBlocks = true;
	this.drawObjects = true;
	this.drawLayer = true;
	
	this.mode = 0;
	this.layer = 0;
	
	$("mode").onchange = function(){
		editor.mode = this.selectedIndex;
		
		if(this.selectedIndex == 0){
			$("layer_p").style.display = "inline";
		}else{
			$("layer_p").style.display = "none";
		}
		if(this.selectedIndex == 2){
			$("newObject").style.display = "inline";
		}else{
			$("newObject").style.display = "none";
		}
	};
	
	$("layer_s").onchange = function(){
		editor.layer = this.selectedIndex;
		editor.Draw();
	};
	$("export").onclick = function(){editor.Export();};
	$("loadMap").onclick = function(){editor.LoadMap();};
	var x = 1
	var y = 1
	$("room").onclick = function(){
	x = parseInt(prompt("Room x",1))
	y = parseInt(prompt("Room y",1))
Download.save($("output").value, "room"+x+"x"+y+".txt")
}
	$("save").onclick = function(){
Download.save($("output2").value, "room"+parseInt(prompt("Room x",1))+"x"+parseInt(prompt("Room y",1))+".js")
}

	$("newMap").onclick = function(){
		var w = prompt("Area Width",null);
		if (w != null){
			var h = prompt("Area Height",null);
			if (h != null){
				w = parseInt(w);
				h = parseInt(h);
				if(w*editor.cellSize < 4000 && h*editor.cellSize < 4000){
					editor = null;
					editor = new Editor(w,h); 
				}
				else{
					alert(w + " x "+ h +" is too big");
				}
			}
		}
	};
	
	$("resizeMap").onclick = function(){
		var w = prompt("Area Width",null);
		if (w != null){
			var h = prompt("Area Height",null);
			if (h != null){
				w = parseInt(w);
				h = parseInt(h);
				if(w*editor.cellSize < 4000 && h*editor.cellSize < 4000){
					editor.areaW = w;
					editor.areaH = h;
					editor.ResizeCanvas();
					editor.Draw();
				}
				else{
					alert(w + " x "+ h +" is too big or too small");
				}
			}
		}
	};
	
	
	$("cellSize").onchange = function(){
		editor.cellSize = parseInt(this.value);
		editor.Draw();
		selection.Draw();
	};
	$("grid_t").onchange = function(){
		editor.drawGrid = this.checked;
		editor.Draw();
	}; 
	$("tiles_t").onchange = function(){
		editor.drawTiles = this.checked;
		editor.Draw();
	}; 
	$("blocks_t").onchange = function(){
		editor.drawBlocks = this.checked;
		editor.Draw();
	}; 
	$("objects_t").onchange = function(){
		editor.drawObjects = this.checked;
		editor.Draw();
	};
	$("layer_t").onchange = function(){
		editor.drawLayer = this.checked;
		editor.Draw();
		
	}; 
	
	$("spacing").onchange = function(){
		editor.spacing = parseInt(this.value);
		editor.Draw();
		selection.Draw();
	};
    $("newObject").onclick = function(){
        editor.objectId = null;
	}
    
	$("newLayer").onclick = function(){
		editor.tiles.push([]);
		var sel = $("layer_s");
		var sel_idx = sel.options.length;
		var opt = new Option(sel_idx+"", sel_idx+"");
		sel.options[sel_idx] = opt;
		opt.setAttribute("selected","selected");
		editor.layer = sel_idx;
		editor.Draw();
	}
	this.Export = function(image){
		var n = parseInt(prompt("room x",1));
		var y = parseInt(prompt("room y",1));
		var output = "levels["+n+"] = [";
		//settings
		
		output += "[" +
		this.cellSize + "," +
		this.spacing + "," +
		this.areaW + "," +
		this.areaH ;
		
		output += "],";
		var output2 = 'var room = function(){Crafty.defineScene("room" , function(){';
		output2 += "Crafty.sprite("+this.cellSize+", "+this.cellSize+", 'res/"+path.get()+"', {tile:[0,0,0,0]}, "+this.spacing+", "+this.spacing+");var areaH = "+this.areaH*32+";var areaW = "+this.areaW*32+";"
		//tiles
		var tn = 0
		output2 += "var tile = function(t, x, y, rx, ry){var t = Crafty.e('2D, Canvas, SpriteAnimation, tile'+t+', tile').attr({x: x, y: y, z: 100000, w: "+this.cellSize*2+", h: "+this.cellSize*2+"}).reel('tile'+t+'', 500, [[ry, rx]]).animate('tile'+t+'', 1) };"
		//tiles
		output += "[";
		for(var i = 0; i < this.tiles.length; i ++){
			var layer = this.tiles[i];			
			var ty = 0
			output += "[";
			for(var j = 0; j < layer.length; j ++){
				output += "[" +
				layer[j][4]+ "," +
				layer[j][0]/this.cellSize + "," +
				layer[j][1]/this.cellSize + "]";
				if(j < layer.length -1)
					output += ","
				var tpn = layer[j][4]; 
				if (imgwidth === undefined){
					storevalue.ChangeState(1024)
				}
				var imgwidth = storevalue.getState()
				var tilewnum = imgwidth/this.cellSize
				while(tpn > tilewnum){
					tpn -= tilewnum;
					ty += 1;
				}				
				output2 += "tile('"+tn+"', "+layer[j][0]*2+", "+layer[j][1]*2+", "+ty+", "+tpn+");"
				tn += 1;
				ty = 0
			
			}
			output += "]";
			if(i < this.tiles.length -1){
				output += ","
			}
		}
		output += "],";
		
		//collision
		output += "[";
		var cl = 0
		output2 += "var coll = function(x, y){var collision = Crafty.e('2D, Canvas, Collision, Collider').attr({x: x, y: y, w: "+this.cellSize*2+", h: "+this.cellSize*2+"}).collision([0, 0, 0, 32,  32, 0,  32, 32])};"
		for(var i = 0; i < this.blocks.length; i ++){
			output += "[" +
			this.blocks[i][0]/this.cellSize + "," +
			this.blocks[i][1]/this.cellSize + "]";
			output2 += "coll("+this.blocks[i][0]*2+", "+this.blocks[i][1]*2+");";
			if(i < this.blocks.length -1){
				output += ","
			}
		}
		output += "],";
		
		//objects
		output += "[";
		var objnum = 0
		for(var i = 0; i < this.objects.length; i ++){
			output += "[" +
			this.objects[i][0]/this.cellSize + "," +
			this.objects[i][1]/this.cellSize + "," +
			'"'+this.objects[i][2] + '"'+ "]"
			output2 += "var "+this.objects[i][2]+""+objnum+" = Crafty.e('2d, Color, SpriteAnimation, Collision, "+this.objects[i][2]+"').attr({w: "+this.cellSize*2+", h: "+this.cellSize*2+", x: "+this.objects[i][0]*2+", y: "+this.objects[i][1]*2+ ", z: 20000000})";
			var objname = ""+this.objects[i][2]+""
			console.log(objname)
			if (objname === "sloper1"){
				output2 += ".collision([0, 32,  32, 0, 32, 32]);"
			} else if (objname === "sloper2"){
				output2 += ".collision([0, 32,  64, 0, 64, 32]);"
			} else if (objname === "slopel1"){
				output2 += ".collision([32, 32,  0, 32, 0, 0]);"
			} else if (objname === "slopel2"){
				output2 += ".collision([32, 32,  -32, 32, -32, 0]);"
			} else if (objname === "Doorl"){
				output2 += ".collision([0, 32, 0, -96, -32, -96, -32, 32]);Doorl"+objnum+".x = 128;"
			} else if (objname === "Doorr"){
				output2 += ".collision([0, 32, 0, -96, 32, -96, 32, 32]);Doorr"+objnum+".x = 128;"
			} else if (objname === "Dooru"){
				output2 += ".collision([0, 32, 0, 0, 128, -96, -32, 32]);Doorl"+objnum+".y = 128;"
			} else if (objname === "Doorr"){
				output2 += ".collision([0, 32, 0, -96, 32, -96, 32, 32]);Doorr"+objnum+".y = 128;"
			} else {
				output2 += ";"
			}
			if(i < this.objects.length -1){
				output += ","
			}
			objnum += 1
		}
		var l1 = prompt("layer 1")
		var l2 = prompt("layer 2")
		var l3 = prompt("layer 3")
		output2 += "Crafty.sprite(backgrounds.bg"+l1+".x, backgrounds.bg"+l1+".y, ''+backgrounds.bg"+l1+".img+'', {BG"+l1+":[0,0,1,1]},0 , 0);var BG"+l1+" = Crafty.e('2D, SpriteAnimation, Canvas, BG"+l1+"').attr({x: 0, y: 0, z: -1, w: backgrounds.bg"+l1+".x*4, h: backgrounds.bg"+l1+".y*4});BG"+l1+".bind('EnterFrame', function(){BG"+l1+".x = Crafty.viewport.x*-0.6;BG"+l1+".y = Crafty.viewport.y*-0.6});"
		output2 += "Crafty.sprite(backgrounds.bg"+l2+".x, backgrounds.bg"+l2+".y, ''+backgrounds.bg"+l2+".img+'', {BG"+l2+":[0,0,1,1]},0 , 0);var BG"+l2+" = Crafty.e('2D, SpriteAnimation, Canvas, BG"+l2+"').attr({x: 0, y: 0, z: -2, w: backgrounds.bg"+l2+".x*4, h: backgrounds.bg"+l2+".y*4});BG"+l2+".bind('EnterFrame', function(){BG"+l2+".x = Crafty.viewport.x*-0.75;BG"+l2+".y = Crafty.viewport.y*-0.75});"
		output2 += "Crafty.sprite(backgrounds.bg"+l3+".x, backgrounds.bg"+l3+".y, ''+backgrounds.bg"+l3+".img+'', {BG"+l3+":[0,0,1,1]},0 , 0);var BG"+l3+" = Crafty.e('2D, SpriteAnimation, Canvas, BG"+l3+"').attr({x: 0, y: 0, z: -3, w: backgrounds.bg"+l3+".x*4, h: backgrounds.bg"+l3+".y*4});BG"+l3+".bind('EnterFrame', function(){BG"+l3+".x = Crafty.viewport.x*-0.97;BG"+l3+".y = Crafty.viewport.y*-0.97});"
		output += "]";
		output += "]";
		output2 += "})};"
		$("output").value = output
		$("output2").value = output2
	}
	
	
	this.LoadMap = function(){ 
		var levels = [];
		eval($("output").value);
		if(levels.length == 0){
			alert("Error: Unable to find levels[n]");
			return null;
		}
		var sel = $("layer_s");
		while(sel.options.length > 0){
			sel.remove(0);
		}
		editor.objects = [];
		editor.blocks = [];
		editor.tiles = [];
		lev = levels.length-1;
		//carico le info sul livello
		var settings = levels[lev][0];
		this.cellSize = settings[0];
		this.spacing = settings[1];
		this.areaW = settings[2];
		this.areaH = settings[3];
		this.ResizeCanvas();
		//dati sui tiles
		var tiles = levels[lev][1]; 
		var cs = this.cellSize + this.spacing; 
		var cellsX = Math.ceil(selection.image.width / cs);
		var cellsY = Math.ceil(selection.image.height / cs);
		 
		for(var j = 0; j < tiles.length; j++){
			var layer = tiles[j];
			editor.tiles.push([]);
			for(var i = 0; i < layer.length; i++){
				var cy = Math.floor(layer[i][0] / cellsX);
				var cx = layer[i][0] - cy*cellsX;
				editor.tiles[j].push([layer[i][1]*this.cellSize, layer[i][2]*this.cellSize, cx*cs, cy*cs,layer[i][0]]);
			}
			var sel_idx = sel.options.length;
			sel.options[sel_idx] = new Option(sel_idx+"", sel_idx+"");
		}
		
		
		//dati sui blocchi di collisione
		var blocks = levels[lev][2];
		for(var i = 0; i < blocks.length; i++){
			this.blocks.push([blocks[i][0]*this.cellSize, blocks[i][1]*this.cellSize,this.cellSize,this.cellSize]); 
		}
		
		
		//dati sugli oggetti
		var objects = levels[lev][3];
		for(var i = 0; i < objects.length; i++){
			this.objects.push([objects[i][0]*this.cellSize, objects[i][1]*this.cellSize, objects[i][2]]);			
		}
		
		
		editor.Draw();
	}
	var path = (function () {
        var imgl; // Private Variable

        var img = {};// public object - returned at end of module

        img.Change = function (width) {
            imgw = width;
        };

        img.get = function() {
            return imgw;
        }

        return img; // expose externally
    }());
	path.Change('tiles.png')
	var storevalue = (function () {
        var imgw; // Private Variable

        var img = {};// public object - returned at end of module

        img.ChangeState = function (width) {
            imgw = width;
        };

        img.getState = function() {
            return imgw;
        }

        return img; // expose externally
    }());
	//image file
	var finput = $("loadFile");
	finput.onchange = function(){
		var file = this.files[0]
		path.Change(file.name);
		var fr = new FileReader();
		fr.onload = function(imgw, imgh){
			selection.image = new Image();
			selection.image.src = this.result;
			selection.Draw();
			storevalue.ChangeState(selection.image.width)
		};
		fr.readAsDataURL(file);
	}
	this.tiles = [[]];
	this.blocks = [];
	this.objects = [];
	this.objectId = null; //current objecty
	
	this.placeBlock = function(){ 
		
		var px = Math.floor(this.mouseX /this.cellSize )*this.cellSize; 
		var py = Math.floor(this.mouseY /this.cellSize )*this.cellSize;
		
		var buffer;
		switch(this.mode){
			case 0: buffer = this.tiles[this.layer]; break;
			case 1: buffer = this.blocks; break;
			case 2: buffer = this.objects; break;
		}
		var found = -1;
		for(var i = 0; i < buffer.length; i ++){ 
			if(buffer[i][0] == px && buffer[i][1] == py){
				found = i;
				break;
			}
		}
		if(found < 0){
			switch(this.mode){
			case 0: 
				var tile = [px,py,selection.selectedX,selection.selectedY,selection.selected]; 
				buffer.push(tile);
				break;
			case 1:
				var block = [px,py,this.cellSize,this.cellSize]; 
				buffer.push(block);	
				break;
			case 2:
				var val = (this.objectId != null) ? this.objectId : prompt("ID",null);
				if (val!=null){
					var obj = [px,py,val]; 
					buffer.push(obj);
					this.objectId  = val;
				}
				this.mouseLeft = false;
				
				break;
			}
			this.Draw();
		}
	}
	
	this.removeBlock = function(){ 
		var px = Math.floor(this.mouseX /this.cellSize )*this.cellSize; 
		var py = Math.floor(this.mouseY /this.cellSize )*this.cellSize; 
		
		var buffer;
		switch(this.mode){
			case 0: buffer = this.tiles[this.layer]; break;
			case 1: buffer = this.blocks; break;
			case 2: buffer = this.objects; break;
		}
		 
		for(var i = 0; i < buffer.length; i ++){ 
			if(buffer[i][0] == px && buffer[i][1] == py){
				buffer.splice(i,1); 
				break;
			}
		} 
		this.Draw();	
	}
	
	//Load Resources
	rh = new ResourcesHandler( function(){
		this.loaded = true;
	});
	 
	///Sprites
	//Player  
	this.imgTiles = rh.LoadImage("res/tiles.png", function(){
		selection = new SelectionFrame(editor.imgTiles);
	});  
	
	this.textHover = function(str, x, y, col1, col2){
		var w = editor.ctx.measureText(str).width;
		var h = 30; 
		var inside = (inputs.mouseX > x - w/2  && inputs.mouseY > y - h && inputs.mouseX < x + w/2  && inputs.mouseY < y );
		if(inside)
			editor.ctx.fillStyle = col2;
		else
			editor.ctx.fillStyle = col1;
		editor.ctx.fillText(str, x, y);
		return inside;
	};
	
	this.Draw = function(){ 
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		
		var w = this.areaW * this.cellSize;
		var h = this.areaH * this.cellSize;
		var cs = this.cellSize;
		
		//tiles
		if(this.drawTiles){
			if(this.drawLayer){
				var layer = this.tiles[this.layer];
				for(var i = 0; i < layer.length; i ++){ 
					this.ctx.drawImage(selection.image,
						layer[i][2], layer[i][3],
						cs, cs,
						layer[i][0], layer[i][1],
						cs, cs); 
				}
			}
			else{
				for(var i = 0; i < this.tiles.length; i ++){
					var layer = this.tiles[i];
					for(var j = 0; j < layer.length; j ++){ 
						this.ctx.drawImage(selection.image,
							layer[j][2], layer[j][3],
							cs, cs,
							layer[j][0], layer[j][1],
							cs, cs); 
					}
				}
			}
		}
		
		
		//grid
		if(this.drawGrid){
			this.ctx.strokeStyle = "rgba(0,0,0,0.14)";
			this.ctx.beginPath();
			for(var x = 0; x <= w; x += this.cellSize){
				this.ctx.moveTo(x-0.5, 0);
				this.ctx.lineTo(x-0.5, h);
			}  
			for(var y = 0; y <= h; y += this.cellSize){ 
				this.ctx.moveTo(0, y-0.5);
				this.ctx.lineTo(w, y-0.5); 
			} 
			this.ctx.closePath();
			this.ctx.stroke();
		}
		 
		//collision blocks
		if(this.drawBlocks){
			this.ctx.strokeStyle = "#c00";
			for(var i = 0; i < this.blocks.length; i ++){ 
				this.ctx.strokeRect(this.blocks[i][0]-0.5, this.blocks[i][1]-0.5,this.blocks[i][2], this.blocks[i][3]); 
			}
			this.ctx.strokeStyle = "#000";
		}
		
		//objects
		if(this.drawObjects){
			this.ctx.strokeStyle = "#00c"; 
			var cs2 = cs/2;
			this.ctx.textAlign = "center";
			this.ctx.textBaseline = "middle";
			for(var i = 0; i < this.objects.length; i ++){ 
				this.ctx.beginPath();
				this.ctx.arc(this.objects[i][0]+cs2-0.5, this.objects[i][1]+cs2-0.5, cs2-1, 0, 2 * Math.PI);  
				this.ctx.stroke();
				this.ctx.fillText(this.objects[i][2].substr(0,4),this.objects[i][0]+cs2 , this.objects[i][1]+cs2 )
			} 
			this.ctx.strokeStyle = "#000";
		}
	}
	
	this.Draw();
	
	
	
	this.ResetEditor = function(){ 
		this.blocks = []; 
	}

}

function SelectionFrame(image){
	this.image = image;
	this.backColor = "#fff";
	this.mouseX = 0;
	this.mouseY = 0;
	
	this.SetSize = function(){
		this.width = (window.innerWidth-5)/4 ;
		this.div = $("SelectionDiv");
		this.div.style.width = this.width + "px";
		this.div.style.height = window.innerHeight/5*3+"px" 
		this.div.style.left = window.innerWidth - this.width - 6 +"px" 
		this.div.style.cursor = "pointer";  
		
		
		this.divOpt = $("Options");
		this.divOpt.style.padding = "5px";
		this.divOpt.style.width = this.width -10 + "px";
		this.divOpt.style.height = window.innerHeight/5*2 -26+"px"; 
		this.divOpt.style.top = (window.innerHeight/5*3 + 3)+"px";
		this.divOpt.style.left = window.innerWidth - this.width - 6 +"px" 
	}
	
	this.SetSize();
	
	
	this.cellsX = Math.ceil(this.image.width / (editor.cellSize + editor.spacing));
	this.cellsY = Math.ceil(this.image.height / (editor.cellSize + editor.spacing));
	
	
	this.canvas = $("SelectionCanvas");
	this.canvas.setAttribute("width",this.image.width+2);
	this.canvas.setAttribute("height",this.image.height+2);
	this.canvas.onclick = function(){
		var cs = editor.cellSize+editor.spacing; 
		var px = Math.floor(selection.mouseX /cs ); 
		var py = Math.floor(selection.mouseY /cs ); 
		selection.selected = py*selection.cellsX + px;
		selection.selectedX = px*cs;
		selection.selectedY = py*cs;
		selection.Draw();
	};
	this.ctx = this.canvas.getContext("2d");
	
	
	
	this.selected = 0;
	this.selectedX = 0;
	this.selectedY = 0;
	
	
	
	this.Draw = function(){
		this.ctx.fillStyle = this.backColor;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		
		
		this.ctx.drawImage(this.image,0,0);
		
		var cellsize = editor.cellSize + editor.spacing 
		this.ctx.beginPath();
		for(var x = 0; x <= this.image.width; x += cellsize){
			this.ctx.moveTo(x-0.5, 0);
			this.ctx.lineTo(x-0.5, this.image.height);
			if(editor.spacing > 1){ 
				this.ctx.moveTo(x-0.5 - editor.spacing+1, 0);
				this.ctx.lineTo(x-0.5 - editor.spacing+1, this.image.height);
			}
		}
		
		for(var y = 0; y <= this.image.height; y += cellsize){ 
			this.ctx.moveTo(0, y-0.5);
			this.ctx.lineTo(this.image.width, y-0.5); 
			if(editor.spacing > 1){ 
				this.ctx.moveTo(0, y-0.5- editor.spacing+1);
				this.ctx.lineTo(this.image.width, y-0.5- editor.spacing+1);  
			}
		}
		
		this.ctx.closePath();
		this.ctx.stroke();
		
		if(this.selected != null){ 
			this.ctx.strokeStyle="#fc0";
			this.ctx.strokeRect(this.selectedX-0.5,this.selectedY-0.5,editor.cellSize+1,editor.cellSize+1);
			this.ctx.strokeStyle="#000";
		}
		
	}
	this.Draw();

}

window.addEventListener("mousemove", function(s) {
	editor.mouseX = Math.round(s.pageX - editor.ctx.canvas.offsetLeft + editor.div.scrollLeft);
	editor.mouseY = Math.round(s.pageY - editor.ctx.canvas.offsetTop + editor.div.scrollTop);
	if(editor.mouseLeft){
		if(selection.selected != null)
				editor.placeBlock();
	}
	else if(editor.mouseRight){ 
		editor.removeBlock();
	}

	selection.mouseX = Math.round(s.pageX - selection.ctx.canvas.offsetParent.offsetLeft + selection.div.scrollLeft);
	selection.mouseY = Math.round(s.pageY - selection.ctx.canvas.offsetParent.offsetTop + selection.div.scrollTop );
}, false);

window.addEventListener("mousedown", function(e) { 
	switch (e.which) {
	case 1: 
		break; 
	case 3:  
		break;
	}
}, false);


window.addEventListener("mouseup", function(e) { 
	switch (e.which) {
	case 1: 
		editor.mouseLeft = false; 
		break; 
	case 3:  
		editor.mouseRight = false;
		break;
	}
}, false);
