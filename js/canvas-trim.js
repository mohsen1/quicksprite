//Canvas.trim from @rem
('HTMLCanvasElement' in this) && (function () {
    HTMLCanvasElement.prototype.trim = function (opts) {
        opts = opts || {};

        var
        element = this,
        bound = {
            top: null,
            left: null,
            right: null,
            bottom: null
        },
        ctx = element.getContext('2d'),
        newctx = document.createElement('canvas').getContext('2d'),
        pixels = ctx.getImageData(0, 0, element.width, element.height),
        l = pixels.data.length,
        i, x, y;

        for (i = 0; i < l; i += 4) {
            if (pixels.data[i + 3] !== 0) {
                x = (i / 4) % element.width;
                y = ~~((i / 4) / element.width);

                if (bound.top === null) {
                    bound.top = y;
                }

                if (bound.left === null) {
                    bound.left = x;
                } else if (x < bound.left) {
                    bound.left = x;
                }

                if (bound.right === null) {
                    bound.right = x;
                } else if (bound.right < x) {
                    bound.right = x;
                }

                if (bound.bottom === null) {
                    bound.bottom = y;
                } else if (bound.bottom < y) {
                    bound.bottom = y;
                }
            }
        }

        var
        trimmedHeight = Math.max(bound.bottom - bound.top, 1),
        trimmedWidth = Math.max(bound.right - bound.left, 1),
        trimmedData = ctx.getImageData(bound.left, bound.top, trimmedWidth, trimmedHeight),
        offsetX = 0,
        offsetY = 0;

        if (opts.minAspectRatio && opts.minAspectRatio > (trimmedWidth / trimmedHeight)) {
            var trimmedWidthNew = trimmedHeight * opts.minAspectRatio;
            offsetX = (trimmedWidthNew - trimmedWidth) / 2;
            trimmedWidth = trimmedWidthNew;
        }
        else if (opts.maxAspectRatio && opts.maxAspectRatio < (trimmedWidth / trimmedHeight)) {
            var trimmedHeightNew = trimmedWidth / opts.maxAspectRatio;
            offsetY = (trimmedHeightNew - trimmedHeight) / 2;
            trimmedHeight = trimmedHeightNew;
        }

        if (opts.minWidth && opts.minWidth > trimmedWidth) {
            var trimmedWidthNew = opts.minWidth;
            offsetX += (trimmedWidthNew - trimmedWidth) / 2;
            trimmedWidth = trimmedWidthNew;
        }

        if (opts.minHeight && opts.minHeight > trimmedHeight) {
            var trimmedHeightNew = opts.minHeight;
            offsetY += (trimmedHeightNew - trimmedHeight) / 2;
            trimmedHeight = trimmedHeightNew;
        }

        newctx.canvas.width = trimmedWidth;
        newctx.canvas.height = trimmedHeight;
        newctx.putImageData(trimmedData, offsetX, offsetY);

        return newctx.canvas;
    };
})();