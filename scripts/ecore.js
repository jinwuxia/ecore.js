// Generated by CoffeeScript 1.3.1
(function() {
  var Resource, ResourceSet, buildIndexes, ecore, getIndex, httpGet, indexAttribute, indexes, refAttribute, resolveReferences, root;

  root = this;

  ecore = {};

  root['ecore'] = ecore;

  Resource = (function() {

    Resource.name = 'Resource';

    function Resource(url, content) {
      this.url = url;
      this.content = content;
    }

    return Resource;

  })();

  ResourceSet = (function() {

    ResourceSet.name = 'ResourceSet';

    function ResourceSet() {}

    ResourceSet.resources = [];

    ResourceSet.indexes = {};

    ResourceSet.prototype.load = function(url, callback) {
      if (_.isString(url) && callback && typeof callback === 'function') {
        return httpGet(url, function(result) {
          var resource;
          resource = new Resource(url, result);
          if (!this.resources) {
            this.resources = [];
          }
          this.resources.push(resource);
          return callback(resource);
        });
      }
    };

    return ResourceSet;

  })();

  refAttribute = '$ref';

  indexAttribute = '_index';

  indexes = {};

  getIndex = function(parent, property, position) {
    var index;
    index = parent[indexAttribute] + '/@' + property;
    if (position >= 0) {
      index = index + '.' + position;
    }
    return index;
  };

  buildIndexes = function(object, func) {
    var current, index, keys;
    current = false;
    index = false;
    keys = _.without(_.keys(object), refAttribute, indexAttribute);
    _.each(keys, function(key) {
      var i, l, _results;
      if (_.isArray(object[key])) {
        i = 0;
        l = object[key].length;
        _results = [];
        while (i < l) {
          current = object[key][i];
          index = func.apply(this, [object, key, i]);
          current[indexAttribute] = index;
          indexes[index] = current;
          buildIndexes(current, func);
          _results.push(i++);
        }
        return _results;
      } else if (typeof object[key] === 'object') {
        current = object[key];
        index = func.apply(this, [object, key]);
        current[indexAttribute] = index;
        indexes[index] = current;
        return buildIndexes(object[key], func);
      }
    });
    return true;
  };

  resolveReferences = function(object) {
    var keys;
    keys = _.without(_.keys(object), indexAttribute);
    _.each(keys, function(key) {
      var ref;
      if (!_.isUndefined(object[key])) {
        if (_.has(object[key], refAttribute)) {
          ref = object[key][refAttribute];
          if (!_.isUndefined(ref)) {
            object[key] = indexes[ref];
          }
        }
      }
      if (typeof object[key] === 'object') {
        return resolveReferences(object[key]);
      }
    });
    return true;
  };

  httpGet = function(url, callback) {
    if ($) {
      $.getJSON(url, function(data) {
        root = data;
        if (root) {
          root[indexAttribute] = '/';
          indexes['/'] = root;
          buildIndexes(root, getIndex);
          resolveReferences(root);
          return root;
        }
      });
      return callback(root);
    }
  };

  ecore.Resource = Resource;

  ecore.ResourceSet = ResourceSet;

}).call(this);
