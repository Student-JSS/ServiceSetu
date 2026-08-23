
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const workerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const WorkerFinderMap = ({ customerLocation, workers = [], radiusKm = 15, onSelectWorker }) => {
  const centerLat = customerLocation?.lat || 28.6139;
  const centerLng = customerLocation?.lng || 77.2090;

  return (
    <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[centerLat, centerLng]} icon={customerIcon}>
          <Popup>
            <div className="text-xs p-1">
              <strong className="text-rose-600 block">📍 Your Location</strong>
              <span>Searching nearby verified workers within {radiusKm} km</span>
            </div>
          </Popup>
        </Marker>

        <Circle
          center={[centerLat, centerLng]}
          radius={radiusKm * 1000}
          pathOptions={{
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.1,
            weight: 1.5,
          }}
        />

        {workers.map((w) => {
          const wLng = w.location?.coordinates?.[0] || 77.2090;
          const wLat = w.location?.coordinates?.[1] || 28.6139;

          return (
            <Marker key={w._id} position={[wLat, wLng]} icon={workerIcon}>
              <Popup>
                <div className="text-xs p-1 max-w-[200px]">
                  <div className="flex items-center gap-1.5 mb-1 font-bold text-slate-800">
                    <span className="text-coop-700">👷 {w.userId?.fullName || 'Worker'}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-semibold">
                      ★ {w.ratingAvg || 5.0}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-1">
                    Skills: {w.skills?.join(', ')} ({w.experienceYears} yrs exp)
                  </p>
                  <p className="text-[10px] text-slate-600 mb-1 flex items-center gap-1">
                    <span>📍</span> <span className="truncate">{w.userId?.address || 'New Delhi'}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mb-2">
                    Distance: <strong className="text-slate-700">{w.distanceKm || 2.5} km away</strong>
                  </p>
                  {onSelectWorker && (
                    <button
                      onClick={() => onSelectWorker(w)}
                      className="w-full py-1.5 bg-coop-600 hover:bg-coop-700 text-white rounded-lg text-[10px] font-bold"
                    >
                      Select This Worker
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
