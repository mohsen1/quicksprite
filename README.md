Quick Sprite
============

I made my own sprite builder using HTML5 technologies. This sprite builder doesn’t rely on server side image processing and works all in front end. It also generate CSS code developer may need for it’s sprite. All background-position properties are calculated and there is no need for eyeballing pixels in Photoshop to find out exact position of an icon! It generates width and height and even background-image property for each image. CSS classes are guessed based on each image file name. User can select between camel case and dash separated class names.
Using Quick Sprite is very easy, you just drag your images in the app and it generates sprite image and CSS code in a second! You can drag out the result image our download it using the provided download link.

![image](http://i.imgur.com/aZlg4.png)

Technology Stack
================

I’ve used Backbone.js to organize my views and collection. While it wan’t necessary to use Backbone but it helped me to rapidly develop this app.
To generate sprite image I used a `<canvas>` element to draw images on it and take out result from canvas. I’ve used drag and drop API, File Blob, anchor tag download attribute and all good stuff from HTML5.

Browser support
===============

It works perfect in Chrome and Safari but CSS code didn’t show up in when I tried it out in Firefox. I didn’t try it in IE or Opera.

What is next?
=============

CSS code is machine generated and will not be your perfect code to put in production so you may want to edit it. My plan is to use Code Mirror for syntax highlighting and code editing in CSS code block.
Making sprite of big images could be slow and app freezes while processing images. It’s because images processing happens in sam thread as DOM (no surprise here!). Solution to this is using Web Workers but problem is I lose DOM in workers. I’m using DOM (canvas) to process images. Right now I am investigating on re-implementing `CanvasRenderingContext2D.prototype.drawImage` and `CanvasRenderingContext2D.prototype.getImageData `in a web worker. If I could do that then I can transfer each image binary data individually to worker and let worker combine those into a big ImageData object and transfer it back to original window. This might not be as easy as it looks but is not impossible.
Right now the app render images below each other in a very tall and thin sprite (width of sprite is based on widest image). Maybe people want to stack their images in sprite horizontally or like a grid .Actually PNG file size will not change if we stack images differently (say like a grid) but having smaller numbers for background-position is a plus.

The App
=======
Here is the [app](http://mohsenweb.com/experiments/quicksprite/)

