const EventEmitter = require('events');

// Note: as of now only supports trailing the price going up (after 
// a buy), on trigger (when the price moves down) you should sell.


// @param initialPrice: initial price, preferably buy price
// @param trail: fixed offset from the price
// @param onTrigger: fn to call when the stop triggers
class TrailingStop extends EventEmitter {
  constructor({trail, initialPrice, onTrigger}) {
    super();

    this.trail = trail/100;
    this.isLive = true;
    this.onTrigger = onTrigger;

    this.previousPrice = initialPrice * this.trail ;
  }

  updatePrice(price) {
    if(!this.isLive) {
      return;
    }

    if(price > this.previousPrice * this.trail) {
      this.previousPrice = price;
    }

    

    if(price <= this.previousPrice) {
      this.trigger();
    }
  }

  updateTrail(trail) {
    this.updatePrice(this.previousPrice);
  }

  trigger() {
    if(!this.isLive) {
      return;
    }

    this.isLive = false;
    if(this.onTrigger) {
      this.onTrigger(this.previousPrice);
    }
    this.emit('trigger', this.previousPrice);
  }
}

module.exports = TrailingStop;