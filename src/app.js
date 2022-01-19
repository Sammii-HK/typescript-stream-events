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
let urls = {};
function matchWebsite(reference, comparison) {
    if (comparison === undefined)
        return false;
    const sampleData = cleanUrl(reference);
    let searchData = cleanUrl(comparison);
    urls = {
        sampleData,
        searchData
    };
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
    if (matchedAddress) {
        resultDetails = await getDetails(matchedAddress.place_id);
        matchedWebsite = matchWebsite(sample.website, resultDetails.website);
    }
    ;
    const result = {
        rhcp_id: sample.id,
        name: sample.name,
        place_id: matchedAddress?.place_id,
        place_match: !!matchedAddress?.place_id,
        place_details: !!resultDetails?.website,
        website_match: matchedWebsite,
        urls: urls,
    };
    return result;
}
;
async function searchSampleData() {
    const resultsPromises = hco_data_1.sampleData.map((sample) => matchSearch(sample));
    const resultsOutput = await Promise.all(resultsPromises);
    console.log("resultsOutput", resultsOutput);
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
        ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], ((key, value) => value === null ? '' : value))).join(','))
    ].join('\r\n');
    await fs.writeFile('output.csv', csv);
    console.log("csv", csv);
}
createCsv();
