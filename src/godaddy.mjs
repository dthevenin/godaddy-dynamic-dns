import auth from '../auth.json' assert { "type": "json" }
import config from '../config.json' assert { "type": "json" }
import fetch from "node-fetch";

async function requestApi(method, path, data, isJson) {
  const headers = { 'Authorization': `sso-key ${auth.key}:${auth.secret}` };
  // if (isJson) {
    headers['Content-Type'] = 'application/json';
  // }
  const uri = config.godaddy + path;
  const options = {
    method: method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    json: isJson
  };

  const response = await fetch(uri, options);

  if (response.status !== 200) {
    console.dir(response);
    throw new Error(`Request Failed. Status Code: ${response.statusCode}`);
  }

  return isJson ? response.json() : response.text();
}

/**
 * Returns records for the set host names
 *
 * @param domain the domain [string]
 * @param hosts array of host name [string[]]
 * @returns {Promise<Awaited<unknown>[]>}
 */
export const getDnsRecords = (domain, hosts) => Promise.all(hosts.map(host => {
  const path = `/v1/domains/${domain}/records/A/${host}`;
  return requestApi('GET', path, null, true);
}));

/**
 * Update records for the given host name
 *
 * @param domain the domain [string]
 * @param host host name [string]
 * @param data object
 * @returns {Promise<Promise<unknown>|Promise<void>>}
 */
export async function updateDnsRecords(domain, host, data) {
  const path = `/v1/domains/${domain}/records/A/${host}`;
  await requestApi('PUT', path, data, false);
}
