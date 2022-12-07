import { useEffect } from 'react';
import config from '../config.json';
import { useDispatch } from 'react-redux';

import { 
  loadProvider, 
  loadNetwork, 
  loadAccount,
  loadTokens,
  loadExchange,
  subscribeToEvents,
  loadAllOrders
} from '../store/interactions';

import Navbar from './Navbar';
import Markets from './Markets';
import Balance from './Balance';
import Order from './Order';
import OrderBook from './OrderBook';
import PriceChart from './PriceChart';
import Trades from './Trades';

function App() {
  const dispatch = useDispatch()

  const loadBlockchainData = async() => {
    // connect ethers to blockchain
    const provider = loadProvider(dispatch)
    // fetch current networks chainId
    const chainId = await loadNetwork(provider, dispatch)
    
    // reload page when network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    // fetch current account and balance from metamask
    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch)
    })

    // load token smart contracts
    const SAPPHR = config[chainId].sapphire
    const mETH = config[chainId].mETH
    await loadTokens(provider, [SAPPHR.address, mETH.address], dispatch)

    // load exchange smart contract
    const exchangeConfig = config[chainId].exchange
    const exchange = await loadExchange(provider, exchangeConfig.address, dispatch)

    // fetch all orders
    loadAllOrders(provider, exchange, dispatch)

    // listen to events
    subscribeToEvents(exchange, dispatch)
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      <Navbar/>

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets />

          <Balance />

          <Order />

        </section>
        <section className='exchange__section--right grid'>

          <PriceChart />

          {/* Transactions */}

          <Trades />

          <OrderBook />

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
