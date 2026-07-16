const API_URL = 'https://it-asset-monitoring-system.onrender.com/api/assets';

const sampleAssets = [
  {
    name: "Apple iPad Pro 12.9-inch",
    category: "Tablet",
    type: "Hardware",
    status: "Available",
    health: 100,
    dateAdded: new Date().toISOString()
  },
  {
    name: "Herman Miller Aeron Chair",
    category: "Furniture",
    type: "Hardware",
    status: "Available",
    health: 95,
    dateAdded: new Date().toISOString()
  },
  {
    name: "Dell PowerEdge R740 Server",
    category: "Server",
    type: "Hardware",
    status: "Available",
    health: 99,
    dateAdded: new Date().toISOString()
  },
  {
    name: "JetBrains IntelliJ IDEA Ultimate",
    category: "Software",
    type: "Software",
    status: "Available",
    health: 100,
    dateAdded: new Date().toISOString()
  },
  {
    name: "LG 34-inch Ultrawide Curved Monitor",
    category: "Monitor",
    type: "Hardware",
    status: "Available",
    health: 100,
    dateAdded: new Date().toISOString()
  }
];

async function seedAssets() {
  for (const asset of sampleAssets) {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset)
      });
    } catch (err) {}
  }
}

seedAssets();
