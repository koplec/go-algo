package main

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
)

func main() {
	if len(os.Args) != 2 {
		log.Fatal("usage: eight-queen (num of queens)")
		os.Exit(1)
	}
	k, _ := strconv.Atoi(os.Args[1])
	queens := solve(k)
	log.Printf("queens: %s\n", queens)
}

type Queen struct {
	I int
	J int
}

func (q *Queen) String() string {
	return fmt.Sprintf("Q[%d, %d]", q.I, q.J)
}

type Queens []*Queen

func (qs Queens) String() string {
	strs := []string{}
	for _, q := range qs {
		strs = append(strs, fmt.Sprintf("[%d, %d]", q.I, q.J))
	}
	return "Queens[" + strings.Join(strs, " ") + "]"
}

func solve(k int) []Queens {
	if k == 1 {
		q := &Queen{0, 0}
		queens := Queens([]*Queen{q})
		return []Queens{queens}
	}
	if k == 2 || k == 3 {
		return nil
	}
	if k == 4 {
		q0 := &Queen{0, 2}
		q1 := &Queen{1, 0}
		q2 := &Queen{2, 3}
		q3 := &Queen{3, 1}
		queens0 := Queens([]*Queen{q0, q1, q2, q3})

		q0 = &Queen{0, 1}
		q1 = &Queen{1, 3}
		q2 = &Queen{2, 0}
		q3 = &Queen{3, 2}
		queens1 := Queens([]*Queen{q0, q1, q2, q3})
		return []Queens{queens0, queens1}
	}
	//4パターンで検討
	queenList := solve(k - 1)
	retQueens := make([]Queens, 0)
	for _, queens0 := range queenList {
		//新しいqueenが右下にある場合
		i := k - 1
		j := k - 1
		success := true
		for _, q := range queens0 {
			if q.I == q.J {
				success = false
			}
		}
		if success {
			queens := append(queens0, &Queen{i, j})
			retQueens = append(retQueens, queens)
		}
		//新しいqueenが右上にある場合
		queens := make(Queens, 0)
		queens = append(queens, &Queen{0, k - 1})
		success = true
		for _, q := range queens0 {
			qi := q.I + 1
			qj := q.J
			if qi+qj == k-1 {
				success = false
			} else {
				queens = append(queens, &Queen{qi, qj})
			}
		}
		if success {
			retQueens = append(retQueens, queens)
		}
		//新しいqueenが左上にある場合
		queens = make(Queens, 0)
		queens = append(queens, &Queen{0, 0})
		success = true
		for _, q := range queens0 {
			qi := q.I + 1
			qj := q.J + 1
			if qi == qj {
				success = false
			} else {
				queens = append(queens, &Queen{qi, qj})
			}
		}
		if success {
			retQueens = append(retQueens, queens)
		}
		//新しいqueenが左下にある場合
		queens = make(Queens, 0)
		queens = append(queens, &Queen{k - 1, 0})
		success = true
		for _, q := range queens0 {
			qi := q.I
			qj := q.J + 1
			if qi+qj == k-1 {
				success = false
			} else {
				queens = append(queens, &Queen{qi, qj})
			}
		}
		if success {
			retQueens = append(retQueens, queens)
		}
	}
	return retQueens
}
