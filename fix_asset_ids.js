async function fixIds() {
  try {
    const res = await fetch('http://localhost:8080/api/assets');
    const assets = await res.json();
    console.log(`Found ${assets.length} assets.`);

    for (const asset of assets) {
      if (asset.id && asset.id.length > 10) {
        console.log(`Fixing asset ID: ${asset.id} (${asset.name})`);
        
        // Generate new ID
        const newId = 'AST-' + Math.floor(1000 + Math.random() * 9000);
        
        // Clone asset and update ID
        const newAsset = { ...asset, id: newId };
        
        // Insert new asset
        await fetch('http://localhost:8080/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAsset)
        });
        console.log(`Created new asset with ID: ${newId}`);

        // Delete old asset
        await fetch(`http://localhost:8080/api/assets/${asset.id}`, {
          method: 'DELETE'
        });
        console.log(`Deleted old asset: ${asset.id}`);
      }
    }
    
    console.log('Done fixing IDs!');
  } catch (err) {
    console.error('Error:', err);
  }
}

fixIds();
