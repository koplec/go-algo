package main

import (
	"algo/nqueen"
	"fmt"
	"log"
	"os"
	"strconv"
)

func main() {
	if len(os.Args) != 2 {
		log.Fatal("usage: gen-map (num of queens)")
		os.Exit(1)
	}
	k, _ := strconv.Atoi(os.Args[1])
	queensList := nqueen.Solve(k)
	log.Printf("queens: %s\n", queensList)

	log.Printf("start generationg image")
	for i, queens := range queensList {
		ary := queens.MakeMap()

		fmt.Printf("Queens[%d] = %s\n", i, queens)
		for i := 0; i < k; i++ {
			for j := 0; j < k; j++ {
				fmt.Print(" " + ary[i][j] + " ")
				if j == k-1 {
					fmt.Println("")
				}
			}
		}
	}
}
