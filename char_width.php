<?php
function uchr($code) {

	return mb_convert_encoding ("&#".$code.";", "UTF-8", "HTML-ENTITIES"); 
		

}
header("Content-Type: text/plain;charset=utf8");

$text = file_get_contents("char_width.txt");

$t_arr = explode("\n", $text);
echo count($t_arr);
$text_out = "";
foreach($t_arr as $t){
	$text_out.= uchr((int)$t);
}

file_put_contents("char_width_table.txt", $text_out);
?>