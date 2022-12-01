import { useEffect } from 'react';
import config from '../config.json';

import { useDispatch } from 'react-redux';
import { 
  loadProvider, 
  loadNetwork, 
  loadAccount,
  loadTokens,
  loadExchange 
} from '../store/interactions';


function App() {
  const dispatch = useDispatch()

  const loadBlockchainData = async() => {
    // connect ethers to blockchain
    const provider = loadProvider(dispatch)
    // fetch current networks chainId
    const chainId = await loadNetwork(provider, dispatch)
    
    // fetch current account and balance from metamask
    await loadAccount(provider, dispatch)

    // load token smart contracts
    const SAPPHR = config[chainId].sapphire
    const mETH = config[chainId].mETH
    await loadTokens(provider, [SAPPHR.address, mETH.address], dispatch)

    // load exchange smart contract
    const exchange = config[chainId].exchange
    await loadExchange(provider, exchange.address, dispatch)
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
