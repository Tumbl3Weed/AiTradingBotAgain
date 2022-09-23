var convnetjs = require('convnetjs');
var math = require('mathjs');
var deepqlearn = require(__dirname + '/../node_modules/convnetjs/build/deepqlearn.js');

var log = require('../core/log.js');

var config = require('../core/util.js').getConfig();

var SMMA = require('./indicators/SMMA.js');

// helpers
var _ = require('lodash');
var log = require('../core/log.js');

var rsi = require('./indicators/RSI.js');
const { random } = require('lodash');
const { randomInt } = require('mathjs');

var strategy = {
    // stores the candles
    priceBuffer: [],
    priceVolumeBuffer: [],
    priceBufferSMA: [],
    priceBufferHigh: [],
    priceBufferLow: [],
    priceBufferOpen: [],
    priceBufferClose: [],
    adxrBuffer: [],
    timeBuffer: [],
    predictionCount: 0,
    startNetWorth: 3600,
    batchsize: 1,
    // no of neurons for the layer
    layer_neurons: 11,
    // activaction function for the first layer, when neurons are > 0
    // layer_activation: 'relu',
    // normalization factor
    scale: 1,
    // stores the last action (buy or sell)
    prevAction: 0,
    //stores the price of the last trade (buy/sell)
    prevPrice: 0,
    trailPrice: 0,
    lengthOfReward: 3, //minutes
    actionIncentive: 11,
    trainIndex: 0,
    // if you want the bot to hodl instead of selling during a small dip
    // use the hodl_threshold. e.g. 0.95 means the bot won't sell
    // when unless the price drops below a 5% threshold of the last buy price (this.privPrice)
    hodl_threshold: 0.96,
    ambition: 0,
    lastPrediction: -1,
    tookAction: false,
    tookActionVal: -1,
    // init the strategy
    init: function () {
        this.ambition = 0;
        this.prevAction = -1;
        this.name = 'neuralnetcalRFL';
        this.requiredHistory = config.tradingAdvisor.historySize;
        this.lastPredictionLossPercent = 100;
        this.bestLossPercent = 1000;
        this.lastPrediction = 1;
        this.predictionMinPercent = this.settings.minPredictionAccuracy;
        this.lengthOfReward = this.settings.lengthOfReward;
        // smooth the input to reduce the noise of the incoming data
        this.SMMA = new SMMA(3);
        this.realtimeInAsset = false;
        let numInputs = 9;
        let numActions = 2;//buy,sell,wait

        var opt = {};
        opt.experience_size = 600000;
        opt.start_learn_threshold = 10000;
        opt.hidden_layer_sizes = [32, 32, 32, 32, 32];
        opt.tdtrainer_options = { learning_rate: 0.0000079, momentum: 0.00000079, batch_size: 2, l2_decay: 0.000001 };
        opt.temporal_window = 2;
        opt.epsilon_test_time = 0;
        this.brain = new deepqlearn.Brain(numInputs, numActions, opt);

        this.requiredHistory = this.tradingAdvisor.historySize;

        this.addIndicator('rsi', 'RSI', this.settings);

        var adxrsettings = {
            optInTimePeriod: 10
        };
        this.addTulipIndicator('adxr', 'adxr', adxrsettings);
        this.hodl_threshold = this.settings.hodl_threshold;
    },

    setNormalizeFactor: function (candle) {
        this.scale = candle.vwp;
        //log.debug('Set normalization factor to',this.scale);
        this.startNetWorth = this.startNetWorth / this.scale;
    },
    processRoundT: function (roundTrip) {
        // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!    Ambition Value Has Been ALTERED to ', roundTrip.profit / 2);
        if (roundTrip.profit > 0) {
            this.ambition += roundTrip.profit / 2;
        }
        else
            this.ambition += roundTrip.profit;
    },

    learn: function () {

        var inAsset = false;//start in money
        var reward = 0;
        this.brain.learning = true;
        for (let index = 0; index < this.priceBufferSMA.length - 2; index++) {
            let testVal = this.priceBufferSMA[index + 1] / this.priceBufferSMA[index];
            let testVal2 = this.priceBuffer[index + 1] / this.priceBuffer[index];
            let testVal3 = this.priceBufferHigh[index + 1] / this.priceBufferHigh[index];
            let testVal4 = this.priceBufferLow[index + 1] / this.priceBufferLow[index];
            let testVal5 = this.priceBufferOpen[index + 1] / this.priceBufferOpen[index];
            let testVal6 = this.priceBufferClose[index + 1] / this.priceBufferClose[index];
            let testVal7 = 0;
            if (this.priceVolumeBuffer[index]) {
                testVal7 = this.priceVolumeBuffer[index + 1] / this.priceVolumeBuffer[index];
            }
            let testVal8 = this.adxrBuffer[index + 1] / this.adxrBuffer[index];
            let testVal9 = this.timeBuffer[index + 1];
            var action = this.brain.forward([testVal2, testVal, testVal3, testVal4, testVal5, testVal6, testVal7, testVal8, testVal9]);
            // console.log('In learn in for loop: action = ' + action);
            if (action === 0) {//buy

                inAsset = true;
            } else if (action === 1) {//sell
                inAsset = false;
            }

            if (inAsset) {
                reward = this.priceBufferClose[index + 1] / this.priceBufferClose[index];
            } else {
                reward = this.priceBufferClose[index] / this.priceBufferClose[index + 1];
            }
            reward = reward - 1.000;
            reward *= 50;
            this.brain.backward(reward);
            // console.log('learn reward in asset', inAsset, (reward));
            this.trainIndex++;
        }//end of index for loop
        this.brain.learning = false;
    },

    takeAction: function () {
        this.brain.learning = false;
        let indexVal = this.priceBuffer.length - 1;
        let testVal = this.priceBufferSMA[indexVal] / this.priceBufferSMA[indexVal - 1] - 1;
        let testVal2 = this.priceBuffer[indexVal] / this.priceBuffer[indexVal - 1];
        let testVal3 = this.priceBufferHigh[indexVal] / this.priceBufferHigh[indexVal - 1];
        let testVal4 = this.priceBufferLow[indexVal] / this.priceBufferLow[indexVal - 1];
        let testVal5 = this.priceBufferOpen[indexVal] / this.priceBufferOpen[indexVal - 1];
        let testVal6 = this.priceBufferClose[indexVal] / this.priceBufferClose[indexVal - 1];
        let testVal7 = 0;
        if (this.priceVolumeBuffer[indexVal]) {
            testVal7 = this.priceVolumeBuffer[indexVal] / this.priceVolumeBuffer[indexVal - 1];
        } else {
            testVal7 = this.priceVolumeBuffer[indexVal] / 1;
        }
        let testVal8 = this.adxrBuffer[indexVal] / this.adxrBuffer[indexVal - 1];
        let testVal9 = this.timeBuffer[indexVal];
        // this.brain.learning = false;
        var action = this.brain.forward([testVal2, testVal, testVal3, testVal4, testVal5, testVal6, testVal7, testVal8, testVal9]);
        // console.log('from take action: ' + action);
        return action;
    },

    update: function (candle) {

        var adxrVal = this.tulipIndicators.adxr.result.result;

        let price = candle.vwp;
        // play with the candle values to finetune this
        this.SMMA.update(price);
        let smmaFast = this.SMMA.result;
        if (1 === this.scale && 1 < candle.high && 0 === this.predictionCount) this.setNormalizeFactor(candle);

        if (!smmaFast)
            return
        if (!adxrVal)
            return
        this.priceBufferSMA.push(smmaFast);
        this.priceBuffer.push(price);
        this.priceVolumeBuffer.push(candle.volume);
        this.priceBufferLow.push(candle.low);
        this.priceBufferHigh.push(candle.high);
        this.priceBufferOpen.push(candle.open);
        this.priceBufferClose.push(candle.close);
        this.adxrBuffer.push(adxrVal / 100);
        this.timeBuffer.push(new Date().valueOf());

        if (this.requiredHistory > this.priceBufferSMA.length) return;
        this.learn();
        if (this.trainIndex < 10000)
            return;

        if (this.tookAction === true) {
            this.brain.learning = true;
            this.tookAction = false;
            if (this.tookActionVal === 0) {
                reward = this.priceBufferClose[this.priceBufferClose.length - 1] / this.priceBufferClose[this.priceBufferClose.length - 2];
            } else {
                reward = this.priceBufferClose[this.priceBufferClose.length - 2] / this.priceBufferClose[this.priceBufferClose.length - 1];
            }
            reward = reward - 1;
            reward *= 50;
            this.brain.backward(reward);        // console.log('learn reward in asset', this.tookActionVal, (reward));
        }

        if (this.adxrBuffer.length > this.requiredHistory * 2) {
            this.priceBufferSMA.splice(0, 1);
            this.priceBuffer.splice(0, 1);
            this.priceVolumeBuffer.splice(0, 1);
            this.priceBufferLow.splice(0, 1);
            this.priceBufferHigh.splice(0, 1);
            this.priceBufferOpen.splice(0, 1);
            this.priceBufferClose.splice(0, 1);
            this.adxrBuffer.splice(0, 1);
            this.timeBuffer.splice(0, 1);
        }
    },

    onTrade: function (event) {
        this.actionIncentive = 0;
        this.prevPrice = event.price;
        // this.prevAction = event.action;
    },

    check: function () {

        if (this.prevPrice === 0) {
            this.prevPrice = this.candle.close;
        }
        if (this.predictionCount < this.settings.min_predictions || this.priceBuffer.length < this.requiredHistory) {
            console.log('still learning');
            this.predictionCount++;
            return;
        }

        thisAction = this.takeAction();
        this.tookActionVal = thisAction;
        this.tookAction = true;
        if (this.ambition > 5)
            this.ambition *= 0.9
        this.actionIncentive += this.candle.vwp * 0.00001 + this.ambition;
        // console.log(thisAction);
        // console.log('check function: action = ' + thisAction);
        // console.log('Buy', thisAction === 0 && this.prevPrice > this.candle.close * 1.002 - (this.actionIncentive), 'Sell', thisAction === 1 && this.prevPrice < this.candle.close * 0.995 + (this.actionIncentive) && this.prevPrice < this.candle.close)
        if (thisAction === 0) {// && this.prevPrice > this.candle.close * 1.002 - (this.actionIncentive)) {// && this.prevAction !== thisAction) {// && this.prevAction === thisAction) {//buy
            this.prevAction = thisAction;
            // console.log(thisAction);
            return this.advice('long', this.candle.close, true);
        } else if (thisAction === 1) {// && this.prevPrice < this.candle.close * 0.995 + (this.actionIncentive) && this.prevPrice < this.candle.close) {// && this.prevAction !== thisAction) {// && this.prevAction === thisAction) {//sell

            this.prevAction = thisAction;
            // console.log(thisAction);
            return this.advice('short', this.candle.close, true);

        }
    },

    end: function () {
        //log.debug('Triggered stoploss',this.stoplossCounter,'times');
        console.log('Triggered stoploss' + this.stoplossCounter + 'times');
    }
};

module.exports = strategy;
