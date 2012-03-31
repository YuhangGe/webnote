<!doctype html>
<html>
	<head>
		<title>Daisy Editor</title>
		<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
		
	
		<script type="text/javascript" src="js/jquery-1.5.1.js"></script>
		<script type="text/javascript" src="js/js-printf.js"></script>
		<script type="text/javascript" src="js/editor/utility.js"></script>
		<script type="text/javascript" src="js/editor/editor.js"></script>
		<script type="text/javascript" src="js/editor/render.js"></script>
		<script type = "text/javascript" src="js/editor/page.js"></script>
		<script type="text/javascript" src="js/editor/event.js"></script>
		<script type="text/javascript" src="js/editor/handword.js"></script>
		<script type="text/javascript" src="js/editor/doodle.js"></script>
		<script type="text/javascript" src="js/editor/clipboard.js"></script>
		<script type="text/javascript" src="js/editor/load_new.js"></script>
		<script type="text/javascript" src="js/editor/load_doodle.js"></script>
		
		<script type="text/javascript" src="js/editor/filter/blur.js"></script>
		<script type="text/javascript" src="js/editor/filter/blur2.js"></script>
		<script type="text/javascript" src="js/editor/filter/blur3.js"></script>
		<script type="text/javascript" src="js/editor/filter/emboss.js"></script>
		
		<script type="text/javascript" src="js/index.js"></script>
		<script type="text/javascript" src="js/ctrl.js"></script>
		<link rel="stylesheet" type="text/css" href="css/editor.css" />
		<link type="text/css" rel="stylesheet" href="css/style.css" />
		
		
		<link rel="stylesheet" media="screen" type="text/css" href="css/colorpicker.css" />
		<script type="text/javascript" src="js/colorpicker.js"></script>

		<script type="text/javascript">
		$(function(){
			$('#colorSelector').ColorPicker({
				color: '#010101',
				onShow: function (colpkr) {
					$(colpkr).fadeIn(300);
					return false;
				},
				onHide: function (colpkr) {
					$(colpkr).fadeOut(300);
					return false;
				},
				onChange: function (hsb, hex, rgb) {
					$('#colorSelector').css('backgroundColor', '#' + hex);
				},
				onSubmit : function(hsb,hex,rgb,colpkr){
					ctrlSetColor('#'+hex);
					$('#colorSelector').ColorPickerHide();
				}
		});
			
});
		</script>
	</head>
	<body>
		<div id="top-menu"></div>
		<div id="web-note">
			<div id="col-1">
				<div class="logo">
					<h2>SuperNote</h2>
				</div>
				<div class="book-list">
					<div class="sub-title">
						笔记本<a href="#" style="float:right;font-size:12px;">添加</a>
					</div>
					<ul id="book-list">
						<li>
							<p>正在加载笔记本...</p>
						</li>
					<!--	<li>
							<p class="book-title">
								笔记本1
							</p>
							<p class="book-type">
								(For Phone) 2页
							</p>
						</li>
						<li>
							<p class="book-title">
								笔记本2
							</p>
							<p class="book-type">
								(For Pad) 200页
							</p>
						<li>
							<p class="book-title">
								笔记本3
							</p>
							<p class="book-type">
								(For Phone) 52页
							</p>
						</li>
						<li>
							<p class="book-title">
								笔记本1
							</p>
							<p class="book-type">
								(For Phone) 2页
							</p>
						</li>
						<li>
							<p class="book-title">
								笔记本2
							</p>
							<p class="book-type">
								(For Pad) 200页
							</p>
						<li>
							<p class="book-title">
								笔记本3
							</p>
							<p class="book-type">
								(For Phone) 52页
							</p>
						</li>
					-->
					</ul>
				</div>
			</div>
			<div id="col-2">
				<div class="search">
					<p>下午好,<span>葛羽航</span><a>退出登录</a></p>
					
				</div>
				<div class="note-list">
					<div class="sub-title">
						笔记预览
					<!--	<select>
							<option value="1">修改时间</option>
					</select> -->
					</div>
					<ul id="page-list">
				<!--		<li>
							<p><img src="adb/thumb.png" />
							</p>
							<p>
								2012年3月26日
							</p>
						</li>
						<li>
							<p><img src="adb/thumb.png" />
							</p>
							<p>
								2012年3月26日
							</p>
						</li>
						<li>
							<p><img src="adb/thumb.png" />
							</p>
							<p>
								2012年3月26日
							</p>
						</li>
						<li>
							<p><img src="adb/thumb.png" />
							</p>
							<p>
								2012年3月26日
							</p>
						</li>
						<li>
							<p><img src="adb/thumb.png" />
							</p>
							<p>
								2012年3月26日
							</p>
						</li>
						<li>
							<p><img src="adb/thumb.png" />
							</p>
							<p>
								2012年3月26日
							</p>
						</li>
						<li>
							<p><img src="adb/thumb.png" />
							</p>
							<p>
								2012年3月26日
							</p>
						</li>
						<li>
							<p><img src="adb/thumb.png" />
							</p>
							<p>
								2012年3月26日
							</p>
						</li>
						<li>
							<p><img src="adb/thumb.png" />
							</p>
							<p>
								2012年3月26日
							</p>
						</li>
					-->
					</ul>
				</div>
			</div>
			<div id="col-3">
				<div class="edit">
					<div id="edit-1">
						<div class="edit-left">
							<a href="javascript:ctrlNewNote();" id="ctrl-newnote">新建记事</a>
						</div>
						<div class="edit-right">
							<a href="javascript:ctrlEditNote();" id="ctrl-editnote">编辑</a>
							<a href="javascript:ctrlDelNote();" id="ctrl-delnote">删除</a>
						</div>
					</div>
					<div id="edit-2" style="display: none;">
						<div class="edit-left">
							<a href="javascript:ctrlSaveNote();" id="ctrl-savenote">保存</a>
							<a href="javascript:ctrlCancelNote();" id="ctrl-cancelnote">取消</a>
						</div>
					</div>
				</div>
				<div class="editor-panel">
					<div class="edit-ctrl">
					 
						<a href="#">书写/涂鸦</a>
						<a href="#">复制</a>
						<a href="#">粘贴</a>
						<a id="ctrl-setbold" href="javascript:ctrlSetBold();">加粗(已关)</a>
						<a id='ctrl-readonly' href="javascript:ctrlReadOnly();">只读(已关)</a>
						<a style="position: relative;">
							<div  id="colorSelector"><div></div></div>
						</a>
					</div>
					<div id="edit-container">
						
					</div>
				</div>
			</div>
		</div>
		
	</body>
</html>