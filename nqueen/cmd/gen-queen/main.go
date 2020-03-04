package main

import (
	nqueen "algo/nqueen"
	"log"
	"os"
	"strconv"
)

func main() {
	if len(os.Args) != 2 {
		log.Fatal("usage: gen-queen (num of queens)")
		os.Exit(1)
	}
	k, _ := strconv.Atoi(os.Args[1])
	queens := nqueen.Solve(k)
	log.Printf("len=%d\n", len(queens))
	log.Printf("queens: %s\n", queens)
}
