import db from './db';
import express from 'express';
import websocket from './websocket';

import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';

const logs: string[] = [];

async function logger (req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.headers['server-side-rendering'] === 'true') {
    return next();
  }

  const message = `[${new Date().toLocaleString()}] ${req.headers['x-real-ip'] || req.ip} - ${req.method} ${req.url} - ${req.headers['user-agent']}`;
  const userAgent = new UAParser(req.headers['user-agent']);

  // Write log to stdout, and push to the log array.
  logs.push(message);

  // Keep the log array size not to big
  while (logs.length > 50) {
    logs.shift();
  }

  // Broadcast to all those connected websocket clients.
  websocket.io.emit('log', message);

  // Write log to database
  await db.prepare();

  // We do NOT need to await here.
  if (!/^\/(dist|static|api\/media)/.test(req.url)) {
    const ipAddr = req.headers['x-real-ip'] || req.ip || '0.0.0.0';
    db.conn.collection('logs').insertOne({
      time: new Date(),
      ip: Object.assign({
        addr: ipAddr,
      }, geoip.lookup(Array.isArray(ipAddr) ? ipAddr[0] : ipAddr) || {}),
      method: req.method,
      url: req.url,
      referer: req.headers['referer'],
      userAgent: userAgent.getResult(),
    }).catch(error => {
      console.error(error);
    });
  }

  // Continue.
  next();
}

logger.logs = logs;

export default logger;
