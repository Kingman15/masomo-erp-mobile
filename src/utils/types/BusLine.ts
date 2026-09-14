import { LatLng } from "./LatLng";

export interface BusLine {
  id: string;
  name: string | null;
  color: string | null; // Code couleur hex (ex. #FF5733)
  polyline: LatLng[] | null;
}
