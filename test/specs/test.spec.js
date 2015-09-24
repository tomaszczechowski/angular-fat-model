describe("Fat Model", function () {
  var $FatModelProvider;

  beforeEach(module('FatModelProvider'));

  beforeEach(inject(function(_$FatModelProvider_) {
    $FatModelProvider = _$FatModelProvider_;
  }));

  describe('Test method "register"', function () {
    it('Test whether fatModel registers properly models', function () {
      $FatModelProvider.register({
        name: 'model-1',
        promise: function () {},
        success: function () {},
        error: function () {}
      });

      var model = $FatModelProvider.getModel('model-1');
      var requiredMethod = ['$on', 'fetch', 'refresh'];

      for (var i = requiredMethod.length - 1; i >= 0; i--) {
        expect(requiredMethod[i] in model).toBeTruthy();
      };
    });

    it('Test whether fatModel register method throw error', function () {
      var register = function () {
        $FatModelProvider.register({
          name: 'model-1'
        });
      };

      expect(register).toThrowError('[FatModel:Register:Error] - Missing property "promise"!');
    });
  });

  describe('Test method "getModel"', function () {
    it('Test whether fatModel register method throw error', function () {
      var getModel = function () {
        $FatModelProvider.getModel('model-test');
      };

      expect(getModel).toThrowError('[FatModel:getModel:Error] - Model "model-test" does not exist.');
    });
  });
});