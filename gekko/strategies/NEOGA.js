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
const Ga = require('../gekkoga/index.js');
const fs = require('fs');
const { debug } = require('console');

// strategy
var stratNeoGA = {

    /* INIT */
    init: function () {
        this.updatedYet = false;
        this.name = 'NEOGA';
        config.candleSize = this.settings.candleSize;
        this.runThisGA();
        this.requiredHistory = config.tradingAdvisor.historySize;
        this.resetTrend();
        this.trend.direction = 'up';

        this.decisionArea = 'idle';
        // debug? set to flase to disable all logging (improves performance)
        this.debug = false;
        this.settings.ambition = 0;

        // debug stuff

        this.startTime = new Date();
        this.stat = {
            bear: { min: 100, max: 0 },
            bull: { min: 100, max: 0 },
            idle: { min: 100, max: 0 }
        };
        this.ga = null;

        usingStoch = this.settings.usingStoch || true;
        usingRsiVol = this.settings.usingRsiVol || true;
        usingRsiVolOpposite = this.settings.usingRsiVolOpposite || true;
        stochHigh = this.settings.stoch_high || 80;
        stochLow = this.settings.stoch_low || 20;
        this.addTulipIndicator('stoch', 'stoch', { optInFastKPeriod: this.settings.optInFastKPeriod || 12, optInSlowKPeriod: this.settings.optInSlowKPeriod || 3, optInSlowDPeriod: this.settings.optInSlowDPeriod || 3 });
        this.addTulipIndicator('ema', 'ema', { optInTimePeriod: this.settings.ema || 10 });
        this.addTulipIndicator('rsiVolume', 'rsiVolume', { optInTimePeriod: this.settings.rsiVolume || 10 })
        // this.addTulipIndicator('BULL_RSI', 'rsi', { optInTimePeriod: this.settings.BULL_RSI });
        if (this.settings.usingVWP) {
            this.addTulipIndicator('IDLE_RSI', 'rsivwp', { optInTimePeriod: this.settings.IDLE_RSI });
            this.addTulipIndicator('IDLE_RSISLOW', 'rsivwp', { optInTimePeriod: this.settings.IDLE_RSISLOW });
        } else {
            this.addTulipIndicator('IDLE_RSI', 'rsi', { optInTimePeriod: this.settings.IDLE_RSI });
            this.addTulipIndicator('IDLE_RSISLOW', 'rsi', { optInTimePeriod: this.settings.IDLE_RSISLOW });
        }
        this.settings.rsiVolume_high = this.settings.rsiVolume_high || 2;
        this.settings.rsiVolume_low = this.settings.rsiVolume_low || 0.01;
    }, // init()

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
        this.settings.prevPrice = this.prevPrice;
        console.log("checking if PrevPrice is added", this.settings)
        this.ga.allTimeMaximum.parameters = this.settings;
        console.log("new prev price", this.ga.allTimeMaximum.parameters.prevPrice)
        this.ga.updateFromTheStrategyToHere();//from here to there
    },

    processRoundT: function (roundTrip) {
        if (isNaN(roundTrip.profit))
            return;

        if (roundTrip.profit > 0) {
            this.settings.ambition += roundTrip.profit * this.settings.aboveZeroAmbitionMod;
            if (this.settings.ambition > 2)
                this.settings.ambition *= 0.94 * this.settings.aboveZeroAmbitionMod;
        } else {
            if (this.settings.ambition < 0) {
                this.settings.ambition += roundTrip.profit * this.settings.belowZeroAmbitionMod;
            } else {
                this.settings.ambition += roundTrip.profit * this.settings.aboveZeroAmbitionMod;
            }

        }

        // if (this.settings.ambition  > 3) {
        //     this.settings.ambition  = 3;
        // }

        // if (this.settings.ambition  < -3) {
        //     this.settings.ambition  = -3;
        // }
        // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!    Ambition Value Has Been ALTERED to: ', this.settings.ambition);
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

    /* get lowest/highest for backtest-period */
    lowHigh: function (rsi, type) {
        let cur;
        if (type == 'bear') {
            cur = this.stat.bear;
            if (rsi < cur.min) this.stat.bear.min = rsi; // set new
            if (rsi > cur.max) this.stat.bear.max = rsi;
        }
        else if (type == 'idle') {
            cur = this.stat.idle;
            if (rsi < cur.min) this.stat.idle.min = rsi; // set new
            if (rsi > cur.max) this.stat.idle.max = rsi;
        }

        else {
            cur = this.stat.bull;
            if (rsi < cur.min) this.stat.bull.min = rsi; // set new
            if (rsi > cur.max) this.stat.bull.max = rsi;
        }
    },


    /* CHECK */
    check: function () {
        // console.log(!!this.ga)
        if (this.candle.close.length < this.requiredHistory) {
            return;
        } // check if candle length is correct
        if (this.settings.prevPrice == null || this.settings.prevPrice == undefined) {
            console.log(this.settings.prevPrice + " prev price before set");
            this.settings.prevPrice = this.candle.vwp;
            console.log(this.settings.prevPrice + " prev price after set");
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
        let modval = this.settings.rsimod || 2;
        rsi = ind.IDLE_RSI.result.result;
        rsiSlow = ind.IDLE_RSISLOW.result.result;
        if (usingRsiVol) {
            rsiVol = ind.rsiVolume.result.result;
        }
        if (usingStoch) {
            stochk = ind.stoch.result.k;
            stochd = ind.stoch.result.d;
        };
        let mod = ((rsi / rsiSlow) + (modval - 1)) / modval;
        // console.log("rsi vol = ", rsiVol);
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
        // console.log('checking this price < prevPrice* baseBuyAmbitionVal = ', thisPrice, ' < ', this.prevPrice * this.settings.baseBuyAmbitionVal, ' = ', thisPrice < this.prevPrice * this.settings.baseBuyAmbitionVal);
        baseBuyAmbitionVal = this.settings.baseBuyAmbitionVal;
        if (thisPrice < this.settings.prevPrice * 0.76) {
            return this.advice('long', thisPrice, false); //instant buy(takeProfit if available)
        }
        else {
            if (thisPrice < this.settings.prevPrice * this.settings.baseBuyAmbitionVal) return this.advice('long', thisPrice, false);
            // console.log('checking this price < prevPrice* baseBuyAmbitionVal = ' + thisPrice + ' < ' + this.prevPrice * baseBuyAmbitionVal + ' = ' + thisPrice < this.prevPrice * baseBuyAmbitionVal);
        }
    },
    bearbuy: function (thisPrice) {
        bearBuyAmbitionVal = this.settings.bearBuyAmbitionVal || this.settings.baseBuyAmbitionVal;
        // console.log('checking this price < prevPrice* bearBuyAmbitionVal = ', thisPrice, ' < ', this.prevPrice * this.settings.bearBuyAmbitionVal, ' = ', thisPrice < this.prevPrice * bearBuyAmbitionVal);

        if (thisPrice < this.settings.prevPrice * 0.76) {
            return this.advice('long', thisPrice, false); //instant buy(takeProfit if available)
        }
        else {
            if (thisPrice < this.settings.prevPrice * this.settings.bearBuyAmbitionVal) return this.advice('long', thisPrice, false);
            // console.log('checking this price < prevPrice* bearBuyAmbitionVal = ' + thisPrice + ' < ' + this.prevPrice * bearBuyAmbitionVal + ' = ' + thisPrice < this.prevPrice * bearBuyAmbitionVal);
        }
    },

    sell: function (thisPrice) {
        // console.log('checking this price > prevPrice* baseSellAmbitionVal = ' + thisPrice + ' > ' + this.prevPrice * this.settings.baseSellAmbitionVal + ' = ' + (thisPrice > this.prevPrice * this.settings.baseSellAmbitionVal).toString());
        baseSellAmbitionVal = this.settings.baseSellAmbitionVal;
        if (thisPrice > this.settings.prevPrice * 1.24) {
            return this.advice('short', thisPrice, false); //instant sell  (takeProfit if available)
        }
        else {
            if (thisPrice > this.settings.prevPrice * this.settings.baseSellAmbitionVal) {

                return this.advice('short', thisPrice, false);
            }
            // console.log('checking this price > prevPrice* baseSellAmbitionVal = ' + thisPrice + ' > ' + this.prevPrice * baseSellAmbitionVal + ' = ' + thisPrice > this.prevPrice * baseSellAmbitionVal);
        }
    },
    bearsell: function (thisPrice) {
        bearSellAmbitionVal = this.settings.bearSellAmbitionVal;
        // console.log('checking this price > prevPrice* bearSellAmbitionVal = ' + thisPrice + ' > ' + this.prevPrice * bearSellAmbitionVal + ' = ' + (thisPrice > this.prevPrice * bearSellAmbitionVal).toString());

        if (thisPrice > this.settings.prevPrice * 1.24) {
            return this.advice('short', thisPrice, false); //instant sell  (takeProfit if available)
        }
        else {
            if (thisPrice > this.settings.prevPrice * this.settings.bearSellAmbitionVal) {

                return this.advice('short', thisPrice, false);
            }
            // console.log('checking this price > prevPrice* this.settings.bearSellAmbitionVal = ' + thisPrice + ' > ' + this.prevPrice * bearSellAmbitionVal + ' = ' + thisPrice > this.prevPrice * bearSellAmbitionVal);
        }
    },
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
    },

    sendStratUpdates(parameters) {
        console.log('UPDATE CONFIRMED');

        this.settings = parameters;
        this.addTulipIndicator('stoch', 'stoch', { optInFastKPeriod: this.settings.optInFastKPeriod, optInSlowKPeriod: this.settings.optInSlowKPeriod, optInSlowDPeriod: this.settings.optInSlowDPeriod, isRealTime: true });
        this.addTulipIndicator('ema', 'ema', { optInTimePeriod: this.settings.ema || 10, isRealTime: true });
        this.addTulipIndicator('rsiVolume', 'rsiVolume', { optInTimePeriod: this.settings.rsiVolume || 10, isRealTime: true })
        if (this.settings.usingVWP) {
            this.addTulipIndicator('IDLE_RSI', 'rsivwp', { optInTimePeriod: this.settings.IDLE_RSI, isRealTime: true });//this.settings.IDLE_RSI });
            this.addTulipIndicator('IDLE_RSISLOW', 'rsivwp', { optInTimePeriod: this.settings.IDLE_RSISLOW, isRealTime: true });//this.settings.IDLE_RSI });
        } else {
            this.addTulipIndicator('IDLE_RSI', 'rsi', { optInTimePeriod: this.settings.IDLE_RSI, isRealTime: true });//this.settings.IDLE_RSI });
            this.addTulipIndicator('IDLE_RSISLOW', 'rsi', { optInTimePeriod: this.settings.IDLE_RSISLOW, isRealTime: true });//this.settings.IDLE_RSI });
        }
        console.log(this.settings);
        this.prevPrice = this.settings.prevPrice;
        console.log('With prevprice = ' + this.settings.prevPrice);
        // if (candleSizeChecker != this.settings.candleSize) {
        //     util.die('Calvin the candle size changed so I am resetting!');
        // }

    },

    async runThisGA() {
        let runGAconfig = '';

        runGAconfig = 'gekkoga/config/my-config.js';
        const config = require('../' + runGAconfig);
        this.ga = new Ga(config, runGAconfig, this);

        this.ga.run().catch(err => {
            console.error(err);
            console.log('restarting the GA');
            this.runThisGA();
        });


        console.log(runGAconfig);
        if (!runGAconfig || !fs.existsSync(runGAconfig)) {
            console.error("\n", " error: option `-c --config <config file>' argument or file missing", "\n");
            // process.exit(1);
        }
    }
};

module.exports = stratNeoGA;