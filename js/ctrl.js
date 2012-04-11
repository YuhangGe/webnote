Daisy.Global = {
	cur_page : {
		bookid : '',
		pageid : '',
		date : '',
		type : 'pad'
	},
	hand_weight : 1.5,
	doodle_weight : 9,
	cur_mode : 'handword',
	doodle_type : Daisy._Doodle.Type.NORMAL,
	doodle_color : 'blue',
	DWTable : [4,6,9,13,18]
}

function ctrlReadOnly() {
	if(SNEditor.read_only) {
		$('#ctrl-readonly').html("只读(已关)");
		SNEditor.read_only = false;

	} else {
		$('#ctrl-readonly').html("只读(已开)");
		SNEditor.read_only = true;
	}
	SNEditor.focus();
}

function ctrlSetBold() {
	if(SNEditor.font_bold) {
		SNEditor.setBold(false);
		$('#ctrl-setbold').html("加粗(已关)");
	} else {
		$('#ctrl-setbold').html("加粗(已开)");
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
	$('#page-list').prepend($('<li>').html('<p><img class="thumb-' + Daisy.Global.cur_page.type + '" id="thumb_' + Daisy.Global.cur_page.pageid + '" ></img></p><p>' + Daisy.Global.cur_page.date + '</p><p class="new-tip">新笔记</p><p class="new-tip-2">(正在编辑)</p>'));
	SNEditor.clear();
	$('#thumb_' + Daisy.Global.cur_page.pageid).attr('src', SNEditor.render.getThumb()).html("hi");
}

function ctrlCancelNote() {
	$('#edit-1').show();
	$('#edit-2').hide();
}

function ctrlSaveNote() {
	$('#thumb_' + Daisy.Global.cur_page.pageid).attr('src', SNEditor.render.getThumb());
}
function ctrlSetCurMode(){
	if(Daisy.Global.cur_mode === 'handword'){
		$("#ctrl-doodle-option").show();
		$("#ctrl-handword").html("手写(已关)");
		$("#ctrl-doodle").html("涂鸦(已开)");
		Daisy.Global.cur_mode = 'doodle'
	}else{
		$("#ctrl-doodle-option").hide();
		$("#ctrl-handword").html("手写(已开)");
		$("#ctrl-doodle").html("涂鸦(已关)");
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
