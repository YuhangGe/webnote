function ctrlReadOnly(){
	if(SNEditor.read_only){
		$('#ctrl-readonly').html("只读(已关)");
		SNEditor.read_only = false;
		
	}else{
		$('#ctrl-readonly').html("只读(已开)");
		SNEditor.read_only = true;
	}
	SNEditor.focus();
}

function ctrlSetBold(){
	if(SNEditor.font_bold){
		SNEditor.setBold(false);
		$('#ctrl-setbold').html("加粗(已关)");
	}else{
		$('#ctrl-setbold').html("加粗(已开)");
		SNEditor.setBold(true);
	}
	SNEditor.focus();
}
function ctrlSetColor(color){
	SNEditor.setColor(color);
	SNEditor.focus();
}
function ctrlNewNote(){
	$('#edit-2').show();
	$('#edit-1').hide();
	
	$('#page-list').prepend(
		$('<li><li>')
	)
}

function ctrlCancelNote(){
	$('#edit-1').show();
	$('#edit-2').hide();
}

function ctrlSaveNote(){
	SNEditor.render.getThumb();
}
