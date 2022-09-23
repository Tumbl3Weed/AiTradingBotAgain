const async = require('async');
const nodemailer = require('nodemailer');
const randomExt = require('random-ext');
const rp = require('request-promise');
const { some } = require('bluebird');
const fs = require('fs-extra');
const flat = require('flat');
const util = require('util');
var moment = require('moment');

class Ga {

  constructor({ gekkoConfig, stratName, mainObjective, populationAmt, parallelqueries, minSharpe, variation, mutateElements, notifications, getProperties, apiUrl }, configName, classRef) {
    // console.log(classRef);
    if (classRef)
      this.realtimeStrategy = classRef;
    this.configName = configName.replace(/\.js|config\//gi, "");
    this.stratName = stratName;
    this.mainObjective = mainObjective;
    this.getProperties = getProperties;
    this.apiUrl = apiUrl;
    this.sendemail = notifications.email.enabled;
    this.senderservice = notifications.email.senderservice;
    this.sender = notifications.email.sender;
    this.senderpass = notifications.email.senderpass;
    this.receiver = notifications.email.receiver;
    this.currency = gekkoConfig.watch.currency;
    this.asset = gekkoConfig.watch.asset;
    this.previousBestParams = null;
    this.populationAmt = populationAmt;
    this.parallelqueries = parallelqueries;
    this.minSharpe = minSharpe;
    this.variation = variation;
    this.mutateElements = mutateElements;
    this.allTimeMaximum = null;
    this.baseConfig = {
      watch: gekkoConfig.watch,
      paperTrader: {
        slippage: gekkoConfig.slippage,
        feeTaker: gekkoConfig.feeTaker,
        feeMaker: gekkoConfig.feeMaker,
        feeUsing: gekkoConfig.feeUsing,
        simulationBalance: gekkoConfig.simulationBalance,
        reportRoundtrips: true,
        enabled: true
      },
      writer: {
        enabled: false,
        logpath: ''
      },
      tradingAdvisor: {
        enabled: true,
        method: this.stratName,
      },
      trader: {
        enabled: false,
      },
      backtest: {
        daterange: gekkoConfig.daterange,
        batchSize: 256,
      },
      backtestResultExporter: {
        enabled: true,
        writeToDisk: false,
        data: {
          stratUpdates: false,
          roundtrips: false,
          stratCandles: true,
          stratCandleProps: [
            'close',
            'start'
          ],
          trades: true
        }
      },
      performanceAnalyzer: {
        riskFreeReturn: 5,  //was 5
        enabled: true
      },
      valid: true
    };

  }

  // Checks for, and if present loads old .json parameters
  async loadBreakPoint() {
    var filename2 = '';

    if (!this.realtimeStrategy) {
      filename2 = `./results/${this.configName}-${this.currency}_${this.asset}_${this.stratName}.json`;
      console.log('is there a strategy REF!!!!!!!!!!!!!!!!!!!!!!!!!!================1=');
    } else {
      console.log('is there a strategy REF!!!!!!!!!!!!!!!!!!!!!!!!!!================2=');
      filename2 = `C:/Users/Calvi/gekko/gekkoga/results/realtime/${this.configName}-${this.currency}_${this.asset}_${this.realtimeStrategy.name}.json`;
    }
    const fileName = filename2;
    const exists = fs.existsSync(fileName);

    if (exists) {
      console.log('Previous config found, loading...');
      return fs.readFile(fileName, 'utf8').then(JSON.parse);
    }
    return false;
  }

  async loadBreakPointPop() {
    var filename2 = '';

    if (!this.realtimeStrategy) {
      filename2 = `./results/${this.configName}-${this.currency}_${this.asset}_${this.stratName}POP.json`;
      console.log('is there a strategy REF!!!!!!!!!!!!!!!!!!!!!!!!!!================1=');
    } else {
      console.log('is there a strategy REF!!!!!!!!!!!!!!!!!!!!!!!!!!================2=');
      filename2 = `C:/Users/Calvi/gekko/gekkoga/results/realtime/${this.configName}-${this.currency}_${this.asset}_${this.realtimeStrategy.name}POP.json`;
    }
    const fileName = filename2;
    const exists = fs.existsSync(fileName);

    if (exists) {
      console.log('Previous config found, loading...');
      return fs.readFile(fileName, 'utf8').then(JSON.parse);
    }
    return false;
  }

  // Allows queued execution via Promise
  queue(items, parallel, ftc) {
    const queued = [];

    return Promise.all(items.map((item) => {

      const mustComplete = Math.max(0, queued.length - parallel + 1);
      const exec = some(queued, mustComplete).then(() => ftc(item));
      queued.push(exec);

      return exec;
    }));
  }

  // Creates a random gene if prop='all', creates one random property otherwise
  createGene(prop) {
    // Is first generation, and previous props available, load them as a start-point
    if (this.previousBestParams === null || this.runstarted) {
      let properties = flat.flatten(this.getProperties());
      return prop === 'all' ? flat.unflatten(properties) : properties[prop];
    } else if (this.previousBestParams.parameters && !this.runstarted) {
      this.runstarted = 1;
      let properties = flat.flatten(this.previousBestParams.parameters);
      return prop === 'all' ? flat.unflatten(properties) : properties[prop];
    } else {
      throw Error('Could not resolve a suitable state for previousBestParams');
    }
  }

  // Creates random population from genes
  createPopulation() {
    let population = [];

    for (let i = 0; i < this.populationAmt; i++) {
      population.push(this.createGene('all'));
    }
    return population;
  }

  // Pairs two parents returning two new childs
  crossover(a, b) {
    let len = Object.keys(a).length;
    let crossPoint = randomExt.integer(len - 1, 1);
    let tmpA = {};
    let tmpB = {};
    let currPoint = 0;

    for (let i in a) {
      if (a.hasOwnProperty(i) && b.hasOwnProperty(i)) {
        if (currPoint < crossPoint) {
          tmpA[i] = a[i];
          tmpB[i] = b[i];
        } else {
          tmpA[i] = b[i];
          tmpB[i] = a[i];
        }
      }
      currPoint++;
    }
    return [tmpA, tmpB];
  }

  // Mutates object a at most maxAmount times
  mutate(a, maxAmount) {
    // console.log('logging the mutates', a, ' max amount', maxAmount)
    let amt = randomExt.integer(maxAmount, 0);
    // flatten, mutate, return unflattened object
    let flattened = flat.flatten(a);
    let allProps = Object.keys(flattened);

    for (let i = 0; i < amt; i++) {
      let position = randomExt.integer(Object.keys(allProps).length - 1, 0);
      let prop = allProps[position];
      flattened[prop] = this.createGene(prop);
    }

    return flat.unflatten(flattened);
  }

  // For the given population and fitness, returns new population and max score
  runEpoch(population, populationProfits, populationSharpes, populationScores) {
    let selectionProb = [];
    let fitnessSum = 0;
    let maxFitness = [0, 0, 0, 0];

    for (let i = 0; i < this.populationAmt; i++) {

      if (this.mainObjective == 'score') {

        if (populationProfits[i] < 0 && populationSharpes[i] < 0) {

          populationScores[i] = (populationProfits[i] * populationSharpes[i]) * -1;

        } else {

          populationScores[i] = Math.tanh(populationProfits[i] / 3) * Math.tanh(populationSharpes[i] / 0.25);

        }

        if (populationScores[i] > maxFitness[2]) {

          maxFitness = [populationProfits[i], populationSharpes[i], populationScores[i], i];

        }

      } else if (this.mainObjective == 'profit') {

        if (populationProfits[i] > maxFitness[0]) {

          maxFitness = [populationProfits[i], populationSharpes[i], populationScores[i], i];

        }

      } else if (this.mainObjective == 'profitForMinSharpe') {

        if (populationProfits[i] > maxFitness[0]) {

          maxFitness = [populationProfits[i], populationSharpes[i], populationScores[i], i];

        }

      }

      fitnessSum += populationProfits[i];

    }

    if (fitnessSum === 0) {

      for (let j = 0; j < this.populationAmt; j++) {

        selectionProb[j] = 1 / this.populationAmt;

      }

    } else {
      for (let j = 0; j < this.populationAmt; j++) {
        selectionProb[j] = populationProfits[j] / fitnessSum;
      }

    }

    let newPopulation = [];

    while (newPopulation.length < this.populationAmt * (1 - this.variation)) {

      let a, b;
      let selectedProb = randomExt.float(1, 0);

      for (let k = 0; k < this.populationAmt; k++) {
        selectedProb -= selectionProb[k];

        if (selectedProb <= 0) {
          a = population[k];
          break;
        }
      }

      selectedProb = randomExt.float(1, 0);

      for (let k = 0; k < this.populationAmt; k++) {
        selectedProb -= selectionProb[k];
        if (selectedProb <= 0) {
          b = population[k];
          break;
        }
      }
      let res = this.crossover(this.mutate(a, this.mutateElements), this.mutate(b, this.mutateElements));
      newPopulation.push(res[0]);
      newPopulation.push(res[1]);
    }

    for (let l = 0; l < this.populationAmt * this.variation; l++) {
      newPopulation.unshift(this.createGene('all'));
    }

    return [newPopulation, maxFitness];
  }

  getConfig(data) {

    if (this.realtimeStrategy) {
      var date = new Date();
      // var startDate = moment(new Date("2021-08-17 18:00")).subtract(randomExt.integer(10, -10), 'minutes').format('YYYY-MM-DD HH:mm');   // current date's milliseconds - 1,000 ms * 60 s * 60 mins * 24 hrs * 1(1# of days beyond one to go back)
      // var startDate = moment(new Date("2021-01-01 00:00")).subtract(randomExt.integer(720, -720), 'minutes').format('YYYY-MM-DD HH:mm');   // current date's milliseconds - 1,000 ms * 60 s * 60 mins * 24 hrs * 1(1# of days beyond one to go back)
      // console.log(moment(date).subtract(121, 'minutes').format('YYYY-MM-DD HH:mm'));
      this.baseConfig.backtest.daterange = {
        from: moment(new Date()).subtract(13, 'days').format('YYYY-MM-DD HH:mm'),
        // from: moment(date).subtract(0, 'days').subtract(240, 'minutes').format('YYYY-MM-DD HH:mm'),
        to: moment(date).subtract(122, 'minutes').format('YYYY-MM-DD HH:mm')
      };//, to: date };
    }
    const conf = Object.assign({}, this.baseConfig);

    conf[this.stratName] = Object.keys(data).reduce((acc, key) => {
      acc[key] = data[key];
      return acc;
    }, {});

    Object.assign(conf.tradingAdvisor, {
      candleSize: data.candleSize,
      historySize: data.historySize
    });

    return conf;
  }

  // Calls api for every element in testSeries and returns gain for each
  async fitnessApi(testsSeries) {
    const numberOfParallelQueries = this.parallelqueries;

    const results = await this.queue(testsSeries, numberOfParallelQueries, async (data) => {

      const outconfig = this.getConfig(data);
      const body = await rp.post({
        url: `${this.apiUrl}/api/backtest`,
        json: true,
        body: outconfig,
        headers: { 'Content-Type': 'application/json', 'Connection': 'keep-alive' },//, timeout: 1000 * 60 * 60 * 50 },//10 hour timeout
      });

      // These properties will be outputted every epoch, remove property if not needed
      const properties = ['balance', 'profit', 'sharpe', 'market', 'relativeProfit', 'yearlyProfit', 'relativeYearlyProfit', 'startPrice', 'endPrice', 'trades'];
      const report = body.performanceReport;
      let result = { profit: 0, metrics: false, lastAction: '', config: '' };

      if (report) {
        let picked = properties.reduce((o, k) => {
          o[k] = report[k];
          return o;
        }, {});
        // console.log(body);
        result = { profit: body.performanceReport.profit, sharpe: body.performanceReport.sharpe, metrics: picked, amountOfTrades: body.trades.length, strategyParameters: body.strategyParameters };
      }
      return result;
    });

    let scores = [];
    let profits = [];
    let sharpes = [];
    let otherMetrics = [];
    let amountOfTrades = [];
    let strategyParameters = [];
    for (let i in results) {

      if (results.hasOwnProperty(i)) {
        scores.push(results[i]['profit'] * results[i]['sharpe']);
        profits.push(results[i]['profit']);
        sharpes.push(results[i]['sharpe']);
        otherMetrics.push(results[i]['metrics']);
        amountOfTrades.push(results[i]['amountOfTrades']);
        strategyParameters.push(results[i]['strategyParameters']);
      }

    }
    return { scores, profits, sharpes, otherMetrics, amountOfTrades, strategyParameters };
  }

  updateNewBest(allTimeMaximum) {

    if (this.realtimeStrategy) {  //if it exists we running live. 
      console.log('!!!!!!!!!Strat has been updated!!!!!!!')
      if (allTimeMaximum) {
        if (this.realtimeStrategy.settings.ambition) {
          allTimeMaximum.parameters.ambition = this.realtimeStrategy.settings.ambition;
        }
        if (this.realtimeStrategy.settings.lastTrade != 'none')
          allTimeMaximum.parameters.lastTrade = this.realtimeStrategy.settings.lastTrade;
        if (this.realtimeStrategy.settings.sameSideCount) {

          allTimeMaximum.parameters.sameSideCount = this.realtimeStrategy.settings.sameSideCount;
        } else {
          allTimeMaximum.parameters.sameSideCount = 1;
        }
        if (this.realtimeStrategy.settings.previousAmountOfAsset)
          allTimeMaximum.parameters.previousAmountOfAsset = this.realtimeStrategy.settings.previousAmountOfAsset;
        // console.log("realtimeStrategy.settings.prevPrice" + this.realtimeStrategy.settings.prevPrice)
        // console.log("allTimeMaximum.parameters.prevPrice" + allTimeMaximum.parameters.prevPrice)
        if (this.realtimeStrategy.settings.prevPrice != null || this.realtimeStrategy.settings.prevPrice != undefined)
          allTimeMaximum.parameters.prevPrice = this.realtimeStrategy.settings.prevPrice
        this.realtimeStrategy.sendStratUpdates(allTimeMaximum.parameters, this.configName);
      }
      console.log('relativeProfit', allTimeMaximum.otherMetrics.relativeProfit - allTimeMaximum.otherMetrics.market);
    } else {
      if (this.allTimeMaximum) {
        console.log('!!!!!!!!!Strat has been updated!!!!!!!')
        console.log(`
    Global Maximums:
    Score: ${allTimeMaximum.score}
    Profit: ${allTimeMaximum.profit} ${this.currency}
    Sharpe: ${allTimeMaximum.sharpe}
    parameters: \n\r`,
          util.inspect(allTimeMaximum.parameters, false, null),
          `
    Global maximum so far:
    `,
          allTimeMaximum.otherMetrics,
          `
    --------------------------------------------------------------
    `);
      }
    }
  }

  async updateFromTheStrategyToHere() { //from there to here
    const json = JSON.stringify(this.allTimeMaximum);
    await fs.writeFile(`C:/Users/Calvi/gekko/gekkoga/results/realtime/${this.configName}-${this.currency}_${this.asset}_${this.realtimeStrategy.name}.json`, json, 'utf8').catch(err => console.log(err));
  }
  async run() {
    // Check for old break point
    const loaded_config = await this.loadBreakPoint();
    const loaded_population = await this.loadBreakPointPop();
    let population = this.createPopulation();
    let epochNumber = 0;
    let lastActions;
    let amountOfTrades;
    let populationScores;
    let populationProfits;
    let populationSharpes;
    let otherPopulationMetrics;
    this.allTimeMaximum = {
      parameters: {},
      score: -5,
      profit: -5,
      sharpe: -5,
      epochNumber: 0,
      otherMetrics: { relativeProfit: -100 },
      age: new Date(),
      lastAction: '',
    };

    if (loaded_population) {
      population = loaded_population;
      console.log('Resuming previous runs population...');
    }
    if (loaded_config) {
      if (this.realtimeStrategy)
        console.log(`Loaded previous config from ${this.configName}-${this.currency}_${this.asset}_${this.realtimeStrategy.name}.json`);
      this.previousBestParams = loaded_config;

      epochNumber = this.previousBestParams.epochNumber;
      populationScores = this.previousBestParams.score;
      populationProfits = this.previousBestParams.profit;
      populationSharpes = this.previousBestParams.sharpe;
      otherPopulationMetrics = this.previousBestParams.otherMetrics;
      this.allTimeMaximum = {
        parameters: this.previousBestParams.parameters,
        score: this.previousBestParams.score,
        profit: this.previousBestParams.profit,
        sharpe: this.previousBestParams.sharpe,
        epochNumber: this.previousBestParams.epochNumber,
        otherMetrics: this.previousBestParams.otherMetrics,
        age: new Date(this.previousBestParams.age),
        lastAction: this.previousBestParams.lastAction,
      };
      this.updateNewBest(this.allTimeMaximum);
      console.log('Resuming previous run...');

    } else {
      console.log('No previous run data, starting from scratch!');
    }

    console.log(`Starting GA with epoch populations of ${this.populationAmt}, running ${this.parallelqueries} units at a time!`);

    while (1) {

      const startTime = new Date().getTime();

      this.realtimeStrategy.ga = this;

      const res = await this.fitnessApi(population);
      // console.log(res.strategyParameters);

      populationScores = res.scores;
      populationProfits = res.profits;
      populationSharpes = res.sharpes;
      otherPopulationMetrics = res.otherMetrics;
      lastActions = res.lastActions;
      amountOfTrades = res.amountOfTrades;
      // population = res.strategyParameters;

      let endTime = new Date().getTime();
      epochNumber++;
      let results = this.runEpoch(population, populationProfits, populationSharpes, populationScores, lastActions, amountOfTrades);
      let newPopulation = results[0];
      let maxResult = results[1];
      let score = maxResult[2];
      let profit = maxResult[0];
      let sharpe = maxResult[1];
      let position = maxResult[3];

      this.notifynewhigh = false;
      let tempParameters = this.allTimeMaximum.parameters;
      let tempPrevPrice = tempParameters.prevPrice;
      tempParameters.prevPrice = null;
      const outconfig = this.getConfig(tempParameters);
      tempParameters.prevPrice = tempPrevPrice;
      const body = await rp.post({
        url: `${this.apiUrl}/api/backtest`,
        json: true,
        body: outconfig,
        headers: { 'Content-Type': 'application/json', 'Connection': 'keep-alive' },//, timeout: 1000 * 60 * 60 * 10 },//10 hour timeout
      });
      if (body & body.performanceReport)
        if (body.performanceReport.relativeProfit && this.allTimeMaximum.otherMetrics.relativeProfit)
          this.allTimeMaximum.otherMetrics.relativeProfit = body.performanceReport.relativeProfit;
      if (this.allTimeMaximum & this.allTimeMaximum.profit)
        this.allTimeMaximum.profit = body.performanceReport.profit;

      // console.log('score mod', highScoreMod);
      if (this.mainObjective == 'score') {
        if (score > this.allTimeMaximum.score) {
          // console.log('score mod', highScoreMod);
          this.notifynewhigh = true;
          this.allTimeMaximum.parameters = population[position];
          this.allTimeMaximum.otherMetrics = otherPopulationMetrics[position];
          this.allTimeMaximum.score = score;
          this.allTimeMaximum.profit = profit;
          this.allTimeMaximum.sharpe = sharpe;
          this.allTimeMaximum.epochNumber = epochNumber;
          this.allTimeMaximum.age = new Date();
          if (this.realtimeStrategy.lastAction !== '') {
            this.allTimeMaximum.lastAction = this.realtimeStrategy.lastAction;
          }
          this.updateNewBest(this.allTimeMaximum);
        }
      } else if (this.mainObjective == 'profit') {
        if (profit > this.allTimeMaximum.profit) {// || this.allTimeMaximum.age.valueOf() < recentTime.valueOf() && profit * 1.3 > this.allTimeMaximum.profit) {
          // console.log('score mod', highScoreMod);
          this.notifynewhigh = true;
          this.allTimeMaximum.parameters = population[position];
          this.allTimeMaximum.otherMetrics = otherPopulationMetrics[position];
          this.allTimeMaximum.score = score;
          this.allTimeMaximum.profit = profit;
          this.allTimeMaximum.sharpe = sharpe;
          this.allTimeMaximum.epochNumber = epochNumber;
          this.allTimeMaximum.age = new Date();
          if (this.realtimeStrategy.lastAction !== '') {
            this.allTimeMaximum.lastAction = this.realtimeStrategy.lastAction;
          }
          this.updateNewBest(this.allTimeMaximum);
        }
      } else if (this.mainObjective == 'profitForMinSharpe') {
        // let recentTime = new Date(new Date() - 1000 * 60 * 10);
        console.log('population best Profit:', otherPopulationMetrics[position].relativeProfit, 'market profit', otherPopulationMetrics[position].market, 'relative profit:', ((otherPopulationMetrics[position].relativeProfit - otherPopulationMetrics[position].market)), 'vs best relative profit:', ((this.allTimeMaximum.otherMetrics.relativeProfit - otherPopulationMetrics[position].market)));
        if (profit > this.allTimeMaximum.profit) {// || (this.allTimeMaximum.age.valueOf() < recentTime.valueOf() && profit * Math.round(1 + ((-this.allTimeMaximum.age.valueOf() + recentTime.valueOf()) / (1000 * 60))) > this.allTimeMaximum.profit)) {
          // console.log('score mod', highScoreMod);
          this.notifynewhigh = true;
          this.allTimeMaximum.parameters = population[position];
          this.allTimeMaximum.otherMetrics = otherPopulationMetrics[position];
          this.allTimeMaximum.score = score;
          this.allTimeMaximum.profit = profit;
          this.allTimeMaximum.sharpe = sharpe;
          this.allTimeMaximum.epochNumber = epochNumber;
          this.allTimeMaximum.age = new Date();

          this.updateNewBest(this.allTimeMaximum);
        }
      }

      if (this.realtimeStrategy)
        if ((profit * 105 / 100 >= this.allTimeMaximum.profit && sharpe * 105 / 100 >= this.minSharpe && new Date() - this.allTimeMaximum.age > 1000 * 60 * 4) || this.allTimeMaximum.profit < profit) {
          // console.log(Math.round(1.10 + ((recentTime.valueOf() - this.allTimeMaximum.age.valueOf()) / (1000 * 60))));
          let container = {
            parameters: {},
            otherMetrics: {}
          };
          container.parameters = population[position];
          var otherMetrics = otherPopulationMetrics[position];
          container.otherMetrics = otherMetrics;

          const json2 = JSON.stringify(container);

          if (fs.existsSync(`C:/Users/Calvi/gekko/gekkoga/results/realtime/gekkoga/nearFit/${this.configName}-${this.currency}_${this.asset}_${this.realtimeStrategy.name}.json`)) {
            let content;
            content = fs.readFileSync(`C:/Users/Calvi/gekko/gekkoga/results/realtime/gekkoga/nearFit/${this.configName}-${this.currency}_${this.asset}_${this.realtimeStrategy.name}.json`, { encoding: 'utf8' });
            // console.log(content);

            if (!String(content).includes(json2)) {
              fs.appendFile(`C:/Users/Calvi/gekko/gekkoga/results/realtime/gekkoga/nearFit/${this.configName}-${this.currency}_${this.asset}_${this.realtimeStrategy.name}.json`, json2 + '\n', 'utf8').catch(err => console.log(err));
            }

          } else {
            fs.writeFile(`C:/Users/Calvi/gekko/gekkoga/results/realtime/gekkoga/nearFit/${this.configName}-${this.currency}_${this.asset}_${this.realtimeStrategy.name}.json`, json2 + '\n', 'utf8').catch(err => console.log(err));
          }

        }

      if (!this.realtimeStrategy)
        console.log(`
    --------------------------------------------------------------
    Epoch number: ${epochNumber}
    Time it took (seconds): ${(endTime - startTime) / 1000}
    Max score: ${score}
    Max profit: ${profit} ${this.currency}
    Max sharpe: ${sharpe}
    Max profit position: ${position}
    Max parameters:
    `,
          util.inspect(population[position], false, null),
          `
    Other metrics:
    `,
          otherPopulationMetrics[position]);

      // Prints out the whole population with its fitness,
      // useful for finding properties that make no sense and debugging
      // if (!this.realtimeStrategy)
      // for (let element in population) {

      //   console.log('Fitness: ' + populationProfits[element] + ' Properties:');
      //   console.log(population[element]);

      // }

      // store in json
      const json = JSON.stringify(this.allTimeMaximum);
      const jsonPop = JSON.stringify(population);
      if (!this.realtimeStrategy) {  //if it exists we running live. 
        await fs.writeFile(`./results/${this.configName}-${this.currency}_${this.asset}_${this.stratName}.json`, json, 'utf8').catch(err => console.log(err));
        await fs.writeFile(`./results/${this.configName}-${this.currency}_${this.asset}_${this.stratName}POP.json`, jsonPop, 'utf8').catch(err => console.log(err));
      } else {


        // console.log(this.realtimeStrategy);
        await fs.writeFile(`C:/Users/Calvi/gekko/gekkoga/results/realtime/${this.configName}-${this.currency}_${this.asset}_${this.realtimeStrategy.name}.json`, json, 'utf8').catch(err => console.log(err));
        await fs.writeFile(`C:/Users/Calvi/gekko/gekkoga/results/realtime/${this.configName}-${this.currency}_${this.asset}_${this.realtimeStrategy.name}Pop.json`, jsonPop, 'utf8').catch(err => console.log(err));
      }
      if (this.sendemail && this.notifynewhigh) {
        var transporter = nodemailer.createTransport({
          service: this.senderservice,
          auth: {
            user: this.sender,
            pass: this.senderpass
          }
        });
        var mailOptions = {
          from: this.sender,
          to: this.receiver,
          subject: `Profit: ${this.allTimeMaximum.profit} ${this.currency}`,
          text: json
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
      }

      population = newPopulation;
      // console.log(this)
    }//end of while

    console.log(`Finished!
        All time maximum:
        ${this.allTimeMaximum}`);
  }
}
module.exports = Ga;//module.exports = Ga;