// imports
const { ethers, run, network } = require("hardhat");

// async main
async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
  console.log("Deploying contract...");
  const simpleStorage = await SimpleStorageFactory.deploy();
  const deploymentTransaction = await simpleStorage.deploymentTransaction();
  // According to Ethers 6.x documentation, the depploymentTransaction() should
  // return a contractTransactionResponse which, if waited on > 0 confirmations,
  // should return a ContractTransactionReceipt
  console.log(deploymentTransaction);

  if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for goerli deploymentReceipt confirmations");
    const contractTransactionReceipt = await deploymentTransaction.wait(6);
    console.log(contractTransactionReceipt);
    await verify(await simpleStorage.getAddress(), []);
  }

  const currentValue = await simpleStorage.retrieve();
  console.log(`Current value is: ${currentValue}`);

  const transactionResponse = await simpleStorage.store(8);
  await transactionResponse.wait(1);
  const updatedValue = await simpleStorage.retrieve();
  console.log(`New current value is: ${updatedValue}`);
}

async function verify(contractAddress, args) {
  console.log(`Verifying contract ${contractAddress}`);
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("------------------------");
      console.log("PCW::Already verified.");
    } else {
      console.log("e.message");
      console.log(e.message.toLowerCase());
    }
  }
}

// main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
