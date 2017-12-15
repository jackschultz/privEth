const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const Web3 = require('web3');
const net = require('net');
const config = require('config');
const compiledContract = require('./contracts/contractv1');

const app = express();
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({extended: true}));

//config
const ipcAddr = config.get('ipcAddr');
const configPort = config.get('port');

//web3 work
let web3 = new Web3(ipcAddr, net);

web3.eth.getCoinbase(function(err, cba) {
  coinbaseAddress = cba;
  console.log(coinbaseAddress);
});

const coinbasePassphrase = 'passphrase';

const byteCode = compiledContract.byteCode;
const QuestionContract = new web3.eth.Contract(compiledContract.abi);

var helpers = require('handlebars-helpers');
var comparison = helpers.comparison();

app.get('/', (req, res) => res.render('home'));

app.post('/', (req, res) => {
  const question = req.body.question;
  web3.eth.personal.unlockAccount(coinbaseAddress, coinbasePassphrase, function(err, uares) {
    QuestionContract.deploy({data: byteCode, arguments: [question]}).send({from: coinbaseAddress, gas: 2000000})
      .on('receipt', function (receipt) {
        console.log("Contract Address: " + receipt.contractAddress);
        res.redirect('/questions?address=' + receipt.contractAddress);
      });
  });
});

app.post('/questions', function(req, res) {
  const contractAddress = req.query.address;
  console.log(req.body);
  const answerValue = req.body.answer == 'true' ? true : false;
  console.log(`Answering Question at address ${contractAddress} with answer ${answerValue}`);
  if (web3.utils.isAddress(contractAddress)) {
    console.log('is valid address');
    web3.eth.personal.unlockAccount(coinbaseAddress, coinbasePassphrase, function(err, uares) {
      console.log('account unlocked');
      QuestionContract.options.address = contractAddress;
      QuestionContract.methods.answerQuestion(answerValue).send({from: coinbaseAddress, gas: 1000000})
        .on('error', function (error) {
          console.log('Contract creation error:' + error);
        })
        .on('receipt', function (receipt) {
          console.log(`Question with address ${contractAddress} updated.`);
          res.redirect('/questions?address=' + contractAddress);
        }
      );
    });
  }
});

app.get('/questions', function(req, res) {
  const contractAddress = req.query.address;
  if (web3.utils.isAddress(contractAddress)) {
    QuestionContract.options.address = contractAddress;
    console.log(contractAddress);
    const info = QuestionContract.methods.getQuestion().call(function(err, gqres) {
      console.log(err);
      console.log(gqres);
      const question = gqres['0'];
      const trues = gqres['1'];
      const falses = gqres['2'];
      const currentAnswerInt = parseInt(gqres['3'], 10);
      data = {contractAddress: contractAddress, question: question, currentAnswerInt: currentAnswerInt, trues: trues, falses: falses};
      console.log(data);
      res.render('question', data);
    });
  }
  else {
    res.status(404).send("No question with that address.");
  }
});

const port = process.env.PORT || configPort || 4000;
app.listen(port, function() { console.log('Example app listening on port ' + port); });
