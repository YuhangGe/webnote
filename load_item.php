<?php
header("Content-Type: text/plain;charset=utf-8");

function uchr($codes) {
	if(is_scalar($codes)) {
	$codes=func_get_args();
	}
	$str='';
	foreach($codes as $code) {
		$str.= mb_convert_encoding ("&#".$code.";", "UTF-8", "HTML-ENTITIES");
	}
	return $str;
}

function reverce_int($num) {
	//echo (($num & 0xff000000)>>24) & 0x000000ff;
	return ((($num & 0x000000ff)<<24) & 0xff000000) | ((($num & 0x0000ff00)<<8) & 0x00ff0000) | ((($num & 0x00ff0000)>>8) & 0x0000ff00) | ((($num & 0xff000000)>>24) & 0x000000ff);
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
				$data = _2short_arr($data); //unpack("n*", $data);
					//print_r($data);
				break;
			case (int)0x82000000 :
			// print_r($data);
			
				$data = _2int($data);
				
				// printf("int:0x%08X(%d)<br/>",$data,$data);
				break;
			case (int)0x83000000 :
			// print_r(unpack("C*",$data));
			//	 $data=unpack("f*",$data);
				$data = 1;
				//$data[1];
				//printf("float:%f<br/>",$data);
				break;
			default :
				echo 'no';
				break;
		}

	} else {
		$data = null;
	}

	//echo $type.",".$size."<br/>";

	return array('type' => $type, 'length' => $size, 'value' => $data);
}

function _2int($data) {
	$tmp = unpack("C*", $data);
	//	print_r($tmp);
	return ($tmp[4] & 0x000000ff) | (($tmp[3]<<8) & 0x0000ff00) | (($tmp[2]<<16) & 0x00ff0000) | (($tmp[1]<<24) & 0xff000000);
	//return (($tmp[1]>>24)&0x000000ff)|(($tmp[2]>>8)&0x00ff0000)|(($tmp[3]<<8)&0x0000ff00)|(($tmp[4]<<24)&0xff000000);
}
function _2short_arr($data){
	$tmp = unpack("C*",$data);
	//printf("si2:%d",count($tmp));
	$rtn = array();
	for($i=1;$i<=count($tmp);$i+=2){
		$n = (($tmp[$i]<<8)&0x0000ff00)|($tmp[$i+1]&0x000000ff);
		$rtn[] = $n;
		//printf("%02X,",$n);
	}
	//printf("s3:%d,",count($rtn));
	return $rtn;
}

function clr2chr($color) {
	//print_r($color);
	return uchr(($color>>16)&0x000000ff,($color>>8)&0x000000ff,$color&0x000000ff);
}

function err($msg) {
	echo "<div style='color:red;'>" . $msg . "</div>";
}


if(empty($_REQUEST['file']))
	$file_name = "adb\\data2\\";
else
	$file_name = $_REQUEST['file'];

if (!file_exists($file_name."items")) {
	echo "no file";
	exit(-1);
}

$hand_word = array();
$text = array();
$style_bold = array();
$style_color = array();

//echo reverce_int(0x12345678);
//	exit();
$file = fopen($file_name."items", "rb");
read_tlv($file);
read_tlv($file);

$content = read_tlv($file);

