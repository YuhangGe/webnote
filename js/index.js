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
	
	if(SNEditor!=null)
		SNEditor.setSize(size.width-LAYOUT.col_1-LAYOUT.col_2-2,size.height-LAYOUT.row_1-LAYOUT.row_2-2);
	
}
$(window).resize(layout);

$(function() {
	/*
	* phone
	*/
	// wn_editor = new Daisy.WebNote({
	// line_width : 730,
	// line_count : 20,
	// line_height : 48,
	// font_name : '微软雅黑',
	// font_size : 33,
	// width : 730,
	// height : 600
	// });
	/**
	 * pad
	 */
	
	LAYOUT.row_1 = $('#col-1 .logo')[0].offsetHeight;
	LAYOUT.row_2 = $('#col-1 .sub-title')[0].offsetHeight;
	
	SNEditor = Daisy.createEditor('edit-container');
	layout();

	if(SNEditor==null){
		return;
	}
	
	SNEditor.append("Vingt mille lieues sous les mers  est la première livre de Jules Verne que j’ai lue. Personnellement, je p");
 
	// $.ajax({
		// url : "load_item.php?file=adb\\data2\\items",
		// dataType : 'text'
	// }).done(function(data){
		// SNEditor.loadItem(data, 0);
	// }).fail(function(req, textStatus, errorThrown){
		// $.log('error')
		// $.log(textStatus);
		// $.log(errorThrown)
	// });
	//$.get("load_doodle.php?file=adb\\data2\\", function(data) {
		//i = data;
		//SNEditor.loadDoodle(data, 0);
		//img.draw(wn_editor.render.ctx);
	//}, 'text');

	//$.get("other_lang.txt",function(data){
		//SNEditor.append(data);
	//})

});
/**
 * 加载笔记本
 */
function loadAllBook() {
	$.getJSON("getallbook", function(data) {
		if(data.status != 0) {
			alert('网络错误或未登录！请重试。');
			return;
		}
		var books = data.books, bl_dom = $('#book-list');
		if(books.length == 0) {
			$('#book-list li p').html("没有笔记本，请新建");
		} else {
			bl_dom.html("");
		}
		for(var i = 0; i < books.length; i++) {
			var b = books[i];
			bl_dom.append($('<li id=book_"' + b.bookid + '">').html('<p class="book-title">' + b.name + '</p></p><p class="book-type">(For ' + (b.type == 'phone' ? 'Phone' : 'Pad') + ') ' + b.pagenum + '页</p>').click(function() {
				loadBook(b.bookdid, b.type);
			}));
		}
	});
}

function loadBook(id, type) {
	$.getJSON("getbook", function(data) {
		if(data.status != 0) {
			alert('网络错误或未登录！请重试。');
			return;
		}
		var pages = data.pages, pl_dom = $('#page-list');
		if(pages.length == 0) {
			$('#page-list').html("没有笔记本，请新建");
		} else {
			pl_dom.html("");
		}
		for(var i = 0; i < pages.length; i++) {
			var p = pages[i];
			pl_dom.append($('<li id="page_' + p.pageid + '">').html('<p><img src="' + p.thumb + '" /></p><p>' + p.date + '</p>').click(function() {
				loadPage(p.pageid);
			}))
		}
	});
}

function loadPage(id) {
	SNEditor.clear();
	SNEditor.append("正在加载笔记...");
	$.get("openpage", {
		pageid : id
	}, function(data) {
		if(data.charCodeAt(0) != 0) {

		} else {
			SNEditor.loadPage(data, 1);
		}

	}, "text")
}