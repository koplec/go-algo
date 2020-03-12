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
