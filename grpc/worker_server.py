"""
Experiment 6 — Load Balancing (Least Connections)
Worker Server: simulates a backend service with variable processing times.

Each instance runs on a configurable port and handles WorkRequests via
the WorkerService gRPC interface.

Usage:
    python worker_server.py <port>

Example:
    python worker_server.py 60201
    python worker_server.py 60202
    python worker_server.py 60203
"""

import os
import sys
import signal
import time
import random
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
            os.path.join(script_dir, "worker_server.log"), mode="a"
        ),
    ],
)
logger = logging.getLogger("WorkerServer")

# ---------------------------------------------------------------------------
# Service implementation
# ---------------------------------------------------------------------------

MIN_WORK_TIME = 0.5
MAX_WORK_TIME = 2.5


class WorkerServicer(continuum_pb2_grpc.WorkerServiceServicer):
    """gRPC servicer that simulates variable-length backend processing."""

    def __init__(self, name: str) -> None:
        self.name = name
        self.total_requests = 0

    def HandleRequest(self, request, context):
        self.total_requests += 1
        work_time = random.uniform(MIN_WORK_TIME, MAX_WORK_TIME)

        logger.info(
            "Handling request %d (%.1fs simulated work)",
            request.request_id,
            work_time,
        )
        print(
            f"[{self.name}] Handling request {request.request_id} "
            f"(will take {work_time:.1f}s)"
        )

        time.sleep(work_time)

        print(f"[{self.name}] Finished request {request.request_id}")
        logger.info("Completed request %d", request.request_id)

        return continuum_pb2.WorkReply(
            request_id=request.request_id,
            handled_by=self.name,
            status="done",
        )


# ---------------------------------------------------------------------------
# Server lifecycle
# ---------------------------------------------------------------------------

def serve(port: int) -> None:
    name = f"Worker-{port}"

    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=20),
        options=[
            ("grpc.so_reuseport", 1),
        ],
    )

    servicer = WorkerServicer(name)
    continuum_pb2_grpc.add_WorkerServiceServicer_to_server(servicer, server)

    server.add_insecure_port(f"[::]:{port}")

    # Graceful shutdown on SIGINT/SIGTERM
    def shutdown_handler(signum, frame):
        print(f"\n[{name}] Shutting down...")
        logger.info("Shutdown signal received, stopping server")
        server.stop(grace=5)  # 5s grace period for in-flight requests

    signal.signal(signal.SIGINT, shutdown_handler)
    signal.signal(signal.SIGTERM, shutdown_handler)

    server.start()
    print(f"[{name}] Listening on localhost:{port}")
    logger.info("Started on port %d", port)

    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        pass
    finally:
        print(f"[{name}] Stopped. Total requests handled: {servicer.total_requests}")
        logger.info(
            "Server stopped. Total requests: %d", servicer.total_requests
        )


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python worker_server.py <port>")
        print("Example: python worker_server.py 60201")
        sys.exit(1)

    port = int(sys.argv[1])
    if not (1024 <= port <= 65535):
        print(f"Error: Port must be between 1024 and 65535, got {port}")
        sys.exit(1)

    serve(port)
