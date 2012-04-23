Daisy.Global = {
	cur_page : {
		bookid : '',
		pageid : '',
		date : '',
		type : 'pad',
		saved : false
	},
	hand_weight : 1.5,
	doodle_weight : 9,
	cur_mode : 'doodle_edit',
	doodle_type : Daisy._Doodle.Type.ERASER,
	doodle_color : 'blue',
	DWTable : [4,6,9,13,18]
}

function ctrlReadOnly() {
	if(SNEditor.read_only) {
		$('#ctrl-readonly').html("只讀(已關)");
		SNEditor.read_only = false;

	} else {
		$('#ctrl-readonly').html("只讀(已開)");
		SNEditor.read_only = true;
	}
	SNEditor.focus();
}

function ctrlSetBold() {
	if(SNEditor.font_bold) {
		SNEditor.setBold(false);
		$('#ctrl-setbold').html("加粗(已關)");
	} else {
		$('#ctrl-setbold').html("加粗(已開)");
		SNEditor.setBold(true);
	}
	SNEditor.focus();
}

function ctrlSetColor(color) {
	Daisy.Global.doodle_color = color;
	SNEditor.setColor(color);
	SNEditor.focus();
}

function ctrlNewNote() {
	$('#edit-2').show();
	$('#edit-1').hide();
	var d = new Date();
	Daisy.Global.cur_page.pageid = d.getTime();
	Daisy.Global.cur_page.date = d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日";
	$('#page-list').prepend($('<li id="page_'+Daisy.Global.cur_page.pageid+'">').html('<p><img class="thumb-' + Daisy.Global.cur_page.type + '" id="thumb_' + Daisy.Global.cur_page.pageid + '" ></img></p><p>' + Daisy.Global.cur_page.date + '</p><p class="new-tip">新笔记</p><p class="new-tip-2">(正在编辑)</p>'));
	SNEditor.clear();
	$('#thumb_' + Daisy.Global.cur_page.pageid).attr('src', SNEditor.render.getThumb());
}

function ctrlCancelNote() {
	$('#edit-1').show();
	$('#edit-2').hide();
	if(!Daisy.Global.cur_page.saved)
		$('#page_'+ Daisy.Global.cur_page.pageid).remove();
}

function ctrlSaveNote() {
	var id = Daisy.Global.cur_page.pageid;
	$('#thumb_' + id).attr('src', SNEditor.render.getThumb());
	$('#page_'+ id + " .new-tip").remove();
	$('#page_'+ id + " .new-tip-2").remove();
	Daisy.Global.cur_page.saved = true;
}
function ctrlSetCurMode(){
	if(Daisy.Global.cur_mode === 'handword'){
		$("#ctrl-doodle-option").show();
		$("#ctrl-handword").html("手寫(已關)");
		$("#ctrl-doodle").html("塗鴉(已開)");
		Daisy.Global.cur_mode = 'doodle'
	}else{
		$("#ctrl-doodle-option").hide();
		$("#ctrl-handword").html("手寫(已開)");
		$("#ctrl-doodle").html("塗鴉(已關)");
		Daisy.Global.cur_mode = 'handword'
	}
}
function ctrlSetDoodleType(){
	var si = $('#ctrl-doodle-type')[0].selectedIndex;
	Daisy.Global.doodle_type = si;
}
function ctrlSetDoodleWeight(){
	var   si = $('#ctrl-doodle-weight')[0].selectedIndex;
	
	Daisy.Global.doodle_weight = Daisy.Global.DWTable[si];
}

function ctrlEditNote(){
	
}
function ctrlDelNote(){
	//$('#page_'+ Daisy.Global.cur_page.pageid).remove();
}

function ctrlDoodleEdit(){
	if(Daisy.Global.cur_mode==="doodle_edit"){
		
		Daisy.Global.cur_mode = "doodle";
	}else{
		$.log("d")
		SNEditor.caret.style.cursor = "hand";
		Daisy.Global.cur_mode = "doodle_edit";
	}
}
