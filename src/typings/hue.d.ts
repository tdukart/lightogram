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
