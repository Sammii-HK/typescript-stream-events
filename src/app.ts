import axios from 'axios';
require('dotenv').config()

const apiKey = process.env.GOOGLE_PLACES_API_KEY;

const fields = [ 
  'name', 
  'place_id', 
  'international_phone_number',
  'website',
  // 'types',
  // 'formatted_address', 
  // 'business_status', 
  // 'rating', 
  // 'opening_hours',
  // 'formatted_phone_number',
  // 'url',
];

const formatFields = () => {
  let fieldSearchQuery: string;
  for (let i = 0; i < fields.length; i++) {
    if (i === 0) fieldSearchQuery = (fields[i] + '%2C');
    else if (i < (fields.length - 1)) fieldSearchQuery += (fields[i] + '%2C');
    else fieldSearchQuery += fields[i];
  }
  return fieldSearchQuery
};

const formattedFields = formatFields();

const placeSearchUrl = (searchInput: string) => `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
  // `?fields=${formattedFields}` +
  `?fields=name%2Cplace_id` +
  `&input=${searchInput}` +
  `&inputtype=textquery` +
  `&key=${apiKey}`;

async function getPlaces(searchId: number, searchType: 'name' | 'postcode') {
  try {
    const search = encodeURI(searches[searchId][searchType])
    const url = placeSearchUrl(search);
    const res = await axios.get(url);
    console.log("PLACES SEARCH: ", res.data.candidates)
    return res
  } catch (error) {
    console.error(error.response);
  }
};
getPlaces(2, 'name');
// getPlaces(3, 'postcode');

