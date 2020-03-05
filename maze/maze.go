package maze

import (
	"errors"
	"fmt"
	"log"
	"math/rand"
)

const (
	DIR_RIGHT int = 0
	DIR_DOWN  int = 1
	DIR_LEFT  int = 2
	DIR_UP    int = 3

	OCCUPIED int = 1
	EMPTY    int = 0
)

type MazeMap struct {
	ary [][]int
	Row int
	Col int
}

/**
 * 棒倒し法での迷路づくり
 */
func Create(row, col int) (*MazeMap, error) {
	mazeMap, err := InitMazeMap(row, col)
	//順番に棒を倒していく
	err = mazeMap.doCreateMaze()
	return mazeMap, err
}

func InitMazeMap(row, col int) (*MazeMap, error) {
	if row%2 == 0 || col%2 == 0 {
		err := errors.New("row and col must be odd")
		return nil, err
	}
	ary := make([][]int, row)
	for i := 0; i < row; i++ {
		ary[i] = make([]int, col)
		for j := 0; j < col; j++ {
			ary[i][j] = EMPTY
		}
	}
	//壁
	for j := 0; j < col; j++ {
		ary[0][j] = OCCUPIED
		ary[row-1][j] = OCCUPIED
	}
	for i := 1; i < row-1; i++ {
		ary[i][0] = OCCUPIED
		ary[i][col-1] = OCCUPIED
	}
	maze := MazeMap{
		ary: ary,
		Row: row,
		Col: col,
	}
	//棒を立てる
	maze.iterateRods(func(i, j int, ary [][]int) error {
		ary[i][j] = OCCUPIED
		return nil
	})
	return &maze, nil
}

func (m *MazeMap) isEmpty(i, j int) bool {
	ary := m.ary
	return ary[i][j] == EMPTY
}

func (m *MazeMap) iterateRods(proc func(i, j int, ary [][]int) error) error {
	row := m.Row
	col := m.Col
	ary := m.ary
	for i := 2; i <= row-2; i = i + 2 {
		for j := 2; j <= col-2; j = j + 2 {
			err := proc(i, j, ary)
			if err != nil {
				return err
			}
		}
	}
	return nil
}

func (m *MazeMap) doCreateMaze() error {
	return m.iterateRods(func(i, j int, ary [][]int) error {
		if i == 2 {
		L0:
			for {
				a := rand.Intn(4)
				log.Printf("(i,j)=(%d,%d) , a=%d", i, j, a)
				switch a {
				case DIR_RIGHT:
					if m.isEmpty(i, j+1) {
						m.ary[i][j+1] = OCCUPIED
						break L0
					}
				case DIR_DOWN:
					if m.isEmpty(i+1, j) {
						m.ary[i+1][j] = OCCUPIED
						break L0
					}
				case DIR_LEFT:
					if m.isEmpty(i, j-1) {
						m.ary[i][j-1] = OCCUPIED
						break L0
					}
				case DIR_UP:
					if m.isEmpty(i-1, j) {
						m.ary[i-1][j] = OCCUPIED
						break L0
					}
				}
			}
			log.Println("for L0 END")
		} else {
		L1:
			for {
				a := rand.Intn(3)
				log.Printf("(i,j)=(%d,%d) , a=%d", i, j, a)
				switch a {
				case DIR_RIGHT:
					if m.isEmpty(i, j+1) {
						m.ary[i][j+1] = OCCUPIED
						break L1
					}
				case DIR_DOWN:
					if m.isEmpty(i+1, j) {
						m.ary[i+1][j] = OCCUPIED
						break L1
					}
				case DIR_LEFT:
					if m.isEmpty(i, j-1) {
						m.ary[i][j-1] = OCCUPIED
						break L1
					}
				}
			}
			log.Println("for L1 END2")
		}
		return nil
	})
}

func (m *MazeMap) DebugPrintMaze() {
	row := m.Row
	col := m.Col
	ary := m.ary
	for i := 0; i < row; i++ {
		for j := 0; j < col; j++ {
			val := ary[i][j]
			if val == OCCUPIED {
				fmt.Print("■")
			}
			if val == EMPTY {
				fmt.Print(" ")
			}
			if j == col-1 {
				fmt.Println("")
			}
		}
	}

}
