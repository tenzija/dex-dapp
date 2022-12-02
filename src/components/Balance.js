import { useSelector } from 'react-redux';
import dapp from '../assets/dapp.png'

const Balance = () => {
    const symbols = useSelector(state => state.tokens.symbols)

    return (
      <div className='component exchange__transfers'>
        <div className='component__header flex-between'>
          <h2 className="h22">Balance:</h2>
          <div className='tabs'>
            <button className='tab tab--active'>deposit</button>
            <button className='tab'>withdraw</button>
          </div>
        </div>
  
        {/* Deposit/Withdraw Component 1 (DApp) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
            <p><small>Token</small><br /><img src={dapp} alt="Token Logo"/>{symbols && symbols[0]}</p>
          </div>
  
          <form>
            <label htmlFor="token0"></label>
            <input type="text" id='token0' placeholder='0.0000' />
  
            <button className='button' type='submit'>
              <span></span>
            </button>
          </form>
        </div>
  
        <hr />
  
        {/* Deposit/Withdraw Component 2 (mETH) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
  
          </div>
  
          <form>
            <label htmlFor="token1"></label>
            <input type="text" id='token1' placeholder='0.0000'/>
  
            <button className='button' type='submit'>
              <span></span>
            </button>
          </form>
        </div>
  
        <hr />
      </div>
    );
}
  
export default Balance;
