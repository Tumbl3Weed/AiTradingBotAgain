const _ = require('lodash');
const util = require('../../core/util.js');
const config = util.getConfig();
const dirs = util.dirs();
const moment = require('moment');

const log = require(dirs.core + 'log');
const Broker = require(dirs.broker + '/gekkoBroker');

require(dirs.gekko + '/exchange/dependencyCheck');

const Trader1 = function (next) {

  _.bindAll(this);

  this.brokerConfig = {
    ...config.trader,
    ...config.watch,
    private: true
  }

  this.propogatedTrades = 0;
  this.propogatedTriggers = 0;

  try {
    this.broker = new Broker(this.brokerConfig);
  } catch (e) {
    util.die(e.message);
  }

  if (!this.broker.capabilities.gekkoBroker) {
    util.die('This exchange is not yet supported');
  }

  this.sync(() => {
    log.info('\t', 'Portfolio:');
    log.info('\t\t', this.portfolio.currency, this.brokerConfig.currency);
    log.info('\t\t', this.portfolio.asset, this.brokerConfig.asset);
    log.info('\t', 'Balance:');
    log.info('\t\t', this.balance, this.brokerConfig.currency);
    log.info('\t', 'Exposed:');
    log.info('\t\t',
      this.exposed ? 'yes' : 'no',
      `(${(this.exposure * 100).toFixed(2)}%)`
    );
    next();
  });

  // this.cancellingOrder = false;
  this.sendInitialPortfolio = false;

  setInterval(this.sync, 1001 * 30);
}

// teach our trader events
util.makeEventEmitter(Trader1);

Trader1.prototype.sync = function (next) {
  log.debug('syncing private data');

  this.broker.syncPrivateData(() => {
    if (!this.price) {
      this.price = this.broker.ticker.bid;
    }

    const oldPortfolio = this.portfolio;

    this.setPortfolio();
    this.setBalance();
    this.relayPortfolioValueChange();
    log.info('\t\t', this.balance, this.brokerConfig.currency);
    if (this.sendInitialPortfolio && !_.isEqual(oldPortfolio, this.portfolio)) {
      this.relayPortfolioChange();
    }
    // balance is relayed every minute
    // no need to do it here.

    if (next) {
      return next();
    }
  });
}

Trader1.prototype.relayPortfolioChange = function () {
  this.deferredEmit('portfolioChange', {
    asset: this.portfolio.asset,
    currency: this.portfolio.currency
  });
}

Trader1.prototype.relayPortfolioValueChange = function () {
  this.deferredEmit('portfolioValueChange', {
    balance: this.balance
  });
}

Trader1.prototype.setPortfolio = function () {
  this.portfolio = {
    currency: _.find(
      this.broker.portfolio.balances,
      b => b.name === this.brokerConfig.currency
    ).amount,
    asset: _.find(
      this.broker.portfolio.balances,
      b => b.name === this.brokerConfig.asset
    ).amount
  }
}

Trader1.prototype.setBalance = function () {
  this.balance = this.portfolio.currency + this.portfolio.asset * this.price;
  this.exposure = (this.portfolio.asset * this.price) / this.balance;
  // if more than 10% of balance is in asset we are exposed
  this.exposed = this.exposure > 0.1;
}

Trader1.prototype.processCandle = function (candle, done) {
  this.price = candle.vwp;
  const previousBalance = this.balance;
  this.setPortfolio();
  this.setBalance();

  if (!this.sendInitialPortfolio) {
    this.sendInitialPortfolio = true;
    this.deferredEmit('portfolioChange', {
      asset: this.portfolio.asset,
      currency: this.portfolio.currency
    });
  }

  if (this.balance !== previousBalance) {
    // this can happen because:
    // A) the price moved and we have > 0 asset
    // B) portfolio got changed
    this.relayPortfolioValueChange();
  }

  done();
}

