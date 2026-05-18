// venueService.js
import { Base44 } from '@base44/client';

const base44 = new Base44();
const APP_ID = import.meta.env.VITE_BASE44_APP_ID;

export async function getSavedVenues() {
  try {
    const result = await base44.queryEntities({
      appId: APP_ID,
      entityName: 'Venue',
      query: {},
      sort: '-visit_count',
      limit: 500
    });
    return result.records || [];
  } catch (error) {
    console.error('Error fetching venues:', error);
    return [];
  }
}

export async function createVenue(venueData) {
  try {
    const result = await base44.createEntities({
      appId: APP_ID,
      entityName: 'Venue',
      records: [{
        name: venueData.name,
        type: venueData.type,
        address: venueData.address || '',
        notes: venueData.notes || '',
        is_favorite: false,
        visit_count: 0,
        avg_spend: 0,
        common_items: [],
        last_visited: new Date().toISOString()
      }]
    });
    return result.records?.[0];
  } catch (error) {
    console.error('Error creating venue:', error);
    throw error;
  }
}

export async function updateVenueStats(venueName, itemName, amount) {
  try {
    const result = await base44.queryEntities({
      appId: APP_ID,
      entityName: 'Venue',
      query: { 'data.name': venueName },
      limit: 1
    });

    if (!result.records || result.records.length === 0) return;

    const venue = result.records[0];
    const currentVisitCount = venue.data.visit_count || 0;
    const currentAvgSpend = venue.data.avg_spend || 0;

    const newVisitCount = currentVisitCount + 1;
    const newAvgSpend = ((currentAvgSpend * currentVisitCount) + amount) / newVisitCount;

    await base44.updateEntities({
      appId: APP_ID,
      entityName: 'Venue',
      query: { id: venue.id },
      data: {
        $set: {
          'data.visit_count': newVisitCount,
          'data.avg_spend': Math.round(newAvgSpend * 100) / 100,
          'data.last_visited': new Date().toISOString()
        }
      }
    });

    return true;
  } catch (error) {
    console.error('Error updating venue stats:', error);
    return false;
  }
}
