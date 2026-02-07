import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { WaterProject } from "@/types";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons in Leaflet + bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Color markers by status
const statusColors: Record<string, string> = {
  operational: "#22c55e",
  maintenance: "#f59e0b",
  under_construction: "#3b82f6",
  decommissioned: "#ef4444",
  planning: "#a855f7",
};

function createIcon(status: string) {
  const color = statusColors[status] || "#6b7280";
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 24px; height: 24px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

interface Props {
  projects: WaterProject[];
  height?: string;
}

export default function ProjectMap({ projects, height = "500px" }: Props) {
  // Center on Tanzania
  const center: [number, number] = [-6.369028, 34.888822];

  return (
    <div className="card p-0 overflow-hidden" style={{ height }}>
      <MapContainer
        center={center}
        zoom={6}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {projects
          .filter((p) => p.latitude && p.longitude)
          .map((project) => (
            <Marker
              key={project.id}
              position={[project.latitude!, project.longitude!]}
              icon={createIcon(project.status)}
            >
              <Popup>
                <div className="min-w-48">
                  <h3 className="font-bold text-sm">{project.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{project.project_code}</p>
                  <div className="space-y-1 text-xs">
                    <p>
                      <span className="font-medium">Type:</span>{" "}
                      {project.project_type.replace(/_/g, " ")}
                    </p>
                    <p>
                      <span className="font-medium">Region:</span> {project.region}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className="inline-block px-1.5 py-0.5 rounded text-white text-xs"
                        style={{ background: statusColors[project.status] || "#6b7280" }}
                      >
                        {project.status.replace(/_/g, " ")}
                      </span>
                    </p>
                    {project.population_served && (
                      <p>
                        <span className="font-medium">Pop. served:</span>{" "}
                        {project.population_served.toLocaleString()}
                      </p>
                    )}
                    {project.current_capacity_m3_per_day && (
                      <p>
                        <span className="font-medium">Capacity:</span>{" "}
                        {project.current_capacity_m3_per_day.toLocaleString()} m&sup3;/day
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
