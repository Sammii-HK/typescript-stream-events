require('dotenv').config()
import axios from 'axios';
import { sampleData } from './hco-data'; // CQC CSV FIELDS : [ name*, address*, postcode*, phone number, website, service types*, last updated*, services* ]   * fields are persistent 

const apiKey = process.env.GOOGLE_PLACES_API_KEY;

const placeSearchUrl = (searchInput: string) => `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
  `?fields=name%2Cplace_id%2Cformatted_address` +
  `&input=${searchInput}` +
  `&inputtype=textquery` +
  `&key=${apiKey}`;

const detailsSearchUrl = (placeId: string) => `https://maps.googleapis.com/maps/api/place/details/json` +
  `?fields=${formattedFields}` +
  `&place_id=${placeId}&key=${apiKey}`;

const fields = [ 
  'name', 
  'place_id', 
  'international_phone_number',
  'website',
  'formatted_address',
  // 'formatted_phone_number',
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

async function getPlaces(searchId: number, searchType: 'name' | 'postcode') {
  try {
    const search = encodeURI(hcoSampleData[searchId][searchType])
    const url = placeSearchUrl(search);
    const res = await axios.get(url);
    return res.data.candidates;
  } catch (error) {
    console.error(error.response);
  }
};

class ResultsData {
  cqc_id: number;
  name: string;
  place_match: boolean;
  place_id?: string;
  place_details?: boolean;
  website_match?: boolean;
};

let resultsOutput = [];
let hcoSampleData = sampleData;

function matchAddress(sampleData, searchData) {
  return searchData.find(result => result.formatted_address.includes(sampleData.postcode))
};

function matchWebsite(sampleData, searchData) {
  sampleData = sampleData.toLowerCase();
  searchData = searchData.toLowerCase();
  console.log("sampleData, searchData", sampleData, searchData);
  
  const match1 = matchString(sampleData, searchData);
  const match2 = matchString(searchData, sampleData);
  console.log("match1, match2", match1, match2);
  
  return match1 || match2;
}

function matchString(reference, comparison) {
  return reference.includes(comparison)
}

async function matchSearch(sampleNumber) {
  const searchResults = await getPlaces(sampleNumber, 'name');
  const cqcDataRecord = hcoSampleData[sampleNumber];

  const matchedAddress = matchAddress(cqcDataRecord, searchResults)
  let resultDetails, matchedWebsite
  if (matchedAddress) {
    resultDetails = await getDetails(matchedAddress.place_id)
    matchedWebsite = matchWebsite(cqcDataRecord.website, resultDetails.website)
  };

  let result = new ResultsData()
  result = {
    cqc_id: cqcDataRecord.id,
    name: cqcDataRecord.name,
    place_id: matchedAddress?.place_id,
    place_match: !!matchedAddress?.place_id,
    place_details: !!resultDetails?.website,
    website_match: matchedWebsite,
  };
  
  resultsOutput.push(result)
  console.log("resultsOutput", resultsOutput);
};

function searchSampleData() {
const index = 2;
  matchSearch(index);
  // sampleData.forEach((sample, index) => matchSearch(index))
}
searchSampleData();


async function getDetails(placeId: string) {
  try {
    const url = detailsSearchUrl(placeId);
    const res = await axios.get(url);
    // console.log("DETAILS RESULTS: ", res.data.result)
    return res.data.result;
  } catch (error) {
    console.error(error.response);
  }
};

