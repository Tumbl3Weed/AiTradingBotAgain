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
const GaBinance = require('../gekkoga/indexBinance.js');

// strategy
var stratNeoGABinance = {

    /* INIT */
    init: function () {
        this.name = 'NEOGABinance';
        this.requiredHistory = config.tradingAdvisor.historySize;
        this.runThisGA();
        this.resetTrend();
        this.trend.direction = '';
        this.prevPrice = 0;
        this.decisionArea = 'idle';
        // debug? set to flase to disable all logging (improves performance)
        this.debug = false;
        // this.settings.ambition = 0;
        // add indicators
        // this.addTulipIndicator('maSlow', 'sma', { optInTimePeriod: this.settings.SMA_long });
        // this.addTulipIndicator('maFast', 'sma', { optInTimePeriod: this.settings.SMA_short });
        // this.addTulipIndicator('BULL_RSI', 'rsi', { optInTimePeriod: this.settings.BULL_RSI });

        // debug stuff
        this.startTime = new Date();
        this.stat = {
            bear: { min: 100, max: 0 },
            bull: { min: 100, max: 0 },
            idle: { min: 100, max: 0 }
        };


        this.addTulipIndicator('IDLE_RSI', 'rsi', { optInTimePeriod: this.settings.IDLE_RSI });//this.settings.IDLE_RSI });
        this.addTulipIndicator('IDLE_RSISLOW', 'rsi', { optInTimePeriod: this.settings.IDLE_RSISLOW });//this.settings.IDLE_RSI });

        this.addTulipIndicator('ema', 'ema', { optInTimePeriod: 10 });
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
    },

    processRoundT: function (roundTrip) {
        if (isNaN(roundTrip.profit))
            return;
        if (roundTrip.profit > 0) {
            this.settings.ambition += roundTrip.profit * this.settings.aboveZeroAmbitionMod;
            if (this.settings.ambition > 10)
                this.settings.ambition *= 0.94;
        } else {
            this.settings.ambition += roundTrip.profit * this.settings.belowZeroAmbitionMod;
        }
        // if (this.settings.ambition  > 3) {
        //     this.settings.ambition  = 3;
        // }
        // if (this.settings.ambition  < -3) {
        //     this.settings.ambition  = -3;
        // }
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!    Ambition Value Has Been ALTERED to: ', this.settings.ambition);
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

        if (this.candle.vwp.length < this.requiredHistory) {
            this.prevPrice = this.candle.vwp;
            return;
        } // check if candle length is correct
        // if (this.settings.ambition < -0.25) {        //eager to participate 
        //     if (this.settings.ambition != 0 && Math.abs(Math.round(this.settings.ambition)))
        //         this.settings.ambition += this.settings.belowZeroAmbitionMod / Math.abs(Math.round(this.settings.ambition));
        //     else
        //         this.settings.ambition += this.settings.belowZeroAmbitionMod;
        // } else {
        //     if (this.settings.ambition != 0 && Math.abs(Math.round(this.settings.ambition)))
        //         this.settings.ambition += this.settings.aboveZeroAmbitionMod / Math.abs(Math.round(this.settings.ambition));
        //     else
        //         this.settings.ambition += this.settings.aboveZeroAmbitionMod;
        // }

        if (!this.prevPrice) {
            this.prevPrice = this.candle.vwp;
        }
        var thisPrice = this.candle.vwp;

        // get all indicators
        let ind = this.tulipIndicators,
            // maSlow = ind.maSlow.result.result,
            // maFast = ind.maFast.result.result,
            rsi = 0,
            rsiSlow = 0;
        // ROC_val = ind.ROC_val.result.result;

        let modval = this.settings.rsimod || 2;
        rsi = ind.IDLE_RSI.result.result;
        rsiSlow = ind.IDLE_RSISLOW.result.result;
        let mod = ((rsi / rsiSlow) + (modval - 1)) / modval;
        let volumeMod = Math.abs((this.candle.open - this.candle.vwp)) / this.candle.volume;
        volumeMod *= 10000000000;
        if (this.settings.usingBearBull) {
            let bearbull = (this.candle.high - ind.ema.result.result) + (this.candle.low - ind.ema.result.result);
            if (bearbull > 0) {         //normal buy ambition sell  !!!!!!!!!!!!!!!
                // console.log('condition Bull detected');
                if (thisPrice > this.prevPrice * (this.settings.baseSellAmbitionVal - (this.settings.ambition / 100)))
                    if (rsi > this.settings.IDLE_RSI_high * mod) {// && (this.prevPrice < thisPrice)) {
                        // console.log('idle sell');
                        // if (thisPrice > this.prevPrice * 1.0025) {
                        if (volumeMod)
                            if (volumeMod > this.settings.volumeThreshold) { //sell
                                return this.advice('long', thisPrice, true);
                            } else {
                                return this.advice('short', thisPrice, true);
                            }
                        return this.advice('short', thisPrice, true);
                        //instant sell  (takeProfit if available)
                        // } else {
                        //     return this.advice('short', thisPrice, false);
                        // }
                    }
                if (rsi < this.settings.IDLE_RSI_low * mod) {
                    // console.log('idle buy');
                    // if (thisPrice < this.prevPrice * 0.9975) {
                    if (volumeMod)
                        if (volumeMod > this.settings.volumeThreshold) {    //buy
                            if (thisPrice > this.prevPrice * (this.settings.baseSellAmbitionVal - (this.settings.ambition / 100)))
                                return this.advice('short', thisPrice, true);
                        } else {
                            return this.advice('long', thisPrice, true);
                        }
                    return this.advice('long', thisPrice, true); //instant buy(takeProfit if available)
                    // } else {
                    //     return this.advice('long', thisPrice, false);
                    // }
                }
            } else {                    //ambition buy normal sell  !!!!!!!!!!!!!!!
                // console.log('condition Bear detected');
                if (rsi < this.settings.IDLE_RSI_low * mod) {
                    // console.log('idle buy');
                    // if (thisPrice < this.prevPrice * 0.9975) {
                    if (volumeMod)
                        if (volumeMod > this.settings.volumeThreshold) {    //buy
                            return this.advice('short', thisPrice, true);
                        } else {
                            if (thisPrice < this.prevPrice * (this.settings.baseBuyAmbitionVal + (this.settings.ambition / 100)))
                                return this.advice('long', thisPrice, true);
                        }
                    if (thisPrice < this.prevPrice * (this.settings.baseBuyAmbitionVal + (this.settings.ambition / 100)))
                        return this.advice('long', thisPrice, true);
                    // } else {
                    //     return this.advice('long', thisPrice, false);
                    // }
                }
                if (rsi > this.settings.IDLE_RSI_high * mod) {// && (this.prevPrice < thisPrice)) {
                    // console.log('idle sell');
                    // if (thisPrice > this.prevPrice * 1.0025) {
                    if (volumeMod)
                        if (volumeMod > this.settings.volumeThreshold) { //sell
                            if (thisPrice < this.prevPrice * (this.settings.baseBuyAmbitionVal + (this.settings.ambition / 100)))
                                return this.advice('long', thisPrice, true);
                        } else {
                            return this.advice('short', thisPrice, true);
                        }
                    return this.advice('short', thisPrice, true);
                    // } else {
                    //     return this.advice('short', thisPrice, false);
                    // }
                }
            }
            return;
        }//end of bull bear

        if (this.settings.buyAmbition) {
            if (thisPrice < this.prevPrice * (this.settings.baseBuyAmbitionVal + (this.settings.ambition / 100)))
                if (rsi < this.settings.IDLE_RSI_low * mod) {
                    console.log('idle buy');
                    // if (thisPrice < this.prevPrice * 0.9975) {
                    return this.advice('long', thisPrice, true); //instant buy(takeProfit if available)
                    // } else {
                    //     return this.advice('long', thisPrice, false);
                    // }
                }
        } else {
            if (rsi < this.settings.IDLE_RSI_low * mod) {
                console.log('idle buy');
                // if (thisPrice < this.prevPrice * 0.9975) {
                return this.advice('long', thisPrice, true); //instant buy(takeProfit if available)
                // } else {
                //     return this.advice('long', thisPrice, false);
                // }
            }

        }

        if (this.settings.sellAmbition) {
            if (thisPrice > this.prevPrice * (this.settings.baseSellAmbitionVal - (this.settings.ambition / 100)))
                if (rsi > this.settings.IDLE_RSI_high * mod) {// && (this.prevPrice < thisPrice)) {
                    console.log('idle sell');
                    // if (thisPrice > this.prevPrice * 1.0025) {
                    return this.advice('short', thisPrice, true); //instant sell  (takeProfit if available)
                    // } else {
                    //     return this.advice('short', thisPrice, false);
                    // }
                }
        } else {
            if (rsi > this.settings.IDLE_RSI_high * mod) {// && (this.prevPrice < thisPrice)) {
                console.log('idle sell');
                // if (thisPrice > this.prevPrice * 1.0025) {
                return this.advice('short', thisPrice, true); //instant sell  (takeProfit if available)
                // } else {
                //     return this.advice('short', thisPrice, false);
                // }
            }
        }
        // return this.advice('noAction', thisPrice, true);
        // if (thisPrice > this.prevPrice * (0.99 - (this.settings.ambition  / 100)))
        // if (rsi > this.settings.IDLE_RSI_high * mod) {// && (this.prevPrice < thisPrice)) {
        //     console.log('idle sell');
        //     // if (thisPrice > this.prevPrice * 1.0025) {
        //     return this.advice('short', thisPrice, true); //instant sell  (takeProfit if available)
        //     // } else {
        //     //     return this.advice('short', thisPrice, false);
        //     // }
        // }

        // if (this.debug) this.lowHigh(rsi, 'idle');
        /*
                // BEAR TREND
                if (maFast < maSlow * 0.999999) {
        
                    rsi = ind.BEAR_RSI.result.result;
                    if (thisPrice < this.prevPrice * (1.01 + (this.settings.ambition  / 100)))
                        if (rsi < this.settings.BEAR_RSI_low * (1.01 + (this.settings.ambition  / 200))) {
                            console.log('bear long');
                            // if (thisPrice < this.prevPrice * 0.9975) {
                            return this.advice('long', thisPrice * 1.0025, true); //instant buy(takeProfit if available)
                            // } else {
                            //     return this.advice('long', thisPrice, false);
                            // }
                        }
                    if (thisPrice > this.prevPrice * (0.99 - (this.settings.ambition  / 100)))
                        if (rsi > this.settings.BEAR_RSI_high * (0.99 - (this.settings.ambition  / 200)) && (this.prevPrice < thisPrice)) {
                            console.log('bear short');
                            // if (thisPrice > this.prevPrice * 1.0025) {
                            return this.advice('short', thisPrice * 0.9975, true); //instant sell  (takeProfit if available)
                            // } else {
                            //     return this.advice('short', thisPrice, false);
                            // }
                        }
                    // if (this.prevPrice * 1.001 < thisPrice && this.trend.direction !== 'down') {
                    //     console.log('stoploss short');
                    //     this.short(thisPrice); return;
                    // }
                    if (this.debug) this.lowHigh(rsi, 'bear');
                    //log.debug('BEAR-trend');
                }
        
                // BULL TREND
                else {
                    // IDLE-BULL OR REAL-BULL TREND ??
                    if (maFast * 0.999999 < maSlow) {
                        // BULL-IDLE TREND
                        rsi = ind.IDLE_RSI.result.result;
                        if (thisPrice < this.prevPrice * (1.01 + (this.settings.ambition  / 100)))
                            if (rsi < this.settings.IDLE_RSI_low * (1.01 + (this.settings.ambition  / 200))) {
                                console.log('idle long');
                                // if (thisPrice < this.prevPrice * 0.9975) {
                                return this.advice('long', thisPrice, true); //instant buy(takeProfit if available)
                                // } else {
                                //     return this.advice('long', thisPrice, false);
                                // }
                            }
                        if (thisPrice > this.prevPrice * (0.99 - (this.settings.ambition  / 100)))
                            if (rsi > this.settings.IDLE_RSI_high * (0.99 - (this.settings.ambition  / 300))) {// && (this.prevPrice < thisPrice)) {
                                console.log('idle short');
                                // if (thisPrice > this.prevPrice * 1.0025) {
                                return this.advice('short', thisPrice, true); //instant sell  (takeProfit if available)
                                // } else {
                                //     return this.advice('short', thisPrice, false);
                                // }
                            }
        
                        if (this.debug) this.lowHigh(rsi, 'idle');
                        //log.debug('IDLE-trend');
                    }
                    // REAL BULL TREND
                    else {
                        rsi = ind.BULL_RSI.result.result;
                        if (thisPrice < this.prevPrice * (1.01 + (this.settings.ambition  / 100)))
                            if (rsi < this.settings.BULL_RSI_low * (1.01 + (this.settings.ambition  / 300))) {
                                console.log('bull long');
                                // if (thisPrice < this.prevPrice * 0.9975) {
                                return this.advice('long', thisPrice, true); //instant buy(takeProfit if available)
                                // } else {
                                //     return this.advice('long', thisPrice, false);
                                // }
                            }
                        if (thisPrice > this.prevPrice * (0.99 - (this.settings.ambition  / 100)))
                            if (rsi > this.settings.BULL_RSI_high * (0.99 - (this.settings.ambition  / 300))) {//} && (this.prevPrice < thisPrice)) {
                                console.log('bull short');
                                // if (thisPrice > this.prevPrice * 1.0025) {
                                return this.advice('short', thisPrice, true); //instant sell  (takeProfit if available)
                                // } else {
                                //     return this.advice('short', thisPrice, false);
                                // }
                            }
        
                        if (this.debug) this.lowHigh(rsi, 'bull');
                        //log.debug('BULL-trend');
                    }
                }
        */

        // if (this.prevPrice * 0.978 > thisPrice && this.trend.direction !== 'down') {
        //     console.log('stoploss short');
        //     this.short(thisPrice); return;
        // }
    }, // check()

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
    },

    sendStratUpdates(parameters, configName) {
        console.log('settings bro', configName);
        if (configName.includes('my-config2')) {
            console.log('UPDATE CONFIRMED my-config2');
            let tempAmb = this.settings.ambition;
            this.settings = parameters;
            this.settings.ambition = tempAmb;
            if (!this.settings.ambition)
                this.settings.ambition = 0;
            // this.addTulipIndicator('IDLE_RSI', 'rsi', { optInTimePeriod: this.settings.IDLE_RSI, isRealTime: true });//this.settings.IDLE_RSI });
            // this.addTulipIndicator('IDLE_RSISLOW', 'rsi', { optInTimePeriod: this.settings.IDLE_RSISLOW, isRealTime: true });//this.settings.IDLE_RSI });
            console.log(this.settings);
        } else {
            console.log('UPDATE Failed');
        }

    },


    async runThisGA() {
        let runGAconfig = '';

        runGAconfig = 'gekkoga/config/my-config.js';
        const config = require('../' + runGAconfig);
        const ga = new Ga(config, runGAconfig, this);
        ga.run().catch(err => {
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



module.exports = stratNeoGABinance;