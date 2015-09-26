describe("Fat Model", function () {
  var $FatModelProvider, $q;

  beforeEach(module('FatModelProvider'));

  beforeEach(inject(function(_$FatModelProvider_, _$q_) {
    $FatModelProvider = _$FatModelProvider_;
    $q = _$q_;
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

  describe('Test whether fat model runs proper methods at small models', function () {
    it('Test whether fatModel register method throw error', function () {
      var model = {
        name: 'model-2',
        groups: ['test'],
        promise: function () {
          return $q.defer().promise;
        },
        success: function () {},
        error: function () {}
      };

      spyOn(model, 'promise').and.callThrough();

      $FatModelProvider.register(model);
      $FatModelProvider.fetchGroup('test');

      expect(model.promise).toHaveBeenCalled();
    });

    it('Test whether models from the same group are run', function () {
      beforeEach(function () {
        var model_1 = {
          name: 'model-1',
          groups: ['group-1'],
          promise: function () {
            return $q.defer().promise;
          },
          success: function () {},
          error: function () {}
        };

        var model_2 = {
          name: 'model-2',
          groups: ['group-2'],
          promise: function () {
            return $q.defer().promise;
          },
          success: function () {},
          error: function () {}
        };

        spyOn(model_1, 'promise').and.callThrough();
        spyOn(model_2, 'promise').and.callThrough();

        $FatModelProvider.register(model_1);
        $FatModelProvider.register(model_2);
      });

      it('Fetch group-1', function () {
        $FatModelProvider.fetchGroup('group-1');

        expect(model_1.promise).toHaveBeenCalled();
        expect(model_2.promise).not.toHaveBeenCalled();
      });

      it('Fetch group-2', function () {
        $FatModelProvider.fetchGroup('group-2');

        expect(model_1.promise).not.toHaveBeenCalled();
        expect(model_2.promise).toHaveBeenCalled();
      });
    });
  });
});