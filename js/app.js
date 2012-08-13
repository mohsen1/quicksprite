

var Img = Backbone.Model.extend({
    crop: function() {}
});

var Images = Backbone.Collection.extend({
    model: Img
});

var DropHere = Backbone.View.extend({
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {

        this.inputEl = document.getElementById('files');

        this.el.ondragover = function (event) {
            this.classList.add("dropping");
            return false;
        };

        this.el.ondragleave = function (event) {
            this.classList.remove("dropping");
            return false;
        };

        this.el.ondrop = this.inputEl.onchange = function (event) {
            event.preventDefault();
            this.classList.remove("dropping");

            var files,
                i = 0,
                l;

            if (event.dataTransfer) {
                files = event.dataTransfer.files;
            } else {
                files = event.target.files;
            }

            l = files.length;

            for (i; i<l; i++) {
                readFile(i);
            }

            function readFile(n){
                var reader = new FileReader(),
                    validTypes = ["image/png", "image/gif", "image/jpeg"],
                    dataUrl,
                    file;


                reader.onload = function (event) {
                    var img = new Image();
                    img.onload = function (e) {
                        var ctx = document.createElement('canvas').getContext('2d');
                        ctx.canvas.width = this.width;
                        ctx.canvas.height = this.height;
                        ctx.drawImage(this, 0, 0);
                        var newCanvas = ctx.canvas.trim();
                        dataUrl = newCanvas.toDataURL('image/png');

                        App.collections.originalImages.add({
                            file: file,
                            dataUrl: dataUrl
                        });
                    };
                    img.src = event.target.result;
                };

                file = files[n];

                if (validTypes.indexOf(file.type) > -1) {
                    reader.readAsDataURL(file);
                } else {
                    console.warn(file.type + ' file type is not supported');
                }
            }

            return false;
        };
    }
});

var ImageCollectionView = Backbone.View.extend({
    initialize: function(options) {
        this.collection.on('add', this.render, this);
    },

    render: function() {

        var div = $('<div>'),
            that = this;
        this.collection.each(function(image, i) {
            var img = new Image();


            img.onload = function(){
                image.set('width', this.width);
                image.set('height', this.height);
                image.set('image', this);
                div.append(this);

                if (i === that.collection.length - 1) {
                    App.collections.originalImages.trigger('images:loaded');
                }
            };
            img.src = image.get('dataUrl');
        });

        this.$el.html(div);
    }
});

var SpriteView = Backbone.View.extend({
    initialize: function(options) {
        App.collections.originalImages.on('images:loaded', this.render, this);
    },

    render: function() {

        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            maxWidth = 0,
            totalHeight = 0,
            heightFilled = 0,
            space = parseInt($('#spacing').val(), 10),
            result = new Image(),
            that = this;

        this.collection.each(function(image) {
            if (image.get('width') > maxWidth) {
                maxWidth = image.get('width');
            }
            totalHeight += image.get('height') + space;
        });

        ctx.canvas.width = maxWidth;
        ctx.canvas.height = totalHeight - space;


        this.collection.each(function(image, index) {
            var height = image.get('height'),
                img = image.get('image');
            ctx.drawImage(img, 0, heightFilled);
            heightFilled += height + space;
        });

        result.onload = function(){
            that.$el.html(this);
        };

        result.src = canvas.toDataURL();
    }
});



var App = {};
App.collections = {
    originalImages: new Images()
};
App.views = {
    dropHere: new DropHere({el: "#dropHere"}),
    originalImages: new ImageCollectionView({
        el: ".image-collection",
        collection: App.collections.originalImages
    }),
    sprite: new SpriteView({
        el: "#sprite",
        collection: App.collections.originalImages
    })
};

