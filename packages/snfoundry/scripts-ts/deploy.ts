import { deployContract, deployer, exportDeployments } from "./deploy-contract";

const deployScript = async (): Promise<void> => {
  await deployContract(
    {
      owner: deployer.address, // the deployer address is the owner of the contract
    },
    "YourContract"
  );

  const faucet_pepe = await deployContract(
    {
      name: "Pepe",
      symbol: "PEP",
      initial_supply: 1000000000000000000000000n,
      recipient: deployer.address,
    },
    "MockToken",
    "Pepe"
  );

  const faucet_nadai = await deployContract(
    {
      name: "Nadai",
      symbol: "NAI",
      initial_supply: 1000000000000000000000000n,
      recipient: deployer.address,
    },
    "MockToken",
    "Nadai"
  );
  const faucet_scaffold = await deployContract(
    {
      name: "Scaffold",
      symbol: "SCF",
      initial_supply: 1000000000000000000000000n,
      recipient: deployer.address,
    },
    "MockToken",
    "Scaffold"
  );

  const your_token = await deployContract(
    {
      name: "Gold",
      symbol: "GLD",
      fixed_supply: 2_000_000_000_000_000_000_000n, //2000 * 10^18
      recipient:
        deployer.address,
    },
    "YourToken"
    );

  await deployContract({
    token_address: your_token.address, owner: deployer.address,
  }
    , "Vendor");

  

};


deployScript()
  .then(() => {
    exportDeployments();
    console.log("All Setup Done");
  })
  .catch(console.error);
