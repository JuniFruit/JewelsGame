#[derive(Debug, Clone, Copy)]
pub struct Coords {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Copy)]
pub struct Size {
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone, Copy)]
pub struct BaseEntity {
    pub position: Coords,
    pub size: Size,
    pub initial_pos: Coords,
    pub initial_size: Size,
    pub target_position: Coords,
}

impl BaseEntity {
    pub fn new(position: Coords, size: Size) -> Self {
        BaseEntity {
            position,
            size,
            initial_pos: position.clone(),
            initial_size: size.clone(),
            target_position: position.clone(),
        }
    }
}

pub trait Update {
    fn update(&mut self, _t: f64, _dt: f64) {}
}

#[derive(Debug, Clone, Copy)]
pub struct Timer {
    pub time: f64,
    pub time_left: f64,
    pub is_going: bool,
    pub is_ended: bool,
    pulse_bound: f64,
    pulse_time: f64,
}

impl Timer {
    pub fn new(time: f64) -> Self {
        Timer {
            time,
            time_left: time,
            is_going: false,
            is_ended: false,
            pulse_bound: 0.0,
            pulse_time: 0.0,
        }
    }

    pub fn stop(&mut self) {
        self.is_going = false;
        self.is_ended = true;
    }

    pub fn reset(&mut self) {
        self.is_going = false;
        self.is_ended = false;
        self.time_left = self.time;
        self.pulse_time = 0.0;
    }

    pub fn start(&mut self) {
        self.reset();
        self.is_going = true;
    }

    pub fn set_time(&mut self, time: f64) {
        self.time = time;
    }
}

impl Update for Timer {
    fn update(&mut self, t: f64, dt: f64) {
        if !self.is_going {
            return;
        };

        if self.pulse_bound > 0.0 {
            self.pulse_time += dt;
            if self.pulse_time >= self.pulse_bound {
                // this.onPulse?.();
                self.pulse_time = 0.0;
            }
        }
        self.time_left -= dt;
        if self.time_left <= 0.0 {
            self.stop();
        }
    }
}
