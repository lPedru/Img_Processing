window.onload = function () {
    function sayHelloWorld() {
        console.log("\n");
        console.log("*** Hello World from Type Script code. ***");
        console.log("\n");
    }
    sayHelloWorld();
    var ImgGenerator = /** @class */ (function () {
        function ImgGenerator(src) {
            var canvas = document.querySelector('#viewport');
            var context = canvas.getContext('2d');
            var img = new Image();
            img.src = src;
            img.height = 300;
            img.width = 300;
            this.img = img;
            this.canvas = canvas;
            this.context = context;
            this.CreateEvents();
        }
        ImgGenerator.prototype.CreateEvents = function () {
            var _this = this;
            this.canvas.addEventListener("mousemove", function (event) { return _this.Pick(event, document.getElementById("hovered-color")); });
            this.canvas.addEventListener("click", function (event) { return _this.Pick(event, document.getElementById("selected-color")); });
            this.img.onload = function () {
                _this.canvas.width = _this.img.width;
                _this.canvas.height = _this.img.height;
                _this.context.drawImage(_this.img, 0, 0, _this.img.width, _this.img.height);
            };
        };
        ImgGenerator.prototype.Pick = function (event, destination) {
            var bounding = this.canvas.getBoundingClientRect();
            var x = event.clientX - bounding.left;
            var y = event.clientY - bounding.top;
            var pixel = this.context.getImageData(x, y, 1, 1);
            var data = pixel.data;
            var rgba = "rgba(".concat(data[0], ", ").concat(data[1], ", ").concat(data[2], ", ").concat(data[3] / 255, ")");
            destination.style.background = rgba;
            destination.textContent = rgba;
            return rgba;
        };
        ImgGenerator.prototype.SetOriginal = function () {
            this.context.drawImage(this.img, 0, 0, this.img.width, this.img.height);
        };
        ImgGenerator.prototype.Invert = function () {
            var imgData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            var data = imgData.data;
            for (var i = 0; i < data.length; i += 4) {
                //* Fórmula = 255 - rgb value
                data[i] = 255 - data[i]; //? Red
                data[i + 1] = 255 - data[i + 1]; //? Green
                data[i + 2] = 255 - data[i + 2]; //? Blue
            }
            this.context.putImageData(imgData, 0, 0);
        };
        ImgGenerator.prototype.SetGrayscale = function () {
            var imgData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            var data = imgData.data;
            for (var i = 0; i < data.length; i += 4) {
                //* Fórmula = (red + green + blue) / 3
                var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = avg; //? Red
                data[i + 1] = avg; //? Green
                data[i + 2] = avg; //? Blue
            }
            this.context.putImageData(imgData, 0, 0);
        };
        ImgGenerator.prototype.SetThreshold = function (threshold) {
            var imgData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            var data = imgData.data;
            for (var i = 0; i < data.length; i += 4) {
                //* Fórmula = (red + green + blue) / 3
                var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = avg; //? Red
                data[i + 1] = avg; //? Green
                data[i + 2] = avg; //? Blue
                if (data[i] > threshold)
                    data[i] = 255;
                else
                    data[i] = 0;
                if (data[i + 1] > threshold)
                    data[i + 1] = 255;
                else
                    data[i + 1] = 0;
                if (data[i + 2] > threshold)
                    data[i + 2] = 255;
                else
                    data[i + 2] = 0;
            }
            this.context.putImageData(imgData, 0, 0);
        };
        ImgGenerator.prototype.SetThresholdWithoutBW = function (threshold) {
            var imgData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            var data = imgData.data;
            for (var i = 0; i < data.length; i += 4) {
                if (data[i] > threshold)
                    data[i] = 255;
                else
                    data[i] = 0;
                if (data[i + 1] > threshold)
                    data[i + 1] = 255;
                else
                    data[i + 1] = 0;
                if (data[i + 2] > threshold)
                    data[i + 2] = 255;
                else
                    data[i + 2] = 0;
            }
            this.context.putImageData(imgData, 0, 0);
        };
        ImgGenerator.prototype.LogarithmicTransform = function (maxPixelValue) {
            var imgData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            var data = imgData.data;
            var higher = Math.log(1 + this.GetHighestRGBValue());
            var c = maxPixelValue / Math.log(1 + higher);
            for (var i = 0; i < data.length; i += 4) {
                //* Fórmula = log(pixel + 1) * c
                data[i] = Math.log(data[i] + 1) * c;
                data[i + 1] = Math.log(data[i + 1] + 1) * c;
                data[i + 2] = Math.log(data[i + 2] + 1) * c;
            }
            this.context.putImageData(imgData, 0, 0);
        };
        ImgGenerator.prototype.InverseLogarithmicTransform = function (maxPixelValue) {
            var imgData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            var data = imgData.data;
            var b = 0.1;
            var c = maxPixelValue / Math.log(1 + (b * this.GetHighestRGBValue()));
            for (var i = 0; i < data.length; i += 4) {
                //* Fórmula = (exp(pixel) ^ (c / 1)) - 1
                data[i] = (Math.pow(Math.exp(data[i]), (1 / c))) - 1;
                data[i + 1] = (Math.pow(Math.exp(data[i + 1]), (1 / c))) - 1;
                data[i + 2] = (Math.pow(Math.exp(data[i + 2]), (1 / c))) - 1;
            }
            this.context.putImageData(imgData, 0, 0);
        };
        ImgGenerator.prototype.GetHighestRGBValue = function () {
            var imgData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            var data = imgData.data;
            var highestValue = 0;
            for (var i = 0; i < data.length; i++) {
                if (data[i] > highestValue)
                    highestValue = data[i];
            }
            return highestValue;
        };
        return ImgGenerator;
    }());
    var img = new ImgGenerator('./img/sus.png');
    img.Invert();
    var btn = document.querySelector('#invert');
    btn === null || btn === void 0 ? void 0 : btn.addEventListener('click', function () {
        img.Invert();
    });
    var btn2 = document.querySelector('#grayscale');
    btn2 === null || btn2 === void 0 ? void 0 : btn2.addEventListener('click', function () {
        img.SetGrayscale();
    });
    var btnReset = document.querySelector('#reset');
    btnReset === null || btnReset === void 0 ? void 0 : btnReset.addEventListener('click', function () {
        img.SetOriginal();
    });
    var btnThreshold = document.querySelector('#threshold');
    var thresholdVal = document.querySelector('#threshold-val');
    var thresholdLabel = document.querySelector('#threshold-label');
    var logVal = document.querySelector('#log-val');
    var logLabel = document.querySelector('#log-label');
    thresholdVal === null || thresholdVal === void 0 ? void 0 : thresholdVal.addEventListener('change', function () {
        thresholdLabel.innerHTML = thresholdVal.value;
    });
    logVal === null || logVal === void 0 ? void 0 : logVal.addEventListener('change', function () {
        logLabel.innerHTML = logVal.value;
    });
    btnThreshold === null || btnThreshold === void 0 ? void 0 : btnThreshold.addEventListener('click', function () {
        img.SetOriginal();
        img.SetThreshold(Number(thresholdVal.value));
    });
    var btnThreshold2 = document.querySelector('#threshold2');
    btnThreshold2 === null || btnThreshold2 === void 0 ? void 0 : btnThreshold2.addEventListener('click', function () {
        img.SetOriginal();
        img.SetThresholdWithoutBW(Number(thresholdVal.value));
    });
    var btnLog = document.querySelector('#logtransform');
    btnLog === null || btnLog === void 0 ? void 0 : btnLog.addEventListener('click', function () {
        img.LogarithmicTransform(Number(logVal.value));
    });
    var btnInvLog = document.querySelector('#invlogtransform');
    btnInvLog === null || btnInvLog === void 0 ? void 0 : btnInvLog.addEventListener('click', function () {
        img.InverseLogarithmicTransform(Number(logVal.value));
    });
};
