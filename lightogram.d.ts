/**
 * Creates a Bridge based on the given data.
 * @param {HueBridgeConfigurationRead} bridgeData The bridge's data.
 * @param {string} appName                        The name of the app.
 * @param {string} deviceName                     A name of the device the app is run on.
 *
 */
declare class Bridge {
   /**
    * Creates a Bridge based on the given data.
    * @param {HueBridgeConfigurationRead} bridgeData The bridge's data.
    * @param {string} appName                        The name of the app.
    * @param {string} deviceName                     A name of the device the app is run on.
    *
    */
   constructor(bridgeData: HueBridgeConfigurationRead, appName: string, deviceName: string);

   /**
    * Finds the given bridge.
    * @returns {Promise}
    */
   findBridge(): Promise;

   /**
    * Performs an API call.
    * @param {string} action     An HTTP action.
    * @param {string} [endpoint] The bridge-specific endpoint.
    * @param {Object} [data]     The data to send in the request body.
    * @returns {Promise<*>}
    */
   doApiCall(action: string, endpoint?: string, data?: Object): Promise<any>;

   /**
    * Constructs an endpoint URL.
    * @param {string} endpoint The endpoint.
    * @private
    * @returns {string} The full URL.
    */
   private _constructEndpointUrl(endpoint: string): string;

   /**
    * Gets the IP address of the bridge.
    * @returns {Promise<string>}
    */
   getIpAddress(): Promise<string>;

   /**
    * Gets the username of the bridge.
    * @returns {Promise<string>}
    */
   getUsername(): Promise<string>;

   /**
    * Gets the bridge's configuration.
    * @param {boolean} [forceRefresh] If true, forces a refresh of the cached data.
    * @returns {Promise}
    */
   getConfig(forceRefresh?: boolean): Promise;

   /**
    * Gets the name of the bridge.
    * @returns {Promise}
    */
   getName(): Promise;

   /**
    * Retrieves the Light object given the ID.
    * @param {*} lightId The light's ID.
    * @returns {Light}
    */
   light(lightId: any): Light;

   /**
    * Sets the state of a light.
    * @deprecated Use the light's methods instead.
    * @param {*} lightId
    * @param {*} state
    * @returns {*}
    */
   setLightState(lightId: any, state: any): any;

   /**
    * Revokes the authorization of a given username.
    * @param username
    * @returns {Promise}
    */
   removeAuthorization(username: any): Promise;

   /**
    * Periodically queries the bridge to ask for authorization.
    * @returns {Promise} Resolved when the authorization is approved, or rejected if 60 seconds have passed with no authorization.
    */
   waitForAuthorization(): Promise;

   /**
    * Polls the bridge to authorize the app.
    * @returns {Promise} Resolves with the result of the single request.
    */
   authorize(): Promise;

   /**
    * Discovers bridges on the local network using Hue's uPNP endpoint.
    * @returns {Promise<Array<{HueBridgeConfigurationRead}>>} An array of Hue bridge _configurations_. It's up to you
    * to create the Bridge objects.
    */
   static discoverBridges(): Promise<{HueBridgeConfigurationRead}[]>;

}

/**
 *
 * @param {Bridge} bridge    The bridge that serves this light.
 * @param {string} lightId   The light's ID on the bridge.
 * @param {Object} lightData The response for this particular light from the lights endpoint.
 */
declare class Light {
   /**
    *
    * @param {Bridge} bridge    The bridge that serves this light.
    * @param {string} lightId   The light's ID on the bridge.
    * @param {Object} lightData The response for this particular light from the lights endpoint.
    */
   constructor(bridge: Bridge, lightId: string, lightData: Object);

   /**
    * Performs an API call.
    * @param {string} action     An HTTP action.
    * @param {string} [endpoint] The light-specific endpoint. (Comes after lights/{lightId})
    * @param {Object} [data]     The data to send in the request body.
    *
    * @returns {Promise<*>}
    */
   doApiCall(action: string, endpoint?: string, data?: Object): Promise<any>;

   /**
    * Gets the state of the light.
    * @returns {Promise<HueLightStateRead>}
    */
   getState(): Promise<HueLightStateRead>;

   /**
    * Sets the state of the light.
    * @param {HueLightStateSet} state The new state of the light.
    * @param {number}           [time] Transition time in milliseconds.
    * @returns {*}
    */
   setState(state: HueLightStateSet, time?: number): any;

   /**
    * Sets the On state of the light.
    * @param {boolean} on     Whether to turn the light on (true) or off (false).
    * @param {number}  [time] Transition time in milliseconds.
    * @returns {*}
    */
   setOn(on: boolean, time?: number): any;

   /**
    * Sets the color of the light based on RGB values.
    * @param {number} red    The red value, from 0 to 255.
    * @param {number} green  The green value, from 0 to 255.
    * @param {number} blue   The blue value, from 0 to 255.
    * @param {number} [time] Transition time in milliseconds.
    * @returns {*}
    */
   setColorRgb(red: number, green: number, blue: number, time?: number): any;

   /**
    * Sets the color of the light based on a CSS-style hex code.
    * @param {string} hex    The CSS-style hex code.
    * @param {number} [time] Transition time in milliseconds.
    * @returns {*}
    */
   setColorHex(hex: string, time?: number): any;

   /**
    * Sets the color of the light based on a HueColor object.
    * @param {HueColor} color The color to set the light to.
    * @param {number} [time]  Transition time in milliseconds.
    * @returns {*}
    */
   setColor(color: {}, time?: number): any;

   /**
    * Sets the color of the light based on an HSB value.
    * @param {number} hue        The hue angle, from 0 to 65535.
    * @param {number} saturation The saturation, from 0 to 254.
    * @param {number} brightness The brightness, from 1 to 254.
    * @param {number} [time]     Transition time in milliseconds.
    * @returns {*}
    */
   setColorHsb(hue: number, saturation: number, brightness: number, time?: number): any;

   /**
    * Sets the color temperature.
    * @param {number} temperature The new color temperature, from 153 to 500.
    * @param {number} [time]      Transition time in milliseconds.
    * @returns {*}
    */
   setColorTemperature(temperature: number, time?: number): any;

   /**
    * Sets the brightness.
    * @param {number} brightness The new brightness, from 1 to 254.
    * @param {number} [time]     Transition time in milliseconds.
    * @returns {*}
    */
   setBrightness(brightness: number, time?: number): any;

   /**
    * Gets the color of the light in RGB.
    * @returns {Promise<{red:{number},green:{number},blue:{number}}>}
    */
   getColorRgb(): Promise<{red: {number}, green: {number}, blue: {number}}>;

   /**
    * Gets the color of the light in hex.
    * @returns {Promise<string>}
    */
   getColorHex(): Promise<string>;

}
