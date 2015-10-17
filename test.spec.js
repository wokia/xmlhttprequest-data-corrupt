describe('Read binary data using XMLHttpRequest.', function() {

	describe('Binary data that begins with 0x7f', function() {
		var request = new XMLHttpRequest();

		beforeAll(function (done) {
			request.open('GET', '/base/0x7f.bin');

			request.responseType = 'arraybuffer';
			request.addEventListener('loadend', function () {
				done();
			});

			request.overrideMimeType('application/octet-stream');
			request.send();
		})

		it('It can be read correctly.', function() {
			var readed = new Uint8Array(request.response);
			var original = new Uint8Array([0x7f, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

			expect(readed).toEqual(original);

			console.log(readed);
		})
	})

	describe('Binary data that begins with 0x80', function() {
		var request = new XMLHttpRequest();

		beforeAll(function (done) {
			request.open('GET', '/base/0x80.bin');

			request.responseType = 'arraybuffer';
			request.addEventListener('loadend', function () {
				done();
			});

			request.overrideMimeType('application/octet-stream');
			request.send();
		})

		it('It can not be read correctly.', function() {
			var readed = new Uint8Array(request.response);
			var original = new Uint8Array([0x80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

			//expect(readed).toEqual(original);
			/* !!!! */expect(readed).not.toEqual(original);

			console.log(readed);
		})
	})
})
