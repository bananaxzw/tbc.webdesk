/*!
 * jQuery JavaScript Library v1.7.1
 * http://jquery.com/
 *
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Mon Nov 21 21:11:03 2011 -0500
 */
(function( window, undefined ) {

// Use the correct document accordingly with window argument (sandbox)
var document = window.document,
	navigator = window.navigator,
	location = window.location;
var jQuery = (function() {

// Define a local copy of jQuery
var jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// A central reference to the root jQuery(document)
	rootjQuery,

	// A simple way to check for HTML strings or ID strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

	// Check if a string has a non-whitespace character in it
	rnotwhite = /\S/,

	// Used for trimming whitespace
	trimLeft = /^\s+/,
	trimRight = /\s+$/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,

	// Useragent RegExp
	rwebkit = /(webkit)[ \/]([\w.]+)/,
	ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
	rmsie = /(msie) ([\w.]+)/,
	rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,

	// Matches dashed string for camelizing
	rdashAlpha = /-([a-z]|[0-9])/ig,
	rmsPrefix = /^-ms-/,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return ( letter + "" ).toUpperCase();
	},

	// Keep a UserAgent string for use with jQuery.browser
	userAgent = navigator.userAgent,

	// For matching the engine and version of the browser
	browserMatch,

	// The deferred used on DOM ready
	readyList,

	// The ready event handler
	DOMContentLoaded,

	// Save a reference to some core methods
	toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	slice = Array.prototype.slice,
	trim = String.prototype.trim,
	indexOf = Array.prototype.indexOf,

	// [[Class]] -> type pairs
	class2type = {};

jQuery.fn = jQuery.prototype = {
	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem, ret, doc;

		// Handle $(""), $(null), or $(undefined)
		if ( !selector ) {
			return this;
		}

		// Handle $(DOMElement)
		if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}

		// The body element only exists once, optimize finding it
		if ( selector === "body" && !context && document.body ) {
			this.context = document;
			this[0] = document.body;
			this.selector = selector;
			this.length = 1;
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			// Are we dealing with HTML string or an ID?
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = quickExpr.exec( selector );
			}

			// Verify a match, and that no context was specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;
					doc = ( context ? context.ownerDocument || context : document );

					// If a single string is passed in and it's a single tag
					// just do a createElement and skip the rest
					ret = rsingleTag.exec( selector );

					if ( ret ) {
						if ( jQuery.isPlainObject( context ) ) {
							selector = [ document.createElement( ret[1] ) ];
							jQuery.fn.attr.call( selector, context, true );

						} else {
							selector = [ doc.createElement( ret[1] ) ];
						}

					} else {
						ret = jQuery.buildFragment( [ match[1] ], [ doc ] );
						selector = ( ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment ).childNodes;
					}

					return jQuery.merge( this, selector );

				// HANDLE: $("#id")
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The current version of jQuery being used
	jquery: "1.7.1",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return slice.call( this, 0 );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems, name, selector ) {
		// Build a new jQuery matched element set
		var ret = this.constructor();

		if ( jQuery.isArray( elems ) ) {
			push.apply( ret, elems );

		} else {
			jQuery.merge( ret, elems );
		}

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		ret.context = this.context;

		if ( name === "find" ) {
			ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Attach the listeners
		jQuery.bindReady();

		// Add the callback
		readyList.add( fn );

		return this;
	},

	eq: function( i ) {
		i = +i;
		return i === -1 ?
			this.slice( i ) :
			this.slice( i, i + 1 );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ),
			"slice", slice.call(arguments).join(",") );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {
		// Either a released hold or an DOMready/load event and not yet ready
		if ( (wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady) ) {
			// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
			if ( !document.body ) {
				return setTimeout( jQuery.ready, 1 );
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}

			// If there are functions bound, to execute
			readyList.fireWith( document, [ jQuery ] );

			// Trigger any bound ready events
			if ( jQuery.fn.trigger ) {
				jQuery( document ).trigger( "ready" ).off( "ready" );
			}
		}
	},

	bindReady: function() {
		if ( readyList ) {
			return;
		}

		readyList = jQuery.Callbacks( "once memory" );

		// Catch cases where $(document).ready() is called after the
		// browser event has already occurred.
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			return setTimeout( jQuery.ready, 1 );
		}

		// Mozilla, Opera and webkit nightlies currently support this event
		if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", jQuery.ready, false );

		// If IE event model is used
		} else if ( document.attachEvent ) {
			// ensure firing before onload,
			// maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", DOMContentLoaded );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", jQuery.ready );

			// If IE and not a frame
			// continually check to see if the document is ready
			var toplevel = false;

			try {
				toplevel = window.frameElement == null;
			} catch(e) {}

			if ( document.documentElement.doScroll && toplevel ) {
				doScrollCheck();
			}
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	// A crude way of determining if an object is a window
	isWindow: function( obj ) {
		return obj && typeof obj === "object" && "setInterval" in obj;
	},

	isNumeric: function( obj ) {
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {
		return obj == null ?
			String( obj ) :
			class2type[ toString.call(obj) ] || "object";
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call(obj, "constructor") &&
				!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		for ( var name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	parseJSON: function( data ) {
		if ( typeof data !== "string" || !data ) {
			return null;
		}

		// Make sure leading/trailing whitespace is removed (IE can't handle it)
		data = jQuery.trim( data );

		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		if ( rvalidchars.test( data.replace( rvalidescape, "@" )
			.replace( rvalidtokens, "]" )
			.replace( rvalidbraces, "")) ) {

			return ( new Function( "return " + data ) )();

		}
		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && rnotwhite.test( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
	},

	// args is for internal usage only
	each: function( object, callback, args ) {
		var name, i = 0,
			length = object.length,
			isObj = length === undefined || jQuery.isFunction( object );

		if ( args ) {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.apply( object[ name ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.apply( object[ i++ ], args ) === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
						break;
					}
				}
			}
		}

		return object;
	},

	// Use native String.trim function wherever possible
	trim: trim ?
		function( text ) {
			return text == null ?
				"" :
				trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				text.toString().replace( trimLeft, "" ).replace( trimRight, "" );
		},

	// results is for internal usage only
	makeArray: function( array, results ) {
		var ret = results || [];

		if ( array != null ) {
			// The window, strings (and functions) also have 'length'
			// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
			var type = jQuery.type( array );

			if ( array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( array ) ) {
				push.call( ret, array );
			} else {
				jQuery.merge( ret, array );
			}
		}

		return ret;
	},

	inArray: function( elem, array, i ) {
		var len;

		if ( array ) {
			if ( indexOf ) {
				return indexOf.call( array, elem, i );
			}

			len = array.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in array && array[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var i = first.length,
			j = 0;

		if ( typeof second.length === "number" ) {
			for ( var l = second.length; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}

		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var ret = [], retVal;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( var i = 0, length = elems.length; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value, key, ret = [],
			i = 0,
			length = elems.length,
			// jquery objects are treated as arrays
			isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( key in elems ) {
				value = callback( elems[ key ], key, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return ret.concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		if ( typeof context === "string" ) {
			var tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		var args = slice.call( arguments, 2 ),
			proxy = function() {
				return fn.apply( context, args.concat( slice.call( arguments ) ) );
			};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;

		return proxy;
	},

	// Mutifunctional method to get and set values to a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, key, value, exec, fn, pass ) {
		var length = elems.length;

		// Setting many attributes
		if ( typeof key === "object" ) {
			for ( var k in key ) {
				jQuery.access( elems, k, key[k], exec, fn, value );
			}
			return elems;
		}

		// Setting one attribute
		if ( value !== undefined ) {
			// Optionally, function values get executed if exec is true
			exec = !pass && exec && jQuery.isFunction(value);

			for ( var i = 0; i < length; i++ ) {
				fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
			}

			return elems;
		}

		// Getting an attribute
		return length ? fn( elems[0], key ) : undefined;
	},

	now: function() {
		return ( new Date() ).getTime();
	},

	// Use of jQuery.browser is frowned upon.
	// More details: http://docs.jquery.com/Utilities/jQuery.browser
	uaMatch: function( ua ) {
		ua = ua.toLowerCase();

		var match = rwebkit.exec( ua ) ||
			ropera.exec( ua ) ||
			rmsie.exec( ua ) ||
			ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
			[];

		return { browser: match[1] || "", version: match[2] || "0" };
	},

	sub: function() {
		function jQuerySub( selector, context ) {
			return new jQuerySub.fn.init( selector, context );
		}
		jQuery.extend( true, jQuerySub, this );
		jQuerySub.superclass = this;
		jQuerySub.fn = jQuerySub.prototype = this();
		jQuerySub.fn.constructor = jQuerySub;
		jQuerySub.sub = this.sub;
		jQuerySub.fn.init = function init( selector, context ) {
			if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
				context = jQuerySub( context );
			}

			return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
		};
		jQuerySub.fn.init.prototype = jQuerySub.fn;
		var rootjQuerySub = jQuerySub(document);
		return jQuerySub;
	},

	browser: {}
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

browserMatch = jQuery.uaMatch( userAgent );
if ( browserMatch.browser ) {
	jQuery.browser[ browserMatch.browser ] = true;
	jQuery.browser.version = browserMatch.version;
}

// Deprecated, use jQuery.browser.webkit instead
if ( jQuery.browser.webkit ) {
	jQuery.browser.safari = true;
}

// IE doesn't match non-breaking spaces with \s
if ( rnotwhite.test( "\xA0" ) ) {
	trimLeft = /^[\s\xA0]+/;
	trimRight = /[\s\xA0]+$/;
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);

// Cleanup functions for the document ready method
if ( document.addEventListener ) {
	DOMContentLoaded = function() {
		document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
		jQuery.ready();
	};

} else if ( document.attachEvent ) {
	DOMContentLoaded = function() {
		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( document.readyState === "complete" ) {
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			jQuery.ready();
		}
	};
}

// The DOM ready check for Internet Explorer
function doScrollCheck() {
	if ( jQuery.isReady ) {
		return;
	}

	try {
		// If IE is used, use the trick by Diego Perini
		// http://javascript.nwbox.com/IEContentLoaded/
		document.documentElement.doScroll("left");
	} catch(e) {
		setTimeout( doScrollCheck, 1 );
		return;
	}

	// and execute any waiting functions
	jQuery.ready();
}

return jQuery;

})();


// String to Object flags format cache
var flagsCache = {};

// Convert String-formatted flags into Object-formatted ones and store in cache
function createFlags( flags ) {
	var object = flagsCache[ flags ] = {},
		i, length;
	flags = flags.split( /\s+/ );
	for ( i = 0, length = flags.length; i < length; i++ ) {
		object[ flags[i] ] = true;
	}
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	flags:	an optional list of space-separated flags that will change how
 *			the callback list behaves
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible flags:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( flags ) {

	// Convert flags from String-formatted to Object-formatted
	// (we check in cache first)
	flags = flags ? ( flagsCache[ flags ] || createFlags( flags ) ) : {};

	var // Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = [],
		// Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Add one or several callbacks to the list
		add = function( args ) {
			var i,
				length,
				elem,
				type,
				actual;
			for ( i = 0, length = args.length; i < length; i++ ) {
				elem = args[ i ];
				type = jQuery.type( elem );
				if ( type === "array" ) {
					// Inspect recursively
					add( elem );
				} else if ( type === "function" ) {
					// Add if not in unique mode and callback is not in
					if ( !flags.unique || !self.has( elem ) ) {
						list.push( elem );
					}
				}
			}
		},
		// Fire callbacks
		fire = function( context, args ) {
			args = args || [];
			memory = !flags.memory || [ context, args ];
			firing = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( context, args ) === false && flags.stopOnFalse ) {
					memory = true; // Mark as halted
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( !flags.once ) {
					if ( stack && stack.length ) {
						memory = stack.shift();
						self.fireWith( memory[ 0 ], memory[ 1 ] );
					}
				} else if ( memory === true ) {
					self.disable();
				} else {
					list = [];
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					var length = list.length;
					add( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away, unless previous
					// firing was halted (stopOnFalse)
					} else if ( memory && memory !== true ) {
						firingStart = length;
						fire( memory[ 0 ], memory[ 1 ] );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					var args = arguments,
						argIndex = 0,
						argLength = args.length;
					for ( ; argIndex < argLength ; argIndex++ ) {
						for ( var i = 0; i < list.length; i++ ) {
							if ( args[ argIndex ] === list[ i ] ) {
								// Handle firingIndex and firingLength
								if ( firing ) {
									if ( i <= firingLength ) {
										firingLength--;
										if ( i <= firingIndex ) {
											firingIndex--;
										}
									}
								}
								// Remove the element
								list.splice( i--, 1 );
								// If we have some unicity property then
								// we only need to do this once
								if ( flags.unique ) {
									break;
								}
							}
						}
					}
				}
				return this;
			},
			// Control if a given callback is in the list
			has: function( fn ) {
				if ( list ) {
					var i = 0,
						length = list.length;
					for ( ; i < length; i++ ) {
						if ( fn === list[ i ] ) {
							return true;
						}
					}
				}
				return false;
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory || memory === true ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( stack ) {
					if ( firing ) {
						if ( !flags.once ) {
							stack.push( [ context, args ] );
						}
					} else if ( !( flags.once && memory ) ) {
						fire( context, args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!memory;
			}
		};

	return self;
};




var // Static reference to slice
	sliceDeferred = [].slice;

jQuery.extend({

	Deferred: function( func ) {
		var doneList = jQuery.Callbacks( "once memory" ),
			failList = jQuery.Callbacks( "once memory" ),
			progressList = jQuery.Callbacks( "memory" ),
			state = "pending",
			lists = {
				resolve: doneList,
				reject: failList,
				notify: progressList
			},
			promise = {
				done: doneList.add,
				fail: failList.add,
				progress: progressList.add,

				state: function() {
					return state;
				},

				// Deprecated
				isResolved: doneList.fired,
				isRejected: failList.fired,

				then: function( doneCallbacks, failCallbacks, progressCallbacks ) {
					deferred.done( doneCallbacks ).fail( failCallbacks ).progress( progressCallbacks );
					return this;
				},
				always: function() {
					deferred.done.apply( deferred, arguments ).fail.apply( deferred, arguments );
					return this;
				},
				pipe: function( fnDone, fnFail, fnProgress ) {
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( {
							done: [ fnDone, "resolve" ],
							fail: [ fnFail, "reject" ],
							progress: [ fnProgress, "notify" ]
						}, function( handler, data ) {
							var fn = data[ 0 ],
								action = data[ 1 ],
								returned;
							if ( jQuery.isFunction( fn ) ) {
								deferred[ handler ](function() {
									returned = fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise().then( newDefer.resolve, newDefer.reject, newDefer.notify );
									} else {
										newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] );
									}
								});
							} else {
								deferred[ handler ]( newDefer[ action ] );
							}
						});
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					if ( obj == null ) {
						obj = promise;
					} else {
						for ( var key in promise ) {
							obj[ key ] = promise[ key ];
						}
					}
					return obj;
				}
			},
			deferred = promise.promise({}),
			key;

		for ( key in lists ) {
			deferred[ key ] = lists[ key ].fire;
			deferred[ key + "With" ] = lists[ key ].fireWith;
		}

		// Handle state
		deferred.done( function() {
			state = "resolved";
		}, failList.disable, progressList.lock ).fail( function() {
			state = "rejected";
		}, doneList.disable, progressList.lock );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( firstParam ) {
		var args = sliceDeferred.call( arguments, 0 ),
			i = 0,
			length = args.length,
			pValues = new Array( length ),
			count = length,
			pCount = length,
			deferred = length <= 1 && firstParam && jQuery.isFunction( firstParam.promise ) ?
				firstParam :
				jQuery.Deferred(),
			promise = deferred.promise();
		function resolveFunc( i ) {
			return function( value ) {
				args[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value;
				if ( !( --count ) ) {
					deferred.resolveWith( deferred, args );
				}
			};
		}
		function progressFunc( i ) {
			return function( value ) {
				pValues[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value;
				deferred.notifyWith( promise, pValues );
			};
		}
		if ( length > 1 ) {
			for ( ; i < length; i++ ) {
				if ( args[ i ] && args[ i ].promise && jQuery.isFunction( args[ i ].promise ) ) {
					args[ i ].promise().then( resolveFunc(i), deferred.reject, progressFunc(i) );
				} else {
					--count;
				}
			}
			if ( !count ) {
				deferred.resolveWith( deferred, args );
			}
		} else if ( deferred !== firstParam ) {
			deferred.resolveWith( deferred, length ? [ firstParam ] : [] );
		}
		return promise;
	}
});




jQuery.support = (function() {

	var support,
		all,
		a,
		select,
		opt,
		input,
		marginDiv,
		fragment,
		tds,
		events,
		eventName,
		i,
		isSupported,
		div = document.createElement( "div" ),
		documentElement = document.documentElement;

	// Preliminary tests
	div.setAttribute("className", "t");
	div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

	all = div.getElementsByTagName( "*" );
	a = div.getElementsByTagName( "a" )[ 0 ];

	// Can't get basic test support
	if ( !all || !all.length || !a ) {
		return {};
	}

	// First batch of supports tests
	select = document.createElement( "select" );
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName( "input" )[ 0 ];

	support = {
		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: ( div.firstChild.nodeType === 3 ),

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: ( a.getAttribute("href") === "/a" ),

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.55/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Make sure that if no value is specified for a checkbox
		// that it defaults to "on".
		// (WebKit defaults to "" instead)
		checkOn: ( input.value === "on" ),

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// Tests for enctype support on a form(#6743)
		enctype: !!document.createElement("form").enctype,

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

		// Will be defined later
		submitBubbles: true,
		changeBubbles: true,
		focusinBubbles: false,
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Test to see if it's possible to delete an expando from an element
	// Fails in Internet Explorer
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
		div.attachEvent( "onclick", function() {
			// Cloning a node shouldn't copy over any
			// bound event handlers (IE does this)
			support.noCloneEvent = false;
		});
		div.cloneNode( true ).fireEvent( "onclick" );
	}

	// Check if a radio maintains its value
	// after being appended to the DOM
	input = document.createElement("input");
	input.value = "t";
	input.setAttribute("type", "radio");
	support.radioValue = input.value === "t";

	input.setAttribute("checked", "checked");
	div.appendChild( input );
	fragment = document.createDocumentFragment();
	fragment.appendChild( div.lastChild );

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	fragment.removeChild( input );
	fragment.appendChild( div );

	div.innerHTML = "";

	// Check if div with explicit width and no margin-right incorrectly
	// gets computed margin-right based on width of container. For more
	// info see bug #3333
	// Fails in WebKit before Feb 2011 nightlies
	// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
	if ( window.getComputedStyle ) {
		marginDiv = document.createElement( "div" );
		marginDiv.style.width = "0";
		marginDiv.style.marginRight = "0";
		div.style.width = "2px";
		div.appendChild( marginDiv );
		support.reliableMarginRight =
			( parseInt( ( window.getComputedStyle( marginDiv, null ) || { marginRight: 0 } ).marginRight, 10 ) || 0 ) === 0;
	}

	// Technique from Juriy Zaytsev
	// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
	// We only care about the case where non-standard event systems
	// are used, namely in IE. Short-circuiting here helps us to
	// avoid an eval call (in setAttribute) which can cause CSP
	// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
	if ( div.attachEvent ) {
		for( i in {
			submit: 1,
			change: 1,
			focusin: 1
		}) {
			eventName = "on" + i;
			isSupported = ( eventName in div );
			if ( !isSupported ) {
				div.setAttribute( eventName, "return;" );
				isSupported = ( typeof div[ eventName ] === "function" );
			}
			support[ i + "Bubbles" ] = isSupported;
		}
	}

	fragment.removeChild( div );

	// Null elements to avoid leaks in IE
	fragment = select = opt = marginDiv = div = input = null;

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, outer, inner, table, td, offsetSupport,
			conMarginTop, ptlm, vb, style, html,
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		conMarginTop = 1;
		ptlm = "position:absolute;top:0;left:0;width:1px;height:1px;margin:0;";
		vb = "visibility:hidden;border:0;";
		style = "style='" + ptlm + "border:5px solid #000;padding:0;'";
		html = "<div " + style + "><div></div></div>" +
			"<table " + style + " cellpadding='0' cellspacing='0'>" +
			"<tr><td></td></tr></table>";

		container = document.createElement("div");
		container.style.cssText = vb + "width:0;height:0;position:static;top:0;margin-top:" + conMarginTop + "px";
		body.insertBefore( container, body.firstChild );

		// Construct the test element
		div = document.createElement("div");
		container.appendChild( div );

		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		// (only IE 8 fails this test)
		div.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName( "td" );
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Check if empty table cells still have offsetWidth/Height
		// (IE <= 8 fail this test)
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Figure out if the W3C box model works as expected
		div.innerHTML = "";
		div.style.width = div.style.paddingLeft = "1px";
		jQuery.boxModel = support.boxModel = div.offsetWidth === 2;

		if ( typeof div.style.zoom !== "undefined" ) {
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			// (IE < 8 does this)
			div.style.display = "inline";
			div.style.zoom = 1;
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 2 );

			// Check if elements with layout shrink-wrap their children
			// (IE 6 does this)
			div.style.display = "";
			div.innerHTML = "<div style='width:4px;'></div>";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 2 );
		}

		div.style.cssText = ptlm + vb;
		div.innerHTML = html;

		outer = div.firstChild;
		inner = outer.firstChild;
		td = outer.nextSibling.firstChild.firstChild;

		offsetSupport = {
			doesNotAddBorder: ( inner.offsetTop !== 5 ),
			doesAddBorderForTableAndCells: ( td.offsetTop === 5 )
		};

		inner.style.position = "fixed";
		inner.style.top = "20px";

		// safari subtracts parent border width here which is 5px
		offsetSupport.fixedPosition = ( inner.offsetTop === 20 || inner.offsetTop === 15 );
		inner.style.position = inner.style.top = "";

		outer.style.overflow = "hidden";
		outer.style.position = "relative";

		offsetSupport.subtractsBorderForOverflowNotVisible = ( inner.offsetTop === -5 );
		offsetSupport.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== conMarginTop );

		body.removeChild( container );
		div  = container = null;

		jQuery.extend( support, offsetSupport );
	});

	return support;
})();




var rbrace = /^(?:\{.*\}|\[.*\])$/,
	rmultiDash = /([A-Z])/g;

jQuery.extend({
	cache: {},

	// Please use with caution
	uuid: 0,

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( jQuery.fn.jquery + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var privateCache, thisCache, ret,
			internalKey = jQuery.expando,
			getByName = typeof name === "string",

			// We have to handle DOM nodes and JS objects differently because IE6-7
			// can't GC object references properly across the DOM-JS boundary
			isNode = elem.nodeType,

			// Only DOM nodes need the global jQuery cache; JS object data is
			// attached directly to the object so GC can occur automatically
			cache = isNode ? jQuery.cache : elem,

			// Only defining an ID for JS objects if its cache already exists allows
			// the code to shortcut on the same path as a DOM node with no cache
			id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey,
			isEvents = name === "events";

		// Avoid doing any more work than we need to when trying to get data on an
		// object that has no data at all
		if ( (!id || !cache[id] || (!isEvents && !pvt && !cache[id].data)) && getByName && data === undefined ) {
			return;
		}

		if ( !id ) {
			// Only DOM nodes need a new unique ID for each element since their data
			// ends up in the global cache
			if ( isNode ) {
				elem[ internalKey ] = id = ++jQuery.uuid;
			} else {
				id = internalKey;
			}
		}

		if ( !cache[ id ] ) {
			cache[ id ] = {};

			// Avoids exposing jQuery metadata on plain JS objects when the object
			// is serialized using JSON.stringify
			if ( !isNode ) {
				cache[ id ].toJSON = jQuery.noop;
			}
		}

		// An object can be passed to jQuery.data instead of a key/value pair; this gets
		// shallow copied over onto the existing cache
		if ( typeof name === "object" || typeof name === "function" ) {
			if ( pvt ) {
				cache[ id ] = jQuery.extend( cache[ id ], name );
			} else {
				cache[ id ].data = jQuery.extend( cache[ id ].data, name );
			}
		}

		privateCache = thisCache = cache[ id ];

		// jQuery data() is stored in a separate object inside the object's internal data
		// cache in order to avoid key collisions between internal data and user-defined
		// data.
		if ( !pvt ) {
			if ( !thisCache.data ) {
				thisCache.data = {};
			}

			thisCache = thisCache.data;
		}

		if ( data !== undefined ) {
			thisCache[ jQuery.camelCase( name ) ] = data;
		}

		// Users should not attempt to inspect the internal events object using jQuery.data,
		// it is undocumented and subject to change. But does anyone listen? No.
		if ( isEvents && !thisCache[ name ] ) {
			return privateCache.events;
		}

		// Check for both converted-to-camel and non-converted data property names
		// If a data property was specified
		if ( getByName ) {

			// First Try to find as-is property data
			ret = thisCache[ name ];

			// Test for null|undefined property data
			if ( ret == null ) {

				// Try to find the camelCased property
				ret = thisCache[ jQuery.camelCase( name ) ];
			}
		} else {
			ret = thisCache;
		}

		return ret;
	},

	removeData: function( elem, name, pvt /* Internal Use Only */ ) {
		if ( !jQuery.acceptData( elem ) ) {
			return;
		}

		var thisCache, i, l,

			// Reference to internal data cache key
			internalKey = jQuery.expando,

			isNode = elem.nodeType,

			// See jQuery.data for more information
			cache = isNode ? jQuery.cache : elem,

			// See jQuery.data for more information
			id = isNode ? elem[ internalKey ] : internalKey;

		// If there is already no cache entry for this object, there is no
		// purpose in continuing
		if ( !cache[ id ] ) {
			return;
		}

		if ( name ) {

			thisCache = pvt ? cache[ id ] : cache[ id ].data;

			if ( thisCache ) {

				// Support array or space separated string names for data keys
				if ( !jQuery.isArray( name ) ) {

					// try the string as a key before any manipulation
					if ( name in thisCache ) {
						name = [ name ];
					} else {

						// split the camel cased version by spaces unless a key with the spaces exists
						name = jQuery.camelCase( name );
						if ( name in thisCache ) {
							name = [ name ];
						} else {
							name = name.split( " " );
						}
					}
				}

				for ( i = 0, l = name.length; i < l; i++ ) {
					delete thisCache[ name[i] ];
				}

				// If there is no data left in the cache, we want to continue
				// and let the cache object itself get destroyed
				if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
					return;
				}
			}
		}

		// See jQuery.data for more information
		if ( !pvt ) {
			delete cache[ id ].data;

			// Don't destroy the parent cache unless the internal data object
			// had been the only thing left in it
			if ( !isEmptyDataObject(cache[ id ]) ) {
				return;
			}
		}

		// Browsers that fail expando deletion also refuse to delete expandos on
		// the window, but it will allow it on all other JS objects; other browsers
		// don't care
		// Ensure that `cache` is not a window object #10080
		if ( jQuery.support.deleteExpando || !cache.setInterval ) {
			delete cache[ id ];
		} else {
			cache[ id ] = null;
		}

		// We destroyed the cache and need to eliminate the expando on the node to avoid
		// false lookups in the cache for entries that no longer exist
		if ( isNode ) {
			// IE does not allow us to delete expando properties from nodes,
			// nor does it have a removeAttribute function on Document nodes;
			// we must handle all of these cases
			if ( jQuery.support.deleteExpando ) {
				delete elem[ internalKey ];
			} else if ( elem.removeAttribute ) {
				elem.removeAttribute( internalKey );
			} else {
				elem[ internalKey ] = null;
			}
		}
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return jQuery.data( elem, name, data, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		if ( elem.nodeName ) {
			var match = jQuery.noData[ elem.nodeName.toLowerCase() ];

			if ( match ) {
				return !(match === true || elem.getAttribute("classid") !== match);
			}
		}

		return true;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var parts, attr, name,
			data = null;

		if ( typeof key === "undefined" ) {
			if ( this.length ) {
				data = jQuery.data( this[0] );

				if ( this[0].nodeType === 1 && !jQuery._data( this[0], "parsedAttrs" ) ) {
					attr = this[0].attributes;
					for ( var i = 0, l = attr.length; i < l; i++ ) {
						name = attr[i].name;

						if ( name.indexOf( "data-" ) === 0 ) {
							name = jQuery.camelCase( name.substring(5) );

							dataAttr( this[0], name, data[ name ] );
						}
					}
					jQuery._data( this[0], "parsedAttrs", true );
				}
			}

			return data;

		} else if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		parts = key.split(".");
		parts[1] = parts[1] ? "." + parts[1] : "";

		if ( value === undefined ) {
			data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

			// Try to fetch any internally stored data first
			if ( data === undefined && this.length ) {
				data = jQuery.data( this[0], key );
				data = dataAttr( this[0], key, data );
			}

			return data === undefined && parts[1] ?
				this.data( parts[0] ) :
				data;

		} else {
			return this.each(function() {
				var self = jQuery( this ),
					args = [ parts[0], value ];

				self.triggerHandler( "setData" + parts[1] + "!", args );
				jQuery.data( this, key, value );
				self.triggerHandler( "changeData" + parts[1] + "!", args );
			});
		}
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
				data === "false" ? false :
				data === "null" ? null :
				jQuery.isNumeric( data ) ? parseFloat( data ) :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	for ( var name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}




function handleQueueMarkDefer( elem, type, src ) {
	var deferDataKey = type + "defer",
		queueDataKey = type + "queue",
		markDataKey = type + "mark",
		defer = jQuery._data( elem, deferDataKey );
	if ( defer &&
		( src === "queue" || !jQuery._data(elem, queueDataKey) ) &&
		( src === "mark" || !jQuery._data(elem, markDataKey) ) ) {
		// Give room for hard-coded callbacks to fire first
		// and eventually mark/queue something else on the element
		setTimeout( function() {
			if ( !jQuery._data( elem, queueDataKey ) &&
				!jQuery._data( elem, markDataKey ) ) {
				jQuery.removeData( elem, deferDataKey, true );
				defer.fire();
			}
		}, 0 );
	}
}

jQuery.extend({

	_mark: function( elem, type ) {
		if ( elem ) {
			type = ( type || "fx" ) + "mark";
			jQuery._data( elem, type, (jQuery._data( elem, type ) || 0) + 1 );
		}
	},

	_unmark: function( force, elem, type ) {
		if ( force !== true ) {
			type = elem;
			elem = force;
			force = false;
		}
		if ( elem ) {
			type = type || "fx";
			var key = type + "mark",
				count = force ? 0 : ( (jQuery._data( elem, key ) || 1) - 1 );
			if ( count ) {
				jQuery._data( elem, key, count );
			} else {
				jQuery.removeData( elem, key, true );
				handleQueueMarkDefer( elem, type, "mark" );
			}
		}
	},

	queue: function( elem, type, data ) {
		var q;
		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			q = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !q || jQuery.isArray(data) ) {
					q = jQuery._data( elem, type, jQuery.makeArray(data) );
				} else {
					q.push( data );
				}
			}
			return q || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			fn = queue.shift(),
			hooks = {};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
		}

		if ( fn ) {
			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			jQuery._data( elem, type + ".run", hooks );
			fn.call( elem, function() {
				jQuery.dequeue( elem, type );
			}, hooks );
		}

		if ( !queue.length ) {
			jQuery.removeData( elem, type + "queue " + type + ".run", true );
			handleQueueMarkDefer( elem, type, "queue" );
		}
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
		}

		if ( data === undefined ) {
			return jQuery.queue( this[0], type );
		}
		return this.each(function() {
			var queue = jQuery.queue( this, type, data );

			if ( type === "fx" && queue[0] !== "inprogress" ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, object ) {
		if ( typeof type !== "string" ) {
			object = type;
			type = undefined;
		}
		type = type || "fx";
		var defer = jQuery.Deferred(),
			elements = this,
			i = elements.length,
			count = 1,
			deferDataKey = type + "defer",
			queueDataKey = type + "queue",
			markDataKey = type + "mark",
			tmp;
		function resolve() {
			if ( !( --count ) ) {
				defer.resolveWith( elements, [ elements ] );
			}
		}
		while( i-- ) {
			if (( tmp = jQuery.data( elements[ i ], deferDataKey, undefined, true ) ||
					( jQuery.data( elements[ i ], queueDataKey, undefined, true ) ||
						jQuery.data( elements[ i ], markDataKey, undefined, true ) ) &&
					jQuery.data( elements[ i ], deferDataKey, jQuery.Callbacks( "once memory" ), true ) )) {
				count++;
				tmp.add( resolve );
			}
		}
		resolve();
		return defer.promise();
	}
});




var rclass = /[\n\t\r]/g,
	rspace = /\s+/,
	rreturn = /\r/g,
	rtype = /^(?:button|input)$/i,
	rfocusable = /^(?:button|input|object|select|textarea)$/i,
	rclickable = /^a(?:rea)?$/i,
	rboolean = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute,
	nodeHook, boolHook, fixSpecified;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, name, value, true, jQuery.attr );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, name, value, true, jQuery.prop );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classNames, i, l, elem,
			setClass, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call(this, j, this.className) );
			});
		}

		if ( value && typeof value === "string" ) {
			classNames = value.split( rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 ) {
					if ( !elem.className && classNames.length === 1 ) {
						elem.className = value;

					} else {
						setClass = " " + elem.className + " ";

						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							if ( !~setClass.indexOf( " " + classNames[ c ] + " " ) ) {
								setClass += classNames[ c ] + " ";
							}
						}
						elem.className = jQuery.trim( setClass );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classNames, i, l, elem, className, c, cl;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call(this, j, this.className) );
			});
		}

		if ( (value && typeof value === "string") || value === undefined ) {
			classNames = ( value || "" ).split( rspace );

			for ( i = 0, l = this.length; i < l; i++ ) {
				elem = this[ i ];

				if ( elem.nodeType === 1 && elem.className ) {
					if ( value ) {
						className = (" " + elem.className + " ").replace( rclass, " " );
						for ( c = 0, cl = classNames.length; c < cl; c++ ) {
							className = className.replace(" " + classNames[ c ] + " ", " ");
						}
						elem.className = jQuery.trim( className );

					} else {
						elem.className = "";
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.split( rspace );

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space seperated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			} else if ( type === "undefined" || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// toggle whole className
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) > -1 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.nodeName.toLowerCase() ] || jQuery.valHooks[ elem.type ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var self = jQuery(this), val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.nodeName.toLowerCase() ] || jQuery.valHooks[ this.type ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, i, max, option,
					index = elem.selectedIndex,
					values = [],
					options = elem.options,
					one = elem.type === "select-one";

				// Nothing was selected
				if ( index < 0 ) {
					return null;
				}

				// Loop through all the selected options
				i = one ? index : 0;
				max = one ? index + 1 : options.length;
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// Don't return options that are disabled or in a disabled optgroup
					if ( option.selected && (jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
							(!option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" )) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				// Fixes Bug #2551 -- select.val() broken in IE after form.reset()
				if ( one && !values.length && options.length ) {
					return jQuery( options[ index ] ).val();
				}

				return values;
			},

			set: function( elem, value ) {
				var values = jQuery.makeArray( value );

				jQuery(elem).find("option").each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	attrFn: {
		val: true,
		css: true,
		html: true,
		text: true,
		data: true,
		width: true,
		height: true,
		offset: true
	},

	attr: function( elem, name, value, pass ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( pass && name in jQuery.attrFn ) {
			return jQuery( elem )[ name ]( value );
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( notxml ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;

			} else if ( hooks && "set" in hooks && notxml && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, "" + value );
				return value;
			}

		} else if ( hooks && "get" in hooks && notxml && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {

			ret = elem.getAttribute( name );

			// Non-existent attributes return null, we normalize to undefined
			return ret === null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var propName, attrNames, name, l,
			i = 0;

		if ( value && elem.nodeType === 1 ) {
			attrNames = value.toLowerCase().split( rspace );
			l = attrNames.length;

			for ( ; i < l; i++ ) {
				name = attrNames[ i ];

				if ( name ) {
					propName = jQuery.propFix[ name ] || name;

					// See #9699 for explanation of this approach (setting first, then removal)
					jQuery.attr( elem, name, "" );
					elem.removeAttribute( getSetAttribute ? name : propName );

					// Set corresponding property to false for boolean attributes
					if ( rboolean.test( name ) && propName in elem ) {
						elem[ propName ] = false;
					}
				}
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				// We can't allow the type property to be changed (since it causes problems in IE)
				if ( rtype.test( elem.nodeName ) && elem.parentNode ) {
					jQuery.error( "type property can't be changed" );
				} else if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to it's default in case type is set after value
					// This is for element creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		},
		// Use the value property for back compat
		// Use the nodeHook for button elements in IE6/7 (#1954)
		value: {
			get: function( elem, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.get( elem, name );
				}
				return name in elem ?
					elem.value :
					null;
			},
			set: function( elem, value, name ) {
				if ( nodeHook && jQuery.nodeName( elem, "button" ) ) {
					return nodeHook.set( elem, value, name );
				}
				// Does not return so that setAttribute is also used
				elem.value = value;
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				return ( elem[ name ] = value );
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				var attributeNode = elem.getAttributeNode("tabindex");

				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	}
});

// Add the tabIndex propHook to attrHooks for back-compat (different case is intentional)
jQuery.attrHooks.tabindex = jQuery.propHooks.tabIndex;

// Hook for boolean attributes
boolHook = {
	get: function( elem, name ) {
		// Align boolean attributes with corresponding properties
		// Fall back to attribute presence where some booleans are not supported
		var attrNode,
			property = jQuery.prop( elem, name );
		return property === true || typeof property !== "boolean" && ( attrNode = elem.getAttributeNode(name) ) && attrNode.nodeValue !== false ?
			name.toLowerCase() :
			undefined;
	},
	set: function( elem, value, name ) {
		var propName;
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			// value is true since we know at this point it's type boolean and not false
			// Set boolean attributes to the same name and set the DOM property
			propName = jQuery.propFix[ name ] || name;
			if ( propName in elem ) {
				// Only set the IDL specifically if it already exists on the element
				elem[ propName ] = true;
			}

			elem.setAttribute( name, name.toLowerCase() );
		}
		return name;
	}
};

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	fixSpecified = {
		name: true,
		id: true
	};

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret;
			ret = elem.getAttributeNode( name );
			return ret && ( fixSpecified[ name ] ? ret.nodeValue !== "" : ret.specified ) ?
				ret.nodeValue :
				undefined;
		},
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				ret = document.createAttribute( name );
				elem.setAttributeNode( ret );
			}
			return ( ret.nodeValue = value + "" );
		}
	};

	// Apply the nodeHook to tabindex
	jQuery.attrHooks.tabindex.set = nodeHook.set;

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		get: nodeHook.get,
		set: function( elem, value, name ) {
			if ( value === "" ) {
				value = "false";
			}
			nodeHook.set( elem, value, name );
		}
	};
}


// Some attributes require a special call on IE
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 );
				return ret === null ? undefined : ret;
			}
		});
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Normalize to lowercase since IE uppercases css property names
			return elem.style.cssText.toLowerCase() || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = "" + value );
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	});
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	});
});




var rformElems = /^(?:textarea|input|select)$/i,
	rtypenamespace = /^([^\.]*)?(?:\.(.+))?$/,
	rhoverHack = /\bhover(\.\S+)?\b/,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,
	quickParse = function( selector ) {
		var quick = rquickIs.exec( selector );
		if ( quick ) {
			//   0  1    2   3
			// [ _, tag, id, class ]
			quick[1] = ( quick[1] || "" ).toLowerCase();
			quick[3] = quick[3] && new RegExp( "(?:^|\\s)" + quick[3] + "(?:\\s|$)" );
		}
		return quick;
	},
	quickIs = function( elem, m ) {
		var attrs = elem.attributes || {};
		return (
			(!m[1] || elem.nodeName.toLowerCase() === m[1]) &&
			(!m[2] || (attrs.id || {}).value === m[2]) &&
			(!m[3] || m[3].test( (attrs[ "class" ] || {}).value ))
		);
	},
	hoverHack = function( events ) {
		return jQuery.event.special.hover ? events : events.replace( rhoverHack, "mouseenter$1 mouseleave$1" );
	};

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	add: function( elem, types, handler, data, selector ) {

		var elemData, eventHandle, events,
			t, tns, type, namespaces, handleObj,
			handleObjIn, quick, handlers, special;

		// Don't attach events to noData or text/comment nodes (allow plain objects tho)
		if ( elem.nodeType === 3 || elem.nodeType === 8 || !types || !handler || !(elemData = jQuery._data( elem )) ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		events = elemData.events;
		if ( !events ) {
			elemData.events = events = {};
		}
		eventHandle = elemData.handle;
		if ( !eventHandle ) {
			elemData.handle = eventHandle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = jQuery.trim( hoverHack(types) ).split( " " );
		for ( t = 0; t < types.length; t++ ) {

			tns = rtypenamespace.exec( types[t] ) || [];
			type = tns[1];
			namespaces = ( tns[2] || "" ).split( "." ).sort();

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: tns[1],
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				quick: quickParse( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			handlers = events[ type ];
			if ( !handlers ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	global: {},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var elemData = jQuery.hasData( elem ) && jQuery._data( elem ),
			t, tns, type, origType, namespaces, origCount,
			j, events, special, handle, eventType, handleObj;

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = jQuery.trim( hoverHack( types || "" ) ).split(" ");
		for ( t = 0; t < types.length; t++ ) {
			tns = rtypenamespace.exec( types[t] ) || [];
			type = origType = tns[1];
			namespaces = tns[2];

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector? special.delegateType : special.bindType ) || type;
			eventType = events[ type ] || [];
			origCount = eventType.length;
			namespaces = namespaces ? new RegExp("(^|\\.)" + namespaces.split(".").sort().join("\\.(?:.*\\.)?") + "(\\.|$)") : null;

			// Remove matching events
			for ( j = 0; j < eventType.length; j++ ) {
				handleObj = eventType[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					 ( !handler || handler.guid === handleObj.guid ) &&
					 ( !namespaces || namespaces.test( handleObj.namespace ) ) &&
					 ( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					eventType.splice( j--, 1 );

					if ( handleObj.selector ) {
						eventType.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( eventType.length === 0 && origCount !== eventType.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			handle = elemData.handle;
			if ( handle ) {
				handle.elem = null;
			}

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery.removeData( elem, [ "events", "handle" ], true );
		}
	},

	// Events that are safe to short-circuit if no handlers are attached.
	// Native DOM events should not be added, they may have inline handlers.
	customEvent: {
		"getData": true,
		"setData": true,
		"changeData": true
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		// Don't do events on text and comment nodes
		if ( elem && (elem.nodeType === 3 || elem.nodeType === 8) ) {
			return;
		}

		// Event object or event type
		var type = event.type || event,
			namespaces = [],
			cache, exclusive, i, cur, old, ontype, special, handle, eventPath, bubbleType;

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "!" ) >= 0 ) {
			// Exclusive events trigger only for the exact event (no namespaces)
			type = type.slice(0, -1);
			exclusive = true;
		}

		if ( type.indexOf( "." ) >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}

		if ( (!elem || jQuery.event.customEvent[ type ]) && !jQuery.event.global[ type ] ) {
			// No jQuery handlers for this event type, and it can't have inline handlers
			return;
		}

		// Caller can pass in an Event, Object, or just an event type string
		event = typeof event === "object" ?
			// jQuery.Event object
			event[ jQuery.expando ] ? event :
			// Object literal
			new jQuery.Event( type, event ) :
			// Just the event type (string)
			new jQuery.Event( type );

		event.type = type;
		event.isTrigger = true;
		event.exclusive = exclusive;
		event.namespace = namespaces.join( "." );
		event.namespace_re = event.namespace? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.)?") + "(\\.|$)") : null;
		ontype = type.indexOf( ":" ) < 0 ? "on" + type : "";

		// Handle a global trigger
		if ( !elem ) {

			// TODO: Stop taunting the data cache; remove global events and always attach to document
			cache = jQuery.cache;
			for ( i in cache ) {
				if ( cache[ i ].events && cache[ i ].events[ type ] ) {
					jQuery.event.trigger( event, data, cache[ i ].handle.elem, true );
				}
			}
			return;
		}

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data != null ? jQuery.makeArray( data ) : [];
		data.unshift( event );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		eventPath = [[ elem, special.bindType || type ]];
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			cur = rfocusMorph.test( bubbleType + type ) ? elem : elem.parentNode;
			old = null;
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push([ cur, bubbleType ]);
				old = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( old && old === elem.ownerDocument ) {
				eventPath.push([ old.defaultView || old.parentWindow || window, bubbleType ]);
			}
		}

		// Fire handlers on the event path
		for ( i = 0; i < eventPath.length && !event.isPropagationStopped(); i++ ) {

			cur = eventPath[i][0];
			event.type = eventPath[i][1];

			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}
			// Note that this is a bare JS function and not a jQuery handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				// IE<9 dies on focus/blur to hidden element (#1486)
				if ( ontype && elem[ type ] && ((type !== "focus" && type !== "blur") || event.target.offsetWidth !== 0) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					old = elem[ ontype ];

					if ( old ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( old ) {
						elem[ ontype ] = old;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event || window.event );

		var handlers = ( (jQuery._data( this, "events" ) || {} )[ event.type ] || []),
			delegateCount = handlers.delegateCount,
			args = [].slice.call( arguments, 0 ),
			run_all = !event.exclusive && !event.namespace,
			handlerQueue = [],
			i, j, cur, jqcur, ret, selMatch, matched, matches, handleObj, sel, related;

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Determine handlers that should run if there are delegated events
		// Avoid disabled elements in IE (#6911) and non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && !event.target.disabled && !(event.button && event.type === "click") ) {

			// Pregenerate a single jQuery object for reuse with .is()
			jqcur = jQuery(this);
			jqcur.context = this.ownerDocument || this;

			for ( cur = event.target; cur != this; cur = cur.parentNode || this ) {
				selMatch = {};
				matches = [];
				jqcur[0] = cur;
				for ( i = 0; i < delegateCount; i++ ) {
					handleObj = handlers[ i ];
					sel = handleObj.selector;

					if ( selMatch[ sel ] === undefined ) {
						selMatch[ sel ] = (
							handleObj.quick ? quickIs( cur, handleObj.quick ) : jqcur.is( sel )
						);
					}
					if ( selMatch[ sel ] ) {
						matches.push( handleObj );
					}
				}
				if ( matches.length ) {
					handlerQueue.push({ elem: cur, matches: matches });
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( handlers.length > delegateCount ) {
			handlerQueue.push({ elem: this, matches: handlers.slice( delegateCount ) });
		}

		// Run delegates first; they may want to stop propagation beneath us
		for ( i = 0; i < handlerQueue.length && !event.isPropagationStopped(); i++ ) {
			matched = handlerQueue[ i ];
			event.currentTarget = matched.elem;

			for ( j = 0; j < matched.matches.length && !event.isImmediatePropagationStopped(); j++ ) {
				handleObj = matched.matches[ j ];

				// Triggered event must either 1) be non-exclusive and have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( run_all || (!event.namespace && !handleObj.namespace) || event.namespace_re && event.namespace_re.test( handleObj.namespace ) ) {

					event.data = handleObj.data;
					event.handleObj = handleObj;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						event.result = ret;
						if ( ret === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		return event.result;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	// *** attrChange attrName relatedNode srcElement  are not normalized, non-W3C, deprecated, will be removed in 1.8 ***
	props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop,
			originalEvent = event,
			fixHook = jQuery.event.fixHooks[ event.type ] || {},
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = jQuery.Event( originalEvent );

		for ( i = copy.length; i; ) {
			prop = copy[ --i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Fix target property, if necessary (#1925, IE 6/7/8 & Safari2)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Target should not be a text node (#504, Safari)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// For mouse/key events; add metaKey if it's not there (#3368, IE6/7/8)
		if ( event.metaKey === undefined ) {
			event.metaKey = event.ctrlKey;
		}

		return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		ready: {
			// Make sure the ready event is setup
			setup: jQuery.bindReady
		},

		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},

		focus: {
			delegateType: "focusin"
		},
		blur: {
			delegateType: "focusout"
		},

		beforeunload: {
			setup: function( data, namespaces, eventHandle ) {
				// We only want to do this special case on windows
				if ( jQuery.isWindow( this ) ) {
					this.onbeforeunload = eventHandle;
				}
			},

			teardown: function( namespaces, eventHandle ) {
				if ( this.onbeforeunload === eventHandle ) {
					this.onbeforeunload = null;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{ type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

// Some plugins are using, but it's undocumented/deprecated and will be removed.
// The 1.7 special event interface should provide all the hooks needed now.
jQuery.event.handle = jQuery.event.dispatch;

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		if ( elem.detachEvent ) {
			elem.detachEvent( "on" + type, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

function returnFalse() {
	return false;
}
function returnTrue() {
	return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	preventDefault: function() {
		this.isDefaultPrevented = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}

		// if preventDefault exists run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// otherwise set the returnValue property of the original event to false (IE)
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		this.isPropagationStopped = returnTrue;

		var e = this.originalEvent;
		if ( !e ) {
			return;
		}
		// if stopPropagation exists run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}
		// otherwise set the cancelBubble property of the original event to true (IE)
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	},
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj,
				selector = handleObj.selector,
				ret;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !form._submit_attached ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						// If form was submitted by the user, bubble the event up the tree
						if ( this.parentNode && !event.isTrigger ) {
							jQuery.event.simulate( "submit", this.parentNode, event, true );
						}
					});
					form._submit_attached = true;
				}
			});
			// return undefined since we don't need an event listener
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
							jQuery.event.simulate( "change", this, event, true );
						}
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !elem._change_attached ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					elem._change_attached = true;
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on.call( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			var handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace? handleObj.type + "." + handleObj.namespace : handleObj.type,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( var type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	live: function( types, data, fn ) {
		jQuery( this.context ).on( types, this.selector, data, fn );
		return this;
	},
	die: function( types, fn ) {
		jQuery( this.context ).off( types, this.selector || "**", fn );
		return this;
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length == 1? this.off( selector, "**" ) : this.off( types, selector, fn );
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		if ( this[0] ) {
			return jQuery.event.trigger( type, data, this[0], true );
		}
	},

	toggle: function( fn ) {
		// Save reference to arguments for access in closure
		var args = arguments,
			guid = fn.guid || jQuery.guid++,
			i = 0,
			toggler = function( event ) {
				// Figure out which function to execute
				var lastToggle = ( jQuery._data( this, "lastToggle" + fn.guid ) || 0 ) % i;
				jQuery._data( this, "lastToggle" + fn.guid, lastToggle + 1 );

				// Make sure that clicks stop
				event.preventDefault();

				// and execute the function
				return args[ lastToggle ].apply( this, arguments ) || false;
			};

		// link all the functions, so any of them can unbind this click handler
		toggler.guid = guid;
		while ( i < args.length ) {
			args[ i++ ].guid = guid;
		}

		return this.click( toggler );
	},

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
});

jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		if ( fn == null ) {
			fn = data;
			data = null;
		}

		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};

	if ( jQuery.attrFn ) {
		jQuery.attrFn[ name ] = true;
	}

	if ( rkeyEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.keyHooks;
	}

	if ( rmouseEvent.test( name ) ) {
		jQuery.event.fixHooks[ name ] = jQuery.event.mouseHooks;
	}
});



/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	expando = "sizcache" + (Math.random() + '').replace('.', ''),
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true,
	rBackslash = /\\/g,
	rReturn = /\r\n/g,
	rNonWord = /\W/;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function() {
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function( selector, context, results, seed ) {
	results = results || [];
	context = context || document;

	var origContext = context;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var m, set, checkSet, extra, ret, cur, pop, i,
		prune = true,
		contextXML = Sizzle.isXML( context ),
		parts = [],
		soFar = selector;
	
	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec( "" );
		m = chunker.exec( soFar );

		if ( m ) {
			soFar = m[3];
		
			parts.push( m[1] );
		
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {

		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context, seed );

		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set, seed );
			}
		}

	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {

			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ?
				Sizzle.filter( ret.expr, ret.set )[0] :
				ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

			set = ret.expr ?
				Sizzle.filter( ret.expr, ret.set ) :
				ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray( set );

			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}

		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );

		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}

		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}

	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function( results ) {
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function( expr, set ) {
	return Sizzle( expr, null, null, set );
};

Sizzle.matchesSelector = function( node, expr ) {
	return Sizzle( expr, null, null, [node] ).length > 0;
};

Sizzle.find = function( expr, context, isXML ) {
	var set, i, len, match, type, left;

	if ( !expr ) {
		return [];
	}

	for ( i = 0, len = Expr.order.length; i < len; i++ ) {
		type = Expr.order[i];
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			left = match[1];
			match.splice( 1, 1 );

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace( rBackslash, "" );
				set = Expr.find[ type ]( match, context, isXML );

				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( "*" ) :
			[];
	}

	return { set: set, expr: expr };
};

Sizzle.filter = function( expr, set, inplace, not ) {
	var match, anyFound,
		type, found, item, filter, left,
		i, pass,
		old = expr,
		result = [],
		curLoop = set,
		isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

	while ( expr && set.length ) {
		for ( type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				filter = Expr.filter[ type ];
				left = match[1];

				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;

					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							pass = not ^ found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;

								} else {
									curLoop[i] = false;
								}

							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );

			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Utility function for retreiving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
var getText = Sizzle.getText = function( elem ) {
    var i, node,
		nodeType = elem.nodeType,
		ret = "";

	if ( nodeType ) {
		if ( nodeType === 1 || nodeType === 9 ) {
			// Use textContent || innerText for elements
			if ( typeof elem.textContent === 'string' ) {
				return elem.textContent;
			} else if ( typeof elem.innerText === 'string' ) {
				// Replace IE's carriage returns
				return elem.innerText.replace( rReturn, '' );
			} else {
				// Traverse it's children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
	} else {

		// If no nodeType, this is expected to be an array
		for ( i = 0; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			if ( node.nodeType !== 8 ) {
				ret += getText( node );
			}
		}
	}
	return ret;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],

	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},

	leftMatch: {},

	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},

	attrHandle: {
		href: function( elem ) {
			return elem.getAttribute( "href" );
		},
		type: function( elem ) {
			return elem.getAttribute( "type" );
		}
	},

	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !rNonWord.test( part ),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},

		">": function( checkSet, part ) {
			var elem,
				isPartStr = typeof part === "string",
				i = 0,
				l = checkSet.length;

			if ( isPartStr && !rNonWord.test( part ) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}

			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},

		"": function(checkSet, part, isXML){
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
		},

		"~": function( checkSet, part, isXML ) {
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
		}
	},

	find: {
		ID: function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		},

		NAME: function( match, context ) {
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [],
					results = context.getElementsByName( match[1] );

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},

		TAG: function( match, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( match[1] );
			}
		}
	},
	preFilter: {
		CLASS: function( match, curLoop, inplace, result, not, isXML ) {
			match = " " + match[1].replace( rBackslash, "" ) + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}

					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},

		ID: function( match ) {
			return match[1].replace( rBackslash, "" );
		},

		TAG: function( match, curLoop ) {
			return match[1].replace( rBackslash, "" ).toLowerCase();
		},

		CHILD: function( match ) {
			if ( match[1] === "nth" ) {
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				match[2] = match[2].replace(/^\+|\s*/g, '');

				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}
			else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},

		ATTR: function( match, curLoop, inplace, result, not, isXML ) {
			var name = match[1] = match[1].replace( rBackslash, "" );
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			// Handle if an un-quoted value was used
			match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},

		PSEUDO: function( match, curLoop, inplace, result, not ) {
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);

				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

					if ( !inplace ) {
						result.push.apply( result, ret );
					}

					return false;
				}

			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},

		POS: function( match ) {
			match.unshift( true );

			return match;
		}
	},
	
	filters: {
		enabled: function( elem ) {
			return elem.disabled === false && elem.type !== "hidden";
		},

		disabled: function( elem ) {
			return elem.disabled === true;
		},

		checked: function( elem ) {
			return elem.checked === true;
		},
		
		selected: function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}
			
			return elem.selected === true;
		},

		parent: function( elem ) {
			return !!elem.firstChild;
		},

		empty: function( elem ) {
			return !elem.firstChild;
		},

		has: function( elem, i, match ) {
			return !!Sizzle( match[3], elem ).length;
		},

		header: function( elem ) {
			return (/h\d/i).test( elem.nodeName );
		},

		text: function( elem ) {
			var attr = elem.getAttribute( "type" ), type = elem.type;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc) 
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" && "text" === type && ( attr === type || attr === null );
		},

		radio: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "radio" === elem.type;
		},

		checkbox: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "checkbox" === elem.type;
		},

		file: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "file" === elem.type;
		},

		password: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "password" === elem.type;
		},

		submit: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "submit" === elem.type;
		},

		image: function( elem ) {
			return elem.nodeName.toLowerCase() === "input" && "image" === elem.type;
		},

		reset: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && "reset" === elem.type;
		},

		button: function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && "button" === elem.type || name === "button";
		},

		input: function( elem ) {
			return (/input|select|textarea|button/i).test( elem.nodeName );
		},

		focus: function( elem ) {
			return elem === elem.ownerDocument.activeElement;
		}
	},
	setFilters: {
		first: function( elem, i ) {
			return i === 0;
		},

		last: function( elem, i, match, array ) {
			return i === array.length - 1;
		},

		even: function( elem, i ) {
			return i % 2 === 0;
		},

		odd: function( elem, i ) {
			return i % 2 === 1;
		},

		lt: function( elem, i, match ) {
			return i < match[3] - 0;
		},

		gt: function( elem, i, match ) {
			return i > match[3] - 0;
		},

		nth: function( elem, i, match ) {
			return match[3] - 0 === i;
		},

		eq: function( elem, i, match ) {
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function( elem, match, i, array ) {
			var name = match[1],
				filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );

			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || getText([ elem ]) || "").indexOf(match[3]) >= 0;

			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;

			} else {
				Sizzle.error( name );
			}
		},

		CHILD: function( elem, match ) {
			var first, last,
				doneName, parent, cache,
				count, diff,
				type = match[1],
				node = elem;

			switch ( type ) {
				case "only":
				case "first":
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					if ( type === "first" ) { 
						return true; 
					}

					node = elem;

				case "last":
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					return true;

				case "nth":
					first = match[2];
					last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					doneName = match[0];
					parent = elem.parentNode;
	
					if ( parent && (parent[ expando ] !== doneName || !elem.nodeIndex) ) {
						count = 0;
						
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 

						parent[ expando ] = doneName;
					}
					
					diff = elem.nodeIndex - last;

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},

		ID: function( elem, match ) {
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},

		TAG: function( elem, match ) {
			return (match === "*" && elem.nodeType === 1) || !!elem.nodeName && elem.nodeName.toLowerCase() === match;
		},
		
		CLASS: function( elem, match ) {
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},

		ATTR: function( elem, match ) {
			var name = match[1],
				result = Sizzle.attr ?
					Sizzle.attr( elem, name ) :
					Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				!type && Sizzle.attr ?
				result != null :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},

		POS: function( elem, match, i, array ) {
			var name = match[2],
				filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function( array, results ) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch( e ) {
	makeArray = function( array, results ) {
		var i = 0,
			ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );

		} else {
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}

			} else {
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder, siblingCheck;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};

} else {
	sortOrder = function( a, b ) {
		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Fallback to using sourceIndex (in IE) if it's available on both nodes
		} else if ( a.sourceIndex && b.sourceIndex ) {
			return a.sourceIndex - b.sourceIndex;
		}

		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// If the nodes are siblings (or identical) we can do a quick check
		if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

	siblingCheck = function( a, b, ret ) {
		if ( a === b ) {
			return ret;
		}

		var cur = a.nextSibling;

		while ( cur ) {
			if ( cur === b ) {
				return -1;
			}

			cur = cur.nextSibling;
		}

		return 1;
	};
}

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date()).getTime(),
		root = document.documentElement;

	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function( match, context, isXML ) {
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);

				return m ?
					m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
						[m] :
						undefined :
					[];
			}
		};

		Expr.filter.ID = function( elem, match ) {
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );

	// release memory in IE
	root = form = null;
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function( match, context ) {
			var results = context.getElementsByTagName( match[1] );

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";

	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {

		Expr.attrHandle.href = function( elem ) {
			return elem.getAttribute( "href", 2 );
		};
	}

	// release memory in IE
	div = null;
})();

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle,
			div = document.createElement("div"),
			id = "__sizzle__";

		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function( query, context, extra, seed ) {
			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && !Sizzle.isXML(context) ) {
				// See if we find a selector to speed up
				var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );
				
				if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
					// Speed-up: Sizzle("TAG")
					if ( match[1] ) {
						return makeArray( context.getElementsByTagName( query ), extra );
					
					// Speed-up: Sizzle(".CLASS")
					} else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
						return makeArray( context.getElementsByClassName( match[2] ), extra );
					}
				}
				
				if ( context.nodeType === 9 ) {
					// Speed-up: Sizzle("body")
					// The body element only exists once, optimize finding it
					if ( query === "body" && context.body ) {
						return makeArray( [ context.body ], extra );
						
					// Speed-up: Sizzle("#ID")
					} else if ( match && match[3] ) {
						var elem = context.getElementById( match[3] );

						// Check parentNode to catch when Blackberry 4.6 returns
						// nodes that are no longer in the document #6963
						if ( elem && elem.parentNode ) {
							// Handle the case where IE and Opera return items
							// by name instead of ID
							if ( elem.id === match[3] ) {
								return makeArray( [ elem ], extra );
							}
							
						} else {
							return makeArray( [], extra );
						}
					}
					
					try {
						return makeArray( context.querySelectorAll(query), extra );
					} catch(qsaError) {}

				// qSA works strangely on Element-rooted queries
				// We can work around this by specifying an extra ID on the root
				// and working up from there (Thanks to Andrew Dupont for the technique)
				// IE 8 doesn't work on object elements
				} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
					var oldContext = context,
						old = context.getAttribute( "id" ),
						nid = old || id,
						hasParent = context.parentNode,
						relativeHierarchySelector = /^\s*[+~]/.test( query );

					if ( !old ) {
						context.setAttribute( "id", nid );
					} else {
						nid = nid.replace( /'/g, "\\$&" );
					}
					if ( relativeHierarchySelector && hasParent ) {
						context = context.parentNode;
					}

					try {
						if ( !relativeHierarchySelector || hasParent ) {
							return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
						}

					} catch(pseudoError) {
					} finally {
						if ( !old ) {
							oldContext.removeAttribute( "id" );
						}
					}
				}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		// release memory in IE
		div = null;
	})();
}

(function(){
	var html = document.documentElement,
		matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector;

	if ( matches ) {
		// Check to see if it's possible to do matchesSelector
		// on a disconnected node (IE 9 fails this)
		var disconnectedMatch = !matches.call( document.createElement( "div" ), "div" ),
			pseudoWorks = false;

		try {
			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( document.documentElement, "[test!='']:sizzle" );
	
		} catch( pseudoError ) {
			pseudoWorks = true;
		}

		Sizzle.matchesSelector = function( node, expr ) {
			// Make sure that attribute selectors are quoted
			expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

			if ( !Sizzle.isXML( node ) ) {
				try { 
					if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
						var ret = matches.call( node, expr );

						// IE 9's matchesSelector returns false on disconnected nodes
						if ( ret || !disconnectedMatch ||
								// As well, disconnected nodes are said to be in a document
								// fragment in IE 9, so check for that
								node.document && node.document.nodeType !== 11 ) {
							return ret;
						}
					}
				} catch(e) {}
			}

			return Sizzle(expr, null, null, [node]).length > 0;
		};
	}
})();

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function( match, context, isXML ) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	// release memory in IE
	div = null;
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;

			elem = elem[dir];

			while ( elem ) {
				if ( elem[ expando ] === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem[ expando ] = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;
			
			elem = elem[dir];

			while ( elem ) {
				if ( elem[ expando ] === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem[ expando ] = doneName;
						elem.sizset = i;
					}

					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

if ( document.documentElement.contains ) {
	Sizzle.contains = function( a, b ) {
		return a !== b && (a.contains ? a.contains(b) : true);
	};

} else if ( document.documentElement.compareDocumentPosition ) {
	Sizzle.contains = function( a, b ) {
		return !!(a.compareDocumentPosition(b) & 16);
	};

} else {
	Sizzle.contains = function() {
		return false;
	};
}

Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function( selector, context, seed ) {
	var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet, seed );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE
// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
Sizzle.selectors.attrMap = {};
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.filters;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})();


var runtil = /Until$/,
	rparentsprev = /^(?:parents|prevUntil|prevAll)/,
	// Note: This RegExp should be improved, or likely pulled from Sizzle
	rmultiselector = /,/,
	isSimple = /^.[^:#\[\.,]*$/,
	slice = Array.prototype.slice,
	POS = jQuery.expr.match.POS,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var self = this,
			i, l;

		if ( typeof selector !== "string" ) {
			return jQuery( selector ).filter(function() {
				for ( i = 0, l = self.length; i < l; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			});
		}

		var ret = this.pushStack( "", "find", selector ),
			length, n, r;

		for ( i = 0, l = this.length; i < l; i++ ) {
			length = ret.length;
			jQuery.find( selector, this[i], ret );

			if ( i > 0 ) {
				// Make sure that the results are unique
				for ( n = length; n < ret.length; n++ ) {
					for ( r = 0; r < length; r++ ) {
						if ( ret[r] === ret[n] ) {
							ret.splice(n--, 1);
							break;
						}
					}
				}
			}
		}

		return ret;
	},

	has: function( target ) {
		var targets = jQuery( target );
		return this.filter(function() {
			for ( var i = 0, l = targets.length; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false), "not", selector);
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true), "filter", selector );
	},

	is: function( selector ) {
		return !!selector && ( 
			typeof selector === "string" ?
				// If this is a positional selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				POS.test( selector ) ? 
					jQuery( selector, this.context ).index( this[0] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var ret = [], i, l, cur = this[0];
		
		// Array (deprecated as of jQuery 1.7)
		if ( jQuery.isArray( selectors ) ) {
			var level = 1;

			while ( cur && cur.ownerDocument && cur !== context ) {
				for ( i = 0; i < selectors.length; i++ ) {

					if ( jQuery( cur ).is( selectors[ i ] ) ) {
						ret.push({ selector: selectors[ i ], elem: cur, level: level });
					}
				}

				cur = cur.parentNode;
				level++;
			}

			return ret;
		}

		// String
		var pos = POS.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( i = 0, l = this.length; i < l; i++ ) {
			cur = this[i];

			while ( cur ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;

				} else {
					cur = cur.parentNode;
					if ( !cur || !cur.ownerDocument || cur === context || cur.nodeType === 11 ) {
						break;
					}
				}
			}
		}

		ret = ret.length > 1 ? jQuery.unique( ret ) : ret;

		return this.pushStack( ret, "closest", selectors );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
			all :
			jQuery.unique( all ) );
	},

	andSelf: function() {
		return this.add( this.prevObject );
	}
});

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
	return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return jQuery.nth( elem, 2, "nextSibling" );
	},
	prev: function( elem ) {
		return jQuery.nth( elem, 2, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( elem.parentNode.firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.makeArray( elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret, name, slice.call( arguments ).join(",") );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	nth: function( cur, result, dir, elem ) {
		result = result || 1;
		var num = 0;

		for ( ; cur; cur = cur[dir] ) {
			if ( cur.nodeType === 1 && ++num === result ) {
				break;
			}
		}

		return cur;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem, i ) {
			return ( elem === qualifier ) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem, i ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
	});
}




function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
	safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|canvas|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g,
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style)/i,
	rnocache = /<(?:script|object|embed|option|style)/i,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")", "i"),
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /\/(java|ecma)script/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)/,
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		area: [ 1, "<map>", "</map>" ],
		_default: [ 0, "", "" ]
	},
	safeFragment = createSafeFragment( document );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE can't serialize <link> and <script> tags normally
if ( !jQuery.support.htmlSerialize ) {
	wrapMap._default = [ 1, "div<div>", "</div>" ];
}

jQuery.fn.extend({
	text: function( text ) {
		if ( jQuery.isFunction(text) ) {
			return this.each(function(i) {
				var self = jQuery( this );

				self.text( text.call(this, i, self.text()) );
			});
		}

		if ( typeof text !== "object" && text !== undefined ) {
			return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );
		}

		return jQuery.text( this );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this );
			});
		} else if ( arguments.length ) {
			var set = jQuery.clean( arguments );
			set.push.apply( set, this.toArray() );
			return this.pushStack( set, "before", arguments );
		}
	},

	after: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, false, function( elem ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			});
		} else if ( arguments.length ) {
			var set = this.pushStack( this, "after", arguments );
			set.push.apply( set, jQuery.clean(arguments) );
			return set;
		}
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
			
			/**
			if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( elem.getElementsByTagName("*") );
					jQuery.cleanData( [ elem ] );
				}

				if ( elem.parentNode ) {
					elem.parentNode.removeChild( elem );
				}
			}
			/**/
			
			 if ( !selector || jQuery.filter( selector, [ this ] ).length ) {
				// Prevent memory leaks
				var item = $(this);
				var clearItem = $('#clear-use-memory');
				if(clearItem.length == 0){
					jQuery('<div/>').hide().attr('id','clear-use-memory').appendTo('body');
					clearItem = jQuery('#clear-use-memory');
				}
				item.appendTo(clearItem);
				jQuery('*',clearItem).each(function(i, e) {
					(events = jQuery.data(this, 'events')) && jQuery.each(events, function(i, e1) {
						jQuery(e).unbind(i + '.*');
					});
					jQuery.event.remove(this);
					jQuery.removeData(this);
				});
				clearItem[0].innerHTML = '';
				item = null;
			}
			
			
			
		}

		return this;
	},

	empty: function() {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( elem.getElementsByTagName("*") );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
				try{jQuery.cleanData( elem.firstChild );}catch(e){}
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		if ( value === undefined ) {
			return this[0] && this[0].nodeType === 1 ?
				this[0].innerHTML.replace(rinlinejQuery, "") :
				null;

		// See if we can take a shortcut and just use innerHTML
		} else if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
			(jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value )) &&
			!wrapMap[ (rtagName.exec( value ) || ["", ""])[1].toLowerCase() ] ) {

			value = value.replace(rxhtmlTag, "<$1></$2>");

			try {
				for ( var i = 0, l = this.length; i < l; i++ ) {
					// Remove element nodes and prevent memory leaks
					if ( this[i].nodeType === 1 ) {
						jQuery.cleanData( this[i].getElementsByTagName("*") );
						this[i].innerHTML = value;
					}
				}

			// If using innerHTML throws an exception, use the fallback method
			} catch(e) {
				this.empty().append( value );
			}

		} else if ( jQuery.isFunction( value ) ) {
			this.each(function(i){
				var self = jQuery( this );

				self.html( value.call(this, i, self.html()) );
			});

		} else {
			this.empty().append( value );
		}

		return this;
	},

	replaceWith: function( value ) {
		if ( this[0] && this[0].parentNode ) {
			// Make sure that the elements are removed from the DOM before they are inserted
			// this can help fix replacing a parent with child elements
			if ( jQuery.isFunction( value ) ) {
				return this.each(function(i) {
					var self = jQuery(this), old = self.html();
					self.replaceWith( value.call( this, i, old ) );
				});
			}

			if ( typeof value !== "string" ) {
				value = jQuery( value ).detach();
			}

			return this.each(function() {
				var next = this.nextSibling,
					parent = this.parentNode;

				jQuery( this ).remove();

				if ( next ) {
					jQuery(next).before( value );
				} else {
					jQuery(parent).append( value );
				}
			});
		} else {
			return this.length ?
				this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value ) :
				this;
		}
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {
		var results, first, fragment, parent,
			value = args[0],
			scripts = [];

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( !jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test( value ) ) {
			return this.each(function() {
				jQuery(this).domManip( args, table, callback, true );
			});
		}

		if ( jQuery.isFunction(value) ) {
			return this.each(function(i) {
				var self = jQuery(this);
				args[0] = value.call(this, i, table ? self.html() : undefined);
				self.domManip( args, table, callback );
			});
		}

		if ( this[0] ) {
			parent = value && value.parentNode;

			// If we're in a fragment, just use that instead of building a new one
			if ( jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length ) {
				results = { fragment: parent };

			} else {
				results = jQuery.buildFragment( args, this, scripts );
			}

			fragment = results.fragment;

			if ( fragment.childNodes.length === 1 ) {
				first = fragment = fragment.firstChild;
			} else {
				first = fragment.firstChild;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );

				for ( var i = 0, l = this.length, lastIndex = l - 1; i < l; i++ ) {
					callback.call(
						table ?
							root(this[i], first) :
							this[i],
						// Make sure that we do not leak memory by inadvertently discarding
						// the original fragment (which might have attached data) instead of
						// using it; in addition, use the original fragment object for the last
						// item instead of first because it can end up being emptied incorrectly
						// in certain situations (Bug #8070).
						// Fragments from the fragment cache must always be cloned and never used
						// in place.
						results.cacheable || ( l > 1 && i < lastIndex ) ?
							jQuery.clone( fragment, true, true ) :
							fragment
					);
				}
			}

			if ( scripts.length ) {
				jQuery.each( scripts, evalScript );
			}
		}

		return this;
	}
});

function root( elem, cur ) {
	return jQuery.nodeName(elem, "table") ?
		(elem.getElementsByTagName("tbody")[0] ||
		elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
		elem;
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type + ( events[ type ][ i ].namespace ? "." : "" ) + events[ type ][ i ].namespace, events[ type ][ i ], events[ type ][ i ].data );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function cloneFixAttributes( src, dest ) {
	var nodeName;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	// clearAttributes removes the attributes, which we don't want,
	// but also removes the attachEvent events, which we *do* want
	if ( dest.clearAttributes ) {
		dest.clearAttributes();
	}

	// mergeAttributes, in contrast, only merges back on the
	// original attributes, not the events
	if ( dest.mergeAttributes ) {
		dest.mergeAttributes( src );
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 fail to clone children inside object elements that use
	// the proprietary classid attribute value (rather than the type
	// attribute) to identify the type of content to display
	if ( nodeName === "object" ) {
		dest.outerHTML = src.outerHTML;

	} else if ( nodeName === "input" && (src.type === "checkbox" || src.type === "radio") ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set
		if ( src.checked ) {
			dest.defaultChecked = dest.checked = src.checked;
		}

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}

	// Event data gets referenced instead of copied if the expando
	// gets copied too
	dest.removeAttribute( jQuery.expando );
}

jQuery.buildFragment = function( args, nodes, scripts ) {
	var fragment, cacheable, cacheresults, doc,
	first = args[ 0 ];

	// nodes may contain either an explicit document object,
	// a jQuery collection or context object.
	// If nodes[0] contains a valid object to assign to doc
	if ( nodes && nodes[0] ) {
		doc = nodes[0].ownerDocument || nodes[0];
	}

	// Ensure that an attr object doesn't incorrectly stand in as a document object
	// Chrome and Firefox seem to allow this to occur and will throw exception
	// Fixes #8950
	if ( !doc.createDocumentFragment ) {
		doc = document;
	}

	// Only cache "small" (1/2 KB) HTML strings that are associated with the main document
	// Cloning options loses the selected state, so don't cache them
	// IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
	// Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
	// Lastly, IE6,7,8 will not correctly reuse cached fragments that were created from unknown elems #10501
	if ( args.length === 1 && typeof first === "string" && first.length < 512 && doc === document &&
		first.charAt(0) === "<" && !rnocache.test( first ) &&
		(jQuery.support.checkClone || !rchecked.test( first )) &&
		(jQuery.support.html5Clone || !rnoshimcache.test( first )) ) {

		cacheable = true;

		cacheresults = jQuery.fragments[ first ];
		if ( cacheresults && cacheresults !== 1 ) {
			fragment = cacheresults;
		}
	}

	if ( !fragment ) {
		fragment = doc.createDocumentFragment();
		jQuery.clean( args, doc, fragment, scripts );
	}

	if ( cacheable ) {
		jQuery.fragments[ first ] = cacheresults ? fragment : 1;
	}

	return { fragment: fragment, cacheable: cacheable };
};

jQuery.fragments = {};

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var ret = [],
			insert = jQuery( selector ),
			parent = this.length === 1 && this[0].parentNode;

		if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
			insert[ original ]( this[0] );
			return this;

		} else {
			for ( var i = 0, l = insert.length; i < l; i++ ) {
				var elems = ( i > 0 ? this.clone(true) : this ).get();
				jQuery( insert[i] )[ original ]( elems );
				ret = ret.concat( elems );
			}

			return this.pushStack( ret, name, insert.selector );
		}
	};
});

function getAll( elem ) {
	if ( typeof elem.getElementsByTagName !== "undefined" ) {
		return elem.getElementsByTagName( "*" );

	} else if ( typeof elem.querySelectorAll !== "undefined" ) {
		return elem.querySelectorAll( "*" );

	} else {
		return [];
	}
}

// Used in clean, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( elem.type === "checkbox" || elem.type === "radio" ) {
		elem.defaultChecked = elem.checked;
	}
}
// Finds all inputs and passes them to fixDefaultChecked
function findInputs( elem ) {
	var nodeName = ( elem.nodeName || "" ).toLowerCase();
	if ( nodeName === "input" ) {
		fixDefaultChecked( elem );
	// Skip scripts, get other children
	} else if ( nodeName !== "script" && typeof elem.getElementsByTagName !== "undefined" ) {
		jQuery.grep( elem.getElementsByTagName("input"), fixDefaultChecked );
	}
}

// Derived From: http://www.iecss.com/shimprove/javascript/shimprove.1-0-1.js
function shimCloneNode( elem ) {
	var div = document.createElement( "div" );
	safeFragment.appendChild( div );

	div.innerHTML = elem.outerHTML;
	return div.firstChild;
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var srcElements,
			destElements,
			i,
			// IE<=8 does not properly clone detached, unknown element nodes
			clone = jQuery.support.html5Clone || !rnoshimcache.test( "<" + elem.nodeName ) ?
				elem.cloneNode( true ) :
				shimCloneNode( elem );

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {
			// IE copies events bound via attachEvent when using cloneNode.
			// Calling detachEvent on the clone will also remove the events
			// from the original. In order to get around this, we use some
			// proprietary methods to clear the events. Thanks to MooTools
			// guys for this hotness.

			cloneFixAttributes( elem, clone );

			// Using Sizzle here is crazy slow, so we use getElementsByTagName instead
			srcElements = getAll( elem );
			destElements = getAll( clone );

			// Weird iteration because IE will replace the length property
			// with an element if you are cloning the body and one of the
			// elements on the page has a name or id of "length"
			for ( i = 0; srcElements[i]; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					cloneFixAttributes( srcElements[i], destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			cloneCopyEvent( elem, clone );

			if ( deepDataAndEvents ) {
				srcElements = getAll( elem );
				destElements = getAll( clone );

				for ( i = 0; srcElements[i]; ++i ) {
					cloneCopyEvent( srcElements[i], destElements[i] );
				}
			}
		}

		srcElements = destElements = null;

		// Return the cloned set
		return clone;
	},

	clean: function( elems, context, fragment, scripts ) {
		var checkScriptType;

		context = context || document;

		// !context.createElement fails in IE with an error but returns typeof 'object'
		if ( typeof context.createElement === "undefined" ) {
			context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
		}

		var ret = [], j;

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			if ( typeof elem === "number" ) {
				elem += "";
			}

			if ( !elem ) {
				continue;
			}

			// Convert html string into DOM nodes
			if ( typeof elem === "string" ) {
				if ( !rhtml.test( elem ) ) {
					elem = context.createTextNode( elem );
				} else {
					// Fix "XHTML"-style tags in all browsers
					elem = elem.replace(rxhtmlTag, "<$1></$2>");

					// Trim whitespace, otherwise indexOf won't work as expected
					var tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase(),
						wrap = wrapMap[ tag ] || wrapMap._default,
						depth = wrap[0],
						div = context.createElement("div");

					// Append wrapper element to unknown element safe doc fragment
					if ( context === document ) {
						// Use the fragment we've already created for this document
						safeFragment.appendChild( div );
					} else {
						// Use a fragment created with the owner document
						createSafeFragment( context ).appendChild( div );
					}

					// Go to html and back, then peel off extra wrappers
					div.innerHTML = wrap[1] + elem + wrap[2];

					// Move to the right depth
					while ( depth-- ) {
						div = div.lastChild;
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						var hasBody = rtbody.test(elem),
							tbody = tag === "table" && !hasBody ?
								div.firstChild && div.firstChild.childNodes :

								// String was a bare <thead> or <tfoot>
								wrap[1] === "<table>" && !hasBody ?
									div.childNodes :
									[];

						for ( j = tbody.length - 1; j >= 0 ; --j ) {
							if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
								tbody[ j ].parentNode.removeChild( tbody[ j ] );
							}
						}
					}

					// IE completely kills leading whitespace when innerHTML is used
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
					}

					elem = div.childNodes;
				}
			}

			// Resets defaultChecked for any radios and checkboxes
			// about to be appended to the DOM in IE 6/7 (#8060)
			var len;
			if ( !jQuery.support.appendChecked ) {
				if ( elem[0] && typeof (len = elem.length) === "number" ) {
					for ( j = 0; j < len; j++ ) {
						findInputs( elem[j] );
					}
				} else {
					findInputs( elem );
				}
			}

			if ( elem.nodeType ) {
				ret.push( elem );
			} else {
				ret = jQuery.merge( ret, elem );
			}
		}

		if ( fragment ) {
			checkScriptType = function( elem ) {
				return !elem.type || rscriptType.test( elem.type );
			};
			for ( i = 0; ret[i]; i++ ) {
				if ( scripts && jQuery.nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
					scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );

				} else {
					if ( ret[i].nodeType === 1 ) {
						var jsTags = jQuery.grep( ret[i].getElementsByTagName( "script" ), checkScriptType );

						ret.splice.apply( ret, [i + 1, 0].concat( jsTags ) );
					}
					fragment.appendChild( ret[i] );
				}
			}
		}

		return ret;
	},

	cleanData: function( elems ) {
		var data, id,
			cache = jQuery.cache,
			special = jQuery.event.special,
			deleteExpando = jQuery.support.deleteExpando;

		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
				continue;
			}

			id = elem[ jQuery.expando ];

			if ( id ) {
				data = cache[ id ];

				if ( data && data.events ) {
					for ( var type in data.events ) {
						if ( special[ type ] ) {
							jQuery.event.remove( elem, type );

						// This is a shortcut to avoid jQuery.event.remove's overhead
						} else {
							jQuery.removeEvent( elem, type, data.handle );
						}
					}

					// Null the DOM reference to avoid IE6/7/8 leak (#7054)
					if ( data.handle ) {
						data.handle.elem = null;
					}
				}

				if ( deleteExpando ) {
					delete elem[ jQuery.expando ];

				} else if ( elem.removeAttribute ) {
					elem.removeAttribute( jQuery.expando );
				}

				delete cache[ id ];
			}
		}
	}
});

function evalScript( i, elem ) {
	if ( elem.src ) {
		jQuery.ajax({
			url: elem.src,
			async: false,
			dataType: "script"
		});
	} else {
		jQuery.globalEval( ( elem.text || elem.textContent || elem.innerHTML || "" ).replace( rcleanScript, "/*$0*/" ) );
	}

	if ( elem.parentNode ) {
		elem.parentNode.removeChild( elem );
	}
}




var ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity=([^)]*)/,
	// fixed for IE9, see #8346
	rupper = /([A-Z]|^ms)/g,
	rnumpx = /^-?\d+(?:px)?$/i,
	rnum = /^-?\d/,
	rrelNum = /^([\-+])=([\-+.\de]+)/,

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssWidth = [ "Left", "Right" ],
	cssHeight = [ "Top", "Bottom" ],
	curCSS,

	getComputedStyle,
	currentStyle;

jQuery.fn.css = function( name, value ) {
	// Setting 'undefined' is a no-op
	if ( arguments.length === 2 && value === undefined ) {
		return this;
	}

	return jQuery.access( this, name, value, true, function( elem, name, value ) {
		return value !== undefined ?
			jQuery.style( elem, name, value ) :
			jQuery.css( elem, name );
	});
};

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity", "opacity" );
					return ret === "" ? "1" : ret;

				} else {
					return elem.style.opacity;
				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, origName = jQuery.camelCase( name ),
			style = elem.style, hooks = jQuery.cssHooks[ origName ];

		name = jQuery.cssProps[ origName ] || origName;

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( +( ret[1] + 1) * +ret[2] ) + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value )) !== undefined ) {
				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra ) {
		var ret, hooks;

		// Make sure that we're working with the right name
		name = jQuery.camelCase( name );
		hooks = jQuery.cssHooks[ name ];
		name = jQuery.cssProps[ name ] || name;

		// cssFloat needs a special treatment
		if ( name === "cssFloat" ) {
			name = "float";
		}

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks && (ret = hooks.get( elem, true, extra )) !== undefined ) {
			return ret;

		// Otherwise, if a way to get the computed value exists, use that
		} else if ( curCSS ) {
			return curCSS( elem, name );
		}
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback ) {
		var old = {};

		// Remember the old values, and insert the new ones
		for ( var name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		callback.call( elem );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}
	}
});

// DEPRECATED, Use jQuery.css() instead
jQuery.curCSS = jQuery.css;

jQuery.each(["height", "width"], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			var val;

			if ( computed ) {
				if ( elem.offsetWidth !== 0 ) {
					return getWH( elem, name, extra );
				} else {
					jQuery.swap( elem, cssShow, function() {
						val = getWH( elem, name, extra );
					});
				}

				return val;
			}
		},

		set: function( elem, value ) {
			if ( rnumpx.test( value ) ) {
				// ignore negative width and height values #1599
				value = parseFloat( value );

				if ( value >= 0 ) {
					return value + "px";
				}

			} else {
				return value;
			}
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( parseFloat( RegExp.$1 ) / 100 ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			if ( value >= 1 && jQuery.trim( filter.replace( ralpha, "" ) ) === "" ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there there is no filter style applied in a css rule, we are done
				if ( currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

jQuery(function() {
	// This hook cannot be added until DOM ready because the support test
	// for it is not run until after DOM ready
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// Work around by temporarily setting element display to inline-block
				var ret;
				jQuery.swap( elem, { "display": "inline-block" }, function() {
					if ( computed ) {
						ret = curCSS( elem, "margin-right", "marginRight" );
					} else {
						ret = elem.style.marginRight;
					}
				});
				return ret;
			}
		};
	}
});

if ( document.defaultView && document.defaultView.getComputedStyle ) {
	getComputedStyle = function( elem, name ) {
		var ret, defaultView, computedStyle;

		name = name.replace( rupper, "-$1" ).toLowerCase();

		if ( (defaultView = elem.ownerDocument.defaultView) &&
				(computedStyle = defaultView.getComputedStyle( elem, null )) ) {
			ret = computedStyle.getPropertyValue( name );
			if ( ret === "" && !jQuery.contains( elem.ownerDocument.documentElement, elem ) ) {
				ret = jQuery.style( elem, name );
			}
		}

		return ret;
	};
}

if ( document.documentElement.currentStyle ) {
	currentStyle = function( elem, name ) {
		var left, rsLeft, uncomputed,
			ret = elem.currentStyle && elem.currentStyle[ name ],
			style = elem.style;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret === null && style && (uncomputed = style[ name ]) ) {
			ret = uncomputed;
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		if ( !rnumpx.test( ret ) && rnum.test( ret ) ) {

			// Remember the original values
			left = style.left;
			rsLeft = elem.runtimeStyle && elem.runtimeStyle.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				elem.runtimeStyle.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ( ret || 0 );
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				elem.runtimeStyle.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

curCSS = getComputedStyle || currentStyle;

function getWH( elem, name, extra ) {

	// Start with offset property
	var val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		which = name === "width" ? cssWidth : cssHeight,
		i = 0,
		len = which.length;

	if ( val > 0 ) {
		if ( extra !== "border" ) {
			for ( ; i < len; i++ ) {
				if ( !extra ) {
					val -= parseFloat( jQuery.css( elem, "padding" + which[ i ] ) ) || 0;
				}
				if ( extra === "margin" ) {
					val += parseFloat( jQuery.css( elem, extra + which[ i ] ) ) || 0;
				} else {
					val -= parseFloat( jQuery.css( elem, "border" + which[ i ] + "Width" ) ) || 0;
				}
			}
		}

		return val + "px";
	}

	// Fall back to computed then uncomputed css if necessary
	val = curCSS( elem, name, name );
	if ( val < 0 || val == null ) {
		val = elem.style[ name ] || 0;
	}
	// Normalize "", auto, and prepare for extra
	val = parseFloat( val ) || 0;

	// Add padding, border, margin
	if ( extra ) {
		for ( ; i < len; i++ ) {
			val += parseFloat( jQuery.css( elem, "padding" + which[ i ] ) ) || 0;
			if ( extra !== "padding" ) {
				val += parseFloat( jQuery.css( elem, "border" + which[ i ] + "Width" ) ) || 0;
			}
			if ( extra === "margin" ) {
				val += parseFloat( jQuery.css( elem, extra + which[ i ] ) ) || 0;
			}
		}
	}

	return val + "px";
}

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		var width = elem.offsetWidth,
			height = elem.offsetHeight;

		return ( width === 0 && height === 0 ) || (!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rhash = /#.*$/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rquery = /\?/,
	rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
	rselectTextarea = /^(?:select|textarea)/i,
	rspacesAjax = /\s+/,
	rts = /([?&])_=[^&]*/,
	rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Document location
	ajaxLocation,

	// Document location segments
	ajaxLocParts,

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = ["*/"] + ["*"];

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		if ( jQuery.isFunction( func ) ) {
			var dataTypes = dataTypeExpression.toLowerCase().split( rspacesAjax ),
				i = 0,
				length = dataTypes.length,
				dataType,
				list,
				placeBefore;

			// For each dataType in the dataTypeExpression
			for ( ; i < length; i++ ) {
				dataType = dataTypes[ i ];
				// We control if we're asked to add before
				// any existing element
				placeBefore = /^\+/.test( dataType );
				if ( placeBefore ) {
					dataType = dataType.substr( 1 ) || "*";
				}
				list = structure[ dataType ] = structure[ dataType ] || [];
				// then we add to the structure accordingly
				list[ placeBefore ? "unshift" : "push" ]( func );
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR,
		dataType /* internal */, inspected /* internal */ ) {

	dataType = dataType || options.dataTypes[ 0 ];
	inspected = inspected || {};

	inspected[ dataType ] = true;

	var list = structure[ dataType ],
		i = 0,
		length = list ? list.length : 0,
		executeOnly = ( structure === prefilters ),
		selection;

	for ( ; i < length && ( executeOnly || !selection ); i++ ) {
		selection = list[ i ]( options, originalOptions, jqXHR );
		// If we got redirected to another dataType
		// we try there if executing only and not done already
		if ( typeof selection === "string" ) {
			if ( !executeOnly || inspected[ selection ] ) {
				selection = undefined;
			} else {
				options.dataTypes.unshift( selection );
				selection = inspectPrefiltersOrTransports(
						structure, options, originalOptions, jqXHR, selection, inspected );
			}
		}
	}
	// If we're only executing or nothing was selected
	// we try the catchall dataType if not done already
	if ( ( executeOnly || !selection ) && !inspected[ "*" ] ) {
		selection = inspectPrefiltersOrTransports(
				structure, options, originalOptions, jqXHR, "*", inspected );
	}
	// unnecessary when only executing (prefilters)
	// but it'll be ignored by the caller in that case
	return selection;
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};
	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}
}

jQuery.fn.extend({
	load: function( url, params, callback ) {
		if ( typeof url !== "string" && _load ) {
			return _load.apply( this, arguments );

		// Don't do a request if no elements are being requested
		} else if ( !this.length ) {
			return this;
		}

		var off = url.indexOf( " " );
		if ( off >= 0 ) {
			var selector = url.slice( off, url.length );
			url = url.slice( 0, off );
		}

		// Default to a GET request
		var type = "GET";

		// If the second parameter was provided
		if ( params ) {
			// If it's a function
			if ( jQuery.isFunction( params ) ) {
				// We assume that it's the callback
				callback = params;
				params = undefined;

			// Otherwise, build a param string
			} else if ( typeof params === "object" ) {
				params = jQuery.param( params, jQuery.ajaxSettings.traditional );
				type = "POST";
			}
		}

		var self = this;

		// Request the remote document
		jQuery.ajax({
			url: url,
			type: type,
			dataType: "html",
			data: params,
			// Complete callback (responseText is used internally)
			complete: function( jqXHR, status, responseText ) {
				// Store the response as specified by the jqXHR object
				responseText = jqXHR.responseText;
				// If successful, inject the HTML into all the matched elements
				if ( jqXHR.isResolved() ) {
					// #4825: Get the actual response in case
					// a dataFilter is present in ajaxSettings
					jqXHR.done(function( r ) {
						responseText = r;
					});
					// See if a selector was specified
					self.html( selector ?
						// Create a dummy div to hold the results
						jQuery("<div>")
							// inject the contents of the document in, removing the scripts
							// to avoid any 'Permission Denied' errors in IE
							.append(responseText.replace(rscript, ""))

							// Locate the specified elements
							.find(selector) :

						// If not, just inject the full result
						responseText );
				}

				if ( callback ) {
					self.each( callback, [ responseText, status, jqXHR ] );
				}
			}
		});

		return this;
	},

	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},

	serializeArray: function() {
		return this.map(function(){
			return this.elements ? jQuery.makeArray( this.elements ) : this;
		})
		.filter(function(){
			return this.name && !this.disabled &&
				( this.checked || rselectTextarea.test( this.nodeName ) ||
					rinput.test( this.type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val, i ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split( " " ), function( i, o ){
	jQuery.fn[ o ] = function( f ){
		return this.on( o, f );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			type: method,
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	};
});

jQuery.extend({

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		if ( settings ) {
			// Building a settings object
			ajaxExtend( target, jQuery.ajaxSettings );
		} else {
			// Extending ajaxSettings
			settings = target;
			target = jQuery.ajaxSettings;
		}
		ajaxExtend( target, settings );
		return target;
	},

	ajaxSettings: {
		url: ajaxLocation,
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		type: "GET",
		contentType: "application/x-www-form-urlencoded",
		processData: true,
		async: true,
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		traditional: false,
		headers: {},
		*/

		accepts: {
			xml: "application/xml, text/xml",
			html: "text/html",
			text: "text/plain",
			json: "application/json, text/javascript",
			"*": allTypes
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// List of data converters
		// 1) key format is "source_type destination_type" (a single space in-between)
		// 2) the catchall symbol "*" can be used for source_type
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			context: true,
			url: true
		}
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events
			// It's the callbackContext if one was provided in the options
			// and if it's a DOM node or a jQuery collection
			globalEventContext = callbackContext !== s &&
				( callbackContext.nodeType || callbackContext instanceof jQuery ) ?
						jQuery( callbackContext ) : jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// ifModified key
			ifModifiedKey,
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// Response headers
			responseHeadersString,
			responseHeaders,
			// transport
			transport,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// The jqXHR state
			state = 0,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Fake xhr
			jqXHR = {

				readyState: 0,

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( !state ) {
						var lname = name.toLowerCase();
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match === undefined ? null : match;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					statusText = statusText || "abort";
					if ( transport ) {
						transport.abort( statusText );
					}
					done( 0, statusText );
					return this;
				}
			};

		// Callback for when everything is done
		// It is defined here because jslint complains if it is declared
		// at the end of the function (which would be more logical and readable)
		function done( status, nativeStatusText, responses, headers ) {

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			var isSuccess,
				success,
				error,
				statusText = nativeStatusText,
				response = responses ? ajaxHandleResponses( s, jqXHR, responses ) : undefined,
				lastModified,
				etag;

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {

					if ( ( lastModified = jqXHR.getResponseHeader( "Last-Modified" ) ) ) {
						jQuery.lastModified[ ifModifiedKey ] = lastModified;
					}
					if ( ( etag = jqXHR.getResponseHeader( "Etag" ) ) ) {
						jQuery.etag[ ifModifiedKey ] = etag;
					}
				}

				// If not modified
				if ( status === 304 ) {

					statusText = "notmodified";
					isSuccess = true;

				// If we have data
				} else {

					try {
						success = ajaxConvert( s, response );
						statusText = "success";
						isSuccess = true;
					} catch(e) {
						// We have a parsererror
						statusText = "parsererror";
						error = e;
					}
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( !statusText || status ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = "" + ( nativeStatusText || statusText );

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajax" + ( isSuccess ? "Success" : "Error" ),
						[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		// Attach deferreds
		deferred.promise( jqXHR );
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;
		jqXHR.complete = completeDeferred.add;

		// Status-dependent callbacks
		jqXHR.statusCode = function( map ) {
			if ( map ) {
				var tmp;
				if ( state < 2 ) {
					for ( tmp in map ) {
						statusCode[ tmp ] = [ statusCode[tmp], map[tmp] ];
					}
				} else {
					tmp = map[ jqXHR.status ];
					jqXHR.then( tmp, tmp );
				}
			}
			return this;
		};

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// We also use the url parameter if available
		s.url = ( ( url || s.url ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().split( rspacesAjax );

		// Determine if a cross-domain request is in order
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] != ajaxLocParts[ 1 ] || parts[ 2 ] != ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefiler, stop there
		if ( state === 2 ) {
			return false;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.data;
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Get ifModifiedKey before adding the anti-cache parameter
			ifModifiedKey = s.url;

			// Add anti-cache in url if needed
			if ( s.cache === false ) {

				var ts = jQuery.now(),
					// try replacing _= if it is there
					ret = s.url.replace( rts, "$1_=" + ts );

				// if nothing was replaced, add timestamp to the end
				s.url = ret + ( ( ret === s.url ) ? ( rquery.test( s.url ) ? "&" : "?" ) + "_=" + ts : "" );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			ifModifiedKey = ifModifiedKey || s.url;
			if ( jQuery.lastModified[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ ifModifiedKey ] );
			}
			if ( jQuery.etag[ ifModifiedKey ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ ifModifiedKey ] );
			}
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
				// Abort if not done already
				jqXHR.abort();
				return false;

		}

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;
			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout( function(){
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch (e) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		return jqXHR;
	},

	// Serialize an array of form elements or a set of
	// key/values into a query string
	param: function( a, traditional ) {
		var s = [],
			add = function( key, value ) {
				// If value is a function, invoke it and return its value
				value = jQuery.isFunction( value ) ? value() : value;
				s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
			};

		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if ( traditional === undefined ) {
			traditional = jQuery.ajaxSettings.traditional;
		}

		// If an array was passed in, assume that it is an array of form elements.
		if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			});

		} else {
			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( var prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}

		// Return the resulting serialization
		return s.join( "&" ).replace( r20, "+" );
	}
});

function buildParams( prefix, obj, traditional, add ) {
	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// If array item is non-scalar (array or object), encode its
				// numeric index to resolve deserialization ambiguity issues.
				// Note that rack (as of 1.0.0) can't currently deserialize
				// nested arrays properly, and attempting to do so may cause
				// a server error. Possible fixes are to modify rack's
				// deserialization algorithm or to provide an option or flag
				// to force array serialization to be shallow.
				buildParams( prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && obj != null && typeof obj === "object" ) {
		// Serialize object item.
		for ( var name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// This is still on the jQuery object... for now
// Want to move this to jQuery.ajax some day
jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {}

});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields,
		ct,
		type,
		finalDataType,
		firstDataType;

	// Fill responseXXX fields
	for ( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "content-type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	var dataTypes = s.dataTypes,
		converters = {},
		i,
		key,
		length = dataTypes.length,
		tmp,
		// Current and previous dataTypes
		current = dataTypes[ 0 ],
		prev,
		// Conversion expression
		conversion,
		// Conversion function
		conv,
		// Conversion functions (transitive conversion)
		conv1,
		conv2;

	// For each dataType in the chain
	for ( i = 1; i < length; i++ ) {

		// Create converters map
		// with lowercased keys
		if ( i === 1 ) {
			for ( key in s.converters ) {
				if ( typeof key === "string" ) {
					converters[ key.toLowerCase() ] = s.converters[ key ];
				}
			}
		}

		// Get the dataTypes
		prev = current;
		current = dataTypes[ i ];

		// If current is auto dataType, update it to prev
		if ( current === "*" ) {
			current = prev;
		// If no auto and dataTypes are actually different
		} else if ( prev !== "*" && prev !== current ) {

			// Get the converter
			conversion = prev + " " + current;
			conv = converters[ conversion ] || converters[ "* " + current ];

			// If there is no direct converter, search transitively
			if ( !conv ) {
				conv2 = undefined;
				for ( conv1 in converters ) {
					tmp = conv1.split( " " );
					if ( tmp[ 0 ] === prev || tmp[ 0 ] === "*" ) {
						conv2 = converters[ tmp[1] + " " + current ];
						if ( conv2 ) {
							conv1 = converters[ conv1 ];
							if ( conv1 === true ) {
								conv = conv2;
							} else if ( conv2 === true ) {
								conv = conv1;
							}
							break;
						}
					}
				}
			}
			// If we found no converter, dispatch an error
			if ( !( conv || conv2 ) ) {
				jQuery.error( "No conversion from " + conversion.replace(" "," to ") );
			}
			// If found converter is not an equivalence
			if ( conv !== true ) {
				// Convert with 1 or 2 converters accordingly
				response = conv ? conv( response ) : conv2( conv1(response) );
			}
		}
	}
	return response;
}




var jsc = jQuery.now(),
	jsre = /(\=)\?(&|$)|\?\?/i;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		return jQuery.expando + "_" + ( jsc++ );
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var inspectData = s.contentType === "application/x-www-form-urlencoded" &&
		( typeof s.data === "string" );

	if ( s.dataTypes[ 0 ] === "jsonp" ||
		s.jsonp !== false && ( jsre.test( s.url ) ||
				inspectData && jsre.test( s.data ) ) ) {

		var responseContainer,
			jsonpCallback = s.jsonpCallback =
				jQuery.isFunction( s.jsonpCallback ) ? s.jsonpCallback() : s.jsonpCallback,
			previous = window[ jsonpCallback ],
			url = s.url,
			data = s.data,
			replace = "$1" + jsonpCallback + "$2";

		if ( s.jsonp !== false ) {
			url = url.replace( jsre, replace );
			if ( s.url === url ) {
				if ( inspectData ) {
					data = data.replace( jsre, replace );
				}
				if ( s.data === data ) {
					// Add callback manually
					url += (/\?/.test( url ) ? "&" : "?") + s.jsonp + "=" + jsonpCallback;
				}
			}
		}

		s.url = url;
		s.data = data;

		// Install callback
		window[ jsonpCallback ] = function( response ) {
			responseContainer = [ response ];
		};

		// Clean-up function
		jqXHR.always(function() {
			// Set callback back to previous value
			window[ jsonpCallback ] = previous;
			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( previous ) ) {
				window[ jsonpCallback ]( responseContainer[ 0 ] );
			}
		});

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( jsonpCallback + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Delegate to script
		return "script";
	}
});




// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /javascript|ecmascript/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || document.getElementsByTagName( "head" )[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = "async";

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( head && script.parentNode ) {
							head.removeChild( script );
						}

						// Dereference the script
						script = undefined;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};
				// Use insertBefore instead of appendChild  to circumvent an IE6 bug.
				// This arises when a base node is used (#2709 and #4378).
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( 0, 1 );
				}
			}
		};
	}
});




var // #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject ? function() {
		// Abort all pending requests
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( 0, 1 );
		}
	} : false,
	xhrId = 0,
	xhrCallbacks;

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
(function( xhr ) {
	jQuery.extend( jQuery.support, {
		ajax: !!xhr,
		cors: !!xhr && ( "withCredentials" in xhr )
	});
})( jQuery.ajaxSettings.xhr() );

// Create transport if the browser can provide an xhr
if ( jQuery.support.ajax ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var xhr = s.xhr(),
						handle,
						i;

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( _ ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {

						var status,
							statusText,
							responseHeaders,
							responses,
							xml;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occured
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();
									responses = {};
									xml = xhr.responseXML;

									// Construct response list
									if ( xml && xml.documentElement /* #4958 */ ) {
										responses.xml = xml;
									}
									responses.text = xhr.responseText;

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					// if we're in sync mode or it's in cache
					// and has been retrieved directly (IE6 & IE7)
					// we need to manually fire the callback
					if ( !s.async || xhr.readyState === 4 ) {
						callback();
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback(0,1);
					}
				}
			};
		}
	});
}




var elemdisplay = {},
	iframe, iframeDoc,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
	timerId,
	fxAttrs = [
		// height animations
		[ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
		// width animations
		[ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
		// opacity animations
		[ "opacity" ]
	],
	fxNow;

jQuery.fn.extend({
	show: function( speed, easing, callback ) {
		var elem, display;

		if ( speed || speed === 0 ) {
			return this.animate( genFx("show", 3), speed, easing, callback );

		} else {
			for ( var i = 0, j = this.length; i < j; i++ ) {
				elem = this[ i ];

				if ( elem.style ) {
					display = elem.style.display;

					// Reset the inline display of this element to learn if it is
					// being hidden by cascaded rules or not
					if ( !jQuery._data(elem, "olddisplay") && display === "none" ) {
						display = elem.style.display = "";
					}

					// Set elements which have been overridden with display: none
					// in a stylesheet to whatever the default browser style is
					// for such an element
					if ( display === "" && jQuery.css(elem, "display") === "none" ) {
						jQuery._data( elem, "olddisplay", defaultDisplay(elem.nodeName) );
					}
				}
			}

			// Set the display of most of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				elem = this[ i ];

				if ( elem.style ) {
					display = elem.style.display;

					if ( display === "" || display === "none" ) {
						elem.style.display = jQuery._data( elem, "olddisplay" ) || "";
					}
				}
			}

			return this;
		}
	},

	hide: function( speed, easing, callback ) {
		if ( speed || speed === 0 ) {
			return this.animate( genFx("hide", 3), speed, easing, callback);

		} else {
			var elem, display,
				i = 0,
				j = this.length;

			for ( ; i < j; i++ ) {
				elem = this[i];
				if ( elem.style ) {
					display = jQuery.css( elem, "display" );

					if ( display !== "none" && !jQuery._data( elem, "olddisplay" ) ) {
						jQuery._data( elem, "olddisplay", display );
					}
				}
			}

			// Set the display of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				if ( this[i].style ) {
					this[i].style.display = "none";
				}
			}

			return this;
		}
	},

	// Save the old toggle function
	_toggle: jQuery.fn.toggle,

	toggle: function( fn, fn2, callback ) {
		var bool = typeof fn === "boolean";

		if ( jQuery.isFunction(fn) && jQuery.isFunction(fn2) ) {
			this._toggle.apply( this, arguments );

		} else if ( fn == null || bool ) {
			this.each(function() {
				var state = bool ? fn : jQuery(this).is(":hidden");
				jQuery(this)[ state ? "show" : "hide" ]();
			});

		} else {
			this.animate(genFx("toggle", 3), fn, fn2, callback);
		}

		return this;
	},

	fadeTo: function( speed, to, easing, callback ) {
		return this.filter(":hidden").css("opacity", 0).show().end()
					.animate({opacity: to}, speed, easing, callback);
	},

	animate: function( prop, speed, easing, callback ) {
		var optall = jQuery.speed( speed, easing, callback );

		if ( jQuery.isEmptyObject( prop ) ) {
			return this.each( optall.complete, [ false ] );
		}

		// Do not change referenced properties as per-property easing will be lost
		prop = jQuery.extend( {}, prop );

		function doAnimation() {
			// XXX 'this' does not always have a nodeName when running the
			// test suite

			if ( optall.queue === false ) {
				jQuery._mark( this );
			}

			var opt = jQuery.extend( {}, optall ),
				isElement = this.nodeType === 1,
				hidden = isElement && jQuery(this).is(":hidden"),
				name, val, p, e,
				parts, start, end, unit,
				method;

			// will store per property easing and be used to determine when an animation is complete
			opt.animatedProperties = {};

			for ( p in prop ) {

				// property name normalization
				name = jQuery.camelCase( p );
				if ( p !== name ) {
					prop[ name ] = prop[ p ];
					delete prop[ p ];
				}

				val = prop[ name ];

				// easing resolution: per property > opt.specialEasing > opt.easing > 'swing' (default)
				if ( jQuery.isArray( val ) ) {
					opt.animatedProperties[ name ] = val[ 1 ];
					val = prop[ name ] = val[ 0 ];
				} else {
					opt.animatedProperties[ name ] = opt.specialEasing && opt.specialEasing[ name ] || opt.easing || 'swing';
				}

				if ( val === "hide" && hidden || val === "show" && !hidden ) {
					return opt.complete.call( this );
				}

				if ( isElement && ( name === "height" || name === "width" ) ) {
					// Make sure that nothing sneaks out
					// Record all 3 overflow attributes because IE does not
					// change the overflow attribute when overflowX and
					// overflowY are set to the same value
					opt.overflow = [ this.style.overflow, this.style.overflowX, this.style.overflowY ];

					// Set display property to inline-block for height/width
					// animations on inline elements that are having width/height animated
					if ( jQuery.css( this, "display" ) === "inline" &&
							jQuery.css( this, "float" ) === "none" ) {

						// inline-level elements accept inline-block;
						// block-level elements need to be inline with layout
						if ( !jQuery.support.inlineBlockNeedsLayout || defaultDisplay( this.nodeName ) === "inline" ) {
							this.style.display = "inline-block";

						} else {
							this.style.zoom = 1;
						}
					}
				}
			}

			if ( opt.overflow != null ) {
				this.style.overflow = "hidden";
			}

			for ( p in prop ) {
				e = new jQuery.fx( this, opt, p );
				val = prop[ p ];

				if ( rfxtypes.test( val ) ) {

					// Tracks whether to show or hide based on private
					// data attached to the element
					method = jQuery._data( this, "toggle" + p ) || ( val === "toggle" ? hidden ? "show" : "hide" : 0 );
					if ( method ) {
						jQuery._data( this, "toggle" + p, method === "show" ? "hide" : "show" );
						e[ method ]();
					} else {
						e[ val ]();
					}

				} else {
					parts = rfxnum.exec( val );
					start = e.cur();

					if ( parts ) {
						end = parseFloat( parts[2] );
						unit = parts[3] || ( jQuery.cssNumber[ p ] ? "" : "px" );

						// We need to compute starting value
						if ( unit !== "px" ) {
							jQuery.style( this, p, (end || 1) + unit);
							start = ( (end || 1) / e.cur() ) * start;
							jQuery.style( this, p, start + unit);
						}

						// If a +=/-= token was provided, we're doing a relative animation
						if ( parts[1] ) {
							end = ( (parts[ 1 ] === "-=" ? -1 : 1) * end ) + start;
						}

						e.custom( start, end, unit );

					} else {
						e.custom( start, val, "" );
					}
				}
			}

			// For JS strict compliance
			return true;
		}

		return optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},

	stop: function( type, clearQueue, gotoEnd ) {
		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var index,
				hadTimers = false,
				timers = jQuery.timers,
				data = jQuery._data( this );

			// clear marker counters if we know they won't be
			if ( !gotoEnd ) {
				jQuery._unmark( true, this );
			}

			function stopQueue( elem, data, index ) {
				var hooks = data[ index ];
				jQuery.removeData( elem, index, true );
				hooks.stop( gotoEnd );
			}

			if ( type == null ) {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && index.indexOf(".run") === index.length - 4 ) {
						stopQueue( this, data, index );
					}
				}
			} else if ( data[ index = type + ".run" ] && data[ index ].stop ){
				stopQueue( this, data, index );
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					if ( gotoEnd ) {

						// force the next step to be the last
						timers[ index ]( true );
					} else {
						timers[ index ].saveState();
					}
					hadTimers = true;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( !( gotoEnd && hadTimers ) ) {
				jQuery.dequeue( this, type );
			}
		});
	}

});

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout( clearFxNow, 0 );
	return ( fxNow = jQuery.now() );
}

function clearFxNow() {
	fxNow = undefined;
}

// Generate parameters to create a standard animation
function genFx( type, num ) {
	var obj = {};

	jQuery.each( fxAttrs.concat.apply([], fxAttrs.slice( 0, num )), function() {
		obj[ this ] = type;
	});

	return obj;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx( "show", 1 ),
	slideUp: genFx( "hide", 1 ),
	slideToggle: genFx( "toggle", 1 ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.extend({
	speed: function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
		};

		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
			opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

		// normalize opt.queue - true/undefined/null -> "fx"
		if ( opt.queue == null || opt.queue === true ) {
			opt.queue = "fx";
		}

		// Queueing
		opt.old = opt.complete;

		opt.complete = function( noUnmark ) {
			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}

			if ( opt.queue ) {
				jQuery.dequeue( this, opt.queue );
			} else if ( noUnmark !== false ) {
				jQuery._unmark( this );
			}
		};

		return opt;
	},

	easing: {
		linear: function( p, n, firstNum, diff ) {
			return firstNum + diff * p;
		},
		swing: function( p, n, firstNum, diff ) {
			return ( ( -Math.cos( p*Math.PI ) / 2 ) + 0.5 ) * diff + firstNum;
		}
	},

	timers: [],

	fx: function( elem, options, prop ) {
		this.options = options;
		this.elem = elem;
		this.prop = prop;

		options.orig = options.orig || {};
	}

});

jQuery.fx.prototype = {
	// Simple function for setting a style value
	update: function() {
		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		( jQuery.fx.step[ this.prop ] || jQuery.fx.step._default )( this );
	},

	// Get the current size
	cur: function() {
		if ( this.elem[ this.prop ] != null && (!this.elem.style || this.elem.style[ this.prop ] == null) ) {
			return this.elem[ this.prop ];
		}

		var parsed,
			r = jQuery.css( this.elem, this.prop );
		// Empty strings, null, undefined and "auto" are converted to 0,
		// complex values such as "rotate(1rad)" are returned as is,
		// simple values such as "10px" are parsed to Float.
		return isNaN( parsed = parseFloat( r ) ) ? !r || r === "auto" ? 0 : r : parsed;
	},

	// Start an animation from one number to another
	custom: function( from, to, unit ) {
		var self = this,
			fx = jQuery.fx;

		this.startTime = fxNow || createFxNow();
		this.end = to;
		this.now = this.start = from;
		this.pos = this.state = 0;
		this.unit = unit || this.unit || ( jQuery.cssNumber[ this.prop ] ? "" : "px" );

		function t( gotoEnd ) {
			return self.step( gotoEnd );
		}

		t.queue = this.options.queue;
		t.elem = this.elem;
		t.saveState = function() {
			if ( self.options.hide && jQuery._data( self.elem, "fxshow" + self.prop ) === undefined ) {
				jQuery._data( self.elem, "fxshow" + self.prop, self.start );
			}
		};

		if ( t() && jQuery.timers.push(t) && !timerId ) {
			timerId = setInterval( fx.tick, fx.interval );
		}
	},

	// Simple 'show' function
	show: function() {
		var dataShow = jQuery._data( this.elem, "fxshow" + this.prop );

		// Remember where we started, so that we can go back to it later
		this.options.orig[ this.prop ] = dataShow || jQuery.style( this.elem, this.prop );
		this.options.show = true;

		// Begin the animation
		// Make sure that we start at a small width/height to avoid any flash of content
		if ( dataShow !== undefined ) {
			// This show is picking up where a previous hide or show left off
			this.custom( this.cur(), dataShow );
		} else {
			this.custom( this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur() );
		}

		// Start by showing the element
		jQuery( this.elem ).show();
	},

	// Simple 'hide' function
	hide: function() {
		// Remember where we started, so that we can go back to it later
		this.options.orig[ this.prop ] = jQuery._data( this.elem, "fxshow" + this.prop ) || jQuery.style( this.elem, this.prop );
		this.options.hide = true;

		// Begin the animation
		this.custom( this.cur(), 0 );
	},

	// Each step of an animation
	step: function( gotoEnd ) {
		var p, n, complete,
			t = fxNow || createFxNow(),
			done = true,
			elem = this.elem,
			options = this.options;

		if ( gotoEnd || t >= options.duration + this.startTime ) {
			this.now = this.end;
			this.pos = this.state = 1;
			this.update();

			options.animatedProperties[ this.prop ] = true;

			for ( p in options.animatedProperties ) {
				if ( options.animatedProperties[ p ] !== true ) {
					done = false;
				}
			}

			if ( done ) {
				// Reset the overflow
				if ( options.overflow != null && !jQuery.support.shrinkWrapBlocks ) {

					jQuery.each( [ "", "X", "Y" ], function( index, value ) {
						elem.style[ "overflow" + value ] = options.overflow[ index ];
					});
				}

				// Hide the element if the "hide" operation was done
				if ( options.hide ) {
					jQuery( elem ).hide();
				}

				// Reset the properties, if the item has been hidden or shown
				if ( options.hide || options.show ) {
					for ( p in options.animatedProperties ) {
						jQuery.style( elem, p, options.orig[ p ] );
						jQuery.removeData( elem, "fxshow" + p, true );
						// Toggle data is no longer needed
						jQuery.removeData( elem, "toggle" + p, true );
					}
				}

				// Execute the complete function
				// in the event that the complete function throws an exception
				// we must ensure it won't be called twice. #5684

				complete = options.complete;
				if ( complete ) {

					options.complete = false;
					complete.call( elem );
				}
			}

			return false;

		} else {
			// classical easing cannot be used with an Infinity duration
			if ( options.duration == Infinity ) {
				this.now = t;
			} else {
				n = t - this.startTime;
				this.state = n / options.duration;

				// Perform the easing function, defaults to swing
				this.pos = jQuery.easing[ options.animatedProperties[this.prop] ]( this.state, n, 0, 1, options.duration );
				this.now = this.start + ( (this.end - this.start) * this.pos );
			}
			// Perform the next step of the animation
			this.update();
		}

		return true;
	}
};

jQuery.extend( jQuery.fx, {
	tick: function() {
		var timer,
			timers = jQuery.timers,
			i = 0;

		for ( ; i < timers.length; i++ ) {
			timer = timers[ i ];
			// Checks the timer has not already been removed
			if ( !timer() && timers[ i ] === timer ) {
				timers.splice( i--, 1 );
			}
		}

		if ( !timers.length ) {
			jQuery.fx.stop();
		}
	},

	interval: 13,

	stop: function() {
		clearInterval( timerId );
		timerId = null;
	},

	speeds: {
		slow: 600,
		fast: 200,
		// Default speed
		_default: 400
	},

	step: {
		opacity: function( fx ) {
			jQuery.style( fx.elem, "opacity", fx.now );
		},

		_default: function( fx ) {
			if ( fx.elem.style && fx.elem.style[ fx.prop ] != null ) {
				fx.elem.style[ fx.prop ] = fx.now + fx.unit;
			} else {
				fx.elem[ fx.prop ] = fx.now;
			}
		}
	}
});

// Adds width/height step functions
// Do not set anything below 0
jQuery.each([ "width", "height" ], function( i, prop ) {
	jQuery.fx.step[ prop ] = function( fx ) {
		jQuery.style( fx.elem, prop, Math.max(0, fx.now) + fx.unit );
	};
});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}

// Try to restore the default display value of an element
function defaultDisplay( nodeName ) {

	if ( !elemdisplay[ nodeName ] ) {

		var body = document.body,
			elem = jQuery( "<" + nodeName + ">" ).appendTo( body ),
			display = elem.css( "display" );
		elem.remove();

		// If the simple way fails,
		// get element's real default display by attaching it to a temp iframe
		if ( display === "none" || display === "" ) {
			// No iframe to use yet, so create it
			if ( !iframe ) {
				iframe = document.createElement( "iframe" );
				iframe.frameBorder = iframe.width = iframe.height = 0;
			}

			body.appendChild( iframe );

			// Create a cacheable copy of the iframe document on first call.
			// IE and Opera will allow us to reuse the iframeDoc without re-writing the fake HTML
			// document to it; WebKit & Firefox won't allow reusing the iframe document.
			if ( !iframeDoc || !iframe.createElement ) {
				iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
				iframeDoc.write( ( document.compatMode === "CSS1Compat" ? "<!doctype html>" : "" ) + "<html><body>" );
				iframeDoc.close();
			}

			elem = iframeDoc.createElement( nodeName );

			iframeDoc.body.appendChild( elem );

			display = jQuery.css( elem, "display" );
			body.removeChild( iframe );
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return elemdisplay[ nodeName ];
}




var rtable = /^t(?:able|d|h)$/i,
	rroot = /^(?:body|html)$/i;

if ( "getBoundingClientRect" in document.documentElement ) {
	jQuery.fn.offset = function( options ) {
		var elem = this[0], box;

		if ( options ) {
			return this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return jQuery.offset.bodyOffset( elem );
		}

		try {
			box = elem.getBoundingClientRect();
		} catch(e) {}

		var doc = elem.ownerDocument,
			docElem = doc.documentElement;

		// Make sure we're not dealing with a disconnected DOM node
		if ( !box || !jQuery.contains( docElem, elem ) ) {
			return box ? { top: box.top, left: box.left } : { top: 0, left: 0 };
		}

		var body = doc.body,
			win = getWindow(doc),
			clientTop  = docElem.clientTop  || body.clientTop  || 0,
			clientLeft = docElem.clientLeft || body.clientLeft || 0,
			scrollTop  = win.pageYOffset || jQuery.support.boxModel && docElem.scrollTop  || body.scrollTop,
			scrollLeft = win.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft,
			top  = box.top  + scrollTop  - clientTop,
			left = box.left + scrollLeft - clientLeft;

		return { top: top, left: left };
	};

} else {
	jQuery.fn.offset = function( options ) {
		var elem = this[0];

		if ( options ) {
			return this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
		}

		if ( !elem || !elem.ownerDocument ) {
			return null;
		}

		if ( elem === elem.ownerDocument.body ) {
			return jQuery.offset.bodyOffset( elem );
		}

		var computedStyle,
			offsetParent = elem.offsetParent,
			prevOffsetParent = elem,
			doc = elem.ownerDocument,
			docElem = doc.documentElement,
			body = doc.body,
			defaultView = doc.defaultView,
			prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
			top = elem.offsetTop,
			left = elem.offsetLeft;

		while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
			if ( jQuery.support.fixedPosition && prevComputedStyle.position === "fixed" ) {
				break;
			}

			computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
			top  -= elem.scrollTop;
			left -= elem.scrollLeft;

			if ( elem === offsetParent ) {
				top  += elem.offsetTop;
				left += elem.offsetLeft;

				if ( jQuery.support.doesNotAddBorder && !(jQuery.support.doesAddBorderForTableAndCells && rtable.test(elem.nodeName)) ) {
					top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
					left += parseFloat( computedStyle.borderLeftWidth ) || 0;
				}

				prevOffsetParent = offsetParent;
				offsetParent = elem.offsetParent;
			}

			if ( jQuery.support.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
				top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
				left += parseFloat( computedStyle.borderLeftWidth ) || 0;
			}

			prevComputedStyle = computedStyle;
		}

		if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
			top  += body.offsetTop;
			left += body.offsetLeft;
		}

		if ( jQuery.support.fixedPosition && prevComputedStyle.position === "fixed" ) {
			top  += Math.max( docElem.scrollTop, body.scrollTop );
			left += Math.max( docElem.scrollLeft, body.scrollLeft );
		}

		return { top: top, left: left };
	};
}

jQuery.offset = {

	bodyOffset: function( body ) {
		var top = body.offsetTop,
			left = body.offsetLeft;

		if ( jQuery.support.doesNotIncludeMarginInBodyOffset ) {
			top  += parseFloat( jQuery.css(body, "marginTop") ) || 0;
			left += parseFloat( jQuery.css(body, "marginLeft") ) || 0;
		}

		return { top: top, left: left };
	},

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[0] ) {
			return null;
		}

		var elem = this[0],

		// Get *real* offsetParent
		offsetParent = this.offsetParent(),

		// Get correct offsets
		offset       = this.offset(),
		parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

		// Subtract element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		offset.top  -= parseFloat( jQuery.css(elem, "marginTop") ) || 0;
		offset.left -= parseFloat( jQuery.css(elem, "marginLeft") ) || 0;

		// Add offsetParent borders
		parentOffset.top  += parseFloat( jQuery.css(offsetParent[0], "borderTopWidth") ) || 0;
		parentOffset.left += parseFloat( jQuery.css(offsetParent[0], "borderLeftWidth") ) || 0;

		// Subtract the two offsets
		return {
			top:  offset.top  - parentOffset.top,
			left: offset.left - parentOffset.left
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.body;
			while ( offsetParent && (!rroot.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( ["Left", "Top"], function( i, name ) {
	var method = "scroll" + name;

	jQuery.fn[ method ] = function( val ) {
		var elem, win;

		if ( val === undefined ) {
			elem = this[ 0 ];

			if ( !elem ) {
				return null;
			}

			win = getWindow( elem );

			// Return the scroll offset
			return win ? ("pageXOffset" in win) ? win[ i ? "pageYOffset" : "pageXOffset" ] :
				jQuery.support.boxModel && win.document.documentElement[ method ] ||
					win.document.body[ method ] :
				elem[ method ];
		}

		// Set the scroll offset
		return this.each(function() {
			win = getWindow( this );

			if ( win ) {
				win.scrollTo(
					!i ? val : jQuery( win ).scrollLeft(),
					 i ? val : jQuery( win ).scrollTop()
				);

			} else {
				this[ method ] = val;
			}
		});
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}




// Create width, height, innerHeight, innerWidth, outerHeight and outerWidth methods
jQuery.each([ "Height", "Width" ], function( i, name ) {

	var type = name.toLowerCase();

	// innerHeight and innerWidth
	jQuery.fn[ "inner" + name ] = function() {
		var elem = this[0];
		return elem ?
			elem.style ?
			parseFloat( jQuery.css( elem, type, "padding" ) ) :
			this[ type ]() :
			null;
	};

	// outerHeight and outerWidth
	jQuery.fn[ "outer" + name ] = function( margin ) {
		var elem = this[0];
		return elem ?
			elem.style ?
			parseFloat( jQuery.css( elem, type, margin ? "margin" : "border" ) ) :
			this[ type ]() :
			null;
	};

	jQuery.fn[ type ] = function( size ) {
		// Get window width or height
		var elem = this[0];
		if ( !elem ) {
			return size == null ? null : this;
		}

		if ( jQuery.isFunction( size ) ) {
			return this.each(function( i ) {
				var self = jQuery( this );
				self[ type ]( size.call( this, i, self[ type ]() ) );
			});
		}

		if ( jQuery.isWindow( elem ) ) {
			// Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
			// 3rd condition allows Nokia support, as it supports the docElem prop but not CSS1Compat
			var docElemProp = elem.document.documentElement[ "client" + name ],
				body = elem.document.body;
			return elem.document.compatMode === "CSS1Compat" && docElemProp ||
				body && body[ "client" + name ] || docElemProp;

		// Get document width or height
		} else if ( elem.nodeType === 9 ) {
			// Either scroll[Width/Height] or offset[Width/Height], whichever is greater
			return Math.max(
				elem.documentElement["client" + name],
				elem.body["scroll" + name], elem.documentElement["scroll" + name],
				elem.body["offset" + name], elem.documentElement["offset" + name]
			);

		// Get or set width or height on the element
		} else if ( size === undefined ) {
			var orig = jQuery.css( elem, type ),
				ret = parseFloat( orig );

			return jQuery.isNumeric( ret ) ? ret : orig;

		// Set the width or height on the element (default to pixels if value is unitless)
		} else {
			return this.css( type, typeof size === "string" ? size : size + "px" );
		}
	};

});




// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
	define( "jquery", [], function () { return jQuery; } );
}



})( window );

/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
	def: 'easeOutQuad',
	swing: function (x, t, b, c, d) {
		//alert(jQuery.easing.default);
		return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
	},
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */
(function($){
	
	$.extend( $.fn, {
		
		/*
		 * 相对于substance居中对齐 
		 * @para: substance; 要居中对齐的参照节点，默认为body
		 */
		"center" : function( substance ){
			
			/* 计算窗口要显示的坐标位置：left、top、width、height */
			var _wid  = this.width(),
				_hei  = this.height(),
				_left = options.left,
				_top  = options.top,
				
				scrollLeft, scrollTop, width, height;
				
			if(substance){
				scrollLeft	= this[0].scrollLeft;
				scrollTop	= this[0].scrollTop;
				width		= this[0].offsetWidth;
				height		= this[0].offsetHeight;
			}else{
				scrollLeft	= Math.max(document.documentElement.scrollLeft, document.body.scrollLeft)
				scrollTop	= Math.max(document.documentElement.scrollTop, document.body.scrollTop)
				width		= Math.max(document.documentElement.clientWidth, document.documentElement.offsetWidth, document.documentElement.scrollWidth);
				height		= Math.max(document.documentElement.clientHeight, document.documentElement.offsetHeight, document.documentElement.scrollHeight);
			}
				
			/** 水平居中 /**/
			_left = (width < _wid) ? scrollLeft : (width/2) + scrollLeft - (_wid/2);
		
			/** 垂直居中/**/
			_top =  (height < _hei) ? scrollTop : (height/2) + scrollTop - (_hei/2);
			
			return this.css({ top: _top, left: _left});
		},
		
		// 临时禁止选中文字;
		disableSelect : function () {
			$ (this)
			.css({"-moz-user-select":"none", "-webkit-user-select":"none", "-o-user-select":"none", "-ms-user-select":"none", userSelect:"none"})
			.bind("selectstart", function(){return false;});
		},
		
		// 取消禁止选中文字;
		enableSelect : function ( elem ) {
			// 临时禁止选中文字;
			$ (this)
			.css({"-moz-user-select":"", "-webkit-user-select":"", "-o-user-select":"", "-ms-user-select":"", userSelect:""})
			.unbind("selectstart");
		},
		
		// 闪
		flash : function(){
			_this.animate( {opacity:0.5}, 40 )
			.animate( {opacity:1}, 40 )
			.animate( {opacity:0.5}, 40 )
			.animate( {opacity:1}, 40 )
			.animate( {opacity:0.5}, 40 )
			.animate( {opacity:1}, 40, function(){});
		},
		
		// 左右摇动
		shake : function( callback ){
			return this.each(function(){
				var _this = $(this),
					ml = _this.css("marginLeft");
				if(ml=="auto"){
					_this.css("marginLeft", _this.parent().width()/2 - _this.width()/2);
				}
				
				_this.animate( {marginLeft:"-=5px"}, 40 )
					.animate( {marginLeft:"+=10px"}, 40 )
					.animate( {marginLeft:"-=5px"}, 40 )
					.animate( {marginLeft:"+=4px"}, 40 )
					.animate( {marginLeft:"-=4px"}, 40 )
					.animate( {marginLeft:"+=2px"}, 40 )
					.animate( {marginLeft:"-=2px"}, 40, function(){
						$.isFunction(callback)&&callback.call(_this);
						if(ml=="auto")$(_this).css({marginLeft:"auto"});
					});
			});
		},
		
		scaleTo : function( offset, callback ){
			return this.each(function(){
				var _this = $(this);
				var wid = _this.width(),
					hei = _this.height(),
					lft = _this.css("left"),
					top = _this.css("top");
				
				var _offset = !$.isPlainObject(offset)
					? $.extend({}, $(offset).offset(), {width:$(offset).width(), height:$(offset).height(), opacity:0})
					: offset;
				
				panel.animate(_offset, 1200,"easeOutBounce", function(){
					_this.css({display:"none",width:wid, height:hei,left:lft, top:top, opacity:1});
					$.isFunction(callback) && callback.call(_this);
				});
			});
		},
		
		// 反转
		evert : function(){
			return this.css({
				"-moz-transform"    : "translateZ(-300px) rotateY(90deg) rotateX(0deg)",
				"-webkit-transform" : "translateZ(-800px) rotateY(90deg) rotateX(0deg)",
				"-o-transform"      : "translateZ(-300px) rotateY(90deg) rotateX(0deg)",
				"-ms-transform"     : "translateZ(-300px) rotateY(90deg) rotateX(0deg)",
				"transform"         : "translateZ(-300px) rotateY(90deg) rotateX(0deg)"
			});
		},
		
		// 正面
		facade : function(){
			return this.css({
				"-moz-transform"    : "translateZ(0px) rotateY(0deg) rotateX(0deg)",
				"-webkit-transform" : "translateZ(0px) rotateY(0deg) rotateX(0deg)",
				"-o-transform"      : "translateZ(0px) rotateY(0deg) rotateX(0deg) ",
				"-ms-transform"     : "translateZ(0px) rotateY(0deg) rotateX(0deg)",
				"transform"         : "translateZ(0px) rotateY(0deg) rotateX(0deg)"
			});
		},
		
		// 启用3D透视效果
		enable3D : function(){
			this.parent().css({
				"-moz-transform-style"    : "preserve-3d",
				"-webkit-transform-style" : "preserve-3d",
				"-ms-transform-style"     : "preserve-3d",
				"-o-transform-style"      : "preserve-3d",
				"transform-style"         : "preserve-3d",
				"-webkit-transform-style" : "perspective"
			});
			return this;
		},
		
		// 禁用3D透视效果
		disable3D : function(){
			this.parent().css({
				"-moz-transform-style"    : "",
				"-webkit-transform-style" : "",
				"-ms-transform-style"     : "",
				"-o-transform-style"      : "",
				"transform-style"         : ""
			});
			return this;
		},
		
		// 启用动态变幻效果
		enableAnimate : function( duration, delay, easing ){
			var v1 = duration || ".4s",
				v2 = easing || "ease",
				v3 = delay || "0s",
				v  = [v1,v2,v3].join(" ");
			this.css({
				"-moz-transition"    : "-moz-transform "+v,
				"-webkit-transition" : "-web-transform "+v,
				"-o-transition"      : "-o-transform "+v,
				"-ms-transition"     : "-ms-transform "+v,
				"transition"         : "transform "+v
			});
			return this;
		},
		
		// 禁用动态变幻效果
		disableAnimate : function(){
			return this.css({
				"-moz-transition"    : "",
				"-webkit-transition" : "",
				"-o-transition"      : "",
				"-ms-transition"     : "",
				"transition"         : ""
			});
		}
		
	});
	
})(jQuery)
/* 
 * @CLASS: 拖动组件
 * @Copyright: 时代光华
 * @Author: 罗志华
 * @mail: mail@luozhihua.com
 */
 
;(function($){
	$.fn.drag = function(settings){
		
		// 实例统计
		$.fn.drag.count = $.fn.drag.count ? $.fn.drag.count++ : 1;
		var _count = $.fn.drag.count;
		
		var defaults = {
			  window      : window   // 用于在多框架或含有iframe的页面中设置鼠标感应的区域位于哪个框架内
			, document    : document // 用于在多框架或含有iframe的页面中设置鼠标感应的区域位于哪个框架内
			, handle      : null     // 拖动手柄,类型:jQuery Selector
			, timeout     : 0        // 鼠标按下后延迟一定时间再触发拖放动作 
			, area        : null     // 拖动的限制区域,  类型:jQuery Object or Selector, 默认不限制, 设为true时为body。
			, areaMargin  : 0		 // 被拖动对象离限制区域边缘的距离
			, targetChild : null     // 要拖动到的目标节点的下的同级节点
			, focus       : false    // 拖动后是否获得焦点
			, animate     : false    // 动态效果
			, cursor      : "move"   // 鼠标样式
			, target      : null     // 目标节点集, 类型:jQuery Object or Selector, 默认:null
			, staff       : "x"      // 判断被拖动元素在同级节点中的排列是上下排列还是左右排列
			, disableInsert  : null  // 目标节点集, 类型:jQuery Object or Selector, 默认:null
			, insertToTarget : true  // 拖动完毕后是否把拖动对象插入到目标节点,类型:boolean,默认:true
			, onDragStart    : function(event){}         // 拖动前的事件,类型:function
			, onDrag         : function(event, offset){} // 拖动时的事件,类型:function
			, onDragEnd      : function(event){}         // 拖动完毕的事件,类型:function
			, onItemMouseover: function(event){} // 
			, onItemMouseout : function(event){} // 
			, ghostClass     : null // 拖动位置指示的class
			, enabled        : function(){ return true; }
			
			, event : {
				  dragStart       : function(){}
				, drag            : function(){}
				, drop            : function(){}
				, dragEnd         : function(){}
				, itemMouseover   : function(){}
				, itemMouseout    : function(){}
				, targetMouseover : function(){}
				, targetMouseout  : function(){}
			}
		}
		
		var options = $.extend( {}, defaults, settings);
			options.document    = options.document || document;
			options.targetChild = $( options.targetChild || this.selector || this );
		// options.area = options.area || options.document.body;
		
		var _area;  // 限制拖动区域
		var _updateArea = function() {
			var a = options.area,
				m = options.areaMargin,
				c = tbc.percentToInt;
			if (a === true) {
				a = options.area = options.document.body;
				_area = tbc.getCoordinate( $(a)[0] );
				_area.bottom = Math.max(options.document.body.offsetHeight,
										options.document.body.scrollHeight,
										options.document.body.clientHeight,
										options.document.documentElement.clientHeight,
										options.document.documentElement.offsetHeight,
										options.document.documentElement.scrollHeight);
				_area.right  = Math.max(options.document.body.offsetWidth,
										options.document.body.scrollWidth,
										options.document.body.clientWidth,
										options.document.documentElement.clientWidth,
										options.document.documentElement.offsetWidth,
										options.document.documentElement.scrollWidth);
				
				_area.height = _area.bottom-_area.top;
				_area.width  = _area.right-_area.left;
				
			}else if( !$.isPlainObject(a) ){
			
				_area = tbc.getCoordinate( $(a)[0] );
				
				$(a).each(function( i, o ) {
					var _a = tbc.getCoordinate( o);
					_area.left   = Math.min(_area.left, _a.left);
					_area.right  = Math.max(_area.right, _a.right);
					_area.top    = Math.min(_area.top, _a.top);
					_area.bottom = Math.max(_area.bottom, _a.bottom);
				});
				
			}else{
				var h = $this.offsetParent().height(),
					w = $this.offsetParent().width();
				_area = { left: c(a.left, w), top:c(a.top, h), right:c(a.right,w), bottom:c(a.bottom, h) };
			}
			
			if(m && m.left && m.top){
				_area.left   += c( m.left, $this.width() );
				_area.right  += c( m.right, $this.width() );
				_area.top    += c( m.top, $this.height() );
				_area.bottom += c( m.bottom, $this.height() );
			}
			a = m = c = null;
		};
		
		// 给被禁止插入的区域添加标记,用于在拖动时判断是否能够移动到该区域
		if(options.disableInsert){
			var dsb = $(options.disableInsert).data("onDragDisableInsert");
				dsb = dsb || [];
				if(tbc.array.indexOf(dsb,_count)==-1) dsb.push(_count);
			$(options.disableInsert).data("onDragDisableInsert", dsb);
		}
		
		var $this   = this;
		
		return this.each ( function ( index, _this ) {
			_this = $(_this);
			
			var moving = false;
			
			// 鼠标按下后延迟一定时间再触发拖放动作
			var timeout 
			
				// 记住原位置,当拖动结束而没有找到目标时,则让被拖动对象归位
				, org_position = {
					parent : _this.parent(),
					prev : _this.prev()
				}
				
				, handle = $(options.handle, _this)
				, _wrap
				, _ghost
			
				// 记录鼠标点击位置 到 对象上边、左边的距离
			 	, mouseStartPos
				, mouseToTargetTop
				, mouseToTargetLeft
				, _scrTop  = options.document.documentElement.scrollTop ||options.document.body.scrollTop
				, _scrLeft = options.document.documentElement.scrollLeft||options.document.body.scrollLeft;
				
			handle = handle.size() ? handle : _this;
			
			// 绑定事件
			handle.bind({
				
				// 针对触摸屏的触控拖动
				"touchstart" : function( event ){
					event = event.originalEvent;
					event.stopContextmenu = true;
					
					var _touchstartOffset = {
						x : event.changedTouches[0].pageX - parseInt(_this.css("left")),
						y : event.changedTouches[0].pageY - parseInt(_this.css("top"))
					};
					
					mouseToTargetTop = _touchstartOffset.y;
					mouseToTargetLeft = _touchstartOffset.x;
						
					$(this).bind({
						"touchmove.touchDrag": function(event){
							event = event.originalEvent;
							var offset = getDragingOffset(event),
								x = offset.left,
								y = offset.top;
								
							_this.css({left: x, top:y});
							return false;
						},
						"touchend.touchDrag" : function(event){
							$(this).unbind(".touchDrag");
						}
					})
					
				},
				"mouseleave" : function(){ clearTimeout(timeout); },
				"mouseup"    : function(){ clearTimeout(timeout); },
				"mousedown"  : function(event){
					
					//event.stopPropagation();
					event.disableSelectArea = true;
					
					if ( !options.enabled() || (tbc.msie&&tbc.browserVersion<9 && event.button!=1) || (((tbc.msie&&tbc.browserVersion>8)||!tbc.msie)&&event.button!=0) ){
						return;
					}
					
					if(options.timeout)
					{
						timeout = setTimeout(_start, options.timeout);
					}else{
						_start();
					}
					
					var timer;
					
					function _start() {
						
						$(options.document)
						.unbind(".drag")
						.bind({
							"mousemove.drag"   : mousemove_drag,
							"mouseup.drag"     : mouseup_drag,
							"contextmenu.drag" : function(){ return false;}
						});
					}
					
					function mousemove_drag(event){
						
						if (moving===false) {
							startDrag(event);
							moving = true;
						}
						
						clearTimeout(timer);
						/**
						event.clientX = event.clientX || event.changedTouches[0].clientX;
						event.clientY = event.clientY || event.changedTouches[0].clientY;
						event.pageX   = event.pageX   || event.changedTouches[0].pageX;
						event.pageY   = event.pageY   || event.changedTouches[0].pageY;
						*/
						
						var offset = getDragingOffset(event);
						
						if(options.target){
							_wrap.css({position: "absolute", top:offset.top, left:offset.left, width:offset.width});
						}else{
							_this.css({top:offset.top, left:offset.left});
						}
						
						$.extend( offset, {mouseX : event.clientX + _scrLeft, mouseY : event.clientY + _scrTop} );
						
						timer = setTimeout(function(){
							draging(event, offset);
						},30);
					}
					
					function mouseup_drag(event){
						
						var eTarget
							, xy
							, cb
							, insertable
							, dropon = _ghost ? _ghost[0] : null;
							
						event.dropon = dropon;
						
						moving = false;
						
						insertable = $.isFunction(options.event.drop) 
						? (options.event.drop.call(_this[0], event)!==false)
						: true;
						
						$(options.document).unbind(".drag");
						
						$("body").css({"-moz-user-select":"normal", "webkitUserSelect":"normal", "oUserSelect":"normal", "userSelect":"normal"})
						.unbind( "selectstart");
							
						if( options.target )
						{
							eTarget = _ghost.parent();
							
							$.extend(event, {target:eTarget});
							
							xy = tbc.getCoordinate( _ghost[0] );
							
							cb = function() 
							{								
								// 执行自定义结束事件
								try{
									if( insertable ){
										_this.removeClass("dragging").insertAfter( _ghost );
									};
									
									hideWrap();
									hideGhost(); // 隐藏虚线框
									$.isFunction(options.event.dragEnd) && options.event.dragEnd.call(_this[0], event)
								}catch(e){}
								
								// 如果设置为:拖动后不获得焦点,
								// 则改回拖动之前的z-index值;
								if(options.focus)
								{
									_this.css("zIndex", _this.data("_zIndex")).data("_zIndex", null);
								}
							}
							
							if( options.animate )
							{
								_wrap.animate({ width:xy.width, height:xy.height, left:xy.left, top:xy.top }, 400, cb);
							}else{
								_wrap.css({left:xy.left, top:xy.top }); cb();
							}
							
						}else{
							
							// 如果设置为:拖动后不获得焦点,
							// 则改回拖动之前的z-index值;
							if(options.focus)
							{
								_this.css("zIndex", _this.data("_zIndex")).data("_zIndex", null);
							}
							// 执行自定义结束事件
							try{
								$.isFunction(options.event.dragEnd) && options.event.dragEnd.call(_this[0], event);
							}catch(e){
								
							}
							
							hideWrap();
							
						}
						
						eTarget = xy = cb = insertable = dropon = null;
					}
				}
			})
			
			
			// 用于临时放置被拖动对象的克隆对象的盒子
			function wrap(w, h){
				var wrap = $("#drag_wrap");
				return wrap.size() ? wrap : $('<div id="drag_wrap"></div>').css({width:w, height:h});
			}
			
			function hideWrap(){
				$("#drag_wrap").remove();
				_wrap = null;
			}
			
			// 创建拖动时的目标占位模块
			function ghost(w, h){
				
				var drag_ghost_tag = ($this[0].tagName||$this[0].nodeName).toLowerCase();
				var g = $("#drag_ghost");
					g = g.size() 
						? g.show()
						: $('<'+drag_ghost_tag+' id="drag_ghost"></'+drag_ghost_tag+'>').insertAfter(_this);
				
				options.ghostClass 
				? g.addClass(options.ghostClass)
				: g.css({border:"#000 1px dotted", width: w, height: h})
				
				return g;
			}
			
			// 隐藏拖动时的目标占位模块
			var hideGhost = function(){
				$("#drag_ghost").remove();
				_ghost = null;
			}
			
			// Start Drag
			function startDrag(event, data) {
				$.isFunction(options.onDragStart) && options.onDragStart.call(_this[0], event );
				$.isFunction(options.event.dragStart) && options.event.dragStart.call(_this[0], event );
				
				getScrollTop();
									
				// 记录鼠标点击位置 到 对象上边、左边的距离
				mouseStartPos     = tbc.getCoordinate(_this[0]);
				
				// 鼠标指针到被拖动对象的上边距离
				mouseToTargetTop  = event.clientY - mouseStartPos.top  + (options.document.documentElement.scrollLeft||options.document.body.scrollTop);
				
				// 鼠标指针到被拖动对象的左边距离
				mouseToTargetLeft = event.clientX - mouseStartPos.left + (options.document.documentElement.scrollLeft||options.document.body.scrollLeft);
				
				$("body")
				.css({"-moz-user-select":"none", "webkitUserSelect":"none", "oUserSelect":"none", "userSelect":"none"})
				.bind( "selectstart", function(){return false;} );
				
				var _width  = _this.width(),
					_height = _this.height();
				
				_wrap  = wrap()
				.css({position:"absolute", visible:"visible", display:"none", width:_this.outerWidth(), height:_this.outerHeight(), zIndex:tbc.getMaxZIndex()})
				.appendTo("body").show();
								
				// 生成虚线框
				if(options.target){
					_ghost = ghost().show();
					_ghost.css({width:_width, height:_height}).insertAfter(_this);
					var __ = _this.clone().remove().removeClass("ue-app").addClass("ue-app-clone") ;//$("<div></div>").append( );
								
					_wrap.append(__);
				}
				
				var offset = getDragingOffset(event);
				_wrap.css({position: "absolute", top:offset.top, left:offset.left, width:offset.width});
			}
			
			function getScrollTop(){
				_scrTop  = options.document.documentElement.scrollTop ||options.document.body.scrollTop;
				_scrLeft = options.document.documentElement.scrollLeft||options.document.body.scrollLeft;
				
				return {top: _scrTop, left:_scrLeft};
			}
			
			// 
			function getDragingOffset(event)
			{
				getScrollTop();
				_updateArea();
				var _scrTop_parent  = 0,
					_scrLeft_parent = 0;
				
				var offset = _wrap ? tbc.getCoordinate(_wrap[0].offsetParent) : {left:0,top:0};
				var parentOff = _wrap ? tbc.getCoordinate(_wrap[0].offsetParent) : {left:0,top:0} ;
				var iframeTop=0,iframeLeft=0;
				if ( options.window.frameElement!==null ){
					var iframeOffset = $(options.window.frameElement).offset();
					if ( iframeOffset ) {
						iframeTop = iframeOffset.top;
						iframeLeft = iframeOffset.left;
					}
				};
				
				// 计算将要拖动到的新坐标位置
				var _top    = event.pageY 
							- offset.top 
							- _this[0].offsetParent.offsetTop  
							- mouseToTargetTop
							+ _scrTop
							+ iframeTop,
					_left   = event.pageX 
							- offset.left 
							- _this[0].offsetParent.offsetLeft  
							- mouseToTargetLeft
							+ _scrLeft
							+ iframeLeft,
					_width  = _this.width(),
					_height = _this.height(),
					_bottom = _top  + _height,
					_right  = _left + _width;
					
				var o = {top:_top, left:_left, right:_right, bottom:_bottom, width:_width, height:_height};
				
				// 根据设定的限制区域重新计算拖动对象的新坐标位置
				if(options.area)
				{
					o.top  = o.bottom >= _area.bottom ? (_area.bottom - o.height) : Math.max(_area.top, o.top);
					o.left = o.right >= _area.right ? (_area.right - o.width) : Math.max(_area.left, o.left);
				}
				
				return o;
			}
			
			function draging(event, data){
				
				if( options.area && (data.mouseX < _area.left || data.mouseX > _area.right || data.mouseY<_area.top || data.mouseY >_area.bottom))
				return;
				
				// 检测列下面是否有可拖动的元素
				function hasSiblings(block, column){
					var size = 0;
					block.each(function(i, o){
						if( $("*", column).index(o)!=-1 )size ++;
					});
					
					return size!==0;
				}
				
				var $tgt;
				if ( options.target!==null )
				{
					options.targetChild = $(options.targetChild.selector );
					
					// 遍历拖动的目标区域
					$(options.target)
					.each ( function(){
						$tgt = $(this);
						var acceptAlight = (function(){
								var data = $tgt.data("onDragDisableInsert");
								return (tbc.array.indexOf(_count, data) == -1);
							})();
						var t_pos = tbc.getCoordinate(this);
						var p_pos = tbc.getCoordinate(this.parentNode);
						if(data && data.mouseX > t_pos.left && data.mouseX < t_pos.right && data.mouseY>t_pos.top && data.mouseY <t_pos.bottom)
						{
							//if(options.targetChild !== null)
							
							// 触发区域鼠标移入感应事件
							if($tgt.attr("_dragHover")!="true"){
								var e = $.extend({}, event, {target: $tgt});
								
								$.isFunction(options.onTargetMouseover)&&options.onTargetMouseover.call( _this[0], e );
								$.isFunction(options.event.targetMouseover) && options.event.targetMouseover.call(_this[0], e );
								
								$tgt.attr("_dragHover", "true");
							}
							
							// 判断是否有可拖动子节点,如果没有则直接移动到该区域
							if( !hasSiblings(options.targetChild, $tgt) ){
								
								if(options.insertToTarget && acceptAlight)
									_ghost.appendTo($tgt);
								return false;
							}
							else{
								
								var a=[];
								$(options.targetChild, $tgt).each(function(){a.push($(".ue-apptitle",this).text())});
								
								if(options.insertToTarget && acceptAlight && $tgt[0]==_ghost.parent()[0])
								{
									_ghost.appendTo($tgt);
								}
								
								$(options.targetChild, $tgt)
								.each(function(i, o){
									
									var t_child_pos = tbc.getCoordinate(o),
										t_child     = o;
									
									if(_wrap.children()[0]==o) return true;
									
									// 如果是当前对象则跳过
									if( t_child == _this[0] ) return true;
									
									if(data.mouseX > t_child_pos.left && data.mouseX < t_child_pos.right
									   && data.mouseY > t_child_pos.top && data.mouseY < t_child_pos.bottom)
									{
										var _halfY = $(t_child).height()/2,
											_halfX = $(t_child).width()/2
											
										if ( (options.staff=="y" && (data.mouseY - t_child_pos.top) <  _halfY) || (options.staff=="x" && (data.mouseX - t_child_pos.left) < _halfX) ) 
										{
											if(options.insertToTarget && acceptAlight)
											{
												_ghost.insertBefore(t_child);
											}
										}
										else if( (options.staff=="y" && data.mouseY+_halfY>t_child_pos.top) || (options.staff=="x" && data.mouseX+_halfX>t_child_pos.right) )
										{
											if(options.insertToTarget && acceptAlight)
												_ghost.insertAfter(t_child);
										}else if(options.insertToTarget && acceptAlight){
												_ghost.insertAfter(t_child);
										}
										
										// 触发可拖动对象在options中设置好的mouseover事件
										if($(t_child).attr("_dragHover")!="true"){
											var e = $.extend({}, event, {target: t_child});
											
											$.isFunction(options.onItemMouseover) && options.onItemMouseover.call( _this[0], e );
											$.isFunction(options.event.itemMouseover) && options.event.itemMouseover.call(_this[0], e );
										
											$(t_child).attr("_dragHover", "true");
										}
										
										return true;
									}else{
										if($(t_child).attr("_dragHover") == "true"){
											var e = $.extend({}, event, {target: t_child});
											options.onItemMouseout.call( _this[0], e);
											$.isFunction(options.event.itemMouseout) && options.event.itemMouseout.call(_this[0], e );
											$(t_child).removeAttr("_dragHover");
										}
									}
									
								});
								
							}
							
							
							
						// 当某一列高度小于其他列时,扩展感应的区域
						}else{
							if(data && data.mouseX > t_pos.left && data.mouseX < t_pos.right && data.mouseY>p_pos.top && data.mouseY <p_pos.bottom)
							{
								if(options.insertToTarget && acceptAlight)
									_ghost.appendTo($tgt);
							}
							
							// 触发目标区域的mouseout事件					
							if($tgt.attr("_dragHover") == "true"){
								var e = $.extend({}, event, {target: $tgt});
								$.isFunction(options.onTargetMouseout) && options.onTargetMouseout.call( _this[0], e );
								$.isFunction(options.event.targetMouseout) && options.event.targetMouseout.call(_this[0], e );
								$tgt.removeAttr("_dragHover");
							}
						}
					});
				}
				
				/**/
				if ( $.fn.scrollTo )
				{
					var top = document.documentElement.scrollTop;
					var btm = top + Math.max(document.body.clientHeight,document.documentElement.clientHeight,
											 document.body.offsetHeight,document.documentElement.offsetHeight);
					
					if( event.pageY < top+20 ){
						$(options.area).scrollTo("-=20px", 0);
					}else if(event.pageY > btm-20){
						$(options.area).scrollTo("+=20px", 0);
					}
				}
				/**/
				
				$.extend(event, {target: $tgt});
				// 执行自定义拖动事件
				try{
					$.isFunction(options.onDrag) && options.onDrag.call( _this[0], event, data );
					$.isFunction(options.event.drag) && options.event.drag.call( _this[0], event, data );
				}catch(e){
					
				}
			}
		});
		
	}
})(jQuery);

function t(t){$("#tips").append("<div>"+t+"; </div>");}
/* 
 * @CLASS: Resize组件
 * @Copyright: 时代光华
 * @Author: 罗志华
 * @mail: mail@luozhihua.com
 */
(function($){
	$.fn.resizableForTbc = function(settings){
		var defaults = {
			  minWidth       : 10
			, minHeight      : 10
			, maxWidth       : document.documentElement.offsetWidth
			, maxHeight      : document.documentElement.scrollHeight
			, handle         : null // $(".resize-handle", this)			
			, vector         : "normal" // 类型: string, 取值范围: north, north-west, north-east, west, east, south, south-west, south-east
			, document       : document // 用于不同框架的元素重置大小。
			, margin         : {left:0, top:0, right:0, bottom:0} // 虚线框与被拖动对象边框的间距，如果被拖动对象设有margin值，这里就要相应设置该对象的每一个值
			, enabled        : function(){ return true; }
			
			/* 事件 */
			, onResizeStart : function(){}
			, onResize      : function(){}
			, onResizeEnd   : function(){}
		}
		
		return this.each(function(){
			var $this   = $(this);
			var options = $.extend( {}, defaults, settings );
				options.handle = $(options.handle, this);
			
			
			if( !options.handle.size() ){
				if( $this.css("position")==="static" ){
					$this.css({position:"relative"});
				}
				
				// 为木有调节手柄的节点添加调节手柄。
				options.handle = $('<div role="south-east" />')
				.css({width:"6px", height:"6px", position:"absolute", right:"0px", bottom:"0px", lineHeight:"0", overflow:"hidden",
					 border:"3px solid #f90", borderWidth:"0 3px 3px 0", cursor:"se-resize"})
				.hover(
					function(){ $(this).css({borderColor:"#09f"}); },
					function(){ $(this).css({borderColor:"#f90"}); }
				)
				.append('<div style="overflow: hidden; border: solid #fff 0px; border-width:3px 0pt 0pt 3px; width: 1px; height: 1px;"></div>')
				.appendTo(this)
				.fadeOut();
				
				$this.hover
				(
					function(){ options.handle.fadeIn(); },
					function(){ options.handle.fadeOut(); }
				);
			}
			
			// 限定拖动的方向			
			var vector = {x:0,y:0};
			
			options.handle.each(function(){
				/**
				 switch( this.getAttribute("role").toLowerCase() ) {
					case 'west'	      : $(this).css({cursor:"w-resize"});  break;
					case 'east'	      : $(this).css({cursor:"e-resize"});  break;
					case 'north'      : $(this).css({cursor:"n-resize"});  break;
					case 'south'      : $(this).css({cursor:"s-resize"});  break;
					case 'north-west' : $(this).css({cursor:"nw-resize"}); break; 
					case 'south-west' : $(this).css({cursor:"sw-resize"}); break; 
					case 'north-east' : $(this).css({cursor:"ne-resize"}); break; 
					case 'south-east' : $(this).css({cursor:"se-resize"}); break; 
					default:;
				}
				**/
			})
			.bind( "mousedown", function( event ){
				
				if(!options.enabled()){ return null; }
				
				var _this = this;
				
				
				// 临时禁止选中文字;
				$("body")
				.css({"-moz-user-select":"none","-webkit-user-select":"none","-o-user-select":"none","-ms-user-select":"none",userSelect:"none"})
				.bind("selectstart", function(){return false;})
				
				options.onResizeStart.call($this);
				
				// 调整前的位置和大小
				var bound = tbc.getCoordinate( $this[0] );
					bound.left   += options.margin.left;
					bound.right  -= options.margin.right;
					bound.top    += options.margin.top;
					bound.bottom -= options.margin.bottom;
					bound.width  -= (options.margin.left+options.margin.right);
					bound.height -= (options.margin.top+options.margin.bottom);
				
				// 调整后的位置和大小
				var newSize = $.extend( {}, bound );
				
				// 调整大小时用虚线框标识调整后的位置和大小
				var zIndex = tbc.getMaxZIndex(options.document),
					mirror = $('<div />')
					.css({
						   position:"absolute", zIndex:zIndex+1, left:bound.left, top:bound.top
						 , width:bound.width, height:bound.height
						 , border:"1px dotted blue", background:"#fff", opacity:0.7
					})
					.appendTo($("body", options.document));

				// 设置调整的方向
				var vector;
				var _thisVector = $(this).attr("role");
				switch( _thisVector ) {
					case 'west'	      : vector = {x:-1, y: 0}; break;
					case 'east'	      : vector = {x: 1, y: 0}; break;
					case 'north'      : vector = {x: 0, y:-1}; break;
					case 'south'      : vector = {x: 0, y: 1}; break;
					case 'north-west' : vector = {x:-1, y:-1}; break; 
					case 'south-west' : vector = {x:-1, y: 1}; break; 
					case 'north-east' : vector = {x: 1, y:-1}; break; 
					case 'south-east' : vector = {x: 1, y: 1}; break; 
					default: return false;
				}
					
				$(options.document).bind( "mousemove.resizable", function( event ){
					
					options.maxWidth = document.documentElement.offsetWidth;
					options.maxHeight= document.documentElement.offsetHeight;
					
					// 修正X,Y
					var x = Math.max( Math.min( event.pageX, bound.right ), bound.left );
					var y = Math.max( Math.min( event.pageY, bound.bottom ), bound.top ); 
					
					// 向左增加宽度
					if( vector.x===-1 ){
						newSize.left  = Math.max(0, bound.right-options.maxWidth, Math.min(event.pageX, bound.right-options.minWidth));
						newSize.width = Math.min(options.maxWidth, Math.max(bound.left-event.pageX+bound.width, options.minWidth));
					}				
						// 向右增加宽度
					if( vector.x=== 1 ){ 
						newSize.width = Math.min(options.maxWidth, Math.max(event.pageX-bound.left, options.minWidth)); 
						newSize.right = Math.min(bound.left+options.maxWidth, Math.max(event.pageX, bound.left+options.minWidth));
						}
					if( vector.y===-1 ){			
						// 向上增加宽度
						newSize.top = Math.max(0,bound.bottom-options.maxHeight, Math.min(event.pageY, bound.bottom-options.minHeight));
						newSize.height = Math.min(options.maxHeight, Math.max(bound.top-event.pageY+bound.height, options.minHeight));}
						// 向下增加宽度
					if( vector.y=== 1 ){ 
						newSize.height = Math.min(options.maxHeight, Math.max(event.pageY-bound.top, options.minHeight)); 
						newSize.bottom = Math.min(bound.top+options.maxHeight, Math.max(event.pageY, bound.top+options.minHeight));
						}
					
					mirror.css({'left':newSize.left, 'top':newSize.top, 'width':newSize.width,'height':newSize.height});
					
					var _new = $.extend({}, newSize);
						_new.left   -= options.margin.left;
						_new.right  += options.margin.right;
						_new.top    -= options.margin.top;
						_new.bottom += options.margin.bottom;
						_new.width  += (options.margin.left+options.margin.right);
						_new.height += (options.margin.top+options.margin.bottom);
					
					// 如果元素不是绝对定位则删掉top/left/right/bottom等CSS值
					if( $this.css("position")!="absolute" ){
						delete(_new.top);
						delete(_new.left);
						delete(_new.right);
						delete(_new.bottom);
					}
					
					options.onResize.call($this, _new);
									
				}).bind("mouseup.resizable", function(){
					
					
					// 解除禁止选中文字;
					$("body").css({"-moz-user-select":"","-webkit-user-select":"","-o-user-select":"","-ms-user-select":"",userSelect:""})
					.unbind("selectstart");
					
					$(this).unbind(".resizable");
					
					newSize.left   -= options.margin.left;
					newSize.right  += options.margin.right;
					newSize.top    -= options.margin.top;
					newSize.bottom += options.margin.bottom;
					newSize.width  += (options.margin.left+options.margin.right);
					newSize.height += (options.margin.top+options.margin.bottom);
					
					// 如果元素不是绝对定位则删掉top/left/right/bottom等CSS值
					if( $this.css("position")!="absolute" ){
						delete(newSize.top);
						delete(newSize.left);
						delete(newSize.right);
						delete(newSize.bottom);
					}
					
					$this.css(newSize);
					options.onResizeEnd.call($this, newSize);
					
					mirror.remove();
				});
				
				return false;
			});
		});
	}
	
})(jQuery);

// JavaScript Document
// JavaScript Document
;(function($){
    
    "use strict";
    
    $(document).ready(function(e) {
        
        // 添加CSS样式
        $("head").append('<style type="text/css" id="contextmenuStyle">' +
        '    /* insert by jQuery.Contextmenu.js */' +
        '    .ue-contextmenu{position:absolute; z-index:1000; left:100px; top:100px; font-size:12px;}' +
        '    .ue-contextmenu *{-moz-transition:.3s;-webkit-transition:.3s;-o-transition:.3s;-ms-transition:.3s;transition:.3s;}' +
        '    .ue-contextmenu ul{+width:180px; min-width:180px; background-color:#fff; box-shadow:3px 3px 4px rgba(0,0,0,0.8); border:1px solid #888;}' +
        '    .ue-contextmenu ul,.ue-contextmenu li{ list-style:none; margin:0; padding:0;}' +
        '    .ue-contextmenu li{height:28px; line-height:28px; +width:100%; position:relative; +float:left;}' +
        '    .ue-contextmenu .ue-item,.ue-contextmenu .ue-item:visited{display:block; width:100%; height:100%; white-space:nowrap; word-break:keep-all; text-decoration:none; color:#333;}' +
        '    .ue-contextmenu .ue-item:hover{ color:#fff;}' +
        '    .ue-contextmenu li.hover{ background-color:#219CCB;}' +
        '    .ue-contextmenu li.hover .ue-item{color:#fff;}' +
        '    .ue-contextmenu li.hover li .ue-item{color:#333;}' +
        '    .ue-contextmenu .ue-item span{ display:block; height:100%; cursor:default;}' +
        '    .ue-contextmenu .ue-item span.ue-icon{ width:28px; float:left; overflow:hidden;' +
        '        background-color:#eee; background-color:rgba(27,138,228,0.15); background-position:50% 50%; background-repeat:no-repeat;' +
        '        position:absolute; left:0; top:0;}' +
        '    .ue-contextmenu .ue-item span.ue-icon span{ height:16px; margin:6px 0 0 6px;}' +
        '    .ue-contextmenu li.hover span.ue-icon span{ -moz-transform:rotate(360deg); -webkit-transform:rotate(360deg); -o-transform:rotate(360deg); -ms-transform:rotate(360deg); transform:rotate(360deg);}' +
        '    .ue-contextmenu li.disabled .ue-item span.ue-icon span{ -moz-transform:rotate(0deg); -webkit-transform:rotate(0deg); -o-transform:rotate(0deg); -ms-transform:rotate(0deg); transform:rotate(0deg);}' +
        '    .ue-contextmenu .ue-item span.ue-text{ margin-left:29px; padding:0 40px 0 4px; _zoom:1;}' +
        '    .ue-contextmenu li.disabled{background-color:#fff !important;}' +
        '    .ue-contextmenu li.hover .ue-item span.ue-icon{filter:alpha(opacity=80);}' +
        '    .ue-contextmenu li.disabled .ue-item span.ue-icon span{filter:alpha(opacity=30); opacity:0.3;}' +
        '    .ue-contextmenu li.disabled .ue-item span.ue-text{color:#000; filter:alpha(opacity=30); opacity:0.3;}' +
        '    .ue-contextmenu li.ue-line{height:0px; overflow:hidden; line-height:0px; +float:left;' +
        '        border-top:1px solid #e0e0e0;}' +
        '    .ue-contextmenu ul ul{ clear:both; position:absolute; left:100%; top:-1px; display:none;}' +
        '    .ue-contextmenu ul ul.ue-submenu ul{ display:none;}' +
        '    .ue-contextmenu li:hover>ul, .ue-contextmenu li.hover>ul{display:block !important;}' +
        '    .ue-submenu-more{ position:absolute; right:1px; text-align:center; top:0; height:100%; width:10px;' +
        '        font-size:20px; overflow:hidden; text-indent:-12px;}' +
        '</style>');
    });
    
    $.fn.contextmenu = function( settings ){
        
        return this.each(function(){
            var data = $(this).data("contextMenuItems") || [],
                touchstartTimeout,
                touchstart, touchend
                ;
            
            data.inited = data.inited || true;
                
            if (settings.items.length>0) {
                if(settings.before){
                    data = settings.items.concat(data);
                }else{
                    data = data.concat(settings.items);
                }
            }
            $(this).data("contextMenuItems", data);
            settings.items = data;
            
            if ( !data.inited ){
                $(this).unbind("contextmenu").bind("contextmenu", function( event, offset ){
                    
                    var opt, cm;
                    
                    if( $(event.target).hasClass("ue-contextmenu") || $(event.target).parents(".ue-contextmenu").size() ) {
                        event.stopPropagation(); return false;
                    }
                    
                    if (event.ctrlKey) {
                        return true;
                    }
                    
                    opt = offset ? $.extend({}, settings, offset ) : settings;
                    
                    event.stopPropagation();
                    
                    cm = new $.contextmenu(opt, this);
                    cm.show(event);
                    
                    return false;
                });
                
                if ( this.addEventListener ){
                    
                    touchstart = function( event ){
                        clearTimeout( touchstartTimeout );
                        document.body.style.webkitTouchCallout='none';
                        
                        if ( !event.stopContextmenu )
                        {
                            event.stopContextmenu = true; // 阻止上级节点触发右键菜单
                            touchstartTimeout = setTimeout( function(){
                                var touchX = event.targetTouches[0].pageX,
                                    touchY = event.targetTouches[0].pageY,
                                    opt = $.extend({}, settings, {left:touchX, top:touchY}),
                                    cm  = new $.contextmenu(opt, this);
                                    cm.show(event);
                            }, 800);
                        }
                    };
                    
                    touchend = function( event ){
                        clearTimeout( touchstartTimeout );
                    };
                    
                    this.removeEventListener("touchstart", touchstart);
                    this.addEventListener( "touchstart", touchstart);
                    
                    this.removeEventListener("touchend", touchend);
                    this.addEventListener( "touchend",  touchend);
                }
            }    
        });
    };
    
    $.contextmenu = function( settings, srcElement ){
        
        var id, defaults, options;
        
        $.contextmenu.id = $.contextmenu.id || 0;
        $.contextmenu.id+=1;
        
        id = $.contextmenu.id;
        
        $.contextmenu.actions = $.contextmenu.actions || {};
        $.contextmenu.actions[id] = {};
        
        defaults = {
                  items : {length:0}
                , left  : 0
                , top   : 0
                , event : {
                show:function(){},
                hide:function(){}
            }
        };
        options = $.extend({}, defaults, settings);
        
        $.contextmenu.style = {
              animate                  : $.contextmenu.animate                  || true
            , shadow                   : $.contextmenu.shadow                   || true
            , textColor                : $.contextmenu.textColor                || "#666"
            , highlightTextColor       : $.contextmenu.highlightTextColor       || "#000"
            , backgroundColor          : $.contextmenu.backgroundColor          || "#fff"
            , highlightBackgroundColor : $.contextmenu.highlightBackgroundColor || "#ccf"
        };
        
        $.contextmenu.action = function( index, htmlItem ){
            try {
                var f = $.contextmenu.actions[id][index];
                if ($.isFunction(f)) {
                    f.call(htmlItem);
                }
            } catch (e) {}
        };
        
        $.contextmenu.hoverIn = function( sm ){
            
            sm = $(sm).addClass("hover").children("ul").show();
            
            // 修正子菜单的位置, 保证右键菜单位于窗口边缘时,子菜单不会超出窗口的可视范围;
            
            if (sm.size()===0) {
                return;
            }
            
            var bodyBottom     = document.documentElement.scrollTop+document.body.offsetHeight,
                bodyRight    = document.documentElement.scrollLeft+document.body.offsetWidth,
                offset        = sm.offset(),
                ml = offset.left,
                mt = offset.top,
                mb = mt+sm.height(),
                mr = ml+sm.width();
                
            if (bodyBottom<mb) {
                sm.css({ top:bodyBottom-mb });
            }
            
            if (bodyRight<mr) {
                sm.css({
                    left:"auto", right:"100%"
                });
            }
        };
        
        $.contextmenu.hoverOut = function(li) {
            $(li).removeClass("hover").children("ul").hide();
        };
        
        this.items = options.items || [];
        
        this.addItem =
        this.append  =
        this.push    = function(objItem) {
            this.items[this.items.length] = objItem;
            //this.items.length += 1;
            
            return this;
        };
        
        this.removeItem = function(id) {
            delete this.items[id];
            return this;
        };
        
        this.disableItem = function(id) {
            this.items[id].enabled = false;
            return this;
        };
        
        this.show = function(event) {
            
            var actindex, x, y, cm,
                bodyBottom, bodyRight, menuBottom, menuRight, top, left,
                hideCMENU;
            
            hideCMENU = function(cm){
                
                setTimeout(function(){
                    var i;
                    cm.remove();
                    
                    for (i=0; i<id; i+=1) {
                        delete $.contextmenu.actions[i];
                    }
                    cm=null;
                }, 1);
                
                $(document).unbind("click.hideContextmenu blur.hideContextmenu");
                
                // 事件: hide
                if ($.isFunction(options.event.hide)) {
                    options.event.hide.call($(srcElement));
                }
            };
            
            // 生成菜单结构
            function createHtml( items, cssClass ){
                
                var ul = '<ul class="' + (cssClass || '') + '">';
                
                items = $.isFunction(items) ? items() : items;
                
                $.each(items, function( i, o ){
                    
                    var li = "",
                        itm, icon, text, disabled, visible, submenu, clc, hvr;
                    
                    actindex+=1;
                    switch(o){
                        case "line":
                        case "-":
                        case "--":
                        case "---":
                            li = '<li class="ue-line"></li>';
                            break;
                        default:
                            
                            itm     = $.isFunction(o) ? o() : o;
                            text    = $.isFunction(itm.text) ? itm.text() : itm.text;
                            
                            if (!text || text==="") {
                                break;
                            }
                            
                            icon    = $.isFunction(itm.icon) ? itm.icon() : itm.icon||"";
                            disabled= $.isFunction(itm.disabled) ? itm.disabled() : itm.disabled;
                            visible = $.isFunction(itm.visible) ? itm.visible() : itm.visible;
                            submenu = $.isFunction(itm.submenu) ? itm.submenu() : itm.submenu;
                            
                            clc = disabled ? "null" : "$.contextmenu.action("+ actindex +")";
                            hvr = disabled ? "" : 'onmouseover="$.contextmenu.hoverIn(this);" onmouseout="$.contextmenu.hoverOut(this);"';
                            
                            $.contextmenu.actions[id][actindex] = itm.click;
                            
                            li = visible!==true
                            ? '<li class="'+ (disabled?"disabled":"") +'" '+ hvr +'>'+
                                    '<span class="ue-item" href="javascript:void(null);" onclick="'+ clc +';">'+
                                        ( (icon.match(/\.(jpg|jpeg|gif|png|img|ico|bmp)$/) || icon.indexOf("sf-server/file/getFile/") !== -1)
                                        ? '<span class="ue-icon"><span class="tbc-icon"><img src="'+ icon +'" style="border:0px; width:16px;" /></span></span>'
                                        : '<span class="ue-icon"><span class="tbc-icon '+ icon +'"></span></span>') +
                                        '<span class="ue-text">'+ text +'</span>' +
                                    '</span>'+
                                    (submenu?'<span class="ue-submenu-more">&diams;</span>'+createHtml(submenu, "ue-submenu"):"") + 
                                '</li>'
                            : "";
                            
                            break;
                    }
                    ul+=li;
                });
                ul+="</ul>";
                
                return ul;
            }
            
            if ($(event.target).hasClass("ue-contextmenu") || $(event.target).parents(".ue-contextmenu").size()) {
                event.stopPropagation();
                return false;
            }
            
            // 事件: show
            if ($.isFunction(options.event.show)) {
                options.event.show.call( $(srcElement) );
            }
            
            $(document).trigger("click.hideContextmenu");
            
            actindex = 0;
            x  = options.left||event.pageX||event.targetTouches[0];
            y  = options.top||event.pageY||event.targetTouches[0];
            cm = $('<div class="ue-contextmenu"></div>')
                    .append(createHtml(this.inherit( event )))
                    .css({left:x, top:y, zIndex:window.tbc?window.tbc.getMaxZIndex():"auto"})
                    .appendTo("body");
                
            bodyBottom = document.documentElement.scrollTop+document.body.offsetHeight;
            bodyRight  = document.documentElement.scrollLeft+document.body.offsetWidth;
            menuBottom = y  + cm.height();
            menuRight  = x + cm.width();
            top  = bodyBottom<menuBottom ? bodyBottom-cm.height() : y;
            left = bodyRight<menuRight ? bodyRight-cm.width() : x;
                
            if (bodyBottom<menuBottom) {
                cm.css({ top:"auto", bottom:"0px" });
            }
            
            if( bodyRight<menuRight ){
                cm.css({
                    left:"auto", right:"0px"
                });
            }
            
            
            $(document).bind("click.hideContextmenu blur.hideContextmenu", function(){
                
                if (!$(event.target).hasClass("ue-contextmenu") || $(event.target).parents(".ue-contextmenu").size() === 0) {
                    hideCMENU(cm);
                }else{
                    event.stopPropagation();
                    return false;
                }
            });
            
            return this;
        };
        
        this.inherit = function( event ){
            
            var o = [],
                w;
                
            $.each(this.items,function(i,it){
                o.push(it);
            });
            
            function GetDataByTag(i){
                var data = $(this).data("contextMenuItems"),
                    self = this;
                
                if (data && data.length>0 && srcElement !== self) {
                    o.push("line");
                }
                
                if (data) {
                    $.each(data, function(i, oi){
                        if (oi.inheritable===true && srcElement !== self) {
                            o.push(oi);
                        }
                    });    
                }
            }
            
            $(event.target).parents().each(GetDataByTag);
            
            try{
                w = window;
                while(w){
                    $(window.frameElement).parents().each(GetDataByTag);
                    if (w.parent === w) {
                        break;
                    }
                    w = w.parent;
                }
            }catch(e){}
            
            return o;
        };
    };
}(jQuery));

(function($){
	$.fn.selectArea = function( settings ){
		var defaults = {
			  item : this.children()
			, exclude	: null
			, classSelected : "selected"
			, event : {
				select : function(){},
				unselect : function(){}
			}
		}
		
		var options = $.extend({}, defaults, settings);
		
		return this.each(function(){
			$(this).bind({
				"mousedown.selector" : function( event ){
					
					if ( (tbc.msie&&tbc.browserVersion<9 && event.button!=1) || (((tbc.msie&&tbc.browserVersion>8)||!tbc.msie)&&event.button!=0) ){
						return;
					}
					
					if ( event.disableSelectArea || event.target!=this ){
						return;
					} else {
						event.stopPropagation();
					}
					
					var _this = $(this),
						_x	= event.pageX,
						_y	= event.pageY,
						a,
						timeout = null,
						startSelect = false;
					
					$(document).bind({
						"mousemove.selector.a" : function( event ){
						
							// 临时禁止选中文字;
							$("body").disableSelect();
							a = a || $.fn.selectArea.area().appendTo("body")
					
							startSelect = true;
							var offset = $.fn.selectArea.getOffset( event, _x, _y );
								a.css(offset);
							
							if (!tbc.msie || tbc.browserVersion>7){
								$.fn.selectArea.selectElement.call(_this, options, event, _x, _y);
							}
						},
						"mouseup.selector.a" : function ( event ){
							if ( startSelect ) {
								$.fn.selectArea.selectElement.call(_this, options, event, _x, _y);
								startSelect = false;
							}
							
							// 允许选中文字;
							$("body").enableSelect();
							a && a.remove();
							
							$(this).unbind(".selector.a");
						}
					});
				}
			});
		});
	}
	
	$.fn.selectArea.selectElement = function ( options, event, _x, _y ){
		
		var offset = $.fn.selectArea.getOffset(event, _x, _y);
		$(this).children(options.item).not(options.exclude).each(function(){
			if( tbc.isOverlap(offset, this) ){
				$(this).addClass(options.classSelected);
				options.event.select.call(this, event);
			}else{
				$(this).removeClass(options.classSelected);
				options.event.unselect.call(this, event);
			}
			
		});
	}
	
	$.fn.selectArea.getOffset = function ( event, _x, _y ){
		var x      = event.pageX,
			y 	   = event.pageY,
			left   = Math.min(x,_x),
			right  = Math.max(x, _x),
			top    = Math.min(y, _y),
			bottom = Math.max(y, _y),
			width  = Math.abs(left-right),
			height = Math.abs(top-bottom);
		  
		return {left:left, top:top, right:right, bottom:bottom, width:width, height:height};
	}
	
	$.fn.selectArea.area = function (){
		var a = $('<div><div></div></div>'),
			z = tbc.getMaxZIndex()+1;
		a.css({backgroung:"transparent", border:"1px dotted #09f", position:"absolute",left:0, top:0, width:0, height:0, zIndex:z});
		a.find("div").css({width:"100%", height:"100%", background:"#0af", opacity:0.1});
		try {
			return a;
		} finally {
			a = z = null;
		}
	}
	
})(jQuery);
/* jQuery Validation Plugin - v1.11.0 - 2/4/2013
* https://github.com/jzaefferer/jquery-validation
* Copyright (c) 2013 J\u00f6rn Zaefferer; Licensed MIT */
(function(a){a.extend(a.fn,{validate:function(b){if(!this.length){if(b&&b.debug&&window.console){console.warn("Nothing selected, can't validate, returning nothing.")}return}var c=a.data(this[0],"validator");if(c){return c}try{this.attr("novalidate","novalidate")}catch(d){}c=new a.validator(b,this[0]);a.data(this[0],"validator",c);if(c.settings.onsubmit){this.validateDelegate(":submit","click",function(e){if(c.settings.submitHandler){c.submitButton=e.target}if(a(e.target).hasClass("cancel")){c.cancelSubmit=true}});this.submit(function(e){if(c.settings.debug){e.preventDefault()}function f(){var g;if(c.settings.submitHandler){if(c.submitButton){g=a("<input type='hidden'/>").attr("name",c.submitButton.name).val(c.submitButton.value).appendTo(c.currentForm)}c.settings.submitHandler.call(c,c.currentForm,e);if(c.submitButton){g.remove()}return false}return true}if(c.cancelSubmit){c.cancelSubmit=false;return f()}if(c.form()){if(c.pendingRequest){c.formSubmitted=true;return false}return f()}else{c.focusInvalid();return false}})}return c},valid:function(){if(a(this[0]).is("form")){return this.validate().form()}else{var c=true;var b=a(this[0].form).validate();this.each(function(){c&=b.element(this)});return c}},removeAttrs:function(d){var b={},c=this;a.each(d.split(/\s/),function(e,f){b[f]=c.attr(f);c.removeAttr(f)});return b},rules:function(e,b){var g=this[0];if(e){var d=a.data(g.form,"validator").settings;var i=d.rules;var j=a.validator.staticRules(g);switch(e){case"add":a.extend(j,a.validator.normalizeRule(b));i[g.name]=j;if(b.messages){d.messages[g.name]=a.extend(d.messages[g.name],b.messages)}break;case"remove":if(!b){delete i[g.name];return j}var h={};a.each(b.split(/\s/),function(k,l){h[l]=j[l];delete j[l]});return h}}var f=a.validator.normalizeRules(a.extend({},a.validator.classRules(g),a.validator.attributeRules(g),a.validator.dataRules(g),a.validator.staticRules(g)),g);if(f.required){var c=f.required;delete f.required;f=a.extend({required:c},f)}return f}});a.extend(a.expr[":"],{blank:function(b){return !a.trim(""+b.value)},filled:function(b){return !!a.trim(""+b.value)},unchecked:function(b){return !b.checked}});a.validator=function(b,c){this.settings=a.extend(true,{},a.validator.defaults,b);this.currentForm=c;this.init()};a.validator.format=function(b,c){if(arguments.length===1){return function(){var d=a.makeArray(arguments);d.unshift(b);return a.validator.format.apply(this,d)}}if(arguments.length>2&&c.constructor!==Array){c=a.makeArray(arguments).slice(1)}if(c.constructor!==Array){c=[c]}a.each(c,function(d,e){b=b.replace(new RegExp("\\{"+d+"\\}","g"),function(){return e})});return b};a.extend(a.validator,{defaults:{messages:{},groups:{},rules:{},errorClass:"error",validClass:"valid",errorElement:"label",focusInvalid:true,errorContainer:a([]),errorLabelContainer:a([]),onsubmit:true,ignore:":hidden",ignoreTitle:false,onfocusin:function(b,c){this.lastActive=b;if(this.settings.focusCleanup&&!this.blockFocusCleanup){if(this.settings.unhighlight){this.settings.unhighlight.call(this,b,this.settings.errorClass,this.settings.validClass)}this.addWrapper(this.errorsFor(b)).hide()}},onfocusout:function(b,c){if(!this.checkable(b)&&(b.name in this.submitted||!this.optional(b))){this.element(b)}},onkeyup:function(b,c){if(c.which===9&&this.elementValue(b)===""){return}else{if(b.name in this.submitted||b===this.lastElement){this.element(b)}}},onclick:function(b,c){if(b.name in this.submitted){this.element(b)}else{if(b.parentNode.name in this.submitted){this.element(b.parentNode)}}},highlight:function(d,b,c){if(d.type==="radio"){this.findByName(d.name).addClass(b).removeClass(c)}else{a(d).addClass(b).removeClass(c)}},unhighlight:function(d,b,c){if(d.type==="radio"){this.findByName(d.name).removeClass(b).addClass(c)}else{a(d).removeClass(b).addClass(c)}}},setDefaults:function(b){a.extend(a.validator.defaults,b)},messages:{required:"This field is required.",remote:"Please fix this field.",email:"Please enter a valid email address.",url:"Please enter a valid URL.",date:"Please enter a valid date.",dateISO:"Please enter a valid date (ISO).",number:"Please enter a valid number.",digits:"Please enter only digits.",creditcard:"Please enter a valid credit card number.",equalTo:"Please enter the same value again.",maxlength:a.validator.format("Please enter no more than {0} characters."),minlength:a.validator.format("Please enter at least {0} characters."),rangelength:a.validator.format("Please enter a value between {0} and {1} characters long."),range:a.validator.format("Please enter a value between {0} and {1}."),max:a.validator.format("Please enter a value less than or equal to {0}."),min:a.validator.format("Please enter a value greater than or equal to {0}.")},autoCreateRanges:false,prototype:{init:function(){this.labelContainer=a(this.settings.errorLabelContainer);this.errorContext=this.labelContainer.length&&this.labelContainer||a(this.currentForm);this.containers=a(this.settings.errorContainer).add(this.settings.errorLabelContainer);this.submitted={};this.valueCache={};this.pendingRequest=0;this.pending={};this.invalid={};this.reset();var b=(this.groups={});a.each(this.settings.groups,function(e,f){if(typeof f==="string"){f=f.split(/\s/)}a.each(f,function(h,g){b[g]=e})});var d=this.settings.rules;a.each(d,function(e,f){d[e]=a.validator.normalizeRule(f)});function c(g){var f=a.data(this[0].form,"validator"),e="on"+g.type.replace(/^validate/,"");if(f.settings[e]){f.settings[e].call(f,this[0],g)}}a(this.currentForm).validateDelegate(":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'] ,[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], [type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'] ","focusin focusout keyup",c).validateDelegate("[type='radio'], [type='checkbox'], select, option","click",c);if(this.settings.invalidHandler){a(this.currentForm).bind("invalid-form.validate",this.settings.invalidHandler)}},form:function(){this.checkForm();a.extend(this.submitted,this.errorMap);this.invalid=a.extend({},this.errorMap);if(!this.valid()){a(this.currentForm).triggerHandler("invalid-form",[this])}this.showErrors();return this.valid()},checkForm:function(){this.prepareForm();for(var b=0,c=(this.currentElements=this.elements());c[b];b++){this.check(c[b])}return this.valid()},element:function(c){c=this.validationTargetFor(this.clean(c));this.lastElement=c;this.prepareElement(c);this.currentElements=a(c);var b=this.check(c)!==false;if(b){delete this.invalid[c.name]}else{this.invalid[c.name]=true}if(!this.numberOfInvalids()){this.toHide=this.toHide.add(this.containers)}this.showErrors();return b},showErrors:function(c){if(c){a.extend(this.errorMap,c);this.errorList=[];for(var b in c){this.errorList.push({message:c[b],element:this.findByName(b)[0]})}this.successList=a.grep(this.successList,function(d){return !(d.name in c)})}if(this.settings.showErrors){this.settings.showErrors.call(this,this.errorMap,this.errorList)}else{this.defaultShowErrors()}},resetForm:function(){if(a.fn.resetForm){a(this.currentForm).resetForm()}this.submitted={};this.lastElement=null;this.prepareForm();this.hideErrors();this.elements().removeClass(this.settings.errorClass).removeData("previousValue")},numberOfInvalids:function(){return this.objectLength(this.invalid)},objectLength:function(d){var c=0;for(var b in d){c++}return c},hideErrors:function(){this.addWrapper(this.toHide).hide()},valid:function(){return this.size()===0},size:function(){return this.errorList.length},focusInvalid:function(){if(this.settings.focusInvalid){try{a(this.findLastActive()||this.errorList.length&&this.errorList[0].element||[]).filter(":visible").focus().trigger("focusin")}catch(b){}}},findLastActive:function(){var b=this.lastActive;return b&&a.grep(this.errorList,function(c){return c.element.name===b.name}).length===1&&b},elements:function(){var c=this,b={};return a(this.currentForm).find("input, select, textarea").not(":submit, :reset, :image, [disabled]").not(this.settings.ignore).filter(function(){if(!this.name&&c.settings.debug&&window.console){console.error("%o has no name assigned",this)}if(this.name in b||!c.objectLength(a(this).rules())){return false}b[this.name]=true;return true})},clean:function(b){return a(b)[0]},errors:function(){var b=this.settings.errorClass.replace(" ",".");return a(this.settings.errorElement+"."+b,this.errorContext)},reset:function(){this.successList=[];this.errorList=[];this.errorMap={};this.toShow=a([]);this.toHide=a([]);this.currentElements=a([])},prepareForm:function(){this.reset();this.toHide=this.errors().add(this.containers)},prepareElement:function(b){this.reset();this.toHide=this.errorsFor(b)},elementValue:function(b){var c=a(b).attr("type"),d=a(b).val();if(c==="radio"||c==="checkbox"){return a("input[name='"+a(b).attr("name")+"']:checked").val()}if(typeof d==="string"){return d.replace(/\r/g,"")}return d},check:function(c){c=this.validationTargetFor(this.clean(c));var i=a(c).rules();var d=false;var h=this.elementValue(c);var b;for(var j in i){var g={method:j,parameters:i[j]};try{b=a.validator.methods[j].call(this,h,c,g.parameters);if(b==="dependency-mismatch"){d=true;continue}d=false;if(b==="pending"){this.toHide=this.toHide.not(this.errorsFor(c));return}if(!b){this.formatAndAdd(c,g);return false}}catch(f){if(this.settings.debug&&window.console){console.log("Exception occured when checking element "+c.id+", check the '"+g.method+"' method.",f)}throw f}}if(d){return}if(this.objectLength(i)){this.successList.push(c)}return true},customDataMessage:function(b,c){return a(b).data("msg-"+c.toLowerCase())||(b.attributes&&a(b).attr("data-msg-"+c.toLowerCase()))},customMessage:function(c,d){var b=this.settings.messages[c];return b&&(b.constructor===String?b:b[d])},findDefined:function(){for(var b=0;b<arguments.length;b++){if(arguments[b]!==undefined){return arguments[b]}}return undefined},defaultMessage:function(b,c){return this.findDefined(this.customMessage(b.name,c),this.customDataMessage(b,c),!this.settings.ignoreTitle&&b.title||undefined,a.validator.messages[c],"<strong>Warning: No message defined for "+b.name+"</strong>")},formatAndAdd:function(c,e){var d=this.defaultMessage(c,e.method),b=/\$?\{(\d+)\}/g;if(typeof d==="function"){d=d.call(this,e.parameters,c)}else{if(b.test(d)){d=a.validator.format(d.replace(b,"{$1}"),e.parameters)}}this.errorList.push({message:d,element:c});this.errorMap[c.name]=d;this.submitted[c.name]=d},addWrapper:function(b){if(this.settings.wrapper){b=b.add(b.parent(this.settings.wrapper))}return b},defaultShowErrors:function(){var c,d;for(c=0;this.errorList[c];c++){var b=this.errorList[c];if(this.settings.highlight){this.settings.highlight.call(this,b.element,this.settings.errorClass,this.settings.validClass)}this.showLabel(b.element,b.message)}if(this.errorList.length){this.toShow=this.toShow.add(this.containers)}if(this.settings.success){for(c=0;this.successList[c];c++){this.showLabel(this.successList[c])}}if(this.settings.unhighlight){for(c=0,d=this.validElements();d[c];c++){this.settings.unhighlight.call(this,d[c],this.settings.errorClass,this.settings.validClass)}}this.toHide=this.toHide.not(this.toShow);this.hideErrors();this.addWrapper(this.toShow).show()},validElements:function(){return this.currentElements.not(this.invalidElements())},invalidElements:function(){return a(this.errorList).map(function(){return this.element})},showLabel:function(c,d){var b=this.errorsFor(c);if(b.length){b.removeClass(this.settings.validClass).addClass(this.settings.errorClass);b.html(d)}else{b=a("<"+this.settings.errorElement+">").attr("for",this.idOrName(c)).addClass(this.settings.errorClass).html(d||"");if(this.settings.wrapper){b=b.hide().show().wrap("<"+this.settings.wrapper+"/>").parent()}if(!this.labelContainer.append(b).length){if(this.settings.errorPlacement){this.settings.errorPlacement(b,a(c))}else{b.insertAfter(c)}}}if(!d&&this.settings.success){b.text("");if(typeof this.settings.success==="string"){b.addClass(this.settings.success)}else{this.settings.success(b,c)}}this.toShow=this.toShow.add(b)},errorsFor:function(c){var b=this.idOrName(c);return this.errors().filter(function(){return a(this).attr("for")===b})},idOrName:function(b){return this.groups[b.name]||(this.checkable(b)?b.name:b.id||b.name)},validationTargetFor:function(b){if(this.checkable(b)){b=this.findByName(b.name).not(this.settings.ignore)[0]}return b},checkable:function(b){return(/radio|checkbox/i).test(b.type)},findByName:function(b){return a(this.currentForm).find("[name='"+b+"']")},getLength:function(c,b){switch(b.nodeName.toLowerCase()){case"select":return a("option:selected",b).length;case"input":if(this.checkable(b)){return this.findByName(b.name).filter(":checked").length}}return c.length},depend:function(c,b){return this.dependTypes[typeof c]?this.dependTypes[typeof c](c,b):true},dependTypes:{"boolean":function(c,b){return c},string:function(c,b){return !!a(c,b.form).length},"function":function(c,b){return c(b)}},optional:function(b){var c=this.elementValue(b);return !a.validator.methods.required.call(this,c,b)&&"dependency-mismatch"},startRequest:function(b){if(!this.pending[b.name]){this.pendingRequest++;this.pending[b.name]=true}},stopRequest:function(b,c){this.pendingRequest--;if(this.pendingRequest<0){this.pendingRequest=0}delete this.pending[b.name];if(c&&this.pendingRequest===0&&this.formSubmitted&&this.form()){a(this.currentForm).submit();this.formSubmitted=false}else{if(!c&&this.pendingRequest===0&&this.formSubmitted){a(this.currentForm).triggerHandler("invalid-form",[this]);this.formSubmitted=false}}},previousValue:function(b){return a.data(b,"previousValue")||a.data(b,"previousValue",{old:null,valid:true,message:this.defaultMessage(b,"remote")})}},classRuleSettings:{required:{required:true},email:{email:true},url:{url:true},date:{date:true},dateISO:{dateISO:true},number:{number:true},digits:{digits:true},creditcard:{creditcard:true}},addClassRules:function(b,c){if(b.constructor===String){this.classRuleSettings[b]=c}else{a.extend(this.classRuleSettings,b)}},classRules:function(c){var d={};var b=a(c).attr("class");if(b){a.each(b.split(" "),function(){if(this in a.validator.classRuleSettings){a.extend(d,a.validator.classRuleSettings[this])}})}return d},attributeRules:function(c){var e={};var b=a(c);for(var f in a.validator.methods){var d;if(f==="required"){d=b.get(0).getAttribute(f);if(d===""){d=true}d=!!d}else{d=b.attr(f)}if(d){e[f]=d}else{if(b[0].getAttribute("type")===f){e[f]=true}}}if(e.maxlength&&/-1|2147483647|524288/.test(e.maxlength)){delete e.maxlength}return e},dataRules:function(c){var f,d,e={},b=a(c);for(f in a.validator.methods){d=b.data("rule-"+f.toLowerCase());if(d!==undefined){e[f]=d}}return e},staticRules:function(c){var d={};var b=a.data(c.form,"validator");if(b.settings.rules){d=a.validator.normalizeRule(b.settings.rules[c.name])||{}}return d},normalizeRules:function(c,b){a.each(c,function(f,e){if(e===false){delete c[f];return}if(e.param||e.depends){var d=true;switch(typeof e.depends){case"string":d=!!a(e.depends,b.form).length;break;case"function":d=e.depends.call(b,b);break}if(d){c[f]=e.param!==undefined?e.param:true}else{delete c[f]}}});a.each(c,function(d,e){c[d]=a.isFunction(e)?e(b):e});a.each(["minlength","maxlength"],function(){if(c[this]){c[this]=Number(c[this])}});a.each(["rangelength"],function(){var d;if(c[this]){if(a.isArray(c[this])){c[this]=[Number(c[this][0]),Number(c[this][1])]}else{if(typeof c[this]==="string"){d=c[this].split(/[\s,]+/);c[this]=[Number(d[0]),Number(d[1])]}}}});if(a.validator.autoCreateRanges){if(c.min&&c.max){c.range=[c.min,c.max];delete c.min;delete c.max}if(c.minlength&&c.maxlength){c.rangelength=[c.minlength,c.maxlength];delete c.minlength;delete c.maxlength}}return c},normalizeRule:function(c){if(typeof c==="string"){var b={};a.each(c.split(/\s/),function(){b[this]=true});c=b}return c},addMethod:function(b,d,c){a.validator.methods[b]=d;a.validator.messages[b]=c!==undefined?c:a.validator.messages[b];if(d.length<3){a.validator.addClassRules(b,a.validator.normalizeRule(b))}},methods:{required:function(c,b,e){if(!this.depend(e,b)){return"dependency-mismatch"}if(b.nodeName.toLowerCase()==="select"){var d=a(b).val();return d&&d.length>0}if(this.checkable(b)){return this.getLength(c,b)>0}return a.trim(c).length>0},remote:function(f,c,g){if(this.optional(c)){return"dependency-mismatch"}var d=this.previousValue(c);if(!this.settings.messages[c.name]){this.settings.messages[c.name]={}}d.originalMessage=this.settings.messages[c.name].remote;this.settings.messages[c.name].remote=d.message;g=typeof g==="string"&&{url:g}||g;if(d.old===f){return d.valid}d.old=f;var b=this;this.startRequest(c);var e={};e[c.name]=f;a.ajax(a.extend(true,{url:g,mode:"abort",port:"validate"+c.name,dataType:"json",data:e,success:function(i){b.settings.messages[c.name].remote=d.originalMessage;var k=i===true||i==="true";if(k){var h=b.formSubmitted;b.prepareElement(c);b.formSubmitted=h;b.successList.push(c);delete b.invalid[c.name];b.showErrors()}else{var l={};var j=i||b.defaultMessage(c,"remote");l[c.name]=d.message=a.isFunction(j)?j(f):j;b.invalid[c.name]=true;b.showErrors(l)}d.valid=k;b.stopRequest(c,k)}},g));return"pending"},minlength:function(d,b,e){var c=a.isArray(d)?d.length:this.getLength(a.trim(d),b);return this.optional(b)||c>=e},maxlength:function(d,b,e){var c=a.isArray(d)?d.length:this.getLength(a.trim(d),b);return this.optional(b)||c<=e},rangelength:function(d,b,e){var c=a.isArray(d)?d.length:this.getLength(a.trim(d),b);return this.optional(b)||(c>=e[0]&&c<=e[1])},min:function(c,b,d){return this.optional(b)||c>=d},max:function(c,b,d){return this.optional(b)||c<=d},range:function(c,b,d){return this.optional(b)||(c>=d[0]&&c<=d[1])},email:function(c,b){return this.optional(b)||/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(c)},url:function(c,b){return this.optional(b)||/^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(c)},date:function(c,b){return this.optional(b)||!/Invalid|NaN/.test(new Date(c).toString())},dateISO:function(c,b){return this.optional(b)||/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(c)},number:function(c,b){return this.optional(b)||/^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(c)},digits:function(c,b){return this.optional(b)||/^\d+$/.test(c)},creditcard:function(f,c){if(this.optional(c)){return"dependency-mismatch"}if(/[^0-9 \-]+/.test(f)){return false}var g=0,e=0,b=false;f=f.replace(/\D/g,"");for(var h=f.length-1;h>=0;h--){var d=f.charAt(h);e=parseInt(d,10);if(b){if((e*=2)>9){e-=9}}g+=e;b=!b}return(g%10)===0},equalTo:function(c,b,e){var d=a(e);if(this.settings.onfocusout){d.unbind(".validate-equalTo").bind("blur.validate-equalTo",function(){a(b).valid()})}return c===d.val()}}});a.format=a.validator.format}(jQuery));(function(c){var a={};if(c.ajaxPrefilter){c.ajaxPrefilter(function(f,e,g){var d=f.port;if(f.mode==="abort"){if(a[d]){a[d].abort()}a[d]=g}})}else{var b=c.ajax;c.ajax=function(e){var f=("mode" in e?e:c.ajaxSettings).mode,d=("port" in e?e:c.ajaxSettings).port;if(f==="abort"){if(a[d]){a[d].abort()}return(a[d]=b.apply(this,arguments))}return b.apply(this,arguments)}}}(jQuery));(function(a){a.extend(a.fn,{validateDelegate:function(d,c,b){return this.bind(c,function(e){var f=a(e.target);if(f.is(d)){return b.apply(f,arguments)}})}})}(jQuery));

/**
 * -+ 时代光华JS库 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
 * 此库主要实现代码层的一些功能，集合了一些常用的功能方法，
 * tbc.self方法和tbc.extend方法组合一起实现了类的继承以及多
 * 继承，此外tbc.extend还可以用于合并两个对象的属性；
 * tbc.self和tbc.extend是此库的核心方法，基本实现了类的管理、
 * 扩展、继承、销毁等功能；
 * 
 * @namespace tbc
 * @main tbc
 * @global
 * @static
 * @copyright 时代光华
 * @author mail@luozhihua.com
 */

;(function(window, $) {

    "use strict";

    var tbc,
        methods,
        /* 浏览器识别 */
        ua      = window.navigator.userAgent,
        rwebkit = /(webkit)[ \/]([\w.]+)/,
        ropera  = /(opera)(?:.*version)?[ \/]([\w.]+)/,
        rmsie   = /(msie) ([\w.]+)/,
        rmozilla= /(mozilla)(?:.*? rv:([\w.]+))?/,
        browserMatch;

    // 判断是否可继承
    function canInherit(attr, noInherit) {
        var i;
        if (typeof attr !== "string") {
            return;
        }
        for (i=0; i<noInherit.length; i+=1) {
            if (attr === noInherit[i]) {
                return false;
            }
        }

        return true;
    }

    function uaMatch(ua) {
        ua = ua.toLowerCase();

        var match = rwebkit.exec(ua) ||
            ropera.exec(ua) ||
            rmsie.exec(ua) ||
            ua.indexOf("compatible") < 0 && rmozilla.exec(ua) || [];

        return {browser: match[1] || "", version: match[2] || "0"};
    }

    // IE HTML5 支持
    (function() {
        if (!/*@cc_on!@*/0) {
            return;
        }
        var t = "abbr,article,aside,audio,canvas,datalist,details,dialog,eventsource,figure,footer,header,hgroup,mark,menu,meter,nav,output,progress,time,video,section,summary",
            e = t.split(','),
            i = e.length;
        while(i--) { document.createElement(e[i]); }
    }());

    window.console = window.console || { log : function(msg) {} };
    window.tbc = tbc = window.tbc || {nspath:"tbc"};

   /**
    * 创建命名空间
    * @public
    * @method namspace
    * @param {String} ns 命名空间path
    * @param {Object} [obj] 命名空间创建于此对象下，默认window.tbc
    * @example
    * tbc.namespace("tbc.sub1.sub2");
    * @example
    * tbc.namespace("tbc>sub1>sub2");
    * @example
    * tbc.namespace("tbc/sub1/sub2");
    * @example
    * tbc.namespace("tbc\sub1\sub2");
    * @return {Object} 返回创建的命名空间
    */
    tbc.namespace = tbc.ns = function (ns, obj) {
        ns = ns.split(/[.\/\\>]/);
        var namespace = obj || tbc,
            nspath = namespace.nspath || "window",
            i, len;
    
        for (i = 0, len = ns.length; i < len; i+=1) {
            if (i !== 0 || ns[i] !== "tbc") {
                nspath += "."+ns[i];
                namespace[ns[i]] = namespace[ns[i]] || { superClass: namespace };
                namespace[ns[i]].nspath = namespace[ns[i]].nspath || nspath;
                namespace = namespace[ns[i]];
            }
        }
        
        try {
            return namespace;
        } finally {
            namespace = nspath = null;
        }
    };
    
    // 版本号
    tbc.version = "1.0";
    
    /**
     * 封装实例，用于使用tbc.extend()方法继承类时,统一父类和子类中的this对象;
     * @param  {[type]} algateThis      [description]
     * @param  {[type]} algateArguments [description]
     * @return {[type]}                 [description]
     */
    tbc.self    = function(algateThis, algateArguments) {
        
        var args = algateArguments||[],
            subc = args[args.length-1],
            self = (subc && typeof(subc)==="object" && subc.subclass) ? subc.subclass : algateThis,
            i, k, l, exist;
        
        // 给当前对象增加extend方法
        if (self) {
            self.extend = function() {
                var arg = [this];
                this.parentClass = this.parentClass || [];
                
                for (i=0; i<arguments.length; i+=1) {
                    exist = null;
                    for (k=0, l=this.parentClass.length; k<l; k+=1) {
                        if (this.parentClass[k]===arguments[i]) {
                            exist = true;
                            break;
                        }
                    }
                    
                    if (!exist) {
                        this.parentClass.push(arguments[i]);
                        arg.push(arguments[i]);
                    }
                }

                tbc.extend.apply(this, arg);

                arg = null;
                return this;
            };

            // 继承核心类: 事件类和实例管理类
            self.extend(tbc.ClassManager,  tbc.Event);
        }

        try{
            return self;
        }finally{
            args = subc = self = null;
        }
    };

    /**
     * 用于继承类,或者合并对象属性、方法
     * 参数数量不限,为Object类型
     * 后面的将覆盖前面的
     * 
     * @method extend
     * @param {Object|Class} obj1 
     * @example 
     * var a={a:1, b:2}, b={a:7,b:8}, c={c:9}, d={c:10};
     *  tbc.extend(a,b,c,d);
     *  alert(a.c); //结果:10
     * @example
     * function Person() {
     *     this.theName='';
     *     this.age=0;
     * }
     * function Connect() {
     *     this.tel='139****5678';
     *     this.mail='mail@luozhihua.com'
     * }
     * 
     * var person_1 = tbc.extend(Person, Connect, {theName:'罗志华'});
     * 
     * tbc.log(person_1.theName); // 罗志华
     * tbc.log(person_1.age); // 0
     * tbc.log(person_1.mail); // mail@luozhihua.com
     */
    tbc.extend = function () {
        var args = arguments,
            len  = args.length,
            noInherit = "nspath,superClass,extend,iid,guid,packageName", // 不可继承的属性
            obj, i, p;
        
        noInherit = noInherit.split(",");
        
        if (len > 1) {
            for (i = 1; i < len; i+=1) {
                //var _notInherit  = parseProperty(args[i]["notInherit"]),
                //    _notOverride = parseProperty(args[i]["notOverride"]);
                
                switch(typeof(args[i])) {
                    case "object" : 
                        if (args[i] && args[i].constructor === Array && typeof(args[i][0]) === "function") {
                            obj = new args[i][0](args[i][1], {subclass:args[0]});
                        } else {
                            obj = args[i];
                        }
                        break;
                    
                    case "function":
                        obj = new args[i]({subclass:args[0]});
                        break;
                    
                    default: 
                        obj = {};
                }
                
                for (p in obj) {
                    if (obj.hasOwnProperty(p) && canInherit(p, noInherit) !== false) {
                        if (typeof obj[p] !== "undefined") {
                            args[0][p] = obj[p];
                        }
                    }
                }
            }
        }
            
        try {
            return args[0];
        } finally {
            args = obj = null;
        }
    };
    
    browserMatch = uaMatch(ua);
    if (browserMatch.browser) {
        tbc[ browserMatch.browser ] = true;
        tbc.browserVersion = browserMatch.version;
    }
    
    /**
     * 是否支持触控事件
     * @public
     * @property touchable
     * @type {Boolean} 
     */
    tbc.touchable = 'ontouchstart' in document.documentElement;
    
    
    /*
     * 公共方法
     */
    methods = {
        
        
        /**
        * 获取节点在页面中的坐标区域
        * 
        * @public
        * @method getCoordinate
        * @param {Element|jQuery Object} elem HTML元素或jQuery选择结果集
        * @param {Element} offsetParent 相对的上级元素
        * @return {Object} {
        *     top:{number},
        *     bottom:{number},
        *     left:{nuber},
        *     right:{number},
        *     width:{number},
        *     height:{number}
        * }
        */
        getCoordinate: function (elem, offsetParent) {
            elem = $(typeof (elem) === "string" ? document.getElementById(elem) : elem);
            
            var offset_1 = elem.size() ? elem.offset() : {left:0, top:0},
                offset  =
                {
                    left   : offset_1.left,
                    top    : offset_1.top,
                    bottom : 0,
                    right  : 0,
                    width  : elem.outerWidth(),
                    height : elem.outerHeight()
                };
            
            offset.right  = offset.left + offset.width;
            offset.bottom = offset.top  + offset.height;
                
            try {
                return offset;
            } finally {
                offset = elem = offsetParent = offset_1 = null;
            }
        },
        
        // 获取页面元素的scrollTop和scrollLeft(包括所有上级节点的scrollTop和srollLeft)
        getScroll : function(elem, scrollParent) {
            var scroll={top:0, left:0},
                elem_2 = elem.parentNode;
            
            if (elem_2 || (elem_2 && elem_2.nodeName === "body")) {
                return scroll;
            }
            
            while (elem_2 && elem_2 !== (scrollParent||document.body))
            {
                scroll.left += elem_2.scrollLeft||0;
                scroll.top  += elem_2.scrollTop||0;
                elem_2      = elem_2.parentNode;
            }
            
            try {
                return scroll;
            } finally {
                elem = elem_2 = scrollParent = scroll = null;
            }
        },
        
        /**
         * 锁定一个元素(在其上面遮罩一层半透明的DIV)
         * @public
         * @methos lock
         * @param {Element|jQuery Object} HTML元素
         * @param {Number} zIndex 遮罩层的zIndex排序
         * @return {jQuery Object} 遮罩层 
         */
        lock    : function(elem, zIndex) {
            elem = $(elem||document.body);
            
            var css    = typeof(zIndex) === "number" ? {zIndex:zIndex} : zIndex,
                pos = elem.css("position"),
                zin = ($.isNumeric(zIndex)) ? zIndex : this.getMaxZIndex(elem),
                wid = elem.innerWidth(),
                hei = elem.innerHeight(),
                mask= $('<div class="elem_mask"></div>').appendTo(elem);
            
            css = $.extend({ position:"absolute", top:0, left:0, width:wid, cursor:"wait", height:hei, backgroundColor:"#000", opacity:0.2, zIndex:zin+1}, css);
            mask.css(css);
            
            if (!pos || pos==="static" || pos==="") {
                elem.css({position: "relative"});
            }
            
            try { return mask; } finally { elem=pos=mask=zin=css=null; }
        },
        
        /**
         * 相对于方法lock，把通过lock遮罩的层移除
         * @public
         * @methos unlock
         * @param {Element|jQuery Object} HTML元素
         */
        unlock    : function (elem) {
            elem = $(elem||document.body);
            elem.children(".elem_mask").fadeOut(200, function() {
                $(this).remove();
                elem = null;
            });
        },
        
        /** 
         * 将含有百分号的字符串转换成整型数字
         * @public
         * @method percentToInt
         * @param {String} value 以百分号“%”结尾的字符串形式的数字
         * @param {Number} base 基数, 以此来计算百分数的值
         * @return {Number:int} 返回计算结果 
         */
        percentToInt : function(value, base) {
            return (typeof(value) === "string" && value.match(/%$/))
                ? window.parseInt(value)/100*base
                : value;
        },
        
        /** 
         * 将含有百分号的字符串转换成浮点数
         * @public
         * @method percentToFloat
         * @param {String} value 以百分号“%”结尾的字符串形式的数字
         * @param {Number} base 基数, 以此来计算百分数的值
         * @return {Number:float} 返回计算结果 (含小数)
         */
        percentToFloat : function(value, base) {
            return (typeof(value) === "string" && value.match(/%$/))
                ? window.parseFloat(value)/100*base
                : value;
        },
        
        /**
         * 按字节数截取字符, 1个中文字符按2个英文字符计算
         * @public
         * @method substr
         * @param {String} str 被截取的字符串
         * @param {Number} len 截取长度
         */
        substr : function (str, len) {
            
            if (!str || !len) { return str||""; }
            
            var a = 0, //预期计数:中文2字节,英文1字节
                i = 0, //循环计数
                temp = '';//临时字串     
            
            for (i=0;i<str.length;i+=1) {
                
                a += (str.charCodeAt(i)>255) ? 2 : 1;
                
                //如果增加计数后长度大于限定长度,就直接返回临时字符串
                if (a > len) { return temp; }
                
                //将当前内容加到临时字符串
                temp += str.charAt(i);
            }
            
            //如果全部是单字节字符,就直接返回源字符串
            return str;
        },
        
        /**
         * 格式化字符串
         * @public
         * @method formatString
         * @param  {String} str 字符串模板
         * @return {String}     格式化好的字符串
         * @example
         * var str = "{0}，欢迎登录，您现在的IP是{1}",
         *     result = tbc.formatString(str, 'luozhihua', '127.0.0.1');
         * tbc.log(result); // luozhihua，欢迎登录，您现在的IP是127.0.01
         */
        formatString : function(str) {
            if (arguments.length === 0) {
                return null;
            }
        
            var i, re;
            for(i=1; i<arguments.length; i+=1) {
                re = new RegExp('\\{' + (i-1) + '\\}','gm');
                str = str.replace(re, arguments[i]);
            }
            return str;
        },
        
        /**
         * 格式化字符串模板（简易）
         * @public
         * @method stringTemplate
         * @param  {String} templete 字符串模板
         * @param  {Object} values 要替换的字段
         * @param {Function} transform 将字段值转换成另外的值
         * @return {String}     格式化好的字符串
         * @example
         * var str    = "<em>姓名：{name}；性别：{sex}</em>",\n
              values = {name:luozhihua, sex:male},\n
              trans  = {
                  male : "男",
                  female : "女"
              },
              result = tbc.stringTemplate(str, values, trans);
          tbc.log(result); // <em>姓名：luozhihua；性别：男</em>
         */        
        stringTemplate : function(templete, values, transform) {
            if (values && typeof values !== "object") {
                return templete;
            }
            transform = transform||{};
            
            var k, re;
            
            for (k in values) {
                if (values.hasOwnProperty(k)) {
                    re = new RegExp('\\{' + k + '\\}','gm');
                    templete = templete.replace(re, transform[values[k]]||values[k]||"");    
                }
            }
            
            templete = templete.replace(/\{\w+\}/g, "");
            return templete;
        },
    
        // 获取页面中最大的zIndex值
        getMaxZIndex: function (offsetParent) {
            var zindex = 0,
                child;
            
            offsetParent = $(offsetParent || "body");
            child = offsetParent.children();
            
            child.each(function (i, o) {
                var z = $(this).css("zIndex");
                    z = (z && !isNaN(z)) ? z : 0;
                zindex = Math.max(zindex, z);
            });
            
            try { 
                return zindex;
            } finally {
                child = offsetParent = null;
            }
        },
        
        getElementByMaxZIndex : function(n1, n2) {
            n1 = $(n1);
            n2 = $(n2);
            
            var p1 = n1[0],
            p2 = n2[0],
            _1, _2, z1, z2;
            
            while(p1 && p1 !== document.body) {
            _1 = p1.offsetParent;
            while(_1 && p2 && p2 !== document.body) {
                _2 = p2.offsetParent;
                if (_2 && _1 === _2) {
                z1 = $(p1).css("zIndex");
                z2 = $(p2).css("zIndex");
                z1 = z1==="auto"?0:z1;
                z2 = z2==="auto"?0:z2;
                
                var isNext = $(_1).nextAll().index(_2) === -1;
                p1 = p2 = _1 = _2 = null;
                return z1>z2 ? n1 : ((z1 === z2 && isNext)?n1:n2);
                }
                p2 = _2;
            }
            p2 = n2[0];
            p1 = _1;
            }
        },
        
        /**
        * getCursorPosition Method
        *
        * Created by Blank Zheng on 2010/11/12.
        * Copyright (c) 2010 PlanABC.net. All rights reserved.
        *
        * The copyrights embodied in the content of this file are licensed under the BSD (revised) open source license.
        */
        getCursorPosition : function (textarea) {
            var rangeData = {text: "", start: 0, end: 0 };
            textarea.focus();
            if (textarea.setSelectionRange) { // W3C
            rangeData.start= textarea.selectionStart;
            rangeData.end = textarea.selectionEnd;
            rangeData.text = (rangeData.start !== rangeData.end) ? textarea.value.substring(rangeData.start, rangeData.end): "";
            } else if (document.selection) { // IE
            var i,
                oS = document.selection.createRange(),
                // Don't: oR = textarea.createTextRange()
                oR = document.body.createTextRange();
            oR.moveToElementText(textarea);
        
            rangeData.text = oS.text;
            rangeData.bookmark = oS.getBookmark();
        
            // object.moveStart(sUnit [, iCount])
            // Return Value: Integer that returns the number of units moved.
            for (i = 0; oR.compareEndPoints('StartToStart', oS) < 0 && oS.moveStart("character", -1) !== 0; i ++) {
                // Why? You can alert(textarea.value.length)
                if (textarea.value.charAt(i) === '\n') {
                i ++;
                }
            }
            rangeData.start = i;
            rangeData.end = rangeData.text.length + rangeData.start;
            }
        
            return rangeData;
        },
        
        /**
        * setCursorPosition Method
        *
        * Created by Blank Zheng on 2010/11/12.
        * Copyright (c) 2010 PlanABC.net. All rights reserved.
        *
        * The copyrights embodied in the content of this file are licensed under the BSD (revised) open source license.
        */
        setCursorPosition : function (textarea, rangeData) {
            if (!rangeData) {
            alert("You must get cursor position first.")
            }
            if (textarea.setSelectionRange) { // W3C
            textarea.focus();
            textarea.setSelectionRange(rangeData.start, rangeData.end);
            } else if (textarea.createTextRange) { // IE
            var oR = textarea.createTextRange();
            // Fixbug :
            // In IE, if cursor position at the end of textarea, the setCursorPosition function don't work
            if (textarea.value.length === rangeData.start) {
                oR.collapse(false)
                oR.select();
            } else {
                oR.moveToBookmark(rangeData.bookmark);
                oR.select();
            }
            }
        },
        
        // 设置鼠标光标
        setCursors : function(el,st,end) {
            if (el.setSelectionRange) {
            el.focus();
            el.setSelectionRange(st,end);
            } else {
            if (el.createTextRange) {
                range = el.createTextRange();
                range.collapse(true);
                range.moveEnd("character",end);
                range.moveStart("character",st);
                range.select();
            }
            }
        },
        
        // 设置鼠标光标
        setCursor : function(el) {
            var range = this.getCursorPosition(el);
            this.setCursorPosition(el, range);
        },
        
        // 分批执行
        batch : function (queue, size, current, timeout, method, callback, _nextPort) {
            
            if (!$.isArray(queue)) {
            return false;
            }
            
            current = current || 0;
            size    = size || 1000; // 设置每批执行的数量,
            timeout    = timeout || 20;
            
            var start    = current * size,
            length    = queue.length,
            end    = Math.min((current+1)*size, length),
            portion    = queue.slice(start, end);
            
            // 首批任务
            $.isFunction(method) 
            ? method(portion, end === length, current)
            : (window.console&&console.log("Error: tbc.batch(...). arguments[4] must be a function;"));
            
            // 排队任务
            setTimeout(function() {
            current+=1;
            if (size*(current)<length) {
                tbc.batch(queue, size, current, timeout, method, callback );
            }
            }, timeout);
            
            if (end === length && $.isFunction(callback)) {
            callback.call(this);
            }
        },
        
        // 表单串行化 
       seriesForm : function(obj) {
            var field = $("input,textarea,select", obj),
                serialize = [],
                checkbox = {}, // 多选框
                selected = [],
                radio = {}, // 单选框
                k;
            
            field.each(function () {
                var tag = this.tagName.toLowerCase();

                // 如果控件被禁用则跳过
                // if (this.disabled || this.name === "__VIEWSTATE" || this.name === "__EVENTVALIDATION") return true;
                if (this.disabled) {
                    return true;
                }
    
                switch (tag) {
                    case "input":
                    
                        switch (this.type) {
                            case "checkbox":
                                checkbox[this.name] = checkbox[this.name] || [];
                                if (this.checked) {
                                    checkbox[this.name].push(this.value);
                                }
                                break;
                                
                            case "radio":
                                radio[this.name] = radio[this.name] || [];
                                if (this.checked) {
                                    radio[this.name].push(this.value);
                                }
                                break;
                                
                            case "button":
                            case "reset": break;
                            case "submit":
                                // 用于触发ASP.NET的服务器端事件。
                                if (!$(this).hasClass("trigger_aspnet_event")) {
                                    break;
                                }
                                
                            default:
                                serialize.push([this.name || this.id, encodeURIComponent(this.value)].join("="));
                                break;
                        }
                        break;

                    case "textarea":
                        serialize.push([this.name || this.id, encodeURIComponent(this.value)].join("="));
                        break;

                    case "select":
                        $("option", this).each(function () {
                            if (this.selected) {
                                selected.push(encodeURIComponent(this.value));
                            }
                        });
                        serialize.push([this.name || this.id, selected.join(",")].join("="));
                        break;
                    case "button":
                        serialize.push([this.name || this.id, encodeURIComponent(this.value)].join("="));
                    break;
                }
            });
                
            field = null;

            // 获取多选框的值
            for (k in checkbox) {
                serialize.push([k, checkbox[k].join(",")].join("="));
            }

            // 获取单选框的值
            for (k in radio) {
                serialize.push([k, radio[k].join(",")].join("="));
            }
            
            try {
                return serialize.join("&");
            } finally {
                serialize = radio = checkbox = selected = null;
            }
        },
        
        replaceUrlParam : function(key, value, url) {
            var keys = this.isObject(key) ? key : (function() {var o={}; o[key]=value; return o;})();
            
            var s = url || document.location.search;
            s = s.substring(s.indexOf("?")+1).split("&");
            var search = {};
            $.each(s, function(i) {
            var ks = this.split("=");
            search[ks[0]] = ks[1]||"";
            });
            $.extend(search, keys);
            return search;
        },
        
        // 合并路径和文件名
        mergerPath : function (base, url) {
            var base = (base || document.location.href);
            
            if (url.match(/^https?:\/\//)) {
            
            if ($.browser.msie && $.browser.version < 6 && false) {
                var lct = document.location;
                var fullHost = lct.protocol + "//" + lct.host + "/";
                var exps = new RegExp("^" + fullHost);
                url = url.replace(exps, "");
                url = url.substring(url.indexOf("/") + 1, url.length);
            } else {
                return url;
            }
            }
            
            var dt = base.split("?")[0].split("/");
            dt.length--;
                
            if (!url.match(/^\/{1}/)) {
            while (url.indexOf("../") === 0) {
                url = url.slice(3);
                dt.length--;
            }
            url = unescape(dt.join("/") + "/" + url)
            }
            
            return url;
        },
        
        /* 随机字符串 */
        randomString : function(num) {
            num = num ? num-1 : 15; // 字符长度
            var chars = "0123456789abcdefghijklmnoprstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+|=-`";
            
            return (function(m,s,c) {
                return (c ? arguments.callee(m,s,c-1) : '') + s[m.floor(m.random() * s.length)]
            }
           )(Math, chars, num);
        },
        
        /* 随机数 */
        random : function(start, end) {
            switch(arguments.length) {
            case 1 : return Math.floor(Math.random()*start+1);
            case 2 : return Math.floor(Math.random()*(end-start+1)+start);
            default : return 0;
            }
        },
            
        /* 随机颜色 */
        randColor : function(_c)
        {
            return (
            function(m,s,c)
            {
                return (c>0 ? arguments.callee(m,s,c-1): '#') + s[m.floor(m.random() * 16)];
            }
           )(Math, _c||['1','2','3','4','5','6','7','8','9','0','a','b','c','d','e','f'], 5);
        }, 
        
        isSight : function(elem) {
            
            var _el = $(elem)[0] ? $(elem)[0].parentNode : elem;
            var parent = this.getCoordinate($(elem)[0]); // { left:0, top:0 };
            var offset = this.getCoordinate($(elem)[0]);
            
            
            if (parent.top<offset.top || parent.top>offset.bottom || parent.left<offset.left)
            {
            return false;
            }
            
            try{
            return true;
            }finally{
            _el = elem = parent = offset = null;
            }
        },
        
        inArea : function(area, elem) {
            var a1 = this.getCoordinate(area);
            var a2 = this.getCoordinate(elem);
            a2.centerX = a2.left + (a2.width/2);
            a2.centerY = a2.top + (a2.height/2);
            
            if (a2.left>a1.left && a2.right<a1.right && a2.top>a1.top && a2.bottom<a1.bottom)
            {
            return true;
            }
            
            try{
            return false;
            }finally{
            area = elem = a1 = a2 = null;
            }
        },
        
        // 是否倾斜于该对象内
        isIncline : function(area, elem) {
            var a1 = this.getCoordinate(area);
            var a2 = this.getCoordinate(elem);
            a2.centerX = a2.left + (a2.width/2);
            a2.centerY = a2.top + (a2.height/2);
            
            if (a2.centerX>a1.left && a2.centerX<a1.right && a2.centerY>a1.top && a2.centerY<a1.bottom)
            {
            return true;
            }
            
            try{
            return false;
            }finally{
            area = elem = a1 = a2 = null;
            }
        },
        
        // 对象2和对象1是否有重叠的地方
        isOverlap : function(area, elem) {
            var a1 = $.isPlainObject(area) ? area : this.getCoordinate(area);
            var a2 = $.isPlainObject(elem) ? elem : this.getCoordinate(elem);
            
            var left   = Math.max(a1.left, a2.left),
            top    = Math.max(a1.top, a2.top),
            right  = Math.min(a1.right, a2.right),
            bottom = Math.min(a1.bottom, a2.bottom);
            
            try{
            return left<right && top<bottom;
            }finally{
            area = elem = a1 = a2 = null;
            }
        },
        
        /*
         * 居中窗体
         */
        center : function(elem, container, callback) {
            
            elem = $(elem);
            container = $(container);
            
            /* 计算窗口要显示的坐标位置:left、top、width、height */
            var _wid = elem.width(),
                _hei = elem.height(),
                _left= elem.css("left"),
                _top = elem.css("top"),
                pageW, pageH, scrlT, scrlL;
            
            if (container.size()) {
                pageW = container.innerWidth();
                pageH = container.innerHeight();
                scrlT = container.scrollTop();
                scrlL = container.scrollLeft();
            } else {
                pageW = document.documentElement.clientWidth||document.documentElement.offsetWidth;
                pageH = document.documentElement.clientHeight||document.documentElement.offsetHeight;
                scrlT = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
                scrlL = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
            }
            
            /** 水平居中 */
            _left = pageW<_wid ? scrlL : (pageW/2) + scrlL - (_wid/2);
        
            /** 垂直居中*/
            _top =  pageH<_hei ? scrlT : (pageH/2) + scrlT - (_hei/2);
            
            elem.css({ top: _top, left: _left, width:_wid, height:_hei});
            
            callback = callback || container;
            if ($.isFunction(callback)) {
                callback.call(elem);
            }
        },
    
        array : 
        {
            // 去除数组重复项
            unique: function (array) {
                var arr = [],
                    exist,
                    i, len, k;
                for (i=0,len=array.length; i < len; i+=1) {
                    exist = false;
                    for (k=0; k < arr.length; k+=1) {
                        if (array[i] === arr[k]) {
                            exist = true;
                        }
                    }
                    if (exist !== true) {
                        arr.push(array[i]);
                    }
                }
                try { return arr; } finally { arr=null; }
            },
        
            // 合并数组
            merge: function () {
                var args = arguments,
                    len = args.length,
                    arr = [],
                    i;
                for (i = 0; i < len; i+=1) {
                    if (typeof args[i] === 'object' && args[i].constructor === Array) {
                    arr = arr.concat(args[i]);
                    }
                }
                
                try { return this.unique(arr); } finally { args=arr=null; }
            },
            
            // 清理数组
            clear : function (arr) {
                var newArr = [],
                    i, len;
                for (i=0,len=arr.length; i<len; i+=1) {
                    if (typeof arr[i] !== 'undefined') {
                    newArr.push(arr[i]);
                    }
                }
                try { return newArr; } finally { newArr=null; }
            },
        
            // 删除数组项: 要删除的项作为参数“array”以外的参数
            remove: function (array) {
                var arr = [],
                args = arguments;
                args = tbc.isArray(args[1]) ? [1].concat(args[1]) : args;
                $.each(array, function (k, a) {
                    var d = false, i, len;
                    for (i=1, len = args.length; i < len; i+=1) {
                        if (!d && args[i] === a) {
                            d = true;
                            break;
                        }
                    }
                    
                    if (!d) {
                        arr.push(a);
                    }
                });
                return arr;
            },
            
            // 获取元素在数组中的位置
            indexOf : function(item_1, arr) {
                
                var i, len;
                arr = (arr&&typeof(arr) === "object"&&arr.constructor === Array)
                    ? arr : [];
                for(i=0,len=arr.length; i<len; i+=1) {
                    if (item_1 === arr[i]) {
                        return i;
                    }
                }
                return -1;
            },
            
            sort : function(array, type) {
                var arr;
                if (type && type.toLowerCase() === "desc") {
                    arr = array.sort(this.sortASC);
                }else{
                    arr = array.sort(this.sortDESC);
                }
                
                try {
                    return arr;
                } finally {
                    arr = null;
                }
            },
            
            sortASC : function(a,b) { return a-b; },
            sortDESC :function(a,b) { return b-a; }
            },
            isNumber: function (n) {
                return typeof (n) === "number";
            },
            isString: function (s) {
                return typeof (s) === "string";
            },
            isFunction: function (f) {
                return typeof (f) === "function";
            },
            isNull: function (n) {
                return n === null;
            },
            isBool: function (b) {
                return typeof (b) === "boolean";
            },
            isArray: function (a) {
                return !!a && a.constructor === Array;
            },
            isObject: function (o) {
                return !!o && o.constructor === Object;
            },
        debug: {
            printObj:function(o, v) {
                var s=["{\n"],
                    k;
                for(k in o) {
                    if (o.hasOwnProperty(k)) {
                        s.push(v?("    "+k+":"+o[k]+",\n") : ("    "+k+"; "));
                    }
                }
                s.push("}");
                    return s.join("");
                }
            },
        log : function(t) {
            if (window.console) {window.console.log(t);}
        },
        st : function() {
            this.st.time = new Date().getTime();
            return this.st.time;
        },
        et : function() {
            var et = new Date().getTime(),
                lg = "tbc.et: "+ (et-this.st.time);
            tbc.log(lg);
            return et-this.st.time;
        }
    };
    tbc.extend(tbc, methods);


}(window, jQuery));

(function(){

    /**
     * 为不支持function(){}.bind方法的浏览器扩展Function原型
     * @method bind
     * @for  Function.prototype
     * @param {Object} target 将函数绑定到此对象
     * @param {Any} args* 一个或多个任意类型的参数
     * @return {Function} 返回一个封装好的函数，此函数的this指向
     *         target参数所指定的对象，如果无此参数则指向window对
     *         象。
     */
    Function.prototype.bind = Function.prototype.bind || function() {
        var func   = this,
            target = arguments[0],
            args   = Array.prototype.slice.call(arguments, 1);
        
        return function() {
            var argsMerged = Array.prototype.concat.apply(args, arguments);
            return func.apply(target, argsMerged);
        }
    }
}());

/**
 * 命名空间 
 * @namespace tbc
 */
;(function(tbc, $){

    "use strict";

    /**
     * @class tbc.Event
     * @for  tbc
     * @constructor
     * @copyright 时代光华
     * @author mail@luozhihua.com
     */
    tbc.Event = function() {

        // 私有方法: 根据事件名称删除事件
        function REMOVE(eventType, func) {
            if (typeof func === "function") {

                var store = this.eventStorage[eventType],
                    newEvent = [],
                    i, len;

                if (typeof store === "object" && store.constructor === Array) {
                    for (i=0, len=store.length; i<len; i+=1) {
                        if (store[i].toString() !== func.toString()) {
                            newEvent.push(store[i]);
                        }
                    }
                    this.eventStorage[eventType] = newEvent;
                }
            }else{
                this.eventStorage[eventType]=[];
            }
        }

        // 私有方法: 触发事件
        function TRIGGER(eventType, parameters) {

            var result, res,
                store = this.eventStorage[eventType],
                i;

            if (typeof store === "object" && store.constructor === Array) {
                for (i=store.length-1; i>-1; i-=1) {
                    if (typeof(store[i]) === "function") {
                        try {
                            res = store[i].apply(this, parameters);
                            result = res===false ? false : result;

                            // 如果事件方法内返回true, 则停止继续触发其他事件方法,并返回false
                            if (res ===true) {
                                return true;
                            }
                        } catch(e) {

                        }
                    }
                }
            }
            return result===false?false:result;
        }

        tbc.self(this, arguments).extend({

            /**
             * 初始化
             * @private
             * @method init
             * @chainable
             */
            init : function() {
                this.packageName = "tbc.Event";
                return this;
            },

            /**
             * 事件存储器 
             * @private
             * @for tbc.Event
             * @property {Object} eventStorage
             * @type {Object}
             */
            eventStorage : {},

            /**
             * 私有方法: 根据事件名称删除事件，如果传入@func参数，则只删除
             * 指定的事件方法，否则删除事件类的所有方法
             * @private
             * @method REMOVE
             * @param {String} eventType 事件类型
             * @param {Function} [func] 回调方法
             */
            REMOVE : function(eventType, func) {
                if (typeof func === "function") {

                    var store = this.eventStorage[eventType],
                        newEvent = [],
                        i, len;

                    if (typeof store === "object" && store.constructor === Array) {
                        for (i=0, len=store.length; i<len; i+=1) {
                            if (store[i].toString() !== func.toString()) {
                                newEvent.push(store[i]);
                            }
                        }
                        this.eventStorage[eventType] = newEvent;
                    }
                } else {
                    this.eventStorage[eventType]=[];
                }
            },

            /**
             * 私有方法: 触发事件，参数parameters会分发给事件类的
             * 所有方法，以数组形式传递，数组的每一个元素都作；
             * 为事件方法的一个参数；
             * @private
             * @method TRIGGER
             * @param {String} eventType 事件类型
             * @param {Array} [parameters] 此参数分发给事件类的所有方法，
             *                             数组的每一个元素都作为事件方法
             *                             的一个参数，parameters有几个元
             *                             素，那么事件方法就会接收到几个
             *                             参数；
             */
            TRIGGER : function(eventType, parameters) {

                var result, res,
                    store = this.eventStorage[eventType],
                    i;

                if (typeof store === "object" && store.constructor === Array) {
                    for (i=store.length-1; i>-1; i-=1) {
                        if (typeof(store[i]) === "function") {
                            try {
                                res = store[i].apply(this, parameters);
                                result = res===false ? false : result;

                                // 如果事件方法内返回true, 则停止继续触发其他事件方法,并返回false
                                if (res ===true) {
                                    return true;
                                }
                            } catch(e) {

                            }
                        }
                    }
                }
                return result===false?false:result;
            },

            /**
             * 添加事件方法
             * @public
             * @method addEvent
             * @param  {String} eventType 事件类型
             * @param  {Function} func    事件方法
             * @chainable
             */
            addEvent : function(eventType, func) {

                var t,
                    store = this.eventStorage,
                    events,
                    existing,
                    i, len;

                if (typeof eventType === "object") {
                    for (t in eventType) {
                        if (eventType.hasOwnProperty(t)) {
                            this.addEvent(t, eventType[t]);
                        }
                    }
                    return this;
                }

                if (typeof func === "function") {
                    if ($.isArray(store[eventType])) {
                        events = store[eventType];
                    } else {
                        events = store[eventType] = [];
                    }

                    existing = false;
                    for(i=0, len=events.length; i<len; i+=1) {
                        if (events[i].toString() === func.toString()) {
                            existing = true;
                        }
                    }

                    if (!existing) {
                        store[eventType].push(func);
                    }
                }
                return this;
            },

            /**
             * 移除事件
             * @public
             * @method removeEvent
             * @param  {EventType} eventType 事件类型
             * @param  {Function}  func      事件方法
             * @chainable
             */
            removeEvent : function(eventType, func) {
                var stores = this.eventStorage,
                    e,
                    eventMatch = new RegExp("(^|\\.)" + eventType.substring(eventType.indexOf(".")+1,eventType.length) + "($|\\.)");

                for (e in stores) {
                    if (stores.hasOwnProperty(e) && (e === eventType || e.match(eventMatch))) {
                        this.REMOVE(e, func);
                    }
                }
                stores = null;
                return this;
            },

            /**
             * 触发事件，此方法接收多个参数，除eventType外的其他参数
             * 都将分发给eventType指定的事件类型的所有方法；
             * @public
             * @method triggerEvent
             * @param  {String} eventType* 事件类型
             * @return {Boolean}           如果事件类型的任一方法返回false
             *                             那么此方法也将返回false, 否则返
             *                             回触发此事件的实例；
             */
            triggerEvent : function(eventType) {
                var parameters = [],
                    result, res,
                    stores = this.eventStorage,
                    i,len,e,
                    eventMatch = new RegExp("(^|\\.)" + eventType.substring(eventType.indexOf(".")+1,eventType.length) + "($|\\.)");

                for (i=1,len=arguments.length; i<len; i+=1) {
                    parameters.push(arguments[i]);
                }

                for (e in stores) {
                    if (stores.hasOwnProperty(e) && (e === eventType || e.match(eventMatch))) {
                        res = this.TRIGGER(e, parameters);
                        result = res===false ? false : result;

                        // 如果事件方法内返回true, 则停止继续触发其他事件方法,并返回false
                        if (res ===true ) {
                            return false;
                        }
                    }
                }
                stores = null;

                return result===false ? false : this;
            }
        });
    };
}(tbc, jQuery));

;(function(tbc, $){

    "use strict";

    /**
     * 实例存储器
     * @protected
     * @property {Object} TASK_DEPOT
     * @for tbc
     * @type {Object}
     */
    tbc.TASK_DEPOT = tbc.TASK_DEPOT || {};

    /**
     * 实例计数器
     * @protected
     * @property {Number} TASK_DEPOT_COUNT
     * @for tbc
     * @type {Number}
     */
    tbc.TASK_DEPOT_COUNT = tbc.TASK_DEPOT_COUNT || 0;

    /**
     * 实例ID递增器，会根据实例的增加而递增, 初始值为0
     * @protected
     * @property {Number} guid
     * @for tbc
     * @type {Number}
     */
    tbc.guid = tbc.guid || 0;

    /**
     * 根据GUID取得一个实例, 或者存储一个实例（如果有task）
     * @protected
     * @method TASKS
     * @for tbc
     * @param  {Number} id   实例GUID
     * @param  {Object} [task] 任意类型的tbc实例
     * @return {Object}      返回实例，如果没有找到则返回null
     */
    tbc.TASKS = function(id, task) {
        if (!id) {
            return null;
        }
        
        if (task && !tbc.TASK_DEPOT[id]) {
            tbc.TASK_DEPOT[id] = task;
            tbc.TASK_DEPOT_COUNT+=1;
        }else{
            return tbc.TASK_DEPOT[id] || null;
        }
    };

    /**
     * 存储实例，同tbc.TASKS(id, task);
     * @protected
     * @method set
     * @for tbc.TASKS
     * @param  {Number} id    实例GUID
     * @param  {Object} task  实例
     */
    tbc.TASKS.set = function(id,task) {
        this(id,task);
    };

    /**
     * 获取实例
     * @protected
     * @method get
     * @for tbc.TASKS
     * @param  {Number} id 实例GUID
     * @return {Object}     返回找到的实例, 否则返回null
     */
    tbc.TASKS.get = function(id) {
        return this(id);
    };

    /**
     * 删除实例
     * @protected
     * @method del
     * @for tbc.TASKS
     * @param  {Number} id      实例GUID
     */
    tbc.TASKS.del=function(id) {
        var t = tbc.TASK_DEPOT[id],
            depend,
            k;
        if (id && t) {
            try {
                if (t.container) {
                    tbc.TASK_DEPOT[id].container.empty().remove();
                }

                if (t.ui) {
                    tbc.TASK_DEPOT[id].ui.empty().remove();
                }
            } catch(e) {

            }
            
            // 删除依赖对象
            depend    = t.DEPENDS || [];
            tbc.TASKS.killAll(depend);
            
            // 删除对象属性
            for (k in t) {
                if (t.hasOwnProperty(k)) {
                    delete tbc.TASK_DEPOT[id][k];
                }
            }

            t=null;
            delete tbc.TASK_DEPOT[id];
        }
    };

    /**
     * 批量销毁对象
     * @protected
     * @method killAll
     * @for tbc.TASKS
     * @param  {Array} depends 要销毁的实例GUID集合
     */
    tbc.TASKS.killAll = function(depends) {
        if (typeof depends === 'array' && depends.length>0) {

            var k, i, len;

            for (k in tbc.TASK_DEPOT) {
                if (tbc.TASK_DEPOT.hasOwnProperty(k) && tbc.TASK_DEPOT[k].DEPENDS) {
                    for (i=0, len=depends.length; i<len; i++) {
                        if (depends[i] === k) {
                            tbc.TASK_DEPOT[k].DESTROY();
                        }
                    }
                }
            }
        }
    };

    /**
     * 根据GUID取得一个实例, 或者存储一个实例（如果有task）
     * @protected
     * @method getTaskByElement
     * @for tbc
     * @param  {Element} elem HTML Element
     * @return {Object}  返回实例，如果没有找到则返回null
     */
    tbc.getTaskByElement = function(elem) {
        var guid = $(elem).attr("tbc");
            guid = guid || $(elem).parents("[tbc]:first").attr("tbc");

        return tbc.TASKS(guid);
    };

    /**
     * TBC实例管理器
     * @class tbc.ClassManager
     * @constructor
     * @copyright 时代光华
     * @author mail@luozhihua.com
     */
    tbc.ClassManager = function(o) {

        tbc.self(this, arguments)
        .extend({
        
            /**
             * 依赖此实例的其他实例GUID存储器，在销毁此实例
             * 时, 同时销毁依赖此实例的其他实例;
             * @private
             * @property {Array} DEPENDS
             * @type {Array}
             */
            DEPENDS : [],
            
            /**
             * 使此实例依赖于另外一个对象
             * @public
             * @method depend
             * @param  {Object} obj 被依赖的对象
             * @chainable
             */
            depend : function(obj) {
                if (tbc.isArray(obj.DEPENDS)) {
                    obj.DEPENDS.push(this.guid);
                }
                return this;
            },

            /**
             * 让另外一个对象依赖本实例
             * @public
             * @method dependSelf
             * @param  {Object} obj 要求依赖此实例的对象
             * @chainable
             */
            dependSelf : function(obj) {
                var guid = typeof obj === "object" ? obj.guid : obj;
                this.DEPENDS.push(guid);
                return this;
            },
            
            /**
             * 解除此实例对某一对象的依赖
             * @public
             * @method ubdepend
             * @param  {Object} obj 正在被此实例依赖的对象
             * @chainable
             */
            undepend : function(obj) {
                if (obj && tbc.isArray(obj.DEPENDS)) {
                    obj.DEPENDS = tbc.array.remove(obj.DEPENDS, this.guid);
                }
                return this;
            },
            
            /**
             * 解除某对象对此实例的依赖
             * @public
             * @method undependSelf
             * @param  {Object} obj 正在依赖此实例的对象
             * @chainable
             */
            undependSelf : function(obj) {
                var guid = typeof obj === "object" ? obj.guid : obj;
                this.DEPENDS = tbc.array.remove(this.DEPENDS, guid);
                return this;
            },
            
            /**
             * 初始化
             * @private
             * @method INIT
             * @chainable
             */
            INIT : function() {
                
                var constr = this.constructor;

                this.packageName = "tbc.ClassManager";

                // 正在被初始化的类的构造器的id
                constr.maxid = constr.maxid || 0;
                constr.maxid = constr.maxid + 1;
                this.iid = constr.maxid;
                constr.count = constr.count&&!isNaN(constr.count)?constr.count+1:1;
                
                // 实例存储器
                tbc.guid += 1;
                this.guid = tbc.guid;
                constr.instance = constr.instance || {};
                this.CREATE_TIME = new Date().getTime();

                this.INIT_INSTANCE();

                this.INSTANCE(this.iid, this);
                tbc.TASKS(this.guid, this);

                return this;
            },
            
            /**
             * 销毁当前对象(销毁自己)
             * @public
             * @method DESTROY
             */
            DESTROY : function() {
                var guid = this.guid,
                    iid  = this.iid;

                this.INSTANCE(iid, "del");
                this.triggerEvent("destroy");
                tbc.TASKS.del(guid, false);
                guid = iid = null;
            },
            
            /**
             * 缓存实例到本实例的构造器（不推荐使用）
             * @public
             * @deprecated 不再推荐使用此方法，实例已经缓存到全
             *             局的tbc.TASK_DEPOD实例缓存器, 不推荐
             *             重复缓存，除非要实现特定的功能；
             * @param  {Number} iid       实例的iid，iid通常是此实例的
             *                            构造类的一个递增器，随着其被
             *                            实例化的次数而递增
             * @param  {Object} instance 某一构造类的实例
             * @chainable
             */
            INSTANCE : function(iid, instance) {
                if (!iid) {
                    return null;
                }

                if (instance === "del" && this.constructor.instance[iid]) {
                    delete this.constructor.instance[iid];
                    this.constructor.count = this.constructor.count-1;
                } else if (instance && !this.constructor.instance[iid]) {
                    this.constructor.instance[iid] = instance;
                } else {
                    return this.constructor.instance[iid] || null;
                }
                return this;
            },

            INIT_INSTANCE : function() {

                // 获取实例
                this.INSTANCE.get = function(id) {
                    return this(id);
                };
                
                // 托管实例
                this.INSTANCE.set = function(id, instance) {
                    this(id, instance);
                };
                
                // 删除托管版本
                this.INSTANCE.del = function(id) {
                    this(id, "del");
                };
            }
        })
        .INIT();
    };
}(tbc, jQuery));

/**
 * 手风琴类
 * @class tbc.Accordion
 * @constructor
 * @copyright http://www.21tb.com
 * @author mail@luozhihua.com
 */
;(function(tbc, $){

    "use strict";

    tbc.Accordion = function (settings) {
        var defaults = {
                  height: 320
                , header: ".tbc-accordion-header"
                , container: null//".tbc-accordion-container"
                , itemHeader: ".tbc-accordion-itemHeader", itemContainer: ".tbc-accordion-itemContainer", currentCss: "current", active: 0 // 初始化时默认显示的项目
                , event: {
                    "titleClick": function () {
                        
                    },
                    "active": function (header, container) {

                    },
                    "retire": function (header, container) {

                    }
                }
            },
            options = tbc.extend({}, defaults, settings); 

            options.height = (!options.height || options.height==="auto") ? 356 : options.height; 

        tbc.self(this, arguments)
        .extend({

            /**
             * 初始化
             * @private
             * @method init
             * @chainable
             */
            init: function () {
                var SELF = this;

                this.addEvent(options.event);
                this.packageName = "tbc.Accordion";

                if (options.container) {
                    this.ui = $(options.container);
                    this.container = this.ui;
                } else {
                    this.ui = $('<div class="tbc-accordion"></div>');
                    this.container = this.ui;
                }

                this.ui.height(options.height);
                this.crimpleAll();

                // 设置为活动项目
                setTimeout(function () {
                    SELF.setCurrent(options.active, true);
                }, 100);

                this.ui.delegate(options.itemHeader, "click touchend dblclick", function () {
                    var index = $(this).prevAll(options.itemHeader).size();
                    SELF.setCurrent(index);
                });
            },

            /**
             * 获取手风琴tab总数
             * @public
             * @method getSize
             * @return {Number} 返回手风琴页数
             */
            getSize: function () {
                return this.container.children(options.header).size();
            },

            /**
             * 将手风琴显示到容器中
             * @public
             * @method appendTo
             * @param  {Element | jQuery Object} box 目标容器
             * @chainable
             */
            appendTo: function (box_1) {
                var box = $(box_1);
                if (box.size()) {
                    box.append(this.ui);
                }
                return this;
            },

            /**
             * 追加HTML元素或一个手风琴tab页
             * @public
             * @method append
             * @param  {Element | jQueryObeject | Object} module 任何的HTML元素、
             *                    jQuery对象或手风琴tab页，如果参数是Object类型
             *                    并且包含header、container属性，则调用appendItem
             *                    方法。
             * @chainable
             */
            append: function (module) {
                if (module.header && module.container) {
                    this.appendItem.apply(this, arguments);
                } else {
                    this.container.append(module);
                }
                return this;
            },

            /**
             * 追加一个手风琴tab页s
             * @public
             * @method appendItem
             * @param  {Object} module 手风琴tab页.
             *     @param {Element} module.header 手风琴TAB页头.
             *     @param {Element} module.container 手风琴TAB页内容.
             * @chainable
             */
            appendItem: function (module) {
                if (module.header && module.container) {
                    module.container.hide();
                    this.container
                        .append(module.header.addClass("tbc-accordion-itemHeader"))
                        .append(module.container.addClass("tbc-accordion-itemContainer"));
                }
                return this;
            },

            /**
             * 从前面追加HTML元素或一个手风琴tab页
             * @public
             * @method prepend
             * @param  {Element | jQuery Selector | Object} module 任何的HTML元素、
             *                    jQuery对象或手风琴tab页，如果参数是Object类型
             *                    并且包含header、container属性，则调用prependItem
             *                    方法。
             * @chainable
             */
            prepend: function (module) {
                if (module.header && module.container) {
                    this.prependItem.apply(this, arguments);
                } else {
                    this.container.prepend(module);
                }
                return this;
            },

            /**
             * 从前面追加一个手风琴tab页
             * @public
             * @method prependItem
             * @param  {Object} module 手风琴tab页
             *     @param {Element|jQueryObject} module.header 手风琴TAB页头
             *     @param {Element|jQueryObject} module.container 手风琴TAB页内容
             * @chainable
             */
            prependItem: function (module) {
                if (module.header && module.container) {
                    module.container.hide();
                    this.container
                        .prepend(module.container.addClass("tbc-accordion-itemContainer"))
                        .prepend(module.header.addClass("tbc-accordion-itemHeader"));
                }
                return this;
            },

            /**
             * 移除手风琴tab页
             * @public
             * @method removeItem
             * @param  {Number} index 要移除的tab页的序号
             * @return {[type]}       [description]
             */
            removeItem: function (index) {
                var header, container;
                if (index && !isNaN(index)) {
                    header = this.container.children(options.itemHeader).eq(index);
                    container = header.next(options.itemContainer);
                    header.remove();
                    container.remove();
                } else if (typeof(index) === "string") {
                    this.container.children(options.itemHeader).each(function () {
                        if (this.innerHTML.indexOf(index) !== -1) {
                            header = $(this);
                            return false;
                        }
                    });
                    container = header.next(options.itemContainer);
                    header.remove();
                    container.remove();
                }
                header = container = null;
                return this;
            },

            /*
             * 获取手风琴内的所有tab页
             * @public
             * @method getAll
             * @return {Array} [options] 返回手风琴内的所有tab页集合
             *         @header {Element|jQueryObject} 手风琴tab页头
             *         @container {Element|jQueryObject} 手风琴tab页内容
             */
            getAll: function () {
                var items = [],
                    head = this.container.children(options.itemHeader),
                    i,
                    len;
                for (i = 0 , len = head.length; i < len; i += 1) {
                    items.push({
                        "header": $(head[i]), "container": $(head[i]).next(options.itemContainer)
                    });
                }

                try {
                    return items;
                } finally {
                    items = head = null;
                }
            },

            /**
             *
             收起全部手风琴菜单
             * @public
             * @method crimpleAll
             * @chainable
             */
            crimpleAll: function () {
                var conter = this.container,
                    heads = conter.children(options.itemHeader),
                    conts = conter.children(options.itemContainer);

                heads.removeClass(options.currentCss);
                conts.slideUp();
                return this;
            },

            /**
             * 获取Accordion的当前tab页
             * @public
             * @method getCurrent
             * @return {object} 处于活动状态的tab页 {header, container}
             */
            getCurrent: function () {
                var header = this.container.children(options.itemHeader).filter("." + options.currentCss),
                    container = header.next(options.itemContainer);

                try {
                    return header.size() ? { header: header, container: container } : null;
                } finally {
                    header = container = null;
                }
            },

            /**
             * 设置Accordion tab页为活动状态（即展开一个tab页）
             * @public
             * @method setCurrent
             * @param  {Number} index tab页序号
             * @param  {Boolean} force 立即切换
             * @chainable
             */
            setCurrent: function (index, force) {
                index = index === 0 || !index ? 0 : index;

                if (force || !this.isCurrent(index)) {

                    var self = this,
                        curr = this.getCurrent(),
                        future = this.findItem(index);

                    if (curr && future) {
                        curr.header.removeClass(options.currentCss);
                        curr.container.stop().animate({ height: 0 }, 300, function () {
                            curr.container.hide();
                            self.triggerEvent("retire", curr);
                            curr = null;
                        });
                    }

                    if (future) {
                        future.header.addClass(options.currentCss);
                        future.container.show().stop().animate({ height: this.getAvailableHeight() }, 300, function () {
                            future.container.css({overflow: "auto", position: ""});
                            self.triggerEvent("active", future);
                            future = null;
                        });
                    }
                }
                return this;
            },

            /**
             * 判断tab页是否处于展开状态
             * @public
             * @method isCurrent
             * @param  {Number} index
             * @return {Boolean} 返回true表示展开，否则没有展开
             */
            isCurrent: function (index) {
                var itm = this.findItem(index);
                return (itm && itm.header.hasClass(options.currentCss));
            },

            /**
             * 根据索引或者标题查找项目
             * @public
             * @method findItem
             * @param {Number|String} index 数组或者手风琴菜单的标题
             * @return {Object} 返回一个手风琴菜单项的对象，对象结构：
             *      {header:{jQuery Object}, container:{jQuery Object} }
             */
            findItem: function (index) {
                var items = this.getAll(),
                    future,
                    i, len;

                if (index === 0 || (index && !isNaN(index))) {
                    future = items[index];
                } else {
                    for (i = 0, len = items.length; i < len; i += 1) {
                        if (items[i].header.innerHTML.indexOf(index) !== -1) {
                            future = items[i];
                            break;
                        }
                    }
                }

                try {
                    return future;
                } finally {
                    items = future = null;
                }
            },

            /**
             * 获取Accordion的高度
             * @public
             * @method getHeight
             * @return {Number} 返回高度值
             */
            getHeight: function () {
                return this.container.innerHeight();
            },

            /**
             * 设置Accordion的高度
             * @public
             * @method setHeight
             * @param {Number} height 新高度
             * @chainable
             */
            setHeight: function (height) {
                var hei = this.getHeadersHeight();

                this.getCurrent().container.css({ height: height - hei });
                this.ui.css({ height: height });

                this.trigerEvent("resize", height);
                return this;
            },

            /**
             * 获取Accordion的可用高度(Accordion减去所有项目标题的高度)
             * @public
             * @method getAvailableHeight
             * @return {Number} 返回可用高度（内容器高度）
             */
            getAvailableHeight: function () {
                var height1 = this.getHeight(),
                    height2 = this.getHeadersHeight();

                return height1 - height2;
            },

            /**
             * 设置Accordion的可用高度，设置此高度后，整个手风琴的
             * 高度将会根据内容高度变化
             * @public
             * @method setAvailableHeight
             * @param {Number} availHeight 新的内容高度;
             * @chainable
             */
            setAvailableHeight: function (availHeight) {
                var hei = this.getHeadersHeight();

                this.ui.css({ height: availHeight + hei });
                this.getCurrent().container.css({ height: availHeight });

                this.trigerEvent("resize", availHeight + hei);
                return this;
            },

            /**
             * 获取所有项目的标题的高度的和
             * @public
             * @method getHeadersHeight
             * @return {Number};
             */
            getHeadersHeight: function () {
                var height = 0,
                    headers = this.container.children(options.itemHeader),
                    i, len;

                for (i = 0, len = headers.length; i < len; i += 1) {
                    height += $(headers[i]).outerHeight();
                }
                try {
                    return height;
                } finally {
                    height = headers = i = len = null;
                }
            }
        })
        .init();
    }
}(tbc, jQuery));

;(function(tbc, $) {

    "use strict";

    /**
     * 组织选择器
     * @class tbc.accordionSelector
     * @constructor
     * @param {Object} settings 配置数据
     *     @param {Boolean} [settings.autoSelect=true] 是否自动选中被标识为选中状态的节点，
     *      如果没有被标识为选中的节点，则选中第一个节点；
     *     @param {Element} settings.container 渲染手风琴选择器的HTML元素
     *     @param {Boolean} [settings.includeChild=undefined] 是的包含子节点
     *     @param {Boolean} [settings.multiple=true] 是否支持按住ctrl时多选
     *     @param {Number} [settings.height=356] 选择器的高度，默认“356px”
     *     @param {Object} [settings.treeOptions] 见<a href="tbc.Tree.html">tbc.Tree</a>类的参数 
     *     @param {Object} [settings.accordionOptions] 见<a href="tbc.Accordion.html">tbc.Accordion</a>类的参数 
     *     @param {Array} settings.items 手风琴选项卡列表
     *     @param {String} settings.items[].title 选项卡名称
     *     @param {String} settings.items[].type [description]
     */
    tbc.accordionSelector = function (settings) {

        var SELF = tbc.self(this, arguments),
            defaults = {
                autoSelect   : true,
                container    : null,
                includeChild : false,
                multiple     : true,
                height       : 356,
                treeOptions  : {},
                accordionOptions : {},
                items        : [
                    {title: "部门", type: "ajax", nodeType: "ORGANIZATION", content: "", active: true, options: {}},
                    {title: "岗位", type: "ajax", nodeType: "POSITION_CATEGORY", content: "", options: {}}, 
                    {title: "群组", type: "ajax", nodeType: "GROUP_CATEGORY", content: "", options: {}}
                ],
                event        : {
                    /*
                    selected : function (id, text) {
                        // selected = [ {id:"id", text:"text"},... ]
                    },

                    unselected : function (id, text) {
                        // selected = [ {id:"id", text:"text"},... ]
                    },

                    complete : function (selected) {

                    }
                    */
                }
            },
            options = tbc.extend({}, defaults, settings),
            active = 0,
            accordion,
            pos;

        SELF.packageName = "tbc.orgSelector";

        SELF.addEvent(options.event);

        if (!options.container) {
            SELF.container = $('<div class="tbc-orgSelector"></div>');
            SELF.ui = options.ui ? $(options.ui) : SELF.container;
        } else {
            SELF.container = $(options.container);
            SELF.ui = options.ui ? $(options.ui) : SELF.container;
        }

        pos = SELF.container.css("position");
        if (pos !== "position" && pos !== "fixed") {
            SELF.container.css("position", "relative");
        }

        options.accordionOptions = $.extend({height:options.height}, options.accordionOptions);

        accordion = new tbc.Accordion(options.accordionOptions);
        SELF.accordion = accordion;

        accordion.depend(SELF);
        accordion.appendTo(SELF.container);
        accordion.addEvent({
            active : function (itm) {

                var guid, tree, treeOpt, opt, loading;

                try {
                    SELF.includeChild = itm.header.find("[name^='includeChild']")[0].checked;
                } catch(e) {}

                if (itm && itm.container) {
                    if (itm.container.data("rendered") || itm.container.data("rendering")) {
                        if (options.autoSelect !== false) {
                            guid = itm.container.data("treeId");
                            tree = tbc.TASKS(guid);

                            if (!tree) {
                                return;
                            } else {
                                tree.setCurrent();
                            }
                        }
                    } else {
                        opt = itm.container.data("options");
                        if (opt.type === "ajax" && typeof opt.content === "string") {
                            loading = $("<div/>").html("loading...").css({ margin:"1em", textAlign:"center" }).appendTo(itm.container);
                            treeOpt = $.extend({}, opt.treeOptions, {
                                nodeType  : opt.nodeType,
                                url       : opt.content,
                                container : itm.container,
                                lazyLevel : 3,
                                param     : {
                                    nodeType : opt.nodeType
                                }
                            });
                            tree = new tbc.Tree(treeOpt);

                            tree.depend(SELF);
                            tree.addEvent({
                                afterRender : function() {
                                    var tree_1 = this;
                                    if (options.autoSelect !== false) {
                                        setTimeout(function() { tree_1.setCurrent(); }, 100);
                                    }
                                    loading.remove();
                                    tbc.unlock (itm.container);
                                    itm.container.data("rendering", false);
                                    SELF.triggerEvent("afterLoad", itm);
                                    loading = itm = null;
                                },
                                select: function(a, b, c, dbl) {
                                    SELF._selected = a;
                                    SELF.triggerEvent("select", a, a.tp||a.nodeType, dbl);
                                    SELF.triggerEvent("selected", a, a.tp||a.nodeType, dbl);
                                },
                                deselect    : function(list) {
                                    return SELF.triggerEvent("deselect", list);
                                },
                                beforeLoad    : function() {tbc.lock(itm.container, 10);},
                                afterLoad    : function() {
                                    tbc.unlock(itm.container, 10);
                                }
                            });

                            itm.container.data("treeId", tree.guid);

                            setTimeout(function() {
                                tree.load();
                                tree=null;
                            }, 1);

                        } else if (typeof opt.content === "object") {
                            itm.container.append(opt.content);
                        }

                        itm.container.data("rendered", true);
                    }
                }
                SELF.triggerEvent("active", itm);
            }
        });

        SELF.extend ({
            appendTo : function (box) {
                if ($(box).size()) {
                    this.ui.appendTo(box);
                }
            },
            prependTo : function (box) {
                if ($(box).size()) {
                    this.ui.prependTo(box);
                }
            },
            getCurrent : function() {
                return this.accordion.getCurrent();
            },
            getSelected : function() {
                return this._selected;
            }
        });

        $.each(options.items, function (i) {
            var undefine,
                title    = $('<h3 class="tbc-accordion-itemHeader"/>').html(this.title).appendTo(SELF.container),
                cont    = $('<div class="tbc-accordion-itemContainer"/>').appendTo(SELF.container).hide(),
                icon    = this.icon ?
                     (this.icon.match(/(jpg|jpeg|png|gif|bmp)/) ? 
                        '<i class="tbc-icon"><img src="'+ this.icon +'"/></i>' :
                        '<i class="tbc-icon '+ this.icon +'"></i>')
                     : null,
                isInclude, include;
                     
            if (icon) {
                title.prepend (icon);
            }
            
            // 包含子类
            isInclude = this.includeChild || ((options.includeChild && this.nodeType==='ORGANIZATION')||undefine);
            include = $ ('<div class="tbc-accordion-includeChild"></div>')
                .html('<input type="checkbox" name="includeChild_'+ i +'" '+ ((isInclude)?' checked="checked" ':'') +' /><label for="includeChild_'+ i +'">包含子类</label>');

            //include.show();
            //如果是全局属性设置了includeChild, 则仅视为部门包含子类；
            if (typeof(isInclude)!=="undefined") {
                include.hide().css({display:"block"});
            } else {
                include.show().css({display:"none"});
            }

            // 切换包含子类
            include.find("[name='includeChild_"+ i +"']").click(function() {
                SELF.includeChild = this.checked;
                SELF.triggerEvent ("includechild", this.checked);
            });
            title.append(include);

            cont.data ("options", this);

            accordion.appendItem({ header:title, container:cont });

            title = cont = icon = null;
            if (this.active) {
                active=i;
            }
        });

        accordion.setCurrent(active);
    };
}(tbc, jQuery));

(function(tbc, $, URLS) {
        
    "use strict";
    
    /**
     * @method tbc.dialog
     * @for tbc
     * 
     * @param {String|jQuery Object} html 显示的内容
     * @param {Object} settings
     * 
     * @copyright 时代光华
     * @author mail@luozhihua.com
     * 
     */
    tbc.dialog = function(html, settings) {
        
        if (html && html instanceof Object && !html.size) {
            settings = html;
            html = settings.html;
        }
        
        if (!(this instanceof tbc.dialog)) {
            return new tbc.dialog(html, settings);
        }
        
        var options = tbc.extend({
            name    : '提示',
            width   : 320,
            height  : 190,
            scrolling : false,
            target  : 'body',
            modal   : true
        }, settings);
        
        tbc.self(this, arguments)
        .extend([tbc.Panel, options], {
            initDialog : function() {
                
                var dialog = this,
                    viewer = $('<div style="overflow:auto;"></div>'),
                    buttons,
                    mask,
                    btns = [],
                    text
                    ;
                
                viewer.append(html||options.html);
                this.append(viewer);
                
                // 按钮
                if (options.buttons instanceof Object) {
                    for (text in options.buttons) {
                        if (options.buttons.hasOwnProperty(text)) {
                            btns.push('<button class="tbc-button" data-type="'+ text +'">'+ text +'</button>');
                        }
                    }
                    
                    if (btns.length>0) {
                        buttons = $('<div style="text-align:right; padding:10px; background-color:#f6f6f6;"></div>');
                        buttons.html(btns.join(''));
                    }
                    
                    // 按钮点击
                    buttons.on('click', 'button', function() {
                        var type = this.getAttribute('data-type'),
                            func = options.buttons[type];
                        if ($.isFunction(func)) {
                            func.call(dialog);
                        }
                    });
                    
                    this.container.css({overflow:'hidden'});
                    this.append(buttons);
                }
                
                // 设置dialog的内容容器
                this.container = viewer;
                this.show();
                this.initModal();
                
                this.addEvent({
                    'close' : function() {
                        var mask = this.mask;
                        
                        if (mask && $.isFunction(mask.fadeOut)) {
                            mask.fadeOut(function() { mask.remove(); });
                        }
                    },
                    'resize': function(size) {
                        var hei,
                            headHei = this.part.header.height(),
                            footHei = this.part.footer.height();
                        
                        if (buttons && $.isFunction(buttons.height)) {
                            hei = size.height - headHei - footHei - buttons.outerHeight();
                        } else {
                            hei = '100%';
                        }
                        
                        viewer.height(hei);
                    }
                });
                
                return this;
            },
            
            initModal : function() {
                var dialog = this;
                
                // 如果是模态对话框
                if (options.modal) {
                    this.mask = $('<div class="tbc-mask"/>').css({
                        position : 'absolute',
                        zIndex   : (this.ui.css('zIndex')||1)-1,
                        backgroundColor : '#000',
                        opacity : 0.2,
                        left    : 0,
                        top     : 0,
                        width   : '100%',
                        height  : '100%'
                    })
                    .insertBefore(this.ui)
                    .bind('click', function() {
                        dialog.flash();
                    });
                }
            }
            
        })
        .initDialog()
        .triggerEvent('resize', options)
        ;
        
        return this;
    };
    
    /**
     * @method tbc.confirm
     * @for tbc
     * @depands tbc.dialog
     
     * @param {String} msg 消息内容
     * @param {Function} callback 回调方法
     * @param {Object} [settings] 弹出框的配置信息
     
     * @copyright 时代光华
     * @author 罗志华
     * @mail mail#luozhihua.com
     * 
     */
    tbc.confirm = function(msg, callback, settings) {
        
        
        var buttons = {};
        
        settings = settings instanceof Object ? settings : {};
        
        buttons[settings.verifyText||'确认'] = function() {
            if ($.isFunction(callback)) {
                callback.call(this);
            }
            this.close();
        };
        
        buttons[settings.cancelText||'取消'] = function() {
            this.close();
        };
        
        settings.buttons = buttons;
        settings.name = settings.name || settings.title || '请您确认';
        msg = $('<div style="padding:24px;"></div>').empty().append(msg);
        
        return tbc.dialog(msg, settings);
    };
    
    /**
     * @method tbc.alert
     * @for tbc
     * @depands tbc.dialog
     
     * @param {String} msg 显示的消息
     * @param {Function} [callback] 回调函数
     * @param {Object} [settings] 弹出框配置
     
     * @copyright 时代光华
     * @author 罗志华
     * @mail mail#luozhihua.com
     * 
     */
    tbc.alert = function(msg, callback, settings) {
        var buttons = {};
        
        settings = settings instanceof Object ? settings : {};
        
        buttons[settings.verifyText||'确认'] = function() {
            if ($.isFunction(callback)) {
                callback.call(this);
            }
            this.close();
        };
        
        settings.buttons = buttons;
        settings.name = settings.name || settings.title || '提示';
        msg = $('<div style="padding:24px;"></div>').append(msg);
        
        return tbc.dialog(msg, settings);
    };
    
}(window.tbc, window.jQuery, window.URLS));

/*
 * @Class:  tb.Button (按钮) ########################################## 
 * 
 * @Copyright    : 时代光华
 * @Author        : 罗志华
 * @mail         : mail@luozhihua.com
 */

tbc.Button = function(settings) {
    var SELF = tbc.self(this, arguments);
    SELF.extend(tbc.Event);
    SELF.extend(tbc.ClassManager);
    SELF.packageName = "tbc.Button";
    
    var defaults = {
          border : true
        , icon     : null
        , text     : "按钮"
        , click     : null
        , target : null
    },
    options = tbc.extend({}, defaults, settings)
    ;
    
    /**
    SELF.ui = $('<a href="#" class="">\
        <span class="tbc-icon icon-application_windows_add"><img src="" onerror="this.style.display=\'none\'" style="width:16px; height:16px;"/></span>\
        <span class="tbc-button-text"></span>\
    </a>')
    .addClass(options.border?"tbc-button":"tbc-button-link");
    /**/
    
    SELF.ui = $('<button class="">\
        <span class="tbc-icon icon-application_windows_add"><img src="" onerror="this.style.display=\'none\'" style="width:16px; height:16px;"/></span>\
        <span class="tbc-button-text"></span>\
    </button>')
    .addClass(options.border?"tbc-button":"tbc-button-link");
    
    
    var icon = SELF.ui.find("img"),
        text = SELF.ui.find(".tbc-button-text");
    
    // 设置或获取按钮图标
    SELF.icon = function(_icon) {
        if (_icon && typeof(_icon) === "string") {
            
            if (_icon.match(/\.(jpg|jpeg|gif|png|img|bmp|ico)$/) || _icon.indexOf("sf-server/file/getFile/") !== -1) {
                icon.show().attr("src", _icon)
                .parent().removeAttr("class").addClass("tbc-icon");
            }else{
                icon.hide()
                .parent().removeAttr("class")
                .addClass("tbc-icon")
                .addClass(_icon);
            }
            
            return SELF;
        }else{
            return options.icon;
        }
    }
    
    // 设置或获取按钮文字
    SELF.text = function(_text) {
        if (_text && typeof(_text) === "string") {
            text.html(_text);
            options.text = _text;
            return SELF;
        }else{
            return options.text;
        }
    }
    
    // 禁用
    SELF.disable = function() {
        SELF.disabled = true;
        SELF.ui.addClass("tbc-button-disabled");
        SELF.triggerEvent("disable");
        return SELF;
    }
    
    // 启用
    SELF.enable = function() {
        SELF.disabled = false;
        SELF.ui.removeClass("tbc-button-disabled");
        SELF.triggerEvent("enable");
        return SELF;
    }
    
    // 点击
    SELF.click = function() {
        if (!SELF.disabled) {
            $.isFunction(options.click) && options.click.call(SELF);
            SELF.triggerEvent("click");
        }
        return SELF;
    }
    
    // 加入到目标节点
    SELF.appendTo = function(target) {
        target = target&&target.container ? target.container : target;
        SELF.ui.appendTo(target);
        SELF.triggerEvent("append", target);
        return SELF;
    }
    
    // 移除
    SELF.remove = function() {
        SELF.ui.remove();
        SELF.triggerEvent("remove");
    }
    
    
    SELF.icon(options.icon);
    SELF.text(options.text);
    SELF.appendTo(options.target);
    SELF.ui.click(function() { SELF.click(); });
    
}
 

/*
 * 综合选择器
 */
;(function(tbc, $){
    
    "use strict";
    
    $("html,body").css({ overflow:"hidden", background:"transparent" });
    tbc.blendSelector = function (settings) {
        
        var SELF = tbc.self (this, arguments),
        defaults = {
            max            : 0,
            title        : "选择人员",
            verifyButton: true,
            cancelButton: true,
            verifyText    : "确定",
            cancelText    : "取消"
        },
        options = tbc.extend({}, defaults, settings);
        
        // 注册事件
        SELF.addEvent(options.event);
        
        SELF.packageName = "tbc.blendSelector";
        SELF.ui = $('<div class="tbc-blendSelector"></div>').html(
            '<div role="header" class="tbc-blendSelector-header"><h3>请选择人员</h3><span role="tips"><i class="tbc-icon icon-info"></i>友情提醒:转入”已选人员“的名单即时生效,系统自动保存</span> </div>' +
            '<div role="org" class="tbc-blendSelector-organize"></div>' +
            '<div role="items" class="tbc-blendSelector-items"></div>' +
            '<div style="clear:both;"></div>' +
            '<div role="footer" class="tbc-blendSelector-footer">' +
            '    <a role="verify" class="tbc-button tbc-button-blue" type="button"><span class="tbc-text">'+ (options.verifyText||"确定") +'</span></a>' +
            '    <a role="cancel" class="tbc-button tbc-button-blue" type="button"><span class="tbc-text">'+ (options.cancelText||"取消") +'</span></a>' +
            '</div>');
        
        SELF.container = SELF.ui;
        SELF.part = {};
        SELF.ui.find("[role]").each(function() {
            var role = this.getAttribute("role");
            SELF.part[role] = $(this);
        });
        
        options.itemSelectorOptions = $.extend({}, options.itemSelectorOptions, {
            vauleSetFormater : function (vals) {
                var val = {},
                    k;
                
                for (k in vals) {
                    if (vals.hasOwnProperty(k)) {
                        switch (k) {
                            case "nm":
                            case "text": 
                                val["nm"] = vals["nm"]||vals["text"];
                                val["text"] = vals["nm"]||vals["text"];
                                break;
                            case "selected":
                                val[k] = (vals[k] || this._cache.selected.names[vals.id]) ? " checked" : "";
                                break;
                            case "rnm":
                                val[k] = vals[k] ? " ("+vals[k]+")" : "";
                                break;
                            case "icn":
                                val[k] = vals[k] ?  " ("+vals[k]+")" : ""
                                break;
                            default:
                                val[k] = vals[k];
                        }
                    }
                }
                
                val["selected"] = (vals["selected"] || this._cache.selected.names[vals.id]) ? " checked" : "";
                
                try { return val; } finally { val=null; }
            }
        });

        options.orgSelectorOptions = $.extend(options.orgSelectorOptions||{}, {height:365});

        var itemSelector    = new tbc.itemSelector(options.itemSelectorOptions),
            accSelector        = new tbc.accordionSelector (options.orgSelectorOptions);
        
        itemSelector.prepend('<div class="tbc-itemSelector-header">' +
                    '    <div class="padding">' +
                    '        <select name="accountStatus">' +
                    '            <option value="ALL" selected="selected">全部人员</option>' +
                    '            <option value="ENABLE">激活人员</option>' +
                    '            <option value="FORBIDDEN">冻结人员</option>' +
                    '        </select>' +
                    '        <div class="abs_right">' +
                    '            <input type="text" value="工号/姓名/用户名" title="工号/姓名/用户名" class="tbc-inputer searchKeywords">' +
                    '            <select name="which">' +
                    '                <option value="0">待选人员</option>' +
                    '                <option value="1">已选人员</option>' +
                    '            </select>' +
                    '            <a class="tbc-button searchButton" type="button">筛选</a>' +
                    '        </div>' +
                    '     </div>' +
                    '</div>');
        
        // 隐藏提示
        if (options.itemSelectorOptions.autoSave===false || options.itemSelectorOptions.lazy===true) {
            SELF.part.tips.hide();
        }
        
        itemSelector.addEvent({
            "beforeSave": function() { tbc.lock(SELF.ui); return false; },
            "afterSave"    : function() { tbc.unlock(SELF.ui); return false; }
        });
        
        // 选择用户状态
        itemSelector.ui.find("select[name='accountStatus']")
        .val(options.accountStatus)
        .change(function() {
            itemSelector._ajaxDataAvailable.accountStatus=this.value;
            itemSelector._ajaxDataSelected.accountStatus=this.value;
            itemSelector.pageAvailable();
        });
        
        if (options.accountStatus) {
            itemSelector._ajaxDataAvailable.accountStatus=options.accountStatus;
            itemSelector._ajaxDataSelected.accountStatus=options.accountStatus;
        }
    
        if (options.accountStatus || (options.accountStatus && options.accountStatus.toLowerCase() !== "all")) {
            itemSelector.ui.find("select[name='accountStatus']").hide();
        }
        
        // 关键词
        itemSelector.ui.find(".searchKeywords").keyup(function(event) {
            var value = $.trim(this.value);
            if ( value !== this.title) {
                itemSelector._ajaxDataAvailable.keyword = value;
                itemSelector._ajaxDataSelected.keyword = value;
            }
            if (event.keyCode === 13) {
                itemSelector.ui.find(".searchButton").trigger('click');
            }
        }).focus(function() {
            var value = $.trim(this.value);
            if ( value === this.title) {
                this.value = "";
            }
        }).blur(function() {
            var value = $.trim(this.value);
            if (value === "") {
                this.value = this.title;
            }
        });
        
        function search_item (which, keyword) {
            var txtinp = itemSelector.ui.find(".searchKeywords");
            
            
            if (!keyword || keyword.length === 0 || keyword === txtinp[0].title) {
                itemSelector._ajaxDataAvailable.keyword = "";
                itemSelector._ajaxDataSelected.keyword = "";
            } else {
                if (which === "0") {
                    itemSelector._ajaxDataAvailable.keyword = keyword;
                    itemSelector._ajaxDataSelected.keyword = "";
                } else if (which === "1" && options.itemSelectorOptions.autoSave !== false && options.itemSelectorOptions.lazy !== true) {
                    itemSelector._ajaxDataAvailable.keyword = "";
                    itemSelector._ajaxDataSelected.keyword = keyword;
                }
            }
            
            itemSelector.pageSelected(1);
            itemSelector.pageAvailable(1);
        }
        
        // 切换待选或已选
        itemSelector.ui.find("select[name='which']").change(function() {
            var which = this.value,
                keyword = itemSelector.ui.find(".searchKeywords").val();
            
            search_item(which, keyword);
        });
        
        // 搜索按钮
        itemSelector.ui.find(".searchButton").click(function(event) {
            event.preventDefault();
            var which = itemSelector.ui.find("select[name='which']").val(),
                keyword = itemSelector.ui.find(".searchKeywords").val();
            
            search_item(which, keyword);
        });
        
        // 隐藏移除全部按钮
        if (options.itemSelectorOptions.deletable === false) {
            $(itemSelector.part.removeAll).hide();
            $(itemSelector.part.operaRemoveSelected).attr("disabled", "disabled").addClass("tbc-button-disabled");
            $(itemSelector.part.operaRemoveCurrPage).attr("disabled", "disabled").addClass("tbc-button-disabled");
        }
    
        // 依赖
        itemSelector.depend(SELF);
        accSelector.depend(SELF);
        
        // 
        itemSelector.appendTo(SELF.part.items);
        accSelector.appendTo(SELF.part.org);
        
        accSelector.addEvent({
            "select" : function (selectedNode, b, c) {
                itemSelector._ajaxDataAvailable.nodeType=b
                itemSelector._ajaxDataAvailable.nodeId=selectedNode.id
                itemSelector.pageAvailable(1);
            },
            "includechild" : function (include) {
                itemSelector._ajaxDataAvailable.includeChild = include;
            }
        });
        
        SELF.extend({
            append : function(child) {
                this.container.append(child);
            },
            
            prepend : function(child) {
                this.container.prepend(child);
            },
            
            appendTo : function(box) {
                this.ui.appendTo(box);
            },
            
            prependTo : function(box) {
                this.ui.prependTo(box);
            },
            
            close : function() {
                SELF.triggerEvent("close");
                this.DESTROY();
            }, 
            
            getSelected : function() {
                var s = itemSelector._cache.selected.names,
                    a = [],
                    k;
                for (k in s) {
                    if (s.hasOwnProperty(k)) {
                        a.push(s[k]);
                    }
                }
                return a;
            }
        });
        
        if (!options.verifyButton) SELF.part.verify.hide();
        if (!options.cancelButton) SELF.part.cancel.hide();
        
        // 确认按钮
        SELF.part.verify.click(function() {
            var selected = SELF.getSelected(),
                autoSave = options.itemSelectorOptions.autoSave,
                lazy    = options.itemSelectorOptions.lazy,
                list    = [];
            if ((typeof autoSave === "undefined"||autoSave===true) && lazy===true && options.lazyUrl) {
                $.each(selected, function() {
                    list.push(this.userId);
                });
                
                var data = options.itemSelectorOptions.post || {};
                    data[options.itemSelectorOptions.postKey||"userIds"] =  list.join(",");
                
                $.ajax({
                    url        : options.lazyUrl,
                    data    : data,
                    type    : "post",
                    dataType: "json",
                    beforeSend: function() {
                        tbc.lock(SELF.ui);
                    },
                    complete: function() {
                        tbc.unlock(SELF.ui);
                    },
                    success : function() {
                        if (SELF.triggerEvent("verify", selected) !== false) {
                            SELF.ui.remove();
                            SELF.close();
                        }
                    }
                });
                data = null;
                
            } else if (SELF.triggerEvent("verify", selected) !== false) {
                SELF.ui.remove();
                SELF.close();
            }
        });
        
        // 取消按钮
        SELF.part.cancel.click(function() {
            var selected = SELF.getSelected();
            if (SELF.triggerEvent("cancel", selected) !== false) {
                SELF.ui.remove();
                SELF.close();
            }
        });
    };
}(tbc, jQuery));

// JavaScript Document organizationSelector
;(function($, tbc) {

    "use strict";

    $("html,body").css({ overflow: "hidden", background: "transparent" });
    tbc.CourseSelector = function (settings) {

        var  defaults = {
                selectButtons : function() {

                }
            },
            options = tbc.extend({}, defaults, settings),
            itemSelector,
            accSelector,
            dt,
            SELF = tbc.self(this, arguments);

        // 注册事件
        SELF.addEvent(options.event);

        SELF.packageName = "tbc.CourseSelector";
        SELF.ui = $('<div class="tbc-blendSelector tbc-courseSelector"></div>').html(
                '<div role="header" class="tbc-blendSelector-header"><h3>请选择资源</h3><span role="tips"><i class="tbc-icon icon-info"></i>友情提醒:转入”已选“栏的选项即时生效,系统自动保存</span> </div>' +
                '<div role="org" class="tbc-blendSelector-organize"></div>' +
                '<div role="items" class="tbc-blendSelector-items"></div>' +
                '<div style="clear:both;"></div>' +
                '<div role="footer" class="tbc-blendSelector-footer">' +
                '    <a role="verify" class="tbc-button tbc-button-blue" type="button"><span class="tbc-text">'+ (options.verifyText || "确定") +'</span></a>' +
                '    <a role="cancel" class="tbc-button tbc-button-blue" type="button"><span class="tbc-text">'+ (options.cancelText || "取消") +'</span></a>' +
                '</div>');

        SELF.container = SELF.ui;
        SELF.part = {};
        SELF.ui.find("[role]").each(function() {
            var role = this.getAttribute("role");
            SELF.part[role] = $(this);
        });

        // 隐藏提示
        if (options.itemSelectorOptions.autoSave===false || options.itemSelectorOptions.lazy===true) {
            SELF.part.tips.hide();
        }

        // 项目选择器
        options.itemSelectorOptions = $.extend({}, options.itemSelectorOptions, {isOrganize        : true,

            textTransform : {
                "COURSE"  : "[课] ",
                "SUBJECT" : "[专题] "
            },
            post : options.post,
            itemTemplate : '<li data-id="{id}" title="{title}" class="{selected} {checked}"><i>{title}</i></li>',
            dataTemplate : {id:"id",text:"title",title:"title"},
            itemTemplateSelected : '<li data-id="{id}" title="{title}"><i>{type}{title}</i></li>',
            vauleSetFormater : function (vals) {

                var nodeType = accSelector.getCurrent().container.data("options").nodeType,
                    val = {},
                    k;

                for (k in vals) {
                    if (vals.hasOwnProperty(k)) {
                        switch (k) {
                            case "type":
                                val.type = vals.type || "COURSE";
                                break;

                            case "nm":
                            case "text":
                            case "title":
                                val.nm = vals.nm || vals.text || vals.title;
                                val.text = vals.nm || vals.text || vals.title;
                                val.title = vals.nm || vals.text || vals.title;
                                break;

                            case "selected":
                                val[k] = (vals[k] || this._cache.selected.names[vals.id]) ? " checked" : "";
                                break;
                            default:
                                val[k] = vals[k];
                        }
                    }
                }
                try { return val; } finally { val=null; }
            },

            // 格式化保存结果
            postFormater    : function(items) {
                var ids = [],
                    type,
                    i, len;
                for (i=0,len=items.length; i<len; i+=1) {
                    type = items[i].tp || "COURSE";
                    ids.push([type, items[i].id].join(":"));
                }
                return ids.join(",");
            },

            //
            itemDataFormater : function(items) {
                var nodeType = accSelector.getCurrent().container.data("options").nodeType,
                    node     = accSelector.getSelected() || {},
                    i, len;

                for (i=0,len=items.length; i<len; i+=1) {
                    switch (items[i].tp||nodeType) {

                        case "SUBJECT" :
                            items[i].tp = items[i].type||"SUBJECT";
                            items[i].nm = items[i].title;
                            delete items[i].rid;
                            delete items[i].rnm;
                        break;

                        //case "COURSE" :
                        default:
                            items[i].tp = items[i].type||"COURSE";
                            items[i].nm = items[i].title;
                        break;
                    }
                }

                return items;
            }
        });

        // 
        options.orgSelectorOptions = $.extend({}, options.orgSelectorOptions, {
            autoSelect : false // 自动选中某个节点
        });
        
        dt = options.itemSelectorOptions.dataTemplate;
        
        options.orgSelectorOptions = $.extend(options.orgSelectorOptions||{}, {height:365});
        itemSelector = new tbc.itemSelector(options.itemSelectorOptions);
        accSelector  = new tbc.accordionSelector (options.orgSelectorOptions);
        
        itemSelector.prepend('<div class="tbc-itemSelector-header">' +
                        '<div class="padding">' +
                        '   <div class="abs_right">' +
                        '        <input type="text" value="输入课程编号或名称" title="输入课程编号或名称" class="tbc-inputer searchKeywords">' +
                        '        <select name="device" style="display:'+ (options.itemSelectorOptions.device!==false?'':'none') +';">' +
                        '            <option value="">全部终端</option>' +
                        '            <option value="COMPUTER">PC</option>' +
                        '            <option value="IPHONE">iPhone</option>' +
                        '            <option value="IPAD">iPad</option>' +
                        '            <option value="ANDROIDPHONE">Android</option>' +
                        '            <option value="ANDROIDPAD">Android Pad</option>' +
                        '        </select>' +
                        '        <a class="tbc-button searchButton" type="button">筛选</a>' +
                        '    </div>' +
                        '</div>' +
                    '</div>');

        itemSelector.addEvent({
            "beforeSave" : function() { tbc.lock(SELF.ui); return false; },
            "afterSave"  : function() { tbc.unlock(SELF.ui); return false; }
        });

        // 筛选按钮
        itemSelector.ui.on('click', '.searchButton', function(event){
            var kwdInput = itemSelector.ui.find('input.searchKeywords'),
                keyword  = kwdInput.val(),
                device   = itemSelector.ui.find("select[name='device']").val();
                
            // 如果是默认值则删除关键字属性
            if ($.trim(keyword) !== kwdInput.attr('title')) {
                itemSelector._ajaxDataAvailable.keyword = keyword;
            } else {
                delete itemSelector._ajaxDataAvailable.keyword;
            }
            
            // 如果是不过滤适用设备, 则删除关键字属性
            if (options.itemSelectorOptions.device!==false) {
                itemSelector._ajaxDataAvailable.device = device;
            } else {
                delete itemSelector._ajaxDataAvailable.device;
            }
            
            itemSelector.pageAvailable(1);
        });
        
        itemSelector.ui.find("input.searchKeywords").bind({
            focus : function(event) {
                if ($.trim(this.value) === this.title) {
                    this.value = "";
                }
            },
            
            blur : function(event) {
                 if ($.trim(this.value)==="") {
                     this.value = this.title;
                 }
            }
        });
        
        SELF.extend({
            appendTo : function (box) {
                
            }
        });

        // 依赖
        itemSelector.depend(SELF);
        accSelector.depend(SELF);
        
        // 隐藏itemSelector的功能
        //$(itemSelector.part.operaAddCurrPage).hide();
        //$(itemSelector.part.operaRemoveCurrPage).hide();
        //$(itemSelector.part.operaRemoveCurrPage).hide();
        $(itemSelector.part.addAll).hide();
        
        
        if (options.itemSelectorOptions.deletable===false) {
            $(itemSelector.part.removeAll).hide();
            $(itemSelector.part.operaRemoveSelected).attr("disabled", "disabled").addClass("tbc-button-disabled");
            $(itemSelector.part.operaRemoveCurrPage).attr("disabled", "disabled").addClass("tbc-button-disabled");
        }
        
        // 
        itemSelector.appendTo(SELF.part.items);
        itemSelector.loadAvailableByPage(1);
        
        accSelector.appendTo(SELF.part.org);
        
        accSelector.addEvent({
            "afterLoad" : function(itm) {
                var opt = itm.container.data("options"),
                    treeId = itm.container.data("treeId"),
                    tree   = tbc.TASKS(treeId);
                
                if (tree && typeof tree.setCurrent === 'function') {
                    tree.setCurrent();
                }
                    
            },
            "active"    : function(itm) {
                var opt = itm.container.data("options"),
                    treeId = itm.container.data("treeId"),
                    tree   = tbc.TASKS(treeId);
                    
                if (tree && typeof tree.setCurrent === 'function') {
                    tree.setCurrent();
                }
            },
            
            'check' : function (list) {
                var nodeType = this.getCurrent().container.data("options").nodeType,
                    i, len,
                    icn, pro, data;
                    
                for (i=0,len=list.length; i<len; i+=1) {
                    icn  = accSelector.includeChild ? "含子类" : "";
                    pro  = list[i].property;
                    data = [{ id:pro.id, tp:pro.tp, nm:pro.nm||pro.text, ic:accSelector.includeChild, icn:icn, rnm:"" }];
                    
                    if (pro.id && !itemSelector._cache.available.names[pro.id]) {
                        itemSelector.addAvailableItem(data);
                    }
                }
            },
            
            'deselect' : function (list) {
                var i, len;
                for (i=0,len=list.length; i<len; i+=1) {
                    itemSelector.removeAvailableItem (list[i].property.id);
                }
            },
            
            "select" : function (selectedNode, b, c) {
                itemSelector._ajaxDataAvailable.nodeType=b;
                itemSelector._ajaxDataAvailable.nodeId=selectedNode.id;
                
                itemSelector.loadAvailableByPage(1);
            },

            "includechild" : function(include) {
                itemSelector._ajaxDataAvailable.includeChild = include;
            }
        });
        
        itemSelector.addEvent({
            "select"    : function (list) {
                var accItm = accSelector.getCurrent(),
                    opt    = accItm.container.data("options");
            },
            
            "beforeAvailableLoad" : function() {
                var accItm = accSelector.getCurrent(),
                    opt    = accItm.container.data("options");
            }
        });
        
        SELF.extend({
            append : function(child) {
                this.container.append(child);
            },
            
            prepend : function(child) {
                this.container.prepend(child);
            },
            
            appendTo : function(box) {
                this.ui.appendTo(box);
            },
            
            prependTo : function(box) {
                this.ui.prependTo(box);
            },
            
            close : function() {
                SELF.triggerEvent("close");
                this.DESTROY();
            }, 
            
            getSelected : function() {
                var s = itemSelector._cache.selected.names,
                    a = [],
                    k;
                for (k in s) {
                    if (s.hasOwnProperty(k) && s[k]) {
                        a.push(s[k]);
                    }
                }
                return a;
            }
        });
        
        if (!options.verifyButton) {
            SELF.part.verify.hide();
        }
        
        if (!options.cancelButton) {
            SELF.part.cancel.hide();
        }
        
        // 确认按钮
        SELF.part.verify.click(function() {
            var selected = SELF.getSelected(),
                autoSave = options.itemSelectorOptions.autoSave,
                lazy    = options.itemSelectorOptions.lazy,
                data;
            
            if ((autoSave !== false) && lazy===true && options.lazyUrl) {
                data = options.itemSelectorOptions.post || {};
                data[options.itemSelectorOptions.postKey||"courseIds"] =  options.itemSelectorOptions.postFormater(selected);
                
                $.ajax({
                    url  : options.lazyUrl,
                    data : data,
                    type : "post",
                    dataType  : "json",
                    beforeSend: function() { tbc.lock(SELF.ui); },
                    complete  : function() { tbc.unlock(SELF.ui); },
                    success   : function() {
                        if (SELF.triggerEvent("verify", selected) !== false) {
                            SELF.ui.remove();
                            SELF.close();
                        }
                    }
                });
                
                data = null;
                
            } else if (SELF.triggerEvent("verify", selected) !== false) {
                SELF.ui.remove();
                SELF.close();
            }
        });
        
        // 取消按钮
        SELF.part.cancel.click(function() {
            var selected = SELF.getSelected();
            if (SELF.triggerEvent("cancel", selected) !== false) {
                SELF.ui.remove();
                SELF.close();
            }
        });
    };
    
}(jQuery,tbc));

// JavaScript Document organizationSelector
;
$("html,body").css({ overflow:"hidden", background:"transparent" });
tbc.organizationSelector = function (settings) {
	
	var SELF = tbc.self(this, arguments),
	
	defaults = {
		
	},
	options = tbc.extend({}, defaults, settings);
	
	// 注册事件
	SELF.addEvent(options.event);
	
	SELF.packageName = "tbc.organizationSelector";
	SELF.ui = $('<div class="tbc-blendSelector tbc-organizationSelector"></div>').html(''+
		'<div role="header" class="tbc-blendSelector-header"><h3>请选择组织</h3><span role="tips"><i class="tbc-icon icon-info"></i>友情提醒:转入”已选“栏的选项即时生效,系统自动保存</span> </div>\
		<div role="org" class="tbc-blendSelector-organize"></div>\
		<div role="items" class="tbc-blendSelector-items"></div>\
		<div style="clear:both;"></div>\
		<div role="footer" class="tbc-blendSelector-footer">\
			<a role="verify" class="tbc-button tbc-button-blue" type="button"><span class="tbc-text">'+ (options.verifyText||"确定") +'</span></a>\
			<a role="cancel" class="tbc-button tbc-button-blue" type="button"><span class="tbc-text">'+ (options.cancelText||"取消") +'</span></a>\
		</div>\
	');
	SELF.container = SELF.ui;
	SELF.part = {};
	SELF.ui.find("[role]").each(function() {
		var role = this.getAttribute("role");
		SELF.part[role] = $(this);
	});
	
	// 隐藏提示
	if (options.itemSelectorOptions.autoSave===false || options.itemSelectorOptions.lazy===true) {
		SELF.part.tips.hide();
	}
	
	// 项目选择器
	options.itemSelectorOptions = $.extend({}, options.itemSelectorOptions, {
		isOrganize		: true,
		
		textTransform	: {
			"ORGANIZATION"		: "[部] ",
			"POSITION"			: "[岗] ",
			"POSITION_CATEGORY"	: " ",
			"GROUP"				: "[群] ",
			"GROUP_CATEGORY"	: " "
		},
		post : options.post,
		
		itemTemplate	: '<li data-id="{id}" title="{np}"><i>{nm}</i></li>',
		itemTemplateSelected	: '<li data-id="{id}" title="{np}"><i>{tp}{nm}{parentheses1}{rnm}{icn}{parentheses2}</i></li>',
		dataTemplate	: {id:"id",text:"nm",title:"np"},
		
		vauleSetFormater : function (vals) {
			
			var nodeType = accSelector.getCurrent().container.data("options").nodeType,
				val = {};
			for (var k in vals) {
				switch (k) {
					case "nm":
					case "text": 
						val["nm"] = vals["nm"]||vals["text"];
						val["text"] = vals["nm"]||vals["text"];
						break;
					case "selected":
						val[k] = (vals[k] || this._cache.selected.names[vals.id]) ? " checked" : "";
						break;
					case "rnm":
						val[k] = vals[k] ? vals[k] : "";
						break;
					case "icn":
						val[k] = vals[k] ?  vals[k] : ""
						break;
					default:
						val[k] = vals[k];
				}
			}
			try { return val; } finally { val=null; }
		},
		
		// 格式化保存结果
		postFormater	: function(items) {
			var ids = [];
			for (var i=0,len=items.length; i<len; i++) {
				ids.push([ items[i]["ic"], items[i][dt["id"]], items[i]["tp"]||"ORGANIZATION", items[i]["rid"] ].join(":"));
			}
			return ids.join(",");
		},
		
		//
		itemDataFormater : function(items) {
			var nodeType	= accSelector.getCurrent().container.data("options").nodeType,
				node		= accSelector.getSelected() || {};
			
			for (var i=0,len=items.length; i<len; i++) {
				switch (items[i].tp||nodeType) {
					case "POSITION" : 
						items[i].rnm = items[i].rnm||node.nm||node.text;
						items[i].rid = items[i].rid||node.id;
						items[i].tp = items[i].tp||"POSITION";
						if (items[i].rnm) {
							items[i].parentheses1=" (";
							items[i].parentheses2=")";
						}
						items[i].ic = accSelector.includeChild;
						if (items[i].ic) {
							items[i].parentheses1=" (";
							items[i].parentheses2=")";
						}
					break;
					
					case "ORGANIZATION" :
						items[i].tp = items[i].tp || "ORGANIZATION";
						delete items[i].rid;
						delete items[i].rnm;
						if (items[i].ic) {
							items[i].parentheses1=" (";
							items[i].parentheses2=")";
						}
					break;
					
					case "GROUP" : 
					break;
				}
			}
			
			return items;
		}
	});
	
	// 
	options.orgSelectorOptions = $.extend({}, options.orgSelectorOptions, {
		  autoSelect : false // 自动选中某个节点
		, height : 365
	});
	
	var dt = options.itemSelectorOptions.dataTemplate;
	
	var itemSelector	= new tbc.itemSelector(options.itemSelectorOptions),
		accSelector		= new tbc.accordionSelector (options.orgSelectorOptions);
	
	itemSelector.addEvent({
		"beforeSave": function() { tbc.lock(SELF.ui); return false; },
		"afterSave"	: function() { tbc.unlock(SELF.ui); return false; }
	});
	
	SELF.extend({
		appendTo : function (box) {
			
		}
	});
	// 依赖
	itemSelector.depend(SELF);
	accSelector.depend(SELF);
	
	
	// 隐藏itemSelector的功能
	$(itemSelector.part.operaAddCurrPage).hide();
	$(itemSelector.part.operaRemoveCurrPage).hide();
	$(itemSelector.part.operaRemoveCurrPage).hide();
	$(itemSelector.part.addAll).hide();
	
	$(itemSelector.part.availContainer).parent().hide();
	$(itemSelector.part.selectedContainer).parent().css({width:410});
	
	if (options.itemSelectorOptions.deletable===false) {
		$(itemSelector.part.removeAll).hide();
		$(itemSelector.part.operaRemoveSelected).attr("disabled", "disabled").addClass("tbc-button-disabled");
		$(itemSelector.part.operaRemoveCurrPage).attr("disabled", "disabled").addClass("tbc-button-disabled");
	}
	
	// 
	itemSelector.appendTo(SELF.part.items);
	itemSelector.loadAvailableByPage(1);
	
	accSelector.appendTo(SELF.part.org);
	
	accSelector.addEvent({
		"afterLoad" : function(itm) {
			var opt = itm.container.data("options");
			if (opt.nodeType === "POSITION") {
				var treeId = itm.container.data("treeId"),
					tree   = tbc.TASKS(treeId);
				tree && tree.setCurrent();
			}
		},
		"active"	: function(itm) {
			var opt = itm.container.data("options");
			if (opt.nodeType === "POSITION") {
				var sltBox = $(itemSelector.part.selectedContainer).parent(),
					width  = sltBox.outerWidth();
				$(itemSelector.part.selectedContainer).parent().css({width:203});
				sltBox.css({width:203}).show();
				$(itemSelector.part.availContainer).parent().show();
				
			} else {
				var avlBox = $(itemSelector.part.availContainer).parent();
				avlBox.hide();
				
				avlBox.find("li.selected").removeClass("selected");
				$(itemSelector.part.selectedContainer).parent().css({width:418});
			}
			
			if (opt.nodeType === "POSITION") {
				var treeId = itm.container.data("treeId"),
					tree   = tbc.TASKS(treeId);
				tree && tree.setCurrent();
			}
			itemSelector.clearAvailable();
		},
		
		'check' : function (list) {
			var nodeType = this.getCurrent().container.data("options").nodeType;
			for (var i=0,len=list.length; i<len; i++) {
				var icn		= accSelector.includeChild ? "含子类" : "",
					pro		= list[i].property,
					data	= [{ id:pro.id, tp:pro.tp, nm:pro.nm||pro.text, ic:accSelector.includeChild, icn:icn, rnm:"" }];
				if (pro.id && !itemSelector._cache.available.names[pro.id]) {
					itemSelector.addAvailableItem(data);
				}
			}
		},
		
		'deselect' : function (list) {
			for (var i=0,len=list.length; i<len; i++) {
				itemSelector.removeAvailableItem (list[i].property.id);
			}
		},
		
		"select" : function (selectedNode, b, c) {
			itemSelector._ajaxDataAvailable.nodeType=b;
			itemSelector._ajaxDataAvailable.nodeId=selectedNode.id;
			
			var nodeType = this.getCurrent().container.data("options").nodeType;
			
			if ( selectedNode.tp === nodeType || (!selectedNode.tp&&nodeType !== "POSITION") || nodeType === "ORGANIZATION" || (nodeType === "GROUP"&&selectedNode.tp === "GROUP")) {
				
				if (selectedNode.tp==="POSITION") {
					
					// itemSelector.loadAvailableByPage(1);
				} else {
					var icn, data;
					if (!selectedNode.tp || selectedNode.tp==="ORGANIZATION") {
						icn = accSelector.includeChild ? "含子类" : "";
						data = [{ id:selectedNode.id, tp:selectedNode.tp, nm:selectedNode.nm||selectedNode.text, ic:accSelector.includeChild, icn:icn, rnm:"" }];
					} else {
						data = [{ id:selectedNode.id, tp:selectedNode.tp, nm:selectedNode.nm||selectedNode.text, ic:accSelector.includeChild, rnm:"" }];
					}
					itemSelector.addAvailableItem(data);
				}
				
			// 如果是岗位
			} else if (nodeType === "POSITION") {
				itemSelector.loadAvailableByPage(1);
			}
		},
		"includechild" : function(include) {
			itemSelector._ajaxDataAvailable.includeChild = include;
		}
	});
	
	itemSelector.addEvent({
		"select"	: function (list) {
			var accItm	= accSelector.getCurrent(),
				opt		= accItm.container.data("options");
			
			if (opt.nodeType !== "POSITION") {
				this.clearAvailable();
			}
		},
		
		"beforeAvailableLoad" : function() {
			var accItm	= accSelector.getCurrent(),
				opt		= accItm.container.data("options");
			
			if (opt.nodeType !== "POSITION") return false;
		}
	});
	
	SELF.extend({
		append : function(child) {
			this.container.append(child);
		},
		
		prepend : function(child) {
			this.container.prepend(child);
		},
		
		appendTo : function(box) {
			this.ui.appendTo(box);
		},
		
		prependTo : function(box) {
			this.ui.prependTo(box);
		},
		
		close : function() {
			SELF.triggerEvent("close");
			this.DESTROY();
		}, 
		
		getSelected : function() {
			var s = itemSelector._cache.selected.names,
				a = [];
			for (var k in s) {
				if (k && s[k]) {
					a.push(s[k]);
				}
			}
			return a;
		}
	});
	
	if (!options.verifyButton) SELF.part.verify.hide();
	if (!options.cancelButton) SELF.part.cancel.hide();
	
	// 确认按钮
	SELF.part.verify.click(function() {
		var selected = SELF.getSelected(),
			autoSave = options.itemSelectorOptions.autoSave,
			lazy	= options.itemSelectorOptions.lazy;
		
		if ((autoSave !== false) && lazy===true && options.lazyUrl) {
			var data = options.itemSelectorOptions.post || {};
				data[options.itemSelectorOptions.postKey||"orgIds"] =  options.itemSelectorOptions.postFormater(selected);
			
			$.ajax({
				url	: options.lazyUrl,
				data	: data,
				dataType: "json",
				type	: "post",
				beforeSend: function() { tbc.lock(SELF.ui); },
				complete: function() { tbc.unlock(SELF.ui); },
				success : function() {
					if (SELF.triggerEvent("verify", selected) !== false) {
						SELF.ui.remove();
						SELF.close();
					}
				}
			});
			
			data = null;
			
		} else if (SELF.triggerEvent("verify", selected) !== false) {
			SELF.ui.remove();
			SELF.close();
		}
	});
	
	// 取消按钮
	SELF.part.cancel.click(function() {
		var selected = SELF.getSelected();
		if (SELF.triggerEvent("cancel", selected) !== false) {
			SELF.ui.remove();
			SELF.close();
		}
	});
}

/**
 * 拖动类
 * @class tbc.Drag 
 * @param {Options} setting 配置
 * @copyright 时代光华
 * @author mail@luozhihua.com
 */
;(function(tbc, $) {
    
    "use strict";
    
    tbc.Drag = function(settings) {
        
        var SELF = tbc.self(this, arguments)
        , defaults = {
              nodes : null
            , selected : null
            , window : window    // 用于在多框架或含有iframe的页面中设置鼠标感应的区域位于哪个框架内
            , document : document
            
            , handle : null
            
            , cursor : "move"   // 鼠标样式
            , circles: null // HTMLElement 限制仅在此区域类拖动;
            , circlesRound : {} //    能够超出限定区域的距离,值类别:top/right/bottom/left; 取值范围:百分数、负数、0、正整数; 
            
            , targets : null // 目标节点集;jQuery Selector/DOM/jQuery Object
            , rangeMode : "y"
            , disableInsertTargets : null // 不接受插入新节点的节点
            , timeout : 0
            , pauseTimeout : 40
        }
        , options = tbc.extend({}, defaults, settings)
        , touchable = !!document.documentElement.ontouchstart
        , circles = {}
        , handle  = $(options.handle, options.node)
        
        , mousedownPosition = {left:0, top:0} // 鼠标点击位置
        , lastPosition = {left:0, top:0} // 拖动前的位置
        , pointToNode  = {left:0, top:0} // 点击位置距离被拖动对象顶边和左边的距离
        
        , parents      = options.targets || $(options.node).parent()
        , containers   = []
        , replica      = null
        , timeout      = null
        , pauseTimeout = null
        ;
        
        SELF.packageName = "tbc.Drag";
        SELF.pointer = $('<div></div>').css({
            position:"absolute",zIndex:100, background:"#fff", height:"1px", border:"1px solid #888", borderRadius:"10px", overflow:"hidden", lineHeight:"0", opacity:0.5
        });
        
        
        // 禁用插入的节点
        $(options.disableInsertTargets).data("tbc_drag_"+SELF.guid, true);
        
        SELF.node   = null;
        SELF.replica= [];
        
        SELF.a=function() {alert(options.targets.size());};
        SELF.addContainer = function(box) {
            
            $(box).each(function() {
                containers.push(this);
            });
            options.targets = $(containers);
            
            // 鼠标点击
            $(box).delegate(options.handle, "mousedown", {}, function(event) {
                
                // 如果不是左键则返回
                if ((tbc.msie&&tbc.browserVersion<9 && event.button !== 1) || (((tbc.msie&&tbc.browserVersion>8)||!tbc.msie)&&event.button !== 0)) {
                    return false;
                }
                
                // 禁止选中文字
                $("body").disableSelect();
                
                SELF.node = $(this).parent();
                mousedownPosition.left = event.pageX;
                mousedownPosition.top  = event.pageY;
                
                SELF.init(event);
                event.disableSelectArea = true;
                return false;
            });
        };
        
        SELF.addContainer(parents);
        
        // 移除区域
        SELF.removeContainer = function(box) {
            var con = [];
            options.targets.each(function(i, c) {
                $(box).each(function() {
                    if (c  !== this) {
                        con.push(c);
                    }
                });
            });
            options.targets = $(con);
        };
        
        /*
         * 初始化拖动
         */
        SELF.init = function(event) {
            $ (document).bind({
                "mouseup.tbc_drag": function(event) { SELF.stop(event, SELF.getPositionByEvent(event)); }
            });
            
            if (options.timeout) {
                timeout = setTimeout(function() { SELF.start(event); }, options.timeout);
            } else {
                SELF.start(event);
            }
            
            return SELF;
        };
        
        /*  */
        SELF.getPositionByEvent = function(event) {
            return {left:event.pageX-pointToNode.left, top:event.pageY-pointToNode.top};
        };
        
        /*
         * 开始拖动
         */
        SELF.start = function(event) {
            var offset = SELF.node.offset(),
                bodyScrTop  = document.documentElement.scrollTop||document.body.scrollTop,
                bodyScrLeft = document.documentElement.scrollLeft||document.body.scrollLeft;
            
            SELF.triggerEvent("start", event);
            
            // 创建拖动对象的虚拟对象
            SELF.createReplica();
            
            if (options.rangeMode==="y") {
                SELF.pointer.css({width:SELF.node.width(),height:2}).appendTo("body");
            } else {
                SELF.pointer.css({width:2,height:SELF.node.height()}).appendTo("body");
            }
            
            // 点击位置距离被拖动对象顶边和左边的距离
            pointToNode = {left:event.pageX-offset.left, top:event.pageY-offset.top};
            
            $(document).bind("mousemove.tbc_drag", function(event) { SELF.move(event); });
            
            SELF.starting = true;
        };
        
        /*
         * 移动被拖动对象
         */
        SELF.move = function(event) {
            
            clearTimeout(pauseTimeout);
            pauseTimeout = setTimeout(function() {
                SELF.pause(event);
            }, options.pauseTimeout);
            
            var newPoint = SELF.getPositionByEvent(event); 
                newPoint.right = newPoint.left+1;
                newPoint.bottom = newPoint.top+1;
                
            if (SELF.replica) {
                SELF.moveReplica(newPoint);
            }
            
            SELF.triggerEvent("move", newPoint);
            return SELF;
        };
        
        // 暂停
        SELF.pause = function(event, offset) {
            
            // 遍历所有目标节点,插入临近的位置
            if (options.targets && $(options.targets).size()>0) {
                
                if ((!tbc.msie || (tbc.msie && tbc.browserVersion>7)) && SELF.starting===true) {
                    var locate = SELF.locateInsertPosition(event),
                        offset2 = locate.offset;
                    
                    if (locate.marks.size()) { 
                        SELF.pointer.show().css({
                            width    : options.rangeMode==="y" ? offset2.width : 2,
                            height    : options.rangeMode==="y" ? 2 : offset2.height,
                            left    : offset2.left,
                            top        : locate.replica.top<offset2.halfY ? offset2.top : offset2.bottom
                        });
                    } else {
                        SELF.pointer.hide();
                    }
                }
            }
            
            SELF.triggerEvent("pause", event, offset);
            return SELF;
        };
        
        /*
         * 停止(结束)拖动
         */
        SELF.stop = function(event, offset) {
            
            clearTimeout(timeout);
            clearTimeout(pauseTimeout);
            $(document).unbind(".tbc_drag");
            
            // 允许选中文字
            $("body").enableSelect();
            
            if (SELF.starting !== true) {
                return SELF;
            }
            
            var locate = SELF.locateInsertPosition(event);
            
            SELF.insertTo(locate);
            
            SELF.starting = false;
            SELF.triggerEvent("stop", event);
            
            return SELF;
        };
        
        /*
         * 创建虚拟节点
         */
        SELF.createReplica = function() {
            
            var offset = SELF.node.offset(),
                replica = [],
                nr = {
                    node : SELF.node,
                    clone : SELF.node.clone()
                          .appendTo("body")
                          .css({position:"absolute",zIndex:"100",left:offset.left, top:offset.top, opacity:0.5})
                },
                sel;
            
            replica.push(nr);
            
            if (options.selected) {
                sel = SELF.node.siblings(options.selected);
                sel.each(function(i,o) {
                    var n    = $(this),
                        off = n.offset(),
                        rot = "rotate("+tbc.random(-15,15)+"deg)",
                        rep = {
                            node  : n, 
                            clone : n.clone().appendTo("body").css({
                                position : "absolute",
                                zIndex : "99",
                                left   : off.left,
                                top    : off.top,
                                opacity: (0.5),
                                MozTransform : rot,
                                WebkitTransform : rot,
                                OTransform  : rot,
                                msTransform : rot,
                                transform   : rot
                            })
                        };
                    replica.push(rep);
                    rep.clone.animate(nr.clone.offset(), 800);
                    o = null;
                });
            }
            
            SELF.replica = replica;
            
            offset = replica = nr = null;
            
            return SELF.replica;
        };
        
        /*
         * 移动虚拟节点
         */
        SELF.moveReplica = function(offset) {
            $.each(SELF.replica, function(i, rep) {
                rep.clone.stop().css({left:offset.left, top:offset.top});
            });
            return SELF;
        };
        
        /*
         * 删除虚拟节点
         */
        SELF.deleteReplica = function() {
            
            $.each(SELF.replica, function(i, rep) {
                var off  = rep.transfer ? $(rep.transfer).offset() : $(rep.node).offset(),        
                    left = off.left,
                    top  = off.top;
                    
                rep.clone.animate({top:top, left:left, opacity:0}, 400, function() {
                    rep.clone.remove();
                    delete rep.clone;
                });
            });
            delete SELF.replica;
            return SELF;
        };
        
        SELF.isOpenFor = function(target) {
            var s=true;
            $(options.disableInsertTargets).each(function() {
                if ($(target)[0] === this) {
                    s=false;
                    return false;
                }
            });
            return s;
        };
        
        /*
         * 移动到新的位置
         */
        SELF.insertTo = function(locate) {
            if (!locate) {
                return SELF;
            }
            
            var node    = SELF.node,
                selected= node.siblings(options.selected),
                from    = {
                    node    : node,
                    selected: selected,
                    marks    : locate.marks,
                    from    : node.parent(),
                    to        : locate.transfer || locate.dropBox,
                    offset    : locate.offset
                },
                dropBox = from.to,
                ele, off, verify,
                desktop = window.desktop;
            
            $(locate.dropBox).removeClass("tbc-dragin").parent().removeClass("tbc-dragin-parent");
            
            // 如果目标对象接受拖入新节点
            if (SELF.isOpenFor(dropBox)) {
                
                // 如果位于可拖动的节点上
                if (locate.marks.size()) {
                    
                    ele = locate.marks;
                    off = locate.offset;
                    verify = SELF.triggerEvent("beforeInsert", from);
                    
                    if (verify===false) {
                        $.each(SELF.replica, function(i, rep) { SELF.replica[i].transfer = from.transfer ; });
                        if (locate.marks[0] !== node[0]) {
                            
                            //if (from.terminal) { }
                            
                            SELF.triggerEvent("afterInsert", from);
                            desktop.current().layout();
                        }
                    } else if (locate.marks[0] !== node[0]) {
                        
                        if (locate.replica.top<off.halfY) {
                            node.insertBefore(ele);
                        } else {
                            node.insertAfter(ele);
                        }
                         
                        selected.insertAfter(node);
                        desktop.current().layout();
                            
                        SELF.triggerEvent("afterInsert", from);
                    }
                    ele = off = null;
                }
                
                //  如果位于容器中
                else if (dropBox.size()) {
                    
                    if (SELF.triggerEvent("beforeInsert", from) !== false) {
                        node.appendTo(dropBox);
                        selected.insertAfter(node);
                        desktop.current().layout();
                        SELF.triggerEvent("afterInsert", from);
                    }
                }
            }
            
            SELF.pointer.remove();
            SELF.deleteReplica();
            
            node = selected = from = null;
        };
        
        
        /*
         * 定位容器
         */
        SELF.locateTarget = function(event, rep) {
            
            var overlayDropBox = [],
                dropBox    = {},
                tt = $(options.targets),
                t,r,b,l,o,i;
            
            for (i=0; i<tt.size(); i+=1) {
                o = tt[i];
                l = $(o).offset().left;
                t = $(o).offset().top;
                r = l+o.offsetWidth;
                b = t+o.offsetHeight;
                if ($(o).filter(":visible").size()>0 && tbc.isOverlap({left:l,top:t,bottom:b,right:r}, rep)) {
                    overlayDropBox.push(o);
                }
            }
            
            // 获取排列在最前面的节点
            $.each(overlayDropBox, function(i,o) {
                dropBox.self = dropBox.self||o;
                dropBox.self = $(dropBox.self).find("*").index(o) !== -1 ? o : tbc.getElementByMaxZIndex(dropBox.self, o)[0];
            });
            
            tt.not(dropBox.self)
            .removeClass("tbc-dragin")
            .trigger("dragout")
            .parent().removeClass("tbc-dragin-parent");
            
            if (dropBox.self) {
                $(dropBox.self)
                .addClass("tbc-dragin")
                .trigger("dragin", dropBox)
                .parent()
                .addClass("tbc-dragin-parent");
            }
            
            return dropBox;
        };
        
        /*
         * 定位子节点
         */
        SELF.locateInsertPosition = function(event) {
            
            var rep        = {left:event.pageX, top:event.pageY, right:event.pageX+1, bottom:event.pageY+1},
                dropBox    = SELF.locateTarget(event, rep),
                marks    = null,
                offset    = {};
            
            $(dropBox.self).children(options.node).each(function(i, o) {
                var l    = $(o).offset().left,
                    t    = $(o).offset().top,
                    w    = o.offsetWidth,
                    h    = o.offsetHeight,
                    r    = l+w,
                    b    = t+h,
                    hx    = l+(w/2),
                    hy    = t+(h/2),
                    p    = {left:l, top:t, right:r, bottom:b+10, width:w, height:h, halfX:hx, halfY:hy};
                if (tbc.isOverlap(p,  rep)) {
                    marks    = o;
                    offset    = p;
                    return false;
                }
            });
            
            return {dropBox:$(dropBox.self), transfer:dropBox.transfer, offset:offset, marks:$(marks), replica:rep};
        };
        
        /*
         * 禁用拖动功能
         */
        SELF.disable = function() {
            $(options.node).unbind(".tbc_drag");
            SELF.triggerEvent("disable");
        };
        
        /*
         * 启动拖动
         */
        SELF.enable = function(event) {
            var node = $(options.node);
            node.each(function(i, n) {
                var handle = options.handle ? $(options.handle, n) : $(this);
                if (touchable) {
                    handle.bind("touchstart.tbc_drag", function(event, data) {
                        SELF.start(event, n);
                    });
                } else {
                    handle.bind("mousedown.tbc_drag", function(event, data) {
                        SELF.start(event, n);
                    });
                }
            });
            return SELF;
        };
        
        SELF.maskDoc = function() {
            var mask = $(options.document.body).children('.tbc-drag-mask');
                mask = mask.size() !== 0 ? mask : $('<div class="tbc-drag-mask" />').appendTo(options.document.body);
            mask.show();
        };
        
        SELF.unmaskDoc = function() {
            var mask = $(options.document.body).children('.tbc-drag-mask');
            mask.hide();
        };
        
        SELF.addEvent({
            start : function() {
                this.maskDoc();
            },
            stop : function() {
                this.unmaskDoc();
            }
        });
    };

}(window.tbc, jQuery));
;(function(tbc, $){
    tbc.itemSelector = function (settings) {

        var SELF = tbc.self (this, arguments),

        defaults = {
            availableUrl   : null,// "url or JSON", 可选项
            selectedUrl    : null,            // "URL or JSON", 已选项
            selectUrl      : null,            // 保存选中的项目
            deselectUrl    : null,            // 保存移除的项目
            selectAllUrl   : null,            // 选择所有 
            deselectAllUrl : null,            // 取消所有已选的项
            itemTemplate   : null,
            itemTemplateSelected    : null,
            dataTemplate   : {id:"userId", text:"employeeCode", depict:"userName", title:""},
            htmlFormater   : null,    // function() {},  // 格式化HTML
            resultFormater : null,    // function() {}, // 格式化选择结果
            max        : 0,                // 选择数量限制
            lazy       : false,        // 延迟保存; 默认 false
            postKey    : "userIds",
            autoSave   : true,            // 自动保存
            multiple   : true,                // 多选;默认:true
            dataType   : "html",            // [html,json,xml]
            cleanable  : true,                // 清除
            resettable : true,                // 可重置
            event      : {
                selected : function (id, text) {
                    // selected = [ {id:"id", text:"text"},... ]
                },
                
                unselected : function (id, text) {
                    // selected = [ {id:"id", text:"text"},... ]
                },
                
                complete : function (selected) {
                    
                }
            }
        },
        options = tbc.extend({}, defaults, settings);
        
        options.autoSave = typeof(options.autoSave) === "undefined" ? true : options.autoSave;
        
        SELF.packageName="tbc.itemSelector";
        
        var ui = $('<div class="tbc-itemSelector '+ (!options.multiple?"tbc-itemSelector-single":"") +'"></div>')
        	.html('<div class="tbc-itemSelector-panel availableBox">' +
                '        <div class="tbc-itemSelector-title">' +
                '            <span role="availTitle">待选</span> [<i class="" role="availNum">0</i>]' +
                '            <a role="addAll" class="tbc-button tbc-itemSelector-btnAddAll" type="button">添加全部</a>' +
                '        </div>' +
                '        <div role="availContainer" class="tbc-itemSelector-list"></div>' +
                '        <div class="tbc-itemSelector-pagination">' +
                '            <div class="border">' +
                '                <select role="availPageSize" id="fromPageSize" name="fromPageSize" class="inputxt">' +
                '                    <option value="10">10</option>' +
                '                    <option value="20">20</option>' +
                '                    <option value="50">50</option>' +
                '                    <option value="100">100</option>' +
                '                    <option value="500">500</option>' +
                '                </select>' +
                '                <div class="abs_right">' +
                '                    <a  role="availPrevPage" href="javascript:void(0);" id="fromPrev" class="tbc-buttons prev"><i class="tbc-icon icon-arrow-left"></i></a>' +
                '                    <input role="availPageTyper" type="text" value="1" id="fromPageNO" name="fromPageNo" class="inputxt tbc-inputer" norender="true">' +
                '                    <i>/</i>' +
                '                    <span role="availPageTotal">1</span>' +
                '                    <a role="availNextPage" href="javascript:void(0);" class="tbc-buttons next"><i class="tbc-icon icon-arrow-right"></i></a>' +
                '                </div>' +
                '            </div>' +
                '        </div>' +
                '    </div>' +
                '    <div role="operaList" class="tbc-itemSelector-panel tbc-itemSelector-operation">' +
                '        <button role="operaAddSelected" class="tbc-button normalBtn addSelected" type="button"><i class="tbc-icon icon-arrow-right"></i></button>' +
                '        <button role="operaRemoveSelected" class="tbc-button normalBtn removeSelected" type="button"><i class="tbc-icon icon-arrow-left"></i></button>' +
                '        <button role="operaAddCurrPage" class="tbc-button bigBtn addCurrPage" type="button"><i class="tbc-icon icon-arrow-dblright"></i></button>' +
                '        <button role="operaRemoveCurrPage" class="tbc-button bigBtn removeCurrPage" type="button"><i class="tbc-icon icon-arrow-dblleft"></i></button>' +
                '    </div>' +
                '    <div class="tbc-itemSelector-panel selectedBox">' +
                '        <div class="tbc-itemSelector-title">' +
                '            <span role="selectedTitle">已选</span> <span> [ <i class="" role="selectedNum">0</i><b role="maxSelected"></b> ]</span>' +
                '            <a role="removeAll" class="tbc-button tbc-itemSelector-btnRemoveAll">移除全部</a>' +
                '        </div>' +
                '        <div role="selectedContainer" class="tbc-itemSelector-list"><ul></ul></div>' +
                '        <div class="tbc-itemSelector-pagination">' +
                '            <div class="border">' +
                '                <select role="selectedPageSize" name="toPageSize" class="inputxt">' +
                '                    <option value="10">10</option>' +
                '                    <option value="20">20</option>' +
                '                    <option value="50">50</option>' +
                '                    <option value="100">100</option>' +
                '                    <option value="500">500</option>' +
                '                </select>' +
                '                <div class="abs_right">' +
                '                    <a role="selectedPrevPage" href="javascript:void(0);" class="tbc-buttons prev"><i class="tbc-icon icon-arrow-left"></i></a>' +
                '                    <input role="selectedPageTyper" type="text" value="1" name="toPageNo" class="inputxt tbc-inputer" norender="true">' +
                '                    <i>/</i>' +
                '                    <span role="selectedPageTotal">1</span>' +
                '                    <a role="selectedNextPage" href="javascript:void(0);" class="tbc-buttons next"><i class="tbc-icon icon-arrow-right"></i></a>' +
                '                </div>' +
                '            </div>' +
                '        </div>' +
                '    </div>' +
                '</div>')
                .css({position:"relative",zIndex:1});
        
        var head = '<div class="tbc-itemSelector-header">' +
                    '    <div class="_padding">' +
                    '        <select>' +
                    '            <option value="0">全部人员</option>' +
                    '        </select>' +
                    '        <div class="abs_right">' +
                    '            <input type="text" class="tbc-inputer" value="工号/姓名/用户名" />' +
                    '            <select>' +
                    '                <option value="0">待选人员</option>' +
                    '                <option value="0">已选人员</option>' +
                    '            </select>' +
                    '            <button type="submit" class="tbc-button">筛选</button>' +
                    '        </div>' +
                    '     </div>' +
                    '</div>';
        
        // ui part
        SELF.part = {
            /**
            availTitle        : 0,
            availNum        : 0,
            availContainer    : 0,
            availPageSize    : 0,
            availPrevPage    : 0,
            availPageTyper    : 0,
            availPageTotal    : 0,
            availNextPage    : 0,
            operaList        : 0,
            operaAddSelected    : 0,
            operaRemoveSelected    : 0,
            operaAddCurrPage    : 0,
            operaRemoveCurrPage    : 0,
            selectedTitle        : 0,
            selectedNum            : 0,
            removeAll            : 0,
            selectedContainer    : 0,
            selectedPageSize    : 0,
            selectedPrevPage    : 0,
            selectedPageTyper    : 0,
            selectedPageTotal    : 0,
            selectedNextPage    : 0
            /**/
        };
        
        ui.find("[role]").each (function() {
            var role = this.getAttribute("role");
                SELF.part[role] = this;
                role=null;
        });
        
        // 缓存
        SELF._cache = {
            // 已选
            selected : {
                total : 0,
                list  : [],
                names : {},
                page  : {
                    "page.pageSize" : 10,
                    "page.pageNo"   : 1,
                    totalPages      : 1,
                    total           : 0
                },
                selected: {}
            },
            
            // 可选
            available : {
                total : 0,
                list  : [],
                names : {},
                page  : {
                    "page.pageSize" : 10,
                    "page.pageNo"   : 1,
                    totalPages      : 1,
                    total           : 0
                }
            }
        },
        
        // AJAX请求的附加数据
        SELF._ajaxDataAvailable = tbc.extend({}, this._cache.selected.page, {includeChild:true, keyword :"" });
        SELF._ajaxDataSelected = tbc.extend({}, this._cache.available.page, {keyword :""});
        
        if (options.max) {
            
            // 限制为1时,禁用选择当前页的按钮
            if (options.max===1) {
                $(SELF.part.operaAddCurrPage)
                .attr("disabled", "disabled")
                .addClass("tbc-button-disabled");
            }
            
            $(SELF.part.maxSelected).append('/<b title="最多只能选择'+ options.max +'项" style="font-weight:bold; color:red; cursor:default; text-decoration:underline;">'+ options.max +'</b>');
        }
        
        SELF.extend ({
            ui    : ui,
            
            container:ui,
            
            append : function(child) {
                this.container.append(child);
            },
            
            prepend : function(child) {
                this.container.prepend(child);
            },
            
            appendTo : function(box) {
                this.ui.appendTo(box);
            },
            
            prependTo : function(box) {
                this.ui.prependTo(box);
                
            },
            
            // 获取分页设置
            formatPage : function (elem) {
                /*
                <input type="hidden" name="totalPages" value="95"/>
                <input type="hidden" name="totalRecords" value="948"/>
                <input type="hidden" name="pageNo" value="1"/>
                <input type="hidden" name="pageSize" value="10"/>
                */
                var page = {};
                
                $("input[type='hidden']", elem).each(function() {
                    switch (this.name) {
                        case "totalPages":
                            page.totalPages = this.value||0;
                            break;
                        case "totalRecords":
                            page.totalRecords = this.value||0;
                            break;
                        case "pageNo" :
                            page["page.pageNo"] = this.value||0;
                            break;
                        case "pageSize":
                            page["page.pageSize"]=this.value||0;
                            break;
                    }
                });
                
                page.prev = Math.max(page["page.pageNo"]-=1, 1);
                page.next = Math.min(page["page.pageNo"]+=1, page.totalPages);
                
                try { return page; } finally { page=null; }
            },
            
            getPages : function(type) {
                var page = {},
                    part = this.part,
                    apage= this._cache.available.page||{},
                    spage= this._cache.selected||{};
                switch (type) {
                    case "available":
                        page["page.pageSize"] = apage["page.pageSize"] || part.availPageSize.value || 10;
                        page["page.pageNo"] = apage["page.pageNo"] || part.availPageTyper.value || 1;
                        page["totalPages"] = apage["totalPages"] || part.availPageTotal.value || 1;
                        page["total"] = apage["total"] || part.availNum.value || 0;
                        break;
                    case "selected":
                        page["page.pageSize"] = spage["page.pageSize"] || part.selectedPageSize.value || 10;
                        page["page.pageNo"] = spage["page.pageNo"] || part.selectedPageTyper.value || 1;
                        page["totalPages"] = spage["totalPages"] || part.selectedPageTotal.value || 1;
                        page["total"] = spage["total"] || part.selectedNum.value || 0;
                        break;
                }
                try { return page; } finally { page=null };
            },
            
            formatList     : function (elem) {
                
                var list    = [];
                if (elem && typeof elem === "object" && $.isFunction(elem.size)) {
                    $("li", elem).each(function() {
                        var li = {},
                            dt = options.dataTemplate,
                            id = $("input",this).val()||this.getAttribute("data-id")
                            ;
                    
                        li[dt["id"]]    = $("input",this).val()||this.getAttribute("data-id");
                        li[dt["text"]]    = $("i", this).text()||$("span:first", this).text();
                        li[dt["depict"]]= $("span:last", this).text();
                        li[dt["title"]]    = this.getAttribute("title");
                        
                        list.push(li);
                        li=null;
                    });
                } else if (elem) {
                    list = elem;
                }
                
                try { return list } finally { list=null; }
            },
            
            // 设置分页器
            setPagination : function (type, page) {
                
                var total = !page["total"] ? "0" : page["total"];
                
                switch (type) {
                    case "available" :
                        this.part.availPageTyper.value = page["page.pageNo"];
                        this.part.availPageTotal.innerHTML = page.totalPages;
                        $(this.part.availPageSize).val(page["page.pageSize"]);
                        $(this.part.availNum).html (total);
                        
                        tbc.extend(this._cache.available.page, page);
                        
                        break;
                        
                    case "selected"    :
                        this.part.selectedPageTyper.value = page["page.pageNo"];
                        this.part.selectedPageTotal.innerHTML = page.totalPages;
                        $(this.part.selectedPageSize).val(page["page.pageSize"]);
                        $(this.part.selectedNum).html (total);
                        tbc.extend(this._cache.selected.page, page);
                        break;
                }
            },
            
            // 加载可选项
            loadAvailableByPage        : function (page) {
                var self = this;
                
                if (options.availableUrl && this.triggerEvent("beforeAvailableLoad") !== false) 
                {
                    var lazy = (options.autoSave !== false&&options.lazy===true ? true : false)+"";
                        page = page || this.getPages("available")["page.PageNo"] || 1;
                    
                    var a = this._ajaxDataAvailable, 
                        b = this._cache.available.page;
                    
                    page = Math.max(0, Math.min(this._cache.available.page.totalPages, page));
                    
                    $.ajax ({
                        url            : options.availableUrl,
                        dataType    : options.dataType,
                        data        : $.extend({}, options.post, this._ajaxDataAvailable, this._cache.available.page, {"page.pageNo":page, lazy:lazy}),
                        type        : "post",
                        beforeSend    : function () {
                            self.triggerEvent("beforeAvailableLoad");
                        },
                        complete    : function () { },
                        error        : function () { },
                        success        : function (data) {
                            
                            if (data && data.rows) {
                                
                                if (options.itemDataFormater) {
                                    data.rows = options.itemDataFormater(data.rows);
                                }
                                
                                $.each(data.rows, function() {
                                    !this.id && (this.id = this.userId);
                                    !this.text && (this.text = this.userName||this.nm);
                                    !this.nm && (this.nm = this.text);
                                    SELF._cache.available.names[ this[options.dataTemplate["id"]] ] = this;
                                });
                            }
                            
                            var result = self.formatResult(data, options.itemTemplate);
                            self.updateAvailablePage(result);
                            
                            self.triggerEvent("afterAvailableLoad");
                            
                            self = result = page = null;
                        }
                    });
                }
            },
            
            // 加载已选项
            loadSelectedByPage : function (page) {
                var self = this;
                if (options.selectedUrl && options.autoSave && this.triggerEvent("beforeSelectedLoad") !== false) 
                {
                    var lazy = (options.autoSave !== false&&options.lazy===true ? true : false)+"";
                    
                    page = page || this.getPages("selected")["page.PageNo"] || 1;
                    
                    $.ajax ({
                        url            : options.selectedUrl,
                        dataType    : options.dataType,
                        type        : "post",
                        data        : $.extend ({}, options.post, SELF._ajaxDataSelected, this._cache.selected.page, {"page.pageNo":page, lazy:lazy}),
                        beforeSend    : function () { },
                        complete    : function () { },
                        error        : function () {
                            var sbox = $(self.part.selectedContainer);
                            sbox.find("ul").size() === 0 && sbox.html("<ul></ul>");
                        },
                        success        : function (data) {
                            
                            if (data && data.rows) {
                                if (options.itemDataFormater) {
                                    data.rows = options.itemDataFormater(data.rows);
                                }
                                
                                // 清除已选的
                                for (var k in SELF._cache.selected.names) {
                                    delete SELF._cache.selected.names[k];
                                }
                                
                                $.each(data.rows, function() {
                                    !this.id && (this.id = this.userId);
                                    !this.text && (this.text = this.userName);
                                    !this.nm && (this.nm = this.text);
                                    SELF._cache.selected.names[ this[options.dataTemplate["id"]] ] = this;
                                    //SELF._cache.selected.selected[this.userId] = true;
                                });
                            }
                            
                            // 从返回结果获取分页设置;
                            var result = self.formatResult(data, options.itemTemplateSelected);
                            self.updateSelectedPage(result);
                            self._cache.selected.list = result.list;
                            result.list = null;
                            self = result = null;
                        }
                    });
                } else {
                    var sbox = $(self.part.selectedContainer);
                    sbox.find("ul").size() === 0 && sbox.html("<ul></ul>");
                }
            },
            
            // 更新待选栏
            updateAvailablePage : function (sets) {
                
                var self = this;
                $(self.part.availContainer).empty().append(sets.html);
                self.setPagination ("available", sets.page);
                self._cache.available.page = sets.page;
                self._cache.available.list = [].concat(sets.list);
                
                // 禁用或不禁用上一页按钮
                if (sets.page["page.pageNo"]<=1) {
                    $(self.part.availPrevPage).addClass("tbc-button-disabled");
                } else {
                    $(self.part.availPrevPage).removeClass("tbc-button-disabled");
                }
                
                // 禁用或不禁用下一页按钮
                if (sets.page["page.pageNo"]>=sets.page.totalPages) {
                    $(self.part.availNextPage).addClass("tbc-button-disabled");
                } else {
                    $(self.part.availNextPage).removeClass("tbc-button-disabled");
                }
            },
            
            // 更新已选栏
            updateSelectedPage : function (sets) {
                var self = this;
                $(self.part.selectedContainer).empty().append(sets.html);
                self.setPagination ("selected", sets.page);
                self._cache.selected.page = sets.page;
                
                if (options.autoSave !== false) {
                //    self._cache.selected.list = [].concat(sets.list);
                }
                
                
                // 禁用或不禁用上一页按钮
                if (sets.page["page.pageNo"]<=1) {
                    $(self.part.selectedPrevPage).addClass("tbc-button-disabled");
                } else {
                    $(self.part.selectedPrevPage).removeClass("tbc-button-disabled");
                }
                
                // 禁用或不禁用下一页按钮
                if (sets.page["page.pageNo"]>=sets.page.totalPages) {
                    $(self.part.selectedNextPage).addClass("tbc-button-disabled");
                } else {
                    $(self.part.selectedNextPage).removeClass("tbc-button-disabled");
                }
            },
            
            // 分页(数据分页或者从服务器加载某一页)
            pageAvailable : function () {
                this.loadAvailableByPage.apply(this, arguments);
            },
        
            pageSelected : function (page) {
                var page    = page || SELF._cache.selected.page["page.pageNo"],
                    total    = SELF._cache.selected.page.totalPages;
                    page    = Math.max(1, Math.min(total, page));
                
                if (options.autoSave===false || options.lazy===true) {
                //if ((options.autoSave===false && options.selectedData) || (options.autoSave !== false&&options.lazy===true)) {
                    //if (options.selectedData) 
                    this.sliceSelectedByPage.apply(this, arguments);
                } else {
                    this.loadSelectedByPage (page);
                }
            },
            
            sliceSelectedByPage : function(page) {
                var p = page || this._cache.selected.page["page.pageNo"],
                    t = this._cache.selected.page.totalPages,
                    ps= this._cache.selected.page["page.pageSize"],
                    s = this.sliceListByPage (this._cache.selected.list, Math.max(1, Math.min(t, p)), ps||10),
                    r = this.formatResult(s, options.itemTemplateSelected);
                    
                this.updateSelectedPage (r);
            },
            
            sliceListByPage : function (list, page, pageSize) {
                
                /*
                 {"id":null,"first":1,"total":0,"rows":[],"pageNo":1,"pageSize":10,"autoCount":true,"totalPages":0,"hasNext":false,"nextPage":1,"hasPre":false,"prePage":1,"sortName":null,"sortOrder":null,"autoPaging":true}
                 */
                pageSize = pageSize||10;
                
                var count = list.length,
                    totalPages = Math.floor(count/pageSize) + (count%pageSize>0?1:0),
                    start = Math.max(0, (page-1)*pageSize),
                    end   = Math.min(count, (page*pageSize)),
                    rows = list.slice(start, end),
                    hasNext    = start !== 0,
                    hasPrev = end !== count;
                    
                return {
                    totalRecords    : count,
                    totalPages        : totalPages,
                    total            : list.length,
                    rows            : rows,
                    "pageSize"    : pageSize,
                    "pageNo"    : page
                }
            },
            
            formatResult    : function (data, template) {
                
                var rs = {
                    html    : "<ul></ul>",
                    page    : {"page.pageSize":10, "page.pageNo":1, "totalPages":0, "total":0},
                    list    : []
                };
                if (data) {
                    
                    options.dataType = typeof options.dataType === "string" ? options.dataType.toLowerCase() : options.dataType;
                    
                    var type = (options.dataType === "html"||options.dataType === "text") && (typeof data === "string"||data.jQuery)
                        ? "html"
                        : (options.dataType === "json"||typeof data === "object") 
                            ? "json" : (options.dataType === "xml") 
                                ? "xml" : options.dataType;
                                
                    switch (type) {
                        case "html":
                            var ele = $("<div/>").html(data);
                            rs.html = $(data);
                            rs.page = this.formatPage(ele);
                            rs.list = this.formatList(ele);
                            ele.remove();
                            ele = null;
                            break;
                        case "json":
                            var _list = data.rows 
                                ? data.rows.length>data.pageSize 
                                    ? this.sliceListByPage(data.rows, data.pageNo, data.pageSize).rows 
                                    : data.rows 
                                : null;
                            
                            rs.html = _list ? this.createHtmlByJSON(_list, template) : "";
                            rs.page    = { "page.pageSize":data.pageSize, "page.pageNo":data.pageNo, "totalPages":data.totalPages, "total":data.total };
                            
                            rs.list = data.rows || this.formatList(rs.html);
                            
                            break;
                    }
                }
                try { return rs; } finally { rs=null; }
            },
            
            // 把JSON数据转换成HTML代码
            createHtmlByJSON : function (json, itemTemplate) {
                if (!json) return "";
                var list = $("<ul/>"),
                    arr = tbc.isArray(json) ? json : json.list||[],
                    len = arr.length,
                    model    = itemTemplate || options.itemTemplate || '<li data-id="{userId}" class="{selected} {checked}"><i>{employeeCode}</i><span>{userName}</span></li>',
                    html    = [],
                    itemData;
                
                for (var i=0; i<len; i++) {
                    itemData = options.vauleSetFormater ? options.vauleSetFormater.call(this, arr[i]) : arr[i];
                    html.push(tbc.stringTemplate(model, itemData, options.textTransform));
                }
                list.html(html.join(""));
                
                try { return list; } finally { list=arr=len=model=html=null; }
            },
            
            // 把XML数据转换成HTML代码(未实现)
            createHtmlByXML : function (xml) {},
            
            /*
             * 
             */
            getAvailablePage : function() {
                return this._cahce.available.page;
            },
            
            /*
             * 把节点移动到已选栏
             * @param    : items; 准备移动的节点
             */
            selectItems : function (items) { 
                
                var s = $(items);
                
                items = $(items).filter(function() {
                    var id = this.getAttribute("data-id"),
                        exist = $(SELF.part.selectedContainer).find("li[data-id='"+id+"']").size()>0;
                    return !exist;
                })
                .addClass("checked")
                ;

                SELF.setNextSelected (items);
                items.clone().prependTo($("ul", SELF.part.selectedContainer));
                //items.clone().removeClass("checked").prependTo($("ul", SELF.part.selectedContainer));
                
            },
            
            saveSelected : function (ids, callback) {
                if (options.autoSave !== false && options.lazy !== true && ids.length>0) {
                    var data = options.post || {},
                        result;
                    
                    if (options.postFormater) {
                        result = options.postFormater(ids);
                        data[options.postKey] = result;
                    } else {
                        var _ids = [];
                        for (var i=0,len=ids.length; i<len; i++) {
                            _ids.push(ids[i][options.dataTemplate["id"]]);
                        }
                        data[options.postKey] = _ids.join(",");
                    }
                    
                    $.ajax ({
                        url        : options.addUrl,
                        type    : "post",
                        data    : data,
                        dataType: "json",
                        beforeSend:function() {
                            if (SELF.triggerEvent("beforeSave") !== false) {
                                tbc.lock(SELF.ui);
                            }
                        },
                        complete: function() {
                            tbc.unlock(SELF.ui);
                            if ($.isFunction(callback)) {
                                callback.call(SELF);
                            }
                            SELF.triggerEvent("afterSave");
                        },
                        success    : function(result) {
                            if (result.success !== true &&  result.message) {
                                alert(result.message);
                            }
                        }
                    });
                    data = null;
                } else {
                    SELF.pageAvailable();
                    SELF.pageSelected();
                }
            },
            
            
            /*
             * 把节点从已选栏移除
             * @param    : items; HTMLElement/jQuery()          
             */
            deselectItems : function (items) {
                items = $(items);
                SELF.setNextSelected (items);
                items.remove();;
            },
            
            saveDeselected : function (ids, callback) {
                if (options.autoSave && !options.lazy && ids.length>0) {
                    
                    var data = options.post || {},
                        result;
                        
                    if (options.postFormater) {
                        result = options.postFormater(ids);
                        data[options.postKey] = result;
                    } else {
                        var _ids = [];
                        for (var i=0,len=ids.length; i<len; i++) {
                            _ids.push(ids[i][options.dataTemplate["id"]]);
                        }
                        data[options.postKey] = _ids.join(",");
                    }
                    
                    $.ajax({
                        url        : options.removeUrl,
                        type    : "post",
                        data    : data,
                        dataType    : "json",
                        beforeSend    : function() {
                            if (SELF.triggerEvent("beforeSave") !== false) {
                                tbc.lock(SELF.ui);
                            }
                        },
                        complete    : function() {
                            tbc.unlock (SELF.ui);
                            if ($.isFunction(callback)) {
                                callback.call(SELF);
                            }
                            SELF.triggerEvent("afterSave");
                        },
                        success    : function(result) {
                            if (result.success !== true &&  result.message) {
                                alert(result.message);
                            }
                        }
                    });
                    data = null;
                } else {
                    SELF.pageSelected();
                    SELF.pageAvailable();
                }
            },
            
            // 单选时,移动一个之后,自动选中后面或者前面的相邻节点
            setNextSelected : function (items) {            
                if (items.size() === 1) {
                    var next = items.next();
                        next.size() 
                        ? next.addClass("selected") 
                        : items.prev().addClass("selected");
                    next=null;
                }
            },
            
            // 检查选择
            checkSelect : function (items, goNextPage) {
                if (items.length === 0) return false;
                
                if (options.max && !isNaN(options.max)) {
                    
                    if (this._cache.selected.page.total>=options.max) {
                        alert("您最多只能选择"+options.max+"条.");
                        return false;
                    }
                    
                    var len = items.length,
                        al    = 0;
                    if (this._cache.selected.page.total+len>options.max) {
                        al = options.max-this._cache.selected.page.total;
                        items = items.slice(0, al);
                        alert("数量已经超过限制, 仅前面的"+ al +"个被添加到了已选栏.");
                    }
                }
                
                var list    = this.getAvailableItems(items),
                    self    = this;
                
                if (options.itemDataFormater) {
                    list = options.itemDataFormater(list);
                }
                
                var page = this._cache.available.page["page.pageNo"];
                    page+= (goNextPage ? 1 : 0);
                
                this.selectItems(items);
                this.selectToCache(list);    
                this.saveSelected(list, function() {    
                    this.pageAvailable(page);
                    this.pageSelected(page);
                });
                list.length = 0;
                list = items = self = null;
            },
            
            // 检查移除
            checkDeselect : function (items, noRefresh) {
                
                if (items.length === 0) { return false; }
                
                var list    = this.getSelectedItems(items),
                    self    = this;
                
                this.deselectToCache(list);
                this.deselectItems(items);
                this.saveDeselected(list, function() {
                    this.pageAvailable();
                    this.pageSelected();
                });
                list.length = 0;
                list = items = self = null;
            },
            
            selectAll    : function () {
                if (options.autoSave !== false && options.lazy !== true) {
                    $.ajax({
                        url        : options.selectAllUrl,
                        type    : "post",
                        dataType: "json",
                        data    : $.extend({}, options.post, this._ajaxDataAvailable, this._cache.available.page),
                        beforeSend    : function() { 
                            if (SELF.triggerEvent("beforeSave") !== false) {
                                tbc.lock(SELF.ui);
                            }
                        },
                        complete    : function() {
                            tbc.unlock (SELF.ui);
                            SELF.pageSelected();
                            SELF.pageAvailable();
                            SELF.triggerEvent("afterSave");
                        },
                        success    : function(result) {
                            if (result.success !== true &&  result.message) {
                                alert(result.message);
                            }
                        }
                    });
                } else {
                    this.pageSelected();
                    this.pageAvailable();
                }
            },
            
            removeAll    : function () {
                
                this._cache.selected.list.length = 0;
                this._cache.selected.names = {};
                
                if (options.autoSave !== false && options.lazy !== true) {
                    $.ajax({
                        url        : options.deselectAllUrl,
                        type    : "post",
                        dataType: "json",
                        data    : $.extend({}, options.post, this._ajaxDataAvailable, this._cache.available.page),
                        beforeSend:function() { 
                            if (SELF.triggerEvent("beforeSave") !== false) {
                                tbc.lock(SELF.ui);
                            }
                        },
                        complete: function() {
                            tbc.unlock(SELF.ui);
                            SELF.pageSelected(1);
                            SELF.pageAvailable(1);
                            SELF.triggerEvent("afterSave");
                        },
                        success    : function(result) {
                            if (result.success !== true && result.message) {
                                alert(result.message);
                            }
                        }
                    });
                } else {
                    this.pageSelected(1);
                    this.pageAvailable(1);
                }
            },
            
            selectCurrentPage    : function () {
                var li = $("li", this.part.availContainer).not(".checked");
                this.checkSelect(li, "goNextPage");
                li = null;
            },
            
            deselectCurrentPage    : function (noFlush) {
                var li = $("li", this.part.selectedContainer);
                this.checkDeselect(li, noFlush);
                li = null;
            },
            
            getSelectedItems : function (items) {
                var arr = [];
                $(items).each(function() {
                    var id    = this.getAttribute("data-id"),
                        slc    = SELF._cache.selected.names[id];
                    slc && arr.push(slc);
                });
                try { return arr; } finally { arr=null; }
            },
            
            getAvailableItems : function (items) {
                var arr = [];
                $(items).each(function() {
                    var id    = this.getAttribute("data-id"),
                        avl    = SELF._cache.available.names[id];
                    if (avl) {
                        arr.push (avl);
                    }
                });
                try { return arr; } finally { arr=null; }
            },
            
            selectChecked    : function () {
                
                var li = $("li.selected", this.part.availContainer).not(".checked");
                this.checkSelect(li);
                li = null;
            },
            
            addAvailableItem : function (data, clear) {
                
                var html = this.createHtmlByJSON(data).find("li").addClass("selected"),
                    ul = $(this.part.availContainer).children("ul");
                    
                if (clear) {
                    ul.empty();
                }
                
                ul = ul.size() !== 0 ? ul : $("<ul/>").appendTo(this.part.availContainer);
                ul.append(html);
                this.deselectToCache(data);
            },
            
            removeAvailableItem : function (id) {
                $(this.part.availContainer).find("li[data-id='"+ id +"']").remove();
                delete this._cache.available.names[id];
            },
            
            clearAvailable : function () {
                $(this.part.availContainer).children("ul").empty();
                var a = this._cache.selected.names[id];
                for (var k in a) {
                    delete a[k];
                }
                a=null;
                this._cache.selected.list.length = 0;
            },
            
            deselectChecked    : function () {
                
                var li = $("li.selected", this.part.selectedContainer);
                this.checkDeselect(li);
                li = null;
            },
            
            selectToCache : function(items) {
                var self = this,
                    actual = [];
                $.each (items, function(i, o) {
                    if (o) {
                        var id = this[options.dataTemplate["id"]];
                        if (!self._cache.selected.names[id]) {
                            self._cache.selected.names[id] = this;
                            self._cache.selected.list.push(this);
                            actual.push(this);
                        }
                        delete self._cache.available.names[id];
                    }
                });
                
                this.triggerEvent ("select", actual);
                actual = self = null;
            },
            
            deselectToCache : function(items) {
                var self = this,
                    i;
                $.each(items, function() {
                    var id = this[options.dataTemplate["id"]];
                    if (!self._cache.available.names[id]) {
                        self._cache.available.names[id] = this;
                        self._cache.available.list.push(this);
                    }
                    delete self._cache.selected.names[id];
                    $(self.part.availContainer).find("li[data-id='"+ id +"']").removeClass("checked");
                });
                
                self._cache.selected.list.length = 0;
                for (var k in self._cache.selected.names) {
                    i++;
                    self._cache.selected.list.push(self._cache.selected.names[k]);
                    if (i>5000) {
                        tbc.lock(SELF.ui);
                    }
                }
                tbc.unlock(SELF.ui);
                
                this.triggerEvent ("deselect", items);
                self = null;
            },
            
            getPropertiesById : function(ids) { 
                var self = this;
                var data = options.post || {};
                    data[options.postKey] = ids.join(",");
                
                $.ajax({
                    url : options.propertiesUrl,
                    type : "post",
                    dataType : "json",
                    data : data,
                    success:function(json) {
                        if (json) {
                            self.setSelected(json);
                        }
                    }
                });
            },
            
            /**
             * 设置已选项的值
             */
            setSelected : function(json) {
                var self = this;
                
                if (json && $.isArray(json) && json.length>0) {
                    tbc.lock(self.ui);
                    self._cache.selected.list = self._cache.selected.list||[];
                    
                    tbc.batch(json, 10000, 0, 0, function(list) {
                        var id,
                            items;
                        for (var i=0,len=list.length; i<len; i++) {
                            id = list[i][options.dataTemplate["id"]];
                            items = self._cache.selected.names[ id ];
                            if (!items) {
                                self._cache.selected.names[ id ] = list[i];
                                self._cache.selected.list.push(list[i]);
                            }
                            self._cache.selected.names[ id ].selected = true;
                        }
                    }, function() {
                        tbc.unlock(self.ui);
                        var s = self.sliceListByPage (self._cache.selected.list, 1, 10),
                            r = self.formatResult(s, options.itemTemplateSelected);
                        
                        $(self.part.selectedContainer).empty().append(r.html);
                        self.setPagination ("selected", r.page);
                    });
                }
            }
        });
        
        
        
        //SELF.loadAvailableByPage(1);
        
        // 已选数据
        if (!options.autoSave && typeof options.selectedData === 'string') {
            var ids = options.selectedData.split(",");
            if (ids.length>0) {
                SELF.getPropertiesById(ids);
            }
        } else if (!options.autoSave && $.isArray(options.selectedData)) {
            setTimeout(function() {
                SELF.setSelected(options.selectedData);
            },100);
        } else {
            SELF.loadSelectedByPage(1);
        }
        
        if (options.autoSave===false || options.lazy===true) {
            $(SELF.part.addAll).hide();
        }
        
        $ (SELF.part.availContainer).add(SELF.part.selectedContainer)
        .delegate("li", "click", function (event) {
            var li = $(this);
            
            if (event.shiftKey) {
                var shiftStart;
                li.siblings().add(li).each(function() {
                    
                    if (shiftStart) {
                        $(this).addClass("selected");
                    } else {
                        $(this).removeClass("selected");
                    }
                    
                    if (this === li[0] || $(this).hasClass("lastClicked")) {
                        shiftStart = !shiftStart;
                        $(this).addClass("selected");
                    }
                    
                });
                
            } else {
                li.addClass("lastClicked").siblings().removeClass("lastClicked");
                
                if (event.ctrlKey && options.multiple && options.max !== 1) {
                    li.hasClass("selected") 
                    ? li.removeClass("selected")
                    : li.addClass("selected");
                } else {
                    li.addClass("selected").siblings().removeClass("selected");
                }
            }
        });
        
        $ (SELF.part.availContainer).add(SELF.part.selectedContainer)
        .delegate("li", "dblclick", function (event) {
            
        });
        
        $(SELF.part.operaAddCurrPage).click(function(event) { SELF.selectCurrentPage(); });
        
        $(SELF.part.operaRemoveCurrPage).click(function(event) { SELF.deselectCurrentPage(); });
        
        $(SELF.part.operaAddSelected).click(function(event) { SELF.selectChecked(); });
        
        $(SELF.part.operaRemoveSelected).click(function(event) { SELF.deselectChecked();  });
        
        $(SELF.part.availPageTyper).keyup(function(event) {
            if (!this.value.match(/^\d+$/)) {}
            if (event.keyCode === 13) {
                var page = parseInt(this.value);
                SELF.pageAvailable(page);
            }
        });
        $(SELF.part.selectedPageTyper).keyup(function(event) {
            if (!this.value.match(/^\d+$/)) {}
            if (event.keyCode === 13) {
                var page = parseInt(this.value);
                SELF.pageSelected(page);
            }
        });
        
        $(SELF.part.availPageSize).change(function(event) {
            SELF._cache.available.page["page.pageSize"] = this.value;
            SELF.pageAvailable();
        });
        $(SELF.part.selectedPageSize).change(function(event) {
            SELF._cache.selected.page["page.pageSize"] = this.value;
            SELF.pageSelected();
        });
        
        $(SELF.part.availPrevPage).click(function(event) {
            var p = SELF._cache.available.page["page.pageNo"]-1;
            SELF.pageAvailable(p);
            
        });
        
        $(SELF.part.availNextPage).click(function(event) {
            
            var p = SELF._cache.available.page["page.pageNo"]+1;
            SELF.pageAvailable(p);
        });
        
        $(SELF.part.selectedPrevPage).click(function(event) {
            
            var p = SELF._cache.selected.page["page.pageNo"]-1;
            return SELF.pageSelected(p);
        });
        
        $(SELF.part.selectedNextPage).click(function(event) {
            
            var p = SELF._cache.selected.page["page.pageNo"]+1;
            return SELF.pageSelected(p);
        });
        
        $(SELF.part.addAll).click(function(event) {
            SELF.selectAll();
        });

        $(SELF.part.removeAll).click(function(event) {
            SELF.removeAll();
        });
    };
}(tbc, jQuery));

/**
 * 数据缓存器
 * @copyright 时代光华
 * @author mail@luozhihua.com
 */
tbc.jdc = new function() {
	
	var SELF = tbc.self(this);
	
	SELF.extend(tbc.Event);
	SELF.extend(tbc.ClassManager);
	
	SELF.packageName = "tbc";
	
	SELF.db = //window.localStorage || window.sessionStorage || 
	{
		store	: {},
		key 	: function(k) {
			if (!isNaN(parseInt(k))) {
				return this.store[k];
			}
			return null;
		},
		
		getItem : function(key) {
			return this.store[key];
		},
		
		setItem : function(key, value) {
			if (value) {
				this.store[key] = value;
			}
			value.KEY = key;
			return value;
		},
		
		removeItem : function(key) {
			this.store[key] = null;
			delete this.store[key];
		}
	};
	
	var tables = {};
	SELF.db.setItem("tables", tables);
	
	/* 数据表 */
	SELF.getTable = function(tableName) {
		return tables[tableName];
	}
	
	// 创建数据表
	SELF.createTable = function(tableName) {
		if (tableName && !tables[tableName]) {
			tables[tableName] = new tbc.jdc.Table(tableName);
			return tables[tableName];
		}
		return;
	}
	
	// 删除数据表
	SELF.dropTable = function(tableName) {
		if (tables[tableName]) {
			tables[tableName].del("all");
			tables[tableName].DESTROY();
			delete tables[tableName];
		}
	}
	
	// 选择数据
	SELF.select = function(from, key) {
		var t = typeof(from) === "string" ? tables[from] : from;
		
		if (t) {
			var r = t.get(key);
			t=null;
			return r || null;
		}
		return null;
	}
	
	// 插入或更新数据
	SELF.set = function(tableName, key_values, orValue) {
		
		var t = tables[ tableName ];
		
		if (!t) {
			t = SELF.createTable(tableName);
		}
		
		if (t) {
			if (typeof key_values === "object") {
				for(var k in key_values) {
					t.set(k, key_values[k]);
				}
			}else{
				t.set(key_values, orValue);
			}
		}
		t=null;
	}
	
	// 删除数据
	SELF.del = function(fromTable, key) {
		
		var t = tables[ fromTable ];
		t && t.del(key);
		t=null;
	}
}

/* 数据表 */
tbc.jdc.Table = function(tableName) {
	var SELF = tbc.self(this);
	
	SELF.extend(tbc.Event);
	SELF.extend(tbc.ClassManager);
	SELF.packageName = "tbc.jdc.Table";
	
	SELF.count = 0;
	SELF.store = {};
	SELF.get = function(key, where) {
		var list = [];
		if (key.toLowerCase() === "all"||key === "*") {
			for(var k in SELF.store) {
				list.push(SELF.store[k]);
			}
			return list;
		}else{
			return SELF.store[key] || null;
		}
	}
	
	SELF.set = function(key, value) {
		
		if (SELF.store[key]) {
			SELF.count++;
		}
		SELF.store[key] = value;
	}
	
	SELF.del = function(key) {
		if (typeof key === "string" && key.toLowerCase() === "all") {
			for (var k in SELF.store) {
				delete SELF.store[k];
			}
		} else if (key) {
			delete SELF.store[key];
		}
	}
}

;(function(tbc, $) {

    "use strict";

    /**
     * 用于生产弹出层、窗体容器、消息框等
     * @class tbc.Panel
     * @constructor
     * @uses tbc.Event
     * @uses tbc.ClassManager
     * @copyright 时代光华
     * @author mail@luozhihua.com
     *
     * @param {Object} settings 配置项
     *     @param {Window} [settings.window] 用于多个框架页或含有iframe的页面
     *                                      设置弹出窗口在哪一个框架页里面打开
     *     @param {Object} [settings.opener] 打开此窗口的窗口对象
     *     @param {String} [settings.title=""] 窗口标题
     *     @param {String} [settings.name="未命名"] 窗口名称（readOnly）
     *     @param {String} [settings.icon] 窗口图标
     *     @param {String} [settings.html] 窗口内容
     *     @param {Element | Object} [settings.area="body"] 限制窗口的坐标位置在某
     *                       一元素的坐标区域内
     *     @param {Number} [settings.width=400] 宽度，默认400px
     *     @param {Number} [settings.height=300] 高度，默认400px
     *     @param {Number} [settings.left="auto"] 左边距，默认auto
     *     @param {Number} [settings.top="auto"] 上边距，默认auto
     *     @param {Element} [settings.target] 窗口渲染到哪一个元素内
     *     //@param {Boolean} [settings.modal] 是否是模态窗口
     *     @param {String} [settings.sizeType] 初始显示状态， min/max/restore
     *     @param {Number} [settings.minWidth=180] 最小宽度， 默认180px
     *     @param {Number} [settings.minHeight=100] 最小高度， 默认100px
     *     @param {Boolean} [settings.autoShow=true] 是否自动显示
     *     @param {Boolean} [settings.autoClose=false] 是否自动关闭（此功能咱未实现）
     *     @param {Boolean} [settings.autoCloseTimeout=5] 自动关闭的等待时间，单位秒（此功能咱未实现）
     *     @param {Boolean} [settings.draggable=true] 是否可以拖动，默认true;
     *     @param {Boolean} [settings.resizable=true] 是否可以调整大小，默认true;
     *     @param {Boolean} [settings.minimizable=true] 是否可以最小化，默认false;
     *     @param {Boolean} [settings.maximizable=true] 是否可以最大化，默认false;
     */
    tbc.Panel = function(settings, panel) {
        
        var defaults = {
              window    : window 
            , opener    : null    // 打开此窗口的窗口对象
            , title     : null    // 窗口标题(根据窗口内容改变)
            , name      : null    // 窗口名称(不变)
            , icon      : ""      // 图标,类型:string,默认:""
            , html      : ""      // 对话框要加载的HTML内容    
            , area      : "body"
            , width     : 400    // 对话框的宽度,类型:number,默认:400
            , height    : 300    // 对话框的高度,类型:number,默认:300
            , top       : "auto" // 右边距离
            , left      : "auto" // 左边距离
            , target    : null     // 窗口显示在哪一个元素内
            , modal     : true     // 是否是模态窗口,类型:boolean,默认:true
            , enable3D  : true     // 启用3D效果
            , sizeType  : "restore" // 初始显示状态: max/min/restore
            , minWidth  : 180    // 对话框的宽度,类型:number,默认:400
            , autoShow  : true    // 
            , minHeight : 100    // 对话框的高度,类型:number,默认:300
            , autoClose : false    // 是否会自动关闭, 类型:boolean,默认:false
            , draggable : true     // 是否可拖动,类型:boolean,默认:true
            , resizable : true     // 是否可重置尺寸, 类型:boolean,默认:true
            , minimizable : false    // 是否可最小化, 类型:boolean,默认:false
            , maximizable : false    // 是否可最大化, 类型:boolean,默认:false
            , defaultSate : "restore" // [min, max] 初始状态
            , autoCloseTimeout : 5   // 自动关闭的间隔时间(秒),类型:number,默认:5

            // 事件
            , event       : {}  // 如果这里没有设置,可以在实例化后使用 new tbc.Panel().addEvent(type:function)注册新的事件;
        },
        
        /**
         * 实例配置数据
         * @ignore
         * @private
         * @type {Object} 
         */
        options = $.extend({}, defaults, settings);

        options.window = options.window || window;
        
        tbc.self(this, arguments)
        .extend({
            
            /**
             * 类名
             * @property {String} packageName
             * @type {String}
             */
            packageName : "tbc.Panel",

            /**
             * 面板组成部件
             * @property {Object} part
             * @type {Object}
             */
            part : {},

            /**
             * 窗体UI外框
             * @public
             * @property {ELement} ui
             */
            ui : null,

            /**
             * 窗体内容容器
             * @public
             * @property {Element} container
             */
            container : null,

            /**
             * 窗口最后一次更改前的大小和位置
             * @public
             * @property {Object} lastSize
             *     @property {Number} lastSize.width 宽度
             *     @property {Number} lastSize.height 高度
             *     @property {Number} lastSize.left 距离window窗口的左边距
             *     @property {Number} lastSize.top 距离window窗口的上边距
             *     @property {Number} lastSize.right 距离window窗口的右边距
             *     @property {Number} lastSize.bottom 距离window窗口的下边距
             * @type {Object}
             */
            lastSize : {
                width  : 0,
                height : 0,
                left   : 0,
                top    : 0,
                right  : "auto",
                bottom : "auto"
            },

            /**
             * 初始化UI
             * @private
             * @method initUi
             * @chainable
             */
            initUi : function(){
                
                var zindex = tbc.getMaxZIndex($(".tbc-slide-scene.current")[0]),
                    tag = (tbc.msie&&tbc.browserVersion<9) ? "div" : "dialog";            
                
                // 窗体的HTML代码(jQuery对象)
                this.ui = $('<'+ tag +' class="tbc-panel closeable shadow" style="filter:alpha(opacity=0); opacity:0; z-index:'+ (zindex+1) +';"></'+ tag +'>')
                    .attr ("tbc", this.guid)
                    .html (
                        '<div role="header" class="tbc-panel-header" unselectable="on" onselectstart="return false;">' +
                        '    <div class="tbc-panel-top-left resize-handle" role="north-west"></div>' +
                        '    <div class="tbc-panel-top-right resize-handle" role="north-east"></div>' +
                        '    <div role="controls" class="tbc-panel-controls">' +
                        '        <div class="tbc-switch-role" role="roleBox">' +
                        '            <span class="tbc-switch-role-roleName" role="roleName"></span>' +
                        '            <span class="tbc-switch-role-handle tbc-icon icon-arrow_state_blue_expanded" role="roleHandle"></span>' +
                        '            <ul class="tbc-switch-role-list" role="roleList"><li>1111</li><li>2222</li></ul>' +
                        '        </div>' +
                        '        <span class="tbc-panel-controls-box">' +
                        '            <a role="close" class="tbc-panel-btn-close" href="javascript:void(null);" hidefocus="true" title="关闭">×</a>' +
                        '            <a role="restore" class="tbc-panel-btn-max" href="javascript:void(null);" hidefocus="true" title="最大化/还原">■</a>' +
                        '            <a role="min" class="tbc-panel-btn-min" href="javascript:void(null);" hidefocus="true" title="最小化">▁</a>' +
                        '            <!--a role="refresh" class="tbc-panel-btn-refresh" href="javascript:void(null);" hidefocus="true" title="刷新">&hArr;</a-->' +
                        '            <a role="reset" class="tbc-panel-btn-reset" href="javascript:void(null);" hidefocus="true" title="重新打开">&otimes;</a>' +
                        '            <a role="help" class="tbc-panel-btn-help" href="javascript:void(null);" hidefocus="true" title="">?</a>' +
                        '        </span>' +
                        '    </div>' +
                        '    <div class="tbc-panel-top-center">' +
                        '        <div class="tbc-panel-top-center-handle resize-handle" role="north"></div>' +
                        '        <span class="tbc-panel-icon"><img role="icon" height="16" onerror="this.style.display=\'none\';" /></span>' +
                        '        <div role="title" class="tbc-panel-title">' +
                        '            <!--标题区域-->窗体基类' +
                        '        </div>' +
                        '    </div>' +
                        '</div>' +
                        '<div class="tbc-panel-body">' +
                        '    <div class="tbc-panel-middle-left resize-handle" role="west"></div>' +
                        '    <div class="tbc-panel-middle-right resize-handle" role="east"></div>' +
                        '    <div class="tbc-panel-middle-center tbc-panel-main">' +
                        '        <div role="container" class="tbc-panel-container">' +
                        '            <!--内容区域-->' +
                        '        </div>' +
                        '        <div role="mask" class="tbc-panel-locked-layer" style="display:none;">' +
                        '            <div role="maskTips" class="tbc-panel-locked-layertips"></div>' +
                        '        </div>' +
                        '    </div>' +
                        '</div>' +
                        '<div role="footer" class="tbc-panel-footer">' +
                        '    <div class="tbc-panel-footer-left resize-handle" role="south-west"></div>' +
                        '    <div class="tbc-panel-footer-right resize-handle" role="south-east"></div>' +
                        '    <div class="tbc-panel-footer-center resize-handle" role="south"></div>' +
                        '</div>');
                
                this.ui.bind ("click", function (event) {
                    var et = event.target,
                        t  = et.tagName.toLowerCase(),
                        self = tbc.getTaskByElement(this);

                    if (self && $.isFunction(self.focus)) {
                        self.focus();
                    }

                    if (t === "input"||t === "textarea"||t === "button" ||t === "a"||et.contenteditable) {
                        setTimeout(function() {
                            et.focus(); 
                            et = null;
                        },0);
                    }
                    self = null;
                });

                tbc.Panel.cacheid++;
                this.cacheid = tbc.Panel.cacheid;
                this.ui.attr("iid", this.iid);
                this.ui.attr("cacheid", this.cacheid);
                tbc.Panel.cache[ this.cacheid ] = this;
                tbc.Panel.cache_length += 1;

                // 为最小化、最大化、还原等添加CSS Class
                if (options.minimizable) this.ui.addClass("minimizable");
                if (options.maximizable) this.ui.addClass("maximizable");
                if (options.refreshable) this.ui.addClass("refreshable");
                if (options.resettable) this.ui.addClass("resettable");
                if (options.helpable) this.ui.addClass("helpable");
                
                return this;
            },

            /**
             * 初始化面板零部件
             * @private
             * @chainable
             */
            initPart : function() {
                var self = this;

                // 缓存面板零部件
                this.ui.find("[role]").each(function(inx, elem) {
                    var role = elem.getAttribute("role");
                    this.part[role] = $(elem);
                }.bind(this));
                
                this.container = this.part.container;

                // 表单提交
                if (this.part.form) {
                    this.part.form.submit(function(event) {
                        event.preventDefault();
                        this.triggerEvent("submit");
                    }.bind(this));
                }

                // 窗体控制按钮, 包括最小化、最大化、关闭等的操作
                this.part.controls
                .bind ("mousedown", function(event) { event.disableSelectArea = true; event.stopPropagation(); })
                .delegate ("a", "click", null, function(event) {

                    event.preventDefault();

                    var elem = event.currentTarget,
                        role = elem.getAttribute("role");

                    switch (role) {
                        case "close":
                            event.stopPropagation();
                            this.close();
                            break;

                        case "min":
                            if (options.minimizable) { this.min(); }
                            break;

                        case "max":
                            if (options.maximizable) { this.max(); }
                            break;

                        case "restore":
                            if (options.maximizable) {
                                if (this.sizeType === "max") {
                                    this.restore();
                                } else {
                                    this.max();
                                }
                            }
                            break;

                        case "refresh":
                            if (options.refreshable && this.refresh) {
                                this.refresh();
                            }
                            break;
                            
                        case "reset":
                            if (options.resettable && this.reset) {
                                this.reset();
                            }
                            break;
                            
                        case "help":
                            if (options.helpable) {
                                this.help();
                            }
                            break;
                            
                        default:
                            break;
                    }
                }.bind(this));
                
                // 双击标题栏
                this.part.title.dblclick(function() {
                    if (self.sizeType !== "max" && options.maximizable) {
                        self.max();
                    } else {
                        self.restore();
                    }
                });

                if (tbc.msie && tbc.browserVersion<8) {
                    var controlsWidth = self.part.controls.children(".tbc-panel-controls-box").children().size() * 24 +2;
                    self.part.controls.width(controlsWidth);
                }

                return this;
            },

            /**
             * 初始化
             * @private
             * @method init
             * @chainable
             */
            init : function() {

                this.packageName = "tbc.Panel";

                this.initUi();
                this.initPart();
                this.initDrag();
                this.initResize();
                this.initContextmenu();

                return this;
            },

            /**
             * 初始化打开
             * @private
             * @method initForOpen
             * @chainable
             */
            initForOpen : function () {
                var mw, mh, l, r, t, b;

                if (options.windowInitialType === "FULL" || options.windowInitialType === "MAX") {
                    mw = "100%";
                    mh = "100%";
                    l = r = t = b = 0;
                } else {
                    mw = tbc.system ? Math.min(tbc.system.getDesktopWidth(), (options.width||options.minWidth)) : (options.width||options.minWidth);
                    mh = tbc.system ? Math.min(tbc.system.getDesktopHeight()-24-taskbar.ui.height(), (options.height||options.minHeight)) : (options.height||options.minHeight);
                    l = options.left;
                    r = options.right;
                    b = options.bottom;
                    t = options.top;
                }
                
                this.appendTo(options.target || tbc.Panel.parent || "body")
                .name(options.name|| "窗口")
                .icon(options.icon || tbc.Panel.defaultIcon || (window.DEFAULT_ICONS?DEFAULT_ICONS.window_icon:null) || "")
                .resize(mw, mh, t, r, b, l, false);
                
                if (options.windowInitialType === "FULL" || options.windowInitialType === "MAX") {
                    this.resize("max").rememberSize(options.width, options.height, options.top, options.left);
                } else {
                    this.rememberSize();
                }
                
                this.opened = true;
                
                /* 自定义滚动条(后期实现)
                if ($.fn.nanoScroller) {
                    try{
                        $(".tbc-panel-main", SELF.ui).nanoScroller({
                            paneClass    : "tbc-window-slidebar",
                            sliderClass  : "tbc-window-slider",
                            contentClass : "tbc-panel-container"
                        });
                    }catch(e) {}
                }
                */
                
                /**
                 * 在窗口第一次打开被打开时触发此事件
                 * @event open
                 */
                this.triggerEvent("open");
                return this;
            },

            /**
             * 初始化拖动
             * @private
             * @method initDrag
             * @chainable
             */
            initDrag : function() {

                var SELF = this;

                // 如果可拖动:
                try{
                    if (options.draggable) {
                        
                        SELF.addEvent ("drop", function () {
                            SELF.rememberSize();
                        });
                        
                        if ($.fn.drag) {
                            SELF.ui
                            .addClass("draggable")
                            .drag
                            ({
                                  document : document
                                , area    : "body"
                                , areaMargin: {top:-6, left:"-80%", bottom:"80%", right:"80%"}
                                , handle  : SELF.part.title
                                , enabled : function() {return SELF.ui.hasClass("draggable");}
                                , timeout : 1
                                , event   : {
                                    dragStart : function () {
                                        var z = SELF.ui.css('zIndex') || 2;
                                        
                                        tbc.lock("body", {zIndex:9999999, opacity:0.001, cursor:"move"});
                
                                        SELF.dragSaveOnIframe = $('<div />')
                                        .insertAfter(SELF.ui)
                                        .css({position:'absolute', z:z-1, background:'#fff', opacity:0.01, width:'100%', height:'100%', left:0, top:0 });
                                        
                                        /**
                                         * 在拖动开始时会触发此事件
                                         * @event dragStart
                                         */
                                        SELF.triggerEvent("dragStart");
                                    },
                                    drag : function () { SELF.triggerEvent("drag");  },
                                    drop : function () {
                                        if (SELF.dragSaveOnIframe) {
                                            SELF.dragSaveOnIframe.remove();
                                        }
                                        
                                        tbc.unlock("body");

                                        /**
                                         * 在拖动结束后会触发此事件
                                         * @event drop
                                         */                                        
                                        SELF.triggerEvent("drop");
                                    }
                                }
                            });
                        }
                        
                        SELF.part.title.mousedown(function() { SELF.focus(); });
                    } else if (options.draggable && !$.fn.drag) {
                        throw "jQuery plugins 'jQuery.fn.drag' was not found! jQuery.fn.dialog Dependent on the plugin.";
                    }
                }catch(e) {
                    tbc.log(e);
                }
                return this;                
            },

            /**
             * 初始化调整大小功能
             * @private
             * @method initResize
             * @chainable
             */
            initResize : function() {
                var SELF = this;
                // 如果可缩放:
                try{
                    if (options.resizable && $.fn.resizableForTbc) {
                        SELF.ui
                        .addClass("resizable")
                        .resizableForTbc({
                              handle    : ".resize-handle"
                            , vector    : "normal" // 类型: string, 取值范围: north, north-west, north-east, west, east, south, south-west, south-east
                            , document  : document // 用于不同框架的元素重置大小。
                            , margin    : { top: 7, left: 7, right: 9, bottom: 9 }
                            , minWidth  : options.minWidth
                            , minHeight : options.minHeight
                            , enabled : function() {return SELF.ui.hasClass("resizable");}

                            /* 事件 */
                            , onResizeStart : function () { SELF.focus().lock(); }
                            , onResize      : function () { }
                            , onResizeEnd   : function (size) {
                                SELF.resize(size);
                                SELF.unlock();
                            }
                        });

                    } else if (options.resizable && !$.fn.resizableForTbc) {
                        throw "jQuery plugins 'jQuery.fn.resizableForTbc' was not found! jQuery.fn.dialog Dependent on the plugin.";
                    }
                } catch(err) {
                    tbc.log(err);
                }
                return this;
            },

            /**
             * 初始化右键菜单
             * @private
             * @method initContextmenu
             * @chainable
             */
            initContextmenu : function() {
                var SELF = this;
                // 右键菜单
                if ($.isFunction($.fn.contextmenu)) {
                    this.ui.contextmenu({
                        items:[
                            {text:"最小化", icon:"", click:function() {SELF.min();}, disabled:!options.minimizable,inheritable:true},
                            {
                                text  : function() {return SELF.sizeType === "max"?"还原":"最大化"; },
                                icon  : "",
                                click : function() { if (SELF.sizeType === "max") { SELF.restore();} else {SELF.max();} },
                                disabled:!options.maximizable,
                                inheritable:true
                            },
                            {text:"关闭", icon:"", click:function() {SELF.close();}, inheritable:true}
                        ]
                    });
                }
                return this;
            },

            /**
             * 计算并渲染窗体各零部件的尺寸
             * @public
             * @method panelLayout
             * @chainable
             */
            panelLayout : function() {
                var self = this;
                try{
                    var panel = self.ui;
                    //  调整弹出层内部元素的布局
                    var _bodyHeight    = panel.innerHeight() - self.part.header.height() - self.part.footer.height(),
                        _contWidth    = panel.width() - $(".tbc-panel-middle-left", panel).width() - $(".tbc-panel-middle-right", panel).width();
                    
                    $(".tbc-panel-body", panel).height(_bodyHeight);
                    self.part.container.height(_bodyHeight).width(_contWidth);
                }catch(e) {
                }
                self = null;
                return this;
            },

            /**
             * 显示窗体
             * @public
             * @method show
             */
            show : function() {
                var self = this;

                if (!this.opened) { this.initForOpen(); }
                
                this.minimize = false;
                
                this.ui
                .css({opacity:0, display:"block"})
                .animate({opacity:1}, 200); // 影响性能(5~10s)
               
                this.facade();
                
                setTimeout(function() {
                    self.focus();
                    self = null;
                }, 0);
                
                /**
                 * 在窗口显示时会触发此事件
                 * @event show
                 */
                this.triggerEvent("show");
            
                return this;
            },
           
            /**
             * 隐藏
             * @public
             * @method hide
             * @chainable
             */
            hide : function() {
                var SELF = this;
                
                if (tbc.msie && tbc.browserVersion<8) {
                    this.ui.css({opacity:0,display:"none"});
                } else {
                    this.ui.animate({opacity:0,display:"none"}, 200,  function() {
                        SELF.ui.hide();
                        SELF = null;
                    });
                }
            
                this.evert();
                
                /**
                 * 隐藏窗口时会触发此事件
                 * @event hide
                 */
                this.triggerEvent("hide");

                return this;
            },
           
            /**
             * 设置或者获取HTML代码，如果传入一个String或Element类型的参数，
             * 则设置在窗体的内容区域（this.container）的HTML; 否则获取HTML;
             * @public
             * @method html
             * @param {String} [html] 新的HTML代码
             */
            html : function(html) {
                this.triggerEvent("beforeChange");
            
                if (html) {
                    this.container.html(html);
                    this.triggerEvent("afterChange");
                    return this;
                } else {
                    return this.container.html();
                }   
            },
           
           /**
            * 给窗体容器追加节点或HTML内容
            * @public
            * @method append
            * @param {Element} ele 节点或HTML内容.
            * @chainable
            */
            append : function(ele) {
                /**
                 * 在调用append/prepend方法前会触发此事件
                 * @event beforeChange
                 */
                this.triggerEvent("beforeChange");
                this.container.append(ele);

                /**
                 * 在调用append/prepend方法前会触发此事件
                 * @event afterChange
                 */
                this.triggerEvent("afterChange");
                return this;
            },

            /**
             * 将窗体显示到某一容器
             * @public
             * @method append
             * @param {Element} elem 节点或HTML内容;
             */
            appendTo : function(elem) {
                this.ui.appendTo(elem);
                return this;
            },

            /**
             * 从窗体前面插入节点或HTML内容
             * @public
             * @method prepend
             * @param {Element} elem 节点或HTML内容, 必须;
             */
            prepend : function(elem) {
                this.triggerEvent("beforeChange");
                if (elem.ui) {
                    this.container.prepend(elem.ui);
                } else {
                    this.container.prepend(elem);
                }
                this.triggerEvent("afterChange");
                return this;
            },
        
            /**
             * 将窗口渲染到某一容器的前部
             * @public
             * @method prepend
             * @param {Element} elem 节点或HTML内容, 必须;
             */
            prependTo : function(elem) {
                if (elem.container) {
                    this.ui.prependTo(elem.container);
                } else {
                    this.ui.prependTo(elem);
                }
                return this;
            },

            /**
             * 标题模板
             * titleModel description
             * @property {String} titleModel
             * @type {String}
             */
            titleModel:"{0}<span style='filter:alpha(opacity=70); opacity:0.7; font-weight:lighter;' title='{0} {1}'>{1}</span>",
               
            /**
             * 设置或获取窗体的title
             * @method title
             * @param {String} [title] 要设置的新title,可选的,当没有该参数时返回旧的title 
             * @return {String} 窗体的Title
             */
            title : function (title) {
                if (title) {
                    options.title = title;
                    
                    var name = options.name,
                        title_1 = options.title,
                        title_2,
                        t = (title_1 && title_1 !== name) 
                            ? tbc.formatString(this.titleModel||"", title_1?name+" > ":name, title_1)
                            : options.name;
                    
                    title_2 = title_1 ? (name+" > " + title_1) : (name||"");
                    this.part.title.html(t).attr("title", title_2);

                    /**
                     * 在更改窗体标题后会触发此事件
                     * @event changeTitle
                     */
                    this.triggerEvent("changeTitle", title, name);
                    return this;
                }
                return options.title;
            },
        
            /**
             * 设置或获取窗体的name
             * @public
             * @method name
             * @param {String} [name] 要设置的新name,可选的,当没有该参数时返回旧的name
             * @return {String} 返回名称
             */
            name : function (name) {
                if (name) {
                    options.name = name;

                    var name_1 = name,
                        title_1 = options.title,
                        name_2,
                        n = (title_1 && title_1 !== name_1) 
                            ? tbc.formatString(SELF.titleModel, title_1?(name_1+" > "):name_1, title_1)
                            : options.name;
                    
                    name_2 = title_1 ? (name_1+" > "+title_1) : (name_1||"");

                    this.part.title.html(n).attr("title", name_2);

                    /**
                     * 在更改窗体标题后会触发此事件
                     * @event changeTitle
                     * @param {String} title_1 窗口标题
                     * @param {String} name 窗口名称
                     */
                    this.triggerEvent("changeTitle", title_1, name);
                
                    return this;
                }
                return options.name;
            },

            /**
             * 设置或获取窗体的icon路径
             * @public
             * @method icon
             * @param {String} [icon] 要设置的新icon路径或CSS class, 当没有该参数时返回旧的icon路径 
             * @return {String} 窗体的icon地址
             */
            icon : function (icon) {
                
                var isimg = tbc.system.isImg(icon);
                if (isimg || !icon || icon === "null") {
                    icon = isimg ? icon : DEFAULT_ICONS.window_icon;
                    
                    this.part.icon.attr("src", icon)
                    .show().parent().css({backgroundPosition:"center center"});

                    /**
                     * 在改变窗体图标后会触发此事件
                     * @event changeIcon
                     */
                    this.triggerEvent("changeIcon", icon);
                    return this;
                } else {
                    this.part.icon.parent().addClass("tbc-icon "+icon).css({backgroundImage:""});
                    this.part.icon.hide();
                    return this;
                }
                
                return this.part.icon.attr("src");
            },

            /**
             * 关闭窗体和销毁窗体实例，如果参数focusNext不为true，则在关闭后
             * 使下一个窗体获得焦点
             * @public
             * @method close
             * @param {Boolean} focusNext 是否在关闭后让下一个窗体获得焦点，默认true
             */
            close : function(focusNext) {
                var SELF = this;
                
                // 如果有打开的子模态窗体,则使子模态窗体获得焦点
                if (this.modalWindow) {
                    try {
                        if (focusNext) {
                            this.modalWindow.close(focusNext);
                        } else {
                            this.modalWindow.show().focus().flash();
                            return this;
                        }
                    } catch (e) {}
                }
                
                /**
                 * 在关闭窗体前会触发此事件，如果事件内的任何一个方法返回
                 * false，都将阻止窗口关闭
                 * @event beforeClose
                 */
                if (this.triggerEvent("beforeClose") === false) {
                    return this; 
                }
                
                /**
                 * 在关闭窗体后会触发此事件
                 * @event beforeClose
                 * @param {AnyType} returnValue 窗口的放回值，如果窗口的类型loadType
                 *                              是iframe，则返回iframe的contentWindow
                 *                              对象的returnValue值（不能跨域）
                 */
                this.triggerEvent("close", this.returnValue);
                
                tbc.Panel.cache_length -= 1;
                delete tbc.Panel.cache[this.cacheid];
                tbc.Panel.removeSequence(this.cacheid);
                
                if (this.opener && this.opener.modalWindow) {
                    delete this.opener.modalWindow;
                }
                
                // 关闭当前窗口时,让下一个窗口(仅限当前分屏的窗口)获得焦点(异步执行)
                if (!focusNext) {
                    setTimeout(function() {
                        var scene1 = window.desktop.current().container[0],
                            scene2,
                            win,
                            seq, i;

                        for (seq=tbc.Panel.sequence, i=seq.length; i>=0; i-=1) {
                            win = tbc.Panel.cache[seq[i]];
                            if (win) {
                                scene2 = tbc.Panel.cache[seq[i]].ui.parent()[0];
                                if (scene1 === scene2 || scene2 === document.body) {
                                    tbc.Panel.cache[seq[i]].focus();
                                    break;
                                }
                            }
                        }
                        
                        scene1 = scene2 = win = null;
                    }, 0);
                }
                
                function deleteSELF()
                {
                    if (SELF) {
                        var k;
                        
                        SELF.ui.empty().remove();
                        
                        for (k in SELF.part) {
                            if (SELF.part.hasOwnProperty(k)) {
                                delete SELF.part[k];
                            }
                        }
                        
                        /**
                         * 在窗口完全关闭后会触发此事件，此事件可能会有延迟
                         * @event afterClose 
                         * @param {AnyType} returnValue 窗口的放回值，如果窗口的类型loadType
                         *                              是iframe，则返回iframe的contentWindow
                         *                              对象的returnValue值（不能跨域）
                         */
                        SELF.triggerEvent("afterClose", SELF.returnValue);
                        SELF.DESTROY();
                    }
                    options = defaults = SELF = null;
                }
                
                if (tbc.msie && tbc.browserVersion<8) {
                    deleteSELF();
                } else {
                    this.evert();
                    this.ui.animate(
                        {opacity:0, marginTop:"-=20px"}, 300, deleteSELF
                  );
                }
            },
            
            /**
             * 关闭其他窗口
             * @return {[type]} [description]
             */
            closeOther : function() {
                
            },
            
            /**
             * 把窗体最小化到任务栏
             * @public
             * @method min
             * @chainable
             */
            min : function() {
                this.blur();
                this.ui.hide();
                
                this.minimize = true;
                this.maximize = false;
                
                /**
                 * 在最小化窗口后触发此事件
                 * @event min
                 */
                this.triggerEvent("min");
                return this;
            },
            
            
            /**
             * 窗体最大化
             * @public
             * @method max
             * @chainable
             */
            max : function() {
                
                if (this.minimize) { this.show(); }
                this.disableResize().disableDrag();
                this.resize("100%","100%",null,null,null,null,false);
                this.sizeType = "max";
                this.maximize = true;
                this.minimize = false;
                this.ui.addClass("maximize");

                /**
                 * 在最大化窗口后触发此事件
                 * @event max
                 */                
                this.triggerEvent("max");
                return this;
            },
            
            /**
             * 还原窗体尺寸
             * @public
             * @method restore
             * @chainable
             */
            restore : function() {
                
                if (this.minimize) { this.show(); }
                
                var ls = this.lastSize || {},
                    l  = ls.left   || 0,
                    t  = ls.top    || 0,
                    w  = ls.width  || this.ui.width(),
                    h  = ls.height || this.ui.height();
                
                this.enableResize().enableDrag();
                this.resize(w, h, t, null, null, l, false);
                this.sizeType = "restore";
                this.minimize = false;
                this.maximize = false;
                this.ui.removeClass("maximize");

                /**
                 * 在窗口取消最大化或最小化状态后触发此事件
                 * @event restore
                 */                
                this.triggerEvent("restore");
                
                return this;
            },
            
            /**
             * 当前窗口的尺寸状态: min/max/restore
             * @public
             * @property {String} sizeType
             * @type {String}
             */
            sizeType : options.sizeType || "restore",
            
            /**
             * 记忆窗体尺寸
             * @param  {Number} w 宽度
             * @param  {Number} h 高度
             * @param  {Number} t 上边距
             * @param  {Number} l 左边距
             * @chainable
             */
            rememberSize : function(w, h, t, l) {
                this.lastSize = {
                    top        : t || this.ui.css("top"),
                    left    : l || this.ui.css("left"),
                    width    : w || this.ui.width(),
                    height    : h || this.ui.height()
                };
                return this;
            },
            
            /**
             * 打开模态窗体
             * @param  {Object} opt       同className的参数
             * @param  {Class} [className] 指定模态窗体的基类
             * @return {Object}           返回创建的模态窗体
             */
            openModalDialog:function(opt, className) {
                
                var SELF = this,
                    BaseClass = className || SELF.constructor || tbc.Panel;
                
                this.modalWindow = new BaseClass(opt);
                this.modalWindow.opener = this;
                this.modalWindow.addEvent({
                    "afterClose" : function() {
                        SELF.modalWindow = null;
                        SELF.show().focus();
                    }
                });
                
                BaseClass = null;
                return this.modalWindow;
            },
            
            /**
             * 是否处于获得焦点状态
             * @public
             * @property {Boolean} focused
             * @type {Boolean}
             */
            focused:false,

            /**
             * 让窗口获得焦点, 如果此窗口所在的桌面处于隐藏状态，
             * 则会自动显示此桌面，并让此窗口获得焦点；如果此窗口
             * 有打开的模态窗口，则仅让基于此窗口的模态窗口获得焦
             * 点；
             * @public
             * @method focus
             * @chainable
             */
            focus : function() {
                
                var p = this.ui.parent(),
                    Z, task, index,
                    Za, Ta, c, w;
                
                // 如果已经最小化,则不再获得焦点
                //if (this.minimize === true) return this;
                
                // 显示对应的分屏
                if (!p.hasClass("current")) {
                    task = tbc.system ? tbc.system.getTaskByElement(p) : null;
                    
                    if (task) {
                        index = task.index;
                        desktop.show(index);
                    }
                        
                    p = task = null;
                }
                
                // 如果有打开的子模态窗体,则使子模态窗体获得焦点
                if (this.modalWindow) {
                    Z  = tbc.getMaxZIndex(this.ui.parent()[0]);
                    this.ui.css({ zIndex:Z });
                    
                    if (this.modalWindow.focused) {
                        this.modalWindow.focus().flash();
                    } else {
                        this.modalWindow.focus();
                    }
                    
                    return this;
                }
                
                if (this.focused === true) {
                    return this;
                }
                this.focused = true;
                
                tbc.Panel.removeSequence(this.cacheid);
                tbc.Panel.sequence.push(this.cacheid);
                this.unlock("blur");
                
                Za = tbc.getMaxZIndex(this.ui.parent()[0]);
                Ta = Math.max(window.parseInt(this.ui.css("top")), -6);
                
                this.ui.addClass("shadow").css({ zIndex:Za+1, top:Ta });

                /**
                 * 在窗口获得焦点后触发此事件
                 * @event focus
                 */                
                this.triggerEvent("focus");
                
                // 使其他窗口失去焦点
                c = tbc.Panel.cache;
                for(w in c) {
                    if (c.hasOwnProperty(w) && c[w] !== this && c[w].blur && c[w].focused) {
                        c[w].blur(true);
                    }
                }
                c=null;
                
                return this;
            },
            
            /**
             * 使窗体失去焦点
             * @public
             * @method blur
             * @param  {Boolean} [focusNext=false] 是否让下一个窗口获得焦点，默认false;
             * @chainable
             */
            blur : function (focusNext) {
                
                var i, seq, w;
                
                if (focusNext !== true) {
                    seq = tbc.Panel.sequence;
                    for (i=seq.length-2; i>-1; i--) {
                        w = tbc.Panel.cache[seq[i]];
                        if (this.ui && w.ui && this.ui.parent()[0] === w.ui.parent()[0]) {
                            if (w && !w.minimize && !w.focused) {
                                w.focus();
                                break;
                            }
                        }
                    }
                    w = seq = null;
                }
                
                this.focused = false;
                this.ui.removeClass ("shadow");
                this.lock ("blur", "", 0.1);

                /**
                 * 在窗口失去焦点后触发此事件
                 * @event blur
                 */                
                this.triggerEvent ("blur");

                return this;
            },
               
            /**
             * 重新设置宽度和高度
             * @public
             * @method resize
             * @param {String | Object | Number} newSize 新的尺寸；类型说明：
             *     String: 字符串类型仅支持“min”，“max”, “restore”；
             *     Number: 如果是数字，则表示宽度，并且必须传后面几个参数；
             *     Object: 则必须有下面这些子属性；
             *     @param {Number} newSize.width 宽度
             *     @param {Number} newSize.height 高度
             *     @param {Number} newSize.top 上边距
             *     @param {Number} newSize.right 右边距
             *     @param {Number} newSize.bottom 下边距
             *     @param {Number} newSize.left 左边距
             * @param {Number} [height] 高度
             * @param {Number} [top] 上边距
             * @param {Number} [right] 右边距
             * @param {Number} [bottom] 下边距
             * @param {Number} [left] 左边距
             * @chainable
             */
            resize : function(newSize) {
                var size, arg;
                
                switch (newSize) {
                    case "min"     : this.min();     break;
                    case "max"     : this.max();     break;
                    case "restore" : this.restore(); break;
                    default:
                        if (newSize) {
                            var parent   = $(options.area).size() ? $(options.area) : this.ui.parent(),
                                remember = true;
                            
                            if (typeof(newSize) !== "object") {
                                arg = arguments;
                                size = { width:arg[0], height:arg[1], top:arg[2],  right:arg[3], bottom:arg[4], left:arg[5] };
                            } else {
                                size = newSize;
                                arg = [size.width, size.height, size.top, size.right, size.bottom, size.left];
                            }
                            
                            remember = arguments[arguments.length-1] === false ? false : remember;
                            
                            size.width = size.width === "auto" 
                                ? parent.innerWidth() -((!isNaN(size.left) ? size.left : 20) + (!isNaN(size.right) ? size.right :20))
                                : (size.width === "100%" ? parent.innerWidth()+12 : size.width);
                
                            size.height = size.height === "auto" 
                                ? parent.innerHeight() -((!isNaN(size.top) ? size.top : 20) + (!isNaN(size.bottom) ? size.bottom :20))
                                : (size.height === "100%" ? parent.innerHeight()+12 : size.height);
            
                            var width  = Math.max(size.width, options.minWidth), 
                                height = Math.max(size.height, options.minHeight),
                                left   = arg[0] === "100%" ? -6 : (size.left === "auto" ? Math.max(0, (parent.width()-width)/2) : size.left),
                                right  = size.right === "auto" ? Math.max(0, (parent.width()-width)/2) : size.right,
                                top    = arg[1] === "100%" ? -6 : (size.top === "auto" ? Math.max(0, (parent.height()-height)/2) : size.top),
                                bottom = size.bottom === "auto" ? Math.max(0, (parent.height()-height)/2) : size.bottom;
                            
                            if (remember !== false) {
                                $.extend(this.lastSize, {
                                    left   : parseInt(this.ui.css("left")),
                                    top    : parseInt(this.ui.css("top")),
                                    width  : this.ui.width(),
                                    height : this.ui.height()
                                });
                            }
                            
                            this.ui.css({ width:width, height:height, left:left, right:right, top:top, bottom:bottom });
                            
                            this.panelLayout();

                            /**
                             * 在窗口调整尺寸后触发此事件
                             * @event resize
                             * @param {Object} size 尺寸
                             *     @param {Number} size.width 宽度
                             *     @param {Number} size.height 高度
                             */                            
                            this.triggerEvent("resize", {width: width, height:height});
                        }
                        break;
                }
                
                return this;
            },
            
            /**
             * 设置或返回宽度
             * @public
             * @method resizeWidth
             * @param {Number} width 要设置的宽度, “auto”为减去第二个参数后的宽度;
             * @param {Number} [margin=0] 默认为0; 当参数width值为“auto”时才有效；
             * @chainable
             */
            resizeWidth : function(width, margin) {
                
                width = !isNaN(width) ? width : {width:width, left:margin, right:margin};
                this.resize(width);
                
                return this;
            },
            
            /**
             * 设置或返回高度
             * @public
             * @method resizeHeight
             * @param {Number} height 要设置的宽度, “auto”为减去第二个参数后的宽度;
             * @param {Number} [margin=0] 默认为0; 当参数height值为“auto”时才有效；
             * @chainable
             */
            resizeHeight : function(height, margin) {
                height = !isNaN(height) ? height : {height:height, top:margin, bottom:margin};
                this.resize(height);
                
                return this;
            },
            
            /**
             * 禁止调整大小
             * @public
             * @method disableResize
             * @chainable
             */
            disableResize : function() {
                this.ui.removeClass("resizable");
                return this;
            },
            
            /**
             * 启用大小调整功能
             * @public
             * @method enableResize
             * @return {[type]} [description]
             */
            enableResize : function() {
                this.ui.addClass("resizable");
                return this;
            },
            
            /**
             * 禁止拖动
             * @public
             * @method disableDrag
             * @chainable
             */
            disableDrag : function() {
                this.ui.removeClass("draggable");
                return this;
            },
            
            /**
             * 启动拖动
             * @public
             * @method enableDrag
             * @chainable
             */
            enableDrag : function() {
                this.ui.addClass("draggable");
                return this;
            },
            
            /**
             * 让窗口居中显示
             * @public
             * @method center
             * @chainable
             */
            center : function(callback, w, h) {
                
                /* 计算窗口要显示的坐标位置:left、top、width、height */
                var width  = w&&!isNaN(w) ? w : this.ui.width(),
                    height = h&&!isNaN(h) ? h : this.ui.height(),
                    left   = options.left,
                    top    = options.top,
                    pageW  = document.documentElement.clientWidth  || document.documentElement.offsetWidth,
                    pageH  = document.documentElement.clientHeight || document.documentElement.offsetHeight;
                    
                /** 水平居中  */
                left = (pageW < width
                        ? Math.max(document.documentElement.scrollLeft, document.body.scrollLeft)
                        : (pageW / 2) 
                            + Math.max(document.documentElement.scrollLeft, document.body.scrollLeft) 
                            - (width / 2));
            
                /** 垂直居中 */
                top =  (pageH < height
                        ? Math.max(document.documentElement.scrollTop, document.body.scrollTop)
                        : (pageH / 2) 
                            + Math.max(document.documentElement.scrollTop, document.body.scrollTop) 
                            - (height / 2));
                
                this.ui.css({ top: top, left: left, width:width, height:height});
                $.isFunction(callback) && callback.call(this);
                
                /**
                 * 窗口居中显示时触发此事件
                 * @event center
                 */
                this.triggerEvent("center");
                
                return this;
            },
            
            /**
             * 锁定窗口，在某些情况下需要禁止窗口暂时禁止用户继续操作，
             * 那么可以将窗口lock()；
             * @param  {String} type    锁定类型 "lock", "loading", "waiting", "moving", "modal"；
             * @param  {String} msg     显示在锁定蒙版上的提示
             * @param  {Number} [opacity] 蒙版透明度：一个表示透明度的小数；
             * @chainable
             */
            lock: function (type, msg, opacity) {
                // type 取值范围: "lock", "loading", "waiting", "moving", "modal"
                var l = $('.tbc-panel-locked-layer', this.ui);
                    l.css({ display:"block" });
                    opacity && l.css({opacity:opacity});
                    type && l.addClass(type);
                this.part.maskTips.html(msg);

                /**
                 * 锁定窗口时触发此事件
                 * @event lock
                 */
                this.triggerEvent("lock");
                return this;
            },
            
            /**
             * 将窗口解锁，此方法相对于lock; 可以解除某一种锁定状态
             * @param  {String} type 取值类型 "lock", "loading", "waiting", "moving", "modal"；
             * @example
             *     this.lock("loading");
             *     this.unlock("loading");
             * @chainable
             */
            unlock: function (type) {
                // type 取值范围: "lock", "loading", "waiting", "moving", "modal"
                
                var layer=$('.tbc-panel-locked-layer', this.ui);
                
                type && layer.removeClass(type);
                if ($.trim(layer.attr("class")) === "tbc-panel-locked-layer") {
                    layer.css({ display:"none" });
                    layer.css({ opacity:""});
                }
                this.part.maskTips.html("");

                /**
                 * 窗口解除锁定时触发此事件
                 * @event unlock
                 */
                this.triggerEvent("unlock");
                
                return this;
            },
            
            /**
             * 让窗口抖动（已更名为shake）
             * @deprecated
             * @async
             * @param  {Function} [callback] 回调函数
             * @chainable
             */
            fling : function(callback) {
                return this.shake();
            },
            
            /**
             * 让窗口抖动
             * @async
             * @param  {Function} [callback] 回调函数
             * @chainable
             */
            shake : function(callback) {
                var SELF = this,
                    panel = this.ui;

                panel.animate({left:"-=5px"}, 40);
                panel.animate({left:"+=10px"}, 40);
                panel.animate({left:"-=5px"}, 40);
                panel.animate({left:"+=4px"}, 40);
                panel.animate({left:"-=4px"}, 40);
                panel.animate({left:"+=2px"}, 40);
                panel.animate({left:"-=2px"}, 40, function() { $.isFunction(callback)&&callback.call(SELF); });
                panel = null;

                /**
                 * 窗口抖动时触发此事件
                 * @event shake
                 */
                this.triggerEvent("shake");
                
                /**
                 * 窗口抖动时触发此事件(不赞成继续使侦听事件)
                 * @deprecated 已经更名为shake
                 * @event fling
                 */
                this.triggerEvent("fling");

                return this;
            },
            
            /**
             * 让窗口缩放至某一尺寸和位置
             * @param {Obejct | Element} offset 如果是一个表示位置和尺寸的对象, 则
             *     要包含以下子参数；
             *     @param {Number} offset.width 宽度；
             *     @param {Number} offset.height 高度；
             *     @param {Number} offset.top 上边距；
             *     @param {Number} offset.left 左边距；
             *     @param {Number} offset.opacity 透明度；
             * @param  {Function} [callback] 回调函数
             * @chainable
             */
            scaleTo : function(offset, callback) {
                var SELF = this,
                    panel = SELF.ui,
                    wid = panel.width(),
                    hei = panel.height(),
                    lft = panel.css("left"),
                    top = panel.css("top"),
                    offset_2 = !$.isPlainObject(offset)
                        ? $.extend({}, $(offset).offset(), {width:$(offset).width(), height:$(offset).height(), opacity:0 })
                        : offset;
                
                panel.animate(offset_2, 1200, "easeOutBounce", function() {
                    SELF.ui.css({display:"none",width:wid, height:hei,left:lft, top:top, opacity:1});
                    if ($.isFunction(callback)) {
                        callback.call(SELF);
                    }
                    SELF = null;
                });
                panel = null;
                return this;
            },
            
            /**
             * 让窗口翻转到反面（基于CSS 3，在IE10以下浏览器没有效果 ）
             * @public
             * @method evert
             * @chainable
             */
            evert : function() {
                if (!tbc.msie || tbc.browserVersion>9) {
                    this.ui.css({
                        "-moz-transform"    : "translateZ(-1000px) rotateY(180deg) rotateX(0deg) translateX(1000px)",
                        "-webkit-transform" : "translateZ(-1000px) rotateY(180deg) rotateX(0deg) translateX(1000px)",
                        "-o-transform"      : "translateZ(-1000px) rotateY(180deg) rotateX(0deg) translateX(1000px)",
                        "-ms-transform"     : "translateZ(-1000px) rotateY(180deg) rotateX(0deg) translateX(1000px)",
                        "transform"         : "translateZ(-1000px) rotateY(180deg) rotateX(0deg) translateX(1000px)"
                    });
                }

                /**
                 * 窗口反转时触发
                 * @event evert
                 */
                this.triggerEvent("evert");
                return this;
            },
            
            /**
             * 让窗口翻转到正面，此方法相对于evert（基于CSS 3，在IE10以下浏览器没有效果 ）
             * @public
             * @method facade
             * @chainable
             */
            facade : function() {
                if (!tbc.msie || tbc.browserVersion>9) {
                    this.ui.css({
                        "-moz-transform"    : "none",
                        "-webkit-transform" : "none",
                        "-o-transform"      : "none",
                        "-ms-transform"     : "none",
                        "transform"         : "none"
                    });
                }

                /**
                 * 窗口正面显示时触发此事件
                 * @event facade
                 */
                this.triggerEvent("facade");
                return this;
            },
            
            // 启用3D透视效果
            enable3D : function() {
                this.ui.parent().css({
                    "-moz-transform-style"    : "preserve-3d",
                    "-webkit-transform-styles" : "preserve-3d",
                    "-ms-transform-style"     : "preserve-3d",
                    "-o-transform-style"      : "preserve-3d",
                    "transform-style"         : "preserve-3d",
                    "-webkit-transform-style" : "perspective"
                });

                /**
                 * 窗口启用3D时触发此事件
                 * @event enable3D
                 */
                this.triggerEvent("enable3D");
                return this;
            },
            
            // 禁用3D透视效果
            disable3D : function() {
                this.ui.parent().css({
                    "-moz-transform-style"    : "none",
                    "-webkit-transform-style" : "none",
                    "-ms-transform-style"     : "none",
                    "-o-transform-style"      : "none",
                    "transform-style"         : "none"
                });
                
                /**
                 * 窗口禁用3D时触发此事件
                 * @event disable3D
                 */
                this.triggerEvent("disable3D");
                return this;
            },
            
            // 启用动态变幻效果
            enableAnimate : function (duration, delay, easing) {
                var v1 = duration || ".4s",
                    v2 = easing || "ease",
                    v3 = delay || "0s",
                    v  = [v1,v2,v3].join(" ");
                
                this.ui.css({
                    "-moz-transition"    : "-moz-transform " + v,
                    "-webkit-transition" : "-web-transform " + v,
                    "-o-transition"      : "-o-transform " + v,
                    "-ms-transition"     : "-ms-transform " + v,
                    "transition"         : "transform " + v
                });
                this.triggerEvent("enableAnimate");
                
                return this;
            },
            
            // 禁用动态变幻效果
            disableAnimate : function () {
                this.ui.css ({
                    "-moz-transition"    : "",
                    "-webkit-transition" : "",
                    "-o-transition"      : "",
                    "-ms-transition"     : "",
                    "transition"         : ""
                });
                this.triggerEvent("disableAnimate");
                return this;
            },
            
            active : function (o) {
                o 
                ? this.ui.addClass("active")
                : this.ui.removeClass("active");
                
                this.triggerEvent("active");
                return this;
            },
            
            /**
             * 让窗口闪烁
             * @public
             * @method flash
             * @param {Function} [callback] 回调函数
             * @chainable
             */
            flash : function (callback) {
                var panel = this.ui,
                    aniCB = function () {
                        panel.dequeue ("flash");
                    },
                    _time = 40;
                    
                this.ui.queue ("flash", [
                    function () { panel.css({opacity:0.5}).removeClass("shadow"); setTimeout(aniCB, _time); },
                    function () { panel.css({opacity:1}).addClass("shadow");    setTimeout(aniCB, _time); },
                    function () { panel.css({opacity:0.5}).removeClass("shadow"); setTimeout(aniCB, _time); },
                    function () { panel.css({opacity:1}).addClass("shadow");    setTimeout(aniCB, _time); },
                    function () { panel.css({opacity:0.5}).removeClass("shadow"); setTimeout(aniCB, _time); },
                    function () { 
                        panel.css ({opacity:1}) .addClass ("shadow");
                        setTimeout (function() {
                            aniCB();
                            panel.verifyButton 
                            ? panel.verifyButton.focus()
                            : panel.cancelButton && panel.cancelButton.focus();
                            
                            $.isFunction(callback)&&callback.call(panel);
                        }, _time);
                    }
                ]).dequeue("flash");

                /**
                 * 窗口闪烁时触发此事件
                 * @event flash
                 */
                this.triggerEvent("flash");
                return this;
            },
            
            /**
             * 获取窗口的位置及尺寸
             * @public
             * @method offset
             * @param {Object} return 返回值
             *     @param {Number} return.offsetWidth 外框宽度
             *     @param {Number} return.offsetHeight 外框高度
             *     @param {Number} return.containerWidth 内容容器的宽度
             *     @param {Number} return.containerHeight 内容容器的高度
             *     @param {Number} return.width 宽度（不包含margin）
             *     @param {Number} return.height 高度（不包含margin）
             *     @param {Number} return.scrollWidth 页面内容宽度（包含超出可视范围的宽度）
             *     @param {Number} return.scrollHeight 页面内容高度（包含超出可视范围的高度）
             */
            offset : function() {
                var panel = this.ui,
                    off   = panel.offset(),
                    con   = this.part.container;
                
                $.extend(off, {
                      offsetWidth     : panel.outerWidth()
                    , offsetHeight    : panel.outerHeight()
                    , containerWidth  : con.innerWidth()
                    , containerHeight : con.innerHeight()
                    , width           : panel.width()
                    , height          : panel.height()
                    , scrollWidth     : con[0].scrollWidth
                    , scrollHeight    : con[0].scrollHeight
                });
                
                return off; 
            }
        })
        .addEvent({
            "afterClose" : function() {
                
                var p,
                    hasMax = false,
                    k;
                    
                for (k in tbc.Panel.cache) {
                    if (tbc.Panel.cache.hasOwnProperty(k)) {
                        p = tbc.Panel.cache[k];
                        hasMax = hasMax || p.maximize;   
                    }
                }
                
                // 如果目前没有最大化的窗口,则显示分屏导航条和左侧快捷启动栏
                if (!hasMax) {
                    if (taskbar) { 
                        taskbar.show();
                    }
                    
                    desktop.setDockZindex();
                    $(".tbc-desktop-nav").css({zIndex:5});
                }
                
                p=null;
            },

            "max" : function () {
                taskbar && taskbar.hide();
                $(".tbc-desktop-dock").css({zIndex:3});
                $(".tbc-desktop-nav").css({zIndex:3});
            },

            "min" : function () {
                var p, k;
                for (k in tbc.Panel.cache) {
                    if (tbc.Panel.cache.hasOwnProperty(k)) {
                        p = tbc.Panel.cache[k];
                        if (p.sizeType === "max" && !p.minimize) {
                            return;
                        }
                    }
                }
                p=null;
                
                if (taskbar) {
                    taskbar.show();
                }
                desktop.setDockZindex();
                $(".tbc-desktop-nav").css({zIndex:5});
            },

            "restore" : function () {
                var p, k;
                for (k in tbc.Panel.cache) {
                    p = tbc.Panel.cache[k];
                    if (p.sizeType === "max" && !p.minimize) return;
                }
                p=null;
                taskbar && taskbar.show();
                desktop.setDockZindex();
                $(".tbc-desktop-nav").css({zIndex:5});
            },

            "destroy" : function () {
                try {
                    options = settings = null;
                } catch (e) {
                    
                }
            }
        })
        .init();
    };

    //tbc.Panel.defaultIcon    = "images/icons/newWindow.png";
    
    /**
     * 存储所有已经打开的窗体实例;
     * @property {Object} cache
     * @type {Object}
     */
    tbc.Panel.cache = tbc.Panel.cache || {}; 
    
    /**
     * 缓存ID, 数值会随着实例的增加而递增
     * @static
     * @property {Number} cacheid
     * @type {Number}
     */
    tbc.Panel.cacheid = (isNaN(tbc.Panel.cacheid) || !tbc.Panel.cacheid) ? 0 : tbc.Panel.cacheid;
    
    /**
     * 实例数量, 创建或销毁任何实例时都会更新此值
     *
     * @static
     * @property {Number} cache_length
     * @type {Number}
     */
    tbc.Panel.cache_length = isNaN(tbc.Panel.cache_length) ? 0 : tbc.Panel.cache_length;

    /**
     * 保存所有已经打开的窗口的显示顺序;
     * @static
     * @property {Array} sequence
     * @type {Array}
     */
    tbc.Panel.sequence = tbc.Panel.sequence || [];
    
    /**
     * 设置窗体默认在哪一元素内打开
     * @static
     * @property {String} parent
     * @type {String}
     */
    tbc.Panel.parent        = ".tbc-slide-scene.current";
    
    /**
     * 删除某一窗体ID在排序中的序列号
     * @static
     * @method removeSequence
     * @param  {String} windowID 窗口ID
     */
    tbc.Panel.removeSequence  = tbc.Panel.removeSequence || function(windowID) {
        tbc.Panel.sequence = tbc.array.remove(tbc.Panel.sequence, windowID);
    };

}(tbc, jQuery));

;tbc.Pop = function(settings) {
    var SELF = tbc.self (this, arguments);
    
    SELF.extend (tbc.Event, tbc.ClassManager);
    SELF.packageName = "tbc.Pop";
    
    var defaults = {
              width : 320
            , height: 180
            , icon    : null
            , autoClose    :false
            , timeout    : 3
            , locate    : null
            , parent    : null
            , counter    : ".tbc-pop-close i"
        },
        options = tbc.extend ({}, defaults, settings),
        interval= null,
        timeout = options.timeout || 5,
        zindex    = tbc.getMaxZIndex()+1,
        html    =  '<div class="tbc-pop" style="opacity:0.001; filter:alpha(opacity=0.01); z-index:'+ zindex +';">' +
                   '    <div class="tbc-pop-arrow">&diams;</div>' +
                   '    <div class="tbc-pop-close"><i></i><a href="#">&times;</a></div>' +
                   '    <div class="tbc-pop-inner">' +
                   '        <div class="tbc-pop-icon"></div>' +
                   '        <div class="tbc-pop-container"></div>' +
                   '    </div>' +
                   '</div>';
        
    SELF.ui            = $ (html).css ({width:options.width, height:options.height}).attr("tbc", SELF.guid).appendTo(options.parent||"body").bind(function() { SELF.focus(); });
    SELF.container    = SELF.ui.find (".tbc-pop-container");
    SELF.arrow        = SELF.ui.find (".tbc-pop-arrow");
    
    SELF.counter = $(options.counter, SELF.ui);
    
    SELF.extend ({
        "html" : function (t) {
            SELF.container.html(t);
            return SELF;
        },
        
        "focus" : function () {
            var z = tbc.getMaxZIndex();
                SELF.ui.css({ zIndex:z+1 });
            return SELF;
        },
        
        "show" : function () { SELF.ui.show(); return SELF;},
        
        "hide" : function () { SELF.hide(); return SELF;},        
        
        "addCounter" : function(cnt) { SELF.counter.add(cnt); return SELF},
        
        /* 倒计时 */
        "countDown" : function(count) {
            SELF.triggerEvent("beforeCountdown");
            SELF.ui.find(".tbc-pop-close i").html(count);
            SELF.triggerEvent("countdown");
            return SELF;
        },
        
        /* 停止并清除倒计时 */
        "stop" : function() {
            SELF.triggerEvent("beforeStop");
            clearInterval(interval);
            timeout = 0;
            SELF.triggerEvent("stop");
            return SELF;
        },
        
        /* 开始倒计时 */
        "start" : function() {
            interval = setInterval(function() {
                if (timeout<=0) {
                    SELF.close();
                    return;
                }
                timeout--;
                SELF.countDown(timeout);
            }, 1000);
            SELF.triggerEvent("start");
            return SELF;
        },
        
        /* 暂停倒计时 */
        "pause" : function() { clearInterval(interval); return SELF;},
        
        /* 继续倒计时 */
        "resume" : function() { this.start(); return SELF;},
        
        /* 关闭pop */
        "close" : function() {
            if (SELF.triggerEvent("beforeClose") !== false) {
                clearInterval(interval);
                SELF.ui.empty().remove();
                SELF.triggerEvent("close");
                SELF.DESTROY();
                SELF=null;
            }
            return SELF;
        },
        
        /* 从后面添加内容 */
        "append" : function(module) {
            if (SELF.triggerEvent("beforeAppend") !== false) {
                SELF.container.append(module.ui || module);
                SELF.triggerEvent("append");
            }
            return SELF;
        },
        
        /* 从前面添加内容 */
        "prepend" : function(module) {
            if (SELF.triggerEvent("beforeAppend") !== false) {
                SELF.container.prepend(module.ui||module);
                SELF.triggerEvent("append");
            }
            return SELF;
        },
        
        "appendTo" : function(target) {
            SELF.ui.appendTo(target.container||target);
            return SELF;
        },
        
        "prependTo" : function(target) {
            SELF.ui.prependTo(target.container||target);
            return SELF;
        },
        
        "setArrowX" : function(point, position) {
            var offset = SELF.ui.offset(),
                p    = position || $(point).offset(),
                pw    = point.width()/2-14,
                left = p.left+pw-offset.left;
            if (left<0)SELF.ui.css({left:"-="+Math.abs(left)+"px"});
            SELF.arrow.css({top:"",left: Math.max(1, left)+"px"});
            return SELF;
        },
        
        "setArrowY" : function(point, position) {
            var offset = SELF.ui.offset(),
                p    = position || $(point).offset(),
                ph    = point.height()/2-14,
                top = p.top+ph-offset.top;
            if (top<0)SELF.ui.css({top:"-="+Math.abs(top)+"px"});
            SELF.arrow.css({left:"",top:Math.max(top, 1) +"px"});
            return SELF;
        },
        
        //定位
        "locate" : function(point, position) {
            point = (point|| options.locate) ? $(point || options.locate) : SELF.lastLocate;
            SELF.lastLocate = point;
            
            if (point.size<0) {
                return;
            }
            
            var pos        = SELF.getPosition(point, position),
                lastCls    = SELF.ui.data("lastClass")||"tbc-pop-left",
                cls        = "",
                axis    = "y";
            
            if (pos.left === "auto") {
                if (pos.parent.height<pos.locate.bottom) {
                    cls = "tbc-pop-bottom";
                    pos.right -= pos.locate.width;
                    pos.bottom    += (pos.parent.height+pos.parent.scrollTop) - pos.locate.bottom + pos.locate.height + 20;
                    axis = "x";
                } else if (pos.locate.top<0) {
                    cls = "tbc-pop-top";
                    pos.right -= pos.locate.width;
                    pos.top += pos.locate.height+4;
                    axis = "x";
                } else {
                    cls = "tbc-pop-right";
                    pos.right+=4;
                }
            } else {
                if (pos.parent.height<pos.locate.bottom) {
                    cls = "tbc-pop-bottom";
                    pos.left -= pos.locate.width;
                    pos.bottom += (pos.parent.height+pos.parent.scrollTop) - pos.locate.bottom + pos.locate.height + 20;
                    axis = "x";
                } else if (pos.locate.top<0) {
                    cls = "tbc-pop-top";
                    pos.left -= pos.locate.width;
                    pos.top    += pos.locate.height+4;
                    axis = "x";
                } else {
                    cls = "tbc-pop-left";
                    pos.left+=4;
                }
            }
            
            pos.left = pos.left === "auto" ? pos.left : pos.left+"px";
            pos.bottom = pos.bottom === "auto" ? pos.bottom : pos.bottom+"px";
            pos.top = pos.top === "auto" ? pos.top : pos.top+"px";
            pos.right = pos.right === "auto" ? pos.right : pos.right+"px";
            
            SELF.arrow.removeClass(lastCls).addClass(cls).data("lastClass", cls);
            SELF.ui.css({ left:pos.left, right:pos.right, top:pos.top, bottom:pos.bottom, opacity:1 });
            axis === "x" ? SELF.setArrowX(point, position) : SELF.setArrowY(point, position);
            
            return SELF;
        },
        
        
        "getPosition" : function(point, position) {
            var locate    = $(point|| options.locate),
                _left    = position?position.left:0,
                _top    = position?position.top:0,
                offset    = locate.offset(),
                lcw        = locate.width(),
                lch        = locate.height(),
                lcl        = _left || offset.left,
                lct        = _top  || offset.top,
                lcr        = lcl + lcw,
                lcb        = lct + lch,
                uiw        = SELF.ui.width(),
                uih        = SELF.ui.height(),
                bodyH    = SELF.ui.offsetParent()[0].offsetHeight,
                bodyW    = SELF.ui.offsetParent()[0].offsetWidth,
                right, left, top="0", bottom="auto";
                
            if (lcr+uiw>bodyW && uiw<lcl) {
                right    = bodyW-offset.left;
                left    = "auto";
            } else {
                right    = "auto";
                left    = lcr;
            }
            
            if (lct+uih>bodyH) {
                top        = "auto";
                bottom    = 0;
            } else {
                top        = lct;
                bottom    = "auto";
            }
            
            return {
                top        : top,
                bottom    : bottom,
                left    : left,
                right    : right,
                width    : uiw,
                height    : uih,
                locate    : { left:lcl, top:lct, right:lcr, bottom:lcb, width:lcw, height:lch },
                parent    : { height:bodyH, width:bodyW, scrollTop:SELF.ui.offsetParent()[0].scrollTop, scrollLeft:SELF.ui.offsetParent()[0].scrollLeft }
            };
        }
        
    });
    
    SELF.ui.find(".tbc-pop-close a").bind({
        "click": function() {
            SELF.close();
            return;
        }
    });
    
    if (options.autoClose===true) {
        SELF.start();
    }
    
    SELF.addEvent ({
        "destroy" : function () {
            SELF = defaults = options = interval= timeout = zindex    = html    =  null;
        }
    });
};
;(function(tbc, $){
    
    "use strict";
    
    /**
     *标签基类 
     * @class tbc.Tabpage
     * @constructor
     * @copyright 时代光华
     * @author mail@luozhihua.com
     */
     
    tbc.Tabpage = function (settings) {
        
           
        var defaults = {
              title     : null
            , icon      : null
            , closable  : false
            , closeNode : null
            , handleNode: ""
            , titleNode : null
            , iconNode  : null
            , container : null
            , content   : null
            
            , duration  : 300
            , easing    : null
            , autoShow  : true
        }
        ,options = tbc.extend({}, defaults, settings)
        
        ,handleNode = $(options.handleNode)
        ,iconNode   = $(options.iconNode, handleNode)
        ,titleNode  = $(options.titleNode, handleNode)
        ,container  = $(options.container)
        ;
        
        tbc.self (this, arguments).extend({
            
            /**
             * 初始化
             * @private
             * @method init
             * @chainable 
             */
            init : function() {
                this.packageName = "tbc.Tabpage";
                
                if (options.group) {
                    this.group = options.group;
                    this.appendTo(this.group);
                }
                if (options.autoShow) { this.show(); }
            },
            
            /**
             * 标签页头
             * @public
             * @property handle
             * @type {jQuery Object} 
             */
            handle : handleNode,

            /**
             * 标签内容容器
             * @public
             * @property container
             * @type {jQuery Object} 
             */
            container : container,

            /**
             * 标签内容容器
             * @private
             * @property ui
             * @type {jQuery Object} 
             */
            ui : container,

            /**
             * 设置或者获取标签页的标题
             * @public
             * @method title
             * @param {String} [title] 新标题
             * @return {String} 如果没有title参数，则返回标签页的名称，否则设置新标题并返回实例自己 
             */
            title : function(title) {
                var ret;
                if (title) {
                    titleNode.html(title);
                    ret = this;
                }else{
                    ret = $.trim(titleNode.html());
                }
                try {
                    return ret;
                } finally {
                    ret = null;
                }
            },

            /**
             * 设置或者获取标签页的图标
             * @public
             * @method icon
             * @param {String} [icon] 图标路径
             * @return {String} 如果没有icon参数，则返回标签页的路径，否则设置新图标并返回实例自己 
             */
            icon : function(icon) {
                var ret;
                if (icon) {
                    iconNode.attr("src", icon);
                    ret = this;
                } else {
                    ret = iconNode.attr("src");
                }

                try {
                    return ret;
                } finally {
                    ret = null;
                }
            },

            /**
             * 向底部滑出
             * @public
             * @method outToBottom
             * @param {Function} func 回调方法 
             */
            outToBottom : function(func) {
                this.triggerEvent("beforeHide");
                var SELF = this,
                    parent = container.parent(),
                    height = parent.height();
                
                container.animate({top:height}, options.duration, 'swing', function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("hide");
                });
            },
            
            /**
             * 向顶部滑出
             * @public
             * @method outToTop
             * @param {Function} func 回调方法 
             */
            outToTop : function(func) {
                this.triggerEvent("beforeHide");
                var SELF = this,
                    height = container.height();
                container.animate({top:-height}, options.duration, 'swing', function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("hide");
                });
            },
            /**
             * 向右侧滑出
             * @public
             * @method outToRight
             * @param {Function} func 回调方法 
             */
            outToRight : function(func) {
                this.triggerEvent("beforeHide");
                var SELF   = this,
                    parent = container.parent(),
                    width  = parent.width();
                container.animate({left:width}, options.duration, 'swing', function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("hide");
                });
            },
            
            /**
             * 向左侧滑出
             * @public
             * @method outToLeft
             * @param {Function} func 回调方法 
             */
            outToLeft : function(func) {
                this.triggerEvent("beforeHide");
                var SELF = this,
                    width = container.width();
                    
                container.animate({left:-width}, options.duration, 'swing', function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("hide");
                });
            },
            
            /**
             * 从顶部滑入标签页
             * @public
             * @method inFromTop
             * @param {Function} func 回调方法 
             */
            inFromTop : function(func) {
                
                this.triggerEvent("beforeShow");
                var SELF = this,
                    height = container.height();
                container.css({ top:-height }).show()
                .animate({ top:0, left:0}, options.duration, options.easing, function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("show");
                });
            },
            
            /**
             * 从底部滑入标签页
             * @public
             * @method inFromBottom
             * @param {Function} func 回调方法 
             */
            inFromBottom : function(func) {
                
                this.triggerEvent("beforeShow");
                
                var SELF = this,
                    parent = container.parent(),
                    height = parent.height();
                container.css({ top:height }).show()
                .animate({ top:0, left:0}, options.duration, options.easing, function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("show");
                });
            },
            
            /**
             * 从左侧滑入标签页
             * @public
             * @method inFromLeft
             * @param {Function} func 回调方法 
             */
            inFromLeft : function(func) {
                var SELF = this,
                    width = container.width();
                
                this.triggerEvent("beforeShow");
                
                container.css({ left:-width }).show()
                .animate({ top:0, left:0}, options.duration, options.easing, function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("show");
                });
            },
            
            /**
             * 从右侧滑入标签页
             * @public
             * @method inFromRight
             * @param {Function} func 回调方法 
             */
            inFromRight : function(func) {
                var SELF = this,
                    parent = container.parent(),
                    width = parent.width();
                
                this.triggerEvent("beforeShow");
                
                container.css({ left:width }).show()
                .animate({ top:0, left:0}, options.duration, options.easing, function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("show");
                });
            },
            
            /**
             * 淡出标签页
             * @public
             * @method fadeOut
             * @param {Function} func 回调方法 
             */
            fadeOut : function(func) {
                var SELF = this;
                this.triggerEvent("beforeHide");
                container.css({top:0,left:0}).animate({opacity:0}, options.duration, options.easing, function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("hide");
                });
            },
            
            /**
             * 淡入标签页
             * @public
             * @method fadeIn
             * @param {Function} func 回调方法 
             */
            fadeIn : function(func) {
                var SELF = this;
                this.triggerEvent("beforeShow");
                container.css({top:0,left:0}).show().animate({opacity:1}, options.duration, options.easing, function() {
                    if ($.isFunction(func)) {
                        func();
                    }
                    SELF.triggerEvent("show");
                });
            },
            
            /**
             * 显示标签页
             * @public
             * @method show
             * @param {Function} func 
             */
            show : function(func) {
                this.triggerEvent("beforeShow");
                container.css({top:0,left:0, opacity:1}).show();
                if ($.isFunction(func)) {
                    func();
                }
                this.triggerEvent("show");
            },
            
            /**
             * 隐藏标签页
             * @public
             * @method hide
             * @param {Function} func 回调方法 
             */
            hide : function(func) {
                this.triggerEvent("beforeHide");
                container.css({top:0,left:0}).hide();
                if($.isFunction(func)) {
                    func();
                }
                this.triggerEvent("hide");
            },
            
            /**
             * 关闭标签页
             * @public
             * @method close 
             */
            close : function() {
                if (options.closable && this.triggerEvent("beforeClose") !== false) {
                    $(options.handleNode).empty().remove();
                    container.empty().remove();
                    this.triggerEvent("close");
                    delete this.group;
                    
                    this.DESTROY();
                    
                    defaults = options = handleNode = iconNode = titleNode = container = null;
                }
            },
            
            /**
             * 将标签页添加到一个标签集的后面 
             * @public
             * @param {Object} group 标签集
             * @chainable
             */
            appendTo : function(group) {
                
                // 从原来的标签集合中移除
                if (this.group) {
                    this.group.remove(this.index);
                }
                
                // 加入新的选项卡集合
                group.append(this);
                this.group = group;
                return this;
            },
            
            /**
             * 将标签页添加到一个标签集的最前面 
             * @public
             * @param {Object} group 标签集
             * @chainable
             */
            prependTo : function(group) {
                // 从原来的标签集合中移除
                if (this.group) {
                    this.group.remove(this.index);
                }
                
                // 加入新的选项卡集合
                group.prepend(this);
                this.group = group;
                return this;
            }
                    
        })
        .addEvent({
            "beforeShow" : function() {
                this.handle.addClass(options.currentClass || "current");
                this.container.addClass(options.currentClass || "current");
            },
            "beforeHide" : function() {
                this.handle.removeClass(options.currentClass || "current");
                this.container.removeClass(options.currentClass || "current");
            },
            "hide" : function() {
                container.hide();
            },
            "destroy" : function () {
                defaults = options = settings = handleNode = iconNode = titleNode = container = null;
            }
        })
        .init();
    
    };
}(tbc, jQuery));

/**
 * 选项卡视图
 * @class tbc.Tabset
 * @constructor
 * @uses tbc.Event
 * @uses tbc.ClassManager
 * @copyright 时代光华
 * @author mail@luozhihua.com
 */
;(function(tbc, $){

    "use strict";

    tbc.Tabset = function(settings) {

        var defaults = {
              container  : ".tbc-tabset"
            , header     : ".tbc-desktop-nav"   //

            , prevHandle : ".tbc-tabset-prev"
            , nextHandle : ".tbc-tabset-next"

            , effects   : "slide-x"      // [fade, slide-x, slide-y]
            , easing    : "swing"

            , loop      : true
            , auto      : true           // 自动切换
            , timeout   : 5000           // 自动切换的间隔时间(毫秒,1000ms === 1s)
            , speed     : 800
        },
        options    = $.extend({}, defaults, settings);

        tbc.self(this, arguments)
        .extend ({
            init : function() {

                var SELF = this;

                this.packageName = "tbc.Tabset";
                this.header     = $(options.header);
                this.container  = $(options.container);
                this.tabs       = [];
                this.currIndex  = 0;

                // 触控
                if (tbc.touchable) {
                    var sx=0, sy=0, st;
                    this.container[0].addEventListener("touchstart", function(event) {
                        sx = event.touches[0].pageX;
                        sy = event.touches[0].pageY;
                        st = new Date().getTime();
                    });

                    this.container[0].addEventListener("touchmove", function(event) {
                        var nx = event.touches[0].pageX,
                            ny = event.touches[0].pageY;
                        SELF.current().ui.css({ left: nx-sx });
                        nx = ny = null;
                    });

                    this.container[0].addEventListener("touchend", function(event) {
                        var nx = event.changedTouches[0].pageX,
                            ny = event.changedTouches[0].pageY,
                            et = new Date().getTime(),
                            r  = Math.abs(nx-sx), // 移动的距离
                            w  = SELF.container.width();

                        if (r > (w/2) || r > (w/2)/(1000/(et-st))) {
                            if (nx<sx && !SELF.isLast()) {
                                SELF.next();
                            } else if (nx>sx && !SELF.isFirst()) {
                                SELF.prev();
                            } else {
                                SELF.current().ui.animate({left:0});
                            }
                        } else {
                            SELF.current().ui.animate({left:0});
                        }
                        nx = ny = w = null;
                    });
                }

            },

            /**
             * 判断当前处于可视状态的标签页是不是第一个
             * @public
             * @method isFirst
             * @return {Boolean}
             */
            isFirst : function() {
                return this.currIndex === 0;
            },

            /**
             * 判断当前处于可视状态的标签页是不是最后一个
             * @public
             * @method isLast
             * @return {Boolean}
             */
            isLast : function() {
                return this.currIndex === this.tabs.length-1;
            },

            /**
             * 获得当前的标签页
             * @public
             * @method current
             * @return {Object} 
             */
            current : function() {
                return this.tabs[this.currIndex];
            },

            /**
             * 显示下一个标签页
             * @public
             * @method next
             * @param  {Number} [index1] 指定下一个的索引值
             * @chainable
             */
            next : function(index1) {

                var current = this.tabs[this.currIndex],
                    index	= !isNaN(index1) ? index1 : (this.currIndex+1 >= this.tabs.length ? 0 : this.currIndex+1);

                switch(this.effect()) {
                    case "slide-x":
                        current && current.outToLeft();
                        this.tabs[index].inFromRight();
                        break;
                    case "slide-y":
                        current && current.outToTop();
                        this.tabs[index].inFromBottom();
                        break;
                    case "fade":
                        current && current.fadeOut();
                        this.tabs[index].fadeIn();
                        break;
                    default:
                        current && current.hide();
                        this.tabs[index].show();
                        break;
                }
                this.currIndex = index;

                return this;
            },
            
            /**
             * 显示上一个标签页
             * @public
             * @method prev
             * @param  {Number} [index1] 指定上一个的索引值
             * @chainable
             */
            prev : function(index1) {

                var current = this.tabs[this.currIndex],
                    index	= !isNaN(index1) ? index1 : (this.currIndex-1<0 ? this.tabs.length-1 : this.currIndex-1),
                    tab = this.tabs[index],
                    methodShow,
                    methodHide;

                switch(this.effect()) {
                    case "slide-x":
                        methodShow = "inFromLeft";
                        methodHide = "outToRight";
                        //current && current.outToRight();
                        //this.tabs[index].inFromLeft();
                        break;
                    case "slide-y":
                        methodShow = "inFromTop";
                        methodHide = "outToBottom";
                        //current && current.outToBottom();
                        //this.tabs[index].inFromTop();
                        break;
                    case "fade":
                        methodShow = "fadeIn";
                        methodHide = "fadeOut";
                        //current && current.fadeOut();
                        //this.tabs[index].fadeIn();
                        break;
                    default:
                        methodShow = "show";
                        methodHide = "hide";
                        //current && current.hide();
                        //this.tabs[index].show();
                        break;
                }

                if (current && typeof(current[methodHide]) === "function") {
                    current[methodHide]();
                }

                if (tab && typeof(tab[methodShow]) === "function") {
                    tab[methodShow]();
                }

                this.currIndex = index;

                return this;
            },
            
            /**
             * 显示指定的标签页
             * @public
             * @method show
             * @param  {Number} index 指定要显示的标签的序号
             * @chainable
             */
            show : function(index) {
                var curIndex = this.currIndex,
                     cur;

                index = index || 0;
                //if (index === cur)return this;

                if (index<curIndex) {
                    this.prev(index);
                } else if (index>curIndex) {
                    this.next(index);
                } else {
                    cur = this.tabs[this.currIndex];
                    if (cur) {
                        cur.fadeIn();
                    }
                }
                return this;
            },

            /**
             * 追加一个标签页，标签页只能是tbc.Tabpage的实例
             * @public
             * @method append
             * @param  {tbc.Tabpage} tabpage 要追加的标签页，tbc.Tabpage的实例
             * @chainable
             */
            append : function(tabpage) {

                var self = this;

                this.header.append(tabpage.handle);
                this.container.append(tabpage.container);
                this.tabs.push(tabpage);

                tabpage.handle.bind("click", function() {
                    self.show(tabpage.index);
                });

                if (tabpage.autoShow) {
                    this.show(this.tabs.length-1);
                }

                tabpage.index = this.tabs.length-1;
                tabpage.group = this;

                tabpage.addEvent({
                    close : function() {
                        self.remove(tabpage.index);
                    },
                    beforeShow  : function() {
                        var ind = this.index;
                        $.each(self.tabs, function(i, tab) {
                            if (i !== self.currIndex && i !== ind) tab.hide();
                        });
                    }
                });
                return this;
            },

            /**
             * 从前面追加一个标签页，标签页只能是tbc.Tabpage的实例
             * @public
             * @method prepend
             * @param  {tbc.Tabpage} tabpage 要追加的标签页，tbc.Tabpage的实例
             * @chainable
             */
            prepend : function(tabpage) {

                var SELF = this;
                this.header.prepend(tabpage.title);
                this.container.prepend(tabpage.content);
                this.tabs = [tabpage].concat(this.tabs);

                if (tabpage.autoShow) { this.show(0); }
                tabpage.index = 0;
                tabpage.group = this;

                tabpage.addEvent({
                    close : function() { SELF.remove(tabpage.index);}
                });

                return this;
            },

            /**
             * 设置标签页切换的方式
             * @public
             * @method effect
             * @param  {String} effects 效果，取值范围：['slide-x', 'slide-y', 'fade', 'none']
             * @chainable
             */
            effect : function(effects) {
                if (typeof(effects) !== "string") {
                    return options.effects;
                }else{
                    options.effects = effects;
                }
                return this;
            },

            /**
             * 设置标签页切换的缓冲效果
             * @public
             * @method easing
             * @param  {String} effects 缓冲效果，取值范围：jQuery.easing所设置的值
             * @chainable
             */
            easing : function(easing) {
                if (typeof(easing) !== "string") {
                    return options.easing;
                }else{
                    options.easing = easing;
                }
                return this;
            },

            /**
             * 移除一个标签页
             * @public
             * @method remove
             * @param  {Number} index 要移除的标签页序号
             * @chainable
             */
            remove : function(index) {
                if (index === this.currIndex) {
                    if (index<this.tabs.length-1) {
                        this.excludeTab(index);
                        this.next();
                    } else if (index>0) {
                        this.excludeTab(index);
                        this.prev();
                    }
                } else if (index < this.currIndex) {
                    this.excludeTab(index);
                    this.currIndex-=1;
                    this.show(this.currIndex);
                } else {
                    this.excludeTab(index);
                }
                //this.excludeTab(index);
                return this;
            },

            /**
             * 将一个标签页的序号从此标签集排除，不在接受
             * 此标签集的管理
             * @public
             * @method excludeTab
             * @param {Number} index 标签页的序号
             * @chainable
             */
            excludeTab : function(index) {

                var tabs = [],
                    _tab,
                    i,
                    len;
                for (i=0,len=this.tabs.length; i<len; i++) {
                    _tab = this.tabs[i];
                    if (_tab && _tab.index !== index) {
                        _tab.index = tabs.length;
                        tabs.push(_tab);
                    }
                }

                _tab = null;
                this.tabs = tabs;
                return this;
            }
        })
        .addEvent ({
            "destroy" : function () {
                defaults = options = settings = null;
            }
        })
        .init();
    }
}(tbc, jQuery));

// 在线人数更新
tbc.namespace("tbc.tree");
tbc.tree.Editor = tbc.tree.Editor || function (settings) {
	
	var SELF = tbc.self(this, arguments),
		
		defaults = {
			editUrl:"",
			
			addible		: true,
			editable	: true,
			deletable	: true
			
		},
		
		options = $.extend({}, defaults, settings);
	
	SELF.extend ([tbc.Tree, settings], {
		
		packageName : "tbc.tree.Editor",
		
		 // 是否能删除
		isDeletable : function (id) {
			return this.hasChildren (id);
		},
		
		// 操作菜单
		hoverTools : function (id) {
			
			var tools = [],
				node  = typeof id === "string" ? this.cache(id) : id;
			
			!options.level || node.level<options.level 
				? tools.push('<a href="javascript:void(0);" class="stree-add">新增</a>')
				: tools.push('<span style="color:#888; text-decoration:line-through;">新增</span>');
			
			var isRoot = this.isRoot(id);
			if (!isRoot) {
				tools.push('<a href="javascript:void(0);" class="stree-edit">编辑</a>');
				
				!this.isFirst(id) 
					? tools.push('<a href="javascript:void(0);" class="stree-moveup">上移</a>')
					: tools.push('<span style="color:#888; text-decoration:line-through;">上移</span>');
				
				!this.isLast(id)
					? tools.push('<a href="javascript:void(0);" class="stree-movedown">下移</a>')
					: tools.push('<span style="color:#888; text-decoration:line-through;">下移</span>');
				
				!this.isDeletable(id)
					? tools.push('<a href="javascript:void(0);" class="stree-delete">删除</a>')
					: tools.push('<span style="color:#888; text-decoration:line-through;">删除</span>');
			}
			
			try { return tools.join("&nbsp;&nbsp;|&nbsp;&nbsp;"); } finally { node = tools = ""; }
		},
		
		// 新增
		nodeAddHandle : function (id) {
			var node = typeof(id) === "string" ? this.cache(id) : id;
			
			if (node && this.triggerEvent("beforeAdd", node) !== false) {
				
				if (this.addbox) {
					this.addbox.show();
					this.addbox.locate($(".stree-text", node.html));
					this.addbox.container.find("._cont")
					.empty().load(options.addUrl);
				} else {
					this.addbox = new tbc.Pop({ name:"新增", width:400, height:340});
					this.addbox.appendTo("body");
					this.addbox.show();
					this.addbox.locate($(".stree-text", node.html));
					this.addbox.addEvent({close:function() {SELF.addbox=null;} });
					
					this.addbox.append('<div class="tbc-titleBar"><b>新增</b> &nbsp;<i style="color:#aaa;">(双击标题关闭)</i></div><div class="_cont"><div style="text-align:center;">Loading...</div></div>');
					
					this.addbox.container
					.delegate(".tbc-titleBar", "dblclick", function() { SELF.addbox.close(); })
					.find("._cont").load(options.addUrl, {id:node.property.id});
					
				}
				this.addbox.__nodeid = node.property.id;
			}
		},
		
		// 编辑
		nodeEditHandle : function (id) {
			var node = typeof(id) === "string" ? this.cache(id) : id;
			if (node && this.triggerEvent("beforeEdit", node) !== false) {
				
				if (this.editbox) {
					this.editbox.show();
					this.editbox.locate($(".stree-text", node.html));
					this.editbox.container.find("._cont")
					.empty().load(options.editUrl);
				} else {
					this.editbox = new tbc.Pop({ width:400, height:340});
					this.editbox.appendTo("body");
					this.editbox.show();
					this.editbox.locate($(".stree-text", node.html));
					this.editbox.addEvent({close:function() {SELF.editbox=null;} });
					
					this.editbox.append('<div class="tbc-titleBar"><b>编辑:</b><i>'+ (node.property.nm||node.property.text||"") +'</i> &nbsp;<i style="color:#aaa;">(双击标题关闭)</i></div><div class="_cont"></div>');
					
					this.editbox.container
					.delegate(".tbc-titleBar", "dblclick", function() { SELF.editbox.close(); })
					.find("._cont").load(options.editUrl, {id:node.property.id});
				}
				this.editbox.__nodeid = node.property.id;
			}
		},
		
		// 检测
		nodeDeleteCheck : function() {
			
		},
		
		// 删除
		nodeDelete : function (id) {
			id = typeof id === "string" ? this.cache(id) : id;
			
			var node	= $(id.html).css({background:"yellow"});
			
			if (node.hasClass("disabled")) {
				node=null;
				return false;
			} else {
				node.addClass("disabled");
			}
			
			var self	= SELF,
				button	= node.find(".stree-delete"),
				offset	= button.offset(),
				tips	= $('<div class="tbc-tips">确定删除吗?&nbsp;&nbsp;<a class="_dle" href="javascript:void(0);">删除</a>&nbsp;<a class="_cancel" href="javascript:void(0);">取消</a></div>')
					.css({ left:offset.left, top:offset.top-12, opacity:0, background:"#fff", border:"1px solid #ccc", padding:"6px", position:"absolute", zIndex:"10000"})
					.appendTo("body")
					.animate({left:"+=24px", opacity:1}, 200),
				close	= function() {
					tips&&tips.stop().animate
					(
						{ left:"-=64px", opacity:0 },
						200,
						function() {
							node&&node.css({background:""}).removeClass("disabled");
							tips&&tips.remove();
							id=self=node=button=offset=tips=close=null;
						}
					) 
				};
			
			tips.delegate("a._dle", "click", function(event) { self.nodeDeleteAjax(id); close(); });
			tips.delegate("a._cancel", "click", function(event) { close(); });
			
			tips.animate({opacity:0}, 10000, close);
		},
		
		removeNode : function (id) {
			var node	= typeof id === "string" ? this.cache(id) : id,
				parent	= node.parents[node.parents.length-1],
				sibling	= this.cache(parent).property.sn,
				index,
				nnode	= node.html;
			
			for (var i=0,len=sibling.length; i<len; i++) {
				if (sibling[i].id === id) {
					index = i;
					break;
				}
			}
			this.cache(parent).property.sn = sibling.slice(0, index).concat(sibling.slice(index+1,len));
			nnode.parentNode.removeChild(nnode);
			
			node = parent = sibling = index = nnode = len = null;
		},
		
		nodeDeleteAjax : function (id) {
			id = typeof id === "string" ? id : id.property?id.property.id:null;
			var self = SELF;
			if (options.deleteUrl && id) {
				$.ajax({
					url 		: options.deleteUrl,
					type		: "post",
					dataType	: "json",
					data		: { id:id, action:"delete" },
					beforeSend	: function() {},
					complete	: function() {},
					error		: function() {},
					success		: function(result) {
						if (result.success) {
							self.deleteNode(id);
							self.triggerEvent("delete", id);
							self=null;
						} else {
							alert(result.message||"删除失败");
						}
					}
				});
			}
		},
		
		// 上移
		nodeMoveup : function (id) {
			if (!id || this.isFirst(id)) { return }
			
			var node	= this.cache(id),
				parent	= node.parents[node.parents.length-1],
				sibling	= this.cache(parent).property.sn,
				prev;
			
			for (var i=0,len=sibling.length; i<len; i++) {
				if (sibling[i].id === id) {
					prev = sibling[i-1];
					sibling[i-1] = sibling[i];
					sibling[i] = prev;
					break;
				}
			}
			
			// HTML节点
			var nnode = $(node.html).parent();
				nnode.insertBefore(nnode.prev());
				
			this.nodeMoveAjax(id, "up");
			
			node = nnode = paren = sibling = next = null;
		},
		
		// 下移
		nodeMovedown : function (id) { 
			if (!id || this.isLast(id)) { return }
			
			var node	= this.cache(id),
				parent	= node.parents[node.parents.length-1],
				sibling	= this.cache(parent).property.sn,
				next;
			
			for (var i=0,len=sibling.length; i<len; i++) {
				if (sibling[i].id === id) {
					next = sibling[i+1];
					sibling[i+1] = sibling[i];
					sibling[i] = next;
					break;
				}
			}
			
			// HTML节点
			var nnode = $(node.html).parent();
				nnode.insertAfter(nnode.next());
				
			this.nodeMoveAjax(id, "down");
			
			node = nnode = paren = sibling = next = null;
		},
		
		nodeMoveAjax : function (id, type) {
			id = typeof id === "string" ? id : id.property?id.property.id:null;
			var self = SELF;
			if (options.moveUrl && id && type) {
				$.ajax({
					url 		: options.moveUrl,
					type		: "post",
					data		: { id:id, type:type },
					dataType	: "html",
					beforeSend	: function() {},
					complete	: function() {},
					error		: function() {},
					success		: function() {
						self.triggerEvent("move", id, type);
						self=null;
					}
				});
			}
		}
	});
	
	// HoverIn
	SELF.ui.delegate(".stree-node", "mouseenter", function (event) {
		var id = this.getAttribute("data-id"),
			tools = SELF.hoverTools (id);
		$(this).addClass("stree-node-hover")
		.find(".stree-node-tools").css({display:"inline"}).html(tools);
	});
	
	// HoverOut
	SELF.ui.delegate(".stree-node", "mouseleave", function (event) {
		$(this).removeClass("stree-node-hover")
		.find(".stree-node-tools").hide().html("");
	});
	
	// 新增
	SELF.ui.delegate(".stree-add", "click", function (event) {
		event.stopPropagation();
		var id = this.parentNode.parentNode.getAttribute("data-id");
		SELF.nodeAddHandle(id);
	});
	
	// 上移
	SELF.ui.delegate(".stree-moveup", "click", function (event) {
		event.stopPropagation();
		var id = this.parentNode.parentNode.getAttribute("data-id");
		SELF.nodeMoveup(id);
	});
	
	// 下移
	SELF.ui.delegate(".stree-movedown", "click", function (event) {
		event.stopPropagation();
		var id = this.parentNode.parentNode.getAttribute("data-id");
		SELF.nodeMovedown(id);
	});
	
	// 编辑
	SELF.ui.delegate(".stree-edit", "click", function (event) {
		event.stopPropagation();
		var id = this.parentNode.parentNode.getAttribute("data-id");
		SELF.nodeEditHandle(id);
	});
	
	// 删除
	SELF.ui.delegate(".stree-delete", "click", function (event) {
		event.stopPropagation();
		var id = this.parentNode.parentNode.getAttribute("data-id");
		SELF.nodeDelete(id);
	});
	
}
/**
 * @class tbc.Tree
 * @constructor
 * @author mail@luozhihua.com
 */
;(function(tbc, $){
    window.tbc = tbc || {};
    
    tbc.Tree = function(settings) {
        "use strict";
        
        // 默认配置
        var SELF = tbc.self(this, arguments),
            defaults = {
                width       : 'auto',
                height      : 'auto',
                url         : null,
                level       : 1,
                lazyLevel   : 4,
                deleteNode  : true,
                upNode      : true,
                downNode    : true,
                cascadeCheck: true,
                singleCheck : false,
                multiple    : false,
                editable    : true,
                
                addUrl      : null,
                deleteUrl   : null,    
                editUrl     : null,
                moveUrl     : null,
                
                data        : null,
                addNode     : true,
                extool      : [],
                confirmmsg  : '确定要删除{name}吗?',
                exconfirmmsg: '删除后将无法恢复,确定要删除吗?',
                errormsg    : '无法删除',
                
                formatExtool: function() {},
                isRetracted : true,
                renderTo    : ''
                // selectRule : "ALL", // 
                
                /*
                onLoad        : function() {},
                onCheck        : function() {},
                onSelect    : function() {},
                onDelete    : function() {},
                
                event : {
                      'addNode'        : function(opt) { } // opt={id:newNodeId, pr:parentNodeId, nm:nodeName, sg:before}
                    , 'deleteNode'    : function(node, parents) {} // node={id:nodeId, nm:nodeName, tp:nodeType, sn:subNode}; parents=[parentsId,...]
                    , 'fold'        : function(node) {} // node={id:nodeId, nm:nodeName, tp:nodeType, sn:subNode};
                    , 'unfold'        : function(node) {} // node={id:nodeId, nm:nodeName, tp:nodeType, sn:subNode};
                    , 'check'        : function(node) {} // node={id:nodeId, nm:nodeName, tp:nodeType, sn:subNode};
                    , 'uncheck'        : function(node) {} // node={id:nodeId, nm:nodeName, tp:nodeType, sn:subNode};
                    , 'select'        : function(node, HTMLElement_Of_Node, child) {}
                    
                    
                    , 'beforeLoad'    : function() {}
                    , 'afterLoad'    : function() {}
                    , 'error'        : function() {}
                    , 'beforeRender': function() {}
                    , 'afterRender' : function() {}
                }
                */
            },

            // 选项
            options = $.extend({}, defaults, settings);
        
        options.container    = options.ui ? $(options.ui).find(options.container) : $(options.container);
        options.ui            = options.ui ? $(options.ui) : options.container;
        
        SELF.addEvent(options.event);
        SELF.addEvent({
            'afterRender' : function() { if ($.isFunction(options.onLoad)) {options.onLoad.apply(this, arguments);} },
            'select'      : function() { if ($.isFunction(options.onSelect)) {options.onSelect.apply(this, arguments);} },
            'deleteNode'  : function() { if ($.isFunction(options.onDelete)) {options.onDelete.apply(this, arguments);} },
            'check'       : function() { if ($.isFunction(options.onCheck)) {options.onCheck.apply(this, arguments);} },
            'move'        : function() { if ($.isFunction(options.onMove)) {options.onMove.apply(this, arguments);} },
            'addNode'     : function() { if ($.isFunction(options.onAdd)) {options.onAdd.apply(this, arguments);} }
        });

        SELF.packageName = "tbc.Tree";
        SELF.extend ({
            
            ui            : options.ui,
            container    : options.container,
            
            appendTo    : function(box) {
                if ($(box).size()) {
                    this.container.appendTo(box);
                }
            },
            
            data    : null,
            
            // 初始化
            init    : function () {
                switch (options.dataType) {
                    case "json" : 
                        this.render(options.data);
                        break;

                    case "ajax" :
                        this.load();
                        break;

                    default:
                        this.load();
                        break;
                }
            },

            load    : function () {
                
                var ah = $.ajax({
                    url        : options.url,
                    type    : options.param?"post":"get",
                    data    : $.extend({}, options.param, {noDepPath:options.noDepPath}),
                    dataType: "json",
                    beforeSend    : function () { SELF.triggerEvent("beforeLoad") },
                    complete: function () { SELF.triggerEvent("afterLoad"); },
                    error    : function () { SELF.triggerEvent("error", "loading failed!"); },
                    success    : function (json) { SELF.render(json); }
                });

                this.addEvent({
                    "destroy" : function() {
                        ah.abort && ah.abort();
                        ah = null;
                    }
                });
            },
            
            // 渲染tree
            render    : function (data) {
                this.triggerEvent("beforeRender");
                var st = new Date().getTime();
                this.container.html (this.createChild(data));
                //window.console && console.log(">tbc.Tree> render time: "+ (new Date().getTime()-st) + "ms");
                this.addHtmlCache();
                //window.console && console.log(">tbc.Tree> cache time: "+ (new Date().getTime()-st) + "ms");
                
                this.triggerEvent("afterRender");
            },
            
            // 更新HTML缓存
            addHtmlCache : function (html) {
                html = html ? $(html) : this.container.find("dt.stree-node");
                
                var self = SELF;
                $(html).each(function() {
                    var id = this.getAttribute("data-id");
                    self.cache(id, "html", this);
                });
                self = html = null;
            },
            
            /*
             * 缓存数据
             * @param    : id;
             * @param    : key;
             * @param    : data;
             */
            cache : function(id, key, data) {
                if (id === "index") {
                    return this._cacheIndex;
                } else if (id) {
                    var cache = this._cacheData[id];
                    if (!cache) {
                        cache = this._cacheData[id] = {};
                    }
                    
                    if (key) {
                        if (data !== undefined) { cache[key] = data; }
                    } else {
                        try{ return cache; } finally { cache=null; }
                    }
                    
                    try{ return cache[key]; } finally { cache=null; }
                } else {
                    return this._cacheData;
                }
            },
            
            // 缓存存储器
            _cacheData  : {},
            _cacheIndex : [],
            
            /*
             * 创建子节点
             */
            createChild : function(children, level, parents, notRender) {
                
                level = level || 0;
                parents = parents||[];
                
                var root,
                    curr,
                    leng = children.length,
                    id, properties,
                    self = SELF,
                    i;
                    
                for (i=0; i<leng; i+=1) {
                    
                    properties = children[i];
                    id = properties.id;
                    
                    // 兼容旧数据
                    if (properties.children && !properties.sn) { 
                        properties.sn = properties.children;
                    }
                    
                    // 缓存每个节点的数据
                    this.cache(id, "property", properties);
                    this.cache(id, "level", level);
                    this.cache(id, "parents", parents);
                    
                    this._cacheIndex.push(id);
                    
                    if (notRender===true) {
                        if (this._delayCreateNode) {
                            this._delayCreateNode(properties, level, parents.concat([id]), curr, notRender);
                        } else {
                            break;
                        }
                    } else {
                        if (i === 0) curr = "first";
                        if (i === leng-1) curr = "last";
                        if (!root) root = ["<ul>"];
                        root.push (this.createNode (properties, level, parents.concat([id]), curr, notRender));
                        if (curr === "last") root.push('</ul>');
                    }
                }
                
                // 返回并清除引用
                try { return root ? root.join("") : ""; } finally { root = null; }
            },
            
            /*
             * 延迟遍历子节点
             */
            _delayCreateNode : function(a, b, c, d, e) {
                var self = this;
                setTimeout(function() {
                    if (self.createNode) self.createNode (a, b, c, d, e); 
                    self = null;
                }, 0);
            },
            
            /*
             * 创建节点
             * @param    : properties
             */
            createNode : function(properties, level, parents, firstLast, notRender) {
                
                var id    = properties.id,
                    child = properties.sn || properties.children,
                    lazyLevel, cache, name, childHtml, FLCLS, classN, tools, checkbox, html;
                
                // 如果是懒渲染, 则直接遍历子节点并返回
                if (notRender===true && child && child.length>0) {
                    this.createChild(child, level+1, parents, notRender);
                    child = null;
                    return "";
                }
                
                lazyLevel= options.lazyLevel || 2;
                cache    = this.cache(id);
                name     = properties.nm||properties.text;
                childHtml= "";
                FLCLS    = firstLast==="first" ? " tbc-tree stree-node-first" : firstLast==="last" ? " stree-node-last" : "";
                classN   = "stree-node stree-level-{3}" + FLCLS + (!child||child.length===0?" stree-leaf":"");
                tools    = '<div class="stree-node-tools" style="display:none; float:none;"></div>';
                checkbox = options.checkbox ? 
                                '<span class="tbc-checkbox stree-checkbox" data-id="{0}" data-text="{1}">' +
                                   '    <input type="checkbox" name="'+ options.checkboxName +'" value="{0}" title="{1}" ' +(cache&&cache.checked?' checked="checked" ':'')+ '/>' +
                                   '</span>'
                                :  '';
                
                // 0:id; 1:name; 2:class; 3:level; 4:tools; 5:children
                html        =  '<li>' +
                               '    <dt data-id="{0}" data-text="{1}" title="{1}" class="{2}">' +
                               '        <span class="stree-space" style="width:'+ (level*16) +'px;"></span>' +
                               '        <span class="stree-handle" level="{3}"></span>' +
                                        checkbox +
                               '        <span class="stree-icon stree-icon-{3}"></span>' +
                               '        <span class="stree-text">{1}</span>' +
                               '       {4}' +
                               '    </dt>' +
                               '    {5}' +
                               '</li>';
            
                if (child && child.length>0) {
                    
                    // 直接渲染子节点
                    if (level<lazyLevel) {
                        childHtml = this.createChild(child, level+1, parents);
                        this.cache(id, "rendered", true);
                    
                    // 懒渲染
                    } else if (child) {
                        this.createChild(child, level+1, parents, true);
                        classN += " stree-node-retracted";
                    }
                }
                
                html = tbc.formatString(html, id, name, classN, level, tools, childHtml);
                
                // 返回并清除引用
                try {
                    return html;
                } finally {
                    classN = child = html = id = name = null;
                }
            },
            
            /*
             * 新增节点
             * @param: id; 插入节点的ID或者节点属性集: [string or object{id:id,pr:parentId, nm:name, sg:insert position}];
                             当id参数为object类型时,会忽略其他参数
             * @param: parentId; 父节点ID或父节点属性集合;
             * @param: text; 节点名称;
             * @param: before; 插入节点的位置(可选, 没有该参数将插入父节点的最后);
             */
            addNode : function (id, text, parentId, before) {
                var opt        = typeof id==="string" ? {id:id, pr:parentId, nm:text, sg:before} : id,
                    parent    = this.cache(parentId),
                    pNode    = $(parent.html).removeClass("stree-leaf"),
                    node;
                
                switch (before) {
                    case "prepend" : 
                        this.prependNode.apply (this, arguments);
                        break;
                    case "append" :
                        this.appendNode.apply (this, arguments);
                        break;
                    default:
                        this.insertNode.apply (this, arguments);
                }
                
                opt = parent = pNode = node = null;
            },
            
            /* 
             * 在最后面插入节点
             * @param: id; 插入节点的ID或者节点属性集: [string or object{id:id,pr:parentId, nm:name, sg:insert position}];
                             当id参数为object类型时,会忽略其他参数
             * @param: parentId; 父节点ID或父节点属性集合;
             * @param: text; 节点名称;
             */
            appendNode : function (id, text, parentId) {
                var opt        = typeof id==="string" ? {id:id, pr:parentId, nm:text} : id,
                    parent    = this.cache(parentId),
                    pNode    = $(parent.html).removeClass("stree-leaf"),
                    node,
                    p;
                    
                if (opt) {
                    p = parent.parents.concat([opt.pr]);
                    node    = $(this.createChild([opt], parent.level+1, p));
                    
                    if (pNode.next("ul").size()) {
                        pNode.next("ul").append (node.html());
                    } else {
                        pNode.after(node);
                    }
                    
                    this.addHtmlCache(pNode.next("ul").find(".stree-node"));
                    parent.rendered = true;
                }
                parent.property.sn = parent.property.sn || [];
                parent.property.sn.push(opt);
                
                this.triggerEvent("addNode", opt);
                opt = parent = pNode = node = p = null;
            },
            
            /* 
             * 在最前面插入节点
             * @param: id; 插入节点的ID或者节点属性集: [string or object{id:id,pr:parentId, nm:name, sg:insert position}];
                             当id参数为object类型时,会忽略其他参数
             * @param: parentId; 父节点ID或父节点属性集合;
             * @param: text; 节点名称;
             */
            prependNode : function (id, text, parentId) {
                var opt        = typeof id==="string" ? {id:id, pr:parentId, nm:text} : id,
                    parent    = this.cache(parentId),
                    pNode    = $(parent.html).removeClass("stree-leaf"),
                    node, p;
                    
                if (opt) {
                    p = parent.parents.concat([opt.pr]);
                    node    = $(this.createChild([opt], parent.level+1, p));
                    
                    if (pNode.next("ul").size()) {
                        pNode.next("ul").prepend (node.html());
                    } else {
                        pNode.after(node);
                    }
                    
                    this.addHtmlCache(pNode.next("ul").find(".stree-node"));
                    parent.rendered = true;
                }
                parent.property.sn = [opt].concat(parent.property.sn || []);
                
                this.triggerEvent("addNode", opt);
                opt = parent = pNode = node = p = null;
            },
            
            /*
             * 级别调整
             * 
             */
            adjustNode : function (id, parentId) {
                
            },
            
            /* 
             * 插入节点
             * @param: id; 插入节点的ID或者节点属性集: [string or object{id:id,pr:parentId, nm:name, sg:insert position}];
                             当id参数为object类型时,会忽略其他参数
             * @param: parentId; 父节点ID或父节点属性集合;
             * @param: text; 节点名称;
             * @param: before; 插入节点的位置(可选, 没有该参数将插入父节点的最后);
             */
            insertNode : function (id, text, parentId, before) {
                var opt        = typeof id==="string" ? {id:id, pr:parentId, nm:text, sg:before} : id,
                    parent    = this.cache(parentId),
                    pNode    = $(parent.html).removeClass("stree-leaf"),
                    sibling = parent.property.sn || [],
                    node,
                    p, i, len;
                before = typeof before==="string" ? this.cache(before) : before;
                
                if (!before) {
                    this.appendNode(id, text, parentId);
                } else {
                    p = parent.parents.concat([opt.pr]);
                    node    = $(this.createChild([opt], parent.level+1, p));
                    
                    for (i=0,len=sibling.length; i<len; i+=1) {
                        if (sibling[i].id===before.property.id) {
                            parent.property.sn = sibling.slice(0,i).concat([opt]).concat(sibling.slice(i, len));
                            
                            if (pNode.next("ul").size()) {
                                $(this.cache(sibling[i].id, "html")).after(node.html());
                            } else {
                                pNode.after(node);
                            }
                            break;
                        }
                    }
                    
                    this.addHtmlCache(pNode.next("ul").find(".stree-node[data-id='"+opt.id+"']"));
                    parent.rendered = true;
                }
                
                this.triggerEvent("addNode", opt);
                opt = parent = pNode = sibling = node = p = null;
            },
            
            /*
             * 重命名节点
             * @param    : id[string]; 节点ID
             * @param    : name[string]; 节点新名称
             */
            renameNode : function(id, name) {
                id = typeof id==="string" ? this.cache(id) : id;
                
                if (id && name) {
                    var ond = $(id.html).find(".stree-text"),
                        onm = ond.text();
                    
                    if (id.property) {
                        id.property.nm = name;
                    }
                    
                    ond.html(name);
                    
                    this.triggerEvent("rename", id, name, onm);
                    
                    ond = onm = null;
                }
            },
            
            /*
             * 删除节点
             * @param: id; 节点ID
             */
            deleteNode : function (id) {
                id = typeof id==="string" ? this.cache(id) : id;
                
                if (this.hasChildren(id)) {
                    return;
                }
                
                var parents    = id.parents,
                    parent, sibling, newSib,
                    i, len;
                
                if (parents && parents.length>0) {
                    parent  = this.cache(parents[parents.length-1]);
                    sibling = parent.property.sn||[];
                    newSib  = [];
                    
                    for (i=0,len=sibling.length; i<len; i+=1) {
                        if (sibling[i].id !== id.property.id) {
                            newSib.push(sibling[i]);
                        }
                    }
                    parent.property.sn = newSib;
                }
                $(id.html).remove();
                
                this.triggerEvent("deleteNode", id, parents);
                sibling = newSib = null;
            },
            
            /*
             * 展开或者折叠树节点
             * @param    : id[string|htmlElement|jQuery selector|jQuery object];
             */
            toggleNode    : function (id) {
                var itm = typeof id==="string" ?
                        this.container.find("div[data-id='"+ id +"']") :
                        $(id);
                
                if (itm.size() !== 0) {
                    if (itm.hasClass("stree-node-retracted")) {
                        this.unfoldNode(itm);
                    } else {
                        this.foldNode(itm);
                    }
                }
            },
            
            /*
             * 展开树节点
             * @param    : id[string|htmlElement|jQuery selector|jQuery object];
             */
            unfoldNode : function (id) {
                var itm = typeof id==="string" ?
                    this.container.find("div[data-id='"+ id +"']") :
                    $(id);
                    
                if (itm.size() !== 0) {
                    itm.removeClass("stree-node-retracted");
                    itm.next("ul").removeClass("hide");
                }
                this.triggerEvent("unfold", itm);
            },
            
            /*
             * 折叠树节点
             * @param    : id[string|htmlElement|jQuery selector|jQuery object];
             */
            foldNode : function (id) { 
                var itm = typeof id==="string" ?
                    this.container.find("div[data-id='"+ id +"']") :
                    $(id);
                
                if (itm.size() !== 0) {
                    itm.addClass("stree-node-retracted");
                    itm.next("ul").addClass("hide");
                }
                
                this.triggerEvent("fold", itm);
            },
            
            // 返回选中的节点
            getChecked : function() {
                var checked = [],
                    index    = this._cacheIndex,
                    node,
                    i, len;
                for (i=0,len=index.length; i<len; i+=1) {
                    node = this.cache(index[i]);
                    if (node.checked) {
                        checked.push(node);
                    }
                }
                
                try { return checked; } finally { checked=node=index=null; }
            },
            
            /*
             * 获取子节点
             */
            getChildNodes : function (id, traversal) {
                
                var cache = typeof id==="string" ? this.cache(id) : id,
                    child = cache&&cache.property ? cache.property.sn||cache.property.children||[] : [],
                    nodes = [],
                    itm, ele,
                    i, len;
                for (i=0,len=child.length; i<len; i+=1) { 
                    itm = child[i];
                    ele = this.cache(itm.id);
                    
                    if (ele) {
                        nodes.push(ele);
                    }
                    
                    if (traversal && (itm.sn||itm.children)) {
                        nodes = nodes.concat(this.getChildNodes(itm.id, traversal));
                    }
                }
                
                try{ return nodes; } finally { cache = child = nodes = itm = ele = id = null; }
            },
            
            isRoot : function (id) {
                var cache = typeof id==="string" ? this.cache(id) : id;
                try {
                    return (cache && cache.level===0);
                } finally {
                    cache = null;
                }
            },
            
            /*
             * 获取同级节点
             */
            getSiblings : function (id) {
                var cache = typeof id==="string" ? this.cache(id) : id,
                    parent= cache.parents ? cache.parents[cache.parents.length-1] : null,
                    siblings = parent&&parent.property ? parent.property.sn||parent.property.children||[] : [],
                    nodes = [],
                    itm, ele,
                    i, len;
                    
                if (parent) {
                    parent = this.cache(parent);
                }
                
                for (i=0,len=siblings.length; i<len; i+=1) { 
                    itm = siblings[i];
                    ele = this.cache(itm.id);
                    if (ele && itm.id !== id) {
                        nodes.push(ele);
                    }
                }
                
                try{ return nodes; } finally { cache = parent  = siblings = nodes = itm = ele = id = null; }
            },
            
            // 选中节点
            checkNode : function(list, callback) {
                
                if (!tbc.isArray(list)) {
                    return tbc.log("Error at tbc.Tree().checkNode(list): arguments[0]:list must be an array;");
                }
                
                // 分批选中
                if (false !== this.triggerEvent("beforeCheck", list)) {
                    if (list.length>0) {
                        tbc.batch(
                            list, 1000, 0, 10,
                            function (portion, isEnd, current) {
                                var node,
                                    i, len;
                                for (i=0,len=portion.length; i<len; i+=1) {
                                    node = portion[i];
                                    if (typeof node==="string") {
                                        node = SELF.cache(node);
                                    }
                                    
                                    node.checked = true;
                                    $(node.html).addClass(options.checkedCss||"stree-node-checked")
                                    .find("input[type='checkbox']").attr("checked", true);
                                }
                                
                                if (isEnd && (!tbc.isFunction(callback) || callback.call(SELF, list) !== false)) {
                                    SELF.triggerEvent("check", list);
                                }
                                
                                if (current===4) {
                                    tbc.lock(SELF.ui);
                                }
                            },
                            function() { 
                                tbc.unlock(SELF.ui);
                            }
                       );
                    }
                }
            },
            
            /*
             * 取消选中某个节点
             * @param    : id[string|htmlElement|jQuery object];
             */
            uncheckNode : function (list, callback) {
                
                if (!tbc.isArray(list)) {
                    return tbc.log("Error at tbc.Tree().uncheckNode(list): arguments[0]:list must be an array;");
                }
                
                if (false !== this.triggerEvent("beforeUncheck", list)) {
                    
                    // 分批取消选中
                    if (list.length>0) {
                        tbc.batch (
                            list, 1000, 0, 10,
                            function (portion, isEnd, current) {
                                var node, i, len;
                                for (i=0,len=portion.length; i<len; i+=1) {
                                    node = portion[i];
                                    if (typeof node==="string") {
                                        node = SELF.cache(node);
                                    }
                                    
                                    node.checked = false;
                                    $(node.html).removeClass(options.checkedCss||"stree-node-checked")
                                    .find("input[type='checkbox']").removeAttr("checked");
                                }
                                
                                if (isEnd && (!tbc.isFunction(callback) || callback.call(SELF, list) !== false)) {
                                    SELF.triggerEvent("uncheck", list);
                                }
                                
                                if (current===4) {
                                    tbc.lock(SELF.ui);
                                }
                            },
                            function() { 
                                tbc.unlock(SELF.ui);
                            }
                       );
                    }
                }
            },
            
            // 选中或取消节点
            chooseNode: function (id, multiple) {
                id = typeof id==="string" ? this.cache(id) : id;
                
                var o = options,
                    current = this.getWillBeChecked(id);
                    
                if (!o.singleCheck) {
                    if (id.checked) {
                        this.uncheckNode(current);
                    } else {
                        this.checkNode(current);
                    }
                } else {
                    
                    if (!multiple && o.singleCheck) {
                        this.uncheckNode(this.getWillBeUnchecked(id));
                    }
                    
                    if (id.checked) {
                        this.uncheckNode(current);
                    } else {
                        this.checkNode(current);
                    }
                }
                
                id = current = o = null;
            },
            
            // 获取准备选中的节点
            getWillBeChecked : function(id) {
                id = typeof id==="string" ? this.cache(id) : id;
                
                var child = [id];
                if (options.cascadeCheck) {
                    child = child.concat(this.getChildNodes(id, true));
                }
                try { return child; } finally { child = id = null; }
            },
            
            // 获取准备取消选中的节点
            getWillBeUnchecked : function(exclude) {
                exclude = typeof exclude==="string" ? this.cache(exclude) : exclude;
                var cache = this.cache(),
                    id,
                    index = this.cache("index"),
                    checked = [],
                    i, len;
                
                for (i=0,len=index.length; i<len; i+=1) {
                    id = index[i];
                    if (!options.cascadeCheck && (exclude&&exclude.property.id !== id) && cache[id].checked) {
                        checked.push(cache[id]);
                    } else if (
                        (exclude&&exclude.property.id !== id) && 
                        cache[id].checked &&
                        tbc.array.indexOf(exclude.property.id, cache[id].parents)===-1
                   ) {
                        checked.push(cache[id]);
                    }
                }
                
                try { return checked; } finally { checked = cache = index = id = null; }
            },
            
            
            hasChildren : function (id) {
                var node = typeof id==="string" ? this.cache(id) : id;
                try { 
                    return node && node.property.sn && node.property.sn.length>0;
                } finally {
                    node = null;
                }
            },
            
            // 是否处于所有统计节点的最前面
            isFirst    : function (id) {
                var node    = typeof id==="string" ? this.cache(id) : id,
                    paren    = node.parents[node.parents.length-1],
                    sibling    = paren ? this.cache(paren).property.sn : null,
                    retn    = (sibling && sibling[0].id===id) ? true : false;
                
                try { return retn; } finally { node = paren = sibling = null; }
            },
            
            // 是否处于所有统计节点的最后面
            isLast    : function (id) {
                var node   = typeof id==="string" ? this.cache(id) : id,
                    paren  = node.parents[node.parents.length-1],
                    sibling= paren ? this.cache(paren).property.sn : null,
                    retn   = sibling && sibling[sibling.length-1].id===id;
                try { return retn; } finally { node = paren = sibling = null; }
            },
            
            // 设为当前节点
            setCurrent: function (id) {
                
                id = typeof id==="string" ? this.cache(id) : id||this.getCurrent();
                
                var cls   = options.currentCss||"stree-node-selected",
                    data  = id.property,
                    elem  = id.html,
                    child = data && data.sn && data.sn.length>0,
                    oid;
                
                if (data) {
                    data.tp = data.tp||"ORGANIZATION";
                }
                
                // 已被选中为当前状态
                if ($(id.html).hasClass(cls)) {
                    this.triggerEvent("select",  data, $(elem), child);
                    cls = data = elem = child = null;
                    return;
                }
                
                oid = this.container.find("dt."+cls).removeClass(cls).attr("data-id");
                this.cache(oid, "current", false);
                
                $(id.html).addClass(cls);
                id.current = true;
                
                this.triggerEvent("select",  data, $(elem), child);
                cls = data = elem = child = null;
            },
            
            // 设为当前节点
            selectNode : function (id, multiple, dbl) {
                
                var node    = typeof id==="string" ? this.cache(id) : id||this.getCurrent(),
                    cls        = options.currentCss||"stree-node-selected",
                    data    = node.property,
                    elem    = node.html,
                    child    = data && data.sn && data.sn.length>0;
                
                if (data) {
                    data.tp = data.tp||"ORGANIZATION";
                }
                
                // Toggle selected
                if (node.current===true) {
                    
                    if (multiple !== true) {
                        this.deselectNode(this.getSelectedList());
                    } else {
                        $(node.html).removeClass(cls);
                        node.current = false;
                    }

                } else {
                    $(node.html).addClass(cls);
                    node.current = true;
                    this.triggerEvent("select",  data, $(elem), child, dbl);
                    if (multiple !== true) {
                        this.deselectNode(this.getSelectedList([node.property.id]));
                    }
                }
                
                cls = data = elem = child = null;
            },
            
            deselectNode : function (nodeList) {
                var cls = options.currentCss||"stree-node-selected",
                    i, len;
                for (i=0,len=nodeList.length; i<len; i+=1) {
                    $(nodeList[i].html).removeClass(cls);
                    nodeList[i].current = false;
                }
                this.triggerEvent ("deselect", nodeList);
            },
            
            getCurrent : function() {
                var node, id,
                    i, len;
                for (i=0,len=this._cacheIndex.length; i<len; i+=1) {
                    id        = this._cacheIndex[i];
                    node    = this.cache(id);
                    if (node.current === true) {
                        try { return node; } finally { id = node = null; }
                    }
                }
                
                id = this.container.children("ul:first").children("li:first").children(".stree-node").attr("data-id");
                
                try { return this.cache(id); } finally { id = node = null; }
            },
            
            
            /*
             * 获取已选中的节点
             * @param    : excludeList; // 排除的节点
             * @return    : Array: [{property:{id:"",nm:"",tp:"",np:""}, html, ...},...,{...}]; // 返回节点数组
             */
            getSelectedList : function(excludeList) {
                
                excludeList = $.isArray(excludeList) ? excludeList : [excludeList];
                
                var nodes = [],
                    id,
                    i, len, isExclude, j, k;
                for (i=0,len=this._cacheIndex.length; i<len; i+=1) {
                    id = this._cacheIndex[i];
                    if (this.cache(id).current) {
                        isExclude = false;
                        for (j=0,k=excludeList.length; j<k; j+=1) {
                            if (excludeList[j]===id) {
                                isExclude = true;
                                break;
                            }
                        }
                        
                        if (!isExclude) {
                            nodes.push (this.cache(id));
                        }
                    }
                }
                
                try { return nodes; } finally { id = nodes = null; }
            },
            
            // 获取第一个节点
            getFirstNode : function() {
                var id = this.container.children("ul:first").children("li:first").children(".stree-node").attr("data-id");
                try { return this.cache(id); } finally { id = null; }
            }
        });
        
        /*
         <div class="stree-node stree-level-3 stree-node-first stree-node-retracted" title="产品管理部" data-text="产品管理部" data-id="">
             <span class="stree-space"></span>
            <span level="3" class="stree-handle"></span>
            <span class="stree-icon stree-icon-3"></span>
            <span class="stree-text">产品管理部</span>
         </div>
         */
         
        // 收缩节点
        SELF.ui.delegate(".stree-handle", "click", function(event) {
            
            event.stopPropagation();
            
            var self = SELF,
                node = this.parentNode,
                id   = node.getAttribute("data-id"),
                cache= self.cache(id),    
                property= cache.property,
                child   = property.sn || property.children,
                level, html, li, childNodes;
            
            self.toggleNode(node);
            
            // 如果没有渲染,则渲染子节点
            if (property && child && !cache.rendered) {
                level = window.parseInt(cache.level) + 1;
                html  = self.createChild(child, level, cache.parents.concat([id]));
                
                cache.rendered = true;
                self.cache(id, "rendered", true);
                
                li = $(this.parentNode.parentNode).append(html);
                childNodes = li.find("dt.stree-node");
                
                // 缓存新渲染的tree节点
                self.addHtmlCache(childNodes);
                self.triggerEvent("itemRender", child);
                
                child = level = html = null;
            }
            
            self = node = id = cache = null;
        });
        
        // 选中或取消选中节点
        SELF.ui.delegate(".stree-node", "click", function(event) {
            var id = this.getAttribute("data-id");
            SELF.selectNode(id, event.ctrlKey && options.multiple);
        });
        
        // (双击) 选中或取消选中节点
        SELF.ui.delegate(".stree-node", "dblclick", function(event) {
            var id = this.getAttribute("data-id"),
                dbl = true;
            SELF.selectNode(id, event.ctrlKey && options.multiple, dbl);
        });
        
        // 选择框
        if (options.checkbox) {
            SELF.ui.delegate("input[type='checkbox']", "click", function(event) {
                SELF.chooseNode (this.value, event.ctrlKey||!options.singleCheck);
                event.stopPropagation();
            });
        }
    };
}(tbc, jQuery));

// 在线人数更新

tbc.namespace("tbc.tree");
tbc.tree.Online = function (settings) {
	var SELF = tbc.self(this, arguments),
		defaults = { },
		options = $.extend({}, defaults, settings),
		ajaxTimeout;
	
	SELF.extend ([tbc.Tree, settings], {
		
		packageName : "tbc.tree.Online",
		
		/* 
		 * 更新部门的在线人数
		 * @param	: curr[number]; 第几批
		 * @length	: 部门总数
		 */
		renderOnlineNumber : function () {
			this.batch (
				this._cacheIndex, 1000, 0, 10,
				function (portion, completed) {
					var id;
					for (var i=0,len=portion.length; i<len; i++) {
						id = portion[i];
						this.render2Html(id, this.cache(id,"amount"));
					}
					portion = id = null;
					
					/* 如果是最后一个部门 */
					if (completed) {
						var _this = this;
						ajaxTimeout = setTimeout(function() {
							_this.request();
							_this = null;
						}, this.interval||(3*60*1000));
					}
				}
			);
		},
		
		/*
		 * 更新某一个部门的在线学员总数
		 * @param	: id[string]; 部门ID
		 */
		singleRender : function (id) {
		    
		    var i, len, _id;
		    
			id = $.isArray(id) ? id : [id];
			
			for (i=0, len=id.length; i<len; i++) { 
			    _id=id[i];
			    this.render2Html(_id, this.cache(_id, "amount")); 
			}
		},
		
		/*
		 * 在界面上显示部门的在线人数
		 * @param	: id[string]; 部门ID
		 * @param	: total[number]; 此部门在线学员的总数
		 */
		render2Html : function (id, total) {
			
			total = (!total||isNaN(total)?0:total);
			
			var itm = $(this.cache(id,"html")),
				num	= itm.find(".stree-count");
			if (itm.size()) {
				num.size()
				? num.html("&nbsp;["+ total +"]")
				: itm.append('<i class="stree-count">&nbsp;['+ total +']</i>');
			}
			
		},
		
		/* 
		 * 统计每个部门的在线学员总数(包括所有子部门的人数)
		 * 从服务器端返回的人数是不包括子部门人数的;
		 */
		countOnlineNumber : function (json, parents) {
			parents = parents||[];
			var id, n, c, js, len;
			for (var k=0,l=json.length; k<l; k++) {
				js	= json[k];
				id	= js.id;
				n	= js.n;
				c	= js.sn||js.c;
				
				this.cache(id, "amount", n);
				
				if (c&&c.length>0) {
					this.countOnlineNumber(c, parents.concat([id]));
				}
				
				this.updateParents (parents, n)
			}
			id = n = c = js = len = null;
		},
		
		/*
		 * 给所有上级部门增加人数
		 * @param	: parents[array]; 所有上级部门
		 * @param	: amount[number]; 需要增加的人数
		 */
		updateParents : function (parents, amount) {
			for (var i=0,l=parents.length; i<l; i++) {
				var _amount = this.cache(parents[i], "amount");
				this.cache(parents[i], "amount", amount+_amount);
			}
		},
		
					
		// 加载各部门在线人数总数
		request : function() {
			var self = SELF;
			$.ajax({
				url 	: options.onlineUrl,
				type	: "get",
				dataType: "json",
				success : function (json) {
					self.countOnlineNumber(json);
					self.renderOnlineNumber();
					self = null;
				}
			});
		},
		
		start : function() {
			this.request();
		},
		
		stop : function() {
			clearTimeout(ajaxTimeout);
		}
	});
	
	SELF.addEvent({
		"itemRender" : function(c) {
			try{
			for (var i=0,l=c.length,d=[]; i<l; i++) {
				d.push(c[i].id);
			}
			this.singleRender(d);
			}catch(e) {
				alert(e.line);
			}
		}
	});
}
/**
 * 数据转换器，实现新旧数据转换,保证数据兼容性，为减小数据传输量，简化
 * 后的JSON数据，绝大部分的属性名缩短了2/3，此类构造类实现将简化后的数
 * 据格式转成以前的格式，以保存原来JS代码的兼容性。
 * @class tbc.Translator
 * @constructor
 * @copyright 时代光华（2013）
 * @author mail@luozhihua.com
 *
 * @param {Object} [tradeRules] 转换规则, 在构造实例时可以省略此参数
 *                              在构造实例后，可以通过实例的setRules
 *                              方法设置转换规则。
 * @param {Boolean} passed 在转换时，是否保留转换规则里面未定义的属性
 *                         默认false(不保留)
 */
tbc.Translator = function(tradeRules, passed) {
			
	var ruleSet = tradeRules instanceof Object ? tradeRules : {};
	
	this.result = [];
	this.cache = {};
	
	/**
	 * 获得全部转换规则
	 * @public
	 * @method getRules
	 * @description 获得全部转换规则
	 * @return {Object} 转换规则
	 */
	this.getRules = function() {
		return ruleSet;
	}
	
	/**
	 * 获取转换后的KEY
	 * @public
	 * @method getKey
	 * @param {String} key 要转换的key
	 * @param {String} [which='antique'] 转换成新的(fresh)，还是旧的(antique)
	 * @return {String} 返回转换后新的key名称
	 */
	this.getKey = function(key, which) {
		var k,
			newKey;
		switch (which) {
				
			case 'fresh' :
				return passed===true ? (ruleSet[key] || key) : ruleSet[key];
				break;
				
			case 'antique' : 
			default:
			
				for (k in ruleSet) {
					if (ruleSet[k] !== null && ruleSet[k] === key) {
						newKey = k;
					}
				}
				return passed===true ? (newKey || key) : newKey;
				break;
				
		}
		return null;
	}
	
	/**
	 * 设置转换规则
	 * @public
	 * @method setRules
	 * @param {String|Object} keyOrObject 单个的key名称或者一个{key:value}键值对集合
	 * @param {AnyType} [value] 如果前面的参数keyOrObject类型是Object, 则此参数可省略
	 * @return {Boolean} 是否转换成功
	 */
	this.setRules = function(keyOrObject, value) {
		var reuls,
			k;
			
		if (arguments[0] instanceof Object) {
			reuls = arguments[0];
		} else {
			reuls = {};
			reuls[arguments[0]] = arguments[1];
		}
		
		ruleSet = ruleSet instanceof Object ? ruleSet : {};
		
		if (reuls instanceof Object) {
			for (k in reuls) {
				ruleSet[k] = reuls[k];
			}
		}
		return true;
	}
	
	/**
	 * 清空转换器
	 * @public
	 * @method clear
	 */
	this.clear = function() {
		this.result = [];
		ruleSet = null;
	}
	
	/**
	 * 批量转换器
	 * @public
	 * @method transformList
	 * @param {Array} list 要转换的数组
	 * @param {String} which 要转成哪一类型，取值范围：'antique'|'fresh';
	 * @return {Array} 转换后的结果
	 */
	this.transformList = function(list, which) {
		if (!$.isArray(list)) {
			return list;
		} else {
			var i, len, freshRow,
				result = [];
			
			for (i=0,len=list.length; i<len; i++) {
				freshRow = this.transform(list[i], which);
				result.push(freshRow);
			}
			
			try {
				return result;
			} finally {
				result = null;
			}
		}
		return list;
	}
	
	/**
	 * 对象转换器
	 * @method transform
	 * @description 对象转换器
	 * @param {Object} obj 要转换的对象
	 * @param {String} which 转换成哪一种格式
	 * @return {Object} 转换后的结果, 如果传入的不是object类型, 则
	 *                           不会进行任何转换, 直接返回源对象
	 */
	this.transform = function(obj, which) {
		var k,
			key,
			freshRow;
			
		if (obj instanceof Object) {
			freshRow = {};
			for (k in obj) {
				key = this.getKey(k, which);
				
				if (typeof key==='string') {
					freshRow[key] = typeof this.valueTranslator === 'function' 
					? this.valueTranslator(key, obj[k], which) 
					: obj[k];
				}
			}
			
			try {
				return freshRow
			} finally {
				freshRow = null;
			}
		}
		return obj;
	}
	
	/**
	 * 转换成新格式
	 * @method toFresh
	 * @description 转换成新格式
	 * @param {Object | Array} objectOrArray 传入object或者array都可以, 转
	 *                  换后会自动返回对应的数据格式
	 * @return {Object | Array} 转换后的结果, 参数是什么类型就返回什么类型
	 */
	this.toFresh = function(objectOrArray) {
		if (list instanceof Object) {
			return this.transform(objectOrArray, 'fresh');
		} else {
			return this.transformList(objectOrArray, 'fresh'); 
		}
	}
	
	/**
	 * 转换成旧格式
	 * @method toAntique
	 * @description 转换成旧格式
	 * @param {Object | Array} objectOrArray 传入object或者array都可以, 
	 *                  转换后会自动返回对应的数据格式
	 * @return {Object | Array} 转换后的结果, 参数是什么类型就返回什么类型
	 */
	this.toAntique = function(objectOrArray) {
		if (list instanceof Object) {
			return this.transform(objectOrArray, 'antique'); 
		} else {
			return this.transformList(objectOrArray, 'antique'); 
		}
	}
}

/**
 * 桌面应用构造类
 * @class tbc.App 
 * @constructor
 * @copyright 时代光华
 * @author mail@luozhihua.com
 */
;(function(tbc, $){
    
    "use strict";
    
    tbc.appManager = function() {
        this.appStore = {};
        
    };
    
    tbc.App = function(settings, appOptions) {
        var options = tbc.extend ({
                  width        : settings.preferredWidth || 900
                , height    : settings.preferredHeight || 400
                , name        : settings.userDeskItemName || settings.applicationName
                , icon        : settings.applicationIconUrl
                , homepage    : settings.homePageUrl
                , minWidth  : 480
                , minHeight : 320
            }, settings, appOptions),
            url;
        
        url = options.homePageUrl + (
                (options.homePageUrl.indexOf("current_app_id") === -1) 
                ? (options.homePageUrl.indexOf("?") !== -1 ? "&" : "?") + "current_app_id=" + appOptions.applicationId
                : ""
            );
        
        $.extend(options, {
            homePageUrl : url,
            homepage    : url,
            refreshable : true, // 可刷新
            resettable  : true,  // 可重置
            helpable    : true,    // 有帮助内容
            autoLoad    : true,    // 自动加载应用内容
            scrolling   : false  // 窗口内容可滚动
        });
        
        tbc.self(this, arguments)
        .extend ([tbc.Window, options], {
            /**
             * 初始化 
             * @method init
             * @private
             */
            initApp : function() {
                this.packageName = "tbc.App";
                this.ui.addClass('helpable refreshable');
                return this;
            }
        })
        .addEvent({
            
            destroy : function() {
                options = settings = appOptions = null;
            }
        })
        .initApp();
    };
}(tbc, jQuery));

/*
 * Class:  tb.AppSelector (应用选择器) ########################################## 
 * 
 * @Copyright    : 时代光华
 * @Author        : 罗志华
 * @mail         : mail@luozhihua.com
 
 * Methods        : 
 * 
 */
;(function($, tbc) {
    
    "use strict";
    
    tbc.AppSelector = function (settings) {
        
        var defaults = {
                name    : "选择应用",
                icon    : "icon-zoom_in",
                width   : 500,
                height  : 600,
                loadType: "html",
                multipleSelect : false
            },
            options = $.extend({}, defaults, settings);
            
        options.buttons = {
            "选择" : function() {
                this.returnValue = this.getSelected();
                this.close();
            },
            "取消" : function() {
                this.close();
            }
        };

        tbc.self(this, arguments)
        .extend([tbc.dialog, options], {
            layout : function() {
                var win = this,
                    list = ['<div style="padding:1em;">'];

                $.each(window.applicationMap, function() {
                    list.push(
                        '<a class="app-icon-item" href="javascript:void(null);" onclick="return false;" data-id="'+ this.applicationId +'">' +
                        '   <img class="app-icon-img" title="'+ this.applicationName +'" src="'+ this.applicationIconUrl +'" />' +
                        '   <i class="app-icon-text">'+ this.applicationName +'</i>' +
                        '</a>'
                   );
                });
                list.push("</div>");
                this.append(list.join(""));

                this.ui.on("click", "a.app-icon-item", function(event) {
                    event.preventDefault();

                    $(this).addClass("app-icon-selected");
                    
                    if (!event.ctrlKey || !win.options.multipleSelect) {
                        $(this).siblings("a.app-icon-item")
                        .removeClass("app-icon-selected");
                    }
                })
                .on("dblclick", "a.app-icon-item", function() {
                    win.returnValue = win.getSelected();
                    win.close();
                });
            },
            
            getSelected : function() {
                var applist = [];
                this.ui.find("a.app-icon-selected").each(function() {
                    applist.push(window.applicationMap[ this.getAttribute("data-id") ]);
                });
                return applist;
            }
        })
        .addEvent({
            "show" : function() {
                this.layout();
            }
        });
    };
    
}(jQuery, tbc));

/** 
 * 应用托盘
 * @class tbc.AppTray
 * @constructor
 * @public
 * @copyright 时代光华
 * @author mail@luozhihua.com
 */

;(function(tbc, $) {
    
    "use strict";
    
    tbc.AppTray = function(settings) {
        
        var defaults = {
              container : ".tbc-appsTray"
            , ui        : ".tbc-appsTray"
            , invisible : ".tbc-task-invisible"
            , invisibleHandle : ".tbc-task-invisible-handle"
        },
        options = $.extend({}, defaults, settings),
        iconModel = '<span class="tbc-button-link" title="{0}"><i class="tbc-imgicon tbc-icon icon-18"><img src="{1}"/></i><span class="tbc-button-text">{0}</span></span>';
        
        tbc.self(this, arguments)
        .extend({
            init : function() {
                
                var SELF = this;
                
                this.cache = {};
                this.cache_length = 0;
                this.packageName = "tbc.AppTray";
                this.ui        = $(options.ui);
                this.handle    = $(options.invisibleHandle, this.ui);
                this.container = $(options.container, this.ui);
                this.invisible = $(options.invisible, this.ui);
                this.container = this.container.size() ? this.container : this.ui;
                
                this.handle.click(function(event) {
                    SELF.toggleInvisible();
                    event.stopPropagation();
                    return false;
                });
            },
            
            append : function(sets) {
                var def = {
                    guid    : null,
                    icon    : "",
                    title    : "",
                    click    : null
                },
                opt = $.extend({}, def, sets),
                iconNode = $(tbc.formatString(iconModel, opt.title, opt.icon||""));
                
                if (tbc.system.isImg(opt.icon)) {
                    iconNode.find("img").show().attr("src", opt.icon);
                } else {
                    iconNode.find("img").hide().parent().addClass(opt.icon);
                }
                
                if (!opt.showTitle) { iconNode.children(".tbc-button-text").html(""); }
                
                if (!opt.guid) {
                    return alert("缺少配置项: {guid:undefined}");
                }
                
                iconNode.appendTo(this.container);
                
                iconNode
                .attr("guid", opt.guid)
                .bind({ "click" : opt.click});
                
                if (!this.cache[opt.guid]) {
                    this.cache[opt.guid] = iconNode;
                    this.cache_length+=1;
                    this.toggleHandle();
                }
                
                window.taskbar.resize();
                
                def = opt = sets = iconNode = null;
            },
            
            drop : function(guid) {
                var ico = this.cache[guid]; 
                if (ico) {
                    ico.remove();
                    delete this.cache[guid];
                    this.cache_length-=1;
                    this.toggleHandle();
                }
                ico = null;
            },
            
            icon : function(ico) {
                if (tbc.system.isImg(ico)) {
                    this.handle.find(".tbc-icon").children("img").show().attr("src", ico);
                }else{
                    this.handle.find(".tbc-icon").addClass(ico).children().hide();
                }
            },
            
            tips : function(title) {
                this.handle.find('.tbc-button-text').attr("title", title).html(title);
            },
            
            // 判断快速启动栏是否有空间
            hasSpace : function() {
                var WID = this.container[0].clientWidth,
                    wid = this.cache_length*18;
                return wid<WID;
            },
            
            showInvisible : function(sign) {
                var SELF = this;
                this.invisible.stop().slideDown(200);
                if (sign !== false) {
                    this.invisibleState = "show";
                }
                
                $(document).bind({
                    "click.hideQuicklaunch" : function() {
                        SELF.hideInvisible();
                    }
                });
            },
            
            hideInvisible : function(sign) {
                this.invisible.stop().slideUp(200);
                if (sign !== false) {
                    this.invisibleState = "hide";
                }
                
                $(document).unbind(".hideQuicklaunch");
            },
            
            toggleInvisible : function() {
                if (this.invisibleState === "hide") {
                    this.showInvisible();
                } else {
                    this.hideInvisible();
                }
            },
            
            toggleHandle : function() {
                if (this.container[0].clientWidth/18 > this.cache_length) {
                    this.handle.show();
                } else {
                    this.handle.hide();
                }
            },
            
            isExist : function(guid) {
                return this.cache[guid] ? true : false;
            },
            
            /**
             * 打开 
             */
            open : function() {
                
            }
        })
        .init();
    };
}(tbc, jQuery));
/**
 * 桌面集, 用于管理多个桌面
 * @copyright 时代光华(2013)
 * @author mail@luozhihua.com
 * 
 * @class tbc.Desktop
 * @constructor
 * @uses tbc.Tabset
 * @param {Object} settings 配置
 *     @param {Element} [settings.prevHandle] 往前滑动标头
 *     @param {Element} [settings.nextHandle] 往后滑动标头
 *     @param {Element} [settings.container] 显示桌面集的容器
 *     @param {Element} [settings.header] 显示标签头的容器
 *     @param {String} [settings.effects] 标签页转换效果
 *     @param {Element} [settings.easing] 标签页转换过渡缓冲效果
 *     @param {Boolean} [settings.loop] 循环切换
 *     @param {Boolean} [settings.auto] 自动切换
 *     @param {Number} [settings.timeout] 自动切换的时间间隔, 默认5000ms
 *     @param {Number} [settings.speed] 切换速度，默认400ms
 */
;(function(tbc, $, URLS) {

    "use strict";

    tbc.Desktop = function(settings) {

        /**
         * @config options 
         */
        var defaults = {
              prevHandle : ".tbc-tabset-prev"
            , nextHandle : ".tbc-tabset-next"
            , container  : ".tbc-tabset"
            , header  : ".tbc-desktop-nav"   //
            , effects : "slide-x"      // [fade, slide-x, slide-y]
            , easing  : "swing"
            , loop    : true
            , auto    : true           // 自动切换
            , timeout : 5000           // 自动切换的间隔时间(毫秒,1000ms === 1s)
            , speed   : 400
        },
        options = $.extend({}, defaults, settings);

        // 继承标签管理类、实现方法
        tbc.self(this, arguments)
        .extend([tbc.Tabset, settings], {

            /**
             * 管理器
             * @property manager
             * @type Object "instance of class tbc.DesktopManager"
             */
            manager : new tbc.DesktopManager(),

            /**
             * 加载桌面列表
             * 
             * @public
             * @method loadScene
             * @async
             */
            loadScene : function() {
                var SELF = this;
                $.ajax({
                    url      : URLS.getSceneSettings,
                    type     : "get",
                    datas    : {deskindex:0, loadDockItem:true},
                    dataType : "json",
                    cache    : false,
                    complete : function() {},
                    error    : function(e) {
                        
                        var tips, button, bw;
                        
                        bw = $('<Div/>').css({ textAlign:'center', padding:"10px 32px"});
                        
                        button = new tbc.Button({
                            text : "立即刷新",
                            icon : 'tbc-icon-close',
                            click : function() {
                                tips.close();
                            }
                        })
                        .appendTo(bw);
                        
                        tips = new tbc.Panel({
                            width    : 300,
                            height    : 180,
                            name    : "提示"
                        })
                        .append('<div style="padding:30px 30px 10px; color:red;">加载桌面数据失败,请刷新页面...</div>')
                        .append(bw)
                        .appendTo('body')
                        .show()
                        .addEvent({
                            "close" : function() {
                                tips.DESTROY();
                                button.DESTROY();
                                $('body').fadeOut(function() {
                                    window.onbeforeunload = null;
                                    document.location.reload();
                                });
                            }
                        });
                    },
                    success    : function(json) {
                        if (json) {    
                            SELF.onDataLoad(json);
                        }
                    }
                });
            },
                
            /**
             * 判断当前登录用户是否拥有管理员角色(包含培训管理员)
             * 
             * @public
             * @method isAdmin 
             * @return Boolean 返回true为管理员,否则非管理员角色
             */
            isAdmin : function() {
                var userRole = this.userinfo.roles,
                    rolelist = this.rolelist,
                    i, len, J, L,
                    hasAdminRole;
                
                for (i=0,len=userRole.length; i<len; i+=1) {
                    for (J=0,L=rolelist.length; J<L; J+=1) {
                        if (userRole[i] === rolelist[J].id && rolelist[J].type === 'ADMIN') {
                            return true;
                        }
                    }
                }
                return false;
            },
             
            /**
             * 判断当前登录用户是否拥有系统管理员角色(不包含培训管理员)
             * 
             * @public
             * @method isSysAdmin 
             * @return Boolean 返回true为系统管理员,否则非系统管理员角色
             */
            isSysAdmin : function() {
                return this.userinfo && this.userinfo.isHasAdmin;
            },
            
            /**
             * 不公开
             * 
             * @private
             * @event onDataLoad
             * @param {Object} 从服务器端获得的JSON数据
             */
            onDataLoad : function(json) {
                json = json || {};
                
                var translator = tbc.webdesk.data.translator,
                    tools,
                    k, i, len,
                    appStore = tbc.webdesk.data.apps,
                    defaultScene; // 默认屏幕
                
                // 旧数据格式
                if (window.applicationMap || json.applicationMap) {
                    window.applicationMap = window.applicationMap || json.applicationMap;
                
                // 新数据格式
                } else {
                    window.applicationMap = {};
                    
                    for (k in json.apps) {
                        if (json.apps.hasOwnProperty(k)) {
                            window.applicationMap[k] = appStore[k] = translator.apps.transform(json.apps[k], 'antique');                            
                        }
                    }
                    appStore = null;
                }
                
                tbc.system.settings = this.systemSettings = json.settings || json.setting || {};
                this.userinfo = json.user;
                this.corpinfo = json.company;
                this.rolelist = json.roles;
                window.corpCode = json.company.corpCode;
                
                /* 桌面列表 */
                this.initScene(json.scenes);
                
                /* 桌面左侧快捷方式 */
                this.initDock(json.tools);
                
                /* 应用托盘 */
                this.initWidget(json.autoruns);
                
                // 右键菜单
                this.initContextmenu();
            },
            
            /**
             * 初始化快捷方式栏 
             * 
             * @private
             * @method initScene
             * @param {Array} list 快捷方式集合
             */
            initScene : function(list) {
                var i,len,defaultScene;
                for (i=0,len=list.length; i<len; i+=1) {
                    this.addScene(i, list[i]);
                    if (list[i].isDef) {
                        defaultScene = i;
                    }
                }
                
                this.effect("slide-x");
                this.show(defaultScene||0);
            },
            
            /**
             * 初始化应用托盘 
             * @private
             * @method initAppTray
             * @param {Array} list 应用托盘数组
             * @chainable
             */
            initAppTray : function(list) {
                if (list instanceof Array) {
                    var dataStore = tbc.webdesk.data,
                        trays = dataStore.translator.tools.transformList(list, 'antique'),
                        i, len;
                    
                    dataStore.trays = trays;
                    
                    for (i=0,len=trays.length; i<len; i+=1) {
                        new tbc.Shortcut(trays[i]).appendTo(".tbc-desktop-dock");
                    }
                    
                    dataStore = trays = null;
                }
                return this;
            },
            
            /**
             * 初始化快捷方式栏
             * 
             * @private
             * @method initDock
             * @param {Array} list 快捷方式集合
             */
            initDock : function(list) {
                if ($.isArray(list)) {
                    var dataStore = tbc.webdesk.data,
                        tools = dataStore.translator.tools.transformList(list, 'antique'),
                        i, len;
                    
                    dataStore.tools = tools;
                    
                    for (i=0,len=tools.length; i<len; i+=1) {
                        new tbc.Shortcut(tools[i]).appendTo(".tbc-desktop-dock");
                    }
                    
                    dataStore = tools = null;
                }
            },
            
            /**
             * 初始化widget
             * 
             * @method initDock
             * @param {Array} list Widget集合
             */
            initWidget : function(list) {
                if ($.isArray(list)) {
                    
                    var desk,
                        autoruns,
                        i, len;
                    
                    for (i=0,len=this.tabs.length; i<len; i+=1) {
                        
                        switch (this.tabs[i].options.type) {
                            case 'USER':
                            case 'ADMIN':
                            case 'OTHER':
                            case 'DESKTOP':
                            case 'APP':
                            case 'APPLICATION':
                            case null:
                                desk = this.tabs[i];
                                break;
                        }
                        
                        if (desk) {
                            break;
                        }
                    }
                    
                    if (desk) {
                        autoruns = tbc.webdesk.data.translator.autoruns.transformList(list, 'antique');
                        desk.appendWidgets(autoruns);
                    }
                }    
            },
            
            /**
             * 数据转换, 因为简化后的数据结构与旧版本的数据结构不同，
             * 而程序结构对旧数据有依赖，所以统一把新格式转换为旧格式
             * 来处理（新的数据结构是为了减少网络传输，加快下载速度）
             * 
             * @public
             * @method dataTranslate 数据转器
             * @param {Object} json 桌面配置数据
             */
            dataTranslate : function(json) {
                var dataStore    = tbc.webdesk.data,
                    translator   = dataStore.translator,
                    
                    data         = json.requestUserDesk, 
                    shortcuts_1  = data.userDeskItemList,
                    autorun_1    = data.autoRunItemList,
                    app_1        = json.applicationMap,
                    toolbar_1    = json.userDeskDock.userDeskDockItemList,
                    tray_1       = [],
                    k,
                    i;
                
                // appMap
                for (k in app_1) {
                    if (app_1.hasOwnProperty(k)) {
                        dataStore.apps[k] = translator.apps.transform(app_1[k], 'fresh');
                    }
                }
                
                // shortcuts
                dataStore.shortcuts = translator.shortcuts.transformList(shortcuts_1, 'fresh');
                
                // autorun
                dataStore.autoruns = translator.autoruns.transformList(autorun_1, 'fresh');
                
                // 左侧快捷栏
                for (i=0; i<toolbar_1.length; i+=1) {
                    dataStore.tools.push(translator.shortcuts.transform(toolbar_1[i].userDeskItem, 'fresh'));
                }
                
                // 右下角托盘
                dataStore.trays = translator.shortcuts.transformList(tray_1, 'fresh');
                
                dataStore.apps = translator.apps.to;
            },
        
            /**
             * 启动快捷方式管理器
             * 
             * @public
             * @method startShortcutsManager
             */
            startShortcutsManager : function() {
                var SELF = this;
                if (!(this.shortcutsManager instanceof tbc.Window)) {
                    this.shortcutsManager = new tbc.Window({
                        name : "管理快捷方式",
                        icon : "icon-add_small",
                        width  : 848,
                        height : 460,
                        minWidth  : 830,
                        minHeight : 460,
                        scrolling : false,
                        resizables  : false,
                        maximizable : true,
                        minimizable : true,
                        loadType : 'ajax',
                        homepage : URLS.startShortcutManager
                    });
                    
                    this.shortcutsManager.addEvent({
                        "close" : function() {
                            SELF.shortcutsManager = null;
                            delete SELF.shortcutsManager;
                        }
                    });    
                }
                
                this.shortcutsManager.show();
            },
        
            /**
             * 启动添加快捷方式管理器
             * @public
             * @method startSimpleShortcutsAdd
             */
            startSimpleShortcutsAdd : function() {
                
                var self = this;
                
                if (!(self.simpleShortcutsManager instanceof tbc.Window)) {
                    self.simpleShortcutsManager = new tbc.Window({
                        name    : "新增快捷方式",
                        icon     : "icon-add_small",
                        width    : 640,
                        height    : 320,
                        loadType    : 'ajax',
                        homepage    : URLS.startShortcutAdd,
                        scrolling    : false,
                        resizables    : false,
                        maximizable : true,
                        minimizable : true
                    });
                    
                    self.simpleShortcutsManager.addEvent({
                        "close" : function() {
                            self.simpleShortcutsManager = null;
                            delete self.simpleShortcutsManager;
                        }
                    });
                }
                
                self.simpleShortcutsManager.show();
            },
            
            /**
             * 添加一个桌面到桌面集
             * 
             * @public
             * @method addScene 
             * @param {Number} i 桌面序号
             * @param {Object} opt 桌面配置数据
             * @return {Object} Instance of class "tbc.Scene"
             */
            addScene : function(i, opt) {
                    
                    var handle = $('<span title="" class="tbc-scene-title scene_title_'+(i+1)+ ' ' + (opt.type==="ADMIN"?"scene_title_admin":"") +'" hidefocus="true">' +
                        '    <i class="tbc-icon">'+ (opt.type !== "ADMIN"?i+1:"") + '</i>' +
                        '</span>'),
                        
                        iconNode  = handle.find("img"),
                        titleNode,// = handle.find("i"),
                        scene,
                        
                        container = $('<div style="display:none;" class="tbc-slide-scene"></div>');
                        
                        container.scroll(function() { this.scrollTop=0; this.scrollLeft=0; });
                        
                    scene = new tbc.Scene($.extend({
                          title    : null
                        , icon     : null
                        , closable : false
                        , closeNode: null
                        , content  : null
                        , type     : opt.type
                        , url      : opt.url
                        , duration : options.speed
                        , easing   : options.easing //"easeInOutExpo"
                        , autoShow : i===0
                        , id       : opt.id
                    }, opt, {
                          handleNode: handle
                        , titleNode : titleNode
                        , iconNode  : iconNode
                        , container : container
                    }));
                    
                    handle.attr("title", scene.nameTranslator(opt.name||opt.title));
                    
                    this.append(scene);
                    
                    scene.ui.attr({ "tbc": scene.guid, svid:opt.id });
                    
                    if (opt.type !== "LINK" && opt.type !== "APPLICATION") {
                        
                        // 开启划选
                        scene.container.selectArea({
                            item            : ".tbc-shortcut",
                            exclude            : ".tbc-folder-shortcut",
                            classSelected    : "tbc-shortcut-selected",
                            event             : {
                                select    : function() {},
                                unselect: function() {}
                            }
                        });
                        
                        this.iconsDrager.addContainer(scene.container);
                        this.iconsDrager.addContainer(scene.handle);
                    }
                    
                    try {
                        return scene;
                    } finally {
                        scene = handle = null;
                    }
                
            },
            
            /**
             * 保存快捷栏的快捷方式到服务器
             * 
             * @public
             * @method saveDockShortcuts 
             * @param {Array} items 快捷方式配置数据
             */
            saveDockShortcuts : function(items) {
                items = $.isArray(items) ? items.join(",") : items;
                
                if (!items) {
                    items = [];
                    $(".tbc-desktop-dock .tbc-shortcut").each(function() {
                        items.push(this.getAttribute("_shortcutid"));
                    });
                    items = items.join(",");
                }
                
                $.ajax({
                    url     : URLS.saveDockShortcuts,
                    type    : "post",
                    data    : {items:items},
                    dataType: "json",
                    success : function(json) {
                        
                    }
                });
            },
            
            /**
             * 设置桌面背景显示方式
             * 
             * @method setBackgroundMode 
             * @param {String} mode 显示方式:
                     cover (填充)
                    contain (适应屏幕)
                    extrude (拉伸)
                    repeat (平铺)
                    center (居中)
             */
            setBackgroundMode : function(mode) {
                
                mode = mode || this.bgMode || "center";
                this.bgMode = mode;
                
                function BgLoadHandle() {
                    
                    var bw = document.body.offsetWidth,
                        bh = document.body.offsetHeight,
                        w  = this.width, // 图片width
                        h  = this.height, // 图片height
                        scale = { x:bw/w, y:bh/h},
                        url,
                        
                        width,
                        height,
                        top  = 0,
                        left = 0;
                    
                    switch (mode) {
                        
                        // 填充
                        case "cover":
                            
                            if (scale.x>scale.y) {
                                width  = bw;
                                height = "auto";
                                top    = -(h*scale.x-bh)/2;
                            } else {
                                width  = "auto";
                                height = bh;
                                left   = -(w*scale.y-bw)/2;
                            }
                            $(".tbc-wallpaper img").show().css({ width:width, height:height, left:left, top:top })
                            .parent().css({background:""});
                            break;
                        
                        // 适应    
                        case "contain" :
                            if (scale.x<scale.y) {
                                width  = bw;
                                height = "auto";
                                top    = -(h*scale.x-bh)/2;
                            } else {
                                width  = "auto";
                                height = bh;
                                left   = -(w*scale.y-bw)/2;
                            }
                            $(".tbc-wallpaper img").show().css({ width:width, height:height, left:left, top:top })
                            .parent().css({background:""});
                            break;
                        
                        // 拉伸
                        case "extrude" :
                            $(".tbc-wallpaper img").show().css({ width:bw, height:bh, left:0, top:0 })
                            .parent().css({background:""});
                            break;
                            
                        // 平铺
                        case "repeat" :
                            url = $(".tbc-wallpaper img").hide().attr("src");
                            $(".tbc-wallpaper").css({background:"url("+ url +") center center repeat"});
                            break;
                            
                        // 居中
                        case "center" :
                            url = $(".tbc-wallpaper img").hide().attr("src");
                            $(".tbc-wallpaper").css({background:"url("+ url +") center center no-repeat"});
                            break;
                            
                        default:
                            url = $(".tbc-wallpaper img").hide().attr("src");
                            $(".tbc-wallpaper").css({background:"url("+ url +") center center no-repeat"});
                            break;
                    }
                    $(".tbc-wallpaper img").attr("src");
                }
                
                var img = new Image();
                    img.onload = BgLoadHandle;
                    img.src = $(".tbc-wallpaper img").attr("src");
                
                img = null;
            },
            
            /**
             * 设置桌面背景显示方式, 可选的显示方式：
             *       cover (填充)
             *       contain (适应屏幕)
             *       extrude (拉伸)
             *       repeat (平铺)
             *       center (居中)
             * 
             * @method setBackground 
             * @param {String} url 背景图片地址
             * @param {String} mode 显示方式
             * @chainable
             */
            setBackground : function(url, mode) {
                
                if (url) {
                    try {
                        if (window.screen) {
                            var w = window.screen.width,
                                h = window.screen.height;
                            
                            // 根据分辨率加载不同的背景图片
                            url +=  (w<=800    ? "/big"
                                : w<=1024    ? "/big"
                                : w<=1280    ? (h >800 ? "/square" : "/bigger")
                                : w<=1366    ? "/large"
                                : w<=1440    ? "/larger"
                                : "");
                        }
                    } catch(e) {}
                    
                    //$("body").css({ "backgroundImage": "url('"+url+"')" });
                    $(".tbc-wallpaper img").attr("src", url);
                    
                }
                this.setBackgroundMode(mode);
                
                return this;
            },
            
            /**
             * 从服务器端获取当前用户的背景图片的路径
             * 
             * @public
             * @method loadBackgorund 
             * @asyn
             */
            loadBackgorund : function() {
                var self = this;
                $.get(URLS.getCurrentBg, function(t) {
                    self.setBackground(t.url, t.backgroundSpreadType||t.mode);
                });
            },
            
            /**
             * 打开背景图片管理器
             * 
             * @method selectBg
             * @param {Boolean} isAdmin 是否是管理员模式
             * @chainabe
             */
            selectBg : function(isAdmin) {
                var SELF = this;
                SELF.selecting = true;
                
                this.bgSelector = this.bgSelector 
                ? this.bgSelector.focus().flash()
                : new tbc.Window
                ({
                    name        : "设置桌面背景" + (isAdmin ? '(管理员)':''),
                    homepage    : isAdmin ? URLS.selectBgAdmin : URLS.selectBg,
                    loadType    : "ajax",
                    icon        : "icon-image_cultured",
                    width       : 564,
                    height      : 490,
                    resizable   : true,
                    minimizable : true,
                    maximizable : true,
                    scrolling   : true
                })
                .addEvent({
                    "setBackground" : function(url) {
                        SELF.setBackground(url);
                    },
                    "close": function(data) {
                        delete SELF.bgSelector;
                        SELF.selecting = false;
                    }
                })
                .show();
                
                return this;
            },
            
                 
            /**
             * 打开创建文件夹的界面
             * 
             * @public
             * @method createFolder 
             * @param {Object} scene 桌面
             * @chainabe
             */
            createFolder : function(scene) {
                this.creatFolder(scene);
            },
              
            /*
             * 打开创建文件夹的界面
             * 
             * @public
             * @method creatFolder 
             * @param {Object} scene 桌面
             * @chainabe
             */
            creatFolder : function(scene) {
                var SELF = this,
                    win,
                    tips = $('<div title="最多5个汉字或10个英文字符." style="clear:both; margin-bottom:2em; color:#888;">最多5个汉字或10个英文字符.</div>'),
                    ui = $('<div style="margin:32px;">' +
                        '    <label>输入文件夹名称:<br/></label><br/>' +
                        '</div>'),
                    
                    verify = new tbc.Button({text:"创建", icon:"icon-check", click:function() {
                        var n = $.trim(ui.find(".tbc-inputer").val()),
                            n2= tbc.substr(n, 10),
                            niceName    = n2 + "(" + (n.replace(n2,""))+")";
                        
                        if (n2.length <n.length) {
                            tips.shake().html("文件夹名过长,最多5个汉字或10个英文字符.").css({color:"red"});
                            //SELF.creatFolderFromServer(n2, scene, win, tips);
                        }else{
                            SELF.creatFolderFromServer(n2, scene, win, tips);
                        }
                    }}),
                    
                    inputer = $('<input class="tbc-inputer" value="新文件夹" type="text" style="width:200px; height:26px; line-height:26px; margin-bottom:4px;" length="5" onclick="this.focus();" />')
                        .bind({
                            "click" : function() { this.focus(); },
                            "focus" : function() { tips.html(tips.attr("title")).css({color:"#888"}); },
                            "keyup" : function(e) { if (e.keyCode === 13) { verify.click(); } }
                        }),
                    cancel = new tbc.Button({text:"取消", icon:"icon-close", click:function() {
                        win.close();
                    }});
                
                verify.ui.css({marginRight:"10px"});
                
                win = new tbc.Window({
                    name    : "创建文件夹",
                    loadType: "html",
                    icon    : "icon-folder_modernist_add_simple",
                    width    : 369,
                    height    : 240
                })
                .addEvent({
                    focus : function() {inputer.focus();},
                    close : function() { verify = inputer = win =cancel = null; }
                })
                .show();
                
                cancel.depend(win);
                verify.depend(win);
                
                inputer.appendTo(ui.find("label"));
                tips.appendTo(ui);
                verify.appendTo(ui);
                cancel.appendTo(ui);
                win.append(ui);
            },
                    
            /**
             * 把新建的文件夹保存到服务器
             * 
             * @public
             * @method creatFolderFromServer 
             * @param {String} name 文件夹名称
             * @param {Object} scene 桌面
             * @param {Object} win 创建文件夹的窗口(tbc.Window的实例)
             * @param {unknown} 
             */
            creatFolderFromServer : function(name, scene, win, tips) {
                
                $.ajax({
                    url  : URLS.saveNewFolder,
                    data : {folderName:(name||"新文件夹"), userDeskId:scene.svid||scene.id},
                    type : "post",
                    dataType   : "json",
                    beforeSend :function() { win.lock("loading", "正在保存..."); },
                    complete   : function() { win.unlock("loading", "正在保存..."); },
                    error      : function() {}, 
                    success    : function(json) {
                        var translator, fol;
                        if (json) {
                            translator = tbc.webdesk.data.translator.shortcuts;
                            json = translator.transform(json, 'antique');
                            fol  = new tbc.Shortcut(json).appendTo(scene);
                            scene.layout();
                            win.close();
                        }else{
                            tips.html("创建失败,可能文件夹已存在.").css({color:"red"});
                        }
                    }
                });
            },
            
            /**
             * 最小化所有窗口
             * 
             * @public
             * @method minAll 
             */
            minAll : function() {
                var k;
                for (k in tbc.Panel.cache) {
                    if (tbc.Panel.cache.hasOwnProperty(k)) {
                        tbc.Panel.cache[k].min();
                    }
                }
                // tbc.TaskManager.doWith(function(t) { t && !t.minimize && t.min && t.min(); }, "all");
            },
            
            /**
             * 设置dock的层级,如果宽度小于1000将其显示在所有窗口后面
             * 
             * @public
             * @method setDockZindex 
             */
            setDockZindex : function() {
                var w = document.body.offsetWidth;
                if (w<1000) {
                    $(".tbc-desktop-dock").css({zIndex:3});
                } else {
                    $(".tbc-desktop-dock").css({zIndex:4});
                }
            },
            
            /**
             * 设置dock垂直居中
             * 
             * @public
             * @method setDockPosition 
             */
            setDockPosition : function() {
                var H = document.body.offsetHeight,
                    d = $(".tbc-desktop-dock"),
                    h = d.height(),
                    st = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
                
                this.setDockZindex();
                d.css({top: (H-h)/2+st });
            },
            
            /**
             * 初始化图标拖动功能
             * 
             * @private
             * @method initDrager 
             */
            initDrager : function() {
                
                this.iconsDrager = new tbc.Drag ({
                    node    : ".tbc-shortcut",
                    handle  : ".tbc-shortcut-inner",
                    targets : ".tbc-desktop-dock",
                    timeout : 300,
                    selected: ".tbc-shortcut-selected",
                    disableInsertTargets : ".disableInsertTargets,.tbc-scene-title"
                })
                .addEvent({
                    "move" : function(offset) {
                        
                    },
                    
                    "beforeInsert" : function(context) {
                        try {
                            return tbc.system.getTaskByElement(context.node).triggerEvent("beforeMove", context);
                        } catch (e) {
                            return false;
                        }
                    },
                    
                    "afterInsert" : function(context) {
                        try {
                            return tbc.system.getTaskByElement(context.node).triggerEvent("afterMove", context);
                        } catch (e) {
                            return false;
                        }
                    }
                });
            },
            
            /**
             * 初始化右键菜单
             * 
             * @private
             * @method initContextmenu 
             */
            initContextmenu : function() {
                
                var SELF = this,
                    contextmenuOption = [
                        {
                            role : 'user,admin',
                            disabled : false,
                            icon : "icon-folder_modernist_add_simple",
                            text : function() {
                                return (SELF.isSysAdmin() || tbc.system.settings.allowCreateFolder !== false
                                        ? "新建文件夹"
                                        : null
                                   );
                            },
                            click : function() {
                                SELF.creatFolder(SELF.current());
                            }
                        },
                        {
                            role : 'user,admin',
                            text : function() {
                                return (SELF.isSysAdmin() || tbc.system.settings.allowCreateShortcut !== false 
                                        ? "新建快捷方式" 
                                        : null
                                   );
                            },
                            icon : "icon-heart_add",
                            click : function() {
                                SELF.startSimpleShortcutsAdd();
                            }
                        },
                        {
                            role : 'user,admin',
                            text : "管理快捷方式",
                            icon : "icon-heart_edit",
                            click : function() { SELF.startShortcutsManager(); }
                        },
                        /*
                        {
                            text:"排列桌面图标", icon:"icon-upload", submenu: [
                                {text:"按名称", icon:"", click:function() {}, disabled:true},
                                {text:"按更新时间", icon:"", click:function() {}, disabled:true}
                            ]
                        },
                        {role:'user', text:"设置桌面背景", icon:"icon-image_cultured", click:function() { SELF.selectBg(); }, disabled:function() {return SELF.selecting===true;}, inheritable:false },
                        */
                        {
                            role : 'user',
                            text : function() {
                                return (!SELF.isSysAdmin() && tbc.system.settings.allowChangeBg===false 
                                        ? false
                                        : "设置桌面背景 "
                                   );
                            },
                            icon : "icon-image_cultured",
                            click : function() { SELF.selectBg(); },
                            disabled : function() { return SELF.selecting===true; },
                            inheritable : false
                        },
                        {
                            role : 'admin', 
                            text : function() {
                                return (SELF.isSysAdmin() ? "设置、背景管理  (管理员)" : false);
                            },
                            icon : "icon-image_cultured",
                            click : function() { SELF.selectBg(SELF.isSysAdmin()); },
                            disabled : function() { return SELF.selecting===true; },
                            inheritable : false
                        },
                        "line",
                        {
                            role : 'user,admin',
                            text : "屏幕切换",
                            icon : "",
                            disabled : function() { return SELF.tabs.length<2; },
                            inheritable : true,
                            submenu : function() {
                                if (SELF.tabs.length>1) {
                                    var sm = [];
                                    $.each(SELF.tabs, function(i,o) {
                                        sm.push({
                                            text  : ("第"+(i+1)+"屏  (") + this.nameTranslator(this.options.name || this.options.title) + ")",
                                            icon  : o.icon(),
                                            click : function() { SELF.show(i); }, disabled:o===SELF.current()
                                        });
                                    });
                                    return sm;
                                }
                            }
                        },
                        {role:'user,admin', text:"前一屏", icon:"icon-arrow_medium_left", click:function() {SELF.prev(); }, disabled:function() {return SELF.isFirst(); } },
                        {role:'user,admin', text:"后一屏", icon:"icon-arrow_medium_right", click:function() {SELF.next(); }, disabled:function() {return SELF.isLast(); } }
                    ];
                
                this.container.contextmenu({
                    items: contextmenuOption
                });
            },
            
            /**
             * 初始化
             * 
             * @private
             * @method init 
             * @chainable
             */
            init : function() {
                var self = this;
                
                this.packageName = "tbc.Desktop";
                
                // 加载背景图片
                this.loadBackgorund();
                
                this.initDrager();
                
                $(document).ready(function(e) {
                    self.setDockPosition();
                });
                
                $(window, document).bind("resize.desktop" + this.guid, function() {
                    var cur = self.current();
                    if (cur instanceof tbc.Scene && typeof cur.layout === 'function') {
                        cur.layout();
                    }
                    
                    self.setBackgroundMode();
                    self.setDockPosition();
                });
                
                return this;
            }
        })
        .init();
    };
}(window.tbc, window.jQuery, window.URLS));

/*
 * Class:  tb.desktop.Scene (桌面分屏) ########################################## 
 * 
 * @Copyright	: 时代光华
 * @Author		: 罗志华
 * @mail 		: mail@luozhihua.com
 
 * Methods		:
 * 
 */
 
;(function(tbc, $){
    
    "use strict";
        
    tbc.ns("tbc.desktop");
    tbc.desktop.Wallpaper = function(settings) {
        
        var SELF = tbc.self(this, arguments);
        
        
        SELF.extend ({
            
            // 设置上传按钮
            setUploadButton : function() {
                $("#bgUploadSelector").uploadify({
                    'formData'        : {},
                    'buttonText'    : $('#bgUpload').attr("data-text") || "上传图片",
                    'buttonClass'    : "tbc-button-blue",
                    'width'            : 80,
                    'fileTypeExts'    : "*.png;*.jpg;*.jpeg;",
                    'fileTypeDesc'    : "图片",
                    'swf'              : '/webdesk/js/jQuery/plugins/uploadify/uploadify.swf',
                    'uploader'        : '/webdesk/js/jQuery/plugins/uploadify/uploadify.php', // 上传地址 (需修改为对应的地址)
                    'onUploadError' : function() {
                        // debugger;
                    },
                    'onUploadSuccess' : function (file, data, response) {
                        // data = '{"id": "jasd2qnieuyfiwebbuwe834", "url":"asdasdas.jpg"}';
                        data = $.parseJSON(data);
                        var id  = data.id,
                            url = data.filepath;
                        tbc.desktop.wallpaper.addImageToList(id, url);
                    }
                });
            },
            
            // 插入图片
            addImageToList : function(id, url) {
                var img = $('<figure data-id="'+ new Date().getTime() +'"></figure>');
                    img.html('<i><img src="/webdesk'+ url +'" /></i> <a class="bg-image-delete" href="javascript:void(0);">&times;</a>');
                $(".bg-image-list").prepend(img);
            },
            
            // 删除图片
            deleteImage : function(data, callback, url) {
                
                if (typeof(data) === 'string') {
                    data = {corpImageId:data, corpCode:window.corpCode};
                }
                
                $.ajax({
                    url        : url || "/webdesk/html/wallpaper/ajax/delete.json",
                    type    : "post",
                    dataType: "json",
                    data    : data,
                    success : function(json) {
                        if (json.success) {
                            $("figure[data-id='"+ data.corpImageId +"']").remove();
                        }
                        
                        // 回调方法
                        if ($.isFunction(callback) ) {
                            callback(json);
                        }
                    }
                });
            },
            
            // 设为背景
            applyImage : function(data, callback, url) {
                
                if (typeof(data) === 'string') {
                    data = {corpImageId:data, corpCode:window.corpCode};
                }
                
                $.ajax({
                    url        : url || "/webdesk/html/wallpaper/ajax/apply.json",
                    type    : "post",
                    dataType: "json",
                    data    : data,
                    success : function(json) {
                        if (json.success) {
                            var imgBox = $("figure[data-id='"+ data.corpImageId +"']").addClass("current"),
                                imgUrl = imgBox.find("img").attr("data-src")+"#";
                            
                            imgBox.siblings().removeClass("current");
                            
                            window.desktop.setBackground(imgUrl);
                        }
                        
                        // 回调方法
                        if ($.isFunction(callback)) {
                            callback(json);
                        }
                    }
                });
            },
            
            /*
             * 更改背景显示方式
             * @param    : mode[string]; 取值范围:{"cover":填充, "contain":适应屏幕 }
             */
            
            changeMode : function(mode, callback, url) {
                $.ajax({
                    url     : url || "/webdesk/html/wallpaper/ajax/change-mode.json",
                    type    : "post",
                    dataType: "json",
                    data    : { mode:mode, corpCode:window.corpCode },
                    success : function(json) {
                        if (json.success) {
                            window.desktop.setBackgroundMode(mode);
                        }
                        
                        // 回调方法
                        if ($.isFunction(callback)) {
                            callback(json);
                        }
                    }
                });
            }
        });
    };
}(tbc, jQuery));

/*
 * @Class:  tb.desktop.Widgets (桌面小插件) ########################################## 
 * 
 * @Copyright	: 时代光华
 * @Author		: 罗志华
 * @mail 		: mail@luozhihua.com
 */
 
tbc.namespace("tbc.desktop");
tbc.desktop.Widget = function(settings) {
	var SELF = tbc.self(this, arguments);
	
	SELF.packageName = "tbc.desktop.Widget";
	
	var defaults = {
		  url		: null
		, id		: null
		, width		: 230
		, height	: 260 
		, target	: ".tbc-slide-scene.current"
		
	},
	
	options = $.extend({}, defaults, settings),
	
	wid = $('<div widgetid="" class="tbc-widget" _widgetId="'+ options.id +'"></div>')
	   .html('<div class="tbc-widget-tools">' +
			'	<a role="close" class="tbc-widgets-close" href="#" title="关闭">&times;</a>' +
			'	<a role="refresh" class="tbc-widgets-refresh" href="#" title="刷新">&times;</a>' +
			'	<a role="fix" class="tbc-widgets-fix" href="#" title="固定">&times;</a>' +
			'</div>' +
			'<div class="tbc-widget-msg"></div>' +
			'<div class="tbc-widget-inner">' +
			'	<iframe frameborder="0;" src="about:blank" border="0" allowtransparency="true"></iframe>' +
			'</div>' +
			'<div class="tbc-widget-locklayer"></div>' +
			'<div class="clear"></div>')
		.css({left:"auto", right:options.right, top:options.top}),
	
	iframe	= wid.find("iframe")[0],
	msgbox	= $(".tbc-widget-msg", wid),
	ctrl	= $(".tbc-widget-tools", wid);
	
	wid.attr("tbc", SELF.guid);

	SELF.ui = wid;
	SELF.id = options.id;
	
	// 隐藏或显示控制器
	ctrl
	.delegate("a", "click", function() {
		var role = this.getAttribute("role");
		switch(role) {
			case "fix"		: SELF.triggerFix();break;
			case "refresh"	: SELF.reload();	break;
			case "close"	: SELF.toggle();	break;
		}
	});
	
	onload = function() {
		
		var mx, my, delay;
	
		var idoc = iframe.contentWindow.document;
			idoc.oncontextmenu = null;
		
		$(idoc.body).css({
			"-moz-user-select": "none", "-webkit-user-select": "none", "-o-user-select": "none", "-ms-user-select": "none", "user-select": "none"
		}).bind("selectstart", function() {return false;});
		
		// 鼠标样式
		$("body", idoc).css({cursor:"move"});
		
		var timerHideCtrl,timerShowCtrl;
		
		if (options.control) {
			ctrl
			.unbind("mouseenter")
			.unbind("mouseleave")
			.bind({
				"mouseenter" : function() {
					clearTimeout(timerHideCtrl); ctrl.stop().slideDown(); 
				},
				"mouseleave" : function() {
					timerHideCtrl = setTimeout(function() { ctrl.stop().slideUp(); },200);
				}
			});
			
			$(idoc)
			.unbind("mouseenter")
			.unbind("mouseleave")
			.bind({
				"mouseenter" : function() { clearTimeout(timerHideCtrl); timerShowCtrl=setTimeout(function() { ctrl.slideDown(); },500);},
				"mouseleave" : function() { clearTimeout(timerShowCtrl); timerHideCtrl=setTimeout(function() { ctrl.slideUp(); },500); }
			});
		}
		
		$(idoc)
		.unbind("mousedown")
		.unbind("mouseup")
		.unbind("contextmenu")
		.bind({
			"mouseup":function() { clearTimeout(delay); $("body", this).unbind("selectstart"); },
			"contextmenu" : function(event) {
				try{
					var ifr = $(iframe),
						offset = ifr.offset(),
						top  = offset.top + event.pageY,
						left = offset.left + event.pageX;
					
					$(ifr).trigger("contextmenu", {top:top, left:left});
				}catch(e) {
					
				}finally{
					ifr = ifr[0] = offset = top = left = null;
				}
				return false;
			},
			
			"mousedown" : function(event) {
				
				// 隐藏右键菜单
				$(this).trigger("click.hideContextmenu");
				$("body", this).bind({
					"selectstart":function() {return false;}
				});
				
				if ((!tbc.msie||tbc.browserVersion>8) && event.preventDefault) {
					event.preventDefault();
				}
				
				mx = event.pageX - idoc.documentElement.scrollLeft + iframe.offsetLeft;
				my = event.pageY - idoc.documentElement.scrollTop + iframe.offsetTop;
				
				if (tbc.mozilla || tbc.opera) {
						
					var cx = event.pageX + iframe.offsetLeft,
						cy = event.pageY + iframe.offsetTop,
						last={};
						
						last.left = event.pageX;
						last.top  = event.pageY;
					
					wid.css({
						right	: (document.documentElement.scrollLeft + document.body.offsetWidth) - wid[0].offsetLeft - wid.width(),
						left	: "auto",
						top		: wid[0].offsetTop
					});
					
					var delay2;
					delay = setTimeout(function() {
						wid.css({zIndex:7});
						$(idoc).bind({
							"mousemove.drag":function(event) {
								
								if (SELF.fixed)return;
								ctrl.hide();
								
								clearTimeout(delay2);
								delay2 = setTimeout(function() {
									var n = {left:event.pageX, top:event.pageY};
									wid.stop().animate({ left:"auto", right:"-="+(n.left-last.left)+"px", top:"+="+(n.top-last.top)+"px" });
								}, 30);
							},
							"mouseup.drag":function() {
								ctrl.show();
								$(idoc).unbind(".drag");
								clearTimeout(delay);
								wid.css({zIndex:""});
								SELF.triggerEvent("drop", {top:wid.css("top"), right:wid.css("right")});
							}
						});
					},0);
				}else{
					delay = setTimeout(function() {
						wid.css({zIndex:7});
						SELF.dragMask = $('<div><input type="text" /></div>').css({background:"#fff", display:"none", opacity:.005, width:"100%", height:"100%", position:"absolute", left:0, top:0, zIndex:100000})
						.bind({
							"mouseup.drag" : function(e) {
								ctrl.show();
								this.style.display="none";
								wid.css({zIndex:""});
								SELF.dragMask.unbind(".drag").remove();
								SELF.triggerEvent("drop", {top:wid.css("top"), right:wid.css("right")});
								clearTimeout(delay);
							},
							"mousemove.drag" : function(e) {
								if (SELF.fixed)return;
								ctrl.hide();
								wid.css({
									right:document.body.offsetWidth - e.pageX - wid.width() + mx,
									left:"auto",//e.pageX-mx,
									top:e.pageY-my});
							}
						});
						
						SELF.dragMask.appendTo("body").show();
						SELF.dragMask.find("input").focus();
						window.focus();
					},200);
				}
			}
		});
		
		SELF.triggerEvent("load");
	};
	
	
	SELF.addEvent("load", function() {SELF.unlock();});
	
	wid
	.css({width:options.width, height:options.height})
	.appendTo(options.target);
	
	iframe.attachEvent ? iframe.attachEvent("onload", onload) : iframe.onload = onload;
	
	// 如果不用iframe
	if (!options.iframe) {
		$.ajax({
			url:options.url,
			dataType:"html",
			error:function() {
				var i = iframe;
					i.src = options.url;
					i=null;
			},
			success:function(html) {
				html = $(html);
				var i = html.filter("iframe");
					i = i.size() ? i : html.find("iframe");
				var url		= i.size() ? i.attr("src") : null,
					width	= i.css("width"),
					height	= i.css("height");
				iframe.src = url || options.url;
				SELF.ui.css({ width:width, height:height });
			}
		})
	}else{
		iframe.src = options.url;
	}
	
	/* 从插件内部iframe中调用插件方法的通道;
	 * 例:[iframe]window.frameElement.execute(methodName);
	 */
	iframe.execute = function(method) {
		var para = [];
		for(var i=1; i<arguments.length; i++) {
			para.push(arguments[i]);
		}
		if (tbc.isFunction(SELF[method]))SELF[method].apply(SELF, para);
	};
	
	/* 从插件内部iframe中触发事件;
	 * 例:[iframe]window.frameElement.execute(methodName);
	 */
	iframe.trigger = function(eventType, data) {
		SELF.triggerEvent(eventType, data);
	};
	
	/* 右键菜单 */
	wid.contextmenu({
		items : [
			{
				text  : function() { return SELF.fixed ? "不固定" : "固定";}, disabled:false,
				icon  : function() { return SELF.fixed ? "icon-marker_rounded_remove" : "icon-marker_rounded_red";},
				click : function() {	SELF.fixed ? SELF.unfix() : SELF.fix(); }
			},
			{text:"刷新", icon:"icon-refresh", click:function() {SELF.reload(); }, disabled : function() {return SELF.locked; } },
			{text:"移除插件", icon:"icon-tag_remove", click:function() {SELF.toggle(); }}
		]
	});
	
	SELF.appendTo = function(target) {
		wid.appendTo(target);
		return SELF;
	}
	
	SELF.toggle = function() {
		SELF.visible===false ? SELF.show() : SELF.hide();
	}
	
	SELF.hide = function() {
		SELF.visible = false;
		SELF.ui.hide();
	}
	
	SELF.show = function() {
		SELF.visible = true;
		SELF.ui.show();
	}
	
	/* Method: 关闭插件(下次登录仍然会显示) */
	SELF.close = function() {
		if (SELF.triggerEvent("close") !== false) {
			wid.fadeOut(300, function() {
				try{
					iframe.contentWindow.document.write("");
					iframe.src = null;
					iframe = null;
				}catch(e) {}
				
				wid.remove();
				wid = null;
				SELF.DESTROY();
			});
		}
	}
	
	/* Method: 移除插件(下次登录不再显示) */
	SELF.remove = function() {
		SELF.lock();
		
		$.ajax({
			  url : ""
			, type:"post"
			, data:{}
			, dataType : "json"
			, complete : function() {}
			, error : function() {}
			, success : function(json) {
				wid.fadeOut(300, function() {
					SELF.close();
					SELF.triggerEvent("remove");
				});
			}
			
		});
		
	}
	
	/* Method: 刷新 */
	SELF.reload = function() {
		try{
			SELF.lock();
			iframe.contentWindow.document.location.reload();
		}catch(e) {
		}
		return SELF;
	}
	
	/* Method: 锁定 */
	SELF.lock = function() {
		wid.find(".tbc-widget-locklayer").hide();
		SELF.locked = true;
		SELF.triggerEvent("lock");
		return SELF;
	}
	
	/* Method: 解锁 */
	SELF.unlock = function() {
		wid.find(".tbc-widget-locklayer").hide();
		SELF.locked = false;
		SELF.triggerEvent("unlock");
		return SELF;
	}
	
	/* 切换固定模式 */
	SELF.triggerFix = function() {
		SELF.fixed ? SELF.unfix() : SELF.fix();
	}
	
	/* Method: 固定 */
	SELF.fix = function() {
		SELF.fixed = true;
		ctrl.children("a[role='fix']").addClass("tbc-widgets-fix-disabled");
		SELF.triggerEvent("fix");
		return SELF;
	}
	
	/* Method: 解除固定 */
	SELF.unfix = function() {
		SELF.fixed = false;
		ctrl.children("a[role='fix']").removeClass("tbc-widgets-fix-disabled");
		SELF.triggerEvent("unfix");
		return SELF;
	}
	
	SELF.addEvent({
		"drop" : function(offset) {
			wid.css(tbc.extend(offset, {zIndex:""}));
			$.ajax({
				url		: URLS["saveWidgetPosition"],
				data	: tbc.extend(offset, {id: "40288059360aeabc01360af9cce20076"}),
				type	: "post",
				dataType: "json",
				complete: function() {},
				error	: function() {},
				success	: function(json) { 
					if (json.state === "success") {
						//SELF.msg("位置已保存.");
						//alert("保存位置成功(tbc.desktop.Widget.js第201行)");
					}
				}
				
			});
		},
		"startDrag" : function() {
			wid.css({zIndex:"7"});
		}
	});
	
	SELF.msg = function(msg) {
		msgbox.html(msg||"").stop().slideDown();
		setTimeout(function() {
			msgbox.slideUp();
		}, 2000);
	}
	
	SELF.addMsg = function(msg) {
		
	}
}

/** 
 * 桌面管理器，用于对桌面进行增删改等操作
 * 
 * @class tbc.DesktopManager
 * @constructor
 * @param {object} settings 配置信息
 * @copyright 时代光华(2013)
 * @author mail@luozhihua.com
 */

;(function(tbc, $, URLS) {
    
    "use strict";
    
    tbc.DesktopManager = function(settings) {
        
        tbc.self(this, arguments).extend({
            
            /** 
             * 配置
             * 
             * @private
             * @property options
             * @type Object
             */
            options : tbc.extend({
                
            }, settings),
            
            /** 
             * 初始化
             *
             * @private
             * @method init
             * @chainable 
              */
            init : function() {
                
                return this;
            },
            
            /** 
             * 生成修改桌面的HTML模板
             * 
             * @private
             * @method editHtmlTemplate
             * @param {Object} data 桌面配置数据
             * @return {String} HTML代码
             */
            editHtmlTemplate : function(data) {
                data = data instanceof Object ? data : {};
                
                var isAdmin  = window.desktop.isAdmin(),
                    typeName = {
                        DESKTOP : '空白桌面',
                        LINK : '网站',
                        APPLICATION : '应用'
                    },
                    htmlTemp = 
                    '<div class="tbc-add-scene">' +
                    '        <div class="tbc-add-scene-inner">' +
                    '            <div class="tbc-add-scene-box">' +
                    '                <div class="add-scene-type">' +
                    '                    <label>桌面类型</label>' +
                    '                    <select class="add-scene-type-select">' +
                    '                        <option value="'+ data.type +'" selected="selected">'+ (typeName[data.type]) +'</option>' +
                    '                    </select>' +
                    '                </div>'
                                    + 
                                    (   
                                        data.type === 'DESKTOP' 
                                        ?  '<ul style="display:block;" class="add-scene-type-opera add-scene-info-DESKTOP">' +
                                           '     <li><label>标题</label><input type="text" value="'+ (data.name||data.title||'') +'" class="add-scene-normal-title" /><span class="msg">(必填)</span></li>' +
                                           '</ul>'
                                        :  (data.type === 'APPLICATION' 
                                            ? ('<ul style="display:block;" class="add-scene-type-opera add-scene-info-APP clearFloat">' +
                                               '    <li class="add-scene-app-selected">' +
                                               '         <span class="app-preview">' +
                                               '             <img class="add-scene-app-selected-icon" src="'+ data.icon +'" style="width:48px; display:block;" onerror="this.style.display=\'none\';"/>' +
                                               '             <span class="add-scene-app-selected-name">'+ (data.name||data.title||'选择应用') +'</span>' +
                                               '         </span>' +
                                               '     </li>'
                                                    +
                                                    (!isAdmin 
                                                        ? ''
                                                        : ('<li>' + 
                                                            '   <label>&nbsp;</label>' +
                                                            '   <label class="label-for-alluser">' +
                                                            '       <input value="true" '+ (data.isTem?' checked="checked"':'') +'" type="checkbox" class="for-alluser add-scene-app-alluser" />' +
                                                            '       分配给所有用户</label>'+
                                                            '</li>'
                                                        )
                                                    )
                                                    +
                                               '    <input type="hidden" value="'+ (data.url||'') +'" class="add-scene-app-url" />' +
                                               '    <input type="hidden" value="'+ (data.name||data.title||'') +'" class="add-scene-app-title" />' +
                                               '    <input type="hidden" value="'+ (data.icon||'') +'" class="add-scene-app-icon" />' +
                                               '    <input type="hidden" value="'+ (data.appCode||'') +'" class="add-scene-app-appCode" />' +
                                               '</ul>')
                                               
                                            :  (data.type === 'LINK' 
                                                ?  ('<ul style="display:block;" class="add-scene-type-opera add-scene-info-LINK">' +
                                                    '    <li><label>标题</label><input value="'+ (data.name||data.title||'') +'" type="text" class="add-scene-site-title" /><span class="msg">(必填)</span></li>' +
                                                    '    <li><label>地址</label><input value="'+ (data.url||'') +'" type="text" class="add-scene-site-url" /><span class="msg">(必填)</span></li>'
                                                        +
                                                        (!isAdmin 
                                                            ? '' 
                                                            : ('<li>' +
                                                                '   <label>&nbsp;</label>' +
                                                                '   <label class="label-for-alluser">' + 
                                                                '       <input value="true" '+ (data.isTem?' checked="checked"':'') +' type="checkbox" class="for-alluser add-scene-site-alluser" name="add-scene-site-alluser" />' +
                                                                '       分配给所有用户</label>' +
                                                                '</li>'
                                                            )
                                                        )
                                                        +
                                                    '</ul>')
                                                    
                                                :  '<div style="display:block;" class="add-scene-type-opera no-changed">您没有权限编辑此桌面。</div>'
                                           )
                                       )
                                   )
                                    + 
                    '            </div>' +
                    '        </div>' +
                    '        <div class="add-scene-bottom-tools">' +
                    '            <input type="submit" value="确定" class="save-button tbc-button tbc-button-blue" />' +
                    '            <input type="button" value="取消" class="cancel-button tbc-button" />' +
                    '        </div>' +
                    '</div>';
                
                return htmlTemp;
            },
            
            /** 
             * 生成添加桌面的HTML模板
             * 
             * @private
             * @method addHtmlTemplate
             * @return {String} HTML代码
             */
            addHtmlTemplate : function() {
                
                var isAdmin  = window.desktop.isAdmin(),
                    htmlTemp = 
                    '<div class="tbc-add-scene">' +
                    '        <div class="tbc-add-scene-inner">' +
                    '            <div class="tbc-add-scene-box">' +
                    '                <div class="add-scene-type">' +
                    '                    <label>桌面类型</label>' +
                    '                        <select class="add-scene-type-select">' +
                    '                            <option value="DESKTOP" selected="selected">空白桌面</option>' +
                    '                            <option value="APPLICATION">应用</option>' +
                    '                            <option value="LINK">网站</option>' +
                    '                        </select>' +
                    '                </div>' +
                    '                <ul style="display:block;" class="add-scene-type-opera add-scene-info-DESKTOP">' +
                    '                    <li><label>标题</label><input type="text" value="" class="add-scene-normal-title" /> <span class="msg">(必填)</span></li>' +
                    '                </ul>' +
                    '                <ul class="add-scene-type-opera add-scene-info-APPLICATION clearFloat">' +
                    '                    <li class="add-scene-app-selected" title="打开应用选择器">' +
                    '                        <img class="add-scene-app-selected-icon" style="width:48px; display:none;" onerror="this.style.display=\'none\';"/>' +
                    '                        <span class="add-scene-app-selected-name">点击选择应用</span>' +
                    '                    </li>'
                                        +
                                        (!isAdmin ? '' : '<li><label>&nbsp;</label> <label class="label-for-alluser"><input value="true" type="checkbox" class="add-scene-app-alluser" name="add-scene-app-alluser" /> 分配给所有用户</label></li>')
                                        +
                    '                    <input type="hidden" value="" class="add-scene-app-url" />' +
                    '                    <input type="hidden" value="" class="add-scene-app-title" />' +
                    '                    <input type="hidden" value="" class="add-scene-app-icon" />' +
                    '                    <input type="hidden" value="" class="add-scene-app-appCode" />' +
                    '                </ul>' +
                    '                <ul class="add-scene-type-opera add-scene-info-LINK">' +
                    '                    <li><label>标题</label><input value="" type="text" class="add-scene-site-title" /> <span class="msg">(必填)</span></li>' +
                    '                    <li><label>地址</label><input value="" type="text" class="add-scene-site-url" /> <span class="msg">(必填), 以“http(s)://”开头.</span></li>'
                                        +
                                        (!isAdmin ? '' : '<li><label>&nbsp;</label> <label class="label-for-alluser"><input value="true" name="add-scene-site-alluser" type="checkbox" class="add-scene-site-alluser" /> 分配给所有用户</label></li>')
                                        +
                    '                </ul>' +
                    '                <div></div>' +
                    '            </div>' +
                    '        </div>' +
                    '        <div class="add-scene-bottom-tools">' +
                    '            <input type="submit" value="保存" class="save-button tbc-button tbc-button-blue" />' +
                    '            <input type="button" value="取消" class="cancel-button tbc-button" />' +
                    '        </div>' +
                    '</div>';
                
                return htmlTemp;
            },
            
            /** 
             * 保存桌面
             * 
             * @public
             * @async
             * @method saveDesktop
             * @param {Object} win 编辑器窗口(instance Of tbc.Window)
             * @param {String} url 保存地址
             * @param {Function} callback 保存成功的回调函数
             * @example
                desktop.manager.saveDesktop(win, function(json) {
                    console.log('保存成功');
                });
             */
            saveDesktop : function(win, url, callback) {
                
                var self = this,
                    verify,
                    type = win.ui.find(".add-scene-type-select").val(),
                    opt  = {
                        title    : "",
                        icon    : "",
                        appCode    : null,
                        url        : "",
                        closable: true,
                        id        : win.editId,
                        active    : true,
                        type    : type,
                        own        : true
                    },
                    ui = win.ui,
                    nodes={}
                    ;
                    
                switch (type) {
                    case "DESKTOP" :
                        nodes.title = ui.find(".add-scene-normal-title");
                        opt.title    = nodes.title.val();
                        break;
                        
                    case "APPLICATION" :
                        nodes.title = ui.find(".add-scene-app-title");
                        nodes.icon = ui.find(".add-scene-app-icon");
                        nodes.appCode = ui.find(".add-scene-app-appCode");
                        nodes.url = ui.find(".add-scene-app-url");
                        nodes.alluser = ui.find(".add-scene-app-alluser:checked");
                        
                        opt.title    = nodes.title.val();
                        opt.icon    = nodes.icon.val();
                        opt.appCode    = nodes.appCode.val();
                        opt.url        = nodes.url.val();
                        opt.alluser    = nodes.alluser.val();
                        break;
                        
                    case "LINK" :
                        nodes.title = ui.find(".add-scene-site-title");
                        nodes.url = ui.find(".add-scene-site-url");
                        nodes.alluser = ui.find(".add-scene-site-alluser:checked");
                        
                        opt.title    = nodes.title.val();
                        opt.url        = nodes.url.val();
                        opt.alluser    = nodes.alluser.val();
                        break;    
                }
                
                verify = this.validate(type, opt, nodes);
                if (verify===true) {
                    $.ajax({
                        url            : url,
                        type        : "post",
                        data        : {
                            id        : opt.id,
                            type    : type,
                            title    : opt.title,
                            originalTitle    : win.sceneOptions ? (win.sceneOptions.name||win.sceneOptions.title) : null,
                            icon    : opt.icon,
                            appCode : opt.appCode,
                            url        : opt.url,
                            alluser : opt.alluser
                        },
                        dataType    : "json",
                        success        : function(json) {
                            if ($.isFunction(callback)) {
                                callback.call(self, json, opt);
                            }
                        }
                    });
                }
            },
            
            /**
             * 用于在保存桌面前，验证数据是否正确
             * 
             * @public
             * @method validate
             * @param {String} type 桌面类型, 因为不同类型的桌面要使用不同的验证方式
             * @param {Array} opt 桌面配置数据列表
             * @param {Array} nodes 与配置数据对应的HTML表单控件
             * @return {Boolean} 验证通过返回true, 否则返回false
             */
            validate : function(type, opt, nodes) {
                var result;
                switch (type) {
                    case 'APPLICATION':
                        if (!opt.title||!opt.appCode||!opt.url) {
                            nodes.title.siblings('.add-scene-app-selected')
                            .fadeOut(100).fadeIn(200)
                            .css({background:'#D93C33', color:'#fff'})
                            .one('click', function() {
                                $(this).css({background:'', color:''});
                            });
                            result = false;
                        }
                        break;
                        
                    case "LINK" :
                        
                        if (typeof opt.url !== 'string' || $.trim(opt.url).length === 0) {
                            nodes.url
                            .one('focusin', function() {
                                $(this).siblings('.msg').html('(必填),以“http(s)://”开头.').css({color:''});
                            })
                            .siblings('.msg').html('(不能为空)').css({color:'red'});
                            result = false;
                        } else if (!opt.url.match(/^https?:\/\//)) {
                            nodes.url
                            .one('focusin', function() {
                                $(this).siblings('.msg').html('(必填),以“http(s)://”开头.').css({color:''});
                            })
                            .siblings('.msg').html('(不是正确的网址)').css({color:'red'});
                            result = false;
                        }
                        
                    case "DESKTOP" :
                    case "LINK" :
                        if (typeof opt.title !== 'string' || $.trim(opt.title).length === 0) {
                            nodes.title
                            .one('focusin', function() {
                                $(this).siblings('.msg').html('(必填)').css({color:''});
                            })
                            .siblings('.msg').html('(不能为空)').css({color:'red'});
                            result = false;
                        }
                        break;
                }
                return result !== false;
            },
            
            /** 
             * 打开新增桌面的窗口
             *
             * @public
             * @method addDesktop
             */
            addDesktop : function () {
                
                var self = this,
                    win  = this.addWin,
                    pos;
                
                if (win && $.isFunction(win.focus)) {
                    this.addWin.focus();
                } else {
                    pos = $('.tbc-desktop-nav').offset();
                    win = this.addWin =  new tbc.Window({
                        name : "增加桌面",
                        icon : "icon-add_small",
                        left : pos.left - 12,
                        top  : pos.top + 24,
                        width  : 480,
                        height : 320,
                        minWidth    : 480,
                        minHeight   : 320,
                        loadType    : "html",
                        scrolling   : false,
                        minimizable : true,
                        maximizable : true
                    })
                    .addEvent({
                        'close' : function() {
                            delete self.addWin;
                        },
                        'resize' : function(size) {
                            var toolsHei = this.ui.find('.add-scene-bottom-tools').outerHeight()||0,
                                hHei = this.part.header.outerHeight()||0,
                                mhei = size.height - toolsHei - hHei- 10;
                            this.ui.find('.tbc-add-scene-inner').height(mhei);
                        }
                    })
                    .show()
                    .append(this.addHtmlTemplate());
                    
                    win.ui
                    .on("click", ".cancel-button", function() {
                        win.close();
                    })
                    .on("click", ".save-button", function() {
                        self.saveDesktop(win, URLS.sceneAdd, function(json, pageData) {
                            
                            if (json.success) {
                                pageData.isTem = !!pageData.alluser;
                                pageData.id = json.data.id;
                                window.desktop.addScene(window.desktop.tabs.length, pageData);
                                win.close();
                            } else {
                                alert(json.message || "添加失败");
                            }
                        });
                    })
                    .on("click", ".add-scene-app-selected", function (event) {
                        win.openModalDialog({width:680, height:450}, tbc.AppSelector)
                        .addEvent({
                            close : function(selected) {
                                var winui = win.ui;
                                if (selected && selected.length !== 0) {
                                    winui.find(".add-scene-app-title").val(selected[0].applicationName);
                                    winui.find(".add-scene-app-icon").val(selected[0].applicationIconUrl);
                                    winui.find(".add-scene-app-appCode").val(selected[0].appCode);
                                    winui.find(".add-scene-app-url").val(selected[0].homePageUrl);
                                    
                                    winui.find(".add-scene-app-selected-name").html(selected[0].applicationName);
                                    winui.find(".add-scene-app-selected-icon")
                                    .css({display:"block"})
                                    .attr('src', selected[0].applicationIconUrl);
                                }
                            }
                        })
                        .show();
                    })
                    .find(".add-scene-type-select").change(function() {
                        $(".add-scene-type-opera").hide();
                        $(".add-scene-info-"+this.value).show();
                    });
                }
            },
            
            /** 
             * 打开修改桌面的窗口  
             *
             * @public
             * @method editDesktop
             * @param {instance of tbc.Scene} scene 要修改的桌面实例
             */
            editDesktop : function(scene) {
                
                this.editWin = this.editWin || {};
                
                var self = this,
                    winId = scene.options.id,
                    win = this.editWin[winId],
                    pos;
                
                if (win && $.isFunction(win.focus)) {
                    win.focus();
                } else {
                    pos = $('.tbc-desktop-nav').offset();
                    win = this.editWin[winId] = new tbc.Window({
                        name   : "修改桌面",
                        icon   : "icon-pencil",
                        left   : pos.left - 12,
                        top    : pos.top + 24,
                        width  : 480,
                        height : 320,
                        minWidth    : 480,
                        minHeight   : 320,
                        loadType    : "html",
                        minimizable : true,
                        maximizable : true,
                        scrolling   : false
                    })
                    .addEvent({
                        'close' : function() {
                            delete self.editWin[winId];
                        }
                    })
                    .show();
                    
                    win.editId = winId;
                    win.sceneOptions = scene.options;
                    
                    win.append(this.editHtmlTemplate(scene.options));
                    
                    win.ui
                    .on("click", ".cancel-button", function() {
                        win.close();
                    })
                    .on("click", ".save-button", function() {
                        if (win.ui.find('no-changed').size()===0) {
                            self.saveDesktop(win, URLS.sceneUpdate, function(json, pageData) {
                                
                                if (json.success) {
                                    scene.options.name = pageData.title;
                                    scene.options.type = pageData.type || scene.options.type;
                                    scene.options.icon = pageData.icon;
                                    scene.options.url = pageData.url;
                                    scene.options.isTem = !!pageData.alluser;
                                    scene.handle.attr('title', pageData.title);
                                    if (pageData.type === 'LINK' || pageData.type === "APPLICATION") {
                                        
                                        scene.loadContentAsIframe();
                                    }
                                    win.close();
                                } else {
                                    alert(json.message || "保存失败");
                                }
                            });
                        } else {
                            win.close();
                        }
                    })
                    .on("click", ".add-scene-app-selected", function (event) {
                        win.openModalDialog({}, tbc.AppSelector)
                        .addEvent({
                            close : function(selected) {
                                if (selected && selected.length !== 0) {
                                    win.ui.find(".add-scene-app-title").val(selected[0].applicationName);
                                    win.ui.find(".add-scene-app-icon").val(selected[0].applicationIconUrl);
                                    win.ui.find(".add-scene-app-appCode").val(selected[0].appCode);
                                    win.ui.find(".add-scene-app-url").val(selected[0].homePageUrl);
                                    
                                    win.ui.find(".add-scene-app-selected-name")
                                    .html(selected[0].applicationName)
                                    .siblings(".add-scene-app-selected-icon")
                                    .css({display:"block"})
                                    .attr('src', selected[0].applicationIconUrl);
                                }
                            }
                        })
                        .show();
                    });
                }
            },
            
            /** 
             * 删除桌面
             * @public
             * @method deleteDesktop
             * @param {instance of tbc.Scene} scene 要删除的桌面实例
             */
            deleteDesktop : function(scene) {
                var desktop = window.desktop,
                    data = {
                        deskId : scene.options.id
                    };
                
                $.ajax({
                    url      : URLS.sceneDelete,
                    type     : 'post',
                    dataType : 'json',
                    data     : data,
                    success  : function(json) {
                        var index = scene.index,
                            count,
                            i,
                            desk;
                        
                        if (json && json.success) {
                            scene.close();
                            count = desktop.tabs.length;
                            for (i=index; i<count; i+=1) {
                                desk=desktop.tabs[i];
                                if (desk) {
                                    desk.handle.find('i').html(i+1);
                                }
                            }
                            desk = null;
                        } else {
                            tbc.alert(json.message);
                        }
                    }
                });
            },
            
            /** 
             * 设置为默认桌面
             * 
             * @public
             * @method setDefault
             * @param {String} id 桌面ID
             * @param {Boolean} forAllUser 是否设为所有学员的默认桌面
             * @asynch
             */
            setDefault : function(id, forAllUser, callback) {
                
                var data = {deskId: id};
                
                if (forAllUser===true) {
                    data.forAllUser = "true";
                }
                
                callback = callback || ($.isFunction(forAllUser) ? forAllUser : null);
                
                $.ajax({
                    url      : URLS.setDefaultDesktop,
                    type     : 'post',
                    dataType : 'json',
                    data     : data,
                    success  : function(json) {
                        if (!$.isFunction(callback) || callback() !== false) {
                            tbc.alert(json.message);
                        }
                    }
                });
            }
        });
    };
}(window.tbc, window.jQuery, URLS));

/*
 * Class:  tb.Folder (文件夹) ########################################## 
 * 
 * @Copyright    : 时代光华
 * @Author        : 罗志华
 * @mail         : mail@luozhihua.com
 * 
 */
 
tbc.Folder = function(settings) {
    
    "use strict";
    
    var SELF = tbc.self(this, arguments);
    
        if (settings) {
            settings.icon = "icon-folder_classic_opened";
            settings.minimizable = true; // 可最小化
            settings.refreshable = true; // 可刷新
            settings.helpable = true;    // 有帮助内容
            settings.minWidth =  520;
            settings.minHeight = 380;
        }
        
        settings.loadType="html";
        SELF.extend([tbc.Window,settings]);
        SELF.packageName = "tbc.Folder";
    
    var defaults = {
          orderBy     : "name"
        , name        : ""
        , id        : ""
        , viewState : "list" // [list, icon, content]
        
    },
    options = tbc.extend({}, defaults, settings)
    ;
    
    var folderViewer = $(
        '<div class="tbc-folder-viewer">' +
        '    <div class="tbc-folder-directory" _title="目录结构"></div>' +
        '    <div class="tbc-folder-container" _title="文件夹内容"></div>' +
        '    <div class="tbc-folder-previewer" _title="文件预览"></div>' +
        '</div>'),
        directory = $(".tbc-folder-directory", folderViewer),
        container = $(".tbc-folder-container", folderViewer),
        previewer = $(".tbc-folder-previewer", folderViewer);

    SELF.append(folderViewer);
    
    SELF.classType    = "folder";
    
    SELF.svid        = options.userDeskItemId;
    SELF.data        = options.data; // 文件夹数据
    SELF.container    = container;
    
    /* 从缓存获取数据 */
    var tableName    = ["shortcuts", SELF.packageName, SELF.svid].join("_"),
        table         = tbc.jdc.getTable(tableName) || tbc.jdc.createTable(tableName);
        
    var data        = table ? tbc.jdc.select(table, "all") : null;
    
    SELF.saveData = function(_data) {
        data = data||[];
        _data = tbc.isArray(_data) ? _data : [_data];
        var a = data;
        $.each(_data, function(i, d) {
            var isExist;
            $.each(a, function() {
                if (this.userDeskItemId === d.userDeskItemId) {
                    isExist = true;
                }
            });
            isExist && data.push(d);
        });
        
        tbc.jdc.set(tableName, options.userDeskItemId, data);
    };
    
    // 接受图标拖动
    SELF.addEvent({
        "open": function() {
            desktop.iconsDrager && desktop.iconsDrager.addContainer(container);
        },
        "afterClose" : function() {
            desktop.iconsDrager && desktop.iconsDrager.removeContainer(container);
        }
    });
    
    // 重命名
    SELF.rename = function(newName) {
        
        var ui      = SELF.openModalDialog({width:350,height:200,name:"重命名",loadType:"html"}, tbc.Window).show(),
            wrap    = $('<div style="padding:32px;"></div>'),
            name    = SELF.name(),
            input    = $('<input class="tbc-inputer" type="text" value="'+ name +'" style="width:130px;"/>')
                .focus(function() {
                    this.select();
                    tips.html(tips.attr("title")).css({color:"#888"});
                })
                .keyup(function(event) {
                    if (event.keyCode === 13) {
                        save();
                        return false;
                    }
                }),
            tips    = $('<div title="最多5个汉字或10个英文字符." style="clear:both; margin-bottom:1em; color:#888;">最多5个汉字或10个英文字符.</div>'),
            submit    = new tbc.Button({ border:true, text:"保存", icon:"icon-check", click:function() {save();} }),
            cancel    = new tbc.Button({ border:true, text:"取消", icon:"icon-close", click:function() {ui.close();} }),
            save     = function() {
                var folderName1 = $.trim(input.val()),
                    folderName    = tbc.substr(folderName1, 10),
                    niceName    = folderName + "(" + folderName1.replace(folderName,"")+")",
                    folderId  = options.folderId||options.userDeskItemId,
                    desktopId = desktop.current().ui.attr("svid");
                
                if (folderName1.length>folderName.length) {
                    tips.shake().html("文件夹名过长,最多5个汉字或10个英文字符.").css({color:"red"});
                } else {
                    $.ajax ({
                          url  : URLS["renameFolder"]
                        , type : "post"
                        , data : {"_ajax_toKen":"elos", folderName:folderName, userDeskId:desktopId, userDeskItemId:folderId }
                        , dataType   : "JSON"
                        , beforeSend : function() { ui.lock("loading","正在保存..."); }
                        , complete : function() { ui.unlock("loading"); }
                        , error    : function() {}
                        , success  : function(json) {
                            if ((json && json.success) || (typeof json==="string" && $.trim(json).toLowerCase() === "true")) {
                                SELF.name(folderName);
                                ui.close();
                            }
                        }
                    });
                }
            };
            
            submit.ui.css({marginRight:"10px"});
            submit.depend(ui);
            cancel.depend(ui);
            
            ui.addEvent({
                "afterClose": function() {
                    wrap.remove();
                    input.remove();
                    tips.remove();
                    submit.DESTROY();
                    ui = name = input = wrap = submit = save = null;
                },
                focus:function() {
                    input.focus();
                }
            });
            
            wrap.appendTo(ui.container).append(input).append(tips).append(submit.ui).append(cancel.ui);
            ui.blur();
            input.focus();
    };
    
    SELF.viewAs = function(state) {
        switch(state) {
            case "list":
                SELF.viewAsList();
                break;
            case "icon":
                SELF.viewAsIcon();
                break;
        }
    };
    
    SELF.viewAsList = function() {
        
    };
    
    SELF.viewAsIcon = function(depend) {
        container.empty();
        $.each(data, function(i, s) {
            var s = new tbc.Shortcut(s).appendTo(SELF);
                s.depend(SELF);
                s=null;
        });
        return SELF;
    };
    
    SELF.viewAsContent = function() {
        
    };
    
    // 保存排序
    SELF.saveOrder = function() {
        var list = [];
        SELF.container.children(".tbc-shortcut").each(function() {
            list.push(this.getAttribute("_shortcutId"));
        });
        
        $.ajax({
              url        : URLS["orderFolderShorcuts"]
            , type        : "post"
            , dataType    : "json"
            , data        : {folderid:SELF.svid, items:list.join(",")}
            , complete    : function() {}
            , error        : function() {}
            , success    : function(json) {
                if (json && json.result === "success") {
                    
                }
            }
        });
        SELF.shortcutSequence = list;
        
        return SELF;
    };
    
    // 删除
    SELF.del = function() {
        tbc.Folder.del(SELF.svid, function(r) {
            if (r.result) {
                SELF.close();
            }
        });
    };
    
    // 刷新
    SELF.refresh = function () {
        
    };
    
    // 加载数据
    SELF.load = function () {
        
    };
    
    // 文件夹图标
    SELF.name(options.folderName||options.userDeskItemName||"");
    
    
    // 开启划选
    SELF.container.selectArea({
        item            : ".tbc-shortcut",
        exclude            : ".tbc-folder-shortcut",
        classSelected    : "tbc-shortcut-selected",
        event             : {
            select    : function() {},
            unselect: function() {}
        }
    });

    
    /* 如果没有缓存的数据,则从服务器端加载 */
    if (!data) {
        tbc.Folder.load(options.folderId || options.userDeskItemId, function(json) {
            data = json||{};
            SELF.viewAsIcon(true);
            SELF.triggerEvent("folderLoad", json);
            
            $.each(data, function() {
                tbc.jdc.set(tableName, this.userDeskItemId, this);
            });
        });
    }else{
        SELF.viewAsIcon(true);
    }
    
    var rename = new tbc.Button({ icon:"icon-tag_edit", text:"重命名", border:false, click:function() { SELF.rename(); } });
        rename.depend(SELF);
    SELF.tools.add("rename",rename);
    
    SELF.addEvent ({
        "destroy" : function() {
            SELF = folderViewer = directory = container = previewer = data = table = tableName = rename = null;
        }
    });
};

/* 静态方法: 加载数据 */
tbc.Folder.load = function(id, cb) {
    if (tbc.isFunction(cb)) {
        
        $.ajax({
            url : tbc.formatString(URLS["loadFolderContent"], id),
            dataType    : "json",
            data        : {"userDeskItemId": id},
            type        : "post",
            complete    : function() {},
            error        : function() {},
            success        : function(json) {
                cb(json);
            }
        });
    }
};

/* 静态方法:删除文件夹 */
tbc.Folder.del = function(id, cb) {
    cb && $.ajax({
        url : tbc.formatString(URLS["deleteFolder"], id),
        dataType    : "json",
        type        : "post",
        data        : {userDeskItemId:id},
        complete    : function() {},
        error        : function() {},
        success        : function(json) {
            cb(json);
        }
    });
}

;
tbc.ns("tbc.folder");
tbc.folder.Pop = function(settings) {
	var SELF = tbc.self (this, arguments);
	
	SELF.extend (tbc.Event, tbc.CLassManager, [tbc.Pop, settings]);
	SELF.packageName = "tbc.folder.Pop";
	
	var defaults = {
		
	},
	options = tbc.extend({}, defaults, settings);
	
	SELF.ui.addClass("tbc-pop-folder");
	SELF.svid = options.userDeskItemId;
	
	SELF.render = function(data) {
		SELF.container.empty();
		SELF.layout(data.length);
		
		$.each(data, function(i, s) {
			var s = new tbc.Shortcut(s).appendTo(SELF);
				s.depend(SELF);
				s.addEvent({
					"open": function() {
						SELF.close();
					}
				});
				s=null;
		});
		return SELF;
	}
	
	// 排列图标
	SELF.layoutTimeout = null;
	SELF.layout = function(count) {
		clearTimeout(SELF.layoutTimeout);
			var self = SELF,
				c	= count || SELF.container.children(".tbc-shortcut").size(),
				w	= _W (c, 90),
				h	= _H (c, 100),
				xw	= 800,
				xh	= 550,
				mw	= 320,
				mh	= 100,
				W	= Math.max(Math.min(w, xw, document.body.offsetWidth), mw),
				H	= Math.max(Math.min(h, xh, document.body.offsetHeight), mh);
				
			self.ui.css({ width:W, height:H });
			self.locate();
			self = null;
		SELF.layoutTimeout = setTimeout(function () {
		}, 0);
	}
	
	function _W(c, v) {
		v+=10;
		return c>=0&&c<=9 ? v*3
			: c>9&&c<=16 
				? v*4 
					: c>16&&c<=25 
						? v*5 
							: c>25&c<36
								? v*6
									: v*7
							
	}
	
	function _H(c, v) {
		v+=10;
		return c>=0&&c<=3 ? v
			: c>3&&c<=6
				? v*2 
					: c>6&&c<=12 
						? v*3 
							:  c>12&&c<=16
								? v*4
									: c>16&c<=20
										? v*4
											: c>20&&c<=30
												? v*5
													: v*6
					
	}
	
	// 保存排序
	SELF.saveOrder = function() {
		var list = [];
		SELF.container.children(".tbc-shortcut").each(function() {
			list.push(this.getAttribute("_shortcutId"));
		});
		
		$.ajax({
			  url		: URLS["orderFolderShorcuts"]
			, type		: "post"
			, dataType	: "json"
			, data		: {folderid:SELF.svid, items:list.join(",")}
			, complete	: function() {}
			, error		: function() {}
			, success	: function(json) {
				if (json && json.result === "success") {
					
				}
			}
		});
		SELF.shortcutSequence = list;
		
		return SELF;
	}
	
	/* 从缓存获取数据 */
	var tableName	= "shortcuts_tbc.Folder_"+ options.userDeskItemId,
		table 		= tbc.jdc.getTable(tableName) || tbc.jdc.createTable(tableName);
	var data		= table ? tbc.jdc.select(table, "all") : null;
	
	/* 如果没有缓存的数据,则从服务器端加载 */
	if (!data) {
		tbc.Folder.load (options.folderId || options.userDeskItemId, function(json) {
			data = json||[];
			SELF.render (json);
			SELF.triggerEvent ("folderLoad", json);
			SELF.locate ();
			
			// 缓存数据
			$.each (data, function () {
				tbc.jdc.set (tableName.join("_"), this.userDeskItemId, this);
			});
		});
	}else{
		SELF.render(data);
	}
	
	// 点击任意地方隐藏文件夹
	setTimeout (function () {
		$ (document.body) .bind ("click.hideFolder_pop", function (event) {
			$(document.body).unbind("click.hideFolder_pop");
			if (!event.ctrlKey && event.target !== SELF.container[0] && $ (event.target).parents().index(SELF.container) === -1) {
				if (event.target.className === "tbc-pop-container") return;
				SELF.close && SELF.close();
			}
		});
	}, 0);
	
	SELF.ui.contextmenu ({items:[]});
	
	// 开启划选
	SELF.container.selectArea({
		item			: ".tbc-shortcut",
		exclude			: ".tbc-folder-shortcut",
		classSelected	: "tbc-shortcut-selected",
		event 			: {
			select	: function() {},
			unselect: function() {}
		}
	});
	
	// 图标拖动
	desktop.iconsDrager && desktop.iconsDrager.addContainer(SELF.container);
	SELF.addEvent({
		"close" : function() {
			$(document.body).unbind("click.hideFolder_pop");
			
			// 关闭图标拖动
			desktop.iconsDrager && desktop.iconsDrager.removeContainer(SELF.container);
		}
		
		, "destroy" : function () {
			SELF = table = data = settings = _w = _H = options = defaults = settings = null;
		}
	});
}
;tbc.namespace("tbc.historyStore");

/* 历史记录管理器 *******************************************************
 
 * METHOD - 方法 --------------------------------------------------------
 * @Method: get(id[string]);    // 根据ID返回其历史记录对象,如果不存在则会自动创建;
 * @Method: remove(id[string]); // 根据ID移除历史记录;
 */
tbc.extend(tbc.historyStore, {
    cache  : {},
    
    get    : function(id) {
        return this.cache[ id ];
    },
    
    set    : function(id, redirector) {
        this.cache[id] = new tbc.history(redirector);
        return his;
    },
	
	add    : function(id, history) {
		this.cache[ id ] = this.cache[id] || history;
		return this.cache[ id ];
	},
    
    remove : function(id) {
        delete this.cache[id];
    }
});



/*
 * 历史记录类 ***********************************************************
 
 * PARAMETER - 参数 -----------------------------------------------------
 * @para: func_redirect; 必须,用于执行历史记录跳转的函数。
 
 * METHOD - 方法 --------------------------------------------------------
 * @Method: [object]  go(indexOfHistory); return this;
 * @Method: [object]  forward(FunctionForRedirect); return this;
 * @Method: [object]  back(FunctionForRedirect); return this;
 * @Method: [boolean] isFirst();
 * @Method: [boolean] isLast();
 
 * INHERITED - 继承的方法 -----------------------------------------------
 * @Method: addEvent(eventType, Function); 继承自tbc.event;
 * @Method: removeEvent(eventType, Function); 继承自tbc.event;
 * @Method: triggerEvent(eventType, Parameter[Array]); 继承自tbc.event;
 
 * EVENT - 事件 ---------------------------------------------------------
 * @Event:  go;         // on execute method go();
 * @Event:  back;       // on execute method back();
 * @Event:  forward;       // on execute method forward();
 * @Event:  redirect;   // on execute method redirect();
 */
tbc.History = function(redirector) {
    
	// 初始化
	(function init(self, _arguments) {
			
		var SELF = tbc.self(self, _arguments);
		
			SELF.packageName = "tbc.History";
			SELF.cache = [];
			SELF.currentIndex = 0;	
			
		try { return SELF; } finally { SELF=null; }
		
	})(this, arguments)
	
    .extend ({
		
		current : function() {
			return this.cache[this.currentIndex];
		},
		
		add : function (url, method, data) {
			if (this.prohibited === true) {
				return this;
			} else {
				delete this.prohibited;
				
				var record = typeof(url) === "string" ? {url:url, method:method, data:data} : url;
				
				this.clear();
				
				var last = this.cache[this.currentIndex];
				if (last.url !== record.url) {	
					this.cache.push(record);
					this.currentIndex = this.cache.length-1;
					this.triggerEvent("add");
				}
				return this;
			}
		},
		
		// 转向对应的历史记录
		redirect : function(record, subRedirector, noNewHistory) {
			var func = subRedirector || redirector;
			
			if (typeof func === "function") {
				this.triggerEvent("beforeRedirect");
				try{
					this.prohibited = true;
					if (!subRedirector || ($.isFunction(subRedirector) && subRedirector(record, noNewHistory) !== false)) {
						redirector(record, noNewHistory);
					}
				}catch(e) {}
				this.triggerEvent("afterRedirect"); 
			}
			return this;
		},
		
		// 清除当前页面所处位置的时间轴近端的历史记录
		clear : function() {
			this.cache = this.cache.slice(0, this.currentIndex+1);
			return this;
		},
		
		/*
		 * 跳转到某一页,_index要跳转的索引;
		 * 当_index值为负数时,将基于当前页后退相应的页数
		 */
		go : function(_index, redirect) {
			var index	= _index>=0 ? _index : this.currentIndex + _index;
				index	= this.limitIndex(index);
			var record	= this.cache[index];
			
			this.currentIndex = index;
			
			if (record) {
				this.redirect(record, redirect, true);
				this.triggerEvent("go");
			}
			return this;
		},
		
		// 向前一页
		forward : function(redirect) {
			if (!this.isLast()) {
				var index	= this.currentIndex+1,
					record	= this.cache[index];
				
				this.currentIndex = index;
				
				this.redirect(record, redirect, true);
				this.triggerEvent("forward");
			}
			return this;
		},
		
		// 后退一页
		back : function(redirect) {
			if (!this.isFirst()) {
				var index = this.currentIndex-1,
					record   = this.cache[index];
				
				this.currentIndex = index;
				
				this.redirect(record, redirect, true);
				this.triggerEvent("back");
			}
			return this;
		},
		
		// 后退一页
		reload : function() {
			if (!this.isFirst()) {
				var record   = this.current();
				this.redirect(record, null, true);
				this.triggerEvent("reload");
			}
			return this;
		},
		
		// 保持索引值在缓存路径数量的范围之类
		limitIndex : function(index) {
			index = Math.max(index, 0);
			return Math.min(index, this.cache.length-1);
		},
		
		// 是否可以向前跳转
		isLast : function() {
			return (this.currentIndex === this.cache.length-1) || this.cache.length === 0;
		},
		
		// 是否可以后退
		isFirst : function() {
			return this.currentIndex===0;
		}
	});
}
/**
 * 快速启动, Widgets图标
 * @class tbc.QuickLaunch
 * @constructor
 * @copyright 时代光华
 * @author mail@luozhihua.com
 */
;(function(tbc, $) {

    "use strict";

    tbc.QuickLaunch = function(settings) {
        var defaults = {
              container : ".tbc-task-quickLaunch"
            , ui        : ".tbc-task-quickLaunch"
            , invisible : ".tbc-task-invisible"
            , invisibleHandle : ".tbc-task-invisible-handle"
        },
        options = $.extend({}, defaults, settings),
        iconModel = '<i class="tbc-imgicon tbc-icon" title="{0}"><img _src="{1}"/></i>';

        tbc.self(this, arguments).extend({
            init : function() {
                var SELF = this;

                this.packageName  = "tbc.QuickLaunch";
                this.cache_length = 0;
                this.cache     = {};
                this.ui        = $(options.ui);
                this.container = $(options.container, this.ui);
                this.handle    = $(options.invisibleHandle, this.ui);
                this.invisible = $(options.invisible, this.ui);
                this.container = this.container.size() ? this.container : this.ui;

                this.handle.click(function(event) {
                    SELF.toggleInvisible();
                    event.stopPropagation();
                    return false;
                });
            },

            /**
             * 追加一个图标
             * @param  {Object} sets 配置项
             */
            append : function(sets) {
                var def = {
                    guid  : null,
                    icon  : "",
                    title : "",
                    click : null
                },
                opt = $.extend({}, def, sets),
                iconNode = $(tbc.formatString(iconModel, opt.title, opt.icon));
                
                if (!opt.guid) {
                    return alert("缺少配置项: {guid:undefined}");
                }
                
                iconNode.appendTo(this.container);
                
                // 图标
                if ( opt.icon.match(/\.(jpg|jpeg|gif|png|img|bmp|ico)$/) || opt.icon.indexOf("sf-server/file/getFile/") !== -1 ) {
                    iconNode.find("img").show().attr("src", opt.icon);
                } else {
                    iconNode.find("img").hide().parent().addClass(opt.icon);
                }
                
                iconNode
                .attr("guid", opt.guid)
                .bind({ "click" : opt.click });
                
                if (!this.cache[opt.guid]) {
                    this.cache[opt.guid] = iconNode;
                    this.cache_length++;
                    this.toggleHandle();
                }
                
                taskbar.resize();
                
                def = opt = sets = iconNode = null;
            },

            /**
             * [ description]
             * @param  {string} guid
             * @chainable
             */
            drop : function(guid) {
                var ico = this.cache[guid];
                if (ico) {
                    ico.remove();
                    delete this.cache[guid];
                    this.cache_length--;
                    this.toggleHandle();
                }
                ico = null;
                return this;
            },
            
            /**
             * 设置图标
             * @param  {String} ico
             * @chainable
             */
            icon : function(ico) {
                if (ico.match(/(jpg|jpeg|gif|png|bmp|ico|img)$/)|| ico.indexOf("sf-server/file/getFile/") !== -1) {
                    iconNode.children("img").show().attr("src", img);
                }else{
                    iconNode.addClass(ico).children().hide();
                }
                return this;
            },
            
            /**
             * 设置HTML元素的title属性
             * @param  {String} title
             * @chainable
             */
            tips : function(title) {
                iconNode.attr("title", title);
                return this;
            },
            
            /**
             * 判断快速启动栏是否有空间
             * @return {Boolean}
             */
            hasSpace : function() {
                var WID = this.container[0].clientWidth,
                    wid = this.cache_length*18;
                return wid<WID;
            },
            
            /**
             * 显示隐藏的图标
             * @param {Boolean} sign 是否记录显示状态，
             *  @default true;
             * @chainable
             */
            showInvisible : function(sign) {
                var SELF = this;
                this.invisible.stop().slideDown(200);
                sign !== false && (this.invisibleState = "show");
                
                $(document).bind({
                    "click.hideQuicklaunch" : function() {
                        SELF.hideInvisible();
                        $(document).unbind("click.hideQuicklaunch");
                    }
                });
            },
            
            /**
             * 隐藏超出数量的图标
             * @param  {Boolean} sign 是否记录显示状态，默认true;
             * @chainable
             */
            hideInvisible : function(sign) {
                this.invisible.stop().slideUp(200);
                sign !== false && (this.invisibleState = "hide");
                
                $(document).unbind(".hideQuicklaunch");
            },
            
            toggleInvisible : function() {
                if (this.invisibleState === "hide") {
                    this.showInvisible();
                }else{
                    this.hideInvisible();
                }
            },
            
            /**
             * 切换状态
             * @chainable
             */
            toggleHandle : function() {
                if (this.container[0].clientWidth/18 > this.cache_length) {
                    this.handle.show();
                }else{
                    this.handle.hide();
                }

                return this;
            },
            
            /**
             * 检测是否已经存在
             * @param  {String} guid 需要检测的ID
             * @return {Boolean} 返回true表示已经存在，否则不存在
             */
            isExist : function(guid) {
                return this.cache[guid] ? true : false;
            }
        })
        .init();
    }
}(tbc, jQuery));
  

;(function(tbc, $, URLS) {
    
    "use strict";
    
    /**
     * 桌面分屏
     * @class tbc.Scene
     * @uses tbc.Tabpage
     * @constructor
     * @copyright 时代光华(2013)
     * @author mail@luozhihua.com
     */
    tbc.Scene = function(settings) {
        var defaults = {
              gridWidth     : 116
            , gridHeight    : 110
            , paddingTop    : 40
            , paddingLeft   : 80
            , type          : null
            , url           : null
        },
        options    = $.extend({}, defaults, settings),
        list,
        height, width,
        row, col,
        paddingTop, paddingLeft,
        gridWidth, gridHeight,
        visibleWidth, visibleHeight,
        sceneTop, sceneLeft,
        desktop = window.desktop
        ;
        
        settings.closable = settings.own;
        
        tbc.self(this, arguments)
        .extend([tbc.Tabpage, settings], {
            
            /** 
             * 初始化
             * 
             * @method init
             * @private 
             * @chainable
             */
            init : function() {
                
                var SELF = this;
                
                this.packageName= "tbc.Scene";
                this.classType  = "scene";
                this.options    = options;
                this.svid       = this.options.id;
                this.shortcutsContainer = $('<div class="tbc-desktop-shortcutsContainer"></div>')
                    .appendTo(this.container);
                
                height  = this.container.height();
                width   = this.container.width();
                row     = 0;
                col     = 0;
                paddingTop  = this.options.paddingTop;
                paddingLeft = this.options.paddingLeft;
                gridWidth   = this.options.gridWidth;
                gridHeight  = this.options.gridHeight;
                
                visibleWidth= width   - paddingLeft - (gridWidth);
                visibleHeight= height - paddingTop  - (gridHeight);
                sceneTop    = 0;
                sceneLeft   = 0;
                
                // 布局参数
                this.setLayoutInfo = function() {
                    height  = SELF.container.height();
                    width   = SELF.container.width();
                    visibleWidth  = width - (gridWidth);
                    visibleHeight = height - (gridHeight*1.5);
                };
                
                this.addEvent({
                    "show" : function() {
                        if (this.loaded !== true) {
                            this.load();
                        }
                    },
                    "beforeShow" : function() {
                        
                    }
                });
                
                this.initContextmenu();
                this.initPlus();
                
                return this;
            },
            
            /**
             * 初始化桌面的 加 号
             * 
             * @private 
             * @method initPlus
             */
            initPlus : function() {
                
                var settings = tbc.system.settings,
                    SELF = this;
                /* 
                 * 如果类型是网站、单应用的桌面，或者系统设置不允许显示，则不渲染“加号”
                 */
                if (options.type==="LINK" || options.type==="APPLICATION") {
                    return this;
                }
                
                
                if (!this.plusSignInited) {
                    this.plusSign = $('<div title="添加..." _shortcutid="plus" class="tbc-shortcut tbc-plus-shortcut"></div>')
                    .html(
                        '<div class="tbc-shortcut-inner">' +
                        '   <i class="tbc-shortcut-icon"><em></em></i>' +
                        //'   <span class="tbc-shortcut-label"></span>' +
                        '</div>'
                   )
                    .css({left:options.paddingLeft, top:options.paddingTop});
                    
                    
                    this.plusSign.contextmenu({ 
                        items : [
                            {text: function() {return desktop.isSysAdmin() || settings.allowCreateFolder ? "新建文件夹" : null;}, icon:"icon-folder_modernist_add_simple", disabled:false, click:function() {
                                desktop.creatFolder(SELF);
                            }},
                            {text: function() {return desktop.isSysAdmin() || settings.allowCreateShortcut ? "新建快捷方式" : null;}, disabled:false, click:function() {
                                desktop.startSimpleShortcutsAdd();
                            }},
                            {text: function() {return desktop.isSysAdmin() || settings.allowManagerShortcut ? "管理快捷方式" : null;}, disabled:false, click:function() {
                                desktop.startShortcutsManager();
                            }},
                            {text: "添加桌面", disabled:false, icon:"icon-add_small", click:function() {
                                desktop.manager.addDesktop();
                            }}
                        ]
                    })
                    .bind({
                        "click" : function(event) {
                            var self = $(this);
                            
                            setTimeout(function() {
                                var pos = self.offset(),
                                    width = self.width(),
                                    height= self.height();
                                    
                                self.trigger('contextmenu', {left:pos.left+24, top:pos.top+height-28});
                                self = null;
                            });
                        }
                    });
                    
                    this.append(this.plusSign);
                    this.addEvent("beforeLayout", function() {
                        this.append(this.plusSign);
                    });
                    
                    this.plusSignInited = true;
                }
                
                return this;
            },
            
            /** 
             * 初始化右键菜单以及拖动、点击等事件
             * 
             * @method initContextmenu
             * @private 
             */
            initContextmenu : function() {
                var SELF = this;
                
                this.container.bind ({
                    click : function(event) {
                        if (!event.ctrlKey) {
                            $(".tbc-shortcut-selected", this).removeClass("tbc-shortcut-selected");
                        }
                    }
                });
                
                $(this.options.handleNode)
                .bind({
                    "dragin" :  function(event, locate) {
                        var index = SELF.index;
                        SELF.group.show(index);
                        locate.transfer = locate.container;
                    },
                    "dragout" : function() {
                        
                    }
                })
                .contextmenu({
                    items : [
                    
                        {text:"切换到此桌面",icon:"", disabled:SELF.group, click:function() {
                            if (SELF.group) {
                                SELF.group.show(SELF.index);
                            }
                        }},
                        {text:function() {return desktop.isSysAdmin() || tbc.system.settings.allowSetDefaultDesk ? "设为初始桌面" : false;}, icon:"", disabled:options.setDefault, click:function() {
                            desktop.manager.setDefault(options.id); 
                        }},
                        {text:function() {return desktop.isSysAdmin() ? "设为所有学员的初始桌面" : false;}, icon:"", disabled:options.setDefault, click:function() {
                        //{text:function() {return false; }, icon:"", disabled:options.setDefault, click:function() {
                            desktop.manager.setDefault(options.id, true);
                        }},
                        {text:"修改",icon:"", disabled: !options.own, click:function() {
                            desktop.manager.editDesktop(SELF);
                        }},
                        {text:"删除",icon:"", disabled: !options.own, click:function() {
                            
                            if (options.isTem === true) {
                                tbc.confirm("真的要删除这个屏吗? 删除后所有学员此屏都将被删除并且无法恢复!", function() {
                                    desktop.manager.deleteDesktop(SELF);
                                });
                            } else {
                                tbc.confirm("删除后将无法恢复", function() {
                                    desktop.manager.deleteDesktop(SELF);
                                });
                            }
                        }}
                    ]
                });
            },
            
            
            /** 
             * 将类型转换成对应的名称
             * 
             * @public
             * @method nameTranslator
             * @param {String} type 桌面类型
             * @return {String} 返回转换后的名称
             */
            nameTranslator : function(type) {
                var T = {
                    "USER" : "学员",
                    "ADMIN": "管理员",
                    "OTHER": "其他",
                    "DESKTOP": "自定义桌面"
                };
                
                return T[type] || type;
            },
            
            /** 
             * 插入元素或对象
             * 
             * @public
             * @method append
             * @param {Object} child tbc的UI组件或者任何jQuery对象和HTMLElement   
             * @chainable
             */
            append : function(child) {
                
                switch(child.constructor) {
                    case tbc.Shortcut:
                        this.appendShortcut.apply(this, arguments);
                        break;
                    case tbc.Widgets:
                        this.appendWidget.apply(this, arguments);
                        break;
                        
                    case tbc.Window:
                    case tbc.Folder:
                        this.container.append(child.ui||child);
                        break;
                        
                    default:
                        this.container.append(child.ui||child);
                }
                return this;
            },
            
            /** 
             * 插入一个快捷方式
             * 
             * @public
             * @method appendShortcut
             * @param {Object} shortcut tbc.Shortcut的实例
             * @param {Boolean} prev 是否显示在最前面
             * @param {Object} data 应用或快捷方式的配置数据   
             * @chainable
             */
            appendShortcut : function(shortcut, prev, data) {
                var index, position, plusSign, posPlus;
                
                this.setLayoutInfo();
                
                shortcut.host = this;
                
                if (prev) {
                    shortcut.prependTo(this);
                    this.layout();
                } else {
                    plusSign = this.container.children('.tbc-plus-shortcut');
                    index    = this.container.children(".tbc-shortcut").not(plusSign).size();
                    position = this.getSpaceByIndex(index);
                    posPlus  = this.getSpaceByIndex(index+1);
                    
                    shortcut.ui.css({ left:position.left, top:position.top, position:"absolute" });
                    plusSign.css({left:posPlus.left, top:posPlus.top});
                    shortcut.appendTo(this);
                }
                
                // 存储数据
                tbc.jdc.set(["shortcuts", this.packageName, this.svid].join("_"), data.userDeskItemId, data);
                
                this.shorcuts = this.shorcuts || {};
                this.shorcuts[shortcut.id] = shortcut;
                return this;
            },
            
            /** 
             * 批量插入快捷方式
             * 
             * @public
             * @method appendShortcuts
             * @param {Array} list 应用或快捷方式列表
             * @chainable
             */
            appendShortcuts : function(list) {
                var self        = this,
                    folderIds    = [],
                    i, len,
                    shortcut,
                    type
                    ;
                
                for (i=0,len=list.length; i<len; i+=1) {
                    shortcut = list[i];
                    type = tbc.system.getOpenType(shortcut);
                    
                    // 如果存在folderId, 则此图标位于文件夹内
                    if (typeof shortcut.folderId !== 'string' || shortcut.folderId.length===0) {
                        this.appendShortcut(new tbc.Shortcut(shortcut), false, shortcut);
                    }
                    
                    if (type === "FOLDER") {
                        this.setFolderContent(shortcut.userDeskItemId);
                    }
                }
                
                return this;
            },
            
            /** 
             * 设置文件夹内容
             * 
             * @public
             * @method setFolderContent
             * @param {String} id 文件夹ID
             */
            setFolderContent : function(id) {
                var folderSht = tbc.webdesk.data.folders[id].children,
                    folderIcon = tbc.system.getTaskByElement("[_shortcutid='"+ id +"']"),
                    i, len,
                    child,
                    jdcId = ["shortcuts", "tbc.Folder", id].join("_");
                
                for (i=0,len=folderSht.length; i<len; i+=1) {
                    child = folderSht[i];
                    tbc.jdc.set(jdcId, child.userDeskItemId, child);
                    folderIcon.thumbnail.append(child.userDeskItemId, child.applicationIconUrl);
                }
                folderIcon.receiveReminder();
            },
            
            /** 
             * 向桌面插入图标
             * 
             * @public
             * @method appendWidget
             * @param {Array} widget tbc.desktop.Widget实例
             * @param {Boolean} prev 是否显示在最前面
             * @param {Object} _options widget的配置数据
             * @chainable
             */
            appendWidget : function(widget, prev, options_w) {
                
                var quickLaunch = window.quickLaunch;
                
                if (widget.scene) {
                    delete widget.scene[widget.userDeskItemId];
                }
                widget.scene = this;
                
                if (prev) {
                    this.container.prepend(widget.ui);
                } else {
                    this.container.append(widget.ui);
                }
                
                this.widgets = this.widgets || {};
                this.widgets[widget.userDeskItemId] = widget;
                
                // 添加小图标到任务栏左侧
                if (!quickLaunch.isExist(options_w.applicationId)) {
                    quickLaunch.append({
                        guid  : options_w.applicationId,
                        title : options_w.applicationName,
                        icon  : options_w.applicationIconUrl,
                        click : function() {
                            if (widget.visible===false) {
                                widget.show();
                            }else{
                                widget.ui.stop()
                                .animate({opacity:0}, 100)
                                .animate({opacity:1}, 100)
                                .animate({opacity:0}, 100)
                                .animate({opacity:1}, 400);
                            }
                        }
                    });
                }
                
                return this;
            },
            
            /** 
             * 向桌面插入图标
             * 
             * @public
             * @method appendWidgets
             * @param {Array} list widgets列表
             * @chainable
             */
            appendWidgets : function(list) {
                var SELF = this;
                $.each(list, function(i, widget) {
                    
                    // widgets
                    if (widget.itemType === "WIDGET") {
                        SELF.appendWidget(
                            new tbc.desktop.Widget({
                                id        : widget.applicationId,
                                url        : widget.homePageUrl,
                                width    : widget.preferredWidth,
                                height    : widget.preferredHeight,
                                right    : widget.right,
                                top        : widget.top,
                                target    : desktop,
                                title    : widget.applicationName,
                                icon    : widget.applicationIconUrl,
                                control    : widget.control||true
                            }), null, widget
                       );
                    
                    // 自动打开的应用
                    } else {
                        tbc.system.open(widget);
                    }
                    
                });
                this.layoutWidget();
                return this;
            },
            
            /** 
             * 延迟排列桌面图标
             * @private
             * @property layoutTimeout
             */
            layoutTimeout : null,
            
            /** 
             * 排列桌面图标
             * 
             * @public
             * @method layout
             */
            layout : function() {
                var self = this;
                this.triggerEvent("beforeLayout");
                clearTimeout(this.layoutTimeout);
                    row  = 0;
                    col  = 0;
                    list = self.container.children(".tbc-shortcut").add(self.container.children(".tbc-shortcut-plus"));
                    
                    self.setLayoutInfo();
                    $.each (list, function(i) {
                        var pos = self.getSpaceByIndex(i),
                            sid = this.getAttribute("tbc"),
                            sh  = tbc.TASKS(sid);
                        
                        $(this).data({ reallyLeft:pos.left, reallyTop:pos.top })
                        .css ({ position:"absolute",left:pos.left, top:pos.top });
                        
                        if (sh instanceof Object) {
                            sh.triggerEvent("moved", pos);
                            sh = null;
                        }
                    });
                    
                    self.triggerEvent("layout");
                    self = null;
                
                return this;
            },
            
            /** 
             * 排列桌面Widget
             * 
             * @public
             * @method layoutWidget
             */
            layoutWidget : function() {
                
                var wids   = this.container.children(".tbc-widget"),
                    height = this.container.height(),
                    width  = this.container.width(),
                    currentIndex = 0,
                    
                    W=0, H=0, R=0, MR=20, T=0, MT=24;
                
                wids.each(function() {
                    var wid = $(this),
                        r = window.parseInt(wid.css("right")),
                        t = window.parseInt(wid.css("top")),
                        w = wid.width(),
                        h = wid.height();
                        
                    r = isNaN(r) ? 0 : r;
                    t = isNaN(t) ? 0 : t;
                    
                    if (height < T+h) {
                        R += W;
                        wid.css({ right:R+MR, top:H+MT });
                    } else {
                        wid.css({ right:R+MR, top:H+T+MT });
                    }
                    
                    W = w;
                    H = h;
                    T = (T<t+MT+h) ? t+MT : t+h+MT;
                    wid = null;
                });
            },
            
            // 获得新位置
            getSpace : function() {
                return {
                    left : sceneLeft + (col*gridWidth)  + paddingLeft,
                    top  : sceneTop  + (row*gridHeight) + paddingTop
                };
            },
            
            /** 
             * 计算某一个图标的坐标位置
             * 
             * @public
             * @method getSpaceByChild
             * @param {Object} child HTMLElement of chortcut or jQuery object
             * @returns {Object} 与 getSpaceByIndex方法的参数一致
             */
            getSpaceByChild : function(child) {
                var index = this.container.children(".tbc-shortcut:not(.tbc-plus-shortcut)").index(child);
                return this.getSpaceByIndex(index);
            },
            
            /** 
             * 根据序号计算图标位置
             * 
             * @public
             * @method getSpaceByIndex
             * @param {Number} index 序号
             * @returns {Object} 返回坐标值{left:*, top:*}
             */
            getSpaceByIndex : function(index) {
                
                // 计算公式:top = i%Math.floor(H/h)*h
                var rows_1 = (visibleHeight)/gridHeight,
                    rows = rows_1>Math.floor(rows_1) ? Math.floor(rows_1)+1 : rows_1,
                    top     = index%rows*gridHeight + paddingTop,
                    left = Math.floor(index/rows)*gridWidth + paddingLeft;
                    
                return {left:left, top:top};
            },
            
            /** 
             * 保存桌面图标的排序
             * 
             * @public
             * @method saveOrder
             * @async
             */
            saveOrder : function() {
                var list = [];
                
                this.container.children(".tbc-shortcut:not(.tbc-plus-shortcut)").each(function() {
                    list.push(this.getAttribute("_shortcutId"));
                });
                
                $.ajax({
                      url        : URLS.orderDesktopShorcuts
                    , type        : "post"
                    , dataType    : "json"
                    , data        : {deskid:this.svid, items:list.join(",")}
                    , complete    : function() {}
                    , error        : function() {}
                    , success    : function(json) {
                        if (json && json.result === "success") {
                            json.success = true;
                        }
                    }
                });
                this.shortcutSequence = list;
                
                return this;
            },
            
            /** 
             * 锁住桌面（用一个灰色的层覆盖桌面）
             * 
             * @public
             * @method lock
             */
            lock : function(msg) {
                
                var layer,
                    zindex = Math.max(tbc.getMaxZIndex(this.ui)+1, 10);
                
                if (typeof this.lockLayer === 'undefined') {
                    this.lockLayer = $('<div class="tbc-desktop-scene-locker">' +
                          '<div class="tbc-desktop-locker-bg"></div>' +
                          '<div class="tbc-desktop-locker-icon"></div>' +
                          '<div class="tbc-desktop-locker-text">'+ (msg||'') +'</div>'+
                      '</div>')
                      .css({zIndex: zindex})
                      .contextmenu({items:[]});
                } 
                this.lockLayer.show().appendTo(this.ui);
            },
            
            /** 
             * 解锁桌面, 对应于lock方法
             * 
             * @public 
             * @method unlock
             */
            unlock : function() {
                if (this.lockLayer) {
                    this.lockLayer.fadeOut(400);
                }
            },
            
            /** 
             * 加载桌面（不区分桌面类型， 在此方法内会判断桌面类型，并自动调用相应的方法加载不同的桌面
             * 
             * @public
             * @method load
             */
            load : function() {
                
                if (this.loaded !== true) {
                    switch (options.type) {
                        case "PAGE":
                        case "APPLICATION":
                        case "APP":
                        case "LINK":
                        case "SHORTCUT":
                            this.loadContentAsIframe();
                            break;
                        
                        case "DESKTOP":
                        case "ADMIN":
                        case "USER":
                        case "OTHER":
                            this.loadContent();
                            break;
                            
                        default:
                            tbc.log('undefined desktop type!');
                    }
                    
                }
                return this;
            },
            
            /**
             * 匹配IFRAME并返回其src属性
             * @private
             * @method matchIframeSrc
             * @param {String} html HTML代码
             * @return {String} url 
             */
            matchIframeSrc : function(html) {
                var x,y,z;
                
                // 网址导航(兼容性代码)
                if (html.match(/http:\/\/hao.qq.com/)) {
                    z = "http://hao.qq.com";
                } else {
                    x = html ? html.match(/<iframe[^>]+>/) : null;
                    y = x&&x[0] ? x[0].match(/src\s*=\s*["']?\s*\S+\s*["']?/) : null;
                    z = y&&y[0] ? y[0].replace(/(src\s*=\s*["']?\s*|\s*["']*\s*>?$)/g,"") : null; 
                    z = !z||z.match(/^("|'|,|\+|\()/) ? null : z;
                }
                
                try { return z; } finally { html = x = y = z = null; }
            },
            
            /** 
             * 以iframe方式加载一个页面做为桌面, 通常只能加载配置项的type为LINK/APPLICATION类型的桌面
             * 
             * @public
             * @method loadContentAsIframe
             */
            loadContentAsIframe : function() {
                var SELF = this,
                    url  = this.options.url,
                    type = this.options.type;
                ;
                // 如果是网站类型的桌面，则给url补充没有http://头
                if ((type === 'LINK' || type === 'SHORTCUT') && !url.match(/^http/)) {
                    url = "http://" + url;
                }
                
                this.iframe = this.container.find('iframe')[0];
                
                if (!this.iframe) {
                    this.iframe = $('<iframe frameborder="0" scrolling="auto" style="height:100%; width:100%; "></iframe>');
                    this.append(this.iframe);
                    this.iframe = this.iframe[0];
                }
                
                $.ajax ({
                    url     : url,
                    success : function(html) {
                        var subUrl = SELF.matchIframeSrc(html);
                        if (subUrl) {
                            SELF.iframe.setAttribute("src", subUrl);
                        } else {
                            SELF.iframe.setAttribute("src", url);
                        }
                    },
                    error   : function() {
                        SELF.iframe.setAttribute("src", url);
                    }
                });
                
                this.loaded = true;
            },
            
            /** 
             * 加载桌面上的应用和快捷方式, 加载完后会自动调用appendShortcuts()方法将
             * 应用和快捷方式显示在桌面上
             * 
             * @public
             * @method loadContent
             * @async
             */
            loadContent : function() {
                var SELF = this,
                    index;
                
                $.each(this.group.tabs, function(i, o) {
                    if (o === SELF) {
                        index = i;
                    }
                });

                $.ajax({
                      url     : URLS.getSceneContents
                    , data    : {deskindex:SELF.index, loadDockItem:index===0, deskId:options.id, '_ajax_toKen':"elos"}
                    , type    : "post"
                    , cache   : false
                    , dataType: "json"
                    , beforeSend  : function() {
                        SELF.lock("正在加载桌面应用...");
                    }
                    , complete : function() {
                        SELF.unlock();
                    }
                    , error    : function() {
                        tbc.log("ERROR: at tbc.Scene.loadContent()>$.ajax");
                    }
                    , success    : function(json) {
                        var translator = tbc.webdesk.data.translator,
                            shortcuts = translator.shortcuts.transformList(json.shortcuts, 'antique');
                            
                        SELF.cacheShortcut(shortcuts);
                        SELF.loaded = true;
                        SELF.ui.attr({"tbc": SELF.guid, svid:options.id });
                        SELF.appendShortcuts(shortcuts);
                        
                        // 测试页面加载时间
                        if (document.location.href.indexOf("DEBUG")!==-1 && window.console) {
                            window.console.log(new Date().getTime() - window.START_TIME);
                        }
                    }
                });
                
                return this;
            },
            
            /** 
             * 缓存应用列表: 将有folderId的应用或快捷方式放入对应的文件夹下,
             * 以便在显示文件夹图标时在文件夹上显示缩略图, 而不用每显示一个文
             * 件夹都必须循环一次应用列表的Array
             * 
             * @public
             * @method cacheShortcut
             * @param {Array} list 应用列表
             */
            cacheShortcut : function(list) {
                var dataStore = tbc.webdesk.data,
                    shortcutStore = dataStore.shortcuts = dataStore.shortcuts || {},
                    folderStore = dataStore.folders = dataStore.folders || {},
                    i, len,
                    id,
                    type,
                    sht,
                    folderId;
                
                for (i=0,len=list.length; i<len; i+=1) {
                    sht = list[i];
                    type = tbc.system.getOpenType(sht).toUpperCase();
                    id = sht.userDeskItemId;
                    folderId = sht.folderId;
                    
                    switch (type) {
                        
                        case "FOLDER":
                            folderStore[id] = folderStore[id] || sht;
                            sht.children = sht.children || [];
                            break;
                            
                        case "APP":
                        case "APPLICATION":
                        case "SHORTCUT":
                        case "LINK":
                            shortcutStore.push(sht);
                            shortcutStore[id] = sht;
                            break;
                    }
                }
                
                for (i=0,len=list.length; i<len; i+=1) {
                    sht = list[i];
                    type = tbc.system.getOpenType(sht).toUpperCase();
                    id = sht.userDeskItemId;
                    folderId = sht.folderId;
                    
                    if (typeof folderId === 'string' && folderId.length>0) {
                        folderStore[folderId] = folderStore[folderId] || [];
                        folderStore[folderId].children = folderStore[folderId].children || [];
                        folderStore[folderId].children.push(sht);
                        folderStore[folderId].children[id] = sht;
                    }
                }
            },
            
            // 删除本地数据
            deleteJDC : function(id) {
                
            },
            
            // 增加本地数据
            saveToJDC : function() {
                
            }
        })
        .init();  
    };
}(window.tbc, window.jQuery, window.URLS));

/*
 * @Class:  tb.ShortcutManager(快捷方式管理器) ########################################## 
 * 
 * @Copyright	: 时代光华
 * @Author		: luozhihua (罗志华)
 * @mail 		: mail@luozhihua.com
 * @Blog 		: http://www.luozhihua.com
 */
 
tbc.ShortcutManager = function() {
	var SELF = tbc.self(this, arguments);
	SELF.extend(tbc.Event);
	SELF.extend(tbc.ClassManager);
	SELF.packageName = "tbc.ShortcutManager";
	 
 }
;(function(tbc, $, URLS) {
    
"use strict";
    
/**
 * 命名空间tbc.shortcut
 */
tbc.namespace("tbc.shortcut");

/**
 * 桌面应用或快捷方式图标类
 *
 * @class tbc.Shortcut
 * @constructor
 * @param {Object} settings 应用配置 
 * @copyright 时代光华
 * @author mail@luozhihua.com
 */
tbc.Shortcut = function(settings) {
    var defaults = {
            html     : null,
            cssClass : null,
            remind_timeout : (1000*60*3),
            size     : "big", // big/middle/small
            iconBox  : ".tbc-shortcut-icon",
            iconNode : ".tbc-shortcut-icon>img",
            nameNode : ".tbc-shortcut-label",
            tipsNode : ".tbc-shortcut-tips em",
            popNode  : ".tbc-shortcut-pop ol"
        },
        options = tbc.extend({}, defaults, settings),
        desktop = window.desktop;
        
    options.originateSettings = settings;
    
    /*
        type = tbc.system.getOpenType(options),
        app  = window.applicationMap[options.applicationId],
        id   = options.userDeskItemId || options.applicationId,
        icon = options.shortcutIconUrl || options.applicationIconUrl,
        name = options.userDeskItemName || options.applicationName,
        
        shortcut = $(options.html || '<div _id="'+ [type, "shortcut", id].join("_") +'" class="tbc-shortcut" _shortcutId="'+id+'" title="'+ name +'"></div>')
                      .html(
                          '<div class="tbc-shortcut-inner">' +
                          '     <i class="tbc-shortcut-icon"><img title="" alt="" src="'+(icon||'')+'" onerror="this.style.display=\'none\';" onload="this.style.display=\'block\';"><em></em></i>' +
                          '     <span class="tbc-shortcut-label"></span>' +
                          '</div>' +
                          '<sup class="tbc-shortcut-tips" style="display:none;">' +
                          '      <em>0</em>' +
                          '      <div class="tbc-shortcut-pop" style="display:none;"><ol></ol></div>' +
                          '</sup>'
                     ).addClass(options.cssClass),
        iconBox  = $(options.iconBox, shortcut),
        iconNode = $(options.iconNode, shortcut),
        nameNode = $(options.nameNode, shortcut),
        tipsNode = $(options.tipsNode, shortcut),
        popNode  = $(options.popNode, shortcut),
        thumbnail,
        openTipsTimer,
        desktop = window.desktop;
    
    
    SELF.packageName = 'tbc.Shortcut';
    SELF.options = options;
    SELF.id   = id;
    SELF.svid = id;
    SELF.ui   = shortcut;
    SELF.ui.attr({tbc: SELF.guid});
    */

    tbc.self (this, arguments)
    .extend({
        
        /**
         * 类名称
         * @public
         * @property packageName
         * @readOnly
         * @type {String}
         */
        packageName : 'tbc.Shortcut',
        
        /**
         * 配置数据
         * @public
         * @property options
         * @type {Object}
         */
        options : null,
        
        /**
         * 图标的html元素
         * @public
         * @property ui
         * @type {jQuery Object}
         */
        ui : null,
        
        /**
         * 图标的ID, 同数据库ID
         * @public
         * @property svid
         * @type {jQuery Object}
         */
        svid : null,
        
        /**
         * 图标的寄主，类型可以是文件夹、桌面、dock等实例
         * @public
         * @property host
         * @type {Object}
         */
        host : null,
        
        /**
         * 图标的UI元素
         * @public
         * @property parts
         * @type {Object} 
         */
        parts: {
            
            /**
             * 快捷方式图标容器, 用于放置图标的<img/> 元素
             * @public 
             * @property parts.iconBox
             * @type {jQuery Object}
             */
            iconBox  : null,
            
            /**
             * 快捷方式的图片元素（<img />）
             * @public 
             * @property parts.iconNode
             * @type {jQuery Object}
             */
            iconNode : null,
            
            /**
             * 快捷方式的名称容器
             * @public 
             * @property parts.nameNode
             * @type {jQuery Object}
             */
            nameNode : null,
            
            /**
             * 快捷方式的数字容器
             * @public 
             * @property parts.tipsNode
             * @type {jQuery Object}
             */
            tipsNode : null,
            
            /**
             * 快捷方式的提示内容预览容器
             * @public 
             * @property parts.popNode
             * @type {jQuery Object}
             */
            popNode  : null
        },
        
        /**
         * 初始化
         * @private
         * @method init 
         */
        init : function() {
            
            var SELF = this,
                icon = options.shortcutIconUrl || options.applicationIconUrl,
                name = options.userDeskItemName || options.applicationName,
                uiid, img;
            
            this.packageName = "tbc.Shortcut";
            this.type = tbc.system.getOpenType(options);
            this.options = options;
            this.svid = options.userDeskItemId || options.applicationId;   
            this.id   = this.svid;
            
            uiid = [this.type, "shortcut", this.id].join("_");
            img = tbc.system.isImg(icon)
                ? '<img title="" alt="" src="'+ icon +'" onerror="this.style.display=\'none\';" onload="this.style.display=\'block\';"/>'
                : '<img title="" alt="" style="display:none;" onerror="this.style.display=\'none\';" onload="this.style.display=\'block\';"/>';
                
            this.ui = options.html 
                    ? $(options.html) 
                    : $('<div class="tbc-shortcut"></div>')
                      .html(
                          '<div class="tbc-shortcut-inner">' +
                          '     <i class="tbc-shortcut-icon">'+ img +'<em></em></i>' +
                          '     <span class="tbc-shortcut-label"></span>' +
                          '</div>' +
                          '<sup class="tbc-shortcut-tips" style="display:none;">' +
                          '      <em>0</em>' +
                          '      <div class="tbc-shortcut-pop" style="display:none;"><ol></ol></div>' +
                          '</sup>'
                    )
                    .addClass(options.cssClass);
            
            this.ui.attr({
                'tbc'   : this.guid,
                '_id'   : uiid,
                'title' : name,
                '_shortcutId' : options.userDeskItemId
            });
                              
            tbc.extend(this.parts, {
                iconBox  : $(options.iconBox, this.ui),
                iconNode : $(options.iconNode, this.ui),
                nameNode : $(options.nameNode, this.ui),
                tipsNode : $(options.tipsNode, this.ui),
                popNode  : $(options.popNode, this.ui)
            });

            this.icon(icon);
            this.name(name);

            if (!icon) {
                this.parts.iconNode.hide();
            }

            this.initReminder();
            this.initContextmenu();
            this.initEvent();
            this.initFolderIcon();
            this.initClick();
        },

        /**
         * 初始化应用的数字提示
         * @private
         * @method initReminder 
         */
        initReminder : function() {
            var SELF = this,
                remindTime = (this.type==='FOLDER') ? options.remind_timeout/2 : options.remind_timeout;
            // 向服务器轮询消息
            if (this.type === "FOLDER" || (options.reminderUrl && $.trim(options.reminderUrl.length>0))) {
                this.receiveReminder();
                this.interval = setInterval(function() {
                    SELF.receiveReminder();
                }, remindTime);
            }

            this.parts.tipsNode.parent().bind({
                "mouseenter": function(event) {

                    SELF.openTipsTimer = setTimeout(function() {
                        if (this.parts.popNode.filter(":visible").size()===0) {
                            SELF.openTips();
                        }
                    },300);

                    event.stopPropagation();
                    return false;
                },
                "mouseleave": function() {
                    clearTimeout(SELF.openTipsTimer);
                    SELF.hideTips();
                }
            });

            this.parts.popNode.click(function(event) {
                event.stopPropagation();
                return false;
            });
        },

        /**
         * 初始化文件夹图标, 为文件夹增加缩略图的相关方法
         * @private
         * @method initFolderIcon 
         */
        initFolderIcon : function() {
            var SELF = this,
                thumbnail;

            switch (this.type) {
                case "FOLDER":
                    this.ui.addClass("tbc-folder-shortcut");

                    thumbnail = $('<i class="tbc-folder-thumbnail"></i>').insertAfter(this.parts.iconNode);
                    this.parts.iconNode.remove();

                    this.thumbnail = {
                        length:0,
                        store:{},
                        append : function(id, icon) {
                            var img = tbc.system.isImg(icon)
                                ? '<img title="" alt="" src="'+ icon +'" />'
                                : '<img title="" alt="" style="display:none;" />';

                            thumbnail.append('<i class="tbc-folder-thumbnail-icon" _folderid="'+id+'" class="tbc-folder-thumbnail-icon">'+ img +'</i>');
                            if (!this.store[id]) {
                                this.length+=1;
                            }
                            this.store[id] = id;
                            return this;
                        },
                        remove : function(id) {
                            $('[_folderid='+id+']', thumbnail).empty().remove();
                            if (this.store[id]) {
                                this.length-=1;
                            }
                            delete this.store[id];
                            return this;
                        }
                    };
                    
                    // 加载数据
                    SELF.loadData = function () {
                        tbc.Folder.load (options.folderId || options.userDeskItemId, function(data) {
                            options.data = data;
                            
                            $.each (data, function (i) {
                                tbc.jdc.set(["shortcuts", "tbc.Folder", SELF.svid].join("_"), this.userDeskItemId, this);
                                SELF.thumbnail.append(this.userDeskItemId, this.applicationIconUrl);
                            });
                            
                            SELF.receiveReminder();
                        });
                    };
                    
                    break;
                    
                case "APP":
                case "APPLICATION":
                    this.ui.addClass("tbc-app-shortcut");
                    
                    break;
                
                case "LINK":
                    
                    break;
            }
        },
        
        /**
         * 初始化右键菜单
         * @private
         * @method initContextmenu 
         */
        initContextmenu : function() {
            var SELF = this;
            this.ui.contextmenu({
                items : [
                    {text: "打开", icon:"icon-application_windows_add", click: function() { SELF.open(); }},
                    {text: function() {return SELF.type === "FOLDER"?"重命名文件夹":false;}, icon:"icon-tag_edit", click:function() { SELF.startRename(); }, disabled:function() {return SELF.type !== "FOLDER"; }},
                    {text: function() {return SELF.type === "FOLDER"?"删除文件夹":false;}, icon:"icon-folder_classic_stuffed_remove", click:function() { SELF.del(); },disabled:function() {return SELF.type !== "FOLDER"; }},
                    {text: function() {return SELF.ui.parent().hasClass("tbc-desktop-dock")?false:"移动到...";}, icon:"icon-breadcrumb_separator_arrow_2_dots", submenu:function() {
                        if (window.desktop.tabs.length>1) {
                            var sm = [];
                            $.each(window.desktop.tabs, function(i, o) {
                                var opt = this.options,
                                    text,
                                    disabled;
                                    
                                text = ("第"+(i+1)+"屏 - [") + this.nameTranslator(opt.name || opt.title) + "]";
                                
                                if (opt.type === "USER" || opt.type === "ADMIN" || opt.type === "OTHER" || opt.type === "DESKTOP") {
                                    if (o===SELF.host) {
                                        disabled = true;
                                        text += " -- 当前屏";
                                    }
                                } else {
                                    text += " -- (此桌面不支持应用)";
                                    disabled = true;
                                }
                                
                                sm.push({
                                    text    : text,
                                    icon    : o.icon(),
                                    click    : function (event) {
                                        var oldSecen = SELF.host,
                                            from;
                                        
                                        // 移动其他选中的图标
                                        SELF.ui.siblings(".tbc-shortcut-selected").each(function(i,shc) {
                                            var shcCtrl = $(shc).attr("tbc"), shct = tbc.TASKS(shcCtrl);
                                            if (shct) {
                                                shct.moveToScene(o);
                                            }
                                        });
                                        
                                        // 如果是文件夹或者快捷文件夹
                                        from = tbc.system.getTaskByElement (SELF.ui.parent());
                                        if (from.packageName === "tbc.Folder" || from.packageName === "tbc.folder.Pop") {
                                            SELF.moveOutFolder(from, o);
                                        }
                                        
                                        // 移动点击的图标
                                        SELF.moveToScene(o);
                                        
                                        oldSecen.layout();
                                        if (event && event.ctrlKey) {
                                            window.desktop.show(i);
                                        }
                                        oldSecen = null;
                                    },
                                    disabled : disabled
                                });
                            });
                            return sm;
                        }
                        return false;
                    }}
                ],
                event:{
                    show : function() { this.find(".tbc-shortcut-inner").addClass("tbc-shortcut-inner-mousedown"); },
                    hide : function() { this.find(".tbc-shortcut-inner").removeClass("tbc-shortcut-inner-mousedown"); }
                }
            });
        },
        
        /**
         * 初始化鼠标事件
         * @private
         * @method initClick 
         */
        initClick : function() {
            var SELF = this;
            this.ui.bind({
                "click" : function(event) {
                    
                    var ui = this,
                        task;
                    
                    clearTimeout(SELF.openTimeout);
                    
                    $.post(URLS.accessicon, {userDeskItemId : options.userDeskItemId });
                    
                    // 按住CTRL键时只选中不做任何其他操作
                    if (event.ctrlKey) {
                        
                        if (ui.hasClass("tbc-shortcut-selected")) {
                            ui.removeClass("tbc-shortcut-selected");
                        } else {
                            ui.addClass("tbc-shortcut-selected");
                        }
                        
                    } else {
                        
                        task = tbc.TaskManager.get("folder", options.userDeskItemId);
                        
                        // 如果是文件夹并且没有打开,则以POP快速打开方式打开
                        if (SELF.type === "FOLDER" && !task) {
                            if (SELF.pop) {
                                SELF.pop.close();
                            } else {
                                SELF.openTimeout = setTimeout(function() { SELF.pop = SELF.openPopFolder(); }, 100);
                            }
                            
                            $("body").trigger("click.hideContextmenu");
                            
                        // 打开应用或文件夹
                        }else{
                            SELF.open();
                        }
                        task=null;
                    }
                },
                "dblclick": function() {
                    clearTimeout(SELF.openTimeout);
                    SELF.open();
                    if (SELF.pop) {
                         SELF.pop.close();  
                    } 
                }
            });
        },
        
        /**
         * 初始化事件
         * @private
         * @method initEvent 
         */
        initEvent : function() {
    
            this.addEvent({
                
                /* 准备移动前 **
                 * @PARA: context{}
                 *         from    : 来源节点,即原来所在的节点;
                 *        to        : 移动到的节点,即新的节点;
                 *        marks    : 位置参照节点,即移动到该节点前面或后面;
                 *        node    : 被拖动的节点;
                 *        selected: 其他选中的节点;
                 *
                 * @RETURN: boolean 返回false将会阻止移动到新位置;其他没有任何作用;
                 */
                beforeMove : function(context) {
                    
                    var fromDock = context.from.hasClass("tbc-desktop-dock"),
                        toDock   = context.to.hasClass("tbc-desktop-dock"),
                        ret, sid,
                        
                        sh, op, shts, exist, existO, newShortcut,
                        
                        guid, folderIcon, fd;
                    
                    // 文件夹
                    if (context.node.hasClass("tbc-folder-shortcut") && (context.to.hasClass("tbc-folder-container")||context.to.hasClass("tbc-pop-container"))) {
                        ret = false;
                        
                    // 移进或移出 快捷启动栏
                    } else if (fromDock || toDock) {
                        
                        if (fromDock && toDock) {
                            setTimeout(function(){
                                desktop.saveDockShortcuts(); 
                            }, 100);
                            return;
                        }
                        
                        if (fromDock && !toDock) {
                            
                            sid = context.node.attr("tbc");
                            tbc.TASKS(sid).DESTROY();
                            context.node.remove();
                        }
                        
                        if (toDock && !fromDock) {
                            if (context.node.hasClass("tbc-folder-shortcut")) {
                                alert("暂不支持在快捷栏放置文件夹.");
                            } else if (context.selected.size()) {
                                alert("不能拖多个图标到快捷栏.");
                            } else {
                                
                                sh    = tbc.system.getTaskByElement(context.node);
                                op    = sh.options;
                                shts  = $(".tbc-desktop-dock .tbc-shortcut");
                                exist = false;
                                
                                shts.each(function(i, o) {
                                    if (this.getAttribute("_shortcutid") === op.userDeskItemId) {
                                        exist=true; existO=this; return false;
                                    }
                                });
                                
                                if (exist === true) {
                                    context.transfer = existO;
                                } else {
                                    newShortcut = new tbc.Shortcut(op);
                                    
                                    if (context.marks.size()) {
                                        newShortcut.ui.insertAfter(context.marks);
                                    } else {
                                        newShortcut.appendTo(context.to);
                                    }
                                    
                                    if (shts.size()>4) {
                                        sh = tbc.system.getTaskByElement(shts.filter(":last"));
                                        shts.filter(":last").empty().remove();
                                        if (sh) {
                                            sh.DESTROY();
                                        }
                                    }
                                }
                                
                            }
                        }
                        
                        setTimeout(function(){
                            desktop.saveDockShortcuts(); 
                        }, 100);
                            
                        ret = false;
                    
                    // 移动到文件夹图标上方:(只接受非文件夹图标)
                    } else if (context.marks.hasClass("tbc-folder-shortcut") && context.node[0] !== context.marks[0] && !context.node.hasClass("tbc-folder-shortcut")) {
                        
                        guid    = context.marks.attr("tbc");
                        folderIcon = tbc.TASKS.get(guid);
                        fd = tbc.TaskManager.get("folder", folderIcon.svid);
                            
                        if (fd) {
                            
                            // 移动到打开的文件夹
                            context.transfer = fd.container;
                            
                        } else if (folderIcon.pop) {
                            
                            // 移动到快速打开的POP文件
                            context.transfer = folderIcon.pop.container;
                            
                        } else {
                            context.terminal = context.marks;
                        }
                        folderIcon = fd = null;
                        ret = false;
                    }
                    return ret;
                },
                
                /* 移动后 */
                afterMove : function(context) {
                    var to = context.terminal || context.transfer || context.to,
                        scene;
                    
                    // 如果拖动前后都在同一容器内, 则视为排序;
                    if (context.to[0]===context.from[0]) {
                        scene = tbc.system.getTaskByElement(context.from) || tbc.system.getTaskByElement(context.from.parents("[tbc]:first"));
                        setTimeout(function(){
                            scene.saveOrder();
                        }, 200);
                    }
                    
                    // 如果新容器不是桌面,则清除图标的绝对定位;
                    if (to.hasClass("tbc-desktop-dock") || to.hasClass("tbc-folder-container") || to.hasClass("tbc-pop-container")) {
                        
                        context.selected.css({position:"relative", left:"auto", top:"auto"});
                        context.node.css({position:"relative", left:"auto", top:"auto"});
                        
                    // 如果是桌面,设置图标为绝对定位;
                    } else if (to.hasClass("tbc-slide-scene")) {
                        context.node.css({position:"absolute"});
                        context.selected.css({position:"absolute"});
                    }
                    to = null;
                    
                    this.move(context);
                },
                
                destroy : function () {
                    if (this.host instanceof tbc.Scene) {
                        this.host.layout();
                    }
                    this.stopReceiveReminder();
                    defaults = options = null;
                }
            });
        },
        
        /**
         * 更新应用或快捷方式的配置数据
         * @public
         * @method updateOptions
         * @param {String key | Object} 配置项key或者配置单 
         */
        updateOptions : function(key, value) {
            var opts,
                k;
            if (typeof key === 'string' && typeof value !== 'undefined') {
                opts = {};
                opts[key] = value;
            } else {
                opts = key;
            }
            
            if (opts instanceof Object) {
                for (k in opts) {
                    if (opts.hasOwnProperty(k)) {
                        this.options[k] = this.options.originateSettings[k] = opts[k]; 
                    }
                }
            }
        },
        
        /**
         * 设置或获取快捷方式的icon 路径
         * @public
         * @method icon
         * @param {string} [url] 设置图标的图片路径，如果传入该参数将改变快捷方式的图标，否则返回原图标的地址
         * @return {Object|String} 如果有url参数，则返回实例本身，否则返回原图标地址
         */
        icon : function(url) {
            var ret;
            if (url===undefined) {
                ret = this.parts.iconNode.attr("src");
            } else if (typeof url === "string") {
                
                if (url.match(/\.(jpg|jpeg|gif|png|img|bmp|ico)$/) || url.indexOf("sf-server/file/getFile/") !== -1) {
                    this.parts.iconNode.show().attr("src", url);
                } else {
                    this.parts.iconNode.hide().parent().addClass(url);
                }
                
                this.updateOptions('shortcutIconUrl', url);
                this.triggerEvent("changeIcon", url);
                return this;
            }
            return ret;
        },
        
        /**
         * 设置或获取快捷方式的显示名称
         * @public
         * @method name
         * @param {string} [name] 快捷方式的名称，如果传入该参数将改变显示名称，否则返回原来的名称
         * @param {Boolean} [stopRenameWindow] 阻止重命名与此快捷方式有关的窗口，一般情况不需要此
         *          参数, 如果是从改快捷方式打开的窗口内重命名，则需要传入true, 否则会引起死循环.
         * @return {Object|String} 如果有name参数，则返回实例本身，否则返回原名称
         */
        name : function(name, stopRenameWindow) {
            
            var ret;
            
            if (typeof name === undefined) {
                ret = this.parts.nameNode.html();
            } else {
                
                this.updateOptions('userDeskItemName', name);
                
                this.parts.nameNode.html(name);
                this.ui.attr("title", name);
                this.updateOptions("userDeskItemName", name);
                this.triggerEvent("changeName", name);
                
                if (stopRenameWindow !== true && this.window) {
                    this.window.name(name);
                }
                return this;
            }
            
            return ret;
        },
        
        /**
         * 设置或获取快捷方式的提示数字
         * @public
         * @method tip
         * @param {Number} [tips] 快捷方式的提示数字，如果传入该参数将改变提示数字，否则返回提示数字
         * @return {Object|Number} 如果有tips参数，则返回实例本身，否则返回提示数字
         */
        tip : function(tips) {
            var ret;
            if (tips && tips.match) {
                if (tips.match(/^\+=/)) {
                    tips = this.tip() + window.parseInt(tips.replace(/^\+=/,""));
                } else if (tips.match(/^\-=/)) {
                    tips = this.tip() - window.parseInt(tips.replace(/^\-=/,""));
                }
            }
            
            if (!isNaN(tips) && tips>0) {
                this.parts.tipsNode.html(tips).parent().show();
                this.triggerEvent("changeTips", tips);
                ret = this;
            } else if (tips===0 || window.parseInt(tips)===0) {
                this.parts.tipsNode.html("").parent().hide();
                ret = this;
            } else {
                ret = window.parseInt($.trim(this.parts.tipsNode.html()) || 0);
            }
            
            try {
                return ret;
            } finally {
                ret = null;
            }
        },
        
        data : {},
        
        
        /**
         * 设置或获取快捷方式的提示数字
         * @public
         * @beta
         * @method tip
         * @param {Number} [tips] 快捷方式的提示数字，如果传入该参数将改变提示数字，否则返回提示数字
         * @return {Object|Number} 如果有tips参数，则返回实例本身，否则返回提示数字
         */
        openTips : function() {
            this.parts.popNode.empty();
            if (this.data.reminder) {
                var l = [];
                $.each(this.data.reminder, function(i, r) {
                    if (i>4) {
                        return false;
                    }
                    
                    l.push('<li>'+ r.title +'</li>');
                });
                
                if (l.length>0) {
                    this.parts.popNode.append(l.join(""));
                    this.parts.popNode.parent()
                    .css({width:0, height:0, display:"block"});
                    
                    this.keepVisible(); 
                    this.parts.popNode.parent().animate({ width:260, height:140 }, 300, "easeInOutBack");
                }
            }
            return this;
        },
        
        // 保持pop提示可见
        keepVisible : function() {
            
            var uiw        = this.ui.width(),
                uih        = this.ui.height(),
                uil        = this.ui[0].offsetLeft,
                uit        = this.ui[0].offsetTop,
                uir        = uil + uiw,
                uib        = uit + uih,
                pw        = 260,
                ph        = 140,
                bodyH    = this.ui.offsetParent()[0].offsetHeight,
                bodyW    = this.ui.offsetParent()[0].offsetWidth,
                
                right, left, top="0", bottom="auto";
            
            if (uir+pw>bodyW && pw<uil) {
                right    = uiw-18;
                left    = "auto";
            }else{
                right    = "auto";
                left    = "18px";
            }
            
            top = uit+ph>bodyH ? bodyH-(uit+ph) : 0;
            
            this.parts.popNode.parent().css({top:top, bottom:bottom, left:left, right:right});
        },
        
        // 收起提醒
        hideTips : function() {
            this.parts.popNode.parent().animate({ width:0, height:0 }, function() { $(this).css({ display:"none" }); });
        },
        
        // 在某区域显示
        appendTo : function(target) {
            
            if (target.container) {
                this.host = target;
                target.shortcuts = target.shortcuts || {};
                target.shortcuts[options.userDeskItemId] = settings;
                this.ui.appendTo(target.container);
                this.position = target;
            } else {
                this.ui.appendTo(target);
            }
            
            return this;
        },
        
        // 在某区域显示
        prependTo : function(target) {
            if (target.container) {
                this.host = target;
                target.shortcuts = target.shortcuts || {};
                target.shortcuts[options.userDeskItemId] = settings;
                this.ui.appendTo(target.container);
            }else{
                this.ui.prependTo(target);
            }
            
            return this;
        },
        
        // 从某一容器移动到另一容器
        move : function(context) {
            
            var nodes = $(context.node).add($(context.selected)),
                to    = tbc.system.getTaskByElement(context.terminal||context.transfer||context.to),
                from  = tbc.system.getTaskByElement(context.from),
                method,
                methodFrom;
                
            if (from) {
                switch(from.constructor) {
                    case tbc.Scene     : methodFrom="moveOutScene";    break;
                    case tbc.Folder    : 
                    case tbc.folder.Pop: 
                    case tbc.Shortcut  : methodFrom="moveOutFolder";    break;
                    default: break;
                }
            }
            
            if (to) {
                switch(to.constructor) {
                    case tbc.Scene     : method = "moveToScene";        break;
                    case tbc.Folder    : method = "moveToFolder";        break;
                    case tbc.folder.Pop: method = "moveToFolderPop";    break;
                    case tbc.Shortcut  : method = "moveToFolderIcon";    break;
                    default : break;
                }
            }
            
            if (method) {
                nodes.each(function(i, icon) {    
                    var sht        = tbc.system.getTaskByElement(icon);
                        from.reLayout = to.reLayout = (i>=nodes.length-1);
                    if (sht && from !== to) {
                        
                        if (tbc.isFunction(sht[methodFrom])) {
                            sht[methodFrom](from, to);  
                        }
                        
                        if (tbc.isFunction(sht[method])) {
                            sht[method](to);
                        }
                    }
                    sht = icon = null;
                });
            }
                  
            this.receiveReminder();
            
            nodes = to = from = method = methodFrom = context = null;
        },
        
        // 移动到某一屏幕
        moveToScene : function(scene) {
            
            var dataOfCache,
                packageName,
                guid, svid, shortcutsOld;
            if (this.host) {
                this.undepend(this.host);
                
                if (this.host.layout) {
                    this.host.layout();
                }
                
                // 缓存数据
                packageName = this.host.packageName === "tbc.folder.Pop" ? "tbc.Folder" : this.host.packageName;
                
                dataOfCache = tbc.jdc.select(["shortcuts", packageName, this.host.svid].join("_"), this.svid);
                tbc.jdc.del(["shortcuts", packageName, this.host.svid].join("_"), this.svid);
                tbc.jdc.set(["shortcuts", scene.packageName, scene.svid].join("_"), this.svid, dataOfCache);
                
                // 如果是图标原来的位置是文件夹,则移除文件夹图标上的缩略图
                if (packageName === "tbc.Folder") {
                    
                    svid = this.host.svid;
                    guid = $(".tbc-folder-shortcut[_shortcutid='"+ svid +"']").attr("tbc");
                    shortcutsOld = tbc.TASKS(guid);
                    shortcutsOld.thumbnail.remove(this.svid);
                    shortcutsOld.receiveReminder();
                }
                
                tbc.Shortcut.moveToScene(scene.options.id, this.svid);
                
                // 设置新的host(宿主)
                this.host = scene;
                
                // 如果图标所移到的桌面还没有加载，则销毁此图标实例，因为当桌面加载时会重新加载此图标
                if (!scene.loaded) {
                    this.DESTROY();
                }
            }
            this.depend(scene);
            
            if (scene.container.children().index(this.ui) === -1) {
                scene.append(this, false, dataOfCache);
            }
            dataOfCache = null;
            
            this.triggerEvent("moveToScene", scene);
            //SELF.
        },
        
        // 移出某一屏幕
        moveOutScene : function(scene, terminal) {
            
        },
        
        // 移动到左边快捷栏
        moveToDock : function() {
            var dock;
            if (this.host) {
                this.undepend(this.host);
                if (this.host.layout) {
                    this.host.layout();
                }
                this.host = null;
            }
            
            dock = $(".tbc-desktop-dock");
            if (dock.children().index(this.ui) === -1) {
                this.appendTo(dock);
            }
            this.triggerEvent("moveToDock", dock);
        },
        
        // 移出左边快捷栏
        moveOutDock : function(terminal) {
            
        },
        
        // 移动到文件夹
        moveToFolder : function(folder) {
            var dataOfCache,
                packageName,
                host = this.host,
                svid = this.svid,
                h_svid,
                guid, shortcutsOld, folderIcon
                ;
                
            if (host) {
                
                h_svid = host.svid;
                
                this.undepend(host);
                
                if (host.layout && folder.reLayout) {
                    host.layout();
                }
                
                // 缓存数据
                packageName = (host.packageName === "tbc.folder.Pop") ? "tbc.Folder" : host.packageName;
                
                dataOfCache = tbc.jdc.select(["shortcuts", packageName, h_svid].join("_"), svid);
                tbc.jdc.del(["shortcuts", packageName, h_svid].join("_"), svid);
                tbc.jdc.set(["shortcuts", folder.packageName, folder.svid].join("_"), svid, dataOfCache);
                
                // 如果是图标原来的位置是文件夹,则移除文件夹图标上的缩略图
                if (packageName === "tbc.Folder") {
                    guid = $(".tbc-folder-shortcut[_shortcutid='"+ h_svid +"']").attr("tbc");
                    shortcutsOld = tbc.TASKS(guid);
                    shortcutsOld.thumbnail.remove(svid);
                    shortcutsOld.receiveReminder();
                }
                
                // 保存到服务器
                tbc.Shortcut.moveToFolder(folder.svid, svid);
                
                // 增加文件夹图标的缩略图
                folderIcon = tbc.system.getTaskByElement (".tbc-folder-shortcut[_shortcutid='"+ folder.svid +"']");
                folderIcon.thumbnail.append (svid, dataOfCache.applicationIconUrl);
                folderIcon.receiveReminder();
                    
                this.host = folder;
                dataOfCache = null;
            }
            
            this.depend(folder);
            
            if (folder.container.children().index(this.ui) === -1) {
                folder.append(this.ui);
            }
            this.triggerEvent("moveToFolder", folder);
        },
        
        // 移出文件夹
        moveOutFolder : function(from, terminal) {
            var SELF = this,
                svid = from.svid,
                task = tbc.system.getTaskByElement($("[_shortcutid='"+svid+"']"));
                task.thumbnail.remove(svid);
                
            $.ajax({
                url        : URLS.shortcutMoveOutFolder,
                type    : "post",
                dataType: "json",
                data    : { "folderUserDeskItemId":svid, "userDeskItemId":this.svid },
                success    : function(json) {
                    if (json.result) {
                        if (terminal.packageName === "tbc.Scene") {
                            var dataOfCache = tbc.jdc.select(["shortcuts", "tbc.Folder", svid].join("_"), SELF.svid);
                            tbc.jdc.del(["shortcuts", "tbc.Folder", svid].join("_"), SELF.svid);
                            if (dataOfCache) {
                                tbc.jdc.set(["shortcuts", terminal.packageName, terminal.svid].join("_"), SELF.svid, dataOfCache);
                                dataOfCache = null;
                            }
                        }
                    }
                }
            });
        },
        
        // 移动到POP文件夹
        moveToFolderPop : function(folderPop) {
            var dataOfCache,
                packageName,
                host = this.host,
                svid = this.svid,
                h_svid = host.svid,
                guid,
                shortcutsOld,
                folderIcon;
            
            if (host) {
                this.undepend(host);
                
                if (host.layout && folderPop.reLayout) {
                    host.layout();
                }
                
                packageName = (host.packageName === "tbc.folder.Pop") ? "tbc.Folder" : host.packageName;
                
                // 缓存数据
                dataOfCache = tbc.jdc.select(["shortcuts", packageName, h_svid].join("_"), svid);
                tbc.jdc.del(["shortcuts", packageName, h_svid].join("_"), svid);
                tbc.jdc.set(["shortcuts", "tbc.Folder", folderPop.svid].join("_"), svid, dataOfCache);
                
                // 如果是图标原来的位置是文件夹,则移除文件夹图标上的缩略图
                if (packageName === "tbc.Folder") {
                    guid = $(".tbc-folder-shortcut[_shortcutid='"+ h_svid +"']").attr("tbc");
                    shortcutsOld = tbc.TASKS(guid);
                    
                    shortcutsOld.thumbnail.remove(svid);
                    shortcutsOld.receiveReminder();
                }
                
                // 保存到服务器
                tbc.Shortcut.moveToFolder(folderPop.svid, svid);
                
                // 增加文件夹图标的缩略图
                folderIcon = tbc.system.getTaskByElement(".tbc-folder-shortcut[_shortcutid='"+ folderPop.svid +"']");
                
                folderIcon.thumbnail.append(svid, dataOfCache.applicationIconUrl);
                folderIcon.receiveReminder();
                
                this.host = folderPop;
                if (folderPop.layout && folderPop.reLayout) {
                    folderPop.layout();    
                }
                dataOfCache = null;
            }
            this.depend(folderPop);
            if (folderPop.container.children().index(this.ui) === -1) {
                folderPop.append(this.ui);
            }
            
            this.triggerEvent("moveToFolder", folderPop);
        },
        
        // 移出POP文件夹
        moveOutFolderPop : function(folderPop, terminal) {
            
        },
        
        // 移动到文件夹图标上
        moveToFolderIcon : function (shortcut) {
            var dataOfCache,
                packageName,
                host = this.host,
                svid = this.svid,
                h_svid = host.svid,
                guid, shortcutsOld,
                icon = this.options.shortcutIconUrl || this.options.applicationIconUrl;
                
            if (host) {
                this.undepend(host);
                if (host.layout && shortcut.reLayout) {
                    host.layout();
                }
                
                // 缓存数据
                packageName = host.packageName === "tbc.folder.Pop" ? "tbc.Folder" : host.packageName;
                
                dataOfCache = tbc.jdc.select(["shortcuts", packageName, h_svid].join("_"), svid);
                tbc.jdc.del(["shortcuts", packageName, h_svid].join("_"), svid);
                tbc.jdc.set(["shortcuts", "tbc.Folder", shortcut.svid].join("_"), svid, dataOfCache);
                
                // 如果是图标原来的位置是文件夹,则移除文件夹图标上的缩略图
                if (packageName === "tbc.Folder") {
                    guid = $(".tbc-folder-shortcut[_shortcutid='"+ h_svid +"']").attr("tbc");
                    shortcutsOld = tbc.TASKS(guid);
                    shortcutsOld.thumbnail.remove(svid);
                    shortcutsOld.receiveReminder();
                }
                
                // 保存到服务器
                tbc.Shortcut.moveToFolder(shortcut.svid, svid);
                
                this.host = null;
            }
            dataOfCache = null;
            
            shortcut.thumbnail.append(svid, icon);
            shortcut.receiveReminder();
            this.triggerEvent("moveToFolderIcon", shortcut);
            this.ui.remove();
            this.DESTROY();
        },
        
        // 移动到开始菜单
        moveToStartMenu : function(StartMenu) {
            if (this.host) {
                this.undepend(this.host);
                if (this.host.layout) {
                    this.host.layout();
                }
                this.host = StartMenu;
            }
            
            this.depend(StartMenu);
            
            if (StartMenu.container.children().index(this.ui)===-1) {
                StartMenu.append(this.ui);
            }
            this.triggerEvent("moveToStartMenu", StartMenu);
        },
        
        // 移出开始菜单
        moveOutStartMenu : function(startmenu) {
            
        },
        
        // 移除某一容器
        removeData : function(host) {
            if (host) {
                switch(host.constructor) {
                    case tbc.Folder:
                        this.moveOutFolder(host);
                        break;
                        
                    case tbc.folder.Pop:
                        this.moveOutFolderPop(host);
                        break;
                        
                    case tbc.desktop.Scene:
                        this.moveOutScene(host);
                        break;
                        
                    case tbc.Startmenu:
                        this.moveOutStartMenu(host);
                        break;
                }
            }
        },
        
        // 接收提示
        receiveReminderDeferTime:null,
        receiveReminder : function(noCache) {
            var SELF = this;
            clearTimeout(this.receiveReminderDeferTime);
            this.receiveReminderDeferTime = setTimeout(function() {
                if (SELF.type) {
                    switch (SELF.type) {
                        case "FOLDER":
                            SELF.receiveReminderForFolder(noCache);
                            break;
                        
                        case "APP":
                            SELF.receiveReminderForApp(noCache);
                            break;
                            
                        default:
                            SELF.receiveReminderForApp(noCache);
                            break;
                    }   
                }
            }, 300);
        },
        
        // 文件夹提示
        receiveReminderForFolder : function(noCache) {
            
            var SELF = this,
                data = tbc.jdc.select("shortcuts_tbc.Folder_"+options.userDeskItemId, "all"),
                countAll;
            
            // 文件夹内的应用图标
            if (data) {
                
                this.data = this.data||{};
                this.data.reminder = [];
                //SELF.tip(0);
                
                countAll = 0;
                $.each(data, function(i, opt) {
                    
                    if (opt === null) {
                        return;
                    }
                    
                    // 在本地存储最后请求消息的时间
                    var lastRemind     = tbc.jdc.select("appLastRemindTime", opt.applicationId),
                        lastRemindTime = options.lastAccessTimestamp,
                        now = new Date().getTime();
                    
                    if (noCache || !lastRemind || (now-lastRemind.readTime)>SELF.options.remind_timeout) {
                        
                        if (opt.reminderUrl) {
                            $.ajax ({
                                url     : opt.reminderUrl,
                                type    : "post",
                                data    : {lastAccessTimestamp: lastRemindTime},
                                dataType: "json",
                                cache   : false,
                                complete: function() {},
                                error   : function() {},
                                success : function(json) {
                                    // json = '{ "result":20120607, "number":111, "reminder":[{title:"111"}]}';
                                    
                                    countAll += json.number||0;
                                    if (json.number>0) {
                                        options.reminder = options.reminder || json;
                                        SELF.data.reminder = SELF.data.reminder.concat(json.data);
                                        
                                        SELF.tip(countAll);
                                    }
                                    
                                    // 缓存消息数量和时间
                                    tbc.jdc.set("appLastRemindTime", opt.applicationId, {time:lastRemindTime, readTime:now, count:json.number || (lastRemind?lastRemind.count:0) });
                                }
                            });
                        }
                    } else {
                        countAll += (lastRemind ? lastRemind.count||0 : 0);
                        SELF.tip(countAll);
                    }
                });
            }
        },
        
        // 应用提示
        receiveReminderForApp : function(noCache) {
            
            var SELF = this,
                lastRemind     = tbc.jdc.select("appLastRemindTime", options.applicationId),
                lastRemindTime = options.lastAccessTimestamp,
                url            = options.reminderUrl,
                now            = new Date().getTime();

            if (url && (noCache || !lastRemind || (now-lastRemind.readTime)>this.options.remind_timeout)) {
                $.ajax({
                    url   : url,
                    type  : "post",
                    data  : { lastAccessTimestamp : lastRemindTime },
                    cache : false,
                    dataType : "json",
                    complete : function() {},
                    error    : function() {},
                    success  : function(json) {
                        // json === '{ "result":20120607, "number":111}';
                        
                        options.reminder = json;
                        
                        if (SELF.tip) {
                            SELF.tip(json.number);
                        }
                        SELF.data = SELF.data||{};
                        SELF.data.reminder = json.data;
                        
                        // 缓存消息数量和最后请求时间
                        tbc.jdc.set("appLastRemindTime", options.applicationId, { time:lastRemindTime, readTime:now, count:json.number });
                    }
                });
            } else if (lastRemind && typeof this.tip === 'function') {
                this.tip(lastRemind.count);
            }
        },
        
        // 停止接收提示
        stopReceiveReminder : function() {
            clearInterval(this.interval);
            return this;
        },
        
        // 更新 读取消息的时间
        updateRemindeTime : function() {
            
            if (this.type === "APP") {
                var last    = tbc.jdc.select("appLastRemindTime", options.applicationId),
                    now     = new Date().getTime(),
                    reminde = {
                        time     : last && last.time ? last.time : options.lastAccessTimestamp,
                        readTime : now,
                        count    : last ? last.count||0 : 0
                    };
                
                options.lastAccessTimestamp = now;
                
                // 缓存消息数量和最后请求时间
                tbc.jdc.set("appLastRemindTime", options.applicationId, reminde);
            }
        },
        
        // 按不同的打开方式打开
        open : function() {
            
            var SELF = this,
                appId = options.userDeskItemId;
            
            this.updateRemindeTime();
            this.window = tbc.system.open(options);
            
            if (appId) {
                if (this.window) {
                    this.window.addEvent ("afterClose", function() {
                        var ic = $(".tbc-folder-thumbnail-icon[_folderid='"+ appId +"']"),
                            task=tbc.system.getTaskByElement(ic);
                        if (ic.size() && task) {
                            task.receiveReminder(true);
                        } else {
                            // 关闭后更新提示数字
                            SELF.receiveReminder(true);
                        }
                        appId = null;
                    });
                }
            }
            
            if (this.pop) {
                this.pop.close();
                this.pop = null;
            }
            
            if (this.window) {
                this.window.addEvent({
                    "changeTitle":function(n, t) {
                        SELF.name(t, true);
                    }
                });
            }
            
            this.triggerEvent("open");
            return this;
        },
        
        // 重命名
        rename : function(n) {
            if (this.type === "FOLDER") {
                this.renameFolder(n);
            } else {
                this.renameApp(n);
            }
        },
        
        // 重命名应用
        renameApp : function() {
            
        },
        
        // 重命名文件夹
        renameFolder : function(folderName) {
            if (!folderName) { return; }
            var SELF = this,
                folderId  = options.folderId||options.userDeskItemId,
                desktopId = window.desktop.current().ui.attr("svid");
            
            $.ajax({
                  url    : URLS.renameFolder
                , type   : "post"
                , data   : { "_ajax_toKen":"elos", folderName:folderName, userDeskId:desktopId, userDeskItemId:folderId }
                , complete : function() {}
                , error    : function() {}
                , dataType : 'json'
                , success  : function(json) {
                    if (json.success || $.trim(json).toLowerCase() === "true") {
                        SELF.name(folderName);
                    } else {
                        new tbc.Pop({
                              width    : 240
                            , height   : 80
                            , autoClose: true
                            , timeout  : 3
                        })
                        .locate(SELF.ui.find(".tbc-shortcut-icon"))
                        .show()
                        .html('<p style="padding:2em;">重命名失败, 可能已经存在同名的文件夹!</p>');
                        SELF.startRename();
                    }
                }
            });
        },
        
        // 开启重命名
        startRename : function() {
            var SELF = this,
                inp;
                
            this.parts.nameNode.addClass("tbc-shortcut-label-focus").focus();
            
            inp = $('<input type="text" value="' + this.parts.nameNode.text() + '"/>')
            .css({ border:"0px", height:"100%", width:"100%", background:"transparent", borderRadius:"0px", textAlign:"center" })
            .bind({
                "click.stopWhenEdit" : function(event) {
                    //event.stopPropagation();
                    return false;
                },
                "keyup" : function(event) {
                    if (event.keyCode === 13) {
                        this.blur();
                        return;
                    }
                },
                "blur focusout" : function (event) {
                    // 截取前10个字节 
                    var n = tbc.substr($.trim(this.value), 10);
                    
                    SELF.rename(n);
                    
                    inp.remove();
                    inp = null;
                    SELF.parts.nameNode.html(n).removeAttr("contenteditable").removeClass("tbc-shortcut-label-focus");
                    event.stopPropagation();
                    return false;
                }
            });
            
            this.parts.nameNode.html("").append(inp);
            inp[0].select();
            inp[0].focus();
        },
        
        // 删除shortcuts
        del : function() {
            if (this.type==="FOLDER") {
                this.delFolder();
            } else {
                this.delApp();
            }
        },
        
        // 
        delFolder : function() {
            
            var SELF = this;
            
            if (this.thumbnail.length>0) {
                new tbc.Pop({
                      width : 240
                    , height: 80
                    , autoClose    :true
                    , timeout    : 3
                })
                .locate(this.ui.find(".tbc-shortcut-icon"))
                .show()
                .html('<p style="padding:2em;">无法删除,文件夹不为空!</p>');
                return;
            }
            
            tbc.Folder.del(this.svid, function(r) {
                if (r.result || r.success) {
                    var guid = $(SELF.ui).parents("[tbc]:first").attr("tbc"),
                        task = tbc.TASKS(guid);
                    
                    SELF.ui.remove();
                    task.layout();
                    SELF.DESTROY();
                }else{
                    new tbc.Pop({
                          width : 200
                        , height: 80
                        , icon    : null
                        , autoClose    :true
                        , timeout    : 3
                        , locate    : SELF.ui
                        , parent    : null
                    })
                    .locate(SELF.ui.find(".tbc-shortcut-icon"))
                    .show()
                    .html('<p style="padding:2em;">删除失败!</p>');
                }
            });
        },
        
        // pop 文件夹
        openPopFolder : function() {
            var SELF = this;
            
            if (!this.pop) {
                this.pop = new tbc.folder.Pop(tbc.extend({}, options, { width:200, height:480, parent:".tbc-slide-scene.current", locate:SELF.ui }));
                this.pop.addEvent({
                    "close" : function() {
                        SELF.removeEvent("moved.locatePop");
                        SELF.pop = null;
                    }
                });
                
                SELF.addEvent({
                    "moved.locatePop" : function(pos) {
                        SELF.pop.locate(SELF.ui, pos);
                    }
                });
                
            }else{
                SELF.pop.ui.fadeOut(100).fadeIn();
            }
            return SELF.pop;
        }
    })
    .init();
    
};


/**
 * 从文件夹移除
 * @static
 * @for tbc.Shortcut
 * @param {String} folderId 文件夹ID
 * @param {String} shortcutId 快捷方式或应用ID
 */
tbc.Shortcut.moveOutFolder = function(folderId, shortcutId) {
    
};
 
/**
 * 移动到文件夹
 * @static
 * @for tbc.Shortcut
 * @method moveToFolder
 * @param {string} folderId 文件夹ID
 * @param {string} shortcutId 快捷方式或应用ID
 */
tbc.Shortcut.moveToFolder = function(folderId, shortcutId) {
    $.ajax({
         url        : URLS.shortcutMoveToFolder,
         type        : "post",
         dataType    : "json",
         data        : { "folderUserDeskItemId":folderId, "userDeskItemId":shortcutId },
         success    : function(json) {
            if (!json.success) {
                tbc.alert(json.message);
            }
        }
    });
};

/**
 * 静态方法: 移动到文件夹
 * @static
 * @for tbc.Shortcut
 * @method moveToScene
 * @param {String} folderId 文件夹ID
 * @param {String} shortcutId 快捷方式或应用ID
 */
tbc.Shortcut.moveToScene = function(deskId, shortcutId) {
    $.ajax({
        url        : URLS.shortcutMoveToScene,
        type    : "post",
        dataType: "json",
        data    : { "deskId":deskId, "shortcutId":shortcutId },
        success    : function(json) {
            if (!json.success) {
                tbc.alert(json.message);
            }
        }
    });
};


/*    
 * 静态方法: 根据ID获取桌面上的快捷方式和应用实例
 * @static
 * @for tbc.Shortcut
 * @method getInstanceById
 * @param {String} shortcutId
 */
tbc.Shortcut.getInstanceById = function(shortcutId) {
    var d = tbc.TASK_DEPOT,
        i;
    for (i in d) {
        if (d.hasOwnProperty(i) && d[i].packageName==='tbc.Shortcut' && d[i].id===shortcutId) {
            return d[i];
        }
    }
};

}(window.tbc,window.jQuery, window.URLS));


/*
 * Class:  tb.Start (开始菜单) ########################################## 
 * 
 * @Copyright	: 时代光华
 * @Author		: 罗志华
 * @mail 		: mail@luozhihua.com
 
 * Methods		: 
 * 
 */
 
tbc.Start = function(settings) {
	
	var SELF = tbc.self (this, arguments);
	
		SELF.extend(tbc.Event);
		SELF.extend(tbc.ClassManager);
		SELF.packageName = "tbc.Start";
	
	var defaults = {
		  handle	: ".tbc-startmenu-handle"
		, ui		: ".tbc-startMenu"
		, container	: ".tbc-startMenu-container"
	},
	options = tbc.extend({}, defaults, settings);
	
	SELF.container = $(options.container);
	SELF.ui 	= $(options.ui);
	SELF.handle = $(options.handle);
	
	
	SELF.ui.contextmenu({
		items: [
			{text:"隐藏开始菜单", icon:"", click:function() {SELF.hide();}}
		]
	})
	.bind({
		"click" : function(event) {
			event.stopPropagation();
			return false;
		},
		"contextmenus" : function(event) {
			event.stopPropagation();
			return false;
		}
		
	});
	
	/* 触摸屏 */
	if (tbc.touchable) {
		 SELF.handle.bind({
			"touchstart" : function(event) {
				setTimeout(function() {
					SELF.toggle();
				}, 10);
				event.originalEvent.stopContextmenu = true;
				return false;
			}
		});
	
	/* 传统浏览器 */
	}else{
		SELF.handle.bind({
			"click": function(event) {
				SELF.toggle(); event.stopPropagation(); return false;
			},
			"mouseenter" : function() {
				clearTimeout(SELF.hideTimer);
			}
		});
	}
	
	SELF.toggle = function() {
		SELF.ui.filter(":visible").size()
		? SELF.hide()
		: SELF.show();
	}
	
	SELF.show = function() {
		
		SELF.ui.show();
		
		// 鼠标离开开始菜单即将其隐藏
		SELF.ui.bind({
			"mouseleave":function() { 
				SELF.hideTimer = setTimeout(function() { SELF.hide(); }, 300);
			}
		});
		
		SELF.handle.addClass("tbc-startmenu-handle-hold");
		
		/* 触摸屏 */
		if (tbc.touchable) {
			$(document).bind({
				"touchend.startmenu" : function() {
					// SELF.hide();
				}
			});
		
		/* 传统浏览器 */
		}else{
			$(document).bind({
				"click.startmenu": function(event) {
					if (event.button === 0 || event.button === 1)SELF.hide();
				} 
			});
		}
		
		if (!SELF.userLoaded) {
			SELF.getUser();
		}
	}
	
	SELF.hide = function() {
		
		SELF.ui.hide();
		
		SELF.handle.removeClass("tbc-startmenu-handle-hold");
		SELF.ui.unbind("mouseleave");
		
		$(document).unbind(".startmenu");
	}
	
	SELF.hideTaskbar = function() {
		
	}
	
	SELF.getUser = function() {
		var self = this;
		$.ajax({
			url	: URLS["getUserinfo"] || "/uc/html/user/user.getFaceUrlAndName.do",
			type	: "post",
			dataType: "json",
			error	: function() {
				self.ui.find(".tbc-userPortrait img").hide();
				self.ui.find(".tbc-startMenu-userinfo h1").html(USERNAME);
				self.userLoaded = true;
				self = null;
			},
			success	: function(json) {
				/*
				 json = {
					"faceUrl"	: "http://tbc.21tb.com/sf-server/file/getFile/ec9b30510e93565a663f6c4053337e6e-S_1331284919850/508f8107498e87a38c0f5ac8_0100/small",
					"userName"	: "罗志华"
				}
				*/
				if (json.faceUrl) {
					self.ui.find(".tbc-userPortrait img").attr("src", json.faceUrl).show();
				} else {
					self.ui.find(".tbc-userPortrait img").hide();
				}
				self.ui.find(".tbc-startMenu-userinfo h1").html(json.userName);
				self.userLoaded = true;
				self = null;
			}
		});
	}
	
	SELF.getUser();
}

;(function(tbc, $) {
    
    "use strict";
    
    var System = function() {
        var init = function() {
            var i=0;
        };
        
        init();
    };
    
    System.prototype = {
        
        getDesktopHeight : function() {
            return window.desktop.container.height();
        },
        
        getDesktopWidth : function() {
            return window.desktop.container.width();
        },
        
        /**
         * 根据ID获取桌面应用或快捷方式的实例
         * 
         * @public
         * @method getShortcutById
         * @param {String} id 应用或快捷方式的config id 
         * @return {Object} 
         */
        getShortcutById : function(id) {
            return this.getTaskByElement("[_shortcutid='"+ id +"']");
        },
        
        /* 根据配置获取打开类型 */ 
        getOpenType : function(app) {
            var options = typeof(app) === "string" ? this.getAppOptions(app) : app,
                type    = null,
                type_1;
            
            if (options.itemType) {
                type_1    = options.itemType.toUpperCase();
                switch(type_1) {
                    
                    case "FOLDER":
                        type = "FOLDER";
                        break;
                        
                    //case "APP":
                    case "APPLICATION":
                        type = "APP";
                        break;
                    
                    case "WIDGET":
                        type = "WIDGET";
                        break;
                    
                    case "shortcut":
                        type = "LINK";
                        break;

                    case "ICON"    :
                        type = options.openType === "NEW_WINDOW" 
                        ? "APP"
                        : "LINK";
                        break;
                    
                    default:
                        type = type_1;
                }
                
            }else{
                type = options.openType === "NEW_WINDOW" 
                ? "APP"
                : "LINK";
            }
                
            return type;
        },
        
        /* 根据ID获取App配置 */
        getAppOptions : function(id) {
            return window.applicationMap[id];
        },
        
        /* 根据节点获取JS任务 */ 
        getTaskByElement : function(node) {
            var guid    = $(node).attr("tbc");
                guid    = guid || $(node).parents("[tbc]:first").attr("tbc");
            
            return tbc.TASKS(guid);
        },
        
        /* 退出 */
        logout : function(noVerify) {
            if (!noVerify) {
                window.onbeforeunload = null;
                document.location.href = "/login/login.logout.do";
            } else {
                var p = new tbc.Pop({ width:320, height:150 }).appendTo("body").locate(".tbc-startmenu-handle").show(),
                    b = new tbc.Button({ text:"退出", icon:"icon-breadcrumb_separator_arrow_2_dots", click : function() { tbc.system.logout(false); } }),
                    c = new tbc.Button({ text:"取消", icon:"icon-close", click : function() { setTimeout(function() {p.close(); },1);} }),
                    t = $("<div/>").html("退出平台后您正在学习的课程将无法记录学分,您确定退出吗?").css({ padding:"0 0 2em 0"}).appendTo(p.container);
                
                b.depend(p);
                b.appendTo(p);
                b.ui.css("float","left").addClass("tbc-button-blue");
                
                c.depend(p);
                c.appendTo(p);
                c.ui.css({marginRight:12, "float":"right"});
                
                p.container.css("padding","2em");
            }
        },
        
        /* 按类型打开 */
        open : function (options_Or_AppId, param, loadAlways) {
            var options = typeof(options_Or_AppId) === "string" 
                    ? this.getAppOptions(options_Or_AppId)
                    : options_Or_AppId,
                type    = this.getOpenType(options),
                task    = null,
                appid   = options.appId || options.applicationId,
                baseApp = tbc.webdesk.data.apps[appid],
                
                sceneUi, isCurrScene, scene, appOpt, shortcutId, url;
            
            options = $.extend({}, baseApp, options);
            
            switch(type) {
                
                // 文件夹
                case "FOLDER":
                    task = tbc.TaskManager.get("folder", options.userDeskItemId);
                    if (task) {
                        sceneUi = task.ui.parent();
                        isCurrScene = sceneUi.hasClass("current");
                        scene = tbc.system.getTaskByElement(sceneUi);
                        
                        if (!isCurrScene) {
                            scene.show();
                        }
                        
                        sceneUi = isCurrScene = scene = null;
                        
                        if (task.focused) {
                            task.flash();
                        } else {
                            task.show();
                        }
                    }else{
                        task = new tbc.Folder(options)
                        .addEvent({
                            "afterClose":function() {
                                tbc.TaskManager.exit("folder", options.userDeskItemId);
                            }
                        })
                        .show();
                        
                        tbc.TaskManager.set("folder", options.userDeskItemId, task);
                    }
                    break;
                
                // 应用
                case "APP":
                case "APPLICATION":
                    task = tbc.TaskManager.get("app", options.applicationId);
                    if (task) {
                        sceneUi = task.ui.parent();
                        isCurrScene = sceneUi.hasClass("current");
                        scene = tbc.system.getTaskByElement(sceneUi);
                        
                        if (!isCurrScene) {
                            scene.show();
                        }
                        sceneUi = isCurrScene = scene = null;
                        
                        task.show();
                        
                        if (loadAlways) {
                            task.load (options.homePageUrl,  param?"post":"get", param);
                        }
                        
                    } else {
                        
                        if (typeof param !== 'undefined') {
                            options.data = param;
                        }
                        
                        appOpt = window.applicationMap[options.applicationId];
                        options = $.extend(appOpt, options);
                        
                        /**
                        options.originateSettings.abc = options.originateSettings.abc || 1;
                        options.originateSettings.abc++;
                        */
                        
                            task = new tbc.App(options, options)
                            .addEvent({
                                "afterClose":function() {
                                    tbc.TaskManager.exit("app", options.applicationId);
                                }
                            })
                            .show();
                            tbc.TaskManager.set("app", options.applicationId, task);
                        
                    }
                    break;
                    
                // 链接
                case "LINK":
                    window.open(options.homePageUrl, options.applicationId);
                    break;
                    
                case "SHORTCUT":
                
                    // 如果有自动登录的设置
                    if (options.autologin===false) {
                        if (this.startAutoLogin(options) === false) {
                            window.open(options.homePageUrl, options.applicationId);
                        }
                    } else {
                        window.open(options.homePageUrl, options.applicationId);
                    }
                    break;
            }
            
            try {
                return task;
            } finally {
                task = null;
            }
        },
        
        /**
         * 开启自动登录设置界面()
         * 
         * @public
         * @method startAutoLogin
         * @param {Object} options 快捷方式配置;
         * @return {instanceof tbc.Window || Boolean} 打开成功返回true, 否则返回false; 
         */
        startAutoLogin : function(options) {
            
            var shortcutId = options.userDeskItemId,
                url = window.URLS.autoLoginSetting,
                win,
                sys = this;
                
            if (typeof url === "string") {
                url = url.replace(/\{\{shortcutId\}\}/, shortcutId);
                
                this.autoLoginWins = this.autoLoginWins || {};
                win = this.autoLoginWins[options.userDeskItemId];
                
                if (win) {
                    win.show();
                } else {
                    win = new tbc.Window({
                        width    : 500,
                        height   : 340,
                        name     : options.userDeskItemName + " - 自动登录设置",
                        homepage : url,
                        loadType : "ajax"
                    }).show();
                    
                    win.addEvent({
                        "close" : function() {
                            delete sys.autoLoginWins[options.userDeskItemId];
                        }
                    });
                    
                    this.autoLoginWins[options.userDeskItemId] = win;
                }
                
            } else {
                win = false;
            }
            
            return win;
        },
        
        /**
         * 判断字符串是否是一个图片地址
         * @method isImg
         * @public
         * @param {Strinf} str 字符串
         * @return {Boolean} 返回true则字符串为图片地址，否则不是   
         */
        isImg : function(str) {
            return !!(typeof str === "string" && (str.match(/\.(jpg|jpeg|gif|png|img|bmp|ico|WebP)$/) || str.indexOf("sf-server/file/getFile/") !== -1));
        }
    };
    
    /**
     * tbc系统对象
     * @property {Object} system
     * @for tbc
     * @type {System}
     */
    tbc.system = new System();
    
    /**
    function opennew(t, p) {
        var data = $.data(t, "desktop"),
            appData,
            action,
            index;
        
        if (p.id === undefined) {
            return;
        }
        
        appData=data.options.itemsData[p.id];
        
        if (typeof appData === 'undefined') {
            return;
        }
        
        if (p.param) {
            appData=$.extend(appData,{param:p.param});
        }
        
        action=appData.homePageUrl;
        if (action && action !== null && appData.openType === "NEW_WINDOW") {
            index = appData.userDeskPosition;
            
            if (data.options.curDesktopIndex===index || index===null || typeof index===undefined) {
                opennewwin(t, appData);
            } else {
                data.options.curDesktopIndex=index;
                switchScreenPage(t,function() {
                    opennewwin (t,appData);
                });
            }
        }
    }
    */
}(window.tbc, window.jQuery));

;(function(tbc, $){
    
    "use strict";
    
    /**
     * 桌面任务栏构造类
     * @class  tbc.Task 
     * @constructor
     * @param options 任务配置
     * @copyright 时代光华
     * @author mail@luozhihua.com
     */
    tbc.Task = function(options) {
        
        var cssHover   = "tbc-task-hover",
            cssActive  = "tbc-task-active",
            cssCurrent = "tbc-task-current",
            CONTAINER  = ".tbc-task-container";
        
        /**
         * 渲染
         * @method RENDER
         * @private
         * @return {jQuery Object} 任务栏菜单项 
         */
        function RENDER() {
            var icon = tbc.system.isImg(options.icon)
                ? options.icon
                : (tbc.system.isImg(window.DEFAULT_ICONS.window_icon) ? window.DEFAULT_ICONS.window_icon : ""),
                
            model = '<li class="tbc-task">' +
                '    <i class="tbc-icon icon icon-16"><img onerror="this.style.display=\'none\';" src="{icon}"></i>' +
                '    <span class="tbc-task-title">{title}</span>' +
                '    <em></em>' +
                '</li>',
                
            html = $(model.replace(/\{title\}/g, options.title).replace(/\{icon\}/g, icon));
            
            html.bind({
                mouseenter:function() {$(this).addClass("tbc-task-hover");},
                mouseleave:function() {$(this).removeClass("tbc-task-hover");},
                mousedown:function() {
                    $(this).addClass("tbc-task-active");
                    $(document).bind("mouseup.TBC_TASK_CLICK",function() {
                        html.removeClass("tbc-task-active");
                        $(document).unbind("mouseup.TBC_TASK_CLICK");
                    });
                }
            });
            
            return $(html).appendTo(CONTAINER);
        }
        
        tbc.self (this, arguments)
        .extend({
            
            /**
             * 类名
             * @property
             * @type {String}
             * @public 
             */
            packageName : "tbc.Task",
            
            /**
             * 任务栏链接
             * @property
             * @type {Object}
             * @public 
             */
            handle : null,
            
            /**
             * 初始化
             * @method init
             * @private 
             */
            init : function() {
                this.packageName = "tbc.Task";
                this.handle = RENDER();
                this.icon(options.icon || window.DEFAULT_ICONS.window_icon);
                return this;
            },
            
            /**
             * 显示任务栏链接
             * @public
             * @method show
             * @chainable 
             */
            show : function() {
                this.handle.show();
                return this;
            },
            
            /**
             * 隐藏任务栏链接
             * @public
             * @method hide
             * @chainable 
             */
            hide : function() {
                this.handle.hide();
                return this;
            },
            
            /**
             * 移除任务栏链接
             * @public
             * @method remove
             * @chainable
             */
            remove : function() {
                this.handle.remove();
            },
            
            /**
             * 设置任务栏链接的名称
             * @public
             * @method title
             * @param {String} title 名称
             * @chainable
             */
            title : function(title) {
                if (typeof title === "string") {
                    this.handle.children(".tbc-task-title").html(title).attr("title", title);
                }
                return this;
            },
            
            /**
             * 设置任务栏链接的图标
             * @public
             * @method icon
             * @param {String} url 图标路径或者CSS类
             * @chainable
             */
            icon  : function(url) {
                if (tbc.system.isImg(url)) {
                    this.handle.find(".tbc-icon img").attr("src", url).parent().addClass("icon");
                }else{
                    this.handle.find(".tbc-icon").addClass(url).removeClass("icon");
                }
                return this;
            },
            
            /**
             * 使任务栏链接闪烁
             * @public
             * @method flash
             * @chainable
             */
            flash  : function() {
                var SELF = this;
                setTimeout (function() { SELF.handle.addClass("tbc-task-current"); },0);
                setTimeout (function() { SELF.handle.removeClass("tbc-task-current"); },80);
                setTimeout (function() { SELF.handle.addClass("tbc-task-current"); },160);
                setTimeout (function() { SELF.handle.removeClass("tbc-task-current"); },220);
                setTimeout (function() { SELF.handle.addClass("tbc-task-current"); },280);
                setTimeout (function() { SELF.handle.removeClass("tbc-task-current"); },320);
                
                if (this.current) {
                    setTimeout (function() { SELF.handle.addClass("tbc-task-current"); },360);
                }
                
                return this;
            },
            
            /**
             * 设置任务栏链接的为活动状态
             * @public
             * @method setCurrent
             * @chainable
             */
            setCurrent : function() {
                if (this.handle) {
                    this.current = true;
                    this.handle.addClass("tbc-task-current");
                }
                return this;
            },
            
            /**
             * 取消任务栏链接的活动状态（变灰）
             * @public
             * @method removeCurrent
             * @chainable
             */
            removeCurrent : function () {
                if (this.handle) {
                    this.current = false;
                    this.handle.removeClass("tbc-task-current");
                }
                return this;
            }
        })
        .addEvent ({
            "destroy" : function () {
                RENDER = options = cssHover = cssActive = cssCurrent = CONTAINER = null;
            }
        })
        .init();
    };
}(tbc, jQuery));
/*
 * @Class:  tb.Taskbar(任务栏) ########################################## 
 * 
 * @Copyright	: 时代光华
 * @Author		: luozhihua (罗志华)
 * @mail 		: mail@luozhihua.com
 * @Blog 		: http://www.luozhihua.com
 */
 
tbc.Taskbar =function(settings) {
	var SELF = tbc.self(this, arguments);
		SELF.packageName = "tbc.Taskbar";
		
		SELF.extend(tbc.Event);
		SELF.extend(tbc.ClassManager);
	
	var defaults = {
		  ui		: ".tbc-taskbar"
		, handle	: null // 隐藏按钮
		, startBox	: ".tbc-startBox" // 开始菜单
		, taskbbox	: ".tbc-task-box"
		, container	: ".tbc-task-container"
		, quickbar	: ".tbc-task-quickLaunch" // 左下角开始菜单盘的快速启动栏
		, appsTray	: ".tbc-appsTray" // 任务栏右下角的托盘,
		, toPrev	: ".tbc-scroll-arrow-toPrev"
		, toNext	: ".tbc-scroll-arrow-toNext"
	},
	options = tbc.extend({}, defaults, settings);
	
	SELF.ui = $(options.ui);
	SELF.taskbox = $(options.taskbox);
	SELF.container = $(options.container);
	SELF.startBox = $(options.startBox);
	SELF.quickbar = $(options.quickbar);
	SELF.appsTray = $(options.appsTray);
	
	SELF.hide = function(sign) {
		SELF.container.parent().hide();
		SELF.quickbar.hide();
		SELF.appsTray.hide();
		
		
		SELF.ui.find(".tbc-taskbar-container").stop().animate({ width:"60" }, "slow", function() { SELF.ui.css({ "overflow": "", width:60 }); });
		
		if (sign !== false) {
			
			SELF.state = "min";
			SELF.ui.addClass("tbc-taskbar-min");
			
			SELF.ui.children(".tbc-toggle-taskbar")
				.removeClass("tbc-hideTaskbar")
				.addClass("tbc-showTaskbar");
		}
		
		SELF.triggerEvent("hdie");
	}
	
	SELF.show = function(sign) {
		SELF.container.parent().show();
		SELF.quickbar.show();
		SELF.appsTray.show();
		
		
		SELF.ui
		.css("width", "100%")
		.find(".tbc-taskbar-container").stop().animate({ width:"100%"}, function() {
			this.style.overflow = "visible";
		});
		if (sign !== false) {
			
			SELF.state = "max";
			SELF.ui.removeClass("tbc-taskbar-min");
			
			SELF.ui.children(".tbc-toggle-taskbar")
				.removeClass("tbc-showTaskbar")
				.addClass("tbc-hideTaskbar");
			
		}
		
		SELF.triggerEvent("show");
	}
	
	SELF.toggle = function() {
		if (SELF.state === "min") {
			SELF.show();
		}else{
			SELF.hide();
		}
	}
	
	SELF.slidetoLeft = function() {
		SELF.container.animate({scrollLeft:"+=100"}, 200);
	}
	
	SELF.slidetoRight = function() {
		SELF.container.animate({scrollLeft:"-=100"}, 200);
	}
	
	SELF.slideTo = function(offset) {
		
		SELF.container.animate(offset||{}, 200);
		
	}
	
	SELF.slideToTask = function(node) {
		if (node) {
			var w	= SELF.container.width(),
				n	= $(node),
				sw	= n.size() ? n[0].offsetLeft : 0;
			
			SELF.slideTo({ scrollLeft:sw-w/2, scrollTop:0 });
		}
	}
	
	// 
	SELF.resize = function() {
		var W	= $("body").width(),
			sw	= $(".tbc-startBox").width(),
			qw	= 0,
			aw	= 0;
		qw = $(".tbc-task-quickLaunch i.tbc-imgicon").size()*20+10;
		$(".tbc-task-quickLaunch").width(qw);
		
		$(".tbc-appsTray .tbc-button-link").each(function() {
			aw += $(this).outerWidth() + parseInt($(this).css("marginLeft"))*2;
		});
		aw = Math.max(aw,24);
		$(".tbc-appsTray").width(aw+10);
		
		$(".tbc-task-box").css({marginLeft:qw === 0?"":qw+sw+24, marginRight:aw === 0?"":aw+40 });
	}
	
	// 
	SELF.addPopLink = function(sets) {
		var def = {
			icon	: null,
			text	: null,
			showText: false,
			url		: null,
			width	: 400,
			height	: 300,
			position: null,
			click	: function() {
				
			}
		},
		opt = tbc.extend({}, def, sets);
		
		
		if (opt.url) {
			$('<div class="tbc-popwindow"></div>').css({width:opt.width||def.width, height:opt.height||opt.height});
		}
	}
	
	$(options.toPrev).click(function() {
		SELF.slidetoRight();
		return false;
	});
	
	$(options.toNext).click(function() {
		SELF.slidetoLeft();
		return false;
	});
	
	$(options.ui).find(".tbc-toggle-taskbar").click(function() {
		SELF.toggle();
		return false;
	});
	
	$(options.ui).bind({
		"mouseenter" : function() {
			if (SELF.state === "min") SELF.show(false);
		},
		"mouseleave" : function() {
			if (SELF.state === "min") SELF.hide(false);
		}
	});
}
/**
 * 任务管理器
 * @class tbc.TaskManager
 * @constructor
 * @copyright 时代光华
 * @author mail@luozhihua.com
 */
tbc.TaskManager = new function() {
	var SELF = tbc.self(this, arguments);
	SELF.extend(tbc.Event);
	SELF.extend(tbc.ClassManager);
	
	SELF.packageName = "tbc.TaskManager";
	
	// 任务存储器
	SELF.taskStore = {}
	
	// 
	SELF.set = function(type, id, task) {
		if (!type || !id || !task) {return "参数Type/id/task是必须的;"}
	
		SELF.taskStore[type] = SELF.taskStore[type]||{length:0};
		
		if (!SELF.taskStore[type][id]) SELF.taskStore[type].length++;
		
		SELF.taskStore[type][id] = task;
		
		return SELF;
	}
	
	// 
	SELF.get = function(type, id) {
		
		// 获取所有类型的任务
		if (type === "all") {
			var tm = [];
			for(var t in SELF.taskStore) {
				for(var _t in SELF.taskStore[t]) {
					if (_t !== "length")tm.push(SELF.taskStore[t][_t]); 
				}
			}
			return tm;
		}
		
		// 获取某类型下的所有任务
		if (id === "all") {
			var tm = [];
			for(var t in SELF.taskStore[type]) { if (t !== "length")tm.push(SELF.taskStore[type][t]); }
			return tm;
		}
		
		// 获取单个任务
		if (SELF.taskStore[type]) {
			return SELF.taskStore[type][id];
		}
		return null;
		
	}
	
	// 
	SELF.doWith = function(func, type, id) {
		
		// 获取所有类型的任务
		if (type === "all") {
			var tm = [];
			for(var t in SELF.taskStore) {
				for(var _t in SELF.taskStore[t]) {
					if (_t !== "length") func(SELF.taskStore[t][_t]); 
				}
			}
		}
		
		// 获取某类型下的所有任务
		else if (type && (id === "all")||!id) {
			for(var t in SELF.taskStore[type]) {
				if (t !== "length") func(SELF.taskStore[type][t]);
			}
		}
		
		// 获取单个任务
		else if (type && id && SELF.taskStore[type]) {
			func(SELF.taskStore[type][id]);
		}
		return null;
		
	}
	
	// 删除
	SELF.exit = function(type,id) {
		if (SELF.taskStore[type]) {
			delete SELF.taskStore[type][id];
			SELF.taskStore[type].length--;
		}
		return SELF;
	}
}

;(function(tbc, $){

    "use strict";

    tbc.Window = function(settings) {

        var desktop = window.desktop,
            URLS = window.URLS;
            
        var SELF = tbc.self(this, arguments);

        SELF.extend([tbc.Panel, settings]);
        SELF.packageName = "tbc.Window";
        
        var defaults = {
              loadType    : "iframe"    // 加载类型,默认为iframe; 其他选项:html,ajax
            , homepage    : null         // 主页地址
            , autoLoad    : true
            , scrolling    : true        // 滚动
             
        };
        var options = $.extend({}, defaults, settings);
        
        var toolbar  = $('<div class="tbc-window-toolbar"></div>'),
            winbody  = $('<div class="tbc-window-body" style="'+ (options.scrolling?"overflow:auto;":"") +'"></div>'),
            statebar = $('<div class="tbc-window-statebar"></div>');
        
        // 角色切换
        if (options.appRoles && options.appRoles.length>1) {
            
            SELF.part.roleList.empty();
            SELF.part.roleBox
            .css({display:"block"})
            // .show() // IE下无效
            .bind ({
                "mouseleave" : function () {
                    SELF.part.roleList.hide();
                }
            });
            SELF.part.roleHandle.click(function() {
                SELF.part.roleList.show();
            });
            SELF.part.roleName.click(function() {
                SELF.part.roleList.show();
            });
            
            $.each (options.appRoles, function (i, role) {
                
                if (role.currentRole) {
                    SELF.part.roleName.html (role.roleName);
                }
                
                $ ("<li/>") .html (role.roleName)
                .appendTo(SELF.part.roleList)
                .click (function() {
                    SELF.part.roleName.html (role.roleName);
                    SELF.switchRole(role.roleId, role.roleCode);
                    SELF.part.roleList.hide();
                    var s=options.originateSettings;
                    options.originateSettings.appRoles[i].currentRole = true;
                    $.each (options.appRoles, function (j) { if (i !== j) options.originateSettings.appRoles[j].currentRole = false; });
                    
                });
            });
        }else{
            SELF.part.roleBox.hide()
        }
        
        // 任务栏
        if (tbc.Task) {
            
            SELF.task = new tbc.Task({
                title     : options.title,
                icon    : options.icon
            });
            
            // 使 SELF.task 依赖 SELF 对象: 以在销毁SELF对象时, 能同时销毁 SELF.task;
            SELF.task.depend(SELF);
            
            SELF.task.handle.contextmenu({
                items : [
                    {text:"最小化", icon:"", click:function() {SELF.min();}, disabled:function() { return !options.minimizable||SELF.minimize; },inheritable:true},
                    {
                        text  : function() {return SELF.sizeType === "max"?"还原":"最大化"},
                        icon  : "",
                        click : function() { if (SELF.sizeType === "max") {SELF.restore();}else{SELF.max();} },
                        disabled:function() {return !options.maximizable},
                        inheritable:true
                    },
                    {text:"关闭", icon:"icon-application_windows_remove", click:function() {SELF.close();}, inheritable:true},
                    {text:"关闭全部", icon:"icon-remove_outline", click:function() {

                        var win, seq, i;
                        for (seq=tbc.Panel.sequence, i=seq.length; i>=0; i-=1) {
                            win = tbc.Panel.cache[seq[i]];
                            if (win && win.close) {
                                win.close(true);
                            }
                        }
                        win = null;

                    }, inheritable:true}
                ]
            });
            
            SELF.task.handle.bind({
                "click" : function() {
                    
                    var sceneUi = SELF.ui.parent(),
                        isCurrScene = sceneUi.hasClass("current"),
                        scene = tbc.system.getTaskByElement(sceneUi),
                        index,
                        state;
                    
                    if (!isCurrScene && scene) {
                        index = scene.index;
                        desktop.show(index);
                    }
                    
                    if (SELF.minimize) {
                        state = SELF.sizeType;
                        SELF.resize(state);
                    } else {
                        if (SELF.focused) {
                            isCurrScene ? SELF.min() : SELF.flash();
                        }else{
                            SELF.focus();
                            if (SELF.focused) {
                                SELF.task.setCurrent();
                            }
                        }
                    }
                    
                    sceneUi = isCurrScene = scene = null;
                }
            });

            SELF.addEvent({
                 "focus" : function() { if (!SELF.minimize) SELF.task.setCurrent(); }
                ,"show"  : function() { SELF.task.show(); }
                ,"hide"  : function() { SELF.task.hide(); }
                ,"blur"  : function() { SELF.task.removeCurrent(); }
                ,"afterClose"  : function() { SELF.task.remove();  delete SELF.task.handle; SELF=null; }
                ,"changeTitle" : function(t, n) { SELF.task.title(n&&t ? n+": "+t : (n||t)); }
                ,"changeIcon"  : function(i) { SELF.task.icon(i); }
                // ,"flash"        : function() { SELF.task.flash(); }
            });
        }

        SELF.html(toolbar.add(winbody).add(statebar));
        SELF.addEvent({
            "resize":function() {
                var outerH = SELF.part.container.innerHeight(),
                    toolsH = toolbar.css("display") !== "none" ? toolbar.outerHeight() : 0,
                    statebarH = statebar.css("display") !== "none" ? statebar.outerHeight() : 0;
                winbody.height(outerH - toolsH - statebarH);
            },
            "load" : function(url, data) {
                // 添加历史记录
                SELF.history.add(url, data);
            }
        });

        SELF.container = winbody;
        SELF._html = SELF.html;
        
        SELF.history = new tbc.History(function(record) {
            SELF.load(record.url, record.method, record.data, false);
        });
        
        // 使 SELF.task 依赖 SELF 对象: 以在销毁SELF对象时, 能同时销毁 SELF.task;
        SELF.history.depend(SELF);
        
        tbc.extend(SELF, {
            
            html : function(html) {
                (this.container||winbody).html(html);
                return this;
            },

            tools : {
                
                store : {},
                length: 0,
                container : toolbar,
                add   : function(tools_1, obj_1) {
                    if (!tools_1) {
                        return this;
                    }
                    
                    toolbar[0].style.display = "block";
                    
                    var tools, id, obj;
                    if (typeof tools_1 === "string" && obj_1) {
                        tools = {};
                        tools[tools_1] = obj_1;
                    }else{
                        tools = tools_1;
                    }

                    for(id in tools) {
                        if (tools.hasOwnProperty(id)) {
                            obj = tools[id];
                            this.store[id] = obj;
                            
                            obj = obj&&obj.ui ? obj.ui : obj;
                            
                            toolbar.append(obj);
                            SELF.triggerEvent("tools.add", obj);
                            
                            this.length += 1;
                        }
                    }
                    
                    SELF.triggerEvent("resize");
                    tools = null;
                    
                    return this;
                },
                get   : function(id) {
                    return this[id];
                },
                remove : function(id) {
                    this.store[id].remove();
                    delete this.store[id];
                    SELF.triggerEvent("tools.remove");
                    this.length-=1;
                    if (this.length<1) {
                        toolbar.hide();
                    }
                    return this;
                },
                clear:function() {
                    var k;
                    for(k in this.store) {
                        if (this.store.hasOwnProperty(k)) {
                            this.remove(k);
                        }
                    }
                    return this;
                }
            },
            
            reload : function() {
                this.history.prohibited = true;
                var record = this.history.current();
                if (record) {
                    this.load (record.url, record.method, record.data);
                } else {
                    this.load(options.homepage, options.data?"post":"get", options.data);
                }
                record = null;
                return this;
            },
            
            refresh : function() {
                this.load (options.homepage, options.data?"post":"get", options.data);
                return this;
            },
            
            reset : function() {
                if ((options.windowInitialType !== "MAX" && options.windowInitialType !== "FULL") && this.maximize) {
                    this.restore();
                }
                this.initForOpen(); // 初始化窗口
                
                this.load (options.homepage, options.data?"post":"get", options.data);
                return this;
            },
            
            help : function () {
                
                if (URLS.help) {
                    
                    var loadHelp = function (appId) {
                        $.ajax({
                            url        : URLS.help,
                            type    : "post",
                            data    : {applicationId: appId, corpCode: window.corpCode},
                            dataType: "html",
                            beforeSend    : function () { tbc.system.helpwin.lock("loading", "loading..."); },
                            complete    : function () { tbc.system.helpwin.unlock("loading"); },
                            error        : function () { tbc.system.helpwin.load('<div style="padding:180px 2em; text-align:center;">没有找到与 <strong>'+ (options.applicationName||options.userDeskItemName) +'</strong> 相关的帮助内容.</div>'); },
                            success        : function (html) {
                                tbc.system.helpwin.load("");
                                var tcn     = $('<div class="apphelp-frame"></div>'),
                                    tabs = $(html).find("div.apphelp-tab-frame"),
                                    head = $('<div class="infotitle_a"><ul></ul></div>'),
                                    cont = $('<div class="apphelp-frame-container" style=""></div>'),
                                    tab;

                                tab = new tbc.Tabset({
                                      container    : cont
                                    , header    : head.children("ul")
                                    , effects    : "fade"
                                });
                                
                                tabs.each(function(i) {

                                    var t            = this.getAttribute("title"),
                                        titleNode    = $('<li class="">'+ t +'</li>'),
                                        content        = $(this).children(),
                                        T            = new tbc.Tabpage({                        
                                              title        : t
                                            , handleNode: titleNode
                                            , titleNode    : titleNode
                                            , iconNode    : null
                                            , container    : $('<div class="apphelp-tab-frame"></div>').append(content)
                                            , content    : this
                                            , currentClass : "cur"
                                            , autoShow : false
                                        });
                                    tab.append(T);
                                    tab.dependSelf(T);
                                });
                                tab.show(0);
                                
                                // 依赖关系
                                tab.depend (tbc.system.helpwin);
                                
                                // 在载入新内容前,销毁上次创建的内容
                                tbc.system.helpwin.addEvent ("beforeunload", function () {
                                    $.each (tab.tabs, function() { this.DESTROY(); });
                                    tab.DESTROY();
                                    tcn = tabs = head = cont = tab = null;
                                });
                                
                                tcn.append(head);
                                tcn.append(cont);
                                tbc.system.helpwin.append(tcn);
                            }
                        });
                    };
                    
                    if (tbc.system.helpwin) {
                        tbc.system.helpwin.focus().flash().name("帮助 "+ (settings.userDeskItemName || settings.applicationName));
                        loadHelp(options.applicationId || options.userDeskItemId );
                    }else{
                        tbc.system.helpwin = new tbc.Window({
                            name    : "帮助 "+ (settings.userDeskItemName || settings.applicationName),
                            icon    : "icon-comment_question",
                            loadType: "html",
                            width    : 580,
                            height    : 450,
                            minWidth    : 580,
                            minHeight    : 450,
                            scrolling    : false,
                            minimizable    : true,
                            maximizable    : true,
                            resizable    : true,
                            refreshable    : true
                        })
                        .addEvent("close", function() {delete tbc.system.helpwin;})
                        .show();
                        
                        tbc.system.helpwin.refresh = function () {
                            loadHelp(options.applicationId || options.userDeskItemId);
                        };
                        
                        loadHelp(options.applicationId || options.userDeskItemId);
                    }
                }
            },
            
            load : function(url, method, data) {
                var can = SELF.triggerEvent("beforeunload");
                SELF.loadTime = new Date().getTime();
                
                if (can !== false || window.confirm("您确定离开该页面吗?")) {
                    _load();
                }
                
                url = url || SELF.iframeUrl || options.homepage;
                
                function _load() {
                    switch(options.loadType) {
                        
                        case "iframe":
                            SELF.loadByIframe(url, method, data);
                            break;
                            
                        case "ajax":
                            SELF.loadByAjax(url, method, data);
                            break;
                            
                        case "html":
                            SELF.html(data||url);
                            break;
                            
                        default:
                            
                            break;
                    }
                }
                
                return SELF;
            },
            
            loadByAjax : function(url, method, data) {
                $.ajax({
                    url        : url,
                    method    : method || (data?"post":"get"),
                    data    : data||null,
                    error    : function() {},
                    success    : function(html) {
                        html = $.isFunction(options.ajaxResultProcessor) ? options.ajaxResultProcessor(html) : html;
                        if (html !== false) {
                            SELF.html(html);
                        }
                    }
                });
                
                return SELF;
            },
            
            /**
             * 角色切换
             * @param {String} roleId 角色ID.
             * @param {String} roleCode 角色代码.
             */
            switchRole : function (roleId, roleCode) {
                if (roleId) {
                    var appId = options.applicationId;
                    $.ajax ({
                        url     : tbc.formatString(URLS.switchAppRole, "elos", appId, roleId),
                        dataType: "json",
                        type    : "get",
                        error    : function() {},
                        success    : function(json) {
                            SELF.load(options.homepage, "post", {
                                "current_role_code" : roleCode,
                                "current_role_id"   : roleId,
                                "current_app_id"    : options.userDeskItemId
                            });
                        }
                    });
                }
            },
            
            matchIframeSrc : function(html) {
                var x,y,z;
                
                // 网址导航(兼容性代码)
                if (html.match(/http:\/\/hao.qq.com/)) {
                    z = "http://hao.qq.com";
                } else {
                    x = html ? html.match(/<iframe[^>]+>/) : null,
                    y = x&&x[0] ? x[0].match(/src\s*=\s*["']?\s*\S+\s*["']?/) : null,
                    z = y&&y[0] ? y[0].replace(/(src\s*=\s*["']?\s*|\s*["']*\s*>?$)/g,"") : null; 
                    z = !z||z.match(/^("|'|,|\+|\()/) ? null : z;
                }
                
                try { return z; } finally { html = x = y = z = null; }
            },
            
            loadByIframe : function (url, method, _data) {
                SELF.lock ("loading","等待服务器响应...");
                
                var loadTime = SELF.loadTime;
                
                // 存储APP的实际路径
                tbc.Window.iframeUrls = tbc.Window.iframeUrls || {};
                
                if (tbc.Window.iframeUrls[options.applicationId]) {
                    SELF._loadByIframe (tbc.Window.iframeUrls[options.applicationId], options.data?"post":"get", options.data);
                } else {
                    
                    $.ajax ({
                        url        : url || options.homepage,
                        success    : function(html) {
                            if (loadTime === SELF.loadTime) {
                                var z = SELF.matchIframeSrc(html);
                                    
                                SELF._loadByIframe (z || url || options.homepage, options.data?"post":"get", options.data);
                                if (!tbc.Window.iframeUrls[options.applicationId] && z) {
                                    tbc.Window.iframeUrls[options.applicationId] = z;
                                }
                                
                                z = null;
                            }
                        },
                        error    : function() {
                            SELF._loadByIframe (url || options.homepage, options.data?"post":"get", options.data);
                        }
                    });
                    
                }
                return SELF;
            },
            
            _loadByIframe : function (url, method, _data) {
                this.lock("loading", "正在加载应用...");
                
                var data    = [],
                    iframe    = SELF.iframe,
                    iname    = "tbc_window_iframe_"+ SELF.guid,
                    form,
                    _form,
                    k;
                
                url = url.replace(/#$/, "");
                
                iframe.src = "";
                
                if (method === "post" && _data) {
                    form = $('<form action="'+ url +'" target="'+ iname +'" method="post" enctype="application/x-www-form-urlencoded" style="display:none;"></form>').appendTo(SELF.container);
                    for(k in _data) {
                        $('<input class="default_data" type="hidden" name="'+ k +'" id="'+ k +'" value="'+ _data[k] +'" />').appendTo(form);
                    }
                    $('<input class="default_data" type="submit" name="submit_default_data" id="submit_default_data" value="submit" />').appendTo(form);
                    
                    setTimeout(function() {
                        form[0].submit();
                        form.find(".default_data").remove();
                        form.remove();
                        form = null;
                    },1);
                    
                }else if (method === "get" && _data) {
                    if (typeof(_data) === "object") {
                        if (_data.constructor === Array) {
                            data = data.concat(_data);
                        }else{
                            for(k in _data)    data.push([k,_data[k]].join("="));
                        }
                    }else{
                        data.push(_data);
                    }
                    
                    url = url.indexOf("?") !== -1 
                        ? url+"&"+data.join("") 
                        : url +"?"+data.join("");
                    iframe.setAttribute("src", url);
                }else{
                    iframe.setAttribute("src", url);
                }
                
                setTimeout(function() {
                    if (SELF && typeof SELF.unlock === 'function') {
                        SELF.unlock("loading");
                    }
                }, 1000);
                
                data = iname = null;
                return SELF;
            }
        });
        
        
        if (options.loadType === "iframe") {
            SELF.html('<iframe class="tbc-window-iframe" scrolling="auto" frameborder="no" hidefocus="" allowtransparency="true" id="tbc_window_iframe_'+SELF.guid+'" name="tbc_window_iframe_'+SELF.guid+'"></iframe');
            SELF.iframe = SELF.container.children(".tbc-window-iframe")[0];
            SELF.addEvent({
                "beforeClose" : function() {
                    SELF.returnValue = SELF.iframe.contentWindow.returnValue;
                }
            });
            
            if (tbc.msie && tbc.browserVersion<8) {
                SELF.iframe.attachEvent("onload", function() {
                    var t = 10, timer;
                    timer = setInterval(function() { 
                        t--;
                        if (t<0) clearInterval(timer);
                        
                        $(".tbc-slide-scene.current,.tbc-desktop-slide,.tbc-desktop,body").each(function() {
                            //this.scrollTop = 0;
                            //this.scrollLeft = 0;
                        });
                    }, 500);
                }); 
                SELF.iframe.attachEvent("onfocus", function (event) { event.preventDefault && event.preventDefault(); return false; });
            }
            
            // iPad及平板电脑等iframe等不能滚动的问题
            if (tbc.touchable) {
                /**
                *   @param  iframeID         iframe的id或者iframeElement[Doc Object]
                *   @param  iframeWrapper    用于包装iframe的元素
                */
                var touchY = 0, touchX = 0;
                
                SELF.iframe.onload = function() {
                    var c = 12,
                        t = 1000,
                        timer;
                        
                    var ifrWin = SELF.iframe.contentWindow;
                    timer = setInterval(function() {
                        c--;
                        try {
                            var    ifrDoc = ifrWin.document;
                            
                            // 记录手指按下的位置
                            ifrDoc.body.addEventListener("touchstart", function(event) {
                                touchX = event.targetTouches[0].pageX;
                                touchY = event.targetTouches[0].pageY;
                            });
                            
                            ifrDoc.body.addEventListener("touchmove", function(event) {
                                
                                if (SELF.iframe.parentNode.scrollHeight > 20+SELF.iframe.parentNode.offsetHeight) {
                                    event.preventDefault(); // 阻止整个页面拖动
                                }
                                //event.preventDefault(); // 阻止整个页面拖动
                                
                                var moveX = (touchX - event.targetTouches[0].pageX),
                                    moveY = (touchY - event.targetTouches[0].pageY);
                    
                                SELF.iframe.parentNode.scrollLeft += moveX;
                                SELF.iframe.parentNode.scrollTop  += moveY;
                                this.scrollLeft += moveX;
                                this.scrollTop += moveY;
                                ifrDoc.documentElement.scrollLeft += moveX;
                                ifrDoc.documentElement.scrollTop += moveY;
                            });
                            
                            ifrDoc.body.addEventListener("touchend", function(event) {
                                // alert($(this).css("height"));
                            });
                            
                            clearInterval(timer);
                        } catch(e) {
                            // alert("ERROR: "+[e.line,e.message,ifrDoc].join("; "));
                        }
                        
                        if (c<1) { clearInterval(timer); }
                        
                    }, t);
                }
            }
            
            SELF.unlock("loading");
            
            /**
            var _onload = function(event) {
                SELF.lock("loading", "...加载完成...");
                var iframe    = SELF.iframe,
                    idoc;
                try{
                    //idoc    = SELF.iframe.contentWindow.document;
                    //idoc.oncontextmenu = null;
                    //SELF.title(idoc.title);
                    
                    // 点击iframe区域时触发焦点事件
                    if (SELF.history.prohibited) {
                        SELF.history.prohibited = false;
                    }else{
                        SELF.history.add({url:iframe.contentWindow.document.location.href, method:"get", data:null});
                    }
                    
                    if (idoc.addEventListener) {
                        idoc.addEventListener ("click", function() { var s = SELF; s.focus(); s=null; });
                        idoc.addEventListener ("mousedown", function(event) { SELF.ui.trigger("click.hideContextmenu"); });
                    } else {
                        idoc.attachEvent("onclick", function() { var s = SELF; s.focus(); s=null; });
                        idoc.addEventListener ("onmousedown", function(event) { SELF.ui.trigger("click.hideContextmenu"); });
                    }
                    
                    // 右键菜单 *
                    $(idoc).bind({
                        
                        "click" : function() {
                            SELF.focus();
                        },
                        
                        "contextmenu" : function(event) {
                            
                            if (event.ctrlKey) return true;
                            
                            try{
                                var iframe = $(SELF.iframe),
                                    offset = iframe.offset(),
                                    top  = offset.top + event.pageY,
                                    left = offset.left + event.pageX;
                                
                                $(SELF.iframe).trigger("contextmenu", {top:top, left:left, ctrlKey:true});
                            }catch(e) {
                                
                            }finally{
                                iframe = iframe[0] = offset = top = left = null;
                            }
                            
                            return false;
                        },
                        
                        "mousedown" : function() {
                            
                            // 隐藏右键菜单
                            SELF.ui.trigger("click.hideContextmenu");
                            
                        }
                    });
                    //
                    idoc = null;
                }catch(e) {
                    SELF.unlock("loading");
                    if (idoc) idoc = null;
                }
                //SELF.triggerEvent("iframeLoad", iframe);
                SELF.unlock("loading");
                
                iframe = null;
            }
            
            var iframe = SELF.iframe;
            if (iframe.attachEvent) {
                iframe.attachEvent("onload", _onload);
            } else {
                iframe.onload = _onload;
            }
            // **
            
            var iframe = SELF.iframe;
            SELF.addEvent("close.clearIframe", function() {
                var iframe = SELF.iframe,
                    idoc;
                if (iframe.detachEvent) {
                    iframe.detachEvent("onload", _onload);
                } else {
                    iframe.onload = "";
                }
                iframe.src = null;
                
                try{
                    
                    try{
                        iframe.contentWindow.jQuery('*',iframe.contentWindow.document).each(function(i, e) {
                            (events = iframe.contentWindow.jQuery.data(this, 'events')) && iframe.contentWindow.jQuery.each(events, function(i, e1) {
                                iframe.contentWindow.jQuery(e).unbind(i + '.*');
                            });
                            try{
                                iframe.contentWindow.jQuery.event.remove(this);
                                iframe.contentWindow.jQuery.removeData(this);
                            }catch(e) {}
                        });
                        
                        for (var k in iframe.contentWindow) {
                            try {
                                delete iframe.contentWindow [k];
                            } catch (e) {}
                        }
                        
                    }catch(e) {
                        
                    }
                    
                    iframe.contentWindow.document.write("");
                    iframe.contentWindow.close();
                }catch(e) {
                    var s=e;
                }
                
                try {
                    idoc    = SELF.iframe.contentWindow.document;
                    $(idoc).unbind("click").unbind("contextmenu").unbind("mousedown").remove();
                    idoc = null;
                } catch (e) {
                    if (idoc) idoc = null;
                }
                
                iframe.parentNode.removeChild(iframe);
                
                delete SELF.iframe;
                iframe = null;
            });
            */
            
            SELF.addEvent("beforeClose.clearIframe", function() {
                var iframe = $(SELF.iframe).hide();
                try {
                    iframe[0].contentWindow.document.write("");
                    iframe[0].contentWindow.document.clear();
                } catch(e) {
                    
                }
                SELF.iframe.src = "about:blank";
                delete SELF.iframe.execute;
                delete SELF.iframe.trigger;
                iframe.remove();
                SELF.iframe = iframe = null;
            });
            
            // 从iframe内部调用方法
            SELF.iframe.execute = function(method) {
                var para = [];
                for (var i=1; i<arguments.length; i++) {
                    para.push(arguments[i]);
                }
                
                if (typeof method === 'function') {
                    method.apply(SELF, para);
                } else {
                    SELF[method].apply(SELF, para);
                }
                para = null;
            };

            /* 从插件内部iframe中触发事件;
             * 例:[iframe]window.frameElement.trigger(eventType);
             */
            SELF.iframe.trigger = function(eventType) {
                var para = [eventType];
                for(var i=1; i<arguments.length; i++) {
                    para.push(arguments[i]);
                }
                SELF.triggerEvent.apply (SELF, para);
                para = null;
            };
            //iframe = null;
        }

        // 加载内容
        if (options.homepage && options.autoLoad) {
            SELF.load(options.homepage, options.data?"post":"get", options.data);
        }
        
        /* 右键菜单 *
        SELF.ui.contextmenu({
            items : [
                "-", 
                {text:"前进", icon:"", click:function() {SELF.history.forward();}, disabled:function() {return true || SELF.history.isLast();}},
                {text:"后退", icon:"", click:function() {
                    var h=SELF.history; 
                    SELF.history.back();
                }, disabled:function() {return true || SELF.history.isFirst();}},
                {text:"刷新", icon:"", disabled:!!SELF.reload, click:function() {
                    SELF.reload && SELF.reload();
                }}
            ]
        });
        **/

        // 关闭窗口时清除工具栏的按钮
        SELF.addEvent ({
              "afterClose" : function () { SELF.tools.clear(); }
            , "destroy" : function () {
                try {
                    options = settings = defaults = toolbar = statebar = winbody = SELF = null;
                } catch (e) {}
            }
        });
        
        return SELF;
    };
}(tbc, jQuery));

/*
 * 兼容之前的版本
 * Author	 : 罗志华
 * Mail		 : mail@luozhihua.com
 * Copyright : 时代光华(2012-2015)
 */
 
 
/* 设置桌面背景 ********************************************/
$.fn.desktop = function( type, data ){
	switch(type){
		case "setBg":
			$.get(data.url, function(t){
				desktop.setBackground(t.url);
			});
			
			break;
		
		case "openwin":
			var __opt;
			for (var app in window.applicationMap) {
				
				var s=[window.applicationMap[app].appCode, data.appCode, window.applicationMap[app].applicationId, data.id];
				
				if ( window.applicationMap[app].appCode == data.appCode || window.applicationMap[app].applicationId == data.id ) {
					__opt = $.extend({}, window.applicationMap[app]);
				
					__opt.iframe = false ; //data.iframe;
					__opt.homePageUrl = data.url || __opt.homePageUrl;
					__opt.itemType = "APP";
				}
			}
			
			if (__opt) {
				tbc.system.open( __opt, null, true );
			}
			break;
		
		case "opennew":
			if (data.courseId) {
				$("body").attr("appPostId", data.courseId);
			}
			
			$.fn.desktop("openwin", data);
			
			break;
		
		default:
			
			break;
	}
	 
}

// 从iframe中打开新窗口
window.desktopWindow = function( id, param ){
	tbc.system.open(id, param);
}

window.desktopWindowWithUrl = function(appId, url){
	var win = tbc.system.open(appId);
		win.load(url);
}
// 初始化所有数据转换器
;(function(){

    "use strict";

    /**
     * 数据转换器
     * @class tbc.webdesk.data.translator
     * @static
     * @type {Object}
     */
    var tbc = window.tbc,
        translator = tbc.namespace('tbc.webdesk.data.translator');

    /**
     * 角色数据转换器
     * @property {tbc.Translator} role
     * @type {tbc.Translator}
     */
    translator.roles = new tbc.Translator({
        "type"          : "type", 
        "roleCode"      : "code",
        "roleId"        : "id",
        "roleName"      : "name",
        "currentRole"   : 'current',
        "comments"      : "comments",
        "corpCode"      : null,
        "overrideType"  : null,
        "overrideId"    : null,
        "showOrder"     : null,
        "createBy"      : null,
        "createTime"    : null,
        "lastModifyBy"  : null,
        "lastModifyTime": null,
        "optTime"       : null,
        "createByCode"  : null
    });

    /**
     * 自动运行列表转换器
     * @property {tbc.Translator} autoruns
     * @type {tbc.Translator}
     */
    translator.autoruns = new tbc.Translator({
        "appRoles"              : 'roles',
        "reminderUrl"           : 'remind',
        "lastAccessTimestamp"   : 'accessTime',
        "openType"              : 'openType',
        "itemType"              : 'type',
        "applicationId"         : 'appId',
        "corpCode"              : 'corpCode',
        "userDeskItemId"        : 'id',
        "userDeskId"            : 'deskId',
        "tooltips"              : 'tooltips',
        "userDeskItemName"      : 'name',
        "applicationName"       : 'appName',
        "windowInitialType"     : 'initialType',
        "autoRun"               : 'autorun',
        "applicationIconUrl"    : 'icon',
        "preferredWidth"        : 'width',
        "preferredHeight"       : 'height',
        "homePageUrl"           : 'url',
        "referType"             : 'referType',
        "userDeskPosition"      : null,
        "position"              : null,
        "folder"                : null,
        "folderItemList"        : null,
        "userDeskItemManager"   : null,
        "shortcutUrl"           : null,
        "shortcutIconUrl"       : null,
        "openShortcutType"      : null,
        "shortcutInitType"      : null,
        "folderId"              : null,
        "userDesk"              : null,
        "applicationMiniIconUrl": null,
        "widgetUrl"             : null,
        "applicationType"       : null,
        "positionInFolder"      : null,
        "application"           : null,
        "userDeskdockItemList"  : null,
        "corpUserDeskItemName"  : null,
        "shortcut"              : null,
        "dto"                   : null,
        "createBy"              : null,
        "createTime"            : null,
        "lastModifyBy"          : null,
        "lastModifyTime"        : null,
        "optTime"               : null,
        "formObject"            : null,
        "selectedInShowSelect"  : null
    });

    /**
     * 桌面图标列表转换器
     * @property {tbc.Translator} shortcuts
     * @type {tbc.Translator}
     */
    translator.shortcuts = new tbc.Translator({
        "appRoles"              : 'roles',
        "reminderUrl"           : 'remind',
        "lastAccessTimestamp"   : 'accessTime',
        "openType"              : 'openType',
        "itemType"              : 'type',
        "applicationId"         : 'appId',
        "userDeskItemId"        : "itemId",
        "tooltips"              : 'tooltips',
        "userDeskItemName"      : 'name',
        "windowInitialType"     : 'initialType',
        "autoRun"               : 'autorun',
        "applicationIconUrl"    : 'icon',
        "preferredWidth"        : 'width',
        "preferredHeight"       : 'height',
        "homePageUrl"           : 'url',
        "referType"             : 'referType',
        "applicationType"       : 'appType',
        "folderId"              : 'folderId',
        "autologin"             : 'autologin',
        "dto"                   : null,
        "userDeskPosition"      : null,
        "position"              : null,
        "corpCode"              : null,
        "userDeskId"            : null,
        "folder"                : null,
        "applicationName"       : null,
        "folderItemList"        : null,
        "userDeskItemManager"   : null,
        "shortcutUrl"           : null,
        "shortcutIconUrl"       : null,
        "openShortcutType"      : null,
        "shortcutInitType"      : null,
        "userDesk"              : null,
        "applicationMiniIconUrl": null,
        "widgetUrl"             : null,
        "positionInFolder"      : null,
        "application"           : null,
        "userDeskdockItemList"  : null,
        "corpUserDeskItemName"  : null,
        "shortcut"              : null,
        "createBy"              : null,
        "createTime"            : null,
        "lastModifyBy"          : null,
        "lastModifyTime"        : null,
        "optTime"               : null,
        "formObject"            : null,
        "selectedInShowSelect"  : null
    });

    /**
     * 应用列表转换器
     * @property {tbc.Translator} apps
     * @type {tbc.Translator}
     */
    translator.apps = new tbc.Translator({
        "description"             : 'des',
        "openType"                : "openType",
        "itemType"                : "itemType",
        "applicationId"           : "appId",
        "applicationName"         : 'name',
        "windowInitialType"       : 'initialType',
        "targetUserDeskType"      : 'targetDeskType',
        "appCode"                 : 'appCode',
        "autoRun"                 : 'autoRun',
        "autoRunOnce"             : 'autorunOnce',
        "applicationIconUrl"      : 'icon',
        "preferredWidth"          : 'width',
        "preferredHeight"         : 'height',
        "homePageUrl"             : 'url',
        "applicationType"         : 'appType',
        "needInit"                : 'isAutoLogin',
        "applicationCategoryId"   : 'categoryId',
        "maximizable"             : 'max',
        "minimizable"             : 'min',
        "templateBasePath"        : 'basePath',
        "applicationCategoryName" : 'categoryName',
        "autologin"               : 'autologin',
        "reminderUrl"             : null,
        "corpCode"                : null,
        "applicationMiniIconUrl"  : null,
        "tooltipsSuffix"          : null,
        "projectId"               : null,
        "sinceProjectVersion"     : null,
        "appStatus"               : null,
        "resourceAccessUrl"       : null,
        "projectName"             : null,
        "initCorpDataUrl"         : null,
        "useWF"                   : null,
        "useIM"                   : null,
        "useJM"                   : null,
        "useIS"                   : null,
        "resourceAccessApp"       : null,
        "createBy"                : null,
        "createTime"              : null,
        "lastModifyBy"            : null,
        "lastModifyTime"          : null,
        "optTime"                 : null,
        "createByCode"            : null
    });

    translator.tools = translator.shortcuts;

    tbc.webdesk.data.settings = {};
    tbc.webdesk.data.shortcuts = [];
    tbc.webdesk.data.autoruns = [];
    tbc.webdesk.data.tools = [];
    tbc.webdesk.data.trays = [];
    tbc.webdesk.data.apps = {};

    /**
     * 转换应用数据的子属性
     * @property {Function} apps.valueTranslator
     * @param {String} key 子属性名称
     * @param {Any} value 子属性值
     * @param {String} which 转换成那种数据格式："fresh" | "antique";
     */
    translator.apps.valueTranslator = 

    /**
     * 转换应用数据的子属性
     * @property {Function} autoruns.valueTranslator
     * @param {String} key 子属性名称
     * @param {Any} value 子属性值
     * @param {String} which 转换成那种数据格式："fresh" | "antique";
     */
    translator.autoruns.valueTranslator = 

    /**
     * 转换应用数据的子属性
     * @property {Function} shortcuts.valueTranslator
     * @param {String} key 子属性名称
     * @param {Any} value 子属性值
     * @param {String} which 转换成那种数据格式："fresh" | "antique";
     */
    translator.shortcuts.valueTranslator = function(key, value, which) {
        switch (key) {
            case 'appRoles':
            case 'roles':
                return translator.roles.transformList(value, which);

            // no default
        }
        return value;
    };

}) ();


jQuery.ajaxSetup({
    data : {"_ajax_toKen":"elos"}
});

jQuery(function($){
    
    "use strict";
    
    var v,p,c,w,
        tbc = window.tbc,
        desktop;
        
        // AJAX默认设置
        $.ajaxSetup({
           data    : {'_ajax_toKen':'os'  },
           cache: false,
           error: function( jqXHR, textStatus, errorThrown ){
              //$.loading('close');
                
            /**
            var rl = new tbc.Panel({
                    name : "登录超时或者在其他地点登录",
                    width: 400,
                    height: 240
                }).show().appendTo("body"),
                
                dl = new tbc.Button({ text:"重新登录", icon:"", click:function(){ tbc.system.logout(); }}).depend(rl).appendTo(rl)
                    .ui.css({margin:"1em"});
              */
            
              if (jqXHR.status === 403) {
                  try {
                      window.tbc.system.logout();
                  } catch(e) {
                      
                  }
                  //sendRedirect(true);
              }
              
              /*
              if (jqXHR.status === 404) {
                 
                 // $.msgN('您无法访问该页面');
              }
              
              if (jqXHR.status === 410) {
                  //$.cookie("eln_session_id",null,{domain:'${cookie_domain!}',path:"/"});
                 // $.msgN('您无权访问该页面');
              }
              */
             
              if (jqXHR.status === 411) {
                  window.onbeforeunload=function(){};
                  try {
                      window.tbc.system.logout();
                  } catch(err) {
                      
                  }
                  return;
              }
           }
      });
    
    /* 每3分钟发起AJAX请求: 使页面始终处于活动状态 */
    setInterval(function(){
        $.ajax({
            url        : '/uc/html/loginLog.updateLogout.do',
            type    : 'post',
            success    : function(){}
        });
    }, 1000*60*3);
    
    // 拖动顶部分屏按钮  
    $(".tbc-desktop-nav")
    .drag({
        shandle : ".tbc-desktop-nav-handle",
        area    : {top:6, left:0, right:"95%", bottom:38},
        areaMargin : {top:0, left:0, right:"0", bottom:0},
        timeout : 100,
        event   : {
            dragStart : function(){
                tbc.lock("body", {backgroundColor:"#fff", opacity:0.001, zIndex:9999999999, cursor:"move"});
            },
            dragEnd : function() {
                tbc.unlock("body");
            }
        }
    })
    .on('click', '.s_add-scene', function() {
        desktop.manager.addDesktop();
    })
    .contextmenu({
        items : [
            { text : "添加桌面", disabled:0, inheritable:true, click:function() {
                desktop.manager.addDesktop();
            }}
        ]
    });
    
    // 触摸屏
    if (tbc.touchable) {
        document.body.addEventListener( "touchmove", function(event) {
            event.preventDefault();
            return false;
        } );
    }
    
    $(".tbc-taskbar").appendTo("body");
    window.taskbar = new tbc.Taskbar({
        container    : ".tbc-task-container",
        toPrev        : ".tbc-scroll-arrow-toPrev",
        toNext        : ".tbc-scroll-arrow-toNext"
    });
    
    window.quickLaunch = new tbc.QuickLaunch({});
    window.apptray = new tbc.AppTray();
    
    // 显示桌面 
    window.quickLaunch.append({
        guid : "showdesktop",
        icon    : "icon-view_thumbnail",
        title    : "显示桌面",
        click    : function(){
            window.desktop.minAll();
        }
    });
    
    // 创建桌面实例
    desktop = window.desktop = new tbc.Desktop({
          container : ".tbc-tabset"
        , header    : ".tbc-desktop-nav-list"
        , effects   : "slide-x"      // [fade, slide-x, slide-y]
        , easing    : "swing" 
        , speed     : 300
        , prevHandle : ".tbc-tabset-prev"
        , nextHandle : ".tbc-tabset-next"
    });
    
    // 创建开始菜单实例
    // window.desktop.loadScene();
    window.startmenu = new tbc.Start();
    
    /** 浏览器判断 **/
    (function(){
        
        var Sys = {},
            browserType;
        
        // 判断浏览器
        (function testBrowser() {
            
            var ua = navigator.userAgent.toLowerCase(),
                regexps = {
                    ie      : /msie ([\d.]+)/,
                    firefox : /firefox\/([\d.]+)/,
                    chrome  : /chrome\/([\d.]+)/,
                    opera   : /opera\/([\d.]+)/,
                    safari  : /version\/([\d.]+) *safari/
                },
                version, b;
                
            for (b in regexps) {
                if (regexps.hasOwnProperty(b)) {
                    version = ua.match(regexps[b]);
                    Sys[b] = version ? parseFloat(version[1]) : 0;
                }
            }
        }());
        
        /*
        (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] : 
        (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] : 
        (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] : 
        (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
        (s = ua.match(/version\/([\d.]+)\.*safari/)) ? Sys.safari = s[1] : 0;
        */
        
        if (Sys.ie) {browserType='IE ' + Sys.ie;}
        else if (Sys.firefox) {browserType='Firefox ' + Sys.firefox;}
        else if (Sys.chrome) {browserType='Chrome ' + Sys.chrome;}
        else if (Sys.opera) {browserType='Opera ' + Sys.opera;}
        else if (Sys.safari) {browserType='Safari ' + Sys.safari;}
        else {browserType = '未知浏览器';}
        
        if (Sys.firefox>=8 || Sys.ie>=7 || Sys.chrome>=12 || Sys.opera>=8 || Sys.safari>=3) {
            window.onbeforeunload = function(e) {
                e = e || window.event;
                var msg = e.returnValue = '退出后,您正在观看的课程进度将不会被记录,确定要退出吗?';
                return msg;
            };
            window.desktop.loadScene();
        } else {
            /** 这是新的提示框(未测试,暂不启用)
            tbc.dialog(
                '<div class="dialog-msg" style="padding:2em;">您现在使用的浏览器是<b class="truered">'+browserType+'</b>,可能会造成部分功能体验不好,是否继续访问?<br /><b style="color:#06f">(建议使用IE7.0以上、Firefox8.0以上、Chrome12.0以上、Safari3.0以上版本的浏览器)</b></div>',
                {
                    name : "您的浏览器版本不满足要求",
                    width : 500,
                    height : 240,
                    buttons : {
                        "继续访问" : function(){
                            window.onbeforeunload=function( e ){
                                return (e || window.event).returnValue = '退出后,您正在观看的课程进度将不会被记录,确定要退出吗?';
                            }
                            this.close(); 
                        },
                        "退出登录" : function(){
                            tbc.system.logout();
                            this.close();
                        }
                    }
                }
            )
            .addEvent({
                "close": function(){ window.desktop.loadScene(); }
            });
            */
            
            p = new tbc.Panel({
                name    : "您的浏览器版本不满足要求!",
                width    : 500,
                height    : 240
            })
            .addEvent({ "close": function(){ window.desktop.loadScene(); } })
            .show().icon("icon-warning_triangle").appendTo("body");
            
            p.html('<div class="dialog-msg" style="padding:2em;">您现在使用的浏览器是<b class="truered">'+browserType+'</b>,可能会造成部分功能体验不好,是否继续访问?<br /><b style="color:#06f">(建议使用IE7.0以上、Firefox8.0以上、Chrome12.0以上、Safari3.0、Opera3.0以上版本的浏览器)</b></div>');
            
            v = new tbc.Button({text:"继续访问", icon:"icon-arrow_medium_right", click:function(){
                        
                        window.onbeforeunload = function(e) {
                            e = e || window.event;
                            var msg = e.returnValue = '退出后,您正在观看的课程进度将不会被记录,确定要退出吗?';
                            return msg;
                        };
                        
                         p.close(); 
                    }});
            c = new tbc.Button({text:"退出登录", icon:"icon-warning_triangle_small", click:function(){ tbc.system.logout(); }});
            w = $("<div></div>").css({textAlign:"center", margin:"12px auto"});
            
            v.appendTo(w).ui.css({marginRight:"10px"});
            c.appendTo(w);
            w.appendTo(p.container);
        }
    }());
        
    /* 结束:浏览器判断 */
    
    $("body").contextmenu({items:[
          {
              text:"显示桌面",
              icon:"icon-view_thumbnail",
              click:function(){ window.desktop.minAll(); },
              inheritable:true
          },
          {
              text:"退出",
              icon:"icon-gem_remove",
              click:function(){
                    tbc.system.logout( true );
                },
              inheritable:true
          }
    ]});
    

    /* Start 背景音乐 *****************************************************
    //<bs>
    
        
        soundManager.setup({
              useFlashBlock    : true,
              url            : '/sound/swf/', // path to SoundManager2 SWF files (note trailing slash)
              debugMode        : true,
              consoleOnly    : false
        });
        
        soundManager.onready(function(oStatus) {
            if (!oStatus.success) {
                return false;    
            }
            // soundManager is initialised, ready to use. Create a sound for this demo page.
            
            tbc.bgsound = soundManager.createSound({
                id  : 'backgroundSound',
                url : '/sound/mp3/anxiang.mp3'
            });
            
            function loop( num ){
                tbc.bgsound.play({
                    onfinish:function(){
                        num = num===0?0:(num>1?num-=1:1);
                        if(num==0 || num>1){
                            loop( num );
                        }else{
                            tbc.bgsound.play({
                                onfinish:function(){ tbc.bgsound.isPlaying = false; tbc.bgsound.isStoped = true; }
                            });
                        }
                    }
                });
            }
            loop(1);
            tbc.bgsound.isPlaying = true;
            
            // 右键菜单 **
            $("body").contextmenu({
                before    : true,
                items : [
                    {
                          text: function(){return tbc.bgsound.isPlaying ? "停止背景音乐" : "播放背景音乐"; }
                        , icon:function(){ return tbc.bgsound.isPlaying ? "icon-media_controls_dark_pause" : "icon-media_controls_dark_play"; }
                        , inheritable : true
                        , click:function(){
                            if(tbc.bgsound.isPlaying){
                                tbc.bgsound.pause();
                                tbc.bgsound.isPlaying = false;
                            }else{
                                if(tbc.bgsound.isStoped==true){
                                    loop(0);
                                    tbc.bgsound.isStoped = false;
                                }else{
                                    tbc.bgsound.resume();
                                    tbc.bgsound.isPlaying = true;
                                }
                            }
                        }
                    }
                ]
            });
            
        });
        
        var t = null;
        
    //</bs>
    
    
    // End 背景音乐 ********************************************************/

    
    window.ICONS = function() {
        window.aaabbb = new tbc.Window({name:"小图标和按钮",minimizable:true,  maximizable:true,width:500,height:320,left:"auto", top:"auto",loadType:"html"})
        .append($('.icons-demo').css({display:"block",width:"100%",height:"100%",overflow:"auto"})).appendTo($('body')).show()
        .addEvent("close", function(){
            this.fling().lock("lock","被锁定,不能关闭!");
            var t = this;
            setTimeout(function(){ t.unlock("lock"); t=null; },2000);
            //return false;
        });
    };
    
});
