class LamportClock:
    def __init__(self, node_id="unknown"):
        self.counter = 0
        self.node_id = node_id

    def tick(self):
        self.counter += 1
        return self.counter

    def update(self, received_timestamp):
        self.counter = max(self.counter, received_timestamp) + 1
        return self.counter

    def get_time(self):
        return self.counter

    def __str__(self):
        return f"[{self.node_id}] Lamport Clock = {self.counter}"
