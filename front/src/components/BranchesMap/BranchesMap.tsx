'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en Next.js
if (typeof window !== 'undefined') {
  import('leaflet').then((L) => {
    // @ts-expect-error - Fix temporal para iconos de Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
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
    <MapContainer center={center} zoom={13} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {branches.map(branch => (
        <Marker key={branch.id} position={[branch.latitude, branch.longitude]}>
          <Popup>
            <strong>{branch.name}</strong><br />
            {branch.address}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
