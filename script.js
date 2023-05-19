mapboxgl.accessToken = 'pk.eyJ1IjoiamF1aGFybXVoYW1tZWQiLCJhIjoiY2xjMWl6c3VtMGxkYzNwbGs2dWVidDVsZCJ9.1Lyl-BoNItxbKW9_j3c-QA';

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, { enableHighAccuracy: true })

function successLocation(position) {
    console.log(position);
    setupMap([position.coords.longitude, position.coords.latitude])
}

function errorLocation() {
    setupMap([55.2708, 25.2048])
}

function setupMap(center) {
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: center,
      zoom: 11,
    });
  
    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl());
  
    // Add a marker for the current location
    const marker = new mapboxgl.Marker().setLngLat(center).addTo(map);
  
    // Add nearby hotels layer to the map
    map.on("load", () => {
      map.addSource("hotels", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: []
        }
      });
  
      // Query for nearby hotels within a radius of 40km
      map.addLayer({
        id: "hotels",
        type: "circle",
        source: "hotels",
        paint: {
          "circle-radius": 6,
          "circle-color": "#ff0000"
        },
        filter: ["<=", "distance", 40000]
      });
  
      const hotelsUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/hotels.json?proximity=${center[0]},${center[1]}&access_token=${mapboxgl.accessToken}`;
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/hotels.json?proximity=${center[0]},${center[1]}&access_token=${mapboxgl.accessToken}`)
      .then(response => response.json())
      .then(data => {
        const hotelsList = document.getElementById('hotels-list');
        hotelsList.innerHTML = '';
    
        data.features.forEach((feature) => {
          if (feature.place_type.includes('hotel')) {
            const hotelName = feature.text;
            const hotelAddress = feature.properties.address;
            const listItem = document.createElement('li');
            listItem.innerHTML = `<strong>${hotelName}</strong><br>${hotelAddress}`;
            hotelsList.appendChild(listItem);
          }
        });
      
    
  
          // Add markers for hotels to the map
          map.loadImage(
            'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
            function (error, image) {
              if (error) throw error;
              map.addImage('custom-marker', image);
              map.addLayer({
                id: 'hotels-markers',
                type: 'symbol',
                source: 'hotels',
                layout: {
                  'icon-image': 'custom-marker',
                  'icon-allow-overlap': true,
                  'text-field': ['get', 'name'],
                  'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                  'text-radial-offset': 0.6,
                  'text-justify': 'auto',
                  'text-size': 12
                },
                paint: {
                  'text-color': '#fff',
                  'text-halo-color': '#000',
                  'text-halo-width': 2
                }
              });
            }
          );
        });
    });
  
    // Set your location as the starting point for Mapbox Directions
    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
    });
  
    // Add the directions control to the map
    map.addControl(directions, "top-left");
    // Set the starting point to the current location on the first map click
    let isFirstClick = true;
    map.on("click", (e) => {
      if (isFirstClick) {
        directions.setOrigin(`${center[0]},${center[1]}`);
        isFirstClick = false;
      }
      directions.setDestination(`${e.lngLat.lng},${e.lngLat.lat}`);
    });
  }
  