"""
Experiment 7 — Eventual Consistency via Gossip Replication + Last-Write-Wins.

Replica node: accepts writes locally and immediately (availability first),
then gossips them to peers asynchronously in the background. Conflicting
concurrent writes for the same key are resolved deterministically with
Last-Write-Wins over the (lamport_timestamp, origin_replica) tuple.

Usage:
    python replica_node.py <NAME> <PORT>

Example (3 terminals):
    python replica_node.py A 60301
    python replica_node.py B 60302
    python replica_node.py C 60303
"""

import os
import sys
import signal
import time
import threading
import logging
from concurrent import futures

sys.path.append(os.path.dirname(__file__))

import grpc
import continuum_pb2
import continuum_pb2_grpc

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

script_dir = os.path.dirname(os.path.abspath(__file__))
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(
            os.path.join(script_dir, "replica_node.log"), mode="a"
        ),
    ],
)
logger = logging.getLogger("ReplicaNode")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

ALL_REPLICAS = {
    "A": "localhost:60301",
    "B": "localhost:60302",
    "C": "localhost:60303",
}

# ---------------------------------------------------------------------------
# Service implementation
# ---------------------------------------------------------------------------


class ReplicaNode(continuum_pb2_grpc.ReplicaServiceServicer):
    """A single eventually-consistent replica with a Lamport clock."""

    def __init__(self, name: str) -> None:
        self.name = name
        self.peers = {n: addr for n, addr in ALL_REPLICAS.items() if n != name}
        self.clock = 0
        self.lock = threading.Lock()
        self.store = {}  # key -> (content, lamport_timestamp, origin_replica)

    def log(self, msg: str) -> None:
        print(f"[{self.name} t={self.clock:>2}] {msg}", flush=True)
        logger.info("[%s t=%d] %s", self.name, self.clock, msg)

    def tick(self) -> int:
        with self.lock:
            self.clock += 1
            return self.clock

    def update_clock(self, received_ts: int) -> int:
        with self.lock:
            self.clock = max(self.clock, received_ts) + 1
            return self.clock

    def _apply_if_newer(self, key: str, content: str, ts: int, origin: str) -> bool:
        """Last-Write-Wins: only overwrite if the incoming update is
        strictly newer, tie-broken by origin replica name."""
        with self.lock:
            current = self.store.get(key)
            if current is None or (ts, origin) > (current[1], current[2]):
                self.store[key] = (content, ts, origin)
                self.log(f"APPLIED '{key}' = \"{content}\" (ts={ts}, origin={origin})")
                return True
            self.log(
                f"IGNORED stale update for '{key}' "
                f"(incoming ts={ts}/{origin} <= current ts={current[1]}/{current[2]})"
            )
            return False

    def _gossip(self, key: str, content: str, ts: int, origin: str) -> None:
        """Fire-and-forget replication — runs AFTER the local write
        already succeeded and the client already got its response."""
        for peer_name, addr in self.peers.items():
            try:
                with grpc.insecure_channel(addr) as channel:
                    stub = continuum_pb2_grpc.ReplicaServiceStub(channel)
                    stub.SyncUpdate(
                        continuum_pb2.ValueUpdate(
                            key=key,
                            content=content,
                            lamport_timestamp=ts,
                            origin_replica=origin,
                        )
                    )
                self.log(f"Gossiped '{key}' -> {peer_name}")
            except grpc.RpcError as e:
                self.log(
                    f"Gossip to {peer_name} failed (will catch up later): {e.code()}"
                )

    def SaveValue(self, request, context):
        ts = self.tick()
        self._apply_if_newer(request.key, request.content, ts, self.name)
        threading.Thread(
            target=self._gossip,
            args=(request.key, request.content, ts, self.name),
            daemon=True,
        ).start()
        return continuum_pb2.SaveAck(
            accepted=True, replica=self.name, lamport_timestamp=ts
        )

    def SyncUpdate(self, request, context):
        self.update_clock(request.lamport_timestamp)
        self._apply_if_newer(
            request.key,
            request.content,
            request.lamport_timestamp,
            request.origin_replica,
        )
        return continuum_pb2.SaveAck(
            accepted=True, replica=self.name, lamport_timestamp=self.clock
        )

    def GetValue(self, request, context):
        with self.lock:
            entry = self.store.get(request.key)
            if entry is None:
                return continuum_pb2.ValueState(
                    key=request.key,
                    content="",
                    lamport_timestamp=0,
                    origin_replica="",
                )
            content, ts, origin = entry
            return continuum_pb2.ValueState(
                key=request.key,
                content=content,
                lamport_timestamp=ts,
                origin_replica=origin,
            )


# ---------------------------------------------------------------------------
# Server lifecycle
# ---------------------------------------------------------------------------


def serve(name: str, port: int) -> None:
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=20))
    servicer = ReplicaNode(name)
    continuum_pb2_grpc.add_ReplicaServiceServicer_to_server(servicer, server)
    server.add_insecure_port(f"[::]:{port}")
    server.start()
    print(f"Replica-{name} listening on localhost:{port}")
    logger.info("Replica-%s started on port %d", name, port)

    def shutdown_handler(signum, frame):
        print(f"\n[Replica-{name}] Shutting down...")
        logger.info("Replica-%s shutdown signal received", name)
        server.stop(grace=5)

    signal.signal(signal.SIGINT, shutdown_handler)
    signal.signal(signal.SIGTERM, shutdown_handler)

    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        pass
    finally:
        server.stop(0)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python replica_node.py <NAME> <PORT>")
        print("Example: python replica_node.py A 60301")
        sys.exit(1)

    serve(sys.argv[1], int(sys.argv[2]))
