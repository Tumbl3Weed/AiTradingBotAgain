var convnetjs = require('convnetjs');
var math = require('mathjs');


var log = require('../core/log.js');

var config = require ('../core/util.js').getConfig();

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
  priceBuffer : [],
  predictionCount : 0,

  batchsize : 1,
  // no of neurons for the layer
  layer_neurons : 10,
  // activaction function for the first layer, when neurons are > 0
  layer_activation : 'tanh',
  // normalization factor
  scale : 1,
  // stores the last action (buy or sell)
  prevAction : 'wait',
  //stores the price of the last trade (buy/sell)
  prevPrice : 0,
  cutPrice : 0,
  // counts the number of triggered stoploss events
  stoplossCounter : 0,

  // if you want the bot to hodl instead of selling during a small dip
  // use the hodl_threshold. e.g. 0.95 means the bot won't sell
  // when unless the price drops below a 5% threshold of the last buy price (this.privPrice)
  hodl_threshold : 1,

  // init the strategy
  init : function() {

    this.name = 'Neural Network Cal';
    this.requiredHistory = config.tradingAdvisor.historySize;

    // smooth the input to reduce the noise of the incoming data
    this.SMMA = new SMMA(3);

    let layers = [
      {type:'input', out_sx:1, out_sy:1, out_depth: 1},
      {type:'fc', num_neurons: this.layer_neurons, activation: this.layer_activation},
      {type:'fc', num_neurons: this.layer_neurons, activation: this.layer_activation},
      {type:'regression', num_neurons: 1}
    ];

    this.nn = new convnetjs.Net();

    this.nn.makeLayers( layers );
    this.trainer = new convnetjs.SGDTrainer(this.nn, {
      learning_rate: this.settings.learning_rate,
      momentum: this.settings.momentum,
      batch_size: this.batchsize,
      l2_decay: this.settings.decay
    });

    this.addIndicator('stoploss', 'StopLoss', {
      threshold : this.settings.stoploss_threshold,
      action : 'stoploss'
    });

    this.hodl_threshold = this.settings.hodl_threshold || 1;
  },

  learn : function () {
    
    for (let i = 1; i < this.priceBuffer.length; i++) {
      let current_price = [this.priceBuffer[i]];
      //let testVal = Math.random();
      let testVal = this.priceBuffer[i-1]
      let vol = new convnetjs.Vol([testVal]);
      this.trainer.train(vol, current_price);
      this.nn.forward(vol);
      this.predictionCount++;
    }
    
  },

  setNormalizeFactor : function(candle) {
    this.scale = Math.pow(10,Math.trunc(candle.high).toString().length+2);
    log.debug('Set normalization factor to',this.scale);
  },

  update : function(candle)
  {
    if (
      'buy' === this.prevAction
      && this.settings.stoploss_enabled
      && 'stoploss' === this.indicators.stoploss.action
    ) {
    this.stoplossCounter++;
    log.debug('>>>>>>>>>> STOPLOSS triggered <<<<<<<<<<');
    this.advice('short');
    }

    // play with the candle values to finetune this
    this.SMMA.update( candle.close );
    let smmaFast = this.SMMA.result;
    this.setNormalizeFactor(candle);

    this.priceBuffer.push(smmaFast / this.scale );
    if (2 > this.priceBuffer.length) return;

    for (tweakme=0;tweakme<20;++tweakme)
      this.learn();
    
  },

  onTrade: function(event) {
    
    if ('sell' !== event.action) {
      this.indicators.stoploss.long(event.price);
    }
    // store the previous action (buy/sell)
    console.log(this.prevAction + ' Now we -> '+event.action);
    this.prevAction = event.action;
    // store the price of the previous trade
    this.prevPrice = event.price;
    this.cutPrice= event.price;
  },

  predictCandle : function() {
    let vol = new convnetjs.Vol(this.priceBuffer);
    let prediction = this.nn.forward(vol);
    return prediction.w[0];
  },

  check : function(candle) {

    if(this.predictionCount < this.settings.min_predictions)
    {
      return;
    }        


    let prediction = this.predictCandle() * this.scale;
    let currentPrice = candle.close;
    let meanp = math.mean(prediction, currentPrice);
    let meanAlpha = ((meanp - currentPrice) / currentPrice) * 100;

    if ('sell' !== this.prevAction) {
      
      if(currentPrice > Math.round(this.cutPrice * 1.001)){
        this.cutPrice = Math.round(currentPrice * 0.999);
      }
    }
    if('buy'!== this.prevAction){
      if(currentPrice < Math.round(this.cutPrice * 1.005)){
        this.cutPrice = currentPrice;
      }
    }

    // sell only if the price is higher than the buying price or if the price drops below the threshold
    // a hodl_threshold of 1 will always sell when the NN predicts a drop of the price. play with it!
    let signalBuy = candle.close > this.cutPrice && meanAlpha > this.settings.threshold_buy || candle.close > prediction && meanAlpha > this.settings.threshold_buy;

    let signalPredictisDown = meanp < this.cutPrice; //false means buy true means sell, rising price prediction.

    if ('sell' !== this.prevAction
      && 'stoploss' === this.indicators.stoploss.action
      && signalPredictisDown
    ) {
    this.stoplossCounter++;
    log.debug('>>>>>>>>>> STOPLOSS triggered <<<<<<<<<<');
    console.log('>>>>>>>>>> STOPLOSS triggered <<<<<<<<<<');
    this.advice('short');
    }

    if ('buy' !== this.prevAction && !signalPredictisDown && signalBuy)
    {  
      //console.log('signalSell '+signalSell +',signalBuy '+ signalBuy + ',signalPredictisDown '+signalPredictisDown);   
      log.debug("Buy - Predicted variation: ",meanAlpha);
      console.log("Buy - Predicted variation: " + meanAlpha);
      return this.advice('long');
    } else if ('sell' !== this.prevAction && signalPredictisDown)
    {
      //console.log('signalSell '+signalSell +',signalBuy '+ signalBuy + ',signalPredictisDown '+signalPredictisDown);
      log.debug("Sell - Predicted variation: ",meanAlpha);
      console.log("Sell - Predicted variation: " + meanAlpha);
      return this.advice('short');
    }
    
  },

  end : function() {
    log.debug('Triggered stoploss',this.stoplossCounter,'times');
    console.log('Triggered stoploss'+this.stoplossCounter +'times');
  }


};

module.exports = strategy;
