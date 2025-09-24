'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en Next.js
let customIcon: any = null;

if (typeof window !== 'undefined') {
  import('leaflet').then((L) => {
    // @ts-expect-error - Fix temporal para iconos de Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    
    // Crear un icono personalizado amarillo
    customIcon = new L.Icon({
      iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 19.4 12.5 41 12.5 41S25 19.4 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="#fee600"/>
          <circle cx="12.5" cy="12.5" r="5" fill="#000000"/>
        </svg>
      `),
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    
    // También configurar el icono por defecto para compatibilidad
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  });
}

interface Branch {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface Props {
  branches: Branch[];
}

export default function BranchesMap({ branches }: Props) {
  const center: LatLngExpression = branches.length
    ? [branches[0].latitude, branches[0].longitude]
    : [0, 0]; // fallback

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <MapContainer center={center} zoom={13} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {branches.map(branch => (
          <Marker 
            key={branch.id} 
            position={[branch.latitude, branch.longitude]}
            icon={customIcon || undefined}
          >
            <Popup>
              <strong>{branch.name}</strong><br />
              {branch.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
