import HueColor from 'hue-colors';

export default class Light {
	/**
	 *
	 * @param {Bridge} bridge    The bridge that serves this light.
	 * @param {string} lightId   The light's ID on the bridge.
	 * @param {Object} lightData The response for this particular light from the lights endpoint.
	 */
	constructor( bridge, lightId, lightData ) {
		this.bridge = bridge;
		this.lightId = lightId;

		this.type = lightData.type;
		this.name = lightData.name;
	}

	/**
	 * Performs an API call.
	 * @param {string} action     An HTTP action.
	 * @param {string} [endpoint] The light-specific endpoint. (Comes after lights/{lightId})
	 * @param {Object} [data]     The data to send in the request body.
	 *
	 * @returns {Promise<*>}
	 */
	doApiCall( action, endpoint, data ) {
		var bridgeEndpoint = `lights/${this.lightId}`;
		if ( endpoint ) {
			bridgeEndpoint += `/${endpoint}`;
		}

		return this.bridge.doApiCall( action, bridgeEndpoint, data );
	}

	/**
	 * Gets the state of the light.
	 * @returns {Promise<HueLightStateRead>}
	 */
	getState() {
		return new Promise( ( resolve, reject ) => {
			this.doApiCall( 'GET' ).then( ( lightData ) => {
				this.name = lightData.name; // The name of the light is editable, so while we're here, refresh the data.
				resolve( lightData.state );
			} );
		} );
	}

	/**
	 * Sets the state of the light.
	 * @param {HueLightStateSet} state The new state of the light.
	 * @param {number}           [time] Transition time in milliseconds.
	 * @returns {*}
	 */
	setState( state, time ) {
		var body = state;
		if ( time ) {
			body.transitionTime = Math.floor( time / 100 );
		}
		return this.doApiCall( 'PUT', 'state', body );
	}

	/**
	 * Sets the On state of the light.
	 * @param {boolean} on     Whether to turn the light on (true) or off (false).
	 * @param {number}  [time] Transition time in milliseconds.
	 * @returns {*}
	 */
	setOn( on, time ) {
		return this.setState( {on: on}, time );
	}

	/**
	 * Sets the color of the light based on RGB values.
	 * @param {number} red    The red value, from 0 to 255.
	 * @param {number} green  The green value, from 0 to 255.
	 * @param {number} blue   The blue value, from 0 to 255.
	 * @param {number} [time] Transition time in milliseconds.
	 * @returns {*}
	 */
	setColorRgb( red, green, blue, time ) {
		var color = HueColor.fromRgb( red, green, blue );
		return this.setColor( color, time );
	}

	/**
	 * Sets the color of the light based on a CSS-style hex code.
	 * @param {string} hex    The CSS-style hex code.
	 * @param {number} [time] Transition time in milliseconds.
	 * @returns {*}
	 */
	setColorHex( hex, time ) {
		var color = HueColor.fromHex( hex );
		return this.setColor( color, time );
	}

	/**
	 * Sets the color of the light based on a HueColor object.
	 * @param {HueColor} color The color to set the light to.
	 * @param {number} [time]  Transition time in milliseconds.
	 * @returns {*}
	 */
	setColor( color, time ) {
		var cie = color.toCie();
		return this.setState( {
			xy: [cie[0], cie[1]],
			bri: cie[2]
		}, time );
	}

	/**
	 * Sets the color of the light based on an HSB value.
	 * @param {number} hue        The hue angle, from 0 to 65535.
	 * @param {number} saturation The saturation, from 0 to 254.
	 * @param {number} brightness The brightness, from 1 to 254.
	 * @param {number} [time]     Transition time in milliseconds.
	 * @returns {*}
	 */
	setColorHsb( hue, saturation, brightness, time ) {
		return this.setState( {
			hue: hue,
			sat: saturation,
			bri: brightness
		}, time );
	}

	/**
	 * Sets the color temperature.
	 * @param {number} temperature The new color temperature, from 153 to 500.
	 * @param {number} [time]      Transition time in milliseconds.
	 * @returns {*}
	 */
	setColorTemperature( temperature, time ) {
		return this.setState( {ct: temperature}, time );
	}

	/**
	 * Sets the brightness.
	 * @param {number} brightness The new brightness, from 1 to 254.
	 * @param {number} [time]     Transition time in milliseconds.
	 * @returns {*}
	 */
	setBrightness( brightness, time ) {
		return this.setState( {bri: parseInt( brightness )}, time );
	}

	/**
	 * Gets the color of the light in RGB.
	 * @returns {Promise.<{red:{number},green:{number},blue:{number}}>}
	 */
	getColorRgb() {
		return this.getState().then( ( state ) => {
			var color = HueColor.fromCIE( state.xy[0], state.xy[1], state.bri );
			return color.toRgb();
		} );
	}

	/**
	 * Gets the color of the light in hex.
	 * @returns {Promise.<string>}
	 */
	getColorHex() {
		return this.getState().then( ( state ) => {
			var color = HueColor.fromCIE( state.xy[0], state.xy[1], state.bri );
			return color.toHex();
		} );
	}

	isFullColor() {

	}

	toJSON() {
		return {
			lightId: this.lightId,
			type: this.type,
			name: this.name
		};
	}
}
