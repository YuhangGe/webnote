<?php
function uchr($codes) {
	if(is_scalar($codes)) {
	$codes=func_get_args();
	}
	$str='';
	foreach($codes as $code) {
		$str.=html_entity_decode('&#'.$code.';',ENT_QUOTES,'UTF-8');
		//$str.= mb_convert_encoding ("&#".$code.";", "UTF-8", "HTML-ENTITIES"); 
		
	}
	return $str;
}
header("Content-Type: text/plain;charset=utf8");

$a = 3.456;
$b = $a."";
echo strlen($b);
?>