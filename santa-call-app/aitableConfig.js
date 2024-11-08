const axios = require('axios');

const AITABLE_API_BASE = 'https://api.aitable.ai/fusion/v1';
const DATASHEET_ID = 'your_datasheet_id_here'; // Replace with your datasheet ID
const API_TOKEN = 'your_api_token_here'; // Replace with your API token

const apiClient = axios.create({
  baseURL: `${AITABLE_API_BASE}/datasheets/${DATASHEET_ID}/records`,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_TOKEN}`,
  },
});

module.exports = apiClient;