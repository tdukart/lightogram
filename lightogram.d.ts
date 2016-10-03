/**
 * Creates a Bridge based on the given data.
 * @param {HueBridgeConfigurationRead} bridgeData The bridge's data.
 * @param {string} appName                        The name of the app.
 * @param {string} deviceName                     A name of the device the app is run on.
 *
 */
declare class LightogramBridge {
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
}

interface LightogramBridgeStatic {
    new(bridgeData: HueBridgeConfigurationRead, appName: string, deviceName: string): LightogramBridge;
    discoverBridges(): Promise<{HueBridgeConfigurationRead}[]>;
}


interface LightogramLight {
    constructor(bridge: Bridge, lightId: string, lightData: Object);

    doApiCall(action: string, endpoint?: string, data?: Object): Promise<any>;

    getState(): Promise<HueLightStateRead>;

    setState(state: HueLightStateSet, time?: number): any;

    setOn(on: boolean, time?: number): any;

    setColorRgb(red: number, green: number, blue: number, time?: number): any;

    setColorHex(hex: string, time?: number): any;

    setColor(color: {}, time?: number): any;

    setColorHsb(hue: number, saturation: number, brightness: number, time?: number): any;

    setColorTemperature(temperature: number, time?: number): any;

    setBrightness(brightness: number, time?: number): any;

    getColorRgb(): Promise<{red: {number}, green: {number}, blue: {number}}>;

    getColorHex(): Promise<string>;

}

interface LightogramLightStatic {
    new(bridge: Bridge, lightId: string, lightData: Object): LightogramLight
}

declare module "lightogram" {
    export let Bridge: LightogramBridgeStatic;
    export let Light: LightogramLightStatic;
}