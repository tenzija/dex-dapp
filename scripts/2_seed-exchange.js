const { ethers } = require("hardhat");
const config = require('../src/config.json')

const tokens = (num) => {
    return ethers.utils.parseUnits(num.toString(), 'ether')
}

const wait = (seconds) => {
    const miliseconds = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, miliseconds))
}

async function main() {
    
    // fetch accounts from wallet - these are unlocked
    const accounts = await ethers.getSigners()

    // fetch network
    const { chainId } = await ethers.provider.getNetwork()
    console.log('Using chainId: ', chainId)
    
    // fetch deployed tokens
    const sapphire = await ethers.getContractAt('Token', config[chainId].sapphire.address)
    console.log(`sapphire token fethced: ${sapphire.address}\n`)

    const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address)
    console.log(`mETH token fethced: ${mETH.address}\n`)

    const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address)
    console.log(`mDAI token fethced: ${mDAI.address}\n`)

    // fetch deployed exchange
    const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address)
    console.log(`Exchange fetched: ${exchange.address}\n`)

    // give tokens to account[1]
    const sender = accounts[0]
    const receiver = accounts[1]
    let amount = tokens(1000)

    // user 1 transfers 1000 mETH
    let transaction, result
    transaction = await mETH.connect(sender).transfer(receiver.address, amount)
    console.log(`Transfered ${amount} tokens from ${sender.address} to ${receiver.address}\n`)

    //setup users
    const user1 = accounts[0]
    const user2 = accounts[1]
    amount = tokens(1000)

    // user1 approves 1000 SAPPHR
    transaction = await sapphire.connect(user1).approve(exchange.address, amount)
    await transaction.wait()
    console.log(`Approved ${amount} SAPPHR from ${user1.address}\n`)

    // user1 deposits 1000 SAPPHR
    transaction = await exchange.connect(user1).depositToken(sapphire.address, amount)
    await transaction.wait()
    console.log(`Deposited ${amount} SAPPHR from ${user1.address}\n`)

    // user2 approves mETH
    transaction = await mETH.connect(user2).approve(exchange.address,amount)
    await transaction.wait()
    console.log(`Approved ${amount} mETH from ${user2.address}\n`)

    // user 2 deposits mETH
    transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
    await transaction.wait()
    console.log(`Deposited ${amount} tokens from ${user2.address}\n`)

    // seed a cancelled order
    // user 1 makes order to get tokens
    let orderId
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), sapphire.address, tokens(5))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}\n`)

    // user1 cancels order
    orderId = result.events[0].args._id
    transaction = await exchange.connect(user1).cancelOrder(orderId)
    result = await transaction.wait()
    console.log(`Cancelled order form ${user1.address}\n`)

    // wait 1 second
    await wait(1)

    // seed filled orders
    // user 1 makes oreder
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), sapphire.address, tokens(10))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}\n`)

    // user 2 fills order
    orderId = result.events[0].args._id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`)

    // wait 1 second
    await wait(1)

    // user 1 makes another order
    transaction = await exchange.makeOrder(mETH.address, tokens(50), sapphire.address, tokens(15))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}\n`)

    // user 2 fills order
    orderId = result.events[0].args._id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`)

    // wait 1 second
    await wait(1)

    // user 1 makes final order
    transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), sapphire.address, tokens(20))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}\n`)

    // user 2 fills final order
    orderId = result.events[0].args._id
    transaction = await exchange.connect(user2).fillOrder(orderId)
    result = await transaction.wait()
    console.log(`Filled order from ${user1.address}\n`)

    // wait 1 second
    await wait(1)

    // seed open orders
    // user 1 makes 10 orders
    for(let i = 1; i <= 10; i++) {
        transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10 * i), sapphire.address, tokens(10))
        result = await transaction.wait()
        console.log(`Made order from ${user1.address}\n`)

        await wait(1)
    }

    // user 2 makes 10 orders
    for(let i = 1; i <= 10; i++) {
        transaction = await exchange.connect(user2).makeOrder(sapphire.address, tokens(10), mETH.address, tokens(10 * i))
        result = await transaction.wait()
        console.log(`Made order from ${user2.address}\n`)

        await wait(1)
    }

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
