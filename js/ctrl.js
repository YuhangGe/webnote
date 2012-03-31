
var CUR_PAGE = {
	bookid : '',
	pageid : '',
	date : '',
	type : 'pad'
}

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
	var d = new Date();
	CUR_PAGE.pageid = d.getTime();
	CUR_PAGE.date = d.getFullYear()+"年"+(d.getMonth()+1)+"月"+d.getDate()+"日";
	$('#page-list').prepend(
		$('<li>').html('<p><img class="thumb-'+CUR_PAGE.type+'" id="thumb_'+CUR_PAGE.pageid+'" ></img></p><p>'+CUR_PAGE.date+'</p><p class="new-tip">新笔记</p><p class="new-tip-2">(正在编辑)</p>')
	);
	SNEditor.clear();
	$('#thumb_'+CUR_PAGE.pageid).attr('src',SNEditor.render.getThumb()).html("hi");
}

function ctrlCancelNote(){
	$('#edit-1').show();
	$('#edit-2').hide();
}

function ctrlSaveNote(){
	$('#thumb_'+CUR_PAGE.pageid).attr('src',SNEditor.render.getThumb());
}
