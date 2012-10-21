(function(){
    "use strict";

    window.Blob = window.Blob || window.WebKitBlob || window.MozBlob;

    window.URL = window.webkitURL || window.URL;

    String.prototype.toCamelCase = function(){return this.split(/\s+|[-]+|[_]+/).
    map(function(word, index){word = word.toLowerCase();if(index !== 0){
    return word.split('').map(function(char, i){if(i===0){
    return char.toUpperCase();}return char;}).join('');}return word;}).join('');};

    var Img = Backbone.Model.extend({
        crop: function() {
            // TDOD build a crop tool for images
        }
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

                for (i; i < l; i++) {
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
                        console.warn(file.type + ' type files selected but is not supported');
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
                    // TODO: use templating
                    var figure = $("<figure>");
                    image.set('width', this.width);
                    image.set('height', this.height);
                    image.set('image', this);
                    figure.append(this);
                    figure.append($("<figcaption>").text(image.get("file").name));
                    div.append(figure);

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
            App.on("rerender", this.render, this);
        },

        // credit to https://github.com/ebidel/filer.js/blob/master/src/filer.js#L128
        dataURLToBlob: function(dataURL) {
            var BASE64_MARKER = ';base64,';
            if (dataURL.indexOf(BASE64_MARKER) == -1) {
              var parts = dataURL.split(',');
              var contentType = parts[0].split(':')[1];
              var raw = parts[1];

              return new Blob([raw], {type: contentType});
            }

            var parts = dataURL.split(BASE64_MARKER);
            var contentType = parts[0].split(':')[1];
            var raw = window.atob(parts[1]);
            var rawLength = raw.length;

            var uInt8Array = new Uint8Array(rawLength);

            for (var i = 0; i < rawLength; ++i) {
              uInt8Array[i] = raw.charCodeAt(i);
            }

            return new Blob([uInt8Array], {type: contentType});
        },

        render: function() {
            var self = this;

            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d'),
                maxWidth = 0,
                totalHeight = 0,
                heightFilled = 0,
                // TODO: move it to App.settings
                space = parseInt($('#css_option_spacing').val(), 10),
                result = new Image(),
                that = this,
                downloadLink = document.createElement('a'),
                MIME_TYPE = "image/png",
                dataUrl;

                downloadLink.textContent = 'Download Result Image';
                downloadLink.draggable = true;

            result.id = "spriteResultImage";

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
                image.set("top", heightFilled);
                heightFilled += height + space;
            });

            result.onload = function (){
                var dataURL = ctx.canvas.toDataURL();
                var blob = that.dataURLToBlob(dataURL); //new Blob([data], {type: MIME_TYPE});


                downloadLink.download = App.settings.cssBgImageName;
                downloadLink.href = URL.createObjectURL(blob);
                downloadLink.classList.add("btn");
                that.$el.html(this);
                $(".download-link").html(downloadLink);
            };
            result.src = canvas.toDataURL();
        }
    });

    var CSSView = Backbone.View.extend({
        events: {
            "change #css_option_spacing": "appRerender",
            'change .css-props [type="checkbox"]': "propChange",
            "change .css-class-formating input": "formatingChage",
            "keyup #css_option_filename": "updateBgImageName"
        },

        appRerender: function (event) {
            App.trigger("rerender");
        },

        propChange : function (event) {
            var target = event.target;
            switch (target.value) {
                case "width" :
                    App.settings.cssWidth = target.checked;
                    break;
                case "height" :
                    App.settings.cssHeight = target.checked;
                    break;
                case "bgImage":
                    App.settings.cssBgImage = target.checked;
            }
            this.render();
        },

        formatingChage: function (event) {
            var target = event.target;
            if (target.checked) {
                App.settings.cssClassNameFormating = target.value;
                this.render();
            }
        },

        updateBgImageName: function (event) {
            App.settings.cssBgImageName = event.target.value + ".png";
            this.render();
        },

        initialize: function(options){
            App.collections.originalImages.on('images:loaded', this.render, this);
            App.on("rerender", this.render, this);
        },

        renderImage: function (image) {
            var css = "",
                name = image.get("file").name.replace(/\(|\)|\[|\]|[%]|[$]|[#]|'|"|`/g, ""),
                pos_top = image.get("top");

                name = name.substr(0, name.lastIndexOf("."));


            switch(App.settings.cssClassNameFormating) {
                case "camel":
                    name = name.toCamelCase();
                    break;
                case "dash":
                    name = name.split(/\s+/).join('-');
                    break;
                default:
                    name = name.split(/\s+/).join('');
                    break;
            }

            css += "." + name + " {\n";

            if (App.settings.cssWidth) {
                css += "    width: " + image.get("width") + "px;\n";
            }
            if (App.settings.cssHeight) {
                css += "    height: " + image.get("height") + "px;\n";
            }
            if (App.settings.cssBgImage) {
                css += "    background-image: url(" + App.settings.cssBgImageName + ");\n";
            }

            css += "    background-position: 0 -" + pos_top + "px;\n}\n";

            this.code.innerText += css;


        },

        render: function() {
            this.code = this.el.querySelector("#cssResult");
            this.code.innerText = "";
            this.collection.each(this.renderImage, this);
        }
    });

    window.App = _.extend(Backbone.Events, {});

    App.settings = {
        cssClassNameFormating: "",
        cssWidth: true,
        cssHeight: true,
        cssBgImage: true,
        cssBgImageName: "sprite.png"
    };

    App.collections = {
        originalImages: new Images()
    };

    App.views = {
        dropHere: new DropHere({
            el: "#dropHere"
        }),

        originalImages: new ImageCollectionView({
            el: ".image-collection",
            collection: App.collections.originalImages
        }),

        sprite: new SpriteView({
            el: "#sprite",
            collection: App.collections.originalImages
        }),

        css: new CSSView({
            el: "#css",
            collection: App.collections.originalImages
        })
    };
})();
