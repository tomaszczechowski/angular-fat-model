describe("Fat Model", function () {
  var $FatModelProvider, $q, $rootScope;

  beforeEach(module('FatModelProvider'));

  beforeEach(inject(function(_$FatModelProvider_, _$q_, _$rootScope_) {
    $FatModelProvider = _$FatModelProvider_;
    $q = _$q_;
    $rootScope = _$rootScope_;
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
    it('Test whether "getModel" method throw error', function () {
      var getModel = function () {
        $FatModelProvider.getModel('model-test');
      };

      expect(getModel).toThrowError('[FatModel:getModel:Error] - Model "model-test" does not exist.');
    });
  });

  describe('Test whether fat model runs proper methods at small models', function () {
    it('Test whether promise function is run', function () {
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

    describe('Test whether models from the same group are run', function () {
      var model_1 = {}
        , model_2 = {};

      beforeEach(function () {
        model_1 = {
          name: 'model-1',
          groups: ['group-1'],
          promise: function () {
            return $q.defer().promise;
          },
          success: function () {},
          error: function () {}
        };

        model_2 = {
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

    describe('Test "success" and "error" methods', function () {
      var defer = null
        , model = {};

      beforeEach(function () {
        defer = $q.defer();

        model = {
          name: 'model-2',
          groups: ['test'],
          promise: function () {
            return defer.promise;
          },
          success: function () {},
          error: function () {}
        };

        spyOn(model, 'success').and.callThrough();
        spyOn(model, 'error').and.callThrough();

        $FatModelProvider.register(model);
        $FatModelProvider.fetchGroup('test');
      });

      it('Test "success" method', function () {
        defer.resolve();
        $rootScope.$apply();

        expect(model.success).toHaveBeenCalled();
      });

      it('Test "error" method', function () {
        defer.reject();
        $rootScope.$apply();

        expect(model.error).toHaveBeenCalled();
      });
    });
  });

  it('Test "refresh" property', function () {
    var model = {
      name: 'model-1',
      groups: ['test'],
      refresh: false,
      promise: function () {},
      success: function () {},
      error: function () {}
    };

    var model = $FatModelProvider.register(model);

    expect(model.refresh()).toBeFalsy();
  });
});