"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const axios_1 = require("axios");
const hco_data_1 = require("./hco-data"); // RHCP CSV FIELDS : [ name*, address*, postcode*, phone number, website, service types*, last updated*, services* ]   * fields are persistent 
const apiKey = process.env.GOOGLE_PLACES_API_KEY;
const placeSearchUrl = (searchInput) => `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
    `?fields=name%2Cplace_id%2Cformatted_address` +
    `&input=${searchInput}` +
    `&inputtype=textquery` +
    `&key=${apiKey}`;
const detailsSearchUrl = (placeId) => `https://maps.googleapis.com/maps/api/place/details/json` +
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
    let fieldSearchQuery = "";
    for (let i = 0; i < fields.length; i++) {
        if (i === 0)
            fieldSearchQuery = (fields[i] + '%2C');
        else if (i < (fields.length - 1))
            fieldSearchQuery += (fields[i] + '%2C');
        else
            fieldSearchQuery += fields[i];
    }
    return fieldSearchQuery;
};
const formattedFields = formatFields();
async function getPlaces(sample, searchType) {
    try {
        const search = encodeURI(sample[searchType]);
        const url = placeSearchUrl(search);
        const res = await axios_1.default.get(url);
        return res.data.candidates;
    }
    catch (error) {
        console.error(error.response);
    }
}
;
;
function matchAddress(sampleData, searchData) {
    return searchData.find(result => result.formatted_address.includes(sampleData.postcode));
}
;
function matchWebsite(reference, comparison) {
    if (comparison === undefined)
        return false;
    const sampleData = cleanUrl(reference);
    const searchData = cleanUrl(comparison);
    return matchString(sampleData, searchData) || matchString(searchData, sampleData);
}
function matchString(reference, comparison) {
    return reference.includes(comparison);
}
;
function cleanUrl(url) {
    let cleanUrl = url.toLowerCase()
        .replace('https://', '')
        .replace('http://', '')
        .replace('www.', '')
        .replace('/', '');
    return cleanUrl;
}
;
async function matchSearch(sample) {
    const searchResults = await getPlaces(sample, 'name');
    const matchedAddress = matchAddress(sample, searchResults);
    let resultDetails, matchedWebsite;
    if (matchedAddress)
        resultDetails = await getDetails(matchedAddress.place_id);
    if (sample.website)
        matchedWebsite = matchWebsite(sample.website, resultDetails.website);
    // matchedWebsite = matchWebsite(sample.website, resultDetails.website)
    const result = {
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
}
;
async function searchSampleData() {
    const resultsPromises = hco_data_1.sampleData.map((sample) => matchSearch(sample));
    const resultsOutput = await Promise.all(resultsPromises);
    console.log("resultsOutput", resultsOutput);
    calculateResultPerc(resultsOutput);
    return resultsOutput;
}
searchSampleData();
async function getDetails(placeId) {
    try {
        const url = detailsSearchUrl(placeId);
        const res = await axios_1.default.get(url);
        return res.data.result;
    }
    catch (error) {
        console.error(error.response);
    }
}
;
const fs = require("fs/promises");
async function createCsv() {
    const items = await searchSampleData();
    const header = Object.keys(items[0]);
    const csv = [
        header.join(','),
        ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replaceCsvValues)).join(','))
    ].join('\r\n');
    await fs.writeFile('output.csv', csv);
}
function replaceCsvValues(key, value) {
    return value === null ? ''
        : value === true ? 1
            : value === false ? 0
                : value;
}
createCsv();
function calculateResultPerc(resultsOutput) {
    // throw new Error('Function not implemented.');
    let placeMatchPerc = percentage(resultsOutput.filter(result => result.place_match).length, resultsOutput.length);
    let placeDetailsPerc = percentage(resultsOutput.filter(result => result.place_details).length, resultsOutput.filter(result => result.place_match).length);
    let websiteMatchPerc = percentage(resultsOutput.filter(result => result.website_match).length, resultsOutput.filter(result => result.reference_website).length);
    let websiteDiscoveredPerc = percentage(resultsOutput.filter(result => result.results_website && !result.reference_website).length, resultsOutput.filter(result => !result.reference_website).length);
    const resultsPerc = {
        placeMatchPerc,
        placeDetailsPerc,
        websiteMatchPerc,
        websiteDiscoveredPerc
    };
    console.log(resultsPerc);
}
function percentage(value, total) {
    const result = Math.floor((value / total) * 100);
    return Math.abs(result);
}
