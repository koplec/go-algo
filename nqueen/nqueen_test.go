package nqueen

import "testing"

func TestSolveRow(t *testing.T) {
	queens := solveRow(1, 3)
	if 3 != len(queens) {
		t.Errorf("got:%v, want:%v\n", len(queens), 3)
		t.Errorf(" queens: %v\n", queens)
	}

	queens = solveRow(2, 3)
	if 2 != len(queens) {
		t.Errorf("got:%v, want:%v\n", len(queens), 2)
		t.Errorf(" queens: %v\n", queens)
	}

	queens = solveRow(3, 3)
	if 0 != len(queens) {
		t.Errorf("got:%v, want:%v\n", len(queens), 0)
		t.Errorf(" queens: %v\n", queens)
	}

	queens = solveRow(4, 4)
	if 2 != len(queens) {
		t.Errorf("got:%v, want:%v\n", len(queens), 2)
		t.Errorf(" queens: %v\n", queens)
	}

	queens = solveRow(8, 8)
	if 92 != len(queens) {
		t.Errorf("got:%v, want:%v\n", len(queens), 92)
		t.Errorf(" queens: %v\n", queens)
	}
}
