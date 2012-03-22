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
      	<script type="text/javascript" src="js/utility.js"></script>
      	<script type="text/javascript" src="js/webnote.js"></script>
      	<script type="text/javascript" src="js/render.js"></script>
      	<script type = "text/javascript" src="js/page.js"></script>
      	<script type="text/javascript" src="js/event.js"></script>
      	<script type="text/javascript" src="js/load.js"></script>
      	<script type="text/javascript" src="js/index.js"></script>
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
      	<style type="text/css">
      		#wn-canvas{
      			cursor: text;
    			margin: 0px;
    			outline: none;
    			position: relative;
    			left: 0px;
    			top: 0px;
      		}
      		#wn-caret{
      			position:absolute;
    			display:block;
    			width:1px;
    			background:transparent;
       			left:0px;
    			top: 0px;
    			padding: 0px;
   				margin:0px;
    			outline:none;
    			border:none;
    			resize:none;
    			/*
    			 * important! overflow hidden in chrome
    			 */
    			overflow: hidden;
      		}
      	
    		#wn-editor{
    			width: 600px;
    			height: 700px;
    			padding: 0px;
    			border: 1px solid blue;
    			overflow-x: auto;
    			overflow-y: auto;
    			position: relative;
    			outline: none;
    		}
      	</style>
    </head>
   	<body>
   		<div>
   			<input type="button" value="test" onclick="do_test();" />
   		</div>
   		<div id="wn-editor">
   			<canvas width="400" height="350" id="wn-canvas"></canvas>
   			<textarea id="wn-caret" spellcheck="false" cols='0' rows='0'  ></textarea>
   		</div>
   		
   	</body>
</html>