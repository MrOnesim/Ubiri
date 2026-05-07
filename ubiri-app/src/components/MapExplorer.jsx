import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';

// Correction pour les icônes par défaut de Leaflet qui sont cassées avec Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Composant pour recentrer la carte dynamiquement
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function MapExplorer({ workers, center = [6.3654, 2.4183], zoom = 13 }) {
  return (
    <div className="h-[500px] w-full rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-900 relative z-10">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {workers.map((worker) => (
          worker.lat && worker.lng && (
            <Marker key={worker.id} position={[worker.lat, worker.lng]}>
              <Popup>
                <div className="p-2 min-w-[150px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white font-black text-xs">
                      {worker.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs">{worker.name}</h3>
                      <p className="text-[10px] text-gray-500">{worker.trade}</p>
                    </div>
                  </div>
                  <Stars rating={worker.rating || 5} />
                  <Link 
                    to={`/profil/${worker.id}`} 
                    className="block mt-2 text-center bg-green-600 text-white text-[10px] font-bold py-1.5 rounded-lg hover:bg-green-700 transition-all"
                  >
                    Voir le profil
                  </Link>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}
