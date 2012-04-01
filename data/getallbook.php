<?php
header("Content-Type: text/plain;charset=utf-8");

$path = "books";

$books = array();

function getPages($book_id) {
	global $path;
	$b_path = $path . "/" . $book_id;
	$handle = opendir($b_path);
	$p_num = 0;
	$pages = array();
	while ($file = readdir($handle)) {
		if ($file != '.' && $file != '..' && is_dir($b_path . '/' . $file)) {
			$p_num++;
			$pages[] = array('pageid' => $file, 'date' => '2012年4月1日');
		}
	}
	return array('pagenum' => $p_num, 'pages' => $pages);
}

$handle = opendir($path);
$i = 1;
while ($file = readdir($handle)) {
	if ($file != '.' && $file != '..' && is_dir($path . '/' . $file)) {
		$b_p = getPages($file);
		$b = array('bookid' => $file,'name'=>"笔记($i)", 'type' => 'pad', 'pagenum' => $b_p['pagenum'], 'pages' => $b_p['pages']);
		$books[]=$b;
		$i++;
	}
}

echo  json_encode(array('status'=>0,'books'=>$books));
?>