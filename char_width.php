<?php
function uchr($code) {

	return mb_convert_encoding ("&#".$code.";", "UTF-8", "HTML-ENTITIES"); 
		

}
header("Content-Type: text/plain;charset=utf8");

$text = file_get_contents("char_width.txt");

$t_arr = explode("\n", $text);
echo count($t_arr);
$text_out = "";
$pre_t = (int)$t_arr[0];
$c = 1;
for($i=1;$i<count($t_arr);$i++){
	$t=(int)$t_arr[$i];
	if($t!=$pre_t){
		$text_out.= uchr($c).uchr($pre_t);
		$pre_t = $t;
		$c = 1;
	}else{
		$c++;
	}
}
$text_out.= uchr($c).uchr($pre_t);
file_put_contents("char_width_table.txt", $text_out);
?>