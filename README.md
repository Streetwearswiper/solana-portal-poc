```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phantom Wallet Connect</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Solana Web3.js -->
    <script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js"></script>
    <style>
        body { background-color: #1a1a1a; color: white; font-family: sans-serif; }
        .card { background: #2d2d2d; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
        .btn { transition: all 0.3s ease; }
        .btn:hover { transform: translateY(-2px); }
    </style>
</head>
<body class="flex items-center justify-center h-screen p-4">

    <div class="card text-center max-w-md w-full">
        <h1 class="text-3xl font-bold mb-2 text-purple-400">Phantom Connect</h1>
        <p class="mb-6 text-gray-400 text-sm">Connect to Solana Mainnet</p>

        <!-- Status -->
        <div id="status" class="mb-4 p-3 bg-gray-700 rounded hidden text-sm"></div>

        <!-- Connect Button -->
        <button id="connectBtn" class="btn w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
            <img src="https://cryptologos.cc/logos/solana-sol-logo.png?v=025" class="w-6 h-6" alt="Solana">
            Connect Phantom
        </button>

        <!-- Wallet Info -->
        <div id="walletInfo" class="mt-6 hidden text-left">
            <p class="text-sm text-gray-400 mb-1">Public Address:</p>
            <p id="publicKey" class="break-all font-mono bg-black p-2 rounded text-green-400 text-xs mb-4"></p>
            
            <p class="text-sm text-gray-400 mb-1">Balance:</p>
            <p id="balance" class="text-2xl font-bold text-white mb-4">Loading...</p>

            <button onclick="disconnect()" class="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm">Disconnect</button>
        </div>
    </div>

    <script>
        // 1. Setup Solana Connection (Mainnet)
        const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'), 'confirmed');
        const phantom = window.phantom?.solana;

        if (!phantom) {
            showStatus("⚠️ Please install Phantom Wallet on your phone!", "text-yellow-400");
        }

        // 2. Connect Function
        async function connect() {
            try {
                const resp = await phantom.connect();
                const publicKey = resp.publicKey.toString();
                
                document.getElementById('connectBtn').classList.add('hidden');
                document.getElementById('walletInfo').classList.remove('hidden');
                document.getElementById('publicKey').innerText = publicKey;
                
                fetchBalance(publicKey);

            } catch (err) {
                showStatus("❌ Connection failed: " + err.message, "text-red-400");
            }
        }

        // 3. Fetch Balance
        async function fetchBalance(addressString) {
            try {
                const address = new solanaWeb3.PublicKey(addressString);
                const balance = await connection.getBalance(address);
                const solBalance = balance / 1000000000;
                
                document.getElementById('balance').innerText = `${solBalance.toFixed(4)} SOL`;
            } catch (err) {
                document.getElementById('balance').innerText = "Error fetching";
            }
        }

        // 4. Disconnect
        async function disconnect() {
            await phantom.disconnect();
            document.getElementById('connectBtn').classList.remove('hidden');
            document.getElementById('walletInfo').classList.add('hidden');
            showStatus("", "");
        }

        // Helper to show status
        function showStatus(msg, colorClass) {
            const el = document.getElementById('status');
            el.innerText = msg;
            el.className = `mb-4 p-3 rounded hidden text-sm ${colorClass}`;
            if(msg) el.classList.remove('hidden');
        }

        // Bind button
        document.getElementById('connectBtn').addEventListener('click', connect);
    </script>
</body>
</html>
