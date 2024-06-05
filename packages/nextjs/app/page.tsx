"use client";

import type { NextPage } from "next";
import { useState } from "react";
import { Address } from "~~/components/scaffold-stark";
import { useAccount } from "@starknet-react/core";
import { Address as AddressType } from "@starknet-react/chains";
import { useScaffoldMultiWriteContract } from "~~/hooks/scaffold-stark/useScaffoldMultiWriteContract";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { createContractCall } from "~~/hooks/scaffold-stark/useScaffoldMultiWriteContract";
import { useScaffoldContract } from "~~/hooks/scaffold-stark/useScaffoldContract";
import { useDeployedContractInfo } from "~~/hooks/scaffold-stark/useDeployedContractInfo";
import { multiplyTo1e18 } from "~~/utils/scaffold-stark/priceInWei";
import { IntegerInput } from "~~/components/scaffold-stark/Input/IntegerInput";
import { useTargetNetwork } from "~~/hooks/scaffold-stark/useTargetNetwork";

function formatEther(weiValue: number) {
  const etherValue = weiValue / 1e18;
  return etherValue.toFixed(1);
}

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [tokensToBuy, setTokensToBuy] = useState<string | bigint>("");
  const [tokensToSell, setTokensToSell] = useState<string>("");
  const [isApproved, setIsApproved] = useState(false);
  const [toAddress, setToAddress] = useState("");
  const [tokensToSend, setTokensToSend] = useState("");

  const { data: tokensPerEth } = useScaffoldReadContract({
    contractName: "Vendor",
    functionName: "tokens_per_eth",
  });

  const { data: accountYourContract } = useScaffoldContract({
    contractName: "YourContract",
  });

  const { data: Eth } = useScaffoldContract({
    contractName: "Eth",
  });

  const { data: faucetNadai } = useScaffoldContract({
    contractName: "Nadai",
  });

  const { data: faucetPepe } = useScaffoldContract({
    contractName: "Pepe",
  });

  const { data: faucetScaffold } = useScaffoldContract({
    contractName: "Scaffold",
  });



  const { writeAsync: multicall } = useScaffoldMultiWriteContract({
    calls: [
      createContractCall("Eth", "approve", [Eth?.address, 5 * 10 ** 15]),
      createContractCall("Eth", "transfer", [connectedAddress, 5 * 10 ** 15]),
    ],
  });

  const { writeAsync: gretting } = useScaffoldMultiWriteContract({
    calls: [
      createContractCall("Eth", "approve", [
        accountYourContract?.address,
        5 * 10 ** 15,
      ]),
      createContractCall("YourContract", "set_gretting", ["Hola", 5 * 10 ** 15]),
      createContractCall("Eth", "approve", [
        accountYourContract?.address,
        5 * 10 ** 15,
      ]),
      createContractCall("YourContract", "set_gretting", ["Adios", 5 * 10 ** 15]),
    ],
  });



  const { targetNetwork } = useTargetNetwork();
  const { data: vendorContractData } = useDeployedContractInfo("Vendor");

  // Contract Read Actions
  
  const { data: balanceOf } = useScaffoldReadContract({
    contractName: "Eth",
    functionName: "balanceOf",
    args: [connectedAddress ?? ""],
  });
  const { data: lastGreeting } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "gretting",
    watch: true,
  });

  const { data: nadaiBalance } = useScaffoldReadContract({
    contractName: "Nadai",
    functionName: "balanceOf",
    args: [connectedAddress ?? ""],
    watch: true,
  });

  const { data: pepeBalance } = useScaffoldReadContract({
    contractName: "Pepe",
    functionName: "balanceOf",
    args: [connectedAddress ?? ""],
    watch: true,
  });

  const { data: scaffoldBalance } = useScaffoldReadContract({
    contractName: "Scaffold",
    functionName: "balanceOf",
    args: [connectedAddress ?? ""],
    watch: true,
  });

  const { data: vendorBalance } = useScaffoldReadContract({
    contractName: "YourToken",
    functionName: "balance_of",
    args: [vendorContractData?.address ?? "",],
    watch: true,
  });


  const { writeAsync: faucet } = useScaffoldMultiWriteContract({
    calls: [
      createContractCall("Nadai", "faucet", [connectedAddress, 5 * 10 ** 20]),
      createContractCall("Pepe", "faucet", [connectedAddress, 5 * 10 ** 19]),
      createContractCall("Scaffold", "faucet", [connectedAddress, 5 * 10 ** 18]),
    ],
  });


  const { writeAsync: transferVendor } = useScaffoldMultiWriteContract({
    calls: [
      createContractCall( "YourToken", "faucet", [vendorContractData?.address ?? "", 10 * 10 ** 19]),
    ],
  });


  const wrapInTryCatch =
    (fn: () => Promise<any>, errorMessageFnDescription: string) => async () => {
      try {
        await fn();
      } catch (error) {
        console.error(
          `Error calling ${errorMessageFnDescription} function`,
          error
        );
      }
    };

  const handleClick = () => {
    if (multicall) {
      multicall().catch((error) => console.error(error));
    }
  };

  const handleClick2 = () => {
    if (gretting) {
      gretting().catch((error) => console.error(error));
    }
  };

  const handleClick3 = () => {
    if (faucet) {
      faucet().catch((error) => console.error(error));
    }
  };

  const handleClick4 = () => {
    if (transferVendor) {
      transferVendor().catch((error) => console.error(error));
    }
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-Stark 2</span>
          </h1>
          <div className="flex justify-center items-center space-x-2">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress as AddressType} />
          </div>
        </div>

        <button
          onClick={handleClick}
          className="mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 flex items-center"
        >
          <span role="img" aria-label="lion" className="mr-2">🦁</span>
          Approve + Transfer 0.005 ETH
        </button>
        <button
          onClick={handleClick2}
          className="mt-8 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 flex items-center"
        >
          <span role="img" aria-label="parrot" className="mr-2">🦜</span>
          Greeting Hola with 0.005 ETH
        </button>

        <div className="flex flex-col items-center w-1/2">
  <p className="block text-xl mt-0 mb-1 font-semibold">Last Greeting</p>
  <span>
    {lastGreeting && lastGreeting.length > 0 && lastGreeting[0].type === "core::byte_array::ByteArray"
      ? lastGreeting[0].toString() // o cualquier otra propiedad que represente el valor de la ByteArray
      : "No greeting available"}
  </span>
