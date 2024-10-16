pub mod board;
pub mod jewel;

use rand::Rng;

use crate::shared::entities::{Timer, Update};

pub struct Game {
    pub mode: String,
    // p1_board: Board;
    // p2_board: Board;
    pub is_paused: bool,
    pub is_started: bool,
    pub is_over: bool,
    pub winner: Option<String>,
    pub cols: u16,
    pub rows: u16,
    pub time_elapsed: f64,
    pub countdown_timer: Timer,
    //
}

impl Update for Game {
    fn update(&mut self, t: f64, dt: f64) {
        if self.is_paused {
            return;
        }

        if !self.is_started && !self.countdown_timer.is_ended {
            self.countdown_timer.update(t, dt);
        }
        if self.countdown_timer.is_ended && !self.is_started {
            self.is_started = true;
            // this.startBoards();
        }

        // this.p1Board.update(t, dt);
        // this.p2Board.update(t, dt);
        if self.is_started {
            self.time_elapsed += dt;
            // self.check_refill();
            self.check_is_over();
        }
    }
}

impl Game {
    pub fn new(mode: String) -> Self {
        Game {
            mode,
            is_paused: false,
            is_started: false,
            is_over: false,
            winner: None,
            cols: 8,
            rows: 8,
            time_elapsed: 0.0,
            countdown_timer: Timer::new(5.0),
        }
    }

    pub fn set_pause(&mut self, val: bool) {
        self.is_paused = val;
    }
    fn generate_boards(&mut self) {
        let mut layout: Vec<u16> = vec![];
        let size = self.rows * self.cols;
        for n in 0..size {
            layout.push(rand::thread_rng().gen_range(1..6));
        }

        // if (this.isSolvable(layout)) {
        //     this.setBoard(layout, "p1");
        //     this.setBoard(layout, "p2");
        // } else {
        //     this.generateBoards();
        // }
    }
    //
    pub fn reset(&mut self) {
        self.time_elapsed = 0.0;
        self.is_over = false;
        self.winner = None;
        self.is_started = false;
        self.is_paused = false;
        self.countdown_timer.reset();
        // self.p1_board.reset();
        // self.p2_board.reset();
    }
    //
    pub fn start_game(&mut self) {
        self.reset();
        self.generate_boards();
        self.countdown_timer.start();
    }
    //
    pub fn game_over(&mut self, winner: String) {
        self.winner = Some(winner);
        self.is_over = true;
    }
    //
    fn check_is_over(&self) {
        if self.is_over {
            return;
        }
        // if (this.p1Board.health <= 0) {
        //   this.gameOver("p2");
        //   return;
        // }
        // if (this.p2Board.health <= 0) {
        //   this.gameOver("p1");
        //   return;
        // }
    }
    //
    // private fillGaps(board: Board) {
    //   const layout = board.getLayout();
    //   const layoutToGenerate: number[] = [];
    //   const types = Object.values(JEWEL_TYPE);
    //   let lastDisabledInd = 0;
    //
    //   for (let i = 0; i < layout.length; i++) {
    //     if (layout[i] === 0) {
    //       layout[i] = types[Math.floor(Math.random() * 6)];
    //       layoutToGenerate[i] = layout[i];
    //       lastDisabledInd = i;
    //     } else {
    //       layoutToGenerate[i] = -1;
    //     }
    //   }
    //   const { row } = convertTo2dInd(lastDisabledInd, board.rows, board.cols);
    //   if (this.isSolvable(layout)) {
    //     board.generateJewels(layoutToGenerate, false, row);
    //   } else {
    //     this.fillGaps(board);
    //   }
    // }
    //
    // isSolvable(layout: number[]) {
    //   const l = layout;
    //   const s = l.join("");
    //   let newS = "";
    //   let prevInd = 0;
    //   const len = s.length;
    //
    //   for (let i = this.cols; i < len; i += this.cols) {
    //     newS += s.slice(prevInd, i + 1) + "A";
    //     prevInd = i;
    //   }
    //   const result =
    //     /(\d)(\1(\d|.{6}|.{9})|(\d|.{6}|.{9})\1|.{7}\1(.|.{9})|(.|.{9})\1.{7}|(.{7,9}|.{17})\1.{8}|.{8}\1(.{7,9}|.{17}))\1/.test(
    //       newS,
    //     );
    //   return result;
    // }
    //
    // private addJewels(player: "p1" | "p2") {
    //   if (player === "p1") {
    //     this.fillGaps(this.p1Board);
    //   } else {
    //     this.fillGaps(this.p2Board);
    //   }
    // }
    //
    // setBoard(layout: number[], player: "p1" | "p2") {
    //   if (player === "p1") {
    //     this.p1Board.generateJewels(layout, !this.isStarted);
    //   } else {
    //     this.p2Board.generateJewels(layout, !this.isStarted);
    //   }
    //   this.p1Board.setOpponentBoard(this.p2Board);
    //   this.p2Board.setOpponentBoard(this.p1Board);
    // }
    //
    // private checkRefill() {
    //   if (this.p1Board.isReadyToRefill) {
    //     this.p1Board.isReadyToRefill = false;
    //     this.addJewels("p1");
    //     return;
    //   }
    //   if (this.p2Board.isReadyToRefill) {
    //     this.p2Board.isReadyToRefill = false;
    //     this.addJewels("p2");
    //     return;
    //   }
    // }
    //
    // startBoards() {
    //   this.p1Board.isNewBoard = false;
    //   this.p2Board.isNewBoard = false;
    //   this.p1Board.removeOrMergeMatches();
    //   this.p2Board.removeOrMergeMatches();
    // }
    //
    pub fn set_game_mode(&mut self, mode: String) {
        self.mode = mode;
    }
    // }
}
