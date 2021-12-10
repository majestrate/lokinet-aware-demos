#!/usr/bin/env python3


import dns.resolver, socket

def ip_to_loki(ip):
    """
    convert a ip address in string representation to a .loki address
    """
    return socket.gethostbyaddr(ip)[0]

def get_lokinet_ip():
    """
    return the ip address of the lokinet interface
    """
    return socket.getaddrinfo("localhost.loki", 9009)[0][-1][0]

def resolve_local_address():
    """
    get our .loki address
    """
    a = dns.resolver.query('localhost.loki', 'CNAME')
    return a.rrset.to_text().split(' ')[-1]


local_addr = resolve_local_address()
local_port = 9009

serv = socket.socket()
serv.bind((local_addr, local_port))
serv.listen()

print('listening on {}:{}'.format(local_addr, local_port))
print('use "telnet {} {}" to run the demo'.format(local_addr, local_port))

while True:
    try:
        sock, addr = serv.accept()
        sock.send('init: {}\nrecip: {}\n'.format(ip_to_loki(sock.getpeername()[0]), local_addr).encode('ascii'))
        sock.close()
    except KeyboardInterrupt:
        print('closing server')
        serv.close()
        break
