import * as LightogramClass from '../src/index';
import * as AjaxClass from '../src/util/ajax';

var Ajax = AjaxClass.default;
var Bridge = LightogramClass.default.Bridge;
var Light = LightogramClass.default.Light;

describe( 'Bridge discovery', () => {

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

	it( 'looks for the bridge if it doesn\'t have an IP', () => {

		spyOn( Bridge.prototype, 'findBridge' );

		var myBridge = new Bridge( {
			id: 'abc123'
		} );

		expect( Bridge.prototype.findBridge ).toHaveBeenCalled();

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

	} );

} );