import Ajax from '../util/ajax';
import Light from './Light';

export default class Bridge {

	/**
	 * Creates a Bridge based on the given data.
	 * @param {HueBridgeConfigurationRead} bridgeData
	 */
	constructor( bridgeData ) {
		this.id = bridgeData.id;
		this.ipAddress = bridgeData.internalipaddress;
		this.username = bridgeData.username || '';

		if ( ! this.ipAddress ) {
			this.findBridge();
		}
	}

	/**
	 * Finds the given bridge.
	 * @returns {Promise}
	 */
	findBridge() {
		return new Promise( ( resolve, reject ) => {
			Bridge.discoverBridges().then( ( discoveredBridges ) => {
				if ( discoveredBridges.hasOwnProperty( this.id ) ) {
					this.ipAddress = discoveredBridges[this.id].ipAddress;
					resolve( this.ipAddress );
				} else {
					reject();
					throw new Error( 'Bridge Not Found: ' + this.id );
				}
			} );
		} );
	}

	/**
	 * Performs an API call.
	 * @param {string} action     An HTTP action.
	 * @param {string} [endpoint] The bridge-specific endpoint.
	 * @param {Object} [data]     The data to send in the request body.
	 * @returns {Promise.<*>}
	 */
	doApiCall( action, endpoint, data ) {
		return new Promise( ( resolve, reject ) => {
			this.getIpAddress().then( function () {
				var endpointUrl = this._constructEndpointUrl( endpoint );
				Ajax.performJSON( action, endpointUrl, data, ( result ) => {
					var parsedResult;
					if ( Array.isArray( result ) ) {
						parsedResult = result[0];
					} else {
						parsedResult = result;
					}
					if ( undefined === parsedResult || parsedResult.hasOwnProperty( 'error' ) ) {
						reject( parsedResult );
					} else {
						resolve( parsedResult );
					}
				} );
			} );
		} );
	}

	/**
	 * Constructs an endpoint URL.
	 * @param {string} endpoint The endpoint.
	 * @private
	 * @returns {string} The full URL.
	 */
	_constructEndpointUrl( endpoint ) {
		var pathComponents = ['api', this.username, endpoint];
		var path = pathComponents.filter( n => '' !== n ).join( '/' );

		return `http://${this.ipAddress}/${path}`;
	}

	/**
	 * Gets the IP address of the bridge.
	 * @returns {Promise.<string>}
	 */
	getIpAddress() {
		return new Promise( ( resolve, reject ) => {
			if ( this.ipAddress ) {
				resolve( this.ipAddress );
			} else {
				this.findBridge().then( resolve, reject );
			}
		} );
	}

	serialize() {
		return {
			id: this.id,
			username: this.username
		};
	}

	/**
	 * Gets the username of the bridge.
	 * @returns {Promise.<string>}
	 */
	getUsername() {
		return Promise.resolve( this.username );
	}

	/**
	 * Gets the bridge's configuration.
	 * @param {boolean} [forceRefresh] If true, forces a refresh of the cached data.
	 * @returns {Promise}
	 */
	getConfig( forceRefresh ) {
		return new Promise( ( resolve ) => {
			if ( ! forceRefresh && this.config ) {
				resolve( this.config );
			} else {
				this.doApiCall( 'GET', 'config' ).then( ( config ) => {
					this.config = config;
					resolve( this.config );
				} );
			}
		} );
	}

	/**
	 * Gets the name of the bridge.
	 * @returns {Promise}
	 */
	getName() {
		return new Promise( ( resolve, reject ) => {
			this.getConfig().then( function ( config ) {
				resolve( config.name );
			}, reject );
		} );
	}

	getLights() {
		return new Promise( ( resolve, reject ) => {
			if ( this.lights ) {
				resolve( this.lights );
			} else {
				this.doApiCall( 'GET', 'lights' ).then( ( lights ) => {
					this.lights = Object.keys( lights ).map( ( lightId ) => {
						var lightData = lights[lightId];
						return new Light( this, lightId, lightData );
					} );
					resolve( this.lights );
				} );
			}
		} );
	}

	/**
	 * Retrieves the Light object given the ID.
	 * @param {*} lightId The light's ID.
	 * @returns {Light}
	 */
	light( lightId ) {
		return this.lights.find( light => (light.lightId.toString() === lightId.toString()) );
	}

	/**
	 * Sets the state of a light.
	 * @deprecated Use the light's methods instead.
	 * @param {*} lightId
	 * @param {*} state
	 * @returns {*}
	 */
	setLightState( lightId, state ) {
		var light = this.lights.find( light => (light.lightId.toString() === lightId.toString()) );
		if ( undefined !== light ) {
			return light.setState( state );
		} else {
			console.error( 'cannot find light', lightId, this.lights );
			return Promise.reject();
		}
	}

	/**
	 * Revokes the authorization of a given username.
	 * @param username
	 * @returns {Promise}
	 */
	removeAuthorization( username ) {
		return new Promise( ( resolve, reject ) => {
			Ajax.deleteJSON( this._constructEndpointUrl( `config/whitelist/${username}` ), ( result ) => {
				resolve( result );
			} );
		} );
	}

	/**
	 * Periodically queries the bridge to ask for authorization.
	 * @returns {Promise} Resolved when the authorization is approved, or rejected if 60 seconds have passed with no authorization.
	 */
	waitForAuthorization() {
		return new Promise( ( resolve, reject ) => {
			if ( this.username ) {
				resolve();
			} else {
				var count = 0;

				var authorizationInterval = setInterval( () => {
					count ++;
					if ( count > 60 ) {
						clearInterval( authorizationInterval );
						reject();
					}
					this.authorize().then( ( result ) => {
						if ( result.success ) {
							clearInterval( authorizationInterval );
							resolve();
						}
					} );
				}, 1000 );
			}
		} );
	}

	/**
	 * Polls the bridge to authorize the app.
	 * @returns {Promise} Resolves with the result of the single request.
	 */
	authorize() {
		return new Promise( ( resolve ) => {
			var body = {
				devicetype: 'lightboard#webapp'
			};
			Ajax.postJSON( this._constructEndpointUrl( '' ), JSON.stringify( body ), ( data ) => {
				var firstItem = data[0];
				if ( firstItem.error ) {
					if ( 101 !== firstItem.error.type ) {
						throw new Error( 'Authorization error: ' + firstItem.error );
					}
				} else if ( firstItem.success ) {
					this.username = firstItem.success.username;
				}
				resolve( firstItem );
			} );
		} );
	}

	/**
	 * Discovers bridges on the local network using Hue's uPNP endpoint.
	 * @returns {Promise.<Array<Bridge>>}
	 */
	static discoverBridges() {
		return new Promise( ( resolve ) => {
			Ajax.getJSON( 'https://www.meethue.com/api/nupnp', ( data ) => {
				var bridges = {};

				data.forEach( function ( bridgeData ) {
					bridges[bridgeData.id] = new Bridge( bridgeData );
				} );

				resolve( bridges );
			} );
		} );
	}

}
