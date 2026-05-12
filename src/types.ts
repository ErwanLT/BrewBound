export interface Brewery {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  hours: string;
  website?: string;
  description?: string;
}

export interface Beer {
  id: string;
  breweryId: string;
  name: string;
  style: string;
  abv: string;
  description: string;
  imageUrl?: string;
}

export type Contribution =
  | {
      type: "brewery";
      data: Brewery;
      timestamp: string;
    }
  | {
      type: "beer";
      data: Beer;
      timestamp: string;
    };
