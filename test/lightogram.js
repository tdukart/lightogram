//This will fail. I'm guessing it's for a reason like https://github.com/webpack/karma-webpack/issues/129.

import { Bridge, Light } from '../src/index';
import { Ajax } from '../src/util/ajax';

describe( 'Bridge discovery', () => {

	beforeEach( () => {

			spyOn( Ajax, 'getJSON' );
			spyOn( Ajax, 'postJSON' );
			spyOn( Ajax, 'deleteJSON' );
			spyOn( Ajax, 'performJSON' );

		}
	);

	it( 'calls the Hue API to discover local bridges', () => {

		var promise = Bridge.discoverBridges();
		promise.then( () => {
			done();
		} );

		expect( Ajax.getJSON ).toHaveBeenCalledWith( 'https://www.meethue.com/api/nupnp', jasmine.any( Function ) );

	} );

} );