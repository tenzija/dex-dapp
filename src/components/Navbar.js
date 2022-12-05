import { useSelector, useDispatch } from 'react-redux'
import { loadAccount } from '../store/interactions'
import Blockies from 'react-blockies'
import config from '../config.json'

import logo from '../assets/logo.png'
import eth from '../assets/eth.svg'


const Navbar = () => {
    const dispatch = useDispatch()

    const provider = useSelector(state => state.provider.connection)
    const chainId = useSelector(state => state.provider.chainId)
    const account = useSelector(state => state.provider.account)
    const balance = useSelector(state => state.provider.balance)

    const connectHandler = async() => {
        // load account here
        await loadAccount(provider, dispatch)
    }

    const networkHandler = async(e) => {
        console.log(e.target.value)
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: e.target.value }]
        })
    }

    return(
      <div className='exchange__header grid'>
        <div className='exchange__header--brand flex'>
        <img src={logo} className='logo' alt='Logo'></img>
            <h1 >-//<span>&nbsp;sApphiRe</span> eX</h1>
        </div>
  
        <div className='exchange__header--networks flex'>
            <img src={eth} alt='ETH LOGO' className='Eth logo small'/>

            {chainId && 
                <select name='networks' id='networks' value={config[chainId] ? `0x${chainId.toString(16)}` : `0`} onChange={networkHandler}>
                    <option value='0' disabled>Select Network</option>
                    <option value='0x539'>Hardhat</option>
                    <option value='0x7A69'>Hardhat#1</option>
                    <option value='0x5'>Goerli</option>
                </select>
            }
        </div>
  
        <div className='exchange__header--account flex'>
            {balance ? 
                <p><small>my_<span style={{fontWeight:'bold'}}>bAlAnce:</span></small><span style={{fontFamily:'Space Grotesk'}}>{Number(balance).toFixed(1)}</span>eth</p>
            :
                <p><small>my_<span style={{fontWeight:'bold'}}>bAlAnce:</span></small><span style={{fontFamily:'Space Grotesk'}}>0</span>eth</p>
            }
            
            {account ?
                <>
                    <a href={config[chainId] ? `${config[chainId].explorerURL}address/${account}` : '#'} target="_blank" rel="noreferrer">
                        {account.slice(0, 6) + '...' + account.slice(38, 42)}
                        <Blockies 
                            seed={account}
                            className='identicon'
                            size={10}
                            scale={3}
                            color='#414141'
                            bgColor='#F1F2F9'
                            spotColor='#313131'
                        />
                    </a>
                </>
            :  
                <button className='button' style={{fontFamily:"Major Mono Display"}} onClick={connectHandler}>connect</button>
            }
        </div>
      </div>
    )
  }

export default Navbar
