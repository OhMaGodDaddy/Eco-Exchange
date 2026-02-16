import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// 🐛 FIX FOR REACT-LEAFLET DEFAULT ICON BUG
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});
// -----------------------------------------

function LocationMap({ lat, lng, itemName }) {
  // If we don't have coordinates yet, don't try to render the map
  if (!lat || !lng) return <p>Location not provided for this item.</p>;

  const position = [lat, lng];

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginTop: '20px', border: '1px solid #E2E8F0' }}>
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        {/* This is the OpenStreetMap layer - 100% Free! */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* The Blue Pin */}
        <Marker position={position}>
          <Popup>
            {itemName || "Item Location"}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default LocationMap;