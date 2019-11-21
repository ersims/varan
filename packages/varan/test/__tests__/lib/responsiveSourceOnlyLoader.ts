import responsiveSourceOnlyLoader from '../../../src/lib/responsiveSourceOnlyLoader';

// Init
const dummyContent =
  'module.exports = {srcSet:__webpack_public_path__ + "static/media/icon-512x512.416.6ac93d9b.png"+" 416w",images:[{path:__webpack_public_path__ + "static/media/icon-512x512.416.6ac93d9b.png",width:416,height:286}],src:__webpack_public_path__ + "static/media/icon-512x512.416.6ac93d9b.png",toString:function(){return __webpack_public_path__ + "static/media/icon-512x512.416.6ac93d9b.png"},placeholder: undefined,width:416,height:286};';

// Tests
it('should pass through content by default', () => {
  expect(responsiveSourceOnlyLoader.call({}, dummyContent)).toEqual(dummyContent);
});
it('should ony return the src if `srcOnly` query parameter is set', () => {
  expect(responsiveSourceOnlyLoader.call({ resourceQuery: '?srcOnly' }, dummyContent)).toEqual(
    'module.exports = __webpack_public_path__ + "static/media/icon-512x512.416.6ac93d9b.png";',
  );
});
