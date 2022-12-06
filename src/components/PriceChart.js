import { useSelector } from "react-redux";

import Chart from 'react-apexcharts';
import { options, defaultSeries, series } from "./PriceChart.config";

import arrowDown from '../assets/down-arrow.svg';
import arrowUp from '../assets/up-arrow.svg';

import { priceChartSelector } from "../store/selectors";

import Banner from "./Banner";

const PriceChart = () => {
    const account = useSelector(state => state.provider.account)
    const symbols = useSelector(state => state.tokens.symbols)
    const priceChart = useSelector(priceChartSelector)

    return (
      <div className="component exchange__chart">
        <div className='component__header flex-between'>
          <div className='flex'>
  
            <h2 className="h16">{symbols && `${symbols[0]}/${symbols[1]}`}</h2>

            {priceChart && (
              <div className='flex'>

                {priceChart.lastPriceChange === '+' ? (
                  <img src={arrowUp} alt="Arrow up" />
                ) : (
                  <img src={arrowDown} alt="Arrow down" />
                )}
                
                <span className='up h16' style={{fontFamily:'Space Grotesk', fontWeight:'bold', color:'var(--clr-white)'}}>{priceChart.lastPrice}</span>
              </div>
            )}

          </div>
        </div>
  
        {!account ? (
            <Banner text={'Please connect with Metamask'}/>
        ) : (
            <Chart 
                type="candlestick"
                options={options}
                series={
                  priceChart ? priceChart.series
                   : 
                  defaultSeries}
                width='100%'
                height='100%'
                style={{fontFamily:'Space Grotesk'}}
            />
        )}
  
      </div>
    );
}
  
export default PriceChart;
