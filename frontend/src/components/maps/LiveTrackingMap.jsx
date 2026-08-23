
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const moverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const LiveTrackingMap = ({ customerCoords, workerCoords, status }) => {
  const cLat = customerCoords?.[1] || 28.6139;
  const cLng = customerCoords?.[0] || 77.2090;

  const wLat = workerCoords?.[1] || 28.6315;
  const wLng = workerCoords?.[0] || 77.2195;

  const center = [(cLat + wLat) / 2, (cLng + wLng) / 2];

  return (
    <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[cLat, cLng]} icon={destIcon}>
          <Popup>
            <div className="text-xs">
              <strong className="text-rose-600 block">🏠 Service Destination</strong>
              <span>Customer Address</span>
            </div>
          </Popup>
        </Marker>

        <Marker position={[wLat, wLng]} icon={moverIcon}>
          <Popup>
            <div className="text-xs">
              <strong className="text-blue-600 block">🛵 Worker Live Location</strong>
              <span>Status: {status?.replace(/_/g, ' ').toUpperCase()}</span>
            </div>
          </Popup>
        </Marker>

        <Polyline
          positions={[[wLat, wLng], [cLat, cLng]]}
          pathOptions={{ color: '#059669', weight: 3, dashArray: '6, 8' }}
        />
      </MapContainer>
    </div>
  );
};
