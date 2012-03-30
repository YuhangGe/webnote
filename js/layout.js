/**
 * 根据浏览器窗口大小对面板进行布局
 */
$.getSize =function()//函数：获取尺寸
{
	var w=0,h=0;
	//获取窗口宽度
	if(window.innerWidth)
		w = window.innerWidth;
	else if((document.body) && (document.body.clientWidth))
		w = document.body.clientWidth;
	//获取窗口高度
	if(window.innerHeight)
		h = window.innerHeight;
	else if((document.body) && (document.body.clientHeight))
		h = document.body.clientHeight;
	//通过深入Document内部对body进行检测，获取窗口大小
	if(document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth) {
		h = document.documentElement.clientHeight;
		w = document.documentElement.clientWidth;
	}
	//结果输出至两个文本框
	//$.log("w:%d,h:%d",w,h);
	return {
		width : w,
		height : h
	}
}


var LAYOUT = {
	col_1_min : 200,
	col_2_min : 200,
	col_1 : 200,
	col_2 : 300,
	col_3 : 500,
	row_1 : 40,
	row_2 : 30
}

function layout(){
	//return;
	var size = $.getSize();
	//$.log(size);
	$('#col-1').height(size.height);
	$('#col-2').height(size.height);
	$('#col-3').height(size.height);
	$('#note-list').height(size.height-LAYOUT.row_1-LAYOUT.row_2-2);
	// -2是减去两条边线的宽/高
	$('#col-3').width(size.width-LAYOUT.col_1-LAYOUT.col_2-2);
	SNEditor.setSize(size.width-LAYOUT.col_1-LAYOUT.col_2-2,size.height-LAYOUT.row_1-LAYOUT.row_2-2);
	
}
$(window).resize(layout);

