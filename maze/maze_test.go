package maze

import (
	"encoding/json"
	"log"
	"testing"
)

func TestCreateMaze(t *testing.T) {
	maze, err := Create(11, 13)
	if err != nil {
		t.Fatal("create maze fail:", err)
	}
	maze.DebugPrintMaze()
}

func TestJsonMarshal(t *testing.T) {
	maze, err := Create(11, 13)
	if err != nil {
		t.Fatal("create maze fail:", err)
	}
	bytes, _ := json.Marshal(maze)
	str := string(bytes)
	log.Printf("maze json -> %s\n", str)
}

func TestSolveMaze(t *testing.T) {

	maze := New([][]int{
		{1, 1, 1},
		{1, 0, 1},
		{1, 1, 1},
	})

	paths, _ := maze.solve([]int{1, 1}, []int{1, 1})
	log.Printf("solve1 : %v\n", paths)
	if len(paths) != 1 {
		t.Fatalf("paths fail : %v\n", paths)
	}

	maze2 := New([][]int{
		{1, 1, 1},
		{1, 0, 1},
		{1, 0, 1},
		{1, 1, 1},
	})

	paths2, _ := maze2.solve([]int{1, 1}, []int{2, 1})
	if len(paths2) != 2 {
		t.Fatalf("paths fail : %v\n", paths2)
	}

	maze3 := New([][]int{
		{1, 1, 1, 1, 1},
		{1, 0, 1, 0, 1},
		{1, 0, 0, 0, 1},
		{1, 0, 1, 0, 1},
		{1, 1, 1, 1, 1},
	})

	paths3, _ := maze3.solve([]int{1, 1}, []int{3, 3})
	log.Printf("solve3 : %v\n", paths3)
	if len(paths3) != 5 {
		t.Fatalf("paths fail : %v\n", paths3)
	}

	maze4 := New([][]int{
		{1, 1, 1, 1, 1},
		{1, 0, 1, 0, 1},
		{1, 0, 0, 0, 1},
		{1, 0, 1, 0, 1},
		{1, 0, 1, 0, 1},
		{1, 0, 0, 0, 1},
		{1, 0, 1, 0, 1},
		{1, 0, 1, 0, 1},
		{1, 0, 0, 0, 1},
		{1, 0, 1, 0, 1},
		{1, 1, 1, 1, 1},
	})

	paths4, _ := maze4.solve([]int{1, 1}, []int{4, 3})
	if len(paths4) != 6 {
		t.Fatalf("paths4 fail : %v\n", paths4)
	}

	maze5 := New([][]int{
		{1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
		{1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1},
		{1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1},
		{1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1},
		{1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1},
		{1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1},
		{1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
	})

	paths5, _ := maze5.solve([]int{2, 7}, []int{1, 4})
	if len(paths5) != 9 {
		t.Fatalf("paths5 fail : %v\n", paths5)
	}
}
