import React, { useEffect, useState } from "react";

const BlockchainDiagram = () => {
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);

  // Helper function to generate a random wallet address
  const generateRandomWalletAddress = () => {
    const characters = "0123456789abcdef";
    let address = "0x";
    for (let i = 0; i < 40; i++) {
      address += characters[Math.floor(Math.random() * characters.length)];
    }
    return address;
  };

  useEffect(() => {
    const dummyBlocks = Array.from({ length: 7 }, (_, i) => ({
      id: i + 1,
      name: `Block ${i === 0 ? "n-1" : i === 1 ? "n" : `n+${i - 1}`}`,
      header: "Header",
      previousAddress: `0xABC${i}`,
      timestamp: new Date().toISOString(),
      nonce: Math.floor(Math.random() * 100000),
      merkleRoot: `MerkleRoot${i}`,
      // Just one wallet address per block
      walletAddress: generateRandomWalletAddress()
    }));
    setBlocks(dummyBlocks);
  }, []);

  const handleBlockClick = (block) => setSelectedBlock(block);
  const closePopup = () => setSelectedBlock(null);

  const getPositionStyle = (index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const isEvenRow = row % 2 === 0;
    const left = isEvenRow ? col * 33.33 : (2 - col) * 33.33;
    return {
      position: "absolute",
      top: `${row * 250}px`,
      left: `${left + 16.66}%`,
      transform: "translateX(-50%)",
    };
  };

  const getLinePath = (index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const isEvenRow = row % 2 === 0;
    const nextIndex = index + 1;
    if (nextIndex >= blocks.length) return null;

    const nextRow = Math.floor(nextIndex / 3);
    const nextCol = nextIndex % 3;
    const nextIsEven = nextRow % 2 === 0;
    const x1 = `${(isEvenRow ? col * 33.33 : (2 - col) * 33.33) + 16.66}%`;
    const x2 = `${(nextIsEven ? nextCol * 33.33 : (2 - nextCol) * 33.33) + 16.66}%`;
    const y1 = row * 250 + 96;
    const y2 = nextRow * 250 + 96;

    return (
      <svg className="absolute z-1" style={{ top: 20, left: 20, width: '100%', height: '100%' }}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="silver"
          strokeWidth="3"
          strokeDasharray="12 3"
          className="animate-blink-line"
        />
        <polygon
          points={`${x2.replace('%','')} ${y2 - 5}, ${parseFloat(x2.replace('%','')) + 2} ${y2}, ${x2.replace('%','')} ${y2 + 5}`}
          fill="silver"
        />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 relative overflow-hidden">
      <h1 className="text-4xl font-bold mb-16 text-center">Blockchain Chain Flow</h1>

      <div className="relative w-full" style={{ minHeight: `${Math.ceil(blocks.length / 3) * 300}px` }}>
        {blocks.map((block, index) => (
          <React.Fragment key={block.id}>
            <div
              style={getPositionStyle(index)}
              className="w-[200px] flex flex-col items-center z-10"
            >
              {/* Single small wallet address box */}
              <div className="mb-2 bg-gray-800 px-2 py-1 rounded text-xs text-gray-300 w-full overflow-hidden text-center">
                {block.walletAddress.substring(0, 8)}...{block.walletAddress.substring(block.walletAddress.length - 6)}
              </div>
              
              <div
                onClick={() => handleBlockClick(block)}
                className="w-48 h-48 bg-green-600 rounded-md shadow-xl border-4 border-green-400 flex items-center justify-center text-xl font-bold cursor-pointer hover:scale-105 transition-transform duration-300"
              >
                {block.name}
              </div>
            </div>
            {getLinePath(index)}
          </React.Fragment>
        ))}
      </div>

      {selectedBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl shadow-2xl max-w-md w-full relative text-white">
            <button
              onClick={closePopup}
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
            <h2 className="text-2xl font-semibold mb-4">{selectedBlock.name} Details</h2>
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold text-green-400">Header:</span> {selectedBlock.header}</div>
              <div><span className="font-semibold text-green-400">Previous Block Address:</span> {selectedBlock.previousAddress}</div>
              <div><span className="font-semibold text-green-400">Timestamp:</span> {new Date(selectedBlock.timestamp).toLocaleString()}</div>
              <div><span className="font-semibold text-green-400">Nonce:</span> {selectedBlock.nonce}</div>
              <div><span className="font-semibold text-green-400">Merkle Root:</span> {selectedBlock.merkleRoot}</div>
              <div><span className="font-semibold text-green-400">Wallet Address:</span> {selectedBlock.walletAddress}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainDiagram;