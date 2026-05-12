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

export interface Contribution {
  type: 'brewery' | 'beer';
  data: any;
  timestamp: string;
}
