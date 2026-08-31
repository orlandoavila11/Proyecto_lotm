import { DatabaseManager } from '../database/DatabaseManager';

export interface CityData {
  id: string;
  name: string;
  country: string;
  type: string;
  populationClass: string;
  importantLocations: string[];
  majorOrganizations: string[];
  description: string;
}

export class WorldSystem {
  private cities: Map<string, CityData> = new Map();
  private activeCityId: string | null = null;

  constructor() {
    this.loadWorldFromDatabase();
  }

  /**
   * Ingiere y mapea de forma dinámica los nodos geográficos desde tus archivos de la base de datos.
   */
  private loadWorldFromDatabase(): void {
    const db = DatabaseManager.getInstance();
    // Obtener el módulo cargado automáticamente de cities.json
    const rawCitiesData = db.getWorldModule('cities');

    if (rawCitiesData && Array.isArray(rawCitiesData.cities)) {
      rawCitiesData.cities.forEach((city: CityData) => {
        this.cities.set(city.id.toLowerCase(), city);
      });
    }
  }

  /**
   * Ejecuta el viaje determinista del personaje a través de los nodos del mapa.
   */
  public travelToCity(cityId: string): boolean {
    const key = cityId.toLowerCase();
    if (!this.cities.has(key)) {
      return false; // Bloqueo: Impide viajar a locaciones fuera de tu canon JSON
    }
    this.activeCityId = key;
    return true;
  }

  public getActiveCity(): CityData | null {
    if (!this.activeCityId) return null;
    return this.cities.get(this.activeCityId) || null;
  }

  public getCityDetails(cityId: string): CityData | null {
    return this.cities.get(cityId.toLowerCase()) || null;
  }

  public getAllDiscoveredCities(): CityData[] {
    return Array.from(this.cities.values());
  }
}
