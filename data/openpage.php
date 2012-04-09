<?php
header("Content-Type: text/plain;charset=utf-8");

if (!function_exists('json_encode')) {
	function json_encode($content) {
		require_once 'JSON.php';
		$json = new Services_JSON;
		return $json -> encode($content);
	}

}
function uchr($codes) {
	if (is_scalar($codes)) {
		$codes = func_get_args();
	}
	$str = '';
	foreach ($codes as $code) {
		$str .= mb_convert_encoding("&#" . $code . ";", "UTF-8", "HTML-ENTITIES");
	}
	return $str;
}

function reverce_int($num) {
	//echo (($num & 0xff000000)>>24) & 0x000000ff;
	return ((($num & 0x000000ff)<<24) & 0xff000000) | ((($num & 0x0000ff00)<<8) & 0x00ff0000) | ((($num & 0x00ff0000)>>8) & 0x0000ff00) | ((($num & 0xff000000)>>24) & 0x000000ff);
}

function encode_float($f) {
	$t = $f . "";
	return uchr(strlen($t)) . $t;
}

function read_tlv($file) {
	if (feof($file)) {
		//echo 'eof';
		return false;
	}

	$type = unpack("l*", fread($file, 4));
	if (count($type) == 0) {
		return false;
	}
	//print_r($type);
	$type = reverce_int($type[1]);

	//printf("type: %s<br/>", dechex($type));

	$size = unpack("l*", fread($file, 4));
	$size = reverce_int($size[1]);
	if ($size > 0) {
		//	 printf("read dir size:%s(%d)<br/>",dechex($size),$size);
		$data = fread($file, $size);
	} elseif ($size < 0) {
		$tmp = $size & 0xff000000;
		$size &= 0x00ffffff;
		//	 printf("read size:%s(%d)<br/>",dechex($size),$size);
		$data = fread($file, $size);
		//  printf("tmp-:0x%08X<br/>",$tmp);
		switch ($tmp) {
			case (int)0x9f000000 :
			//echo strlen($data)." ";
			// $data = str_replace("\xEF\xBF\xBC", "", $data);
			//echo mb_strlen($data, 'utf8') . " ";
			//$data = mb_convert_encoding($data, "ascii",'utf8');
			//print_r($data);
			//echo "<br/>";
				break;
			case (int)0x91000000 :
			//short[]
			//	printf("size:%d",$size);
				$data = _2short_arr($data);
				//unpack("n*", $data);
				//print_r($data);
				break;
			case (int)0x81000000 :
				$data = _2short($data);
				//printf("short:%d\n",$data);
				break;
			case (int)0x82000000 :
			// print_r($data);
				$data = _2int($data);

				// printf("int:0x%08X(%d)<br/>",$data,$data);
				break;
			case (int)0x84000000 :
				$data = _2long($data);
				break;
			case (int)0x83000000 :
				$data = _2float($data);

				//print($data."\n");
				break;

			case (int)0x93000000 :
			//float[]
			//printf("size:%d\n",$size);
				$data = _2float_arr($data);
				//print_r($data);
				break;
			case (int)0x92000000 :
			//int[]
				$data = _2int_arr($data);
				break;
			default :
			//echo 'no';
				break;
		}

	} else {
		$data = null;
	}

	//echo $type.",".$size."<br/>";

	return array('type' => $type, 'length' => $size, 'value' => $data);
}

function _2int_arr($data) {
	$arr = array();
	for ($i = 0; $i < strlen($data) / 4; $i++) {
		$tmp = substr($data, $i * 4, 4);
		$arr[] = _2int($tmp);
	}
	return $arr;
}

function _2float_arr($data) {
	$arr = array();
	//printf("fa:%d\n",strlen($data));
	for ($i = 0; $i < strlen($data) / 4; $i++) {
		$tmp = substr($data, $i * 4, 4);
		$arr[] = _2float($tmp);
	}
	return $arr;
}

function _2float($data) {
	$tmp = $data[0];
	$data[0] = $data[3];
	$data[3] = $tmp;
	$tmp = $data[1];
	$data[1] = $data[2];
	$data[2] = $tmp;
	$tmp = unpack("f*", $data);
	return round($tmp[1], 3);
}

function _2short($data) {
	$tmp = unpack("C*", $data);
	return ($tmp[2] & 0x000000ff) | (($tmp[1]<<8) & 0x0000ff00);
}

function _2int($data) {
	$tmp = unpack("C*", $data);
	//	print_r($tmp);
	return ($tmp[4] & 0x000000ff) | (($tmp[3]<<8) & 0x0000ff00) | (($tmp[2]<<16) & 0x00ff0000) | (($tmp[1]<<24) & 0xff000000);
	//return (($tmp[1]>>24)&0x000000ff)|(($tmp[2]>>8)&0x00ff0000)|(($tmp[3]<<8)&0x0000ff00)|(($tmp[4]<<24)&0xff000000);
}

function _2long($data) {
	//echo strlen($data);
	//$tmp = unpack("C*",$data);
	//print_r($tmp);
	return 0;
}

function _2short_arr($data) {
	$tmp = unpack("C*", $data);
	//printf("si2:%d",count($tmp));
	$rtn = array();
	for ($i = 1; $i <= count($tmp); $i += 2) {
		$n = (($tmp[$i]<<8) & 0x0000ff00) | ($tmp[$i + 1] & 0x000000ff);
		$rtn[] = $n;
		//printf("%02X,",$n);
	}
	//printf("s3:%d,",count($rtn));
	return $rtn;
}

function clr2chr($color) {
	//print_r($color);
	return uchr(($color>>16) & 0x000000ff, ($color>>8) & 0x000000ff, $color & 0x000000ff);
}

function err($msg) {
	echo "<div style='color:red;'>" . $msg . "</div>";
}

echo uchr(0);

$bookid = $_REQUEST['bookid'];
$pageid = $_REQUEST['pageid'];

include 'load_item.php';
include 'load_doodle.php';

