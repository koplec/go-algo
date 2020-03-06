package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type User struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Age   int    `json:age`
}

func main() {
	e := echo.New()

	//Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	//Routes
	e.GET("/", hello)
	e.GET("/users", getUsers)
	//静的ファイル
	e.Static("/public", "public")

	//start server
	e.Logger.Fatal(e.Start(":10080"))
}

func hello(c echo.Context) error {
	return c.String(http.StatusOK, "Hello Echo")
}

func getUsers(c echo.Context) error {
	u := &User{
		Name: "hoge", Email: "hoge@hogehoge.com", Age: 23,
	}
	return c.JSON(http.StatusOK, u)
}
