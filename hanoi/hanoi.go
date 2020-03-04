package hanoi

import "fmt"

type PlaceName string

const (
	PLACE_A PlaceName = "A"
	PLACE_B           = "B"
	PLACE_C           = "C"
)

type Op struct {
	Board int
	From  PlaceName
	To    PlaceName
}

func (op *Op) String() string {
	return fmt.Sprintf("%d : %s -> %s", op.Board, op.From, op.To)
}

func NewOp(b int, from PlaceName, to PlaceName) *Op {
	return &Op{
		Board: b, From: from, To: to,
	}
}

func Solve(boardNum int) []*Op {
	return solve(boardNum, PLACE_A, PLACE_C)
}

func solve(boardNum int, from PlaceName, to PlaceName) []*Op {
	ret := make([]*Op, 0)
	if boardNum == 1 {
		op := NewOp(1, from, to)
		ret = append(ret, op)
		return ret
	} else {
		other := otherPlace(from, to)

		ret = append(ret, solve(boardNum-1, from, other)...)
		ret = append(ret, NewOp(boardNum, from, to))
		ret = append(ret, solve(boardNum-1, other, to)...)
	}
	return ret
}

func otherPlace(from PlaceName, to PlaceName) PlaceName {
	if (from == PLACE_A && to == PLACE_B) || (from == PLACE_B && to == PLACE_A) {
		return PLACE_C
	} else if (from == PLACE_A && to == PLACE_C) || (from == PLACE_C && to == PLACE_A) {
		return PLACE_B
	} else {
		return PLACE_A
	}
}

func PrintOperations(ops []*Op) {
	fmt.Printf("operation count: %d\n", len(ops))
	for i, op := range ops {
		fmt.Printf("[%d] %s\n", i+1, op)
	}
}
