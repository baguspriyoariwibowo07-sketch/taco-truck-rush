// Taco Truck: Sunset Rush — ingredients and the six recipes.
// Every recipe is a distinct ingredient chain: the same tortilla base, then a
// different protein / filling / topping combination, so no two dishes play alike.

export const INGREDIENTS = [
  { id: 'tortilla', name: 'Tortilla', key: '1', color: '#f2d492', dark: '#c9a45e' },
  { id: 'beef', name: 'Beef', key: '2', color: '#8a4b2d', dark: '#5f3018' },
  { id: 'chicken', name: 'Chicken', key: '3', color: '#e8a33d', dark: '#b57a1e' },
  { id: 'fish', name: 'Fish', key: '4', color: '#f4ede0', dark: '#c9b896' },
  { id: 'beans', name: 'Beans', key: '5', color: '#6e2f1d', dark: '#4a1e10' },
  { id: 'rice', name: 'Rice', key: '6', color: '#fff8ea', dark: '#d9cba6' },
  { id: 'egg', name: 'Egg', key: '7', color: '#fdf3d0', dark: '#e8c96a' },
  { id: 'cheese', name: 'Cheese', key: '8', color: '#ffc53d', dark: '#e09a00' },
  { id: 'salsa', name: 'Salsa', key: '9', color: '#d9382b', dark: '#96221a' },
  { id: 'slaw', name: 'Slaw', key: '0', color: '#9ed67a', dark: '#5da83c' },
];

export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((g) => [g.id, g]));

export const RECIPES = [
  {
    id: 'beef', name: 'Classic Beef', price: 12,
    steps: ['tortilla', 'beef', 'cheese', 'salsa'],
    blurb: 'The truck original — smoky beef, cheese, salsa.',
  },
  {
    id: 'chicken', name: 'Baja Chicken', price: 13,
    steps: ['tortilla', 'chicken', 'slaw', 'salsa'],
    blurb: 'Charred chicken, crunchy slaw, bright salsa.',
  },
  {
    id: 'fish', name: 'Crispy Fish', price: 14,
    steps: ['tortilla', 'fish', 'slaw', 'cheese'],
    blurb: 'Golden battered fish, slaw, melted cheese.',
  },
  {
    id: 'veggie', name: 'Veggie Fiesta', price: 11,
    steps: ['tortilla', 'beans', 'rice', 'cheese'],
    blurb: 'Beans and rice, no meat, all flavour.',
  },
  {
    id: 'breakfast', name: 'Sunrise Egg', price: 12,
    steps: ['tortilla', 'egg', 'cheese', 'salsa'],
    blurb: 'Fluffy egg and cheese for the morning crowd.',
  },
  {
    id: 'burrito', name: 'Cali Burrito', price: 18,
    steps: ['tortilla', 'rice', 'beans', 'beef', 'cheese'],
    blurb: 'Five layers, the biggest plate on the truck.',
  },
];

export const RECIPE_BY_ID = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

// Price of a serve: dish price + a tip for fast service + a combo bonus.
export function serveValue(recipe, patienceLeft, patienceMax, combo) {
  const tip = Math.round(10 * Math.max(0, patienceLeft / patienceMax));
  return recipe.price + tip + combo * 5;
}
