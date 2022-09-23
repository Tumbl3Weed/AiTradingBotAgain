// Downloaded from: https://github.com/xFFFFF/Gekko-Strategies

// Source: https://raw.githubusercontent.com/gcobs0834/gekko/develop/strategies/NEO.js
/*
   RSI Bull and Bear
   Use different RSI-strategies depending on a longer trend
   3 feb 2017
   
   (CC-BY-SA 4.0) Tommie Hansen
   https://creativecommons.org/licenses/by-sa/4.0/
*/

// req's
var log = require('../core/log.js');
var config = require('../core/util.js').getConfig();
var util = require('../core/util.js');

// strategy
var strategy = {
    /* INIT */
    init: function () {
        this.name = 'EMAWIN';
        this.requiredHistory = config.tradingAdvisor.historySize;
        this.lastEmaVal = 0;
        this.previousDirection = '';
        // debug? set to flase to disable all logging (improves performance)
        this.debug = false;
        this.lastAction = 'long';
        this.addIndicator('stoploss', 'StopLoss', { threshold: this.settings.stoploss_threshold, action: 'stoploss' });
        this.addTulipIndicator('tema', 'tema', { optInTimePeriod: this.settings.tema });
        this.addTulipIndicator('ema', 'ema', { optInTimePeriod: this.settings.tema });
        this.startTime = new Date();
    },

    // update: function (candle) {
    //     this.indicators.tema.update(candle.close);
    //     this.indicators.ema.update(candle.close);
    // },

    processTradeCompleted: function (trade) {
        this.strategy.processTrade(trade);
    },

    processTrade: function (trade) {
        if (trade.action === "buy") {   //used for GA
            this.lastAction = 'long';   //used for GA
        } else if (trade.action === "sell") {
            this.lastAction = 'short';
        }
    },

    check: function (candle) {

        let ind = this.tulipIndicators;
        // console.log(ind.tema.result.result, ' and ', ind.ema.result.result);
        // console.log(this.candle, ' and ', this.requiredHistory);
        let tema = ind.tema.result.result;
        let ema = ind.ema.result.result;

        if (!tema) return;

        if (!ema) return;

        let thisEmaVal = tema / ema;
        thisEmaVal = thisEmaVal;
        if (!this.lastEmaVal) {
            this.lastEmaVal = thisEmaVal;
        }
        // console.log('this Ema', thisEmaVal)
        if (thisEmaVal / this.lastEmaVal > this.settings.upperVal) {
            // if (this.previousDirection === 'down')
            this.long();
            this.previousDirection = 'up';
        } else if (thisEmaVal / this.lastEmaVal < this.settings.lowerVal) {
            if ('stoploss' === this.indicators.stoploss.action) { //&& this.previousDirection === 'down') {
                this.short();
            }
            this.previousDirection = 'down';
        }
        this.lastEmaVal = thisEmaVal;
    }, // check()

    /* LONG */
    long: function () {
        let buyPrice = this.candle.close * this.settings.buyPriceMod;
        this.indicators.stoploss.long(buyPrice);
        return this.advice('long', buyPrice, true);
        //log.debug('go long');
    },
    processRoundT: function (roundTrip) { },

    /* SHORT */
    short: function () {
        // new trend? (else do things)
        let sellPrice = this.candle.close * this.settings.sellPriceMod;
        return this.advice('short', sellPrice, true);
    },


    /* END backtest */
    end: function () {
        let seconds = ((new Date() - this.startTime) / 1000),
            minutes = seconds / 60,
            str;

        minutes < 1 ? str = seconds + ' seconds' : str = minutes + ' minutes';

        log.debug('Finished in ' + str);
    }

};

module.exports = strategy;