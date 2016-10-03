interface HueLightStateRead {
    on:boolean,
    bri?:number,
    hue?:number,
    sat?:number,
    xy?:[number,number],
    ct?:number,
    alert?:"none"|"select"|"lselect",
    effect?:"none"|"colorloop",
    colormode?:"hs"|"xy"|"ct",
    reachable:boolean
}

interface HueLightStateSet {
    on?:boolean,
    bri?:number,
    hue?:number,
    sat?:number,
    xy?:[number,number],
    ct?:number,
    alert?:"none"|"select"|"lselect",
    effect?:"none"|"colorloop"
    transitiontime?:number,
    bri_inc?:number,
    sat_inc?:number,
    hue_inc?:number,
    ct_inc?:number,
    xy_inc?:number
}

interface HueBridgeConfigurationRead {
    name:string,
    swupdate:Object,
    whitelist:{[id:string]:{'last use date':string, 'create date':string, 'name':string}},
    apiversion:string,
    swversion:string,
    proxyaddress:string,
    proxyport:number,
    linkbutton:boolean,
    ipaddress:string,
    mac:string,
    netmask:string,
    gateway:string,
    dhcp:boolean,
    portalservices:boolean,
    UTC:string,
    localtime:string,
    timezone:string,
    zibgeechannel:string,
    modelid:string,
    bridgeid:string,
    factorynew:boolean,
    replacesbridgeid:string
}

interface LightogramBridge {
    constructor(bridgeData: HueBridgeConfigurationRead, appName: string, deviceName: string);
    findBridge(): Promise;
    doApiCall(action: string, endpoint?: string, data?: Object): Promise<any>;
    getIpAddress(): Promise<string>;
    getUsername(): Promise<string>;
    getConfig(forceRefresh?: boolean): Promise;
    getName(): Promise;
    light(lightId: any): LightogramLight;
    setLightState(lightId: any, state: any): any;
    removeAuthorization(username: any): Promise;
    waitForAuthorization(): Promise;
    authorize(): Promise;
}

interface LightogramBridgeStatic {
    new(bridgeData: HueBridgeConfigurationRead, appName: string, deviceName: string): LightogramBridge;
    discoverBridges(): Promise<{HueBridgeConfigurationRead}[]>;
}


interface LightogramLight {
    constructor(bridge: LightogramBridge, lightId: string, lightData: Object);
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
    new(bridge: LightogramBridge, lightId: string, lightData: Object): LightogramLight
}

declare module "lightogram" {
    export let Bridge: LightogramBridgeStatic;
    export let Light: LightogramLightStatic;
}