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
	//ary:整数の配列, 壁は1,通路は0で表現
	Map [][]int `json:"map"`
	Row int     `json:"row"`
	Col int     `json:"col"`
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

func (m *MazeMap) solve(start, goal []int) ([][]int, error) {
	log.Printf("solve BEGIN")
	mm := m.CopyMap() //迷路の地図　すでに通ったところに印をつける（0:empty 1:occupied壁）
	row := len(mm)    //迷路の横の行の数
	col := len(mm[0]) //迷路の縦の列の数
	var cur []int     //現在位置

	queue := make([][]int, 0)     //幅優先探索で利用するqueue
	froms := make([][][]int, row) //移動元の場所を管理
	//froms initial
	for i := 0; i < row; i++ {
		r := make([][]int, row)
		for j := 0; j < col; j++ {
			r[j] = nil
		}
		froms[i] = r
	}

	//var nexts [][]int //現在位置から移動ができるところ。既に通ったところは除く

	var searchNexts = func(i, j int) [][]int {
		ret := make([][]int, 0)

		ii := i
		jj := j + 1
		if jj <= col-1 {
			if mm[ii][jj] == EMPTY {
				ret = append(ret, []int{ii, jj})
			}
		}

		ii = i
		jj = j - 1
		if jj >= 0 {
			if mm[ii][jj] == EMPTY {
				ret = append(ret, []int{ii, jj})
			}
		}

		ii = i - 1
		jj = j
		if ii >= 0 {
			if mm[ii][jj] == EMPTY {
				ret = append(ret, []int{ii, jj})
			}
		}

		ii = i + 1
		jj = j
		if jj <= row-1 {
			if mm[ii][jj] == EMPTY {
				ret = append(ret, []int{ii, jj})
			}
		}
		return ret
	}
	var searchFrom = func(i, j int) []int {
		f := froms[i][j]
		return f
	}
	var setFrom = func(toi, toj, fromi, fromj int) {
		froms[toi][toj] = []int{fromi, fromj}
	}
	var solvePath = func() [][]int {
		paths := make([][]int, 0)
		paths = append(paths, cur)
		curi := cur[0]
		curj := cur[1]
		for {
			f := searchFrom(curi, curj)
			if f == nil {
				break
			}
			curi = f[0]
			curj = f[1]
			paths = append(paths, f)
		}

		//reverse
		ret := make([][]int, 0)
		for i := len(paths) - 1; i >= 0; i-- {
			ret = append(ret, paths[i])
		}
		return ret
	}

	log.Printf("  search BEGIN")
	queue = append(queue, start)
	for len(queue) != 0 {
		cur = queue[0]
		//もしgoalだったらおしまい。
		curi := cur[0]
		curj := cur[1]
		if curi == goal[0] && curj == goal[1] {
			break
		}

		queue = queue[1:]

		//curから移動できるところを探す
		nexts := searchNexts(curi, curj)
		for i := 0; i < len(nexts); i++ {
			next := nexts[i]
			queue = append(queue, next)
			setFrom(next[0], next[1], curi, curj)
		}

		//今の場所に印をつける
		mm[curi][curj] = OCCUPIED
	}

	log.Printf("  search END")

	if cur != nil {
		log.Printf("  path BEGIN")
		paths := solvePath()
		log.Printf("  path END")
		return paths, nil
	}
	log.Printf("  cur is nil!!")
	return nil, errors.New("cur is nil")
}

func New(mazeMap [][]int) *MazeMap {
	row := len(mazeMap)
	col := len(mazeMap[0])
	maze := MazeMap{
		Map: mazeMap,
		Row: row, Col: col,
	}
	return &maze
}

func Solve(mazeMap [][]int, start []int, goal []int) (route [][]int, err error) {
	maze := New(mazeMap)
	return maze.solve(start, goal)
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
		Map: ary,
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
	ary := m.Map
	return ary[i][j] == EMPTY
}

func (m *MazeMap) CopyMap() [][]int {
	ary := m.Map
	row := len(ary)
	ret := make([][]int, row)

	for i := 0; i < row; i++ {
		c := make([]int, len(ary[i]))
		copy(c, ary[i])
		ret[i] = c
	}

	return ret
}

func (m *MazeMap) iterateRods(proc func(i, j int, ary [][]int) error) error {
	row := m.Row
	col := m.Col
	ary := m.Map
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
				//log.Printf("(i,j)=(%d,%d) , a=%d", i, j, a)
				switch a {
				case DIR_RIGHT:
					if m.isEmpty(i, j+1) {
						m.Map[i][j+1] = OCCUPIED
						break L0
					}
				case DIR_DOWN:
					if m.isEmpty(i+1, j) {
						m.Map[i+1][j] = OCCUPIED
						break L0
					}
				case DIR_LEFT:
					if m.isEmpty(i, j-1) {
						m.Map[i][j-1] = OCCUPIED
						break L0
					}
				case DIR_UP:
					if m.isEmpty(i-1, j) {
						m.Map[i-1][j] = OCCUPIED
						break L0
					}
				}
			}
			//log.Println("for L0 END")
		} else {
		L1:
			for {
				a := rand.Intn(3)
				//log.Printf("(i,j)=(%d,%d) , a=%d", i, j, a)
				switch a {
				case DIR_RIGHT:
					if m.isEmpty(i, j+1) {
						m.Map[i][j+1] = OCCUPIED
						break L1
					}
				case DIR_DOWN:
					if m.isEmpty(i+1, j) {
						m.Map[i+1][j] = OCCUPIED
						break L1
					}
				case DIR_LEFT:
					if m.isEmpty(i, j-1) {
						m.Map[i][j-1] = OCCUPIED
						break L1
					}
				}
			}
			//log.Println("for L1 END2")
		}
		return nil
	})
}

func (m *MazeMap) DebugPrintMaze() {
	row := m.Row
	col := m.Col
	ary := m.Map
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
