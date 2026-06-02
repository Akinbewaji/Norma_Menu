export interface Category {
  id: number;
  name: string;
  description?: string;
  display_order: number;
}

export interface MenuItem {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  description?: string;
  price: string | number;
  available: boolean;
  allergens?: string[];
  image_url?: string;
  display_order: number;
}
