<?php

function hw2str($h) {
	$out = "";

	$out .= uchr($h['index'], $h['width'], $h['height']) . encode_float($h['weight']) . clr2chr($h['color']) . uchr(count($h['bihua']));

	//printf("%d\n",count($h['bihua']));
	for ($i = 0; $i < count($h['bihua']); $i++) {

		$b = $h['bihua'][$i];
		$out .= uchr(count($b) / 2);
		for ($j = 0; $j < count($b) / 2; $j++) {
			//printf("%d,%d  ",$b[$j],$b[$j+1]);
			$out .= uchr($b[$j * 2], $b[$j * 2 + 1]);
		}
	}

	return $out;
}

$hand_word = array();
$text = array();
$style_bold = array();
$style_color = array();

//echo reverce_int(0x12345678);
//	exit();
$i_fname = 'books/' . $bookid . '/' . $pageid . '/' . "items";
if (!file_exists($i_fname)) {
	echo uchr(0,0,0,0);
} else {
	$file = fopen($i_fname, "rb");
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
					//err('007');
					//$width['value'] = 60;
					$new_hand['width'] = 0;
					$arr = $width;
				} else {
					$new_hand['width'] = $width['value'];
					$arr = read_tlv($file);
				}

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
				$new_bold = array('start' => 0, 'end' => 0, 'bold' => false);
				$style = read_tlv($file);
				if ($style['type'] != (int)0x03040003) {
					err("1003");
				}
				$new_bold['bold'] = $style['value'] == (int)1;
				//print_r($style)
				$s = read_tlv($file);
				if ($s['type'] != (int)0x03040001) {
					err("1001");
				}
				$new_bold['start'] = $s['value'];
				$e = read_tlv($file);
				if ($e['type'] != (int)0x03040002) {
					err("1002");
				}
				$new_bold['end'] = $e['value'];

				$style_bold[] = $new_bold;
			} elseif ($tlv['type'] == 0x03050000) {//color
				$new_color = array('start' => 0, 'end' => 0, 'color' => 0xff0000);

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

				$style_color[] = $new_color;

			}

		}
	} catch(Exception $e) {
		echo $e;
	}

	fclose($file);

	$output = uchr(mb_strlen($content['value'], 'utf8')) . $content['value'] . uchr(count($hand_word));
	for ($i = 0; $i < count($hand_word); $i++) {
		$output .= $hand_word[$i];
	}
	$output .= uchr(count($style_bold));

	for ($i = 0; $i < count($style_bold); $i++) {
		$output .= uchr($style_bold[$i]['start'], $style_bold[$i]['end']);
	}
	$output .= uchr(count($style_color));

	for ($i = 0; $i < count($style_color); $i++) {
		$output .= uchr($style_color[$i]['start'], $style_color[$i]['end']) . clr2chr($style_color[$i]['color']);
	}

	echo $output;

}
?>