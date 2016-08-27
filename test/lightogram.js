import * as LightogramClass from '../src/index';
import * as AjaxClass from '../src/util/ajax';
import HueColor from 'hue-colors';

var Ajax = AjaxClass.default;
var Bridge = LightogramClass.default.Bridge;
var Light = LightogramClass.default.Light;

describe( 'Bridge', () => {

	it( 'calls the Hue API to discover local bridges', ( done ) => {

		spyOn( Ajax, 'getJSON' ).and.callFake( ( url, callback ) => {
			callback( [
				{
					id: 'abc123',
					internalipaddress: 'fake.ip.address'
				}
			] );
		} );

		var promise = Bridge.discoverBridges();
		promise.then( ( bridges ) => {
			expect( 'abc123' === bridges[0].id );
			done();
		} );

		expect( Ajax.getJSON ).toHaveBeenCalledWith( 'https://www.meethue.com/api/nupnp', jasmine.any( Function ) );

	} );

	it( 'parses through the discovered bridges to find the bridge', ( done ) => {
		var myBridge;

		spyOn( Bridge, 'discoverBridges' ).and.callFake( () => {

			setTimeout( () => {
				expect( myBridge.ipAddress ).toEqual( 'pandas.in.pajamas' );
				done();
			}, 1 );

			return Promise.resolve( [
				{id: 'soright', internalipaddress: 'pandas.in.pajamas'},
				{id: 'verywrong', internalipaddress: 'pandas.in.suits'}
			] );
		} );

		myBridge = new Bridge( {id: 'soright'} );
		myBridge.findBridge();

	} );

	it( 'fetches config', ( done ) => {
		spyOn( Bridge.prototype, 'doApiCall' ).and.callFake( () => {
			done();
			return Promise.resolve( {config: 'my config'} );
		} );

		var myBridge = new Bridge( {
			id: 'abc123'
		} );

		myBridge.getConfig().then( ( config ) => {
			expect( config.config ).toEqual( 'my config' );
		} );

		expect( Bridge.prototype.doApiCall ).toHaveBeenCalledWith( 'GET', 'config' );
	} );

	it( 'caches config', ( done ) => {
		spyOn( Bridge.prototype, 'doApiCall' ).and.callFake( () => {
			done();
			return Promise.resolve( {config: 'my config'} );
		} );

		var myBridge = new Bridge( {
			id: 'abc123'
		} );

		myBridge.getConfig().then( () => {
			myBridge.getConfig();
		} );

		expect( Bridge.prototype.doApiCall ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'sets an interval to wait for authorization', ( done ) => {
		jasmine.clock().install();

		var authorizationCount = 0;
		spyOn( Bridge.prototype, 'authorize' ).and.callFake( () => {
			authorizationCount ++;
			if ( authorizationCount > 1 ) {
				done();
				expect( Bridge.prototype.authorize ).toHaveBeenCalledTimes( 2 );
				return Promise.resolve( {success: {username: 'foo'}} );
			} else {
				return Promise.resolve( {error: {type: 101}} );
			}
		} );

		var myBridge = new Bridge( {id: 'abc123'} );
		myBridge.waitForAuthorization();

		jasmine.clock().tick( 2200 );
		jasmine.clock().uninstall();
	} );

	it( 'authorizes successfully', ( done ) => {
		spyOn( Bridge.prototype, '_constructEndpointUrl' ).and.returnValue( 'http://www.example.com' );
		spyOn( Ajax, 'postJSON' ).and.callFake( ( url, body, callback ) => {
			done();
			callback( [{success: {username: 'foo'}}] );
		} );

		var myBridge = new Bridge( {id: 'abc123'} );
		var promise = myBridge.authorize();

		expect( Ajax.postJSON ).toHaveBeenCalledWith( 'http://www.example.com', jasmine.any( Object ), jasmine.any( Function ) );
		expect( promise ).toHaveBeenCalledWith( jasmine.objectContaining( {
			username: 'foo'
		} ) );
	} );

	it( 'gracefully handles authorization when the API returns a soft error', ( done ) => {
		spyOn( Bridge.prototype, '_constructEndpointUrl' ).and.returnValue( 'http://www.example.com' );
		spyOn( Ajax, 'postJSON' ).and.callFake( ( url, body, callback ) => {
			done();
			callback( [{error: {type: 101}}] );
		} );

		var myBridge = new Bridge( {id: 'abc123'} );
		myBridge.authorize();

		expect( Ajax.postJSON ).toHaveBeenCalledWith( 'http://www.example.com', jasmine.any( Object ), jasmine.any( Function ) );
		expect( promise ).toHaveBeenCalledTimes( 0 );
	} );

} );

describe( 'Light', () => {
	var bridge,
		myLight;

	beforeEach( () => {
		bridge = new Bridge( {id: 'test'} );
		myLight = new Light( bridge, 'testlight', {type: 'test', name: 'test light'} );
	} );

	it( 'gets the light\'s state', ( done ) => {
		spyOn( bridge, 'doApiCall' ).and.returnValue( Promise.resolve( {
			name: 'test light',
			state: {on: true}
		} ) );

		myLight.getState().then( ( state ) => {
			expect( state.on ).toBe( true );
			done();
		} );

		expect( bridge.doApiCall ).toHaveBeenCalledWith( 'GET', 'lights/testlight', undefined );
	} );

	it( 'sets the light\'s state', ( done ) => {
		spyOn( bridge, 'doApiCall' ).and.returnValue( Promise.resolve() );

		myLight.setState( {on: false}, 200 ).then( () => {
			done();
		} );

		expect( bridge.doApiCall ).toHaveBeenCalledWith( 'PUT', 'lights/testlight/state', {
			on: false,
			transitionTime: 2
		} );
	} );

	it( 'sets the light\'s on state', ( done ) => {
		spyOn( bridge, 'doApiCall' ).and.returnValue( Promise.resolve() );

		myLight.setOn( false, 500 ).then( () => {
			done();
		} );

		expect( bridge.doApiCall ).toHaveBeenCalledWith( 'PUT', 'lights/testlight/state', {
			on: false,
			transitionTime: 5
		} );
	} );

	it( 'sets the light\'s color by hex code', ( done ) => {
		var myColor = new HueColor;

		spyOn( bridge, 'doApiCall' ).and.returnValue( Promise.resolve() );
		spyOn( HueColor, 'fromHex' ).and.returnValue( myColor );
		spyOn( myColor, 'toCie' ).and.returnValue( [1, 2, 3] );

		myLight.setColorHex( '001100', 500 ).then( () => {
			done();
		} );

		expect( HueColor.fromHex ).toHaveBeenCalledWith( '001100' );

		expect( bridge.doApiCall ).toHaveBeenCalledWith( 'PUT', 'lights/testlight/state', {
			xy: [1, 2],
			bri: 3,
			transitionTime: 5
		} );
	} );

	it( 'sets the light\'s color by RGB code', ( done ) => {
		var myColor = new HueColor;

		spyOn( bridge, 'doApiCall' ).and.returnValue( Promise.resolve() );
		spyOn( HueColor, 'fromRgb' ).and.returnValue( myColor );
		spyOn( myColor, 'toCie' ).and.returnValue( [1, 2, 3] );

		myLight.setColorRgb( 21, 22, 23, 500 ).then( () => {
			done();
		} );

		expect( HueColor.fromRgb ).toHaveBeenCalledWith( 21, 22, 23 );

		expect( bridge.doApiCall ).toHaveBeenCalledWith( 'PUT', 'lights/testlight/state', {
			xy: [1, 2],
			bri: 3,
			transitionTime: 5
		} );
	} );


} );