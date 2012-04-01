<?php
$book_id = $_REQUEST['bookid'];
$path = 'books';
$b_path = $path . "/" . $book_id;
$handle = opendir($b_path);

$pages = array();
while ($file = readdir($handle)) {
	if ($file != '.' && $file != '..' && is_dir($b_path . '/' . $file)) {
		$pages[] = array('pageid' => $file, 'date' => '2012年4月1日' ,'thumb'=> 'data/'.$b_path.'/'.$file.'/Thumb');
	}
}

echo json_encode(array('status' => 0, 'pages' => $pages));
?>