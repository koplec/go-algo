package maze

import "testing"

func TestCreateMaze(t *testing.T) {
	maze, err := Create(11, 13)
	if err != nil {
		t.Fatal("create maze fail:", err)
	}
	maze.DebugPrintMaze()
}
