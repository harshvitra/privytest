import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { encodeFunctionData, parseEther, formatEther } from "viem";
import { useState, useEffect } from "react";

const contractAddress = "0xc948a7F7EbFB5B787133A1AC8D61e82650E1f573"; // Replace with your deployed contract address
const contractAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address",
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256",
      },
    ],
    "name": "Deposited",
    "type": "event",
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address",
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256",
      },
    ],
    "name": "Withdrawn",
    "type": "event",
  },
  {
    "inputs": [],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function",
  },
  {
    "inputs": [],
    "name": "getContractBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256",
      },
    ],
    "stateMutability": "view",
    "type": "function",
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address",
      },
    ],
    "name": "getUserBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256",
      },
    ],
    "stateMutability": "view",
    "type": "function",
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256",
      },
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function",
  },
];

const NETWORK_PARAMS = {
  chainId: "0x13BB", // 80002 in hex
  chainName: "Polygon Amoy Testnet",
  rpcUrls: ["https://rpc-amoy.polygon.technology/"],
  nativeCurrency: {
    name: "POL",
    symbol: "POL",
    decimals: 18,
  },
  blockExplorerUrls: ["https://amoy.polygonscan.com/"],
};

function LoginButton() {
  const { wallets } = useWallets();
  const wallet = wallets?.[0];
  const { ready, authenticated, login, user } = usePrivy();
  const disableLogin = !ready || (ready && authenticated);

  const [transactions, setTransactions] = useState<{ hash: string; type: string }[]>([]);
  const [userBalance, setUserBalance] = useState("0");
  const [contractBalance, setContractBalance] = useState("0");

  const userAddress = user?.wallet?.address || "Not Connected";

  const fetchUserBalance = async () => {
    if (!wallet) {
      console.error("Wallet is not connected.");
      return;
    }

    try {
      const provider = await wallet.getEthereumProvider();
      if (!provider) throw new Error("Ethereum provider not found");

      const accounts = await provider.request({ method: "eth_accounts" });
      if (accounts.length === 0) throw new Error("No connected account found");

      const data = encodeFunctionData({
        abi: contractAbi,
        functionName: "getUserBalance",
        args: [accounts[0]],
      });

      const balance = await provider.request({
        method: "eth_call",
        params: [{ to: contractAddress, data: data }],
      });

      setUserBalance(formatEther(BigInt(balance)));
    } catch (error) {
      console.error("Failed to fetch user balance:", error);
    }
  };

  const fetchContractBalance = async () => {
    if (!wallet) {
      console.error("Wallet is not connected.");
      return;
    }

    try {
      const provider = await wallet.getEthereumProvider();
      if (!provider) throw new Error("Ethereum provider not found");

      const data = encodeFunctionData({
        abi: contractAbi,
        functionName: "getContractBalance",
      });

      const balance = await provider.request({
        method: "eth_call",
        params: [{ to: contractAddress, data: data }],
      });

      setContractBalance(formatEther(BigInt(balance)));
    } catch (error) {
      console.error("Failed to fetch contract balance:", error);
    }
  };

  const switchNetwork = async () => {
    try {
      if (!wallet) {
        console.error("Wallet is not connected.");
        return;
      }

      const provider = await wallet.getEthereumProvider();
      if (!provider) throw new Error("Ethereum provider is not available.");

      await provider.request({
        method: "wallet_addEthereumChain",
        params: [NETWORK_PARAMS],
      });
      console.log("Successfully switched to Polygon Amoy Testnet.");
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  const sendToContract = async () => {
    try {
      const provider = await wallet.getEthereumProvider();
      if (!provider) throw new Error("Ethereum provider not found");

      const accounts = await provider.request({ method: "eth_accounts" });
      if (accounts.length === 0) throw new Error("No connected account found");

      const data = encodeFunctionData({
        abi: contractAbi,
        functionName: "deposit",
      });
      const transactionRequest = {
        from: accounts[0],
        to: contractAddress,
        value: parseEther("0.001").toString(),
        data: data,
      };

      const transactionHash = await provider.request({
        method: "eth_sendTransaction",
        params: [transactionRequest],
      });

      console.log("Transaction sent:", transactionHash);
      setTransactions([...transactions, { hash: transactionHash, type: "Sent" }]);
      setTimeout(() => {
        fetchUserBalance();
        fetchContractBalance();
      }, 5000);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const withdrawFromContract = async () => {
    try {
      const provider = await wallet.getEthereumProvider();
      if (!provider) throw new Error("Ethereum provider not found");

      const accounts = await provider.request({ method: "eth_accounts" });
      if (accounts.length === 0) throw new Error("No connected account found");

      const data = encodeFunctionData({
        abi: contractAbi,
        functionName: "withdraw",
        args: [parseEther("0.001")],
      });

      const transactionRequest = {
        from: accounts[0],
        to: contractAddress,
        data: data,
      };

      const transactionHash = await provider.request({
        method: "eth_sendTransaction",
        params: [transactionRequest],
      });

      console.log("Transaction successful:", transactionHash);
      setTransactions([...transactions, { hash: transactionHash, type: "Received" }]);
      setTimeout(() => {
        fetchUserBalance();
        fetchContractBalance();
      }, 5000);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  useEffect(() => {
    console.log("Wallets:", wallets);
    if (authenticated && wallet) {
      fetchUserBalance();
      fetchContractBalance();
    }
  }, [authenticated, wallet]);

  return (
    <div>
      <button disabled={disableLogin} onClick={login}>
        {disableLogin ? "Authenticated" : "Login with Privy"}
      </button>

      <h3>Account Address: {userAddress}</h3>

      {authenticated && wallet ? (
        <>
          <div>
            <h3>User Balance: {userBalance} POL</h3>
            <h3>Contract Balance: {contractBalance} POL</h3>
          </div>
          <button onClick={sendToContract}>Send 0.001 POL</button>
          <button onClick={withdrawFromContract}>Receive 0.001 POL</button>
          <h3>Transaction History</h3>
          <ul>
            {transactions.map((tx, index) => (
              <li key={index}>
                {tx.type}:{" "}
                <a
                  href={`https://amoy.polygonscan.com/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {tx.hash}
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Wallet not connected. Please connect your wallet.</p>
      )}
    </div>
  );
}

export default LoginButton;
