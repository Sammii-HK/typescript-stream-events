require('dotenv').config()
import axios, { AxiosError } from 'axios';
import { sampleData as hcoSampleData } from './hco-data'; // RHCP CSV FIELDS : [ name*, address*, postcode*, phone number, website, service types*, last updated*, services* ]   * fields are persistent 

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
  let fieldSearchQuery: string = "";
  for (let i = 0; i < fields.length; i++) {
    if (i === 0) fieldSearchQuery = (fields[i] + '%2C');
    else if (i < (fields.length - 1)) fieldSearchQuery += (fields[i] + '%2C');
    else fieldSearchQuery += fields[i];
  }
  return fieldSearchQuery
};
const formattedFields = formatFields();

async function getPlaces(sample: SampleData, searchType: 'name' | 'postcode') {
  try {
    const search = encodeURI(sample[searchType])
    const url = placeSearchUrl(search);
    const res = await axios.get(url);
    return res.data.candidates;
  } catch (error: unknown) {
    console.error((error as AxiosError).response);
  }
};

interface ResultsData {
  rhcp_id: number;
  name: string;
  place_match: boolean;
  place_id?: string;
  place_details?: boolean;
  website_match?: boolean;
  reference_website?: string | undefined;
  results_website?: string | undefined;
};

type SampleData = typeof hcoSampleData[0];

interface GooglePlaceSearchResult {
  formatted_address: string
  place_id: string
  name: string
}

function matchAddress(sampleData: SampleData, searchData: GooglePlaceSearchResult[]) {
  return searchData.find(result => result.formatted_address.includes(sampleData.postcode))
};

function matchWebsite(reference: string, comparison?: string) {
  if (comparison === undefined) return false;
  const sampleData = cleanUrl(reference);
  const searchData = cleanUrl(comparison);
  return matchString(sampleData, searchData) || matchString(searchData, sampleData);
}

function matchString(reference: string, comparison: string) {
  return reference.includes(comparison)
};

function cleanUrl(url: string) {
  let cleanUrl = url.toLowerCase()
    .replace('https://', '')
    .replace('http://', '')
    .replace('www.', '')
    .replace('/', '')
  return cleanUrl
};

async function matchSearch(sample: SampleData) {
  const searchResults = await getPlaces(sample, 'name');

  const matchedAddress = matchAddress(sample, searchResults)
  let resultDetails, matchedWebsite
  if (matchedAddress) resultDetails = await getDetails(matchedAddress.place_id);
  if (sample.website) matchedWebsite = matchWebsite(sample.website, resultDetails.website)
  // matchedWebsite = matchWebsite(sample.website, resultDetails.website)

  const result: ResultsData = {
    rhcp_id: sample.id,
    name: sample.name,
    place_id: matchedAddress?.place_id,
    place_match: !!matchedAddress?.place_id,
    place_details: !!resultDetails?.website,
    reference_website: sample.website,
    results_website: resultDetails?.website,
    website_match: matchedWebsite,
  };

  return result;
};

async function searchSampleData() {
  const resultsPromises = hcoSampleData.map((sample) => matchSearch(sample));

  const resultsOutput = await Promise.all(resultsPromises)
  console.log("resultsOutput", resultsOutput);

  calculateResultPerc(resultsOutput)
  return resultsOutput
}
searchSampleData();

async function getDetails(placeId: string) {
  try {
    const url = detailsSearchUrl(placeId);
    const res = await axios.get(url);
    return res.data.result;
  } catch (error: unknown) {
    console.error((error as AxiosError).response);
  }
};

import * as fs from 'fs/promises';

async function createCsv() {
  const items = await searchSampleData()
  const header = Object.keys(items[0]) as (keyof ResultsData)[];
  const csv = [
    header.join(','), // header row first
    ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replaceCsvValues)).join(','))
  ].join('\r\n')


  await fs.writeFile('output.csv', csv,)
}

function replaceCsvValues(key: any, value: any) {
  return value === null ? '' 
    : value === true ? 1
    : value === false ? 0
    : value;
}

createCsv()

function calculateResultPerc(resultsOutput: ResultsData[]) {
  let placeMatchPerc = percentage(resultsOutput.filter(result => result.place_match).length, resultsOutput.length)
  let placeDetailsPerc = percentage(resultsOutput.filter(result => result.place_details).length, resultsOutput.filter(result => result.place_match).length)
  let websiteMatchPerc = percentage(resultsOutput.filter(result => result.website_match).length, resultsOutput.filter(result => result.reference_website).length)
  let websiteDiscoveredPerc = percentage(resultsOutput.filter(result => result.results_website && !result.reference_website).length, resultsOutput.filter(result => !result.reference_website).length)

  const resultsPerc = {
    placeMatchPerc,
    placeDetailsPerc,
    websiteMatchPerc,
    websiteDiscoveredPerc
  } 

  console.log(resultsPerc);
}

function percentage(value: number, total: number) {
  const result = Math.floor((value / total) * 100);
  return Math.abs(result);
}