read_tlv($file);
try {
	while ($tlv = read_tlv($file)) {
		if ($tlv['type'] == 0x03030000) {
			$new_hand = array('index' => 0, 'color' => 'black', 'width' => 0, 'height' => 0, 'weight' => 0, 'bihua' => array());

			$s = read_tlv($file);
			if ($s['type'] != (int)0x03030001) {
				err("001");
			}
			$new_hand['index'] = $s['value'];

			$e = read_tlv($file);
			if ($e['type'] != (int)0x03030002) {
				err("002");
			}
			$color = read_tlv($file);
			if ($color['type'] != (int)0x03030003) {
				err("003");
			}
			$new_hand['color'] = $color['value'];

			$weight = read_tlv($file);
			if ($weight['type'] != (int)0x03030004) {
				err('004');
			}
			$new_hand['weight'] = $weight['value'];

			$height = read_tlv($file);
			if ($height['type'] != (int)0x03030005) {
				err('005');
			}
			$new_hand['height'] = $height['value'];

			$width = read_tlv($file);
			if ($width['type'] != (int)0x03030007) {
				err('007');
			}
			$new_hand['width'] = $width['value'];

			$arr = read_tlv($file);
			if ($arr['type'] != (int)0x03030006) {
				err('006');
			}
			//print_r($arr);
			$new_hand['bihua'][] = $arr['value'];

			while ($arr['type'] != (int)0x0303ffff) {
				$arr = read_tlv($file);
				if ($arr['type'] != (int)0x03030006 && $arr['type'] != (int)0x0303ffff) {
					err('006');
				}
				if ($arr['type'] != (int)0x0303ffff)
					$new_hand['bihua'][] = $arr['value'];
			}
			//print_r($new_hand);
			
			$hand_word[] = hw2str($new_hand);

		} elseif ($tlv['type'] == 0x03040000) {//bold
			$new_bold = array('start'=>0,'end'=>0,'bold'=>false);
			$style = read_tlv($file);
			if ($style['type'] != (int)0x03040003) {
				err("1003");
			}
			$new_bold['bold']=$style['value']==(int)1;
			//print_r($style)
			$s = read_tlv($file);
			if ($s['type'] != (int)0x03040001) {
				err("1001");
			}
			$new_bold['start']=$s['value'];
			$e = read_tlv($file);
			if ($e['type'] != (int)0x03040002) {
				err("1002");
			}
			$new_bold['end']=$e['value'];
			
			$style_bold[] = $new_bold;
		} elseif ($tlv['type'] == 0x03050000) {//color
			$new_color = array('start'=>0,'end'=>0,'color'=>0xff0000);
			
			$color = read_tlv($file);
			if ($color['type'] != (int)0x03050003) {
				err("2003");
			}
			$new_color['color'] = $color['value'];
			//printf("0x%08X",$color['value']);
			
			//print_r($color);
			$s = read_tlv($file);
			if ($s['type'] != (int)0x03050001) {
				err("2001");
			}
			$new_color['start'] = $s['value'];
			
			$e = read_tlv($file);
			if ($e['type'] != (int)0x03050002) {
				err("2002");
			}
			$new_color['end'] = $e['value'];
			
			$style_color[]=$new_color;
			
		}

	}
} catch(Exception $e) {
	echo $e;
}

fclose($file);


function hw2str($h){
	$out = "";
	
	$out.= uchr($h['index'],$h['width'],$h['height'],$h['weight']).clr2chr($h['color']).uchr(count($h['bihua']));
	
	//printf("%d\n",count($h['bihua']));
	for($i=0;$i<count($h['bihua']);$i++){
		
		$b = $h['bihua'][$i];
		$out.=uchr(count($b)/2);
		for($j=0;$j<count($b)/2;$j++){
			//printf("%d,%d  ",$b[$j],$b[$j+1]);
			$out.= uchr($b[$j*2],$b[$j*2+1]);	
		}
	}
	
	return $out;
}

$output = uchr(mb_strlen($content['value'], 'utf8')).$content['value'].uchr(count($hand_word));
for($i=0;$i<count($hand_word);$i++){
	$output.=$hand_word[$i];
}
$output.=uchr(count($style_bold));

for($i=0;$i<count($style_bold);$i++){
	$output.=uchr($style_bold[$i]['start'],$style_bold[$i]['end']);
}
$output.=uchr(count($style_color));

for($i=0;$i<count($style_color);$i++){
	$output.=uchr($style_color[$i]['start'],$style_color[$i]['end']).clr2chr($style_color[$i]['color']);
}

echo $output;
?>
