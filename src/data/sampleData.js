// Sample data showing cities founded over time
// Timestamps represent years (as milliseconds for simplicity in this demo)

export const citiesOverTime = {
  type: 'FeatureCollection',
  features: [
    // Tacoma area early activity cluster
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.4443, 47.2529] // Tacoma
      },
      properties: {
        name: 'Tacoma',
        timestamp: new Date('1600-01-01').getTime(),
        population: 219346,
        description: 'Early settlement activity'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.46, 47.27] // Near Tacoma
      },
      properties: {
        name: 'Tacoma North',
        timestamp: new Date('1605-01-01').getTime(),
        description: 'Trading post'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.42, 47.24] // Near Tacoma
      },
      properties: {
        name: 'Tacoma East',
        timestamp: new Date('1610-01-01').getTime(),
        description: 'Early settlement'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.48, 47.23] // Near Tacoma
      },
      properties: {
        name: 'Tacoma South',
        timestamp: new Date('1615-01-01').getTime(),
        description: 'Port area'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.45, 47.26] // Near Tacoma
      },
      properties: {
        name: 'Tacoma West',
        timestamp: new Date('1620-01-01').getTime(),
        description: 'Settlement expansion'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-74.006, 40.7128] // New York
      },
      properties: {
        name: 'New York',
        timestamp: new Date('1624-01-01').getTime(),
        population: 33131,
        description: 'Founded as New Amsterdam'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749] // San Francisco
      },
      properties: {
        name: 'San Francisco',
        timestamp: new Date('1776-01-01').getTime(),
        population: 873965,
        description: 'Founded as Spanish mission'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-118.2437, 34.0522] // Los Angeles
      },
      properties: {
        name: 'Los Angeles',
        timestamp: new Date('1781-01-01').getTime(),
        population: 3979576,
        description: 'Founded by Spanish governor'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-87.6298, 41.8781] // Chicago
      },
      properties: {
        name: 'Chicago',
        timestamp: new Date('1833-01-01').getTime(),
        population: 2693976,
        description: 'Incorporated as a city'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-95.3698, 29.7604] // Houston
      },
      properties: {
        name: 'Houston',
        timestamp: new Date('1836-01-01').getTime(),
        population: 2320268,
        description: 'Founded and named after Sam Houston'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-112.074, 33.4484] // Phoenix
      },
      properties: {
        name: 'Phoenix',
        timestamp: new Date('1868-01-01').getTime(),
        population: 1680992,
        description: 'Settled as agricultural community'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.3321, 47.6062] // Seattle
      },
      properties: {
        name: 'Seattle',
        timestamp: new Date('1869-01-01').getTime(),
        population: 753675,
        description: 'Incorporated as a city'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-115.1398, 36.1699] // Las Vegas
      },
      properties: {
        name: 'Las Vegas',
        timestamp: new Date('1905-01-01').getTime(),
        population: 641903,
        description: 'City founded with railroad auction'
      }
    }
  ]
};

// Sample data showing route/path development over time
export const railroadExpansion = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [-74.006, 40.7128],
          [-75.1652, 39.9526]
        ]
      },
      properties: {
        name: 'New York to Philadelphia',
        timestamp: new Date('1830-01-01').getTime(),
        type: 'railroad'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [-87.6298, 41.8781],
          [-90.0715, 29.9511]
        ]
      },
      properties: {
        name: 'Chicago to New Orleans',
        timestamp: new Date('1856-01-01').getTime(),
        type: 'railroad'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [-95.3698, 29.7604],
          [-118.2437, 34.0522]
        ]
      },
      properties: {
        name: 'Southern Pacific Railroad',
        timestamp: new Date('1881-01-01').getTime(),
        type: 'railroad'
      }
    }
  ]
};

// Sample data showing territorial changes over time
export const statehood = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-109.05, 41.0],
          [-102.05, 41.0],
          [-102.05, 37.0],
          [-109.05, 37.0],
          [-109.05, 41.0]
        ]]
      },
      properties: {
        name: 'Colorado',
        timestamp: new Date('1876-08-01').getTime(),
        type: 'state',
        admitted: 'August 1, 1876'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-125.0, 49.0],
          [-116.0, 49.0],
          [-116.0, 45.5],
          [-125.0, 45.5],
          [-125.0, 49.0]
        ]]
      },
      properties: {
        name: 'Washington',
        timestamp: new Date('1889-11-11').getTime(),
        type: 'state',
        admitted: 'November 11, 1889'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-114.0, 37.0],
          [-109.0, 37.0],
          [-109.0, 31.3],
          [-114.0, 31.3],
          [-114.0, 37.0]
        ]]
      },
      properties: {
        name: 'Arizona',
        timestamp: new Date('1912-02-14').getTime(),
        type: 'state',
        admitted: 'February 14, 1912'
      }
    }
  ]
};
