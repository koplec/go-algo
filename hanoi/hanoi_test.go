package hanoi

import (
	"testing"
)

func TestSolve(t *testing.T) {
	var boardNum int
	boardNum = 1
	ops := Solve(boardNum)
	if len(ops) != 1 {
		t.Fatalf("got:%v want:%v\n", len(ops), 1)
	}
	PrintOperations(ops)

	boardNum = 2
	ops = Solve(boardNum)
	if len(ops) != 3 {
		t.Fatalf("got:%v want:%v\n", len(ops), 3)
	}
	PrintOperations(ops)

	boardNum = 3
	ops = Solve(boardNum)
	if len(ops) != 7 {
		t.Fatalf("got:%v want:%v\n", len(ops), 7)
	}
	PrintOperations(ops)
}
