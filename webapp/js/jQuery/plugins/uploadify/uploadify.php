<?php
/*
Uploadify
Copyright (c) 2012 Reactive Apps, Ronnie Garcia
Released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/

// Define a destination
$targetFolder = '/html/wallpaper/upload/'; // Relative to the root
$timestamp = isset($_POST['timestamp']) ? $_POST['timestamp'] : '';

$verifyToken = md5('unique_salt' . $timestamp);
$category	= isset($_POST['category']) ? rtrim($_POST['category'],'/').'/' : 'test/';
$fix_filename	= isset($_POST['filename']) ? $_POST['filename'] : NULL;

//if (!empty($_FILES) && isset($_POST['token']) && $_POST['token'] == $verifyToken) {
if ( !empty($_FILES) ) {
	$tempFile = $_FILES['Filedata']['tmp_name'];
	$filepath = $targetFolder . ($category!=NULL ? $category : '');
	$targetPath = $_SERVER['DOCUMENT_ROOT'] . $filepath;
	
	// Validate the file type
	$fileTypes = array('jpg','jpeg','gif','png'); // File extensions
	$fileParts = pathinfo($_FILES['Filedata']['name']);
	$fileParts['extension'] = strtolower($fileParts['extension']);
	
	$basename  = $fix_filename!=NULL 
		? $fix_filename 
		: create_sess_id() . '.' . $fileParts['extension'];
	$targetFile = $targetPath . $basename;
	
	if (in_array($fileParts['extension'], $fileTypes )) {
		move_uploaded_file($tempFile, $targetFile );
		echo "{\"filepath\":\"$filepath$basename\", \"filename\":\"$basename\" }";
	} else {
		echo 'Invalid file type.';
	}
}

function create_sess_id($len=32) 
{ 
	// 校验提交的长度是否合法 
	if( !is_numeric($len) || ($len>32) || ($len<16)) {
		return;
	} 
	
	// 获取当前时间的微秒 
	list($u, $s) = explode(' ', microtime()); 
	$time = (float)$u + (float)$s; 
	
	// 产生一个随机数 
	$rand_num = rand(100000, 999999); 
	$rand_num = rand($rand_num, $time); 
	mt_srand($rand_num); 
	$rand_num = mt_rand(); 
	
	// 产生SessionID 
	$sess_id = md5( md5($time). md5($rand_num) ); 
	
	// 截取指定需要长度的SessionID 
	$sess_id = substr($sess_id, 0, $len); 
	return $sess_id; 
}
?>