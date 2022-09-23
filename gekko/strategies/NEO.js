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
var strat = {

    /* INIT */
    init: function () {
        this.ambition = 10;
        this.name = 'RSI Bull and Bear';
        this.requiredHistory = config.tradingAdvisor.historySize;
        this.resetTrend();
        this.prevPrice = 0;
        // debug? set to flase to disable all logging (improves performance)
        this.debug = false;
        this.lastAction = 'long';
        this.addIndicator('stoploss', 'StopLoss', {
            threshold: this.settings.stoploss_threshold,
            action: 'stoploss'
        });

        // add indicators
        // this.addTulipIndicator('maSlow', 'sma', { optInTimePeriod: this.settings.SMA_long });
        // this.addTulipIndicator('maFast', 'sma', { optInTimePeriod: this.settings.SMA_short });
        // this.addTulipIndicator('BULL_RSI', 'rsi', { optInTimePeriod: 2 });
        // this.addTulipIndicator('IDLE_RSI', 'rsi', { optInTimePeriod: 2 });

        this.addTulipIndicator('BEAR_RSI', 'rsi', { optInTimePeriod: 2 });
        // this.addTulipIndicator('ROC_val', 'roc', { optInTimePeriod: this.settings.ROC });
        this.addTulipIndicator('IDLE_RSISLOW', 'rsi', { optInTimePeriod: 9 });//this.settings.IDLE_RSI });
        this.addTulipIndicator('ema', 'ema', { optInTimePeriod: 10 });
        // debug stuff
        this.startTime = new Date();
        this.stat = {
            bear: { min: 100, max: 0 },
            bull: { min: 100, max: 0 },
            idle: { min: 100, max: 0 }
        };

        this.lowCandles;
        this.highCandles;
    }, // init()

    processTradeCompleted: function (trade) {
        this.strategy.processTrade(trade);
    },
    processTrade: function (trade) {
        this.resetTrend();
        if (trade.action === "buy") {   //used for GA
            this.lastAction = 'long';   //used for GA
            this.prevPrice = trade.price;
            this.indicators.stoploss.long(trade.price);
            // console.log('PREV PRICE SET TO: ', this.prevPrice);
        } else if (trade.action === "sell") {
            this.lastAction = 'short';
        }
    },
    /* RESET TREND */
    resetTrend: function () {
        var trend = {
            duration: 0,
            direction: 'none',
            longPos: false,
        };

        this.trend = trend;
    },

    /* CHECK */
    check: function () {
        if (this.candle.close.length < this.requiredHistory) { console.log('setPrevPrice'); this.prevPrice = this.candle.close; return; } // check if candle length is correct
        if (this.prevPrice === 0) {
            this.prevPrice = this.candle.close;
            console.log('setPrevPrice');
        }
        // get all indicators
        let ind = this.tulipIndicators;
        let bearbull = (this.candle.high - ind.ema.result.result) - (this.candle.low - ind.ema.result.result);
        let modval = (ind.BEAR_RSI.result.result / ind.IDLE_RSISLOW.result.result + (this.settings.rsimod - 1)) / this.settings.rsimod;
        modval = modval ** this.settings.rsimodEponent;


        rsi = ind.BEAR_RSI.result.result;
        if (bearbull > 0) {
            if (rsi > this.settings.BEAR_RSI_high * modval && this.prevPrice * (1 - (this.ambition / 100)) <= this.candle.close && 'stoploss' === this.indicators.stoploss.action) return this.short();
            else if (rsi < this.settings.BEAR_RSI_low * modval) return this.long();
        }
        else {
            if (rsi > this.settings.BEAR_RSI_high * modval && 'stoploss' === this.indicators.stoploss.action) return this.short();
            else if (rsi < this.settings.BEAR_RSI_low * modval && this.prevPrice * (1 + (this.ambition / 100)) >= this.candle.close) return this.long();
        }
    }, // check()

    /* LONG */
    long: function () {
        this.resetTrend();
        this.trend.direction = 'up';
        let buyPrice = this.candle.close * this.settings.buyPriceMod;

        return this.advice('long', buyPrice * 2, true);
        //log.debug('go long');
    },
    short: function () {
        // new trend? (else do things)
        this.resetTrend();
        this.trend.direction = 'down';

        let sellPrice = this.candle.close * this.settings.sellPriceMod;
        return this.advice('short', sellPrice / 2, true);
    },
    processRoundT: function (roundTrip) {
        if (roundTrip.profit > 0)
            this.ambition += (roundTrip.profit / 2);
        else
            this.ambition += roundTrip.profit;
    },




    /* END backtest */
    end: function () {

        let seconds = ((new Date() - this.startTime) / 1000),
            minutes = seconds / 60,
            str;

        minutes < 1 ? str = seconds + ' seconds' : str = minutes + ' minutes';

        log.debug('Finished in ' + str);

        if (this.debug) {
            let stat = this.stat;
            log.debug('RSI low/high for period:');
            log.debug('BEAR low/high: ' + stat.bear.min + ' / ' + stat.bear.max);
            log.debug('BULL low/high: ' + stat.bull.min + ' / ' + stat.bull.max);
            log.debug('IDLE low/high: ' + stat.idle.min + ' / ' + stat.idle.max);
        }
    }

};

module.exports = strat;