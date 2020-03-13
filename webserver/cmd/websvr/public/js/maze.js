window.addEventListener('load', async () => {
	App.init();

}, false);

const HOST = "3.112.69.40";
const MAZE_CREATE_URL = `http://${HOST}:10080/api/maze/v1/create`;
const MAZE_SOLVE_URL = `http://${HOST}:10080/api/maze/v1/solve`;
var App = {
	maze: null,
	start: null,//[i,j]のような配列
	goal: null, //[i,j]のような配列
	init: function () {
		let body = document.body;
		let title = this.createTitle();
		let div = this.createMainElm();
		this.mapElm = this.createMapElm();
		body.appendChild(title);
		body.appendChild(div);
		body.appendChild(this.mapElm);
	},
	setMaze: function (maze, routes) {
		routes = routes || [];
		this.maze = maze;
		El.removeAllChildren(this.mapElm);

		let row = maze.row;
		let col = maze.col;
		let map = maze.map;

		function findRoute(i, j) {
			for (let k = 0; k < routes.length; k++) {
				let p = routes[k];
				if (p[0] == i && p[1] == j) {
					return true;
				}
			}
			return false;
		}

		let table = El.table({ classList: ["maze-table"] });
		for (let i = 0; i < row; i++) {
			let tr = El.tr({ classList: ["maze-table--tr"] });
			for (let j = 0; j < col; j++) {
				let val = map[i][j];
				let opt = { classList: ["maze-table--td"] };
				if (val == 1) {
					opt.classList.push("maze-table--td__occupied");
				} else {
					opt.classList.push("maze-table--td__empty");
				}
				if (findRoute(i, j)) {
					opt.classList.push("maze-table--td__route");
				}

				let td = El.td(opt);
				td.addEventListener("click", () => {
					if (td.classList.contains("maze-table--td__empty")) {
						App.clickMazePoint(td, i, j);
					}
				});

				tr.appendChild(td);
			}
			table.appendChild(tr);
		}
		this.mapElm.appendChild(table);
	},
	createTitle: function () {
		return El.div({ id: "ctrl-title", t: "maze" });
	},
	createMainElm: function () {


		let elm = El.div({ id: "ctrl", classList: ["maze-ctrl"] });
		let rowInput = El.input();
		rowInput.value = "3";
		let colInput = El.input();
		colInput.value = "5";
		elm.appendChild(El.divText("row:"));
		elm.appendChild(rowInput);
		elm.appendChild(El.divText("col:"));
		elm.appendChild(colInput);
		let createBtn = El.button({ id: "createBtn", t: "create" });
		let solveBtn = El.button({ id: "solveBtn", t: "solve" })
		elm.appendChild(createBtn);
		elm.appendChild(solveBtn);

		createBtn.addEventListener("click", async () => {
			let row = safeParseInt(rowInput.value);
			let col = safeParseInt(colInput.value);
			this.start = null;
			this.goal = null;
			var maze = await Ajax.post(MAZE_CREATE_URL, { row, col });
			this.setMaze(maze);
		}, false);
		solveBtn.addEventListener("click", async () => {
			console.log("solveBtn clicked");
			let start = this.start;
			let goal = this.goal;
			let map = this.maze.map;
			if (start && goal) {
				var payload = {
					start, goal, map
				}
				console.log("payload:", payload);
				var ret = await Ajax.post(MAZE_SOLVE_URL, payload)
				console.log(ret);
				this.setMaze(this.maze, ret.route);
			}
		})
		return elm;
	},
	createMapElm: function () {
		return El.div({ id: "maze-map" });
	},
	clickMazePoint: function (td, i, j) {
		console.log(i, j);
		if (this.start == null & this.goal == null) {
			this.setStart(td, i, j);
		} else if (this.start != null && this.goal == null) {
			this.setGoal(td, i, j);
		} else {
			this.start = null; this.goal = null;
			var elms = document.getElementsByClassName("maze-table--td__start");
			Array.prototype.forEach.call(elms, (elm) => {
				elm.classList.remove("maze-table--td__start")
			});

			elms = document.getElementsByClassName("maze-table--td__goal");
			Array.prototype.forEach.call(elms, (elm) => {
				elm.classList.remove("maze-table--td__goal")
			});
		}
	},
	setStart: function (td, i, j) {
		this.start = [i, j];
		this.goal = null;
		td.classList.add("maze-table--td__start")
	},
	setGoal: function (td, i, j) {
		this.goal = [i, j];
		td.classList.add("maze-table--td__goal")
	}
}