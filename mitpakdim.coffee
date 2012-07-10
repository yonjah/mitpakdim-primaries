root = window.mit ?= {}

############### MODELS ##############

class root.MiscModel extends Backbone.Model
class root.Agenda extends Backbone.Model
class root.Member extends Backbone.Model

############### COLLECTIONS ##############

class root.JSONCollection extends Backbone.Collection
    initialize: (models, options) ->
        if options?.url
            @url = options.url
    parse: (response) ->
        return response.objects

class root.JSONPCollection extends root.JSONCollection
    sync: (method, model, options) ->
        options.dataType = "jsonp"
        return Backbone.sync(method, model, options)

class root.LocalVarCollection extends root.JSONCollection
    initialize: (models, options) ->
        if options?.localObject
            @localObject = options.localObject
    sync: (method, model, options) ->
        setTimeout =>
            options.success @localObject, null # xhr
        return

class root.MemberList extends root.JSONPCollection
    model: root.Member
    url: "http://api.dev.oknesset.org/api/v2/member/?format=jsonp"

############### VIEWS ##############

class root.TemplateView extends Backbone.View
    template: ->
        _.template( @get_template() )(arguments...)
    render: =>
        @$el.html( @template(@model.toJSON()) )
        @

class root.MemberView extends root.TemplateView
    className: "member_instance"
    get_template: ->
        $("#member_template").html()

class root.ListViewItem extends root.TemplateView
    tagName: "div"
    get_template: ->
        "<a href='#'><%= name %></a>"

class root.ListView extends root.TemplateView
    initialize: =>
        root.TemplateView.prototype.initialize.apply(this, arguments)
        @options.itemView ?= root.ListViewItem
        @options.autofetch ?= true
        if @options.collection
            @options.collection.bind "add", @addOne
            @options.collection.bind "reset", @addAll
            if @options.autofetch
                @options.collection.fetch()
    addOne: (modelInstance) =>
        view = new @options.itemView({ model:modelInstance })
        @$el.append view.render().$el

    addAll: =>
        @initEmptyView()
        @options.collection.each(@addOne)
    initEmptyView: =>
        @$el.empty()

class root.DropdownItem extends Backbone.View
    tagName: "option"
    render: =>
        json = @model.toJSON()
        @$el.html( json.name )
        @$el.attr({ value: json.id })
        @

class root.DropdownContainer extends root.ListView
    tagName: "select"
    options:
        itemView: root.DropdownItem
    initEmptyView: =>
        @$el.html("<option>-----</option>")

class root.AppView extends Backbone.View
    el: '#app_root'
    initialize: =>
        @memberList = new root.MemberList
        @memberList.fetch()
        @partyListView = new root.DropdownContainer
            collection: new root.JSONPCollection(null,
                model: root.MiscModel
                url: "http://api.dev.oknesset.org/api/v2/party/?format=jsonp"
            )
        @$(".parties").append(@partyListView.$el)
        @partyListView.$el.bind('change', @partyChange)

        @agendaListView = new root.ListView
            collection: new root.LocalVarCollection(null,
                model: root.MiscModel
                url: "data/agendas.jsonp" # not used yet
                localObject: window.mit_agendas
            )
            itemView: class extends root.ListViewItem
                get_template: ->
                    $("#agenda_template").html()
        @$(".agendas").append(@agendaListView.$el)
        @agendaListView.$el.bind('change', @agendaChange)
        @$("input:button").click(@calculate)

    partyChange: =>
        console.log "Changed: ", this, arguments
        @partyListView.options.selected = @partyListView.$('option:selected').text()
        @$('.agendas_container').show()
        @reevaluateMembers()

    reevaluateMembers: =>
        @memberListView = new root.ListView
            collection: new root.MemberList(@memberList.filter (object) =>
                object.get('party_name') == @partyListView.options.selected)
            itemView: root.MemberView
            autofetch: false
        @$(".members").empty().append(@memberListView.$el)
        @memberListView.options.collection.trigger "reset"

    calculate: =>
        console.log "Calculate: ", this, arguments
        @$(".members_container").show()


############### INIT ##############

$ ->
    root.appView = new root.AppView
    return
