// Varsayılan ürün görselleri - Emoji tabanlı görseller
export const defaultImages = {
  coffee: '☕',
  coldDrink: '🥤',
  dessert: '🍰',
  snack: '🥨',
  breakfast: '🍳',
  sandwich: '🥪',
  salad: '🥗',
  soup: '🍲',
  healthy: '🥬',
  beverage: '🧃',
  turkish: '🧿',
  pastry: '🥐'
};

// Kategori ID'sine göre varsayılan görsel emoji'si döndüren fonksiyon
export const getDefaultImageForCategory = (categoryId: string): string => {
  switch (categoryId) {
    case 'hot-drinks':
      return defaultImages.coffee;
    case 'cold-drinks':
      return defaultImages.coldDrink;
    case 'desserts':
      return defaultImages.dessert;
    case 'snacks':
      return defaultImages.snack;
    case 'breakfast':
      return defaultImages.breakfast;
    case 'sandwiches':
      return defaultImages.sandwich;
    case 'salads':
      return defaultImages.salad;
    case 'soups':
      return defaultImages.soup;
    case 'healthy':
      return defaultImages.healthy;
    case 'beverages':
      return defaultImages.beverage;
    case 'turkish-delights':
      return defaultImages.turkish;
    case 'pastries':
      return defaultImages.pastry;
    default:
      return defaultImages.coffee; // Varsayılan
  }
}; 