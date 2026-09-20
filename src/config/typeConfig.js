// Provisional reference profiles in the same five-dimensional 0–100 score space.
// Replace these with profiles derived from participant data when available.
export const typeConfig = {
  dimensions: ['alignment', 'grouping', 'regularity', 'overlap', 'spatial'],
  weights: { alignment: 1, grouping: 1, regularity: 1, overlap: 1, spatial: 1 },
  profiles: {
    visual: { alignment: 85, grouping: 40, regularity: 85, overlap: 10, spatial: 55 },
    categorical: { alignment: 45, grouping: 85, regularity: 60, overlap: 20, spatial: 55 },
    functional: { alignment: 50, grouping: 75, regularity: 55, overlap: 25, spatial: 85 },
    personal: { alignment: 35, grouping: 35, regularity: 80, overlap: 35, spatial: 55 },
    dynamic: { alignment: 30, grouping: 40, regularity: 35, overlap: 85, spatial: 55 },
    spatial: { alignment: 35, grouping: 40, regularity: 55, overlap: 15, spatial: 90 },
  },
}
