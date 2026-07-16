const API_URL = 'https://it-asset-monitoring-system.onrender.com/api/assets';

const sampleAssets = [
  {
    name: "MacBook Pro 16-inch (M3 Max)",
    category: "Laptop",
    type: "Hardware",
    status: "Available",
    health: 100,
    dateAdded: new Date().toISOString()
  },
  {
    name: "Dell UltraSharp 32 4K Monitor",
    category: "Monitor",
    type: "Hardware",
    status: "Available",
    health: 95,
    dateAdded: new Date().toISOString()
  },
  {
    name: "Logitech MX Master 3S Mouse",
    category: "Accessory",
    type: "Hardware",
    status: "Available",
    health: 100,
    dateAdded: new Date().toISOString()
  },
  {
    name: "Keychron K2 Wireless Mechanical Keyboard",
    category: "Accessory",
    type: "Hardware",
    status: "Available",
    health: 85,
    dateAdded: new Date().toISOString()
  },
  {
    name: "Lenovo ThinkPad X1 Carbon Gen 11",
    category: "Laptop",
    type: "Hardware",
    status: "Available",
    health: 98,
    dateAdded: new Date().toISOString()
  },
  {
    name: "Adobe Creative Cloud License",
    category: "Software",
    type: "Software",
    status: "Available",
    health: 100,
    dateAdded: new Date().toISOString()
  }
];

async function seedAssets() {
  console.log("Seeding assets to live cloud database...");
  for (const asset of sampleAssets) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(asset)
      });
      if(response.ok) {
        console.log(`Successfully added: ${asset.name}`);
      } else {
        const text = await response.text();
        console.error(`Failed to add: ${asset.name} - ${text}`);
      }
    } catch (err) {
      console.error(err);
    }
  }
  console.log("Finished seeding!");
}

seedAssets();
