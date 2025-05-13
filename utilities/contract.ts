import 
{ 
    ethers, 
    Network, 
    Contract, 
    Interface, 
    JsonRpcSigner, 
    WebSocketProvider, 
    BrowserProvider 
} from 'ethers';
import keccak256 from "keccak256";
import MerkleTree from "merkletreejs";
import whitelist from "@/data/whitelistedUsers.json";
import contractABI from '@/data/contractABI.json';
import { Result } from 'ethers';
import { JsonRpcProvider } from 'ethers';
import { parseAbi } from 'viem';

//Contract instance used for sending transactions.
export interface InitContract
{
    contract: Contract; 
    wallet: string;
}

//Merkle verification logic that returns a root and proof.
export interface MerkleResults
{
    root: string; 
    proof: string[];
}

//Return type for the multicall contract.
export interface ContractState
{
    contract: Contract;
    [key: string]: any;
}

//Return type of stlying for progress bar.
export interface ProgressStyles
{
    background: string; 
    color: string;
}

//Return object of chain configuration.
export interface ChainConfig
{
    chainId: string;
    chainName: string;
    rpcUrls: string[];
    blockExplorerUrls: string[];
    nativeCurrency: 
    {
        symbol: string;
        decimals: number;
    }
}

//Parser function to make certain bigints legible like wei.
export function parse (num: bigint): string
{
    return ethers.formatEther(num);
}

//Progress bar for the current total mint element on the UI.
export function progressBar (totalSupply: bigint, maxSupply: bigint): ProgressStyles
{
    let percentage: number = 0;
    let ratio: number = (Number(totalSupply) / Number(maxSupply));

    if (maxSupply !== null && totalSupply !== null) 
    {
        percentage = Math.min(100, Math.max(0, ratio) * 100)
    }

    const fillColor = 'lightblue';
    const emptyColor = '#f5f0e4';

    const fillStop = `${fillColor} ${percentage}%`;
    const emptyStop = `${emptyColor} ${percentage}%`;

    return {
        background: `linear-gradient(to right, ${fillStop}, ${emptyStop})`,
        color: 'blue',
    };
}

//Error sifter function primarily used for blockchain messages.
export function extractErrorMessage (error: any): string
{
    if (error?.reason === null) return 'Max supply reached or ran out of gas!';
    if (error?.reason) return error.reason;
    if (error?.error?.message) return error.error.message;
    if (error?.error?.reason) return error.error.reason;
    if (error?.data?.message) return error.data.message;
    if (error?.message) return error.message;
    if (typeof error === 'string') return error;
    return 'An unknown error occurred';
}

//Merkle validation logic that returns a root and proof for the uesr.
export function merkleValidator (wallet: string): MerkleResults
{
    //The whitelist address array that the tree gets contructed from.
    const addresses: string[] = whitelist.whitelistAddresses;

    //Sets up the nodes for hashing and tree generation.
    const nodes = addresses.map(address => keccak256(address));
    const tree = new MerkleTree(nodes, keccak256, {sortPairs: true});

    //Gets the root of the tree and the un-parsed user proof.
    const root = '0x' + tree.getRoot().toString('hex');
    const keys = tree.getProof(keccak256(wallet));

    //The parsed user proof gets set here and is returned with the root.
    const proof = keys.map(item => '0x' + item.data.toString('hex'));
    return {root, proof};
}

//If browser provider is already connected fetch user accounts automatically.
export async function collectUsers(): Promise<string[]>
{
    try
    {
        //Checks for a wallet extension and throws if one is not found.
        if (!window.ethereum) throw new Error('No wallet extension is installed!');
        return await window.ethereum.request
        (
            { 
                method: 'eth_accounts', 
                params: [] 
            }
        )
    } catch (error: any)
    {
        //Attempts to throw/log a legible error message.
        throw new Error (extractErrorMessage(error));
    }
}

//Function to trigger the browser provider so user can connect.
export async function connectUsers(): Promise<void>
{
    try
    {
        //Checks for a wallet extension and throws if one is not found.
        if (!window.ethereum) throw new Error('No wallet extension is installed!');
        await window.ethereum.request
        (
            { 
                method: "eth_requestAccounts", 
                params: []
            }
        )
    } catch (error: any)
    {
        //Attempts to throw/log a legible error message.
        throw new Error (extractErrorMessage(error));
    }
}

