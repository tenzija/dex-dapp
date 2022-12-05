import config from '../config.json'
import { useSelector, useDispatch } from 'react-redux';
import { loadTokens } from '../store/interactions';


const Markets = () => {
  const provider = useSelector(state => state.provider.connection)
  const chainId = useSelector(state => state.provider.chainId)

  const dispatch = useDispatch()

  const marketHandler = async(e) => {
    loadTokens(provider, (e.target.value).split(','), dispatch)
  }

    return(
      <div className='component exchange__markets'>
        <div className='component__header'>
            <h2>&gt;&nbsp;SELECT<span style={{fontWeight:'bold'}}>_MARKET:</span></h2>
        </div>
        {chainId && config[chainId] ? 
            <select name="markets" id="markets" onChange={marketHandler}>
              <option value={`${config[chainId].sapphire.address},${config[chainId].mETH.address}`}>SAPPHR / mETH</option>
              <option value={`${config[chainId].sapphire.address},${config[chainId].mDAI.address}`}>SAPPHR / mDAI</option>
            </select>
          :
            <div>
              <p>Not Deployed to <span>Network</span></p>
            </div>
          }
        <hr />
      </div>
    )
}
  
export default Markets;
