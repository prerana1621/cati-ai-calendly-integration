/**
 * Calendly Integration
 */

const axios = require("axios");
const Integration = require("../models/Integration");

const BASE_URL = "https://api.calendly.com";

/**
 * Test the connection with provided config
 * @param {Object} config - { apiKey, ... }
 * @returns {{ success: boolean, message: string }}
 */
async function test(config) {
  try {
    await axios.get(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${config.apiKey}` },
    });
    return { success: true, message: "Connected" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Execute a tool action
 * @param {string} action - Action name (e.g., 'search', 'create')
 * @param {Object} params - Action parameters
 * @param {string} userId - User ID for credential lookup
 * @returns {{ success: boolean, data: any, error?: string }}
 */
async function execute(action, params, userId) {
  try {
    const integration = await Integration.findOne({ userId, type: "calendly" });
    const headers = {
      Authorization: `Bearer ${integration.apiKey}`,
      "Content-Type": "application/json",
    };

    if (action === "calendly_list_event_types") {
      const user = await axios.get(`${BASE_URL}/users/me`, { headers });
      const events = await axios.get(
        `${BASE_URL}/event_types?user=${user.data.resource.uri}`,
        { headers },
      );
      return { success: true, data: events.data.collection };
    }

    if (action === "calendly_create_invitee") {
      const link = await axios.post(
        `${BASE_URL}/scheduling_links`,
        {
          max_event_count: 1,
          owner: params.event_type_url,
          owner_type: "EventType",
        },
        { headers },
      );
      return { success: true, data: link.data.resource };
    }

    if (action === "check_availability") {
      const avail = await axios.get(`${BASE_URL}/event_type_available_times`, {
        headers,
        params: {
          event_type: params.event_type_url,
          start_time: params.start_time,
          end_time: params.end_time,
        },
      });
      return { success: true, data: avail.data.collection };
    }

    return { success: false, error: "Unknown action" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { test, execute };
