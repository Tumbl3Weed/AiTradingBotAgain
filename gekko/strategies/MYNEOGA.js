var config = require('../core/util.js').getConfig();
var async = require('async');
const Ga = require('../gekkoga/index.js');
const fs = require('fs');
const GaBinance = require('../gekkoga/indexBinance.js');
var log = require('../core/log.js');
var util = require('../core/util.js');

// strategy
var MYNEOGA = {

    /* INIT */
    init: function () {
        this.name = 'MYNEOGA';
        this.ambition = 1;
        this.requiredHistory = config.tradingAdvisor.historySize;
        this.resetTrend();
        this.haveSetSettings = false;
        // debug? set to flase to disable all logging (improves performance)
        this.debug = false;
        this.prevPrice = 0;
        this.lastAction = '';
        if (this.settings.onDoge) {
            this.lastAction = 'long';//binance
        } else {
            this.lastAction = 'short';//luno
        }

        this.addIndicator('stoploss', 'StopLoss', { threshold: this.settings.stoploss_threshold, action: 'stoploss' });
        // add indicators
        this.addTulipIndicator('maSlow', 'sma', { optInTimePeriod: this.settings.SMA_long });
        this.addTulipIndicator('maFast', 'sma', { optInTimePeriod: this.settings.SMA_short });
        this.addTulipIndicator('BULL_RSI', 'rsi', { optInTimePeriod: this.settings.BULL_RSI });
        this.addTulipIndicator('IDLE_RSI', 'rsi', { optInTimePeriod: this.settings.IDLE_RSI });
        this.addTulipIndicator('BEAR_RSI', 'rsi', { optInTimePeriod: this.settings.BEAR_RSI });
        this.addTulipIndicator('ROC_val', 'roc', { optInTimePeriod: this.settings.ROC });
        this.addTulipIndicator('IDLE_RSISLOW', 'rsi', { optInTimePeriod: this.settings.IDLE_RSISLOW });//this.settings.IDLE_RSI });
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
        this.runThisGA();
    }, // init()
    processTradeCompleted: function (trade) {
        this.strategy.processTrade(trade);
    },
    processTrade: function (trade) {
        this.resetTrend();
        if (trade.action === "buy") {   //used for GA
            console.log('LAST ACTION WAS SET TO LONG');
            this.lastAction = 'long';   //used for GA
            this.prevPrice = trade.price;
            console.log('PREV PRICE SET TO: ', this.prevPrice);
        } else if (trade.action === "sell") {
            console.log('LAST ACTION WAS SET TO SHORT');
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
        if (this.candle.close.length < this.requiredHistory) { console.log('setPrevPrice'); this.prevPrice = this.candle.close; return; } // check if candle length is correct
        if (this.prevPrice === 0) {
            this.prevPrice = this.candle.close;
            console.log('setPrevPrice');
        }
        // get all indicators
        let ind = this.tulipIndicators;
        // maSlow = ind.maSlow.result.result,
        // maFast = ind.maFast.result.result,
        // rsi, rsiSlow,
        // ROC_val = ind.ROC_val.result.result;
        let bearbull = (this.candle.high - ind.ema.result.result) - (this.candle.low - ind.ema.result.result);
        // console.log(this.highCandles, this.lowCandles, ind.ema.result, bearbull);
        // rsiSlow = ind.IDLE_RSISLOW.result.result;
        // rsi = ind.BEAR_RSI.result.result;
        let modval = (ind.BEAR_RSI.result.result / ind.IDLE_RSISLOW.result.result + (this.settings.rsimod - 1)) / this.settings.rsimod;
        modval = modval ** this.settings.rsimodEponent;
        // console.log(ind.BEAR_RSI.result.result / ind.IDLE_RSISLOW.result.result);
        rsi = ind.BEAR_RSI.result.result;

        // console.log('rsi', rsi, 'modval', modval, 'rsiMod', this.settings.rsimod, 'indi', ind.IDLE_RSISLOW.result.result);
        // console.log('rsi', rsi, 'modval', modval, 'rsiMod', this.settings.rsimod, 'indi', ind.IDLE_RSISLOW.result.result);
        if (bearbull > 0) {
            if (rsi > this.settings.BEAR_RSI_high * modval
                && this.prevPrice * (1 - (this.ambition / 100)) <= this.candle.close
                && 'stoploss' === this.indicators.stoploss.action) return this.short();
            else if (rsi < this.settings.BEAR_RSI_low * modval) return this.long();
        }
        else {
            if (rsi > this.settings.BEAR_RSI_high * modval
                && 'stoploss' === this.indicators.stoploss.action) return this.short();
            else if (rsi < this.settings.BEAR_RSI_low * modval
                && this.prevPrice * (1 + (this.ambition / 100)) >= this.candle.close) return this.long();
        }
        return this.noAction();
        /* if (this.debug) this.lowHigh(rsi, 'bear');
         // BEAR TREND
         if (maFast < maSlow) {
             rsi = ind.BEAR_RSI.result.result;
             let mod = ((rsi / rsiSlow) + (modval - 1)) / modval;
             if (rsi > this.settings.BEAR_RSI_high * mod && 'stoploss' === this.indicators.stoploss.action) return this.short();
             else if (rsi < this.settings.BEAR_RSI_low * mod) return this.long();
             if (this.debug) this.lowHigh(rsi, 'bear');
             //log.debug('BEAR-trend');
         }
         // BULL TREND
         else {
             // IDLE-BULL OR REAL-BULL TREND ??
             if (ROC_val <= this.settings.ROC_lvl) {
                 // BULL-IDLE TREND
                 rsi = ind.IDLE_RSI.result.result;
                 let mod = ((rsi / rsiSlow) + (modval - 1)) / modval;
                 if (rsi > this.settings.IDLE_RSI_high * mod && 'stoploss' === this.indicators.stoploss.action) return this.short();
                 else if (rsi < this.settings.IDLE_RSI_low * mod) return this.long();
                 if (this.debug) this.lowHigh(rsi, 'idle');
                 //log.debug('IDLE-trend');
             }
             // REAL BULL TREND
             else {
                 rsi = ind.BULL_RSI.result.result;
                 let mod = ((rsi / rsiSlow) + (modval - 1)) / modval;
                 if (rsi > this.settings.BULL_RSI_high * mod && 'stoploss' === this.indicators.stoploss.action) return this.short();
                 else if (rsi < this.settings.BULL_RSI_low * mod) return this.long();
                 if (this.debug) this.lowHigh(rsi, 'bull');
                 //log.debug('BULL-trend');
             }
         }*/
    }, // check()
    /* LONG */
    noAction: function () {
        return this.advice('noAction', 0, false);
    },
    long: function () {
        this.resetTrend();
        this.trend.direction = 'up';
        let buyPrice = this.candle.close * this.settings.buyPriceMod;
        this.indicators.stoploss.long(buyPrice);
        console.log("ADVICE BUY");
        return this.advice('long', buyPrice, true);
        //log.debug('go long');
    },
    short: function () {
        // new trend? (else do things)
        this.resetTrend();
        this.trend.direction = 'down';
        console.log("ADVICE SELL");
        let sellPrice = this.candle.close * this.settings.sellPriceMod;
        return this.advice('short', sellPrice, true);
    },
    processRoundT: function (roundTrip) {
        if (roundTrip.profit > 0)
            this.ambition += (roundTrip.profit / 2);
        else
            this.ambition += roundTrip.profit;
    },
    /* SHORT */

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
    sendStratUpdates(parameters) {
        if (!this.haveSetSettings) {
            this.settings = parameters;
            if (this.settings.lastAction)
                if (this.settings.lastAction !== '') {
                    this.lastAction = this.settings.lastAction;
                }
            if (this.indicators.stoploss.threshold)
                this.indicators.stoploss.threshold = this.settings.stoploss_threshold;
            this.haveSetSettings = true;
            console.log('set base settings');

            // this.saveLatestConfig();
        } else {
            this.settings = parameters;
            console.log(this.settings);
            // this.settings.BEAR_RSI_high = (this.settings.BEAR_RSI_high * 2 + parameters.BEAR_RSI_high) / 3;
            // this.settings.BEAR_RSI_low = (this.settings.BEAR_RSI_low * 2 + parameters.BEAR_RSI_low) / 3;
            // this.settings.BULL_RSI_high = (this.settings.BULL_RSI_high * 2 + parameters.BULL_RSI_high) / 3;
            // this.settings.BULL_RSI_low = (this.settings.BULL_RSI_low * 2 + parameters.BULL_RSI_low) / 3;
            // this.settings.IDLE_RSI_high = (this.settings.IDLE_RSI_high * 2 + parameters.IDLE_RSI_high) / 3;
            // this.settings.IDLE_RSI_low = (this.settings.IDLE_RSI_low * 2 + parameters.IDLE_RSI_low) / 3;
            // this.settings.rsimod = (this.settings.rsimod * 2 + parameters.rsimod) / 3;
            if (this.indicators.stoploss.threshold)
                this.indicators.stoploss.threshold = this.settings.stoploss_threshold;
            console.log('UPDATE CONFIRMED');
            // this.saveLatestConfig();
        }
    },
    saveLatestConfig() {
        if (config) {
            console.log(config);

            console.log('is there a strategy REF!!!!!!!!!!!!!!!!!!!!!!!!!!================2=');
            filename2 = `C:/Users/CalvinPc/gekko/calconfig.js`;

            const fileName = filename2;
            const exists = fs.existsSync(fileName);
            let loaded_config;
            if (exists) {
                console.log('Previous config found, loading...');
                loaded_config = fs.readFileSync(fileName, { encoding: 'utf8' });
            } else {
                console.log(new Date(), 'no file found');
                return;
            }
            loaded_config.MYNEOGA = this.settings;
            const json = loaded_config;

            // console.log(this.realtimeStrategy);
            fs.writeFile(`C:/Users/CalvinPc/gekko/calconfig2.js`, json, (err) => {
                if (err) throw err;
                console.log('The file has been saved!');
            });

        } else {
            console.log(new Date(), 'No config!');
        }
        console.log('UPDATE SAVE');
    },
    async runThisGA() {
        let runGAconfig = '';
        if (this.settings.onDoge) {
            console.log('we actually on doge for real');
            runGAconfig = 'gekkoga/config/my-config2.js';
            const config = require('../' + runGAconfig);
            const gaBinance = new GaBinance(config, runGAconfig, this);
            gaBinance.run().catch(err => {
                console.error(err);
                console.log('restarting the GA');
                this.runThisGA();
            });
        } else {
            runGAconfig = 'gekkoga/config/my-config.js';
            const config = require('../' + runGAconfig);
            const ga = new Ga(config, runGAconfig, this);
            ga.run().catch(err => {
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
module.exports = MYNEOGA;