Trader1.prototype.processAdvice = function (advice) {

  let direction;
  const id = 'trade-' + (++this.propogatedTrades);
  if (advice.recommendation === 'long') {
    direction = 'buy';
  } else if (advice.recommendation === 'short') {
    direction = 'sell';
  } else {  //no action
    // // log.error('ignoring advice in unknown direction');
    // if (this.order && this.propogatedTrades)
    //   return this.cancelOrder('trade-' + (this.propogatedTrades), advice, () => console.log('cancelled order because no advice'));
    // else
    return;
  }

  // console.log('This Order = ', this.order);
  if (this.order) {
    console.log('CancellingOrder: ', this.cancellingOrder, ' Direction: ', direction, ' Side: ', this.order.side, ' Status: ', this.order.status);
    if (this.cancellingOrder) {

      if (this.order.status) {
        this.cancellingOrder = false;
        if (id)
          return this.cancelOrder(id, advice, () => this.processAdvice(advice));
        else return;
      } else {
        this.order = null;
      }

      this.cancellingOrder = false;
      if (id)
        return this.cancelOrder(id, advice, () => this.processAdvice(advice));
      else return;
    }
    // console.log(direction, this.order.side);
    if (direction === this.order.side) {
      if (this.order.side == 'buy') {
        if (this.order.price > advice.price) {
          if (id)
            return this.cancelOrder(id, advice, () => this.processAdvice(advice));
          else
            return this.cancelOrder(this.order.id, advice, () => this.processAdvice(advice));
        }
      } else {
        if (this.order.price < advice.price) {
          if (id)
            return this.cancelOrder(id, advice, () => this.processAdvice(advice));
          else
            return this.cancelOrder(this.order.id, advice, () => this.processAdvice(advice));
        }
        // console.log('Called Edit Limit to', advice.price);
        return;
      }
    }
    if (this.order.side !== direction) {
      if (this.order.side == 'buy') {
        if (this.order.price * 1.005 > advice.price) {
          if (id)
            return this.cancelOrder(id, advice, () => this.processAdvice(advice));
          else
            return this.cancelOrder(this.order.id, advice, () => this.processAdvice(advice));

        }
      }
      if (this.order.side == 'sell') {
        if (this.order.price < advice.price * 1.005) {
          if (id)
            return this.cancelOrder(id, advice, () => this.processAdvice(advice));
          else
            return this.cancelOrder(this.order.id, advice, () => this.processAdvice(advice));
        }
      }

    }
    log.info('Received advice to', direction, 'however Gekko is already in the process to', this.order.side);
    log.info('Canceling', this.order.side, 'order first');
    if (id)
      return this.cancelOrder(id, advice, () => this.processAdvice(advice));
    else
      return this.cancelOrder(this.order.id, advice, () => this.processAdvice(advice));



  }//end of if (this.order) {

  this.price = advice.price;
  let amount;

  if (direction === 'buy') {
    this.price = this.price;
    amount = (this.portfolio.currency / this.price);
    amount *= 1 / 2;
    this.currency = this.portfolio.currency / 2;
    if (this.brokerConfig.asset === 'XBT' || this.brokerConfig.asset === 'BTC') {
      amount = (this.portfolio.currency / this.price);
      amount *= 1 / 2;
      this.currency = this.portfolio.currency / 2;
      if (amount < 0.0005) {
        amount = (this.portfolio.currency / this.price);
        amount *= 1 / 2;
        this.currency = this.portfolio.currency / 2;
        if (amount < 0.0005) {
          amount = (this.portfolio.currency / this.price) * 1;
          this.currency = this.portfolio.currency;
          if (amount < 0.0005) {
            log.info('NOT buying, already exposed');
            this.deferredEmit('tradeAborted', {
              id,
              adviceId: advice.id,
              action: direction,
              portfolio: this.portfolio,
              balance: this.balance,
              reason: "Portfolio already in position."
            });
          }
        }
      }

    }
    log.info(
      'Trader',
      'Received advice to go long.',
      'Buying ', this.brokerConfig.asset
    );

  } else if (direction === 'sell') {
    this.price = this.price;
    amount = this.portfolio.asset * 1 / 2;
    if (this.brokerConfig.asset === 'XBT' || this.brokerConfig.asset === 'BTC') {
      amount = this.portfolio.asset * 1 / 2;
      if (amount < 0.0005) {
        amount = this.portfolio.asset * 1 / 2;
        if (amount < 0.0005) {
          amount = this.portfolio.asset * 1;
          if (amount < 0.0005) {
            log.info('NOT selling, already no exposure');
            this.deferredEmit('tradeAborted', {
              id,
              adviceId: advice.id,
              action: direction,
              portfolio: this.portfolio,
              balance: this.balance,
              reason: "Portfolio already in position."
            });
          }
        }
      }
      this.currency = this.portfolio.currency;
    }
    // clean up potential old stop trigger
    if (this.activeStopTrigger) {
      this.deferredEmit('triggerAborted', {
        id: this.activeStopTrigger.id,
        date: advice.date
      });

      this.activeStopTrigger.instance.cancel();

      delete this.activeStopTrigger;
    }

    log.info(
      'Trader',
      'Received advice to go short.',
      'Selling ', this.brokerConfig.asset
    );
  }

  this.createOrder(direction, amount, advice, id);
}

Trader1.prototype.createOrder = function (side, amount, advice, id) {
  const type = 'sticky';

  // NOTE: this is the best check we can do at this point
  // with the best price we have. The order won't be actually
  // created with this.price, but it should be close enough to
  // catch non standard errors (lot size, price filter) on
  // exchanges that have them.
  const check = this.broker.isValidOrder(amount, this.price);//Math.round(this.price));

  if (!check.valid) {
    log.warn('NOT creating order! Reason:', check.reason);
    return this.deferredEmit('tradeAborted', {
      id,
      adviceId: advice.id,
      action: side,
      portfolio: this.portfolio,
      balance: this.balance,
      reason: check.reason
    });
  }

  log.debug('Creating order to', side, amount, this.brokerConfig.asset);

  this.deferredEmit('tradeInitiated', {
    id,
    adviceId: advice.id,
    action: side,
    portfolio: this.portfolio,
    balance: this.balance
  });
  var limit = this.price;   //Math.round(this.price);
  var currency = this.currency;
  if (this.brokerConfig.asset === 'XBT' || this.brokerConfig.asset === 'BTC')
    this.order = this.broker.createOrder(type, side, amount, params = { limit: limit, noLimit: true, outbid: true, currency: currency, canTakeInstantProfit: advice.canTakeInstantProfit });
  else
    this.order = this.broker.createOrder(type, side, amount, params = { limit: limit, noLimit: true, outbid: true, currency: currency, canTakeInstantProfit: advice.canTakeInstantProfit });
  this.order.on('fill', f => log.info('[ORDER] partial', side, 'fill, total filled:', f));
  this.order.on('statusChange', s => log.debug('[ORDER] statusChange:', s));

  this.order.on('error', e => {
    log.error('[ORDER] Gekko received error from GB:', e.message);
    log.debug(e);
    this.order = null;
    this.cancellingOrder = false;

    this.deferredEmit('tradeErrored', {
      id,
      adviceId: advice.id,
      date: moment(),
      reason: e.message
    });

  });
  this.order.on('completed', () => {
    this.order.createSummary((err, summary) => {
      if (!err && !summary) {
        err = new Error('GB returned an empty summary.')
      }

      if (err) {
        log.error('Error while creating summary:', err);
        return this.deferredEmit('tradeErrored', {
          id,
          adviceId: advice.id,
          date: moment(),
          reason: err.message
        });
      }

      log.info('[ORDER] summary:', summary);
      this.order = null;
      this.sync(() => {

        let cost;
        if (_.isNumber(summary.feePercent)) {
          cost = summary.feePercent / 100 * summary.amount * summary.price;
        }

        let effectivePrice;
        if (_.isNumber(summary.feePercent)) {
          if (side === 'buy') {
            effectivePrice = summary.price * (1 + summary.feePercent / 100);
          } else {
            effectivePrice = summary.price * (1 - summary.feePercent / 100);
          }
        } else {
          log.warn('WARNING: exchange did not provide fee information, assuming no fees..');
          effectivePrice = summary.price;
        }

        this.deferredEmit('tradeCompleted', {
          id,
          adviceId: advice.id,
          action: summary.side,
          cost,
          amount: summary.amount,
          price: summary.price,
          portfolio: this.portfolio,
          balance: this.balance,
          date: summary.date,
          feePercent: summary.feePercent,
          effectivePrice,
          cancel: this.cancelling
        });

        if (
          side === 'buy' &&
          advice.trigger &&
          advice.trigger.type === 'trailingStop'
        ) {
          const trigger = advice.trigger;
          const triggerId = 'trigger-' + (++this.propogatedTriggers);

          this.deferredEmit('triggerCreated', {
            id: triggerId,
            at: advice.date,
            type: 'trailingStop',
            properties: {
              trail: trigger.trailValue,
              initialPrice: summary.price,
            }
          });

          log.info(`Creating trailingStop trigger "${triggerId}"! Properties:`);
          log.info(`\tInitial price: ${summary.price}`);
          log.info(`\tTrail of: ${trigger.trailValue}`);

          this.activeStopTrigger = {
            id: triggerId,
            adviceId: advice.id,
            instance: this.broker.createTrigger({
              type: 'trailingStop',
              onTrigger: this.onStopTrigger,
              props: {
                trail: trigger.trailValue,
                initialPrice: summary.price,
              }
            })
          }
        }
      });
    })
  });
}

Trader1.prototype.onStopTrigger = function (price) {
  log.info(`TrailingStop trigger "${this.activeStopTrigger.id}" fired! Observed price was ${price}`);

  this.deferredEmit('triggerFired', {
    id: this.activeStopTrigger.id,
    date: moment()
  });

  const adviceMock = {
    recommendation: 'short',
    id: this.activeStopTrigger.adviceId
  }

  delete this.activeStopTrigger;

  this.processAdvice(adviceMock);
}

Trader1.prototype.cancelOrder = function (id, advice, next) {

  if (!this.order || !id) {
    // console.log(this.order);
    this.cancellingOrder = false;
    return next();
  }

  this.cancellingOrder = true;
  console.log('This order cancelOrder: ' + this.order + ' and ' + this.cancellingOrder);
  this.order.removeAllListeners();
  this.order.cancel();
  this.order.once('completed', () => {
    this.order = null;
    this.cancellingOrder = false;
    this.deferredEmit('tradeCancelled', {
      id,
      adviceId: advice.id,
      date: moment()
    });
    this.sync(next);
  });
}

module.exports = Trader1;