</div>






        <button
          onClick={handleClick3}
          className="mt-8 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 flex items-center"
        >
          <span role="img" aria-label="elephant" className="mr-2">🐘</span>
          Mint 500 Nai + 50 Pepe + 5 Scaffold
        </button>
        <div className="flex flex-col items-center w-1/2">
            <p className="block text-xl mt-0 mb-1 font-semibold">You Nai Balance</p>
            <span>
              {nadaiBalance
                ? `${formatEther(Number(nadaiBalance))} Nai`
                : "0"}
            </span>
            <span>
              {pepeBalance
                ? `${formatEther(Number(pepeBalance))} Pepe`
                : "0"}
            </span>
            <span>
              {scaffoldBalance
                ? `${formatEther(Number(scaffoldBalance))} Scaffold`
                : "0"}
            </span>
          </div>
    

        <button
          onClick={handleClick4}
          className="mt-8 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 flex items-center"
        >
          <span role="img" aria-label="monkey" className="mr-2">🐒</span>
          Mint 100 Gold - Vendor
        </button>
        <div className="flex flex-col items-center w-1/2">
            <p className="block text-xl mt-0 mb-1 font-semibold">Balance GOLD - Vendor</p>
            <span>
              {vendorBalance
                ? `${formatEther(Number(vendorBalance))} GOLD`
                : "0"}
            </span>
            </div>
      </div>
    </>
  );
};

export default Home;
