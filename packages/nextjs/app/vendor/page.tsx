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

  

  const { data: balanceOf } = useScaffoldReadContract({
    contractName: "Eth",
    functionName: "balanceOf",
    args: [connectedAddress ?? ""],
  });

  

  

  const { data: vendorContractData } = useDeployedContractInfo("Vendor");

  const { writeAsync: faucet } = useScaffoldMultiWriteContract({
    calls: [
      createContractCall("Nadai", "faucet", [connectedAddress, 5 * 10 ** 19]),
      createContractCall("Pepe", "faucet", [connectedAddress, 5 * 10 ** 19]),
      createContractCall("Scaffold", "faucet", [connectedAddress, 5 * 10 ** 19]),
    ],
  });


  const { writeAsync: transferVendor } = useScaffoldMultiWriteContract({
    calls: [
      createContractCall( "YourToken", "faucet", [vendorContractData?.address ?? "", 10 * 10 ** 19]),
    ],
  });

  const { writeAsync: buy } = useScaffoldMultiWriteContract({
    calls: [
      {
        contractName: "Eth",
        functionName: "approve",
        args: [vendorContractData?.address ?? "", multiplyTo1e18(tokensToBuy)],
      },
      {
        contractName: "Vendor",
        functionName: "buy_tokens",
        args: [multiplyTo1e18(tokensToBuy)],
      },
    ],
  });

  const { writeAsync: sell } = useScaffoldMultiWriteContract({
    calls: [
      {
        contractName: "YourToken",
        functionName: "approve",
        args: [vendorContractData?.address ?? "", multiplyTo1e18(tokensToSell)],
      },
      {
        contractName: "Vendor",
        functionName: "sell_tokens",
        args: [multiplyTo1e18(tokensToSell)],
      },
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

      

        {/* Buy Tokens  */}
        <div className="flex flex-col items-center space-y-4 bg-blue border-2 border-gray-200 rounded-xl p-6 mt-8 w-full max-w-lg shadow-md">
          <div className="text-xl font-bold">Buy Tokens</div>
          <div>{Number(tokensPerEth)} tokens per ETH</div>

          <div className="w-full flex flex-col space-y-2">
            <IntegerInput
              placeholder="Amount of tokens to buy"
              value={tokensToBuy.toString()}
              onChange={(value) => setTokensToBuy(value)}
              disableMultiplyBy1e18
            />
          </div>

          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            onClick={wrapInTryCatch(buy, "buyTokens")}
          >
            Buy Tokens
          </button>
        </div>

        {/* Sell Tokens */}
        <div className="flex flex-col items-center space-y-4 bg-blue border-2 border-gray-200 rounded-xl p-6 mt-8 w-full max-w-lg shadow-md">
          <div className="text-xl font-bold">Sell Tokens</div>
          <div>{Number(tokensPerEth)} tokens per ETH</div>
          <div className="w-full flex flex-col space-y-2">
            <IntegerInput
              placeholder="Amount of tokens to sell"
              value={tokensToSell}
              onChange={(value) => setTokensToSell(value as string)}
              disabled={isApproved}
              disableMultiplyBy1e18
            />
          </div>

          <button
            className="mt-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
            onClick={wrapInTryCatch(sell, "sellTokens")}
          >
            Sell Tokens
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
