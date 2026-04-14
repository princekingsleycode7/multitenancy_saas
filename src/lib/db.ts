import Dexie, { Table } from 'dexie';

export interface Product {
  id: string;
  org_id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export interface Category {
  id: string;
  org_id: string;
  name: string;
}

export interface Tenant {
  id: string;
  org_id: string;
  name: string;
  plan: string;
}

export interface OutletSettings {
  id: string;
  org_id: string;
  name: string;
}

export interface OfflineSale {
  id?: number;
  org_id: string;
  sale_data: any;
  created_at: number;
}

export class DigiKingDB extends Dexie {
  products!: Table<Product>;
  categories!: Table<Category>;
  tenants!: Table<Tenant>;
  outlet_settings!: Table<OutletSettings>;
  offline_sales!: Table<OfflineSale>;

  constructor() {
    super('DigiKingDB');
    this.version(1).stores({
      products: 'id, org_id, category',
      categories: 'id, org_id',
      tenants: 'id, org_id',
      outlet_settings: 'id, org_id',
      offline_sales: '++id, org_id, created_at',
    });
  }
}

export const db = new DigiKingDB();
