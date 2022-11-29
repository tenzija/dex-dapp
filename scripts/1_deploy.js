const { ethers } = require("hardhat");

async function main() {
  console.log(`Preparing deployment...\n`)

  const Token = await ethers.getContractFactory('Token')
  const Exchange = await ethers.getContractFactory('Exchange')

  const accounts = await ethers.getSigners()
  
  console.log(`Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n`)

  const sapphire = await Token.deploy('Sapphire', 'SAPPHR', '10000')
  await sapphire.deployed()
  console.log(`SAPPHR deployed to: ${sapphire.address}`)

  const mETH = await Token.deploy('mETH', 'mETH', '10000')
  await mETH.deployed()
  console.log(`mETH deployed to: ${mETH.address}`)

  const mDAI = await Token.deploy('mDAI', 'mDAI', '10000')
  await mDAI.deployed()
  console.log(`mDAI deployed to: ${mDAI.address}`)

  const exchange = await Exchange.deploy(accounts[1].address, 10)
  await exchange.deployed()
  console.log(`Exchange deployed to: ${exchange.address}`)

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
