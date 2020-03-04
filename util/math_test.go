package util

import "testing"

func TestAbsInt(t *testing.T) {
	num := 10
	a := AbsInt(num)
	if num != a {
		t.Fatalf("got:%v want:%v", a, num)
	}

	num = -20
	a = AbsInt(num)
	if a != -num {
		t.Fatalf("got:%v want:%v", a, -num)
	}
}
