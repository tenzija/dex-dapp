
const hre = require("hardhat");

async function main() {
  
    // fetch contract to deploy
    const Token = await hre.ethers.getContractFactory('Token')

    // deploy contract
    const token = await Token.deploy()
    await token.deployed()

    console.log(`Token deployed to: ${token.address}`)

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
