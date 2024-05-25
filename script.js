let addressesData;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('fileInput').addEventListener('change', processCSV);
    document.getElementById('calculateButton').addEventListener('click', calculateRoute);
});

function processCSV() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            addressesData = parseCSV(text);
            console.log('Addresses data:', addressesData);
        };
        reader.readAsText(file);
    }
}

function parseCSV(data) {
    console.log('Parsing CSV data...');
    const lines = data.split('\n').map(line => line.trim());

    // Parse CSV data
    const addresses = lines.slice(1) // Skip header
        .map(line => {
            const parts = line.split(',');
            const name = parts.shift().trim();
            const lat = parseFloat(parts.shift());
            const lon = parseFloat(parts.shift());
            return { name, lat, lon };
        });

    return addresses;
}

function calculateRoute() {
    if (!addressesData) {
        console.error('No addresses data found.');
        return;
    }

    console.log('Calculating route...');
    const orderedAddresses = orderAddressesByProximity(addressesData);
    const route = findOptimalRoute(orderedAddresses);
    displayRoute(route);
}

function orderAddressesByProximity(addresses) {
    console.log('Ordering addresses by proximity...');
    // Calculate distance matrix
    const distanceMatrix = [];
    for (let i = 0; i < addresses.length; i++) {
        const row = [];
        for (let j = 0; j < addresses.length; j++) {
            if (i === j) {
                row.push(0); // Distance from a point to itself is 0
            } else {
                row.push(calculateDistance(addresses[i], addresses[j]));
            }
        }
        distanceMatrix.push(row);
    }

    // Create pairs of addresses with distances
    const addressPairs = [];
    for (let i = 0; i < addresses.length; i++) {
        for (let j = i + 1; j < addresses.length; j++) {
            addressPairs.push({
                address1: addresses[i],
                address2: addresses[j],
                distance: distanceMatrix[i][j]
            });
        }
    }

    // Sort address pairs by distance
    addressPairs.sort((a, b) => a.distance - b.distance);

    // Reorder addresses based on sorted pairs
    const orderedAddresses = [addressPairs[0].address1, addressPairs[0].address2];
    for (let i = 1; i < addressPairs.length; i++) {
        const lastAddress = orderedAddresses[orderedAddresses.length - 1];
        if (lastAddress === addressPairs[i].address1) {
            orderedAddresses.push(addressPairs[i].address2);
        } else if (lastAddress === addressPairs[i].address2) {
            orderedAddresses.push(addressPairs[i].address1);
        }
    }

    return orderedAddresses;
}

function calculateDistance(point1, point2) {
    const { lat: lat1, lon: lon1 } = point1;
    const { lat: lat2, lon: lon2 } = point2;
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

function findOptimalRoute(addresses) {
    console.log('Optimizing route...');
    // Placeholder for now
    // Currently returning the original addresses as route
    return addresses;
}

function displayRoute(route) {
    const outputDiv = document.getElementById('output');
    let result = 'Optimal Route: <br>';
    route.forEach(point => {
        result += `${point.name},${point.lat},${point.lon}<br>`;
    });
    outputDiv.innerHTML = result;
}
