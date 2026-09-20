// Provisional research parameters. Adjust these after questionnaire and desk-study calibration.
export const scoringConfig = {
  alignment: {
    tolerance: 55, // desk units between like edges or centers
  },
  grouping: {
    maxDistance: 400, // center distance that receives zero proximity credit
  },
  regularity: {
    spacingCvLimit: 0.8,
    balanceMaxOffset: 0.5, // fraction of desk center-to-corner distance
    weights: { spacing: 0.3, orientation: 0.25, alignment: 0.25, balance: 0.2 },
  },
  overlap: {
    weights: { itemCount: 0.4, area: 0.4, angle: 0.2 },
  },
  spatial: {
    sampleColumns: 50,
    sampleRows: 32,
    targetOccupiedRatio: 0.22,
    occupiedTolerance: 0.22,
    targetExtentRatio: 0.65,
    extentTolerance: 0.65,
    centerRadiusRatio: 0.32, // fraction of desk center-to-corner distance
    edgeBand: 100, // distance from an item's occupied bounds to the desk edge
    targetCenterFraction: 0.3,
    targetEdgeFraction: 0.3,
    fractionTolerance: 0.7,
    weights: { occupied: 0.35, extent: 0.25, centerEdge: 0.4 },
  },
}
