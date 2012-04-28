<!doctype html>
<html>
	<head>
		<title>Super Note</title>
		<meta http-equiv="content-type" content="text/html; charset=utf-8"/>

		<script type="text/javascript" src="js/jquery-1.5.1.js"></script>
		<script type="text/javascript" src="js/js-printf.js"></script>

		<script type="text/javascript" src="js/jquery.qtip.min.js"></script>
		<link type="text/css" rel="stylesheet" href="css/jquery.qtip.min.css" />

		<script type="text/javascript" src="js/simple-color-picker.js"></script>

		<script type="text/javascript" src="js/colorpicker.js"></script>
		<link rel="stylesheet" media="screen" type="text/css" href="css/colorpicker.css" />

		<script type="text/javascript" src="js/editor/utility.js"></script>
		<script type="text/javascript" src="js/editor/editor.js"></script>
		<script type="text/javascript" src="js/editor/render.js"></script>
		<script type = "text/javascript" src="js/editor/page.js"></script>
		<script type ="text/javascript" src="js/editor/element.js"></script>
		<script type="text/javascript" src="js/editor/event.js"></script>
		<script type="text/javascript" src="js/editor/handword.js"></script>
		<script type="text/javascript" src="js/editor/doodle.js"></script>
		<script type="text/javascript" src="js/editor/doodle_edit.js"></script>
		<script type="text/javascript" src="js/editor/clipboard.js"></script>
		<script type="text/javascript" src="js/editor/undoredo.js"></script>
		<script type="text/javascript" src="js/editor/load_content.js"></script>
		<script type="text/javascript" src="js/editor/load_doodle.js" ></script>

		<script type="text/javascript" src="js/editor/filter/blur.js"></script>
		<script type="text/javascript" src="js/editor/filter/blur2.js"></script>
		<script type="text/javascript" src="js/editor/filter/blur3.js"></script>
		<script type="text/javascript" src="js/editor/filter/emboss.js"></script>

		<script type="text/javascript" src="js/index.js"></script>
		<script type="text/javascript" src="js/ctrl.js"></script>
		<link rel="stylesheet" type="text/css" href="css/editor.css" />
		<link type="text/css" rel="stylesheet" href="css/style.css" />

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
						筆記本<a href="javascript:void();" style="float:right;font-size:12px;">添加</a>
					</div>
					<ul id="book-list">
						<li>
							<p>
								正在加載筆記本...
							</p>
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
					<p>
						您好,&nbsp;<span>華碩科技</span><a>退出登錄</a>
					</p>

				</div>
				<div class="note-list">
					<div class="sub-title">
						筆記預覽
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
							<a href="javascript:ctrlNewNote();" id="ctrl-newnote">新建記事</a>
						</div>
						<div class="edit-right">
							<a href="javascript:ctrlEditNote();" id="ctrl-editnote">編輯</a>
							<a href="javascript:ctrlDelNote();" id="ctrl-delnote">刪除</a>
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
						<div>

							<a class="ctrl-switch" title="設置編輯區域是否只讀" id='ctrl-readonly' href="javascript:ctrlSwitch('readonly');">只讀</a>
							<a class="ctrl-switch"  href="javascript:ctrlSwitch('handword');">文字</a>
							<a class="ctrl-switch"  id="ctrl-doodle" href="javascript:ctrlSwitch('doodle');" title="塗鴉模式下您可以繪製塗鴉">塗鴉</a>
							<a class="ctrl-switch"  id="ctrl-doodle-edit" href="javascript:ctrlSwitch('doodle_edit');" >选择</a>
						</div>
						<div style="padding-left:5px;">
							<div id="ctrl-readonly-panel" style="display:none;">
								<p>当前处于只读模式</p>
							</div>
							<div id='ctrl-handword-panel'>
								<a href="javascript:;" title="複製選中文本">複製</a>
								<a href="javascript:;" title="粘貼選中文本">粘貼</a>
								<a title="設置文本是否加粗" id="ctrl-setbold" href="javascript:ctrlSetBold();">加粗(已關)</a>
								<span>
									<a href="javascript:ctrlSetColor('black')" class="color-block" style="background: black;"></a>
									<a href="javascript:ctrlSetColor('black')" class="color-block" style="background: blue;"></a>
									<a href="javascript:ctrlSetColor('black')" class="color-block" style="background: red;"></a>
									<a href="javascript:ctrlSetColor('black')" class="color-block" style="background: green;"></a>
								</span>
							</div>
							<div  id="ctrl-doodle-panel" style="display:none;">
								<a href="javascript:;" title="選擇畫筆類型">畫筆：</a>
								<select id="ctrl-doodle-type" onchange="ctrlSetDoodleType();">
									<option>普通</option>
									<option>浮雕</option>
									<option>模糊</option>
									<option>空心</option>
									<option>透明</option>
									<option>直線</option>
									<option>矩形</option>
									<option>圓形</option>
									<option>橡皮擦</option>
								</select>
								<a href="javascript:;" title="選擇畫筆寬度">寬度：</a>
								<select id="ctrl-doodle-weight" onchange="ctrlSetDoodleWeight();">
									<option>4</option>
									<option>6</option>
									<option selected>9</option>
									<option>13</option>
									<option>18</option>
								</select>
								<span> </span>
							</div>
							<div  id="ctrl-doodle-edit-panel" style="display:none;">
								<a href="javascript:;" title="複製選中文本">複製</a>
								<a href="javascript:;" title="粘貼選中文本">粘貼</a>
							</div>
						</div>

					</div>

					<div id="edit-container">

					</div>
				</div>
			</div>
		</div>

		</style>
	</body>
</html>