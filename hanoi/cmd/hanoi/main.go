package main

import (
	"algo/hanoi"
	"log"
	"os"
	"strconv"
)

func main() {
	if len(os.Args) != 2 {
		log.Fatal("usage: hanoi (num of boards)")
		os.Exit(1)
	}
	k, _ := strconv.Atoi(os.Args[1])
	ops := hanoi.Solve(k)
	hanoi.PrintOperations(ops)
}