//If user is currently connected allow them to disconnect.
export async function disconnectUsers(): Promise<string[]>
{
    try
    {
        //Checks for a wallet extension and throws if one is not found.
        if (!window.ethereum) throw new Error('No wallet extension is installed!');
        return await window.ethereum.request
        (
            { 
                method: "wallet_revokePermissions", 
                params: [{ eth_accounts: {} }]
            }
        )
    } catch (error: any)
    {
        //Attempts to throw/log a legible error message.
        throw new Error (extractErrorMessage(error));
    }
}

//Add the network to user's browser extension.
export async function addNetwork(): Promise<void>
{
    try
    {
        const config: ChainConfig =
        {
            chainId: '0x' + (11124).toString(16),
            chainName: 'Abstract Sepolia Testnet',
            rpcUrls: ['https://api.testnet.abs.xyz'],
            blockExplorerUrls: ['https://sepolia.abscan.org/'],
            nativeCurrency: { symbol: 'ETH', decimals: 18 },
        }

        //Checks for a wallet extension and throws if one is not found.
        if (!window.ethereum) throw new Error('No wallet extension is installed!');
        return await window.ethereum.request
        (
            {
                method: 'wallet_addEthereumChain',
                params: [config]
            }
        )
    } catch (error: any)
    {
        //Attempts to throw/log a legible error message.
        if (error.message === 'f is not a function') return;
        throw new Error (extractErrorMessage(error));
    }
}

//Function to trigger when the user is on the wrong target network.
export async function switchNetwork(): Promise<void>
{
    try
    {
        //Checks for a wallet extension and throws if one is not found.
        if (!window.ethereum) throw new Error('No wallet extension is installed!');

        //Attempt to switch the network to target chain.
        await window.ethereum.request
        (
            {
                method: 'wallet_switchEthereumChain', 
                params: [{chainId: '0x' + (11124).toString(16)}]
            }
        )

    } catch (error: any)
    {
        //Attemp to add the target chain if it's not already added.
        if (error.code === 4902) await addNetwork();
        if (error.code !== 4902) throw new Error (extractErrorMessage(error));
    }
}

//Set up for multicall contract and event listener contract.
export async function readContract(): Promise<ContractState | undefined>
{
    try
    {
        //RPC URL for the websocket to establish a connection with the testnet.
        const wssrpcurl: string | undefined = process.env.NEXT_PUBLIC_WS_RPC_URL;
        if (!wssrpcurl) throw new Error ('Websocket RPC URL is not set!');

        //Main smart contract address that gets queried by the multicall contract.
        const contractAddr: string | undefined = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        if (!contractAddr) throw new Error ('Contract address is not set!');

        //Create an interface, a provider and a contract instance to bundle the requests.
        const provider: WebSocketProvider = new ethers.WebSocketProvider(wssrpcurl);
        const ABIInterface: Interface = new ethers.Interface(contractABI);
        const contract: Contract = new ethers.Contract(contractAddr, contractABI, provider);

        //State data to be retreived from the logic contract.
        const state: string[] =
        [
            'owner', 
            'maxSupply', 
            'totalSupply', 
            'whitelistMintLimit', 
            'publicMintLimit', 
            'whitelistMintPrice', 
            'publicMintPrice', 
            'whitelistMintState', 
            'publicMintState', 
            'tradingState' 
        ]

        //ABI encoded function names to be sent to the multicall contract.
        const encodedStateData: string[] = [];

        for (let i = 0; i < state.length; i++)
        {
            encodedStateData.push (ABIInterface.encodeFunctionData(state[i]))
        }

        //Reads state of the contract through aggregate function.
        const resolve = await contract.aggregate(encodedStateData);

        //Prepares for the resolved data to be parsed.
        const decodedStateData: { [key: string]: string } = {};

        //Decodes the resolved data into a new object.
        for (let i = 0; i < state.length; i++)
        {
            const decode: Result = ABIInterface.decodeFunctionResult(state[i], resolve[i]);
            decodedStateData[state[i]] = decode.length === 1 ? decode[0] : decode;
        }

        return {contract, decodedStateData};

    } catch (error: any)
    {
        //Attempts to throw/log a legible error message.
        console.log (extractErrorMessage(error));
    }
}

