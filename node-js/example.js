#!/usr/bin/env node

/// require net for the server
const net = require('net');
/// requure dns promisese for lokinet awareness
const dns = require('dns').promises;

/// make a resolver
const resolver = new dns.Resolver();
/// set resolver to use lokinet resolver
/// on windows/mac it's 127.0.0.1 on linux it's 127.3.2.1
resolver.setServers(['127.3.2.1', '127.0.0.1']);


/// succ the remote .loki address from an open socket
const socketGetRemoteLoki = async (sock) => {
  const remoteAddr = sock.remoteAddress.replace("::ffff:", "");
  const remoteNames = await resolver.reverse(remoteAddr);
  return remoteNames[0];
};

const handleConn = async (sock, ourHostname) => {
  /// get the remote .loki address of the initiator
  const remoteLoki = await socketGetRemoteLoki(sock);
  /// write the response and close the connection
  sock.write(`init: ${remoteLoki}\nrecip: ${ourHostname}\n`);
  sock.end();
};

/// our async main function
const run = async () => {
  const opts = {
    port: 9009
  };

  /// resolve our local .loki address
  opts.hostname = await resolver.resolveCname("localhost.loki");
  
  const server = net.createServer((socket) => {
    handleConn(socket, opts.hostname);
  });


  server.listen(opts, () => {
    console.log(`listening on ${opts.hostname}:${opts.port}`);
    console.log(`from a lokinet enabled machine use "telnet ${opts.hostname} ${opts.port}" to run the demo`);
  });
};

/// run the shizz
run();
