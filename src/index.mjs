import fetch from "node-fetch";
import log from './log.mjs';
import { getDnsRecords, updateDnsRecords } from "./godaddy.mjs";

import config from '../config.json' assert { "type": "json" }

async function getPublicIp(config) {
  const response = await fetch(config.ipify);
  return (await response.json()).ip;
}

async function check(domain, hosts) {
  const ip = await getPublicIp(config);
  log(ip)

  const records = await getDnsRecords(domain, hosts);
  log(records)

  if (!records || !records.length) {
    return void log(`There are no DNS records found for ${hostname}`);
  }
  records.map(async record => {
    let hostname = `${record.host}.${domain}`;
    log(`Checking ${hostname}...`);

    const response = record[0];
    const host = response.name;

    if (response.type !== 'A') {
      return void log(`Unexpected Type record ${response.type} returned for ${hostname}`);
    }

    if (!hosts.includes(response.name)) {
      return void log(`Unexpected Name record ${response.name} returned for ${hostname}`);
    }

    if (response.data === ip) {
      return void log(`The current public IP address matches GoDaddy DNS record: ${ip}, no update needed.`);
    }

    log(`The current public IP address ${ip} does not match GoDaddy DNS record: ${response.data}.`);
    const data = [{ data: ip, ttl: 86400 }];
    await updateDnsRecords(domain, host, data);

    const records2 = await getDnsRecords(domain, [host]);
    log(`Successfully updated DNS records to:`, records2);
  });
}

check(config.domain, config.host).catch(err => log(err.message))