//Function that initializes a contract instance and fetches contract data.
export async function initContract(): Promise<Contract | undefined>
{
    try
    {
        //Checks for a wallet extension and skips everything if one is not found.
        if (!window.ethereum) throw new Error('No wallet extension is installed!');
        const provider: BrowserProvider = new ethers.BrowserProvider(window.ethereum);

        //Initialize user wallet and signer if already connected.
        const accounts: string[] = await collectUsers();
        if (accounts.length === 0) throw new Error('No wallet connected!');

        //Throw if the user is on the wrong network.
        const network: Network = await provider.getNetwork();
        if (network.chainId != BigInt(11124)) throw new Error ('Switch to Abstract Chain!');

        //Contract address environment variable injected by the hosting service.
        const contractAddr: string | undefined = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        if (!contractAddr) throw new Error ('Contract address is not set!');

        //Initializes a signer and a contract instance to interact with.
        const signer: JsonRpcSigner = await provider.getSigner();
        const contract: Contract = new ethers.Contract(contractAddr, contractABI, signer);

        //Initializes the wallet of the user and returns it with the contract.
        const wallet: string = await signer.getAddress();
        return contract;

    } catch (error: any)
    {
        //Attempts to throw/log a legible error message.
        throw new Error (extractErrorMessage(error));
    }
}

export async function owner_calls 
    (contract: Contract, wallet: string): Promise<void>
{
    try
    {
        //Initializes the owner of the smart contract.
        const owner: string = await contract.owner();

        //Throw if a non-owner makes an only owner call to the contract.
        if (wallet !== owner) throw new Error ('You are not the owner!');

        //Sends a transaction to the blockchain.
        const transaction = await contract.withdraw();

        //Console logs before and after tx gets mined.
        console.log('pending');
        await transaction.wait();
        console.log('success');

    } catch (error: any)
    {
        //Attempts to throw/log a legible error message.
        throw new Error (extractErrorMessage(error));
    }
}

export async function whitelist_mint 
    (contract: Contract, wallet: string, amount: bigint): Promise<void>
{
    try
    {
        //Whitelisted users get to mint at least one nft for free.
        const tokenBalance: bigint = await contract.balanceOf(wallet);
        const effectiveQuantity: bigint = tokenBalance > 0n ? amount : amount - 1n;

        //Initialize the whitelist mint price from the contract and the cost of the mint.
        const wl_price: bigint = await contract.whitelistMintPrice();
        const wl_cost: bigint = wl_price * effectiveQuantity;

        //Initialize a provider to be used when fetching the users currency balance.
        if (!contract.runner) throw new Error ('Contract not initialized!');
        const provider = contract.runner.provider;

        //Initialize the users current wallet currency balance.
        if (!provider) throw new Error ('Provider not found!');
        const balance: bigint = await provider.getBalance(wallet);

        //Checks the user for whitelist validity.
        const {proof}: MerkleResults = merkleValidator(wallet);
        const whitelistStatus: boolean = await contract.whitelistStatus(proof);

        //Throw is the user isn't whitelisted or if they don't have enough balance.
        if (!whitelistStatus) throw new Error ('You are not whitelisted!');
        if (balance < wl_cost) throw new Error ('Not enough wallet balance!');

        //Sends a transaction to the blockchain.
        const transaction = await contract.whitelistMint(amount, proof, {value: wl_cost});

        //Console logs before and after tx gets mined.
        console.log('pending');
        await transaction.wait();
        console.log('success');

    } catch (error: any)
    {
        //Attempts to throw/log a legible error message.
        throw new Error (extractErrorMessage(error));
    }
}

