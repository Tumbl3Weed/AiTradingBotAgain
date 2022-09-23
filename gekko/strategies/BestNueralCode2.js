var convnetjs = require('convnetjs');
var math = require('mathjs');


var log = require('../core/log.js');

var config = require('../core/util.js').getConfig();

var SMMA = require('./indicators/SMMA.js');

/*

  BB strategy - okibcn 2018-01-03

 */
// helpers
var _ = require('lodash');
var log = require('../core/log.js');

var BB = require('./indicators/BB.js');
var rsi = require('./indicators/RSI.js');

var strategy = {
    // stores the candles
    priceBuffer: [],
    predictionCount: 0,

    batchsize: 1,
    // no of neurons for the layer
    layer_neurons: 10,
    // activaction function for the first layer, when neurons are > 0
    layer_activation: 'tanh',
    // normalization factor
    scale: 1,
    // stores the last action (buy or sell)
    prevAction: 'wait',
    //stores the price of the last trade (buy/sell)
    prevPrice: 0,
    trailPrice: 0,
    // counts the number of triggered stoploss events
    stoplossCounter: 0,

    // if you want the bot to hodl instead of selling during a small dip
    // use the hodl_threshold. e.g. 0.95 means the bot won't sell
    // when unless the price drops below a 5% threshold of the last buy price (this.privPrice)
    hodl_threshold: 0.96,

    // init the strategy
    init: function () {

        this.name = 'Neural Network Cal';
        this.requiredHistory = config.tradingAdvisor.historySize;
        this.lastPredictionLossPercent = 100;
        this.bestLossPercent = 100;
        this.lastPrediction = 1;
        this.predictionMinPercent = this.settings.minPredictionAccuracy;
        // smooth the input to reduce the noise of the incoming data
        this.SMMA = new SMMA(3);
        this.SMMA2 = new SMMA(9);

        let layers = [
            { type: 'input', out_sx: 1, out_sy: 1, out_depth: 1 },
            { type: 'fc', num_neurons: this.layer_neurons, activation: this.layer_activation },
            { type: 'fc', num_neurons: this.layer_neurons, activation: this.layer_activation },
            { type: 'fc', num_neurons: this.layer_neurons, activation: this.layer_activation },
            { type: 'fc', num_neurons: this.layer_neurons, activation: this.layer_activation },
            { type: 'regression', num_neurons: 1 }
        ];

        this.nn = new convnetjs.Net();

        this.nn.makeLayers(layers);
        this.trainer = new convnetjs.SGDTrainer(this.nn, {
            method: 'adadelta',
            learning_rate: this.settings.learning_rate,
            momentum: this.settings.momentum,
            batch_size: this.batchsize,
            l2_decay: this.settings.decay
        });

        this.addIndicator('stoploss', 'StopLoss', {
            threshold: this.settings.stoploss_threshold,
            action: 'stoploss'
        });

        //=====BBRSI=====
        this.nsamples = 0;
        this.trend = {
            zone: 'none',  // none, top, high, low, bottom
            duration: 0,
            persisted: false
        };

        this.requiredHistory = this.tradingAdvisor.historySize;

        // define the indicators we need
        console.log(this.settings.bbands);
        this.addIndicator('bb', 'BB', this.settings.bbands);
        this.addIndicator('rsi', 'RSI', this.settings);
        //=====BBRSI=====

        this.hodl_threshold = this.settings.hodl_threshold;
    },

    learn: function () {

        for (let i = 1; i < this.priceBuffer.length; i++) {
            let current_price = [this.priceBuffer[i]];
            //let testVal = Math.random();
            let testVal = this.priceBuffer[i - 1];
            let vol = new convnetjs.Vol([testVal]);
            this.trainer.train(vol, current_price);
            this.nn.forward(vol);
            this.predictionCount++;
        }

    },

    setNormalizeFactor: function (candle) {
        this.scale = Math.pow(10, Math.trunc(candle.vwp).toString().length + 2);
        //log.debug('Set normalization factor to',this.scale);
    },

    update: function (candle) {
        let price = candle.vwp;
        // play with the candle values to finetune this
        this.SMMA.update(price);
        let smmaFast = this.SMMA.result;
        this.setNormalizeFactor(candle);

        if (smmaFast / this.scale != 0)
            this.priceBuffer.push(smmaFast / this.scale);

        if (2 > this.priceBuffer.length) return;

        for (tweakme = 0; tweakme < 20; ++tweakme)
            this.learn();
    },

    onTrade: function (event) {

        if ('sell' !== event.action) {
            this.indicators.stoploss.long(event.price);
        }
        // store the previous action (buy/sell)
        // console.log(this.prevAction + ' Now we -> '+event.action);
        this.prevAction = event.action;
        // store the price of the previous trade
        this.prevPrice = event.price;
        this.trailPrice = event.price;
    },

    predictCandle: function () {
        let vol = new convnetjs.Vol(this.priceBuffer);
        let prediction = this.nn.forward(vol);
        return prediction.w[0];
    },

    check: function (candle) {

        if (this.predictionCount < this.settings.min_predictions) {
            return;
        }

        if (this.lastPredictionLossPercent < 10) {
            for (tweakme = 0; tweakme < 20; ++tweakme)
                this.learn();
        }

        let price = candle.close;

        this.lastPredictionLossPercent = Math.abs(100 - ((price / this.lastPrediction) * 100));
        if (this.bestLossPercent * 0.95 > this.lastPredictionLossPercent) {
            this.bestLossPercent = this.lastPredictionLossPercent;
            console.log('!!!!!!!!!!!!!!best prediction so far = ' + this.bestLossPercent + '!!!!!!!!!!!!!!!');
        }
        //log.info(this.lastPredictionLossPercent);


        let prediction = this.predictCandle() * this.scale;
        this.lastPrediction = prediction;
        let meanp = math.mean(prediction, price);
        let meanAlpha = ((meanp - price) / price) * 100;



        //stopneuralloss
        if ('sell' !== this.prevAction) {

            if (price * 0.9975 > this.trailPrice) {
                this.trailPrice = Math.round(price * 0.9975);
            }
        }
        if ('buy' !== this.prevAction) {
            if (Math.round(price * 1.0025) < this.trailPrice) {
                this.trailPrice = price * 1.0025;
            }
        }

        // sell only if the price is higher than the buying price or if the price drops below the threshold
        // a hodl_threshold of 1 will always sell when the NN predicts a drop of the price. play with it!
        let signalBuy = price > this.trailPrice;

        let signalPredictisDown = meanp < this.trailPrice; //false means buy true means sell, rising price prediction.

        //stoploss
        if ('sell' !== this.prevAction
            && 'stoploss' === this.indicators.stoploss.action
        ) {
            console.log(this.lastPredictionLossPercent + ' and ' + this.predictionMinPercent);
            if (this.lastPredictionLossPercent < this.predictionMinPercent) {
                console.log(this.lastPredictionLossPercent + ' nueral loss trigger');

                if (signalPredictisDown) {

                    this.stoplossCounter++;
                    //log.debug('>>>>>>>>>> STOPLOSS triggered <<<<<<<<<<');
                    console.log('>>>>>>>>>> STOPLOSS triggered with nueral<<<<<<<<<<' + candle.close);
                    return this.advice('short');
                }
            }
            // else {
            //   console.log(this.lastPredictionLossPercent + ' normal loss trigger');
            //   this.stoplossCounter++;
            //   //log.debug('>>>>>>>>>> STOPLOSS triggered <<<<<<<<<<');
            //   console.log('>>>>>>>>>> STOPLOSS triggered <<<<<<<<<<' + candle.close);
            //   return this.advice('short');
            // }

        }
        var usingNueral = false;
        if (this.lastPredictionLossPercent < this.predictionMinPercent) { //only if we are accurate enough use nueral logic
            usingNueral = true;
            // console.log(signalBuy + ': was the signal and the prediction was :'+this.lastPredictionLossPercent);
            if ('buy' !== this.prevAction)
                if (!signalPredictisDown || signalBuy) {
                    //console.log('signalSell '+signalSell +',signalBuy '+ signalBuy + ',signalPredictisDown '+signalPredictisDown);   
                    log.debug("Buy - Predicted variation: ", meanAlpha);
                    console.log("Buy - Predicted variation: " + meanAlpha);
                    log.debug('nueral buy' + this.lastPredictionLossPercent);
                    return this.advice('long');
                } else if ('sell' !== this.prevAction && signalPredictisDown && 'stoploss' === this.indicators.stoploss.action) {
                    //console.log('signalSell '+signalSell +',signalBuy '+ signalBuy + ',signalPredictisDown '+signalPredictisDown);
                    log.debug("Sell - Predicted variation: ", meanAlpha);
                    console.log("Sell - Predicted variation: " + meanAlpha);
                    log.debug('nueral sell' + this.lastPredictionLossPercent);
                    return this.advice('short');
                }

        }

        //=====================BBRSI
        var BB = this.indicators.bb;

        this.nsamples++;

        var rsi = this.indicators.rsi;
        var rsiVal = rsi.result;

        // price Zone detection
        this.nsamples++;


        // price Zone detection
        var zone = 'none';
        if (price >= BB.upper) zone = 'top';
        if ((price < BB.upper) && (price >= BB.middle)) zone = 'high';
        if ((price > BB.lower) && (price < BB.middle)) zone = 'low';
        if (price <= BB.lower) zone = 'bottom';
        //log.debug('current zone:  ', zone);
        //log.debug('current trend duration:  ', this.trend.duration);

        if (this.trend.zone == zone) {
            this.trend = {
                zone: zone,  // none, top, high, low, bottom
                duration: this.trend.duration + 1,
                persisted: true
            }
        }
        else {
            this.trend = {
                zone: zone,  // none, top, high, low, bottom
                duration: 0,
                persisted: false
            }
        }

        if (!usingNueral && price * 1.01 < this.trailPrice) {
            if ('buy' !== this.prevAction && price <= BB.lower && rsiVal <= this.settings.thresholds.low) {
                log.debug('BBRSI buy');
                return this.advice('long')
            }
        }
        if ('sell' !== this.prevAction && price >= BB.middle && rsiVal >= this.settings.thresholds.high && 'stoploss' === this.indicators.stoploss.action) {
            log.debug('BBRSI sell');
            return this.advice('short')
        }

        // this.trend = {
        //   zone: zone,  // none, top, high, low, bottom
        //   duration: 0,
        //   persisted: false
        //BBRSI


    },

    end: function () {
        //log.debug('Triggered stoploss',this.stoplossCounter,'times');
        console.log('Triggered stoploss' + this.stoplossCounter + 'times');
    }
};

module.exports = strategy;
