package nqueen

import (
	"fmt"
	"strings"

	autil "algo/util"
)

type Queen struct {
	I int
	J int
}

func (q *Queen) String() string {
	return fmt.Sprintf("Q[%d, %d]", q.I, q.J)
}

type Queens struct {
	queens []*Queen
}

/*
 * queenが一つあるqueensを作る
 */
func NewQueens(i, j int) *Queens {
	ret := Queens{queens: make([]*Queen, 0)}
	ret.DoAdd(i, j)
	return &ret
}

func (qs *Queens) String() string {
	strs := []string{}
	for _, q := range qs.queens {
		strs = append(strs, fmt.Sprintf("[%d, %d]", q.I, q.J))
	}
	return "Queens[" + strings.Join(strs, " ") + "]"
}
func (src *Queens) Copy() (dest *Queens) {
	dest = &Queens{queens: make([]*Queen, len(src.queens))}
	copy(dest.queens, src.queens)
	return dest
}
func (qs *Queens) Queens() []Queen {
	ret := make([]Queen, 0)
	for _, q := range qs.queens {
		ret = append(ret, *q)
	}
	return ret
}
func (qs *Queens) MakeMap() [][]string {
	k := len(qs.queens)
	ary := make([][]string, k)
	for i := 0; i < k; i++ {
		ary[i] = make([]string, k)
		for j := 0; j < k; j++ {
			ary[i][j] = "X"
		}
	}
	for _, q := range qs.queens {
		ary[q.I][q.J] = "O"
	}
	return ary
}

/**
 * queensのqueenを追加する
 * ただし、追加したqueenは、これまでのqueenの利きと重複がないようにする
 */
func (qs *Queens) DoAdd(i, j int) {
	qs.queens = append(qs.queens, &Queen{i, j})
}

func (qs *Queens) CheckAdd(i, j int) bool {
	for _, q := range qs.queens {
		qi := q.I
		qj := q.J
		if i == qi {
			return false
		}
		if j == qj {
			return false
		}
		ii := absInt(i - qi)
		jj := absInt(j - qj)
		if ii == jj {
			return false
		}
	}
	return true
}

/**
 * r行, n列のboardにr個のqueenを矛盾なく並べた結果の一覧
 * 必ず1行に1個のqueenを置く
 * 列は被らないようにする
 */
func solveRow(r int, n int) []*Queens {
	if r == 1 {
		ret := make([]*Queens, 0)
		for j := 0; j < n; j++ {
			queens := NewQueens(0 /*r-1*/, j)
			ret = append(ret, queens)
		}
		return ret
	}
	queensList0 := solveRow(r-1, n)

	ret := make([]*Queens, 0)
	for _, queens0 := range queensList0 {
		for j := 0; j < n; j++ {
			if queens0.CheckAdd(r-1, j) {
				queens1 := queens0.Copy()
				queens1.DoAdd(r-1, j)
				ret = append(ret, queens1)
			}
		}
	}
	return ret
}

func Solve(n int) []*Queens {
	return solveRow(n, n)
}

func absInt(i int) int {
	return autil.AbsInt(i)
}
