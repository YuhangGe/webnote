<?php
function uchr($code) {

	return mb_convert_encoding ("&#".$code.";", "UTF-8", "HTML-ENTITIES"); 
		

}
header("Content-Type: text/plain;charset=utf8");

$text = file_get_contents("char_width.txt");

$t_arr = explode("\n", $text);
echo count($t_arr);
$a = (int)"97";
echo $a;
echo uchr($a);
?>