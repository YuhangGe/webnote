<?php

function read_doodle_list($file, $end) {
	$doodle_list = array();

	while ($tlv = read_tlv($file)) {
		if ($tlv['type'] == $end) {
			//阵列结束
			break;
		} elseif ($tlv['type'] == (int)0x04070000) {
			//图片doodle
			//printf("image/n");
			read_tlv($file);
			//base begin;
			$p_base = read_base_tlv($file);
			$p_name = read_tlv($file);
			$p_matrix = read_tlv($file);

			read_tlv($file);
			//pic end;
			$doodle_list[] = array('type' => 'image', 'base' => $p_base, 'file_name' => $p_name['value'], 'matrix' => $p_matrix['value']);

		} elseif ($tlv['type'] == (int)0x04050000) {//bold

			//群组doodle
			read_tlv($file);
			//base begin
			$q_base = read_base_tlv($file);
			$q_base['type'] = 11;
			$q_zorder = read_tlv($file);
			read_tlv($file);
			//list begin
			$q_list = read_doodle_list($file, (int)0x0406FFFF);

			$doodle_list[] = array('type' => 'group', 'base' => $q_base, 'zorder' => $q_zorder['value'], 'list' => $q_list);

		} elseif ($tlv['type'] == (int)0x04080000) {
			//点类doodle

			read_tlv($file);
			//base begin
			$d_base = read_base_tlv($file);
			
			$d_list = read_tlv($file);
			read_tlv($file);
			//点类end

			$doodle_list[] = array('type' => 'point', 'base' => $d_base, 'point_arr' => $d_list['value']);

		}

	}

	return $doodle_list;
}

function read_base_tlv($file) {

	$type = read_tlv($file);
	//type
	$w = read_tlv($file);
	//width
	$c = read_tlv($file);
	//color

	$rtn_type = array('type' => $type['value'], 'width' => $w['value'], 'color' => $c['value'], 'eraser_list' => array());

	read_tlv($file);
	//eraser list begin

	while ($tlv = read_tlv($file)) {
		$t = $tlv['type'];
		if ($t == (int)0x0403FFFF) {
			//eraser list end
			break;
		} elseif ($t == (int)0x04040000) {
			//eraser
			read_tlv($file);
			//点类 begin
			read_tlv($file);
			//base begin
			$d_base = read_base_tlv($file);
			$d_list = read_tlv($file);
			read_tlv($file);
			//点类end

			$rtn_type['eraser_list'][] = array('type' => 'point', 'base' => $d_base, 'point_arr' => $d_list['value']);

			read_tlv($file);
			//eraser end
		}

	}

	read_tlv($file);
	//基本物件 end

	return $rtn_type;

}

function encode_base($b) {
	$rtn = uchr($b['type']) . encode_float($b['width']) . clr2chr($b['color']);
	$e_list = $b['eraser_list'];
	$rtn .= uchr(count($e_list));
	for ($i = 0; $i < count($e_list); $i++) {
		$rtn .= encode_float($e_list[$i]['base']['width']);
		$ps = $e_list[$i]['point_arr'];
		$rtn .= uchr(count($ps) / 2);
		for ($j = 0; $j < count($ps); $j += 2) {
			$rtn .= uchr($ps[$j], $ps[$j + 1]);
		}
	}
	return $rtn;
}

function encode_image_file($fn) {
	global $d_fpath;
	if (!file_exists($d_fpath . $fn)) {
		echo "not find file!";
		return uchr(0);
	}

	$dr = base64_encode(file_get_contents($d_fpath . $fn));
	$len = strlen($dr);
	$h = (($len & 0xffff0000)>>16) & 0x0000ffff;
	$l = $len & 0x0000ffff;
	//printf("len:%d,h:%d,l:%d\n\n",$len,$h,$l);
	return uchr($h, $l) . $dr;
}

function encode_doodle($d) {
	$b = $d['base'];
	$output = encode_base($b);
	if ($d['type'] == 'point') {
		//点类
		$ps = $d['point_arr'];
		$output .= uchr(count($ps) / 2);
		for ($i = 0; $i < count($ps); $i += 2) {
			$output .= uchr($ps[$i], $ps[$i + 1]);
		}
	} elseif ($d['type'] == 'image') {
		$fn = $d['file_name'];
		$output .= encode_image_file($fn);
		$m = $d['matrix'];
		for ($i = 0; $i < 9; $i++) {
			$output .= encode_float($m[$i]);
		}
	} elseif ($d['type'] == 'group') {
		$output .= uchr(count($d['list']));
		foreach ($d['list'] as $l_d) {
			$output .= encode_doodle($l_d);
		}
	}
	return $output;
}

$d_fpath = 'books/' . $bookid . '/' . $pageid . '/';
$d_fname = $d_fpath . "doodle_items";
if (!file_exists($d_fname)) {
	echo uchr(0, 0, 0, 0);
} else {

	$file = fopen($d_fname, "rb");

	read_tlv($file);
	//doodle begin
	$panel_width = read_tlv($file);
	//画布宽

	$panel_height = read_tlv($file);
	//画布高
	$page_id = read_tlv($file);
	//page id

	read_tlv($file);
	//阵列begin

	$doodle_list = read_doodle_list($file, (int)0x0401FFFF);
	fclose($file);

	$output = "";

	$output .= uchr($panel_width['value'], $panel_height['value'], $page_id['value'], count($doodle_list));

	foreach ($doodle_list as $d) {
		$output .= encode_doodle($d);
	}

	echo $output;
}
?>
