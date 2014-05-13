<!DOCTYPE HTML>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>UploadiFive Test</title>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js" type="text/javascript"></script>
<script src="jquery.uploadify.js" type="text/javascript"></script>
<link rel="stylesheet" type="text/css" href="uploadify.css">
<style type="text/css">
body {
	font: 13px Arial, Helvetica, Sans-serif;
}
</style>
</head>

<body>
	<form action="uploadify.php" enctype="multipart/form-data" method="post">
		<div id="queue"></div>
		<input id="file_upload" name="file_upload" type="file" multiple>
        <input type="submit"/>
	</form>

	<script type="text/javascript">
		<?php $timestamp = time();?>
		$(function() {
			$('#file_upload').uploadify({
				/**
				'formData' : {
					'timestamp' : '<?php echo $timestamp;?>',
					'token'     : '<?php echo md5('unique_salt' . $timestamp);?>',
					'category'	: 'products',
					'filename'	: 'ss.jpg'
				},
				**/
				'fileTypeExts'	: "*.jpg",
				'fileTypeDesc'	: "图片",
				'swf'      : 'uploadify.swf',
				'uploader' : 'uploadify.php',
				'onUploadSuccess' : function ( file, data, response ) {
					var s= response;
					debugger;
				}
			});
		});
	</script>
</body>
</html>