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

var SMMA = require('./indicators/SMMA.js');
// strategy
var stratNeoGA = {

    /* INIT */
    init: function () {
        this.name = 'NEOGABYBIT';
        this.ga;
        this.runThisGA();
        this.requiredHistory = config.tradingAdvisor.historySize;
        this.resetTrend();
        this.trend.direction = 'up';
        this.settings.prevPrice = 0;
        this.decisionArea = 'idle';
        this.lastAction = 'none';
        this.settings.lastTrade = 'none';
        this.wait = false;
        this.settings.sameSideCount = 1;
        this.settings.previousAmountOfAsset = 0;
        // debug? set to flase to disable all logging (improves performance)
        this.debug = false;
        this.settings.ambition = 0;
        if (this.settings.usingVWP) {
            this.addTulipIndicator('IDLE_RSISLOW', 'rsivwp', { optInTimePeriod: this.settings.IDLE_RSISLOW });
            this.addTulipIndicator('IDLE_RSI', 'rsivwp', { optInTimePeriod: this.settings.IDLE_RSI });
            this.addTulipIndicator('ema', 'emavwp', { optInTimePeriod: this.settings.EMA_LENGTH });
        } else {
            this.addTulipIndicator('IDLE_RSISLOW', 'rsi', { optInTimePeriod: this.settings.IDLE_RSISLOW });
            this.addTulipIndicator('IDLE_RSI', 'rsi', { optInTimePeriod: this.settings.IDLE_RSI });
            this.addTulipIndicator('ema', 'ema', { optInTimePeriod: this.settings.EMA_LENGTH });
        }
        // define the indicators we need
        this.addTulipIndicator('dema', 'dema', { optInTimePeriod: this.settings.dma_length });
        this.addIndicator('sma', 'SMA', this.settings.sma_weight);
        this.addTulipIndicator('rsiVolume', 'rsiVolume', { optInTimePeriod: this.settings.rsiVolume || 10 });
        // NEOGA 2021/04/13
        // this.addIndicator('stoploss', 'StopLoss', { threshold: this.settings.stoploss_threshold, action: 'stoploss' });
        // // add indicators
        // // this.addTulipIndicator('maSlow', 'sma', { optInTimePeriod: this.settings.SMA_long });
        // // this.addTulipIndicator('maFast', 'sma', { optInTimePeriod: this.settings.SMA_short });
        // // this.addTulipIndicator('BULL_RSI', 'rsi', { optInTimePeriod: this.settings.BULL_RSI });
        // // this.addTulipIndicator('IDLE_RSI', 'rsi', { optInTimePeriod: this.settings.IDLE_RSI });//this.settings.IDLE_RSI });
        // this.addTulipIndicator('IDLE_RSISLOW', 'rsi', { optInTimePeriod: this.settings.IDLE_RSISLOW });//this.settings.IDLE_RSI });
        // this.addTulipIndicator('IDLE_RSI', 'rsi', { optInTimePeriod: this.settings.IDLE_RSI });
        // this.addTulipIndicator('stoch', 'stoch', {
        //     optInFastKPeriod: this.settings.IDLE_RSI,
        //     optInSlowKPeriod: this.settings.IDLE_RSISLOW,
        //     optInSlowDPeriod: this.settings.IDLE_RSISLOW
        // });
        // // this.addTulipIndicator('ROC_val', 'roc', { optInTimePeriod: this.settings.ROC });
        // this.addTulipIndicator('ema', 'ema', { optInTimePeriod: this.settings.EMA_LENGTH });
        // // debug stuff

    }, // init()
    processTradeCompleted: function (trade) {
        this.strategy.processTrade(trade);
        this.processTrade(trade);
    },
    processTrade: function (trade) {
        this.wait = false;
        this.resetTrend();
        if (trade.action === 'sell') {
            if (this.settings.lastTrade === 'sell') {
                var prevAmountDivTradeAmount = 0,//vwp
                    relativePreviousPrice = 0;
                prevAmountDivTradeAmount = this.settings.previousAmountOfAsset / trade.amount;
                relativePreviousPrice = this.settings.prevPrice * prevAmountDivTradeAmount;
                relativePreviousPrice += trade.effectivePrice;
                console.log('ProcessTrade Called:', this.settings.prevPrice, ' to ', Math.floor(relativePreviousPrice / (1 + prevAmountDivTradeAmount)));
                this.settings.prevPrice = Math.floor(relativePreviousPrice / (1 + prevAmountDivTradeAmount));
                this.settings.sameSideCount++;
                this.settings.previousAmountOfAsset += trade.amount;//vwp
            } else {
                this.settings.lastTrade = 'sell';
                console.log('ProcessTrade Called:', this.settings.prevPrice, ' to ', trade.effectivePrice)
                this.settings.prevPrice = trade.effectivePrice;
                this.settings.sameSideCount = 1;
                this.settings.previousAmountOfAsset = trade.amount;
            }

            this.trend.direction = 'down';
        } else {
            if (this.settings.lastTrade === 'buy') {
                var prevAmountDivTradeAmount = 0,//vwp
                    relativePreviousPrice = 0;
                prevAmountDivTradeAmount = this.settings.previousAmountOfAsset / trade.amount;
                relativePreviousPrice = this.settings.prevPrice * prevAmountDivTradeAmount;
                relativePreviousPrice += trade.effectivePrice;
                console.log('ProcessTrade Called:', this.settings.prevPrice, ' to ', Math.floor(relativePreviousPrice / (1 + prevAmountDivTradeAmount)));
                this.settings.prevPrice = Math.floor(relativePreviousPrice / (1 + prevAmountDivTradeAmount));
                this.settings.sameSideCount++;
                this.settings.previousAmountOfAsset += trade.amount; //vwp
            } else {
                this.settings.lastTrade = 'buy';
                console.log('ProcessTrade Called:', this.settings.prevPrice, ' to ', trade.effectivePrice)
                this.settings.prevPrice = trade.effectivePrice;
                this.settings.sameSideCount = 1;
                this.settings.previousAmountOfAsset = trade.amount;
            }

            this.trend.direction = 'up';
        }

        if (trade.action === 'sell') {
            if ((trade.effectivePrice / this.settings.prevPrice) > 1)
                this.settings.ambition += ((trade.effectivePrice / this.settings.prevPrice) - 1) * this.settings.aboveZeroAmbitionMod;
            else
                this.settings.ambition += ((trade.effectivePrice / this.settings.prevPrice) - 1) * this.settings.belowZeroAmbitionMod;
            this.trend.direction = 'down';
        } else {
            this.trend.direction = 'up';
            if ((this.settings.prevPrice / trade.effectivePrice) > 1)
                this.settings.ambition += ((this.settings.prevPrice / trade.effectivePrice) - 1) * this.settings.aboveZeroAmbitionMod;
            else
                this.settings.ambition += ((this.settings.prevPrice / trade.effectivePrice) - 1) * this.settings.belowZeroAmbitionMod;
        }
        if (this.settings.ambition > 5) {
            this.settings.ambition = 5;
        }

        if (this.settings.ambition < -5) {
            this.settings.ambition = -5;
        }
        // if (this.ga)
        //     this.ga.updateAndWrite();
    },

    processRoundT: function (roundTrip) {
        if (isNaN(roundTrip.profit))
            return;

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

    update: function (candle) {
        // let volumeMod = Math.abs((candle.open - this.candle.close)) / candle.volume;
        if (!candle.volume)
            return;
        // console.log(this.tulipIndicators.stoch);

    },

    /* CHECK */
    check: function () {
        // let volumeMod = Math.abs((this.candle.open - this.candle.close)) / this.candle.volume;
        if (!this.candle.volume)
            return;

        // let smmaVolume = this.SMMA.result;
        // console.log(volumeMod, smmaVolume);
        // console.log(this.SMMA.result, volumeMod);
        // if (this.candle.close.length < this.requiredHistory) {
        //     this.settings.prevPrice = this.candle.close;
        //     return;
        // } // check if candle length is correct

        if (this.candle.close.length < this.requiredHistory) { return; } // check if candle length is correct
        if (!this.tulipIndicators.dema.result.result) { return; }
        if (!this.settings.prevPrice) {
            this.settings.prevPrice = this.candle.close;
            console.log(new Date, 'Set Prev price');
        }
        var thisPrice = this.candle.close;


        // get all indicators
        let ind = this.tulipIndicators,
            rsi = 0,
            rsiSlow = 0,
            rsiVolume = 0;

        rsi = ind.IDLE_RSI.result.result;
        rsiSlow = ind.IDLE_RSISLOW.result.result;
        rsiVolume = ind.rsiVolume.result.result;

        let modvalBear = this.settings.rsimod;
        let modvalBull = this.settings.rsimodBull;
        let modBear = ((rsi / rsiSlow) + (modvalBear - 1)) / modvalBear;
        let modBull = ((rsi / rsiSlow) + (modvalBull - 1)) / modvalBull;

        let bearbull = (this.candle.high - ind.ema.result.result) + (this.candle.low - ind.ema.result.result);

        //extra
        let dema = ind.dema.result;
        let sma = this.indicators.sma;
        let resDEMA = dema.result;
        let resSMA = sma.result;
        let diff = resDEMA / resSMA;
        // console.log('diff', diff, 'vs', this.settings.thresholds_down, this.settings.thresholds_up);
        //extra
        if (bearbull > 0 + this.settings.bearbullMod) {         //normal buy ambition sell  !!!!!!!!!!!!!!!

            if (rsi > this.settings.IDLE_RSI_high * modBull && rsi < this.settings.rsiTooHighVal + (this.settings.IDLE_RSI_high * modBull) && diff < this.settings.thresholds_down) {
                if (this.settings.rsiVolume_method === 1) {
                    if (rsiVolume <= this.settings.rsiVolume_high)
                        return;
                }
                this.SellLogic(thisPrice, rsiVolume);
                // console.log('s1', rsiVolume);
                return;
            }

            if (rsi < this.settings.IDLE_RSI_low * modBull && rsi > -this.settings.rsiTooLowVal + this.settings.IDLE_RSI_low * modBull && diff > this.settings.thresholds_up) {
                if (this.settings.rsiVolume_method === 1) {
                    if (rsiVolume <= this.settings.rsiVolume_low)
                        return;
                }
                this.BuyLogic(thisPrice, rsiVolume);
                // console.log('b1', rsiVolume);
                return;
            }
        } else {                    //ambition buy normal sell  !!!!!!!!!!!!!!!
            if (rsi < this.settings.IDLE_RSI_low_Bear * modBear && rsi > -this.settings.rsiTooLowVal + this.settings.IDLE_RSI_low_Bear * modBear && diff > this.settings.thresholds_up) {
                if (this.settings.rsiVolume_method === 1) {
                    if (rsiVolume <= this.settings.rsiVolume_low)
                        return;
                }
                this.BuyLogic(thisPrice, rsiVolume);
                // console.log('b2', rsiVolume);
                return;
            }
            if (rsi > this.settings.IDLE_RSI_high_Bear * modBear && rsi < this.settings.rsiTooHighVal + this.settings.IDLE_RSI_high_Bear * modBear && diff < this.settings.thresholds_down) {
                if (this.settings.rsiVolume_method === 1) {
                    if (rsiVolume <= this.settings.rsiVolume_high)
                        return;
                }
                this.SellLogic(thisPrice, rsiVolume);
                // console.log('s2', rsiVolume);
                return;
            }
        }

    }, // check()
    // /* CHECK */ NEOGA 2021/04/13
    // check: function () {
    //     // let volumeMod = Math.abs((this.candle.open - this.candle.close)) / this.candle.volume;
    //     if (!this.candle.volume)
    //         return;
    //     if (this.wait) {
    //         this.wait = false;
    //         return;
    //     }


    //     // let smmaVolume = this.SMMA.result;
    //     // console.log(volumeMod, smmaVolume);
    //     // console.log(this.SMMA.result, volumeMod);
    //     // if (this.candle.close.length < this.requiredHistory) {
    //     //     this.settings.prevPrice = this.candle.close;
    //     //     return;
    //     // } // check if candle length is correct

    //     if (this.candle.close.length < this.requiredHistory) { return; } // check if candle length is correct

    //     if (!this.settings.prevPrice) {
    //         this.settings.prevPrice = this.candle.close;
    //         console.log('Set Prev price')
    //     }
    //     var thisPrice = this.candle.close;

    //     // get all indicators
    //     let ind = this.tulipIndicators,
    //         rsi = 0,
    //         rsiSlow = 0;

    //     rsi = ind.IDLE_RSI.result.result;
    //     rsiSlow = ind.IDLE_RSISLOW.result.result;

    //     let modvalBear = this.settings.rsimod;
    //     let modvalBull = this.settings.rsimodBull;
    //     let modBear = ((rsi / rsiSlow) + (modvalBear - 1)) / modvalBear;
    //     let modBull = ((rsi / rsiSlow) + (modvalBull - 1)) / modvalBull;
    //     // console.log(this.tulipIndicators.stoch.result.stochK, this.tulipIndicators.stoch.result.stochD);
    //     if (this.settings.usingBearBull) {
    //         let bearbull = (this.candle.high - ind.ema.result.result) + (this.candle.low - ind.ema.result.result);
    //         if (bearbull > 0 + this.settings.bearbullMod) {         //normal buy ambition sell  !!!!!!!!!!!!!!!
    //             // console.log('BearBull', bearbull, this.settings.bearbullMod, 'rsi', rsi, 'rsiHigh', this.settings.IDLE_RSI_high * modBull);
    //             if (rsi > this.settings.IDLE_RSI_high * modBull) {
    //                 if (this.settings.withAmbitionFeature) {
    //                     if (thisPrice > this.settings.prevPrice * (this.settings.baseSellAmbitionVal - (this.settings.ambition / 100)))
    //                         this.sell(thisPrice);
    //                 } else
    //                     if (thisPrice > this.settings.prevPrice * this.settings.baseSellAmbitionVal)
    //                         this.sell(thisPrice);
    //             }
    //             // console.log('BearBull', bearbull, this.settings.bearbullMod, 'rsi', rsi, 'rsiLow', this.settings.IDLE_RSI_low * modBull);
    //             if (rsi < this.settings.IDLE_RSI_low * modBull) {
    //                 if (this.settings.withAmbitionFeature) {
    //                     // if (thisPrice <= this.settings.prevPrice * (this.settings.baseBuyAmbitionVal))// + (this.settings.ambition / 100)))

    //                     this.buy(thisPrice);
    //                 }
    //                 else
    //                     // if (thisPrice <= this.settings.prevPrice * this.settings.baseBuyAmbitionVal)

    //                     this.buy(thisPrice);
    //             }
    //         } else {                    //ambition buy normal sell  !!!!!!!!!!!!!!!

    //             // console.log('BearBull', bearbull, this.settings.bearbullMod, 'rsi', rsi, 'rsiLow', this.settings.IDLE_RSI_low * modBull);
    //             if (rsi < this.settings.IDLE_RSI_low_Bear * modBear) {
    //                 if (this.settings.withAmbitionFeature) {
    //                     if (thisPrice <= this.settings.prevPrice * (this.settings.baseBuyAmbitionVal + (this.settings.ambition / 100)))
    //                         this.buy(thisPrice);
    //                 }
    //                 else
    //                     if (thisPrice <= this.settings.prevPrice * this.settings.baseBuyAmbitionVal)
    //                         this.buy(thisPrice);
    //             }
    //             // console.log('BearBull', bearbull, this.settings.bearbullMod, 'rsi', rsi, 'rsiHigh', this.settings.IDLE_RSI_high * modBull);
    //             if (rsi > this.settings.IDLE_RSI_high_Bear * modBear) {
    //                 if (this.settings.withAmbitionFeature) {
    //                     if (thisPrice > this.settings.prevPrice * (this.settings.baseSellAmbitionVal - (this.settings.ambition / 100)))// + (this.settings.ambition / 100)))

    //                         this.sell(thisPrice);
    //                 } else
    //                     if (thisPrice > this.settings.prevPrice * (this.settings.baseSellAmbitionVal))

    //                         this.sell(thisPrice);
    //             }
    //         }
    //         return;
    //     }//end of bull bear

    // }, // check()
    BuyLogic: function (thisPrice, rsiVal) {
        if (this.settings.withAmbitionFeature == 1) {
            if (thisPrice <= this.settings.prevPrice * (this.settings.baseBuyAmbitionVal))
                this.buy(thisPrice, rsiVal);
        }
        else if (this.settings.withAmbitionFeature == 2) {
            if (thisPrice <= this.settings.prevPrice * this.settings.baseBuyAmbitionVal)
                this.buy(thisPrice, rsiVal);
        } else {
            this.buy(thisPrice, rsiVal);
        }
    },

    SellLogic: function (thisPrice, rsiVal) {
        if (this.settings.withAmbitionFeature == 1) {
            if (thisPrice > this.settings.prevPrice * (this.settings.baseSellAmbitionVal - (this.settings.ambition / 100)))
                this.sell(thisPrice, rsiVal);
        } else if (this.settings.withAmbitionFeature == 2) {
            if (thisPrice > this.settings.prevPrice * this.settings.baseSellAmbitionVal)
                this.sell(thisPrice, rsiVal);
        } else {
            this.sell(thisPrice, rsiVal);
        }

    },
    buy: function (thisPrice) {
        if (this.lastAction === 'buy') {
            if (this.settings.prevPrice >= thisPrice * Math.pow(1.005, this.settings.sameSideCount)) {
                this.lastAction = 'buy';
                this.wait = true;
                return this.advice('long', thisPrice, true);
            }
            else {
                console.log('buy attempt v2', this.settings.prevPrice, thisPrice * Math.pow(1.00125, this.settings.sameSideCount), this.settings.prevPrice >= thisPrice * Math.pow(1.00125, this.settings.sameSideCount));
                if (this.settings.prevPrice >= thisPrice * Math.pow(1.00125, this.settings.sameSideCount)) {
                    this.lastAction = 'buy';
                    this.wait = true;
                    return this.advice('long', thisPrice, false);
                }
            }
        }
        else
            if (this.settings.prevPrice >= thisPrice * 1.0025) {
                this.lastAction = 'buy';
                this.wait = true;
                return this.advice('long', thisPrice, true);
            }
            else {
                // console.log('buy attempt v1', this.settings.prevPrice, thisPrice * 1.001, this.settings.prevPrice >= thisPrice * 1.001);
                // if (this.settings.prevPrice >= thisPrice * 1.001) {
                this.lastAction = 'buy';
                this.wait = true;
                return this.advice('long', thisPrice, false);
                // }
            }
    },
    sell: function (thisPrice) {

        if (this.lastAction === 'sell') {
            if (this.settings.prevPrice * Math.pow(1.01, this.settings.sameSideCount) <= thisPrice) {
                this.lastAction = 'sell';
                this.wait = true;
                return this.advice('short', thisPrice, false);
            }
            else {
                console.log('sell attempt v2', this.settings.prevPrice * Math.pow(1.00125, this.settings.sameSideCount), thisPrice, this.settings.prevPrice * Math.pow(1.00125, this.settings.sameSideCount) <= thisPrice);
                if (this.settings.prevPrice * Math.pow(1.00125, this.settings.sameSideCount) <= thisPrice) {

                    this.lastAction = 'sell';
                    this.wait = true;
                    return this.advice('short', thisPrice, false);
                }
            }
        }
        else {
            if (this.settings.prevPrice * 1.005 <= thisPrice) {
                this.lastAction = 'sell';
                this.wait = true;
                return this.advice('short', thisPrice, true);
            }
            else {
                // console.log('sell attempt v1', this.settings.prevPrice * 1.001, thisPrice, this.settings.prevPrice * 1.001 <= thisPrice);
                // if (this.settings.prevPrice * 1.001 <= thisPrice) {
                this.lastAction = 'sell';
                this.wait = true;
                return this.advice('short', thisPrice, false);
                // }
            }
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
    },

    sendStratUpdates(parameters, configName) {
        if (!this.settings.onDoge && configName.includes('my-config')) {

            if (this.settings.ambition != 0) {
                if (this.settings.prevPrice != 0) {
                    let tempPrev = this.settings.prevPrice;
                    let tempAmb = this.settings.ambition;
                    this.settings = parameters;
                    this.settings.ambition = tempAmb;
                    this.settings.prevPrice = tempPrev;
                } else {
                    let tempAmb = this.settings.ambition;
                    this.settings = parameters;
                    this.settings.ambition = tempAmb;
                }
            } else {
                this.settings = parameters;
            }
            console.log('UPDATE CONFIRMED my-config');
            // this.addTulipIndicator('IDLE_RSI', 'rsi', { optInTimePeriod: this.settings.IDLE_RSI, isRealTime: true });//this.settings.IDLE_RSI });
            // this.addTulipIndicator('IDLE_RSISLOW', 'rsi', { optInTimePeriod: this.settings.IDLE_RSISLOW, isRealTime: true });//this.settings.IDLE_RSI });
            console.log(this.settings);
        } else {
            console.log('UPDATE Failed');
        }
    },

    async runThisGA() {
        let runGAconfig = '';
        if (this.settings.onDoge === true) {
            console.log('we actually on doge for real');
            runGAconfig = 'gekkoga/config/my-config2.js';
            const config = require('../' + runGAconfig);
            this.ga = new GaBinance(config, runGAconfig, this);
            this.ga.run().catch(err => {
                console.error(err);
                console.log('restarting the GA');
                this.runThisGA();
            });
        } else {
            runGAconfig = 'gekkoga/config/my-config.js';
            const config = require('../' + runGAconfig);
            this.ga = new Ga(config, runGAconfig, this);
            this.ga.run().catch(err => {
                console.error(err);
                console.log('restarting the GA');
                this.runThisGA();
            });
        }

        console.log(runGAconfig);
        if (!runGAconfig || !fs.existsSync(runGAconfig)) {
            console.error("\n", " error: option `-c --config <config file>' argument or file missing", "\n");
            // process.exit(1);
        }
    }
};
module.exports = stratNeoGA;