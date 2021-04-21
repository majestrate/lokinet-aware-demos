package main

import (
	"fmt"
	"net"
)

/// ResdolveLocalAddress gets our local .loki address as string
func ResolveLocalAddress() (string, error) {
	return net.LookupCNAME("localhost.loki")
}

/// GetLokiAddress succs out a .loki address from a network connection
func GetLokiAddress(conn net.Conn) (host string, err error) {
	host, _, err = net.SplitHostPort(conn.RemoteAddr().String())
	if err == nil {
		var names []string
		names, err = net.LookupAddr(host)
		host = ""
		if len(names) > 0 {
			host = names[0]
		}
	}
	return
}

func main() {

	/// get our local .loki address
	localaddr, err := ResolveLocalAddress()
	if err != nil {
		panic(err)
	}

	localport := "9009"

	/// listen on our local loki address port 9009
	serv, err := net.Listen("tcp", net.JoinHostPort(localaddr, localport))
	if err != nil {
		panic(err)
	}

	defer serv.Close()
	
	fmt.Printf("listening on %s:%s\n", localaddr, localport)
	fmt.Printf("run 'telnet %s %s' to run the demo\n", localaddr, localport)
	for err == nil {
		var sock net.Conn
		sock, err = serv.Accept()
		if err != nil {
			panic(err)
		}
		remoteaddr, err := GetLokiAddress(sock)
		if err == nil {
			fmt.Fprintf(sock, "init: %s\nrecip: %s\n", remoteaddr, localaddr)
		}
		sock.Close()
	}
}
