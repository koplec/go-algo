package main

import "fmt"

func maxInt(a, b int) int {
	if a > b {
		return a
	} else {
		return b
	}
}

type Item struct {
	Weight int
	Value  int
}

func NewItem(w, v int) *Item {
	return &Item{
		Weight: w, Value: v,
	}
}

type GreedySolver struct {
	Items []*Item
}

func NewGreedySolver(items []*Item) *GreedySolver {
	return &GreedySolver{
		Items: items,
	}
}

func (s *GreedySolver) Solve(totalWeight int) int {
	return s.iterGreedy(len(s.Items)-1, totalWeight)
}
func (s *GreedySolver) iterGreedy(itemIndex int, weight int) int {
	if itemIndex < 0 || weight <= 0 {
		return 0
	}
	item := s.Items[itemIndex]
	if item.Weight > weight {
		return s.iterGreedy(itemIndex-1, weight)
	} else {
		a := s.iterGreedy(itemIndex-1, weight)
		b := s.iterGreedy(itemIndex-1, weight-item.Weight) + item.Value
		return maxInt(a, b)
	}
}

func main() {
	items := make([]*Item, 5)
	items[0] = NewItem(1, 3)
	items[1] = NewItem(2, 4)
	items[2] = NewItem(1, 5)
	items[3] = NewItem(3, 1)
	items[4] = NewItem(4, 10)
	s := NewGreedySolver(items)

	fmt.Printf("ans: %d", s.Solve(5))
}
