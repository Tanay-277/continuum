class LamportClock:
    def __init__(self):
        self.counter = 0

    def tick(self):
        self.counter += 1
        return self.counter

    def update(self, received_timestamp):
        self.counter = max(self.counter, received_timestamp) + 1
        return self.counter

    def get_time(self):
        return self.counter
