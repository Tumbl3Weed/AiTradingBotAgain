var convnetjs = require('convnetjs');
var math = require('mathjs');


var log = require('../core/log.js');

var config = require('../core/util.js').getConfig();


/*

  BB strategy - okibcn 2018-01-03

 */
// helpers
var _ = require('lodash');
var log = require('../core/log.js');

var BB = require('./indicators/BB.js');
var rsi = require('./indicators/RSI.js');
const { prevPrice } = require('./neuralnet.js');

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
    prevPrice: 494000,
    trailPrice: 494000,
    // counts the number of triggered stoploss events
    stoplossCounter: 0,

    // if you want the bot to hodl instead of selling during a small dip
    // use the hodl_threshold. e.g. 0.95 means the bot won't sell
    // when unless the price drops below a 5% threshold of the last buy price (this.privPrice)
    hodl_threshold: 0.96,

    // init the strategy
    init: function () {

        this.name = 'NEOBBRSI';
        this.requiredHistory = config.tradingAdvisor.historySize;

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
    },

    update: function (candle) {

        let price = (candle.close + candle.open + candle.high + candle.low) / 4;


    },

    onTrade: function (event) {

        if ('sell' !== event.action) {
            this.indicators.stoploss.long(event.price);
        }
        this.prevAction = event.action;
        this.prevPrice = event.price;
        this.trailPrice = event.price;
    },


    check: function (candle) {

        if (this.candle.close.length < this.requiredHistory) {
            this.prevPrice = this.candle.close;
            return;
        } // check if candle length is correct

        let price = (candle.close + candle.open + candle.high + candle.low) / 4;

        let signalBuy = price >= this.trailPrice;

        // get all indicators
        let ind = this.tulipIndicators,
            maSlow = ind.maSlow.result.result,
            maFast = ind.maFast.result.result,
            rsi = 0,
            ROC_val = ind.ROC_val.result.result;

        // BEAR TREND
        if (maFast < maSlow) {
            rsi = ind.BEAR_RSI.result.result;
            if (rsi > this.settings.BEAR_RSI_high && (this.prevPrice < this.candle.close)) { this.short(); return; }
            else if (rsi < this.settings.BEAR_RSI_low && (this.prevPrice > this.candle.close)) { this.long(); return; }
            if (this.debug) this.lowHigh(rsi, 'bear');
            //log.debug('BEAR-trend');
        }

        // BULL TREND
        else {
            // IDLE-BULL OR REAL-BULL TREND ??
            if (ROC_val <= this.settings.ROC_lvl) {
                // BULL-IDLE TREND
                rsi = ind.IDLE_RSI.result.result;
                if (rsi > this.settings.IDLE_RSI_high && (this.prevPrice < this.candle.close)) { this.short(); return; }
                else if (rsi < this.settings.IDLE_RSI_low && (this.prevPrice > this.candle.close)) { this.long(); return; }
                if (this.debug) this.lowHigh(rsi, 'idle');
                //log.debug('IDLE-trend');
            }
            // REAL BULL TREND
            else {
                rsi = ind.BULL_RSI.result.result;
                if (rsi > this.settings.BULL_RSI_high && (this.prevPrice < this.candle.close)) { this.short(); return; }
                else if (rsi < this.settings.BULL_RSI_low && (this.prevPrice > this.candle.close)) { this.long(); return; }
                if (this.debug) this.lowHigh(rsi, 'bull');
                //log.debug('BULL-trend');
            }
        }


        //=====================BBRSI
        var BB = this.indicators.bb;

        this.nsamples++;

        var BBrsirsi = this.indicators.rsi;
        var rsiVal = BBrsirsi.result;

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


        if ('sell' !== this.prevAction && 'stoploss' === this.indicators.stoploss.action && price > this.trailPrice * this.settings.stoploss_threshold) {

        }

        if ('buy' !== this.prevAction && prediction <= BB.lower && rsiVal <= this.settings.thresholds.low) {

        }

        if ('sell' !== this.prevAction && price >= BB.middle && rsiVal >= this.settings.thresholds.high && 'stoploss' === this.indicators.stoploss.action) {

        }

        // this.trend = {
        //   zone: zone,  // none, top, high, low, bottom
        //   duration: 0,
        //   persisted: false
        //BBRSI

        if ('sell' === this.prevAction || 'wait' === this.prevAction) {
            //log.debug("Current price = " + price + " mod CP =" + price * this.settings.threshold_buy + " vs TrailPrice " + this.trailPrice);
            if (price < this.trailPrice) {
                this.trailPrice = price;
            }
            return;
        }
        if ('buy' === this.prevAction) {
            //log.debug("Current price = " + price + " mod CP =" + price * this.settings.threshold_buy + " vs TrailPrice " + this.trailPrice);
            if (price * this.settings.threshold_buy > this.trailPrice) {
                this.trailPrice = price * this.settings.threshold_buy;
            }
        }
    },

    end: function () {
        //log.debug('Triggered stoploss',this.stoplossCounter,'times');
        console.log('Triggered stoploss' + this.stoplossCounter + 'times');
    }
};

module.exports = strategy;
