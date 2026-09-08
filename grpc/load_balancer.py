"""
Experiment 6 — Load Balancing (Least Connections)
Load Balancer: routes each incoming request to the backend with the fewest
active (in-flight) connections, making the decision fresh for every request
based on real-time load.

Usage:
    python load_balancer.py [num_requests] [backends...]

Defaults:
    num_requests = 9
    backends     = localhost:60201, localhost:60202, localhost:60203

Example:
    python load_balancer.py
    python load_balancer.py 15 localhost:60201 localhost:60202 localhost:60203
"""

import os
import sys
import time
import threading
import logging
from typing import List

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
            os.path.join(script_dir, "load_balancer.log"), mode="a"
        ),
    ],
)
logger = logging.getLogger("LoadBalancer")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DEFAULT_BACKENDS = [
    "localhost:60201",
    "localhost:60202",
    "localhost:60203",
]
DEFAULT_NUM_REQUESTS = 9
STAGGER_DELAY = 0.15  # seconds between request dispatches

# ---------------------------------------------------------------------------
# Least Connections tracker
# ---------------------------------------------------------------------------


class ConnectionTracker:
    """Thread-safe tracker for active (in-flight) connections per backend."""

    def __init__(self, backend_count: int) -> None:
        self._active = [0] * backend_count
        self._lock = threading.Lock()

    def pick_least(self) -> int:
        """Return the index of the backend with the fewest active connections.

        The counter is incremented *inside* the lock so the next call sees
        the updated state, preventing two requests from picking the same
        backend simultaneously.
        """
        with self._lock:
            idx = self._active.index(min(self._active))
            self._active[idx] += 1
            logger.info(
                "Routed -> backend %d | active counts: %s",
                idx,
                self._active,
            )
            return idx

    def release(self, idx: int) -> None:
        """Decrement the counter for the given backend."""
        with self._lock:
            self._active[idx] -= 1
            logger.info(
                "Released backend %d | active counts: %s",
                idx,
                self._active,
            )

    @property
    def snapshot(self) -> List[int]:
        with self._lock:
            return list(self._active)


# ---------------------------------------------------------------------------
# Request handler
# ---------------------------------------------------------------------------

BACKENDS: List[str] = []
tracker: ConnectionTracker = None  # type: ignore[assignment]


def handle_request(req_id: int) -> None:
    """Dispatch a single request to the least-loaded backend."""
    idx = tracker.pick_least()
    addr = BACKENDS[idx]

    try:
        with grpc.insecure_channel(addr) as channel:
            stub = continuum_pb2_grpc.WorkerServiceStub(channel)
            reply = stub.HandleRequest(
                continuum_pb2.WorkRequest(request_id=req_id)
            )
            print(
                f"[LB] Request {req_id} -> handled by {reply.handled_by} "
                f"(status: {reply.status})"
            )
            logger.info(
                "Request %d completed by %s", req_id, reply.handled_by
            )
    except grpc.RpcError as e:
        print(f"[LB] Request {req_id} FAILED: {e.code().name} - {e.details()}")
        logger.error("Request %d failed: %s", req_id, e, exc_info=True)
    finally:
        tracker.release(idx)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    global BACKENDS, tracker

    num_requests = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_NUM_REQUESTS
    BACKENDS = sys.argv[2:] if len(sys.argv) > 2 else list(DEFAULT_BACKENDS)
    tracker = ConnectionTracker(len(BACKENDS))

    print("=" * 60)
    print("[LB] Load Balancer — Least Connections Strategy")
    print(f"[LB] Backends: {BACKENDS}")
    print(f"[LB] Dispatching {num_requests} requests "
          f"(staggered by {STAGGER_DELAY}s)")
    print("=" * 60)
    logger.info(
        "Starting: backends=%s, num_requests=%d", BACKENDS, num_requests
    )

    threads: List[threading.Thread] = []

    for req_id in range(1, num_requests + 1):
        t = threading.Thread(target=handle_request, args=(req_id,))
        threads.append(t)
        t.start()
        time.sleep(STAGGER_DELAY)

    for t in threads:
        t.join()

    print("\n" + "=" * 60)
    print("[LB] All requests processed.")
    print(f"[LB] Final active connection counts: {tracker.snapshot}")
    print("[LB] (Should all be 0 — no connection leaks)")
    print("=" * 60)
    logger.info("All done. Final counts: %s", tracker.snapshot)


if __name__ == "__main__":
    main()
