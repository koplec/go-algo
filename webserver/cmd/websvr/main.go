package main

import (
	"net/http"

	maze "algo/maze"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()

	//Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	//Routes
	e.GET("/", hello)
	//静的ファイル
	e.Static("/public", "public")

	//api
	//maze
	e.POST("/api/maze/v1/create", mazeCreate)

	//start server
	e.Logger.Fatal(e.Start(":10080"))
}

func hello(c echo.Context) error {
	return c.String(http.StatusOK, "Hello Echo")
}

/**
 * 地図を生成してjsonで返す
 * {row:横の行が、何行か？, col:縦の列が、何列か,
 * map:[[0,1,0],[1,1,0],[1,0,0]]のような迷路の地図で0が通路を1が壁を表す
 */
func mazeCreate(c echo.Context) error {
	//log.Printf("mazeCreateStart c:%v\n", c)
	mazeMap, err := maze.Create(7, 13)
	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, mazeMap)
}
