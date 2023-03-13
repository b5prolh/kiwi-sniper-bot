const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed1.binance.org:443'));
const BN = web3.utils.BN;
const PancakeSwapRouterABI = require('./abi/panscake_router_abi.json');
const ERC20ABI = require('./abi/erc20_abi.json');
const fetch = require('node-fetch');
require('dotenv').config();

const BNB_TOKEN_ADDRESS = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
const FLOKI_TOKEN_ADDRESS = '0xfb5b838b6cfeedc2873ab27866079ac55363d37e';
const PANCAKE_SWAP_ROUTER_ADDRESS = '0x10ED43C718714eb63d5aA57B78B54704E256024E';

const accountAddress = 'Your Account';
const privateKey = 'Your Key';
const amount_bnb = '0.00001'
const amount_token = '1000'
const amountIn = new BN(web3.utils.toWei(amount_token, 'ether')).toString();
console.log(amountIn)
const pancakeSwapRouter = new web3.eth.Contract(PancakeSwapRouterABI, PANCAKE_SWAP_ROUTER_ADDRESS);

const tokenIn = BNB_TOKEN_ADDRESS;
const tokenOut = FLOKI_TOKEN_ADDRESS;

const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
const gasLimit = 500000;

//Set slippage
const slippage = 0.5; // Set slippage percentage
const slippage_percent = (100 - slippage)/100

async function buy() {
  const nonce = await web3.eth.getTransactionCount(accountAddress, 'latest');
  const gasPrice = await web3.eth.getGasPrice();
  console.log(gasPrice)

  console.log("Max gas: ", (gasPrice * gasLimit) / 1e18 + "BNB")
  
  // Get token amounts out
  const amountsOut = await pancakeSwapRouter.methods.getAmountsOut(
	amountIn,
	[tokenIn, tokenOut]
  ).call();
  
  console.log("AmountsOut: ", amountsOut)
  
  // Use the output token amount minus slippage as the minimum amount
  const amountOutMin = amountsOut[1]/1e9 * slippage_percent
  console.log("AmountOutMin: ", amountOutMin)  
  /*
  const tx = {
    'from': accountAddress,
    'to': PANCAKE_SWAP_ROUTER_ADDRESS,
    'nonce': nonce,
    'gasPrice': gasPrice,
    'gasLimit': gasLimit,
    'value': amountIn,
    'data': pancakeSwapRouter.methods.swapExactETHForTokens(
      amountOutMin,
      [tokenIn, tokenOut],
      accountAddress,
      deadline
    ).encodeABI(),
    'chainId': 56
  };

  const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
  const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

  console.log('Transaction hash:', txReceipt.transactionHash);
  */
}

async function sell() {
  const tokenContract = new web3.eth.Contract(ERC20ABI, FLOKI_TOKEN_ADDRESS);
  const tokenSellAmount = await tokenContract.methods.balanceOf(accountAddress).call()/1e9;
  console.log("My Token Balance: ", tokenSellAmount)
  const nonce = await web3.eth.getTransactionCount(accountAddress, 'latest');
  const gasPrice = await web3.eth.getGasPrice();
  console.log(gasPrice)

  console.log("Max gas: ", (gasPrice * gasLimit) / 1e18 + "BNB")
  
  // Get token amounts out
  const amountsOut = await pancakeSwapRouter.methods.getAmountsOut(
	1000,
	[tokenOut, tokenIn]
  ).call();
  
  console.log("AmountsOut: ", amountsOut)
  
  // Use the output token amount minus slippage as the minimum amount
  const amountOutMin = amountsOut[1]/1e9 * slippage_percent
  console.log("AmountOutMin: ", amountOutMin)  

  const tx = {
    'from': accountAddress,
    'to': PANCAKE_SWAP_ROUTER_ADDRESS,
    'nonce': nonce,
    'gasPrice': gasPrice,
    'gasLimit': gasLimit,
    'value': amountIn,
    'data': pancakeSwapRouter.methods.swapExactTokensForETH(
	  amountIn,
      amountOutMin,
      [tokenOut, tokenIn],
      accountAddress,
      deadline
    ).encodeABI(),
    'chainId': 56
  };

  const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
  const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

  console.log('Transaction hash:', txReceipt.transactionHash);
}

const getGasPrices = async () => {
  try {
    const apiKey = '62C225SG9AUHUPXK9HA2AUKED7UQIZF159';
    const response = await fetch(`https://api.bscscan.com/api?module=gastracker&action=gasoracle&apikey=${apiKey}`);
    const data = await response.json();

    const gasPrices = {
      fast: data.result.FastGasPrice,
      normal: data.result.ProposeGasPrice,
      slow: data.result.SafeGasPrice
    };

    console.log(gasPrices); // log the gas prices to the console
    return gasPrices;
  } catch (error) {
    console.error(error); // log any errors to the console
  }
};

getGasPrices();


//buy();
sell()