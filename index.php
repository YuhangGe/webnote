<!doctype html>
<html>
	<head>
		<title>Super Note</title>
		<meta http-equiv="content-type" content="text/html; charset=utf-8"/>

		<script type="text/javascript" src="js/jquery-1.5.1.js"></script>
		<script type="text/javascript" src="js/js-printf.js"></script>

		<script type="text/javascript" src="js/editor/utility.js"></script>
		<script type="text/javascript" src="js/editor/editor.js"></script>
		<script type="text/javascript" src="js/editor/render.js"></script>
		<script type = "text/javascript" src="js/editor/page.js"></script>
		<script type ="text/javascript" src="js/editor/element.js"></script>
		<script type="text/javascript" src="js/editor/event.js"></script>
		<script type="text/javascript" src="js/editor/shortkey.js"></script>
		<script type="text/javascript" src="js/editor/handword.js"></script>
		<script type="text/javascript" src="js/editor/wordseg.js"></script>
		<script type="text/javascript" src="js/editor/doodle.js"></script>
		<script type="text/javascript" src="js/editor/doodle_edit.js"></script>
		<script type="text/javascript" src="js/editor/clipboard.js"></script>
		<script type="text/javascript" src="js/editor/undoredo.js"></script>
		<script type="text/javascript" src="js/editor/load_content.js"></script>
		<script type="text/javascript" src="js/editor/load_doodle.js" ></script>
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

						-->
					</ul>
				</div>
			</div>
			<div id="col-3">
				<div class="edit">
					<div id="edit-1">
						<div class="edit-left">
							<a id="ctrl-switch-readonly" class="ctrl-switch " title="設置編輯區域是否只讀" id='ctrl-readonly' href="javascript:ctrlSwitch('readonly');">只讀</a>
							<a id="ctrl-switch-handword" class="ctrl-switch switch-current"  href="javascript:ctrlSwitch('handword');">文字</a>
							<a id="ctrl-switch-doodle" class="ctrl-switch"  id="ctrl-doodle" href="javascript:ctrlSwitch('doodle');" title="塗鴉模式下您可以繪製塗鴉">塗鴉</a>
							<a id="ctrl-switch-doodle-edit" class="ctrl-switch"  id="ctrl-doodle-edit" href="javascript:ctrlSwitch('doodle-edit');" >选择</a>
						</div>
						<div class="edit-right">
							<span id='ctrl-edit-new'> <a href="javascript:ctrlNewNote();" id="ctrl-newnote">新建記事</a> </span>
							<span id='ctrl-edit-save' class="hidden"> <a href="javascript:ctrlSaveNote();" id="ctrl-savenote">儲存</a> <a href="javascript:ctrlCancelNote();" id="ctrl-cancelnote">取消</a> </span>

							<!--
							<a href="javascript:ctrlEditNote();" id="ctrl-editnote">編輯</a>
							<a href="javascript:ctrlDelNote();" id="ctrl-delnote">刪除</a>
							-->
						</div>
					</div>

				</div>
				<div class="editor-panel">
					<div class="edit-ctrl">
						<div style="padding-left:10px;">
							<div id="ctrl-panel-readonly" class="hidden" style="font-size:10px;color:gray;">
								<p>
									當前處於唯讀模式
								</p>
							</div>
							<div id='ctrl-panel-handword'>
								<a href="javascript:alert('由於流覽器安全限制，請使用Ctrl+C复制!');" title="複製選中文本">複製</a>
								<a href="javascript:alert('由於流覽器安全限制，請使用Ctrl+V粘貼!');" title="粘貼選中文本">粘貼</a>
								<a title="設置文本是否加粗" id="ctrl-setbold" href="javascript:ctrlSetBold();">加粗(已關)</a>
								<span class="ctrl-seperator"></span>
								<a id="ctrl-find" href="javascript:ctrlFind();">查找</a>
								<input type="text" style="width:60px;position: relative; top: -10px;" id="ctrl-find-txt" value="筆記" onkeydown="ctrlFindText(event);"/>
								<span class="ctrl-seperator"></span>
								<span id='color-picker'> <a id='ctrl-color-black' href="javascript:ctrlSetColor('black')" class="color-block color-current" style="background: black;"></a> <a id='ctrl-color-blue' href="javascript:ctrlSetColor('blue')" class="color-block" style="background: blue;"></a> <a id='ctrl-color-red' href="javascript:ctrlSetColor('red')" class="color-block" style="background: red;"></a> <a id='ctrl-color-green' href="javascript:ctrlSetColor('green')" class="color-block" style="background: green;"></a> </span>
							</div>
							<div  id="ctrl-panel-doodle" class="hidden">
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
								<span class="ctrl-seperator"></span>
							</div>
							<div  id="ctrl-panel-doodle-edit">
								<!--
								<a href="javascript:;" title="複製選中文本">複製</a>
								<a href="javascript:;" title="粘貼選中文本">粘貼</a>
								-->
								<p style="color:gray;">
									選擇模式下請使用鼠標選擇和編輯塗鴉
								</p>
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