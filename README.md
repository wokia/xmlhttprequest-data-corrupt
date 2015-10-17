# xmlhttprequest-data-corrupt [![Build Status](https://travis-ci.org/wokia/xmlhttprequest-data-corrupt.svg?branch=master)](https://travis-ci.org/wokia/xmlhttprequest-data-corrupt) [![Build status](https://ci.appveyor.com/api/projects/status/b32m332ic8dioe41?svg=true)](https://ci.appveyor.com/project/wokia/xmlhttprequest-data-corrupt)
XMLHttpRequest で読み込んだ Binary Data の先頭部分が壊れてしまうのを再現したテスト。

## 問題の概要
0x80 よりも大きな値が先頭の 1 byte に入った Binary Data を XMLHttpRequest で読み込むと、先頭の 1 byte が 3 byte の値に変化してしまう。

## 問題の再現
Binary Editor で Test 用のデータを作って再現コードを作った。

### Binary Data の内容
それぞれの Bianry Data の内容は下記の通り。

#### 0x7f.bin
先頭 1 byte が 0x7f で、それ以外が 0 で埋めれれている 16 bytes のデータ
#### 0x80.bin
先頭 1 byte が 0x80 で、それ以外が 0 で埋めれれている 16 bytes のデータ

### 再現コード
それぞれの Binary File を XMLHttpRequest を使って読み込み、期待している Original のデータと比較している。0x80.bin では not.toEqual() としている。

具体的なコードは下記の通り。

```js:test.spec.js
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
```

### 実行結果
ローカル環境で動かした場合、0x80.bin を対象としたテストでの not.toEqual() が成立してしまっている。下記に、コンソールに出力された中身を記載しておく。

```
LOG: Uint8Array{0: 127, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0}
```
データの内容で記載した通りの想定通りの内容が取得できている。

```
LOG: Uint8Array{0: 239, 1: 191, 2: 189, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0}
```
先頭の 0x80 がなくなって、[239, 191, 189] という値が挿入されている。結果、サイズも 2 bytes 大きくなっている。

### 情報求む
CI 環境でもテストしたが、どの Browser でも同じ様な結果になっている模様。これは仕様って事？どうすれば回避できる？
現在読み込もうと思っているデータの先頭が、0x80 以上なので困っております…
