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

	maze2 := New([][]int{
		{1, 1, 1},
		{1, 0, 1},
		{1, 0, 1},
		{1, 1, 1},
	})

	paths2, _ := maze2.solve([]int{1, 1}, []int{2, 1})
	log.Printf("solve2 : %v\n", paths2)

	maze3 := New([][]int{
		{1, 1, 1, 1, 1},
		{1, 0, 1, 0, 1},
		{1, 0, 0, 0, 1},
		{1, 0, 1, 0, 1},
		{1, 1, 1, 1, 1},
	})

	paths3, _ := maze3.solve([]int{1, 1}, []int{3, 3})
	log.Printf("solve3 : %v\n", paths3)

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
	log.Printf("solve4 : %v\n", paths4)

}
