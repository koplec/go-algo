package hanoi

import (
	"fmt"
	"testing"
)

func TestSolve(t *testing.T) {
	var boardNum int
	boardNum = 1
	ops := Solve(boardNum)
	if len(ops) != 1 {
		t.Fatalf("got:%v want:%v\n", len(ops), 1)
	}
	printOperations(ops)

	boardNum = 2
	ops = Solve(boardNum)
	if len(ops) != 3 {
		t.Fatalf("got:%v want:%v\n", len(ops), 3)
	}
	printOperations(ops)

	boardNum = 3
	ops = Solve(boardNum)
	if len(ops) != 7 {
		t.Fatalf("got:%v want:%v\n", len(ops), 7)
	}
	printOperations(ops)
}

func printOperations(ops []*Op) {
	fmt.Printf("BEGIN OPERATION\n")
	for i, op := range ops {
		fmt.Printf("[%d] %s\n", i+1, op)
	}
}
