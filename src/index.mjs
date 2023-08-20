import fetch from "node-fetch";
import log from './log.mjs';
import { getDnsRecords, updateDnsRecords } from "./godaddy.mjs";

import config from '../config.json' assert { "type": "json" }

async function getPublicIp(config) {
  const response = await fetch(config.ipify);
  const data = await response.json();
  if (!data.ip) {
    throw new Error(`Unsupported data format: ${data}`)
  }
  return data.ip;
}

async function check(domain, hosts) {
  const ip = await getPublicIp(config);
  const records = await getDnsRecords(domain, hosts);

  if (!records || !records.length) {
    throw new Error(`There are no DNS records found for ${hosts} on domain ${domain}`);
  }
  await Promise.all(records.map(async record => {
    const response = record[0];
    const host = response.name;

    let hostname = `${host}.${domain}`;
    log(`Checking ${hostname}...`);

    if (response.type !== 'A') {
      throw new Error(`Unexpected Type record ${response.type} returned for ${hostname}`);
    }

    if (!hosts.includes(response.name)) {
      throw new Error(`Unexpected Name record ${response.name} returned for ${hostname}`);
    }

    if (response.data === ip) {
      log(`The current public IP address matches GoDaddy DNS record: ${ip}, no update needed.`);
      return;
    }

    log(`The current public IP address ${ip} does not match GoDaddy DNS record: ${response.data}.`);
    const data = [{ data: ip, ttl: 86400 }];
    await updateDnsRecords(domain, host, data);

    const records2 = await getDnsRecords(domain, [host]);
    log(`Successfully updated DNS records to:`, records2);
  }));
}

check(config.domain, config.host).catch(err => log(err.message))
