if(typeof Daisy==='undefined'){
	Daisy = {};
}

Daisy.WebNote = function(){
	this.canvas = $('#wn-canvas')[0];
	
	this.render = new Daisy._Render(this);
	
	this.cur_page = null;
	this.pages = [];
	
	this.createPage();
	this.setCurPage(0);
	
}
Daisy.WebNote.prototype={
	
	createPage : function(){
		this.pages.push(new Daisy._Page());
		return this.pages.length-1;
	},
	setCurPage : function(index){
		this.cur_page = this.pages[index];
		this.render.resetPage();
		
		this.render.paint();
	}
}