export async function public_mint 
    (contract: Contract, wallet: string, amount: bigint): Promise<void>
{
    try
    {
        //Initialize the public mint price from the contract and the cost of the mint.
        const pl_price: bigint = await contract.publicMintPrice();
        const pl_cost: bigint = pl_price * amount;

        //Initialize a provider to be used when fetching the users currency balance.
        if (!contract.runner) throw new Error ('Contract not initialized!');
        const provider = contract.runner.provider;

        //Initialize the users current wallet currency balance.
        if (!provider) throw new Error ('Provider not found!');
        const balance: bigint = await provider.getBalance(wallet);

        //Throw is the user isn't whitelisted or if they don't have enough balance.
        if (balance < pl_cost) throw new Error ('Not enough wallet balance!');

        //Sends a transaction to the blockchain.
        const transaction = await contract.publicMint(amount, {value: pl_cost});

        //Console logs before and after tx gets mined.
        console.log('pending');
        await transaction.wait();
        console.log('success');

    } catch (error: any)
    {
        //Attempts to throw/log a legible error message.
        throw new Error (extractErrorMessage(error));
    }
}

export async function whitelistMintAGW 
    (contract: Contract, address: string, agwClient: any, amount: bigint): Promise<void>
{
    try 
    {
        //Contract address environment variable injected by the hosting service.
        const contractAddr: string | undefined = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        if (!contractAddr) throw new Error ('Contract address is not set!');

        //Whitelisted users get to mint at least one nft for free.
        const tokenBalance: bigint = await contract.balanceOf(address);
        const effectiveQuantity: bigint = tokenBalance > 0n ? amount : amount - 1n;

        //Initialize the whitelist mint price from the contract and the cost of the mint.
        const wl_price: bigint = await contract.whitelistMintPrice();
        const wl_cost: bigint = wl_price * effectiveQuantity;

        //Tricks writeContractSponsoredAsync into beliving the right type.
        const contractAddress: `0x${string}` = contractAddr as `0x${string}`;

        //Initialize a provider to send the transaction through the network.
        const provider = new JsonRpcProvider("https://api.testnet.abs.xyz");
        if (!provider) throw new Error ('Provider not initialized!');

        //Grab the users currency balance and proof if they're whitelisted.
        const proof: string[] = merkleValidator(address).proof;
        const walletBalance: bigint = await provider.getBalance(address);

        //Need to check balance prior to triggering mint event for error catching.
        if (walletBalance < amount * wl_cost) throw new Error ('Not enough funds!');

        await agwClient.writeContract
        (
            {
                abi: parseAbi(['function whitelistMint(uint256 quantity, bytes32[] calldata merkleProof) external payable']),
                address: contractAddress,
                functionName: 'whitelistMint',
                args: [amount, proof as readonly `0x${string}`[]],
                value: amount * wl_cost,
            }
        )
    } catch (error: any)
    {
        //Attempts to throw/log a legible error message.
        throw new Error (extractErrorMessage(error));
    }
}

export async function publicMintAGW 
    (contract: Contract, address: string, agwClient: any, amount: bigint): Promise<void>
{
    try 
    {
        //Contract address environment variable injected by the hosting service.
        const contractAddr: string | undefined = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        if (!contractAddr) throw new Error ('Contract address is not set!');

        //Initialize the whitelist mint price from the contract and the cost of the mint.
        const pl_price: bigint = await contract.publicMintPrice();
        const pl_cost: bigint = pl_price * amount;

        //Tricks writeContractSponsoredAsync into beliving the right type.
        const contractAddress: `0x${string}` = contractAddr as `0x${string}`;

        //Initialize a provider to send the transaction through the network.
        const provider = new JsonRpcProvider("https://api.testnet.abs.xyz");
        if (!provider) throw new Error ('Provider not initialized!');

        //Grab the users currency balance.
        const walletBalance: bigint = await provider.getBalance(address);

        //Need to check balance prior to triggering mint event for error catching.
        if (walletBalance < pl_cost) throw new Error ('Not enough funds!')

        await agwClient.writeContract
        (
            {
                abi: parseAbi(['function publicMint(uint256 quantity) external payable']),
                address: contractAddress,
                functionName: 'publicMint',
                args: [amount],
                value: pl_cost,
            }
        )
    } catch (error: any)
    {
        //Attempts to throw/log a legible error message.
        throw new Error (extractErrorMessage(error));
    }
}