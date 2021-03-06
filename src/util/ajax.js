export default class Ajax {
	static getJSON( url, callback ) {
		this.performJSON( 'GET', url, null, callback );
	}

	static postJSON( url, body, callback ) {
		this.performJSON( 'POST', url, body, callback );
	}

	static deleteJSON( url, callback ) {
		this.performJSON( 'DELETE', url, null, callback );
	}

	static performJSON( action, url, body, callback ) {
		if ( null !== body && 'string' !== typeof body ) {
			body = JSON.stringify( body );
		}
		let xhr = new XMLHttpRequest();
		xhr.onload = function () {
			var result = JSON.parse( this.responseText );
			callback( null, result );
		};
		xhr.onerror = function ( error ) {
			callback( error );
		};
		xhr.open( action, url, true );
		xhr.send( body );
	}
}
