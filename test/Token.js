const { ethers } = require('hardhat')
const { expect } = require('chai')

const tokens = (num) => {
    return ethers.utils.parseUnits(num.toString(), 'ether')
}

describe('Token:', () => {
    let token

    beforeEach(async() => {
        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy('Sapphire', 'SAPHIR', '10000')
    })

    describe('Deployment:', () => {
        const name = 'Sapphire'
        const symbol = 'SAPHIR'
        const decimals = '18'
        const totalSupply = tokens('10000')

        it('has correct name', async () => {
            expect(await token.name()).to.equal(name)
        })
    
        it('has correct symbol', async () => {
            expect(await token.symbol()).to.equal(symbol)
        })
    
        it('has correct decimals', async () => {
            expect(await token.decimals()).to.equal(decimals)
        })
    
        it('has correct total supply', async () => {
            expect(await token.totalSupply()).to.equal(totalSupply)
        })
    })

})
