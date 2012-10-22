// Generated by CoffeeScript 1.3.3
(function() {
  var encode_weights, filter_data, ga, getShareLink, parse_weights, root, setupPartyList, smartSync, _ref,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  root = (_ref = window.mit) != null ? _ref : window.mit = {};

  String.prototype.repeat = function(num) {
    return new Array(num + 1).join(this);
  };

  root.facebookShare = function(link) {
    ga.social('Facebook', 'share', link);
    return FB.ui({
      app_id: '362298483856854',
      display: 'popup',
      redirect_uri: 'http://www.mitpakdim.co.il/site/primaries/redirect',
      method: 'feed',
      name: 'Mitpakdim Primarieser',
      link: link,
      caption: 'The way to choose your candidates',
      description: 'Learn about your candidates by prioritizing the agendas you care about'
    }, function() {
      return console.log('Facebook callback', this, arguments);
    });
  };

  getShareLink = function(weights) {
    var base, district, fragment, party;
    base = window.location.href.replace(/#.*$/, '');
    party = root.global.party.id;
    district = root.global.district ? root.global.district.id : 'x';
    fragment = "" + party + "/" + district + "/" + (encode_weights(weights));
    return base + '#' + fragment;
  };

  parse_weights = function(weights) {
    var parsed;
    if (!_.isString(weights)) {
      return;
    }
    parsed = {};
    _.each(weights.split('i'), function(item) {
      var key, value, _ref1;
      _ref1 = item.split('x'), key = _ref1[0], value = _ref1[1];
      return parsed[Number(key)] = Number(value);
    });
    return parsed;
  };

  encode_weights = function(weights) {
    var key, value;
    return ((function() {
      var _results;
      _results = [];
      for (key in weights) {
        value = weights[key];
        _results.push("" + key + "x" + value);
      }
      return _results;
    })()).join('i');
  };

  ga = {
    event: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return _gaq.push(['_trackEvent'].concat(args));
    },
    social: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return _gaq.push(['_trackSocial'].concat(args));
    }
  };

  $.widget("mit.agendaSlider", $.extend({}, $.ui.slider.prototype, {
    _create: function() {
      this.element.append('<div class="ui-slider-back"></div>');
      this.element.append('<div class="ui-slider-mid-range"></div>');
      this.element.append('<div class="ui-slider-minus-button"></div>');
      this.element.append('<div class="ui-slider-plus-button"></div>');
      return $.ui.slider.prototype._create.apply(this);
    },
    setCandidateMarker: function(value) {
      var candidate_marker_classname, handle;
      candidate_marker_classname = "ui-slider-candidate-marker";
      if (!this.element.find("." + candidate_marker_classname).length) {
        handle = this.element.find(".ui-slider-handle");
        handle.before("<div class='" + candidate_marker_classname + "'></div>");
      }
      return this.element.find("." + candidate_marker_classname).css({
        left: value + "%"
      });
    },
    _refreshValue: function() {
      var range, value;
      $.ui.slider.prototype._refreshValue.apply(this);
      value = this.value();
      range = this.element.find(".ui-slider-mid-range");
      this.element.removeClass("minus plus");
      if (value < 0) {
        this.element.addClass("minus");
        range.css({
          left: (50 + value / 2) + "%",
          right: "50%"
        });
      }
      if (value > 0) {
        this.element.addClass("plus");
        return range.css({
          left: "50%",
          right: (50 - value / 2) + "%"
        });
      }
    }
  }));

  root.syncEx = function(options_override) {
    return function(method, model, options) {
      return Backbone.sync(method, model, _.extend({}, options, options_override));
    };
  };

  root.JSONPCachableSync = function(callback_name) {
    return root.syncEx({
      cache: true,
      dataType: 'jsonp',
      jsonpCallback: callback_name || 'cachable'
    });
  };

  root.syncOptions = {
    dataType: 'jsonp'
  };

  smartSync = function(method, model, options) {
    var getLocalCopy, localCopy, promise;
    options = _.extend({}, root.syncOptions, model.syncOptions, options);
    getLocalCopy = function() {
      var repo;
      repo = options.repo;
      repo = _.isString(repo) ? root[repo] : repo;
      if (method !== 'read' || !repo) {
        return null;
      }
      if (model instanceof Backbone.Collection) {
        return repo;
      }
      return _.where(repo.objects, {
        id: model.id
      })[0];
    };
    if (localCopy = _.clone(getLocalCopy())) {
      promise = $.Deferred();
      _.defer(function() {
        if (_.isFunction(options.success)) {
          options.success(localCopy, null);
        }
        return promise.resolve(localCopy, null);
      });
      return promise;
    }
    return (options.sync || Backbone.sync)(method, model, options);
  };

  root.MiscModel = (function(_super) {

    __extends(MiscModel, _super);

    function MiscModel() {
      return MiscModel.__super__.constructor.apply(this, arguments);
    }

    return MiscModel;

  })(Backbone.Model);

  root.Agenda = (function(_super) {

    __extends(Agenda, _super);

    function Agenda() {
      return Agenda.__super__.constructor.apply(this, arguments);
    }

    Agenda.prototype.defaults = {
      uservalue: 0
    };

    return Agenda;

  })(Backbone.Model);

  root.Candidate = (function(_super) {

    __extends(Candidate, _super);

    function Candidate() {
      return Candidate.__super__.constructor.apply(this, arguments);
    }

    Candidate.prototype.defaults = {
      selected: false,
      score: 'N/A',
      participating: true
    };

    Candidate.prototype.getAgendas = function() {
      if (this.agendas_fetching.state() !== "resolved" && !this.get('agendas')) {
        console.log("Trying to use candidate agendas before fetched", this, this.agendas_fetching);
        throw "Agendas not fetched yet!";
      }
      return this.get('agendas');
    };

    Candidate.prototype.initialize = function() {
      var set_default,
        _this = this;
      this.agendas_fetching = $.Deferred();
      set_default = function(attr, val) {
        if (_this.get(attr) === void 0) {
          return _this.set(attr, val);
        }
      };
      set_default('recommendation_positive', {});
      return set_default('recommendation_negative', {});
    };

    return Candidate;

  })(Backbone.Model);

  root.Member = (function(_super) {
    var MemberAgenda;

    __extends(Member, _super);

    function Member() {
      return Member.__super__.constructor.apply(this, arguments);
    }

    MemberAgenda = (function(_super1) {

      __extends(MemberAgenda, _super1);

      function MemberAgenda() {
        this.sync = __bind(this.sync, this);
        return MemberAgenda.__super__.constructor.apply(this, arguments);
      }

      MemberAgenda.prototype.urlRoot = "http://www.oknesset.org/api/v2/member-agendas/";

      MemberAgenda.prototype.url = function() {
        return MemberAgenda.__super__.url.apply(this, arguments) + '/';
      };

      MemberAgenda.prototype.sync = function() {
        return root.JSONPCachableSync("memberagenda_" + this.id).apply(null, arguments);
      };

      MemberAgenda.prototype.getAgendas = function() {
        var ret;
        ret = {};
        _.each(this.get('agendas'), function(agenda) {
          return ret[agenda.id] = agenda.score;
        });
        return ret;
      };

      return MemberAgenda;

    })(Backbone.Model);

    Member.prototype.fetchAgendas = function() {
      var _this = this;
      if (this.agendas_fetching.state() !== "resolved") {
        if (this.get('agendas')) {
          return this.agendas_fetching.resolve();
        }
        this.memberAgendas = new MemberAgenda({
          id: this.id
        });
        this.memberAgendas.fetch({
          success: function() {
            _this.set('agendas', _this.memberAgendas.getAgendas());
            return _this.agendas_fetching.resolve();
          },
          error: function() {
            console.log("Error fetching member agendas", _this, arguments);
            return _this.agendas_fetching.reject();
          }
        });
      }
      return this.agendas_fetching;
    };

    return Member;

  }).call(this, root.Candidate);

  root.Newbie = (function(_super) {

    __extends(Newbie, _super);

    function Newbie() {
      return Newbie.__super__.constructor.apply(this, arguments);
    }

    Newbie.prototype.initialize = function() {
      Newbie.__super__.initialize.apply(this, arguments);
      return this.agendas_fetching.resolve();
    };

    return Newbie;

  })(root.Candidate);

  root.Recommendation = (function(_super) {

    __extends(Recommendation, _super);

    function Recommendation() {
      return Recommendation.__super__.constructor.apply(this, arguments);
    }

    return Recommendation;

  })(Backbone.Model);

  root.JSONPCollection = (function(_super) {

    __extends(JSONPCollection, _super);

    function JSONPCollection() {
      return JSONPCollection.__super__.constructor.apply(this, arguments);
    }

    JSONPCollection.prototype.sync = smartSync;

    JSONPCollection.prototype.initialize = function() {
      return JSONPCollection.__super__.initialize.apply(this, arguments);
    };

    JSONPCollection.prototype.parse = function(response) {
      return response.objects;
    };

    return JSONPCollection;

  })(Backbone.Collection);

  root.PartyList = (function(_super) {

    __extends(PartyList, _super);

    function PartyList() {
      return PartyList.__super__.constructor.apply(this, arguments);
    }

    PartyList.prototype.model = root.MiscModel;

    PartyList.prototype.url = "http://www.oknesset.org/api/v2/party/";

    PartyList.prototype.syncOptions = {
      repo: window.mit.party
    };

    return PartyList;

  })(root.JSONPCollection);

  root.AgendaList = (function(_super) {

    __extends(AgendaList, _super);

    function AgendaList() {
      return AgendaList.__super__.constructor.apply(this, arguments);
    }

    AgendaList.prototype.model = root.Agenda;

    AgendaList.prototype.url = "http://www.oknesset.org/api/v2/agenda/";

    AgendaList.prototype.syncOptions = {
      repo: window.mit.agenda
    };

    return AgendaList;

  })(root.JSONPCollection);

  root.MemberList = (function(_super) {

    __extends(MemberList, _super);

    function MemberList() {
      return MemberList.__super__.constructor.apply(this, arguments);
    }

    MemberList.prototype.model = root.Member;

    MemberList.prototype.url = "http://www.oknesset.org/api/v2/member/?extra_fields=current_role_descriptions,party_name";

    MemberList.prototype.syncOptions = {
      repo: window.mit.combined_members,
      sync: root.JSONPCachableSync('members')
    };

    MemberList.prototype.sync = function(method, model, options) {
      var extra, extra_options, members, members_options;
      members_options = _.extend({}, options, {
        success: void 0,
        error: void 0
      });
      members = smartSync(method, model, options);
      extra_options = _.extend({}, members_options, {
        repo: window.mit.member_extra,
        url: "data/member_extra.jsonp"
      });
      extra = smartSync(method, model, extra_options);
      return $.when(members, extra).done(function(orig_args, extra_args) {
        var extendArrayWithId;
        extendArrayWithId = function() {
          var dest, dest_item, id, item, sources, src, _i, _len, _results;
          dest = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          _results = [];
          for (_i = 0, _len = sources.length; _i < _len; _i++) {
            src = sources[_i];
            _results.push((function() {
              var _j, _len1, _results1;
              _results1 = [];
              for (_j = 0, _len1 = src.length; _j < _len1; _j++) {
                item = src[_j];
                id = item.id;
                if (dest_item = _.where(dest, {
                  id: id
                })[0]) {
                  _results1.push(_.extend(dest_item, item));
                } else {
                  _results1.push(dest.push(item));
                }
              }
              return _results1;
            })());
          }
          return _results;
        };
        extendArrayWithId(orig_args[0].objects, extra_args[0].objects);
        if (_.isFunction(options.success)) {
          return options.success.apply(options, orig_args);
        }
      }).fail(function(orig_args, extra_args) {
        if (_.isFunction(options.error)) {
          return options.error.apply(options, orig_args);
        }
      });
    };

    MemberList.prototype.fetchAgendas = function() {
      var fetches,
        _this = this;
      fetches = [];
      this.each(function(member) {
        return fetches.push(member.fetchAgendas());
      });
      console.log("Waiting for " + fetches.length + " member agendas");
      return this.agendas_fetching = $.when.apply($, fetches).done(function() {
        return console.log("Got results!", _this, arguments);
      }).fail(function() {
        return console.log("Error getting results!", _this, arguments);
      });
    };

    return MemberList;

  })(root.JSONPCollection);

  root.NewbiesList = (function(_super) {

    __extends(NewbiesList, _super);

    function NewbiesList() {
      return NewbiesList.__super__.constructor.apply(this, arguments);
    }

    NewbiesList.prototype.model = root.Newbie;

    NewbiesList.prototype.syncOptions = {
      repo: window.mit.combined_newbies
    };

    NewbiesList.prototype.url = "http://www.mitpakdim.co.il/site/primaries/data/newbies.jsonp";

    NewbiesList.prototype.fetchAgendas = function() {
      return this.agendas_fetching = $.Deferred().resolve();
    };

    return NewbiesList;

  })(root.JSONPCollection);

  root.RecommendationList = (function(_super) {

    __extends(RecommendationList, _super);

    function RecommendationList() {
      return RecommendationList.__super__.constructor.apply(this, arguments);
    }

    RecommendationList.prototype.model = root.Recommendation;

    RecommendationList.prototype.syncOptions = {
      repo: window.mit.recommendations
    };

    RecommendationList.prototype.url = "http://www.mitpakdim.co.il/site/primaries/data/recommendations.jsonp";

    return RecommendationList;

  })(root.JSONPCollection);

  root.TemplateView = (function(_super) {

    __extends(TemplateView, _super);

    function TemplateView() {
      this.render = __bind(this.render, this);
      return TemplateView.__super__.constructor.apply(this, arguments);
    }

    TemplateView.prototype.template = function() {
      return _.template(this.get_template()).apply(null, arguments);
    };

    TemplateView.prototype.digestData = function(data) {
      return data;
    };

    TemplateView.prototype.render = function() {
      this.$el.html(this.template(this.digestData(this.model.toJSON())));
      return this;
    };

    return TemplateView;

  })(Backbone.View);

  root.ListViewItem = (function(_super) {

    __extends(ListViewItem, _super);

    function ListViewItem() {
      return ListViewItem.__super__.constructor.apply(this, arguments);
    }

    ListViewItem.prototype.tagName = "div";

    ListViewItem.prototype.get_template = function() {
      return "<a href='#'><%= name %></a>";
    };

    ListViewItem.prototype.events = {
      click: "onClick"
    };

    ListViewItem.prototype.onClick = function() {
      return this.trigger('click', this.model, this);
    };

    return ListViewItem;

  })(root.TemplateView);

  root.CandidateView = (function(_super) {

    __extends(CandidateView, _super);

    function CandidateView() {
      this.render = __bind(this.render, this);
      return CandidateView.__super__.constructor.apply(this, arguments);
    }

    CandidateView.prototype.className = "candidate_instance";

    CandidateView.prototype.initialize = function() {
      CandidateView.__super__.initialize.apply(this, arguments);
      return this.model.on('change', this.render);
    };

    CandidateView.prototype.get_template = function() {
      return $("#candidate_template").html();
    };

    CandidateView.prototype.digestData = function(data) {
      if (_.isString(data.score)) {
        data.simplified_score = "";
      } else {
        data.simplified_score = Math.round(data.score);
        if (data.simplified_score > 0) {
          data.simplified_score += "+";
        }
      }
      return data;
    };

    CandidateView.prototype.render = function() {
      CandidateView.__super__.render.call(this);
      this.$el.toggleClass("selected", this.model.get("selected"));
      return this;
    };

    CandidateView.prototype.onClick = function() {
      CandidateView.__super__.onClick.apply(this, arguments);
      return this.model.set({
        selected: true
      });
    };

    return CandidateView;

  })(root.ListViewItem);

  root.ListView = (function(_super) {

    __extends(ListView, _super);

    function ListView() {
      this.itemEvent = __bind(this.itemEvent, this);

      this.initEmptyView = __bind(this.initEmptyView, this);

      this.addAll = __bind(this.addAll, this);

      this.addOne = __bind(this.addOne, this);
      return ListView.__super__.constructor.apply(this, arguments);
    }

    ListView.prototype.initialize = function() {
      var _base, _base1, _ref1, _ref2;
      ListView.__super__.initialize.apply(this, arguments);
      if ((_ref1 = (_base = this.options).itemView) == null) {
        _base.itemView = root.ListViewItem;
      }
      if ((_ref2 = (_base1 = this.options).autofetch) == null) {
        _base1.autofetch = true;
      }
      if (this.options.collection) {
        return this.setCollection(this.options.collection);
      }
    };

    ListView.prototype.setCollection = function(collection) {
      this.collection = collection;
      this.collection.on("add", this.addOne);
      this.collection.on("reset", this.addAll);
      if (this.options.autofetch) {
        return this.collection.fetch();
      } else {
        return this.addAll();
      }
    };

    ListView.prototype.addOne = function(modelInstance) {
      var view;
      view = new this.options.itemView({
        model: modelInstance
      });
      view.on('all', this.itemEvent);
      return this.$el.append(view.render().$el);
    };

    ListView.prototype.addAll = function() {
      this.initEmptyView();
      return this.collection.each(this.addOne);
    };

    ListView.prototype.initEmptyView = function() {
      return this.$el.empty();
    };

    ListView.prototype.itemEvent = function() {
      return this.trigger.apply(this, arguments);
    };

    return ListView;

  })(root.TemplateView);

  root.DropdownItem = (function(_super) {

    __extends(DropdownItem, _super);

    function DropdownItem() {
      this.render = __bind(this.render, this);
      return DropdownItem.__super__.constructor.apply(this, arguments);
    }

    DropdownItem.prototype.tagName = "option";

    DropdownItem.prototype.render = function() {
      var json;
      json = this.model.toJSON();
      this.$el.html(json.name);
      this.$el.attr({
        value: json.id
      });
      return this;
    };

    return DropdownItem;

  })(Backbone.View);

  root.DropdownContainer = (function(_super) {

    __extends(DropdownContainer, _super);

    function DropdownContainer() {
      this.initEmptyView = __bind(this.initEmptyView, this);
      return DropdownContainer.__super__.constructor.apply(this, arguments);
    }

    DropdownContainer.prototype.tagName = "select";

    DropdownContainer.prototype.options = {
      itemView: root.DropdownItem,
      show_null_option: true
    };

    DropdownContainer.prototype.initEmptyView = function() {
      if (this.options.show_null_option) {
        return this.$el.html("<option>-----</option>");
      }
    };

    DropdownContainer.prototype.current = {};

    DropdownContainer.prototype.events = {
      'change': function() {
        var index;
        index = this.$el.children().index(this.$('option:selected'));
        if (this.options.show_null_option) {
          index -= 1;
        }
        this.current = index >= 0 ? this.collection.at(index) : {};
        return this.trigger('change', this.current);
      }
    };

    return DropdownContainer;

  })(root.ListView);

  root.CurrentPartyView = (function(_super) {

    __extends(CurrentPartyView, _super);

    function CurrentPartyView() {
      this.render = __bind(this.render, this);
      return CurrentPartyView.__super__.constructor.apply(this, arguments);
    }

    CurrentPartyView.prototype.el = ".current_party";

    CurrentPartyView.prototype.render = function() {
      return this.$('.current_party_name').text(root.global.party.get('name'));
    };

    return CurrentPartyView;

  })(Backbone.View);

  root.CandidatesMainView = (function(_super) {

    __extends(CandidatesMainView, _super);

    function CandidatesMainView() {
      this.propagate = __bind(this.propagate, this);
      return CandidatesMainView.__super__.constructor.apply(this, arguments);
    }

    CandidatesMainView.prototype.el = ".candidates_container";

    CandidatesMainView.prototype.initialize = function() {
      var _this = this;
      this.currentPartyView = new root.CurrentPartyView;
      root.global.on('change_party', function() {
        return _this.currentPartyView.render();
      });
      this.filteringView = new root.FilterView;
      this.membersView = new root.CandidateListView({
        el: ".members",
        collection: this.options.members
      });
      this.newbiesView = new root.CandidateListView({
        el: ".newbies",
        collection: this.options.newbies
      });
      this.membersView.on('all', this.propagate);
      this.newbiesView.on('all', this.propagate);
      return this.filteringView.on('change', function(filter) {
        return _this.filterChange(filter);
      });
    };

    CandidatesMainView.prototype.propagate = function() {
      return this.trigger.apply(this, arguments);
    };

    return CandidatesMainView;

  })(Backbone.View);

  root.CandidatesMainView.create_delegation = function(func_name) {
    var delegate;
    delegate = function() {
      var _ref1, _ref2;
      (_ref1 = this.membersView)[func_name].apply(_ref1, arguments);
      return (_ref2 = this.newbiesView)[func_name].apply(_ref2, arguments);
    };
    return this.prototype[func_name] = delegate;
  };

  root.CandidatesMainView.create_delegation('calculate');

  root.CandidatesMainView.create_delegation('filterChange');

  root.PartyFilteredListView = (function(_super) {

    __extends(PartyFilteredListView, _super);

    function PartyFilteredListView() {
      this.partyChange = __bind(this.partyChange, this);
      return PartyFilteredListView.__super__.constructor.apply(this, arguments);
    }

    PartyFilteredListView.prototype.options = {
      autofetch: false
    };

    PartyFilteredListView.prototype.initialize = function() {
      PartyFilteredListView.__super__.initialize.apply(this, arguments);
      this.unfilteredCollection = this.collection;
      this.unfilteredCollection.fetch();
      this.setCollection(new this.unfilteredCollection.constructor(void 0, {
        comparator: function(candidate) {
          return -candidate.get('score');
        }
      }));
      return root.global.on('change_party', this.partyChange);
    };

    PartyFilteredListView.prototype.filterByParty = function(party) {
      return this.unfilteredCollection.where({
        party_name: party.get('name')
      });
    };

    PartyFilteredListView.prototype.partyChange = function(party) {
      return this.collection.reset(this.filterByParty(party));
    };

    return PartyFilteredListView;

  })(root.ListView);

  root.CandidateListView = (function(_super) {

    __extends(CandidateListView, _super);

    function CandidateListView() {
      this.partyChange = __bind(this.partyChange, this);
      return CandidateListView.__super__.constructor.apply(this, arguments);
    }

    CandidateListView.prototype.options = {
      itemView: root.CandidateView
    };

    CandidateListView.prototype.partyChange = function(party) {
      CandidateListView.__super__.partyChange.apply(this, arguments);
      return this.collection.fetchAgendas();
    };

    CandidateListView.prototype.filterChange = function(filter_model) {
      var filtered;
      filtered = this.filterByParty(root.global.party);
      return this.collection.reset(_.filter(filtered, filter_model.get('func')));
    };

    CandidateListView.prototype.calculate = function(weights) {
      var _this = this;
      if (!this.collection.agendas_fetching) {
        throw "Agenda data not present yet";
      }
      return this.collection.agendas_fetching.done(function() {
        _this.calculate_inner(weights);
        return _this.collection.sort();
      });
    };

    CandidateListView.prototype.calculate_inner = function(weights) {
      var abs_sum, weight_sum,
        _this = this;
      abs_sum = function(arr) {
        var do_sum;
        do_sum = function(memo, item) {
          return memo += Math.abs(item);
        };
        return _.reduce(arr, do_sum, 0);
      };
      weight_sum = abs_sum(weights);
      console.log("Weights: ", weights, weight_sum);
      return this.collection.each(function(candidate) {
        return candidate.set('score', _.reduce(candidate.getAgendas(), function(memo, score, id) {
          return memo += (weights[id] || 0) * score / weight_sum;
        }, 0));
      });
    };

    return CandidateListView;

  })(root.PartyFilteredListView);

  root.AgendaListView = (function(_super) {

    __extends(AgendaListView, _super);

    function AgendaListView() {
      return AgendaListView.__super__.constructor.apply(this, arguments);
    }

    AgendaListView.prototype.el = '.agendas';

    AgendaListView.prototype.options = {
      collection: new root.AgendaList,
      itemView: (function(_super1) {

        __extends(_Class, _super1);

        function _Class() {
          this.onStop = __bind(this.onStop, this);
          return _Class.__super__.constructor.apply(this, arguments);
        }

        _Class.prototype.className = "agenda_item";

        _Class.prototype.render = function() {
          _Class.__super__.render.call(this);
          this.$('.slider').agendaSlider({
            min: -100,
            max: 100,
            value: this.model.get("uservalue"),
            stop: this.onStop
          });
          return this;
        };

        _Class.prototype.onStop = function(event, ui) {
          return this.model.set({
            uservalue: ui.value
          });
        };

        _Class.prototype.get_template = function() {
          return $("#agenda_template").html();
        };

        return _Class;

      })(root.ListViewItem)
    };

    AgendaListView.prototype.reset = function(weights) {
      return this.collection.each(function(agenda, index) {
        var value;
        if (_.isNumber(value = weights[agenda.id])) {
          agenda.set("uservalue", value);
          return this.$(".slider").eq(index).agendaSlider("value", value);
        }
      });
    };

    AgendaListView.prototype.getWeights = function() {
      var weights,
        _this = this;
      weights = {};
      this.collection.each(function(agenda) {
        return weights[agenda.id] = agenda.get("uservalue");
      });
      return weights;
    };

    AgendaListView.prototype.showMarkersForCandidate = function(candidate_model) {
      var candidate_agendas;
      candidate_agendas = candidate_model.getAgendas();
      return this.collection.each(function(agenda, index) {
        var value;
        value = candidate_agendas[agenda.id] || 0;
        value = 50 + value / 2;
        return this.$(".slider").eq(index).agendaSlider("setCandidateMarker", value);
      });
    };

    return AgendaListView;

  }).call(this, root.ListView);

  root.RecommendationsView = (function(_super) {

    __extends(RecommendationsView, _super);

    function RecommendationsView() {
      return RecommendationsView.__super__.constructor.apply(this, arguments);
    }

    RecommendationsView.prototype.el = '.recommendations';

    RecommendationsView.prototype.options = {
      itemView: (function(_super1) {

        __extends(_Class, _super1);

        function _Class() {
          this.catchEvents = __bind(this.catchEvents, this);
          return _Class.__super__.constructor.apply(this, arguments);
        }

        _Class.prototype.catchEvents = function() {
          var status;
          console.log('change', this, arguments);
          status = Boolean(this.$el.find(':checkbox:checked').length);
          return this.model.set('status', status);
        };

        _Class.prototype.events = {
          'change': 'catchEvents'
        };

        _Class.prototype.get_template = function() {
          return $("#recommendation_template").html();
        };

        return _Class;

      })(root.ListViewItem)
    };

    RecommendationsView.prototype.initialize = function() {
      RecommendationsView.__super__.initialize.apply(this, arguments);
      return this.collection.on('change', this.applyChange, this);
    };

    RecommendationsView.prototype.applyChange = function(recommendation) {
      var changeModelFunc;
      changeModelFunc = function(candidates, attribute) {
        return function(model_id, status) {
          var list, model;
          model = candidates.get(model_id);
          list = _.clone(model.get(attribute));
          if (recommendation.get('status')) {
            list[recommendation.id] = true;
          } else {
            delete list[recommendation.id];
          }
          return model.set(attribute, list);
        };
      };
      _.each(recommendation.get('positive_list')['members'], changeModelFunc(this.options.members, 'recommendation_positive'));
      _.each(recommendation.get('negative_list')['members'], changeModelFunc(this.options.members, 'recommendation_negative'));
      _.each(recommendation.get('positive_list')['newbies'], changeModelFunc(this.options.newbies, 'recommendation_positive'));
      return _.each(recommendation.get('negative_list')['newbies'], changeModelFunc(this.options.newbies, 'recommendation_negative'));
    };

    return RecommendationsView;

  }).call(this, root.PartyFilteredListView);

  filter_data = [
    {
      id: "all",
      name: "All",
      func: function(obj) {
        return true;
      }
    }, {
      id: "district",
      name: "District",
      func: function(obj) {
        return obj.get('district') === root.global.district.get('id');
      }
    }
  ];

  root.FilterView = (function(_super) {

    __extends(FilterView, _super);

    function FilterView() {
      return FilterView.__super__.constructor.apply(this, arguments);
    }

    FilterView.prototype.el = '.filtering';

    FilterView.prototype.options = _.extend({}, FilterView.__super__.options, {
      collection: new Backbone.Collection(filter_data),
      autofetch: false,
      show_null_option: false
    });

    return FilterView;

  })(root.DropdownContainer);

  root.EntranceView = (function(_super) {

    __extends(EntranceView, _super);

    function EntranceView() {
      this.initialize = __bind(this.initialize, this);
      return EntranceView.__super__.constructor.apply(this, arguments);
    }

    EntranceView.prototype.el = '.entrance_page';

    EntranceView.prototype.initialize = function() {
      var _this = this;
      this.partyListView = new root.DropdownContainer({
        el: '.parties',
        collection: root.lists.partyList,
        autofetch: false
      });
      this.partyListView.on('change', function(model) {
        return console.log("Party changed: ", _this, arguments);
      });
      this.districtListView = new root.DropdownContainer({
        el: '.districts',
        collection: new Backbone.Collection,
        autofetch: false
      });
      this.districtListView.on('change', function(model) {
        return root.global.district = model;
      });
      this.$el.on('click', '#party_selected', function() {
        var district, party, _ref1;
        _ref1 = [_this.partyListView.current, _this.districtListView.current], party = _ref1[0], district = _ref1[1];
        if (district.id) {
          ga.event('party', 'choose', "party_" + party.id + "_district_" + district.id);
        } else {
          ga.event('party', 'choose', "party_" + party.id);
        }
        return root.router.navigate(party.id.toString(), {
          trigger: true
        });
      });
      return this.partyListView.on('change', function(party) {
        var district, districts, districts_names, _i, _len;
        districts_names = _.chain(_.union(root.lists.members.where({
          party_name: party.get('name')
        }), root.lists.newbies.where({
          party_name: party.get('name')
        }))).pluck('attributes').pluck('district').uniq().value();
        districts = [];
        for (_i = 0, _len = districts_names.length; _i < _len; _i++) {
          district = districts_names[_i];
          if (!district) {
            continue;
          }
          districts.push({
            id: district,
            name: district
          });
        }
        return _this.districtListView.collection.reset(districts);
      });
    };

    return EntranceView;

  })(Backbone.View);

  root.AppView = (function(_super) {

    __extends(AppView, _super);

    function AppView() {
      this.updateSelectedCandidate = __bind(this.updateSelectedCandidate, this);

      this.calculate = __bind(this.calculate, this);

      this.initialize = __bind(this.initialize, this);
      return AppView.__super__.constructor.apply(this, arguments);
    }

    AppView.prototype.el = '#app_root';

    AppView.prototype.initialize = function() {
      this.agendaListView = new root.AgendaListView;
      this.agendaListView.collection.on('change:uservalue', _.debounce(this.calculate, 500));
      this.candidatesView = new root.CandidatesMainView({
        members: root.lists.members,
        newbies: root.lists.newbies
      });
      root.lists.members.on("change:selected", this.updateSelectedCandidate);
      root.lists.newbies.on("change:selected", this.updateSelectedCandidate);
      this.recommendations = new root.RecommendationList;
      return this.recommendationsView = new root.RecommendationsView({
        collection: this.recommendations,
        members: root.lists.members,
        newbies: root.lists.newbies
      });
    };

    AppView.prototype.events = {
      'click input:button[value=Share]': function(event) {
        return root.facebookShare(getShareLink(this.agendaListView.getWeights()));
      },
      'click input:button#change_party': function(event) {
        return root.router.navigate('', {
          trigger: true
        });
      }
    };

    AppView.prototype.calculate = function(agenda) {
      this.candidatesView.calculate(this.agendaListView.getWeights());
      return ga.event('weight', 'change', 'agenda_' + agenda.id, agenda.get('uservalue'));
    };

    AppView.prototype.updateSelectedCandidate = function(candidate_model, selected_attr_value) {
      if (!selected_attr_value) {
        return;
      }
      this.agendaListView.showMarkersForCandidate(candidate_model);
      return this.deselectCandidates(candidate_model);
    };

    AppView.prototype.deselectCandidates = function(exclude_model) {
      var collection, _i, _len, _ref1;
      _ref1 = [root.lists.members, root.lists.newbies];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        collection = _ref1[_i];
        _.each(collection.where({
          selected: true
        }), function(model) {
          if ((!exclude_model) || (model !== exclude_model)) {
            return model.set({
              selected: false
            });
          }
        });
      }
    };

    return AppView;

  })(Backbone.View);

  root.Router = (function(_super) {

    __extends(Router, _super);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.routes = {
      '': 'entrance',
      ':party': 'party',
      ':party/:district': 'party',
      ':party/:district/:weights': 'party',
      ':party//:weights': 'partyNoDistrict'
    };

    Router.prototype.entrance = function() {
      console.log('entrance');
      $('.entrance_page').show();
      return $('.party_page').hide();
    };

    Router.prototype.partyNoDistrict = function(party_id, weights) {
      return this.party(party_id, void 0, weights);
    };

    Router.prototype.party = function(party_id, district_id, weights) {
      var district_model, model;
      console.log.apply(console, ['party'].concat(__slice.call(arguments)));
      model = root.lists.partyList.where({
        id: Number(party_id)
      })[0];
      if (!model) {
        return root.router.navigate('', {
          trigger: true
        });
      }
      root.global.party = model;
      root.global.trigger('change_party', model);
      if (district_model = root.lists.partyList.where({
        id: Number(district_id)
      })[0]) {
        root.global.district = district_model;
      }
      if (weights = parse_weights(weights)) {
        root.appView.agendaListView.reset(weights);
      }
      $('.party_page').show();
      return $('.entrance_page').hide();
    };

    return Router;

  })(Backbone.Router);

  setupPartyList = function() {
    var _ref1;
    if ((_ref1 = root.lists) == null) {
      root.lists = {};
    }
    root.lists.partyList = new root.PartyList;
    root.lists.members = new root.MemberList;
    root.lists.newbies = new root.NewbiesList;
    return root.lists.partyList.fetch();
  };

  $(function() {
    var partyListFetching;
    root.global = _.extend({}, Backbone.Events);
    root.router = new root.Router;
    partyListFetching = setupPartyList();
    root.appView = new root.AppView;
    root.entranceView = new root.EntranceView;
    $.when(partyListFetching).done(function() {
      Backbone.history.start();
      $('#loading').hide();
      return $('#app_root').show();
    });
    FB.init();
    FB.Event.subscribe('message.send', function(targetUrl) {
      return ga.social('facebook', 'send', targetUrl);
    });
  });

}).call(this);
