<?php
	include("load.php");
?>
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
		<script type="text/javascript" src="js/editor/load.js"></script>
		
		<script type="text/javascript" src="js/layout.js"></script>
		<script type="text/javascript" src="js/index.js"></script>
		
		<link rel="stylesheet" type="text/css" href="css/editor.css" />
		<link type="text/css" rel="stylesheet" href="css/style.css" />
		
		 <script type="text/javascript">
			var WNItem = {
				text_array:<?php echo json_encode($text);?>,
				hand_array:[<?php 
				for($i=0;$i<count($hand_word);$i++){
					echo "'".$hand_word[$i]."',";	
				}?>],
				bold_array : '<?php 
				$bout = "";
				$bnum = 0;
				for($i=0;$i<count($style_bold);$i++){
					$s = $style_bold[$i];
					if($s['bold']==false)
						continue;
					$bnum++;
					$bout.= int2chr($s['start']).int2chr($s['end']);
				}
				echo int2chr($bnum).$bout;
				?>',
				color_array:'<?php 
				echo int2chr(count($style_color));
				for($i=0;$i<count($style_color);$i++){
					$s = $style_color[$i];
					echo int2chr($s['start']).int2chr($s['end']).clr2chr($s['color']);
				}?>'
				
			}
		</script>
	</head>
	<body>
		<div id="top-menu"></div>
		<div id="web-note">
			<div id="col-1">
				<div class="logo">
					<h2>WebNote</h2>
				</div>
				<div class="book-list">
					<div class="sub-title">
						笔记本<a href="#" style="float:right;font-size:12px;">添加</a>
					</div>
					<ul>
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
					</ul>
				</div>
			</div>
			<div id="col-2">
				<div class="search">
					<input type="text" />
					<span>搜索</span>
				</div>
				<div class="note-list">
					<div class="sub-title">
						排序方式
						<select>
							<option value="1">修改时间</option>
						</select>
					</div>
					<ul id="note-list">
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
						<li>
							<p><img src="adb/thumb.png" />
							</p>
							<p>
								2012年3月26日
							</p>
						</li>
					</ul>
				</div>
			</div>
			<div id="col-3">
				<div class="edit">
					<div id="edit-1">
						<div class="edit-left">
							<a href="#" id="btn-new-note">新建记事</a>
						</div>
						<div class="edit-right">
							<a href="#" id="btn-edit-note">编辑</a>
							<a href="#" id="btn-del-note">删除</a>
						</div>
					</div>
					<div id="edit-2" style="display: none;">
						<div class="edit-left">
							<a href="#" id="btn-save-note">保存</a>
							<a href="#" id="btn-cancel-note">取消</a>
						</div>
					</div>
				</div>
				<div class="editor-panel">
					<div class="edit-ctrl">
						<select>
							<option>笔记1(phone)</option><option>笔记2(pad)</option>
						</select>
						<a href="#">书写/涂鸦</a><a href="#">颜色</a><a href="#">粗细</a>
						<a href="#">复制</a>
					</div>
					<div id="edit-container">
						<!-- web note editor -->
						<div id="wn-editor">
							<canvas width="400" height="350" id="wn-canvas"></canvas>
							<textarea id="wn-caret" spellcheck="false" cols='0' rows='0'  ></textarea>
						</div>
						<!-- -->
					</div>
				</div>
			</div>
		</div>
		
	</body>
</html>