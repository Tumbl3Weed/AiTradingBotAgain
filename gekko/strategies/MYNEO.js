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
var util = require('../core/util.js');
var config = require('../core/util.js').getConfig();
var async = require('async');

// strategy
var strat = {
    /* INIT */
    init: function () {
        this.name = 'NEO';
        this.requiredHistory = config.tradingAdvisor.historySize;
        this.resetTrend();
        this.trend.direction = 'up';
        this.prevPrice = 0;
        this.decisionArea = 'idle';
        // debug? set to flase to disable all logging (improves performance)
        this.debug = false;
        this.settings.ambition = 0;
        stochHigh = this.settings.stoch_high || 80;
        stochLow = this.settings.stoch_low || 20;
        usingStoch = this.settings.usingStoch || true;
        usingRsiVol = this.settings.usingRsiVol || true;
        usingRsiVolOpposite = this.settings.usingRsiVolOpposite || true;
        if (usingStoch) {
            this.addTulipIndicator('stoch', 'stoch', { optInFastKPeriod: this.settings.optInFastKPeriod, optInSlowKPeriod: this.settings.optInFastKPeriod, optInSlowDPeriod: this.settings.optInSlowDPeriod });
        }
        this.addTulipIndicator('ema', 'ema', { optInTimePeriod: this.settings.ema || 10 });
        if (usingRsiVol) {
            this.addTulipIndicator('rsiVolume', 'rsiVolume', { optInTimePeriod: this.settings.rsiVolume || 10 })
        }
        // this.addTulipIndicator('BULL_RSI', 'rsi', { optInTimePeriod: this.settings.BULL_RSI });
        if (this.settings.usingVWP) {
            this.addTulipIndicator('IDLE_RSI', 'rsivwp', { optInTimePeriod: this.settings.IDLE_RSI });
            this.addTulipIndicator('IDLE_RSISLOW', 'rsivwp', {
                optInTimePeriod: this.settings.IDLE_RSISLOW + this.settings.IDLE_RSI
            });
        } else {
            this.addTulipIndicator('IDLE_RSI', 'rsi', { optInTimePeriod: this.settings.IDLE_RSI });
            this.addTulipIndicator('IDLE_RSISLOW', 'rsi', {
                optInTimePeriod: this.settings.IDLE_RSISLOW + this.settings.IDLE_RSI
            });
        }
        this.settings.rsiVolume_high = this.settings.rsiVolume_high || 2;
        this.settings.rsiVolume_low = this.settings.rsiVolume_low || 0.01;
        // this.addTulipIndicator('BEAR_RSI', 'rsi', { optInTimePeriod: this.settings.BEAR_RSI });
        // this.addTulipIndicator('ROC_val', 'roc', { optInTimePeriod: this.settings.ROC });
        // debug stuff
        this.startTime = new Date();
        this.stat = {
            bear: { min: 100, max: 0 },
            bull: { min: 100, max: 0 },
            idle: { min: 100, max: 0 }
        };
    }, // init()
    processRoundT: function (roundTrip) {


        // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!    Ambition Value Has Been ALTERED to: ', this.settings.ambition);
    },

    processTradeCompleted: function (trade) {
        this.strategy.processTrade(trade);
    },

    processTrade: function (trade) {
        this.resetTrend();
        if (trade.action === 'sell') {
            this.trend.direction = 'down';
        } else {
            this.trend.direction = 'up';
        }
        this.prevPrice = trade.effectivePrice;
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

        if (this.candle.close.length < this.requiredHistory) {
            return;
        } // check if candle length is correct

        if (!this.prevPrice) {
            this.prevPrice = this.candle.close;
        }
        var thisPrice = this.candle.vwp;

        // get all indicators
        let ind = this.tulipIndicators,
            // maSlow = ind.maSlow.result.result,
            // maFast = ind.maFast.result.result,
            rsi = 0,
            rsiSlow = 0;
        // ROC_val = ind.ROC_val.result.result;
        let bearbull = (this.candle.high - ind.ema.result.result) - (this.candle.low - ind.ema.result.result);
        rsi = ind.IDLE_RSI.result.result;
        rsiSlow = ind.IDLE_RSISLOW.result.result;
        if (usingRsiVol) {
            rsiVol = ind.rsiVolume.result.result;
        }
        if (usingStoch) {
            stochk = ind.stoch.result.k;
            stochd = ind.stoch.result.d;
        }
        let modval = this.settings.rsimod || 2;
        let mod = ((rsi / rsiSlow) + (modval - 1)) / modval;
        let oppositeDecision = false;
        if (usingRsiVol) {
            if (usingRsiVolOpposite) {
                if (rsiVol > this.settings.rsiVolume_high)
                    oppositeDecision = true;
            } else if (rsiVol > this.settings.rsiVolume_high || rsiVol < this.settings.rsiVolume_low) {
                return;
            }
        }

        if (usingStoch) {
            if (stochd - stochk > stochHigh) {
                this.sell(thisPrice)
            }
            if (stochk - stochd > stochLow) {
                this.buy(thisPrice)
            }
        }

        if (bearbull > 0) {
            if (rsi < this.settings.IDLE_RSI_low * mod) {
                // console.log('idle buy');
                if (!oppositeDecision)
                    this.buy(thisPrice)
                else
                    this.sell(thisPrice)
            }
            if (rsi > this.settings.IDLE_RSI_high * mod) {
                // console.log('idle buy');
                if (!oppositeDecision)
                    this.sell(thisPrice)
                else
                    this.buy(thisPrice)
            }
        } else {
            if (rsi < this.settings.BEAR_RSI_low * mod) {
                // console.log('idle buy');
                if (!oppositeDecision)
                    this.bearbuy(thisPrice)
                else
                    this.bearsell(thisPrice)
            }
            if (rsi > this.settings.BEAR_RSI_high * mod) {
                // console.log('idle buy');
                if (!oppositeDecision)
                    this.bearsell(thisPrice)
                else
                    this.bearbuy(thisPrice)
            }
        }

    }, // check()

    buy: function (thisPrice) {
        baseBuyAmbitionVal = this.settings.baseBuyAmbitionVal;
        if (thisPrice < this.prevPrice * 0.76) {
            return this.advice('long', thisPrice, true); //instant buy(takeProfit if available)
        }
        else {
            if (thisPrice < this.prevPrice * baseBuyAmbitionVal) return this.advice('long', thisPrice, true);
        }
    },
    bearbuy: function (thisPrice) {
        bearBuyAmbitionVal = this.settings.bearBuyAmbitionVal;
        // console.log('checking this price < prevPrice* bearBuyAmbitionVal = ', thisPrice, ' < ', this.prevPrice * bearBuyAmbitionVal, ' = ', thisPrice < this.prevPrice * bearBuyAmbitionVal);

        if (thisPrice < this.prevPrice * 0.76) {
            return this.advice('long', thisPrice, true); //instant buy(takeProfit if available)
        }
        else {
            if (thisPrice < this.prevPrice * bearBuyAmbitionVal) return this.advice('long', thisPrice, true);
            // console.log('checking this price < prevPrice* bearBuyAmbitionVal = ' + thisPrice + ' < ' + this.prevPrice * bearBuyAmbitionVal + ' = ' + thisPrice < this.prevPrice * bearBuyAmbitionVal);
        }
    },

    sell: function (thisPrice) {
        baseSellAmbitionVal = this.settings.baseSellAmbitionVal;
        if (thisPrice > this.prevPrice * 1.24) {
            return this.advice('short', thisPrice, true); //instant sell  (takeProfit if available)
        }
        else {
            if (thisPrice > this.prevPrice * baseSellAmbitionVal) return this.advice('short', thisPrice, true);
        }
    },
    bearsell: function (thisPrice) {
        bearSellAmbitionVal = this.settings.bearSellAmbitionVal;
        // console.log('checking this price > prevPrice* bearSellAmbitionVal = ' + thisPrice + ' > ' + this.prevPrice * bearSellAmbitionVal + ' = ' + (thisPrice > this.prevPrice * bearSellAmbitionVal).toString());

        if (thisPrice > this.prevPrice * 1.24) {
            return this.advice('short', thisPrice, true); //instant sell  (takeProfit if available)
        }
        else {
            if (thisPrice > this.prevPrice * bearSellAmbitionVal) {

                return this.advice('short', thisPrice, true);
            }
            // console.log('checking this price > prevPrice* bearSellAmbitionVal = ' + thisPrice + ' > ' + this.prevPrice * bearSellAmbitionVal + ' = ' + thisPrice > this.prevPrice * bearSellAmbitionVal);
        }
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