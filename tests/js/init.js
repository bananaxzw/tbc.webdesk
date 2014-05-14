(function(global) {

	global.code = {
		view: function (elem) {
			var code, $elem;
			if (elem) {
				$elem = $(elem);
				code = this.highlight($elem.html());

				$(code).insertAfter($elem);
			}
		},

		highlight: function(code) {
			return !code ? "" : (
				'<pre><code class="hljs javascript">'+
					hljs.highlight('js', code).value +
				'</code></pre>');
		}
	}

}(this));