package main

import (
	"fmt"
	"log"
)

func maxInt(a, b int) int {
	if a > b {
		return a
	} else {
		return b
	}
}

type Item struct {
	Name   string
	Weight int
	Value  int
}

func NewItem(name string, weight, value int) *Item {
	return &Item{
		Name:   name,
		Weight: weight, Value: value,
	}
}

type GreedySolver struct {
	Items []*Item
	Memos map[GreedySolverMemoKey]*GreedySolverMemo
}
type GreedySolverMemo struct {
	Key   GreedySolverMemoKey
	Value int
	Items []*Item
}
type GreedySolverMemoKey struct {
	ItemIndex int
	Weight    int
}

func NewGreedySolverMemo(itemIndex, weight int) *GreedySolverMemo {
	key := GreedySolverMemoKey{ItemIndex: itemIndex, Weight: weight}
	return &GreedySolverMemo{
		Key:   key,
		Items: make([]*Item, 0),
	}
}

var EMPTY_GREEDY_SOLVER_MEMO = GreedySolverMemo{
	Value: 0, Items: nil,
}

func NewGreedySolver(items []*Item) *GreedySolver {
	return &GreedySolver{
		Items: items,
		Memos: make(map[GreedySolverMemoKey]*GreedySolverMemo),
	}
}

//solveの答えをメモしておく
func (s *GreedySolver) AddMemo(memo *GreedySolverMemo) {
	key := memo.Key
	s.Memos[key] = memo
}
func (s *GreedySolver) GetMemo(itemIndex, weight int) *GreedySolverMemo {
	key := GreedySolverMemoKey{ItemIndex: itemIndex, Weight: weight}
	m, ok := s.Memos[key]
	if !ok {
		return nil
	}
	return m
}

func (s *GreedySolver) Solve(totalWeight int) *GreedySolverMemo {
	// log.Printf("info: GreedySolver BEGIN totalWeight:%d\n", totalWeight)
	return s.iterGreedy(len(s.Items)-1, totalWeight)
}
func (s *GreedySolver) iterGreedy(itemIndex int, weight int) *GreedySolverMemo {
	// fmt.Printf("CALL iterGreedy(%d, %d)\n", itemIndex, weight)
	if itemIndex < 0 || weight <= 0 {
		return &EMPTY_GREEDY_SOLVER_MEMO
	}

	memo := s.GetMemo(itemIndex, weight)
	if memo != nil {
		return memo
	}

	memo = NewGreedySolverMemo(itemIndex, weight)
	item := s.Items[itemIndex]
	if item.Weight > weight {
		return s.iterGreedy(itemIndex-1, weight)
	} else { //item追加されるかも
		memoA := s.iterGreedy(itemIndex-1, weight)
		valueA := memoA.Value
		memoB := s.iterGreedy(itemIndex-1, weight-item.Weight)
		valueB := memoB.Value + item.Value
		if valueA > valueB {
			return memoA
		} else {
			itemsB := memoB.Items
			memo.Items = append(memo.Items, itemsB...)
			memo.Items = append(memo.Items, item)
			memo.Value = valueB
			s.AddMemo(memo)
			return memo
		}
	}
}

func main() {
	items := make([]*Item, 5)
	items[0] = NewItem("A", 1, 3)
	items[1] = NewItem("B", 2, 4)
	items[2] = NewItem("C", 1, 5)
	items[3] = NewItem("D", 3, 1)
	items[4] = NewItem("E", 4, 10)
	log.Printf("items.length = %d\n", len(items))

	s := NewGreedySolver(items)
	memo := s.Solve(10)
	fmt.Printf("itemName: ")
	for _, item := range memo.Items {
		fmt.Printf(" %s ", item.Name)
	}
	fmt.Println("")

	fmt.Printf("total Value: %d", memo.Value)
}
