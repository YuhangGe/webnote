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
	SNEditor = new Daisy.WebNote({
		line_width : 1165,
		line_count : 20,
		line_height : 50,
		font_name : "Droid Sans Fallback",
		font_size : 35,
		width : 1170,
		height : 800
	});
	LAYOUT.row_1 = $('#col-1 .logo')[0].offsetHeight;
	LAYOUT.row_2 = $('#col-1 .sub-title')[0].offsetHeight;
	layout();

	SNEditor.append("欢迎使用Super Note!\n");

	$.get("load_item.php?file=adb\\data2\\items", function(data) {
		SNEditor.loadItem(data, 0);

	}, 'text');
	$.get("load_doodle.php?file=adb\\data2\\", function(data) {
		//i = data;
		SNEditor.loadDoodle(data, 0);
		//img.draw(wn_editor.render.ctx);
	}, 'text');

	

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