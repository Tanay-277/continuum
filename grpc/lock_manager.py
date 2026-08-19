"""
Experiment 5 — Deadlock Simulation & Resolution
Lock Manager: central authority that tracks who holds each resource and
maintains a wait-for graph.  Run with 'detect' arg to enable cycle checking.

Usage:
    python lock_manager.py           # simulation mode  (deadlock will form)
    python lock_manager.py detect    # detection mode   (deadlock is resolved)
"""

import sys
import threading
import time
from concurrent import futures

import grpc
import continuum_pb2
import continuum_pb2_grpc

# ---------------------------------------------------------------------------
# Global flag: set by CLI arg 'detect'
# ---------------------------------------------------------------------------
DETECT = len(sys.argv) > 1 and sys.argv[1] == "detect"


class LockManager(continuum_pb2_grpc.LockServiceServicer):
    """Central Lock Manager with optional wait-for-graph cycle detection."""

    def __init__(self):
        self.mutex = threading.Lock()
        # Current holder for each resource (None = free)
        self.locks = {"draft": None, "submission": None}
        # wait_for[holder_id] = resource_id  (the resource it is blocked on)
        self.wait_for = {}
        # One Condition per resource so waiters can be woken selectively
        self.conditions = {
            "draft":      threading.Condition(),
            "submission": threading.Condition(),
        }

    # ------------------------------------------------------------------
    # Cycle detection helper
    # ------------------------------------------------------------------
    def _would_cycle(self, holder: int, resource: str) -> bool:
        """Walk the wait-for chain starting at the current owner of *resource*.

        If the chain eventually leads back to *holder*, granting this wait
        would close a cycle — i.e. a deadlock.

        Args:
            holder:   The node trying to acquire *resource*.
            resource: The resource being requested.

        Returns:
            True if adding holder → resource would create a cycle.
        """
        visited: set = set()
        current_resource = resource
        while True:
            owner = self.locks.get(current_resource)
            if owner is None or owner == holder:
                # Chain ends freely OR loops back to requester → cycle iff equal
                return owner == holder
            if owner in visited:
                # Detected an unrelated loop; no cycle involving holder
                return False
            visited.add(owner)
            current_resource = self.wait_for.get(owner)
            if current_resource is None:
                # Chain ends — no cycle
                return False

    # ------------------------------------------------------------------
    # RPC: AcquireLock
    # ------------------------------------------------------------------
    def AcquireLock(self, request, context):
        resource = request.resource_id
        holder   = request.holder_id

        if resource not in self.conditions:
            return continuum_pb2.LockReply(granted=False, message="unknown-resource")

        cond = self.conditions[resource]

        with cond:
            # --- Fast path: resource is free ---
            with self.mutex:
                owner = self.locks.get(resource)
                if owner is None:
                    self.locks[resource] = holder
                    self.wait_for.pop(holder, None)
                    print(f"[LockManager] Node-{holder} ACQUIRED '{resource}'")
                    return continuum_pb2.LockReply(granted=True, message="granted")

                # --- Deadlock detection (if enabled) ---
                if DETECT and self._would_cycle(holder, resource):
                    print(
                        f"[LockManager] DEADLOCK DETECTED: Node-{holder} -> "
                        f"'{resource}' (held by Node-{owner}) would close a cycle. "
                        f"Aborting Node-{holder}."
                    )
                    return continuum_pb2.LockReply(
                        granted=False, message="deadlock-abort"
                    )

                # --- Block: record the wait-for edge ---
                self.wait_for[holder] = resource
                print(
                    f"[LockManager] Node-{holder} WAITING for '{resource}' "
                    f"(held by Node-{owner})"
                )

            # --- Spin-wait loop (woken by cond.notify_all in ReleaseLock) ---
            while True:
                with self.mutex:
                    owner = self.locks.get(resource)
                    if owner is None:
                        self.locks[resource] = holder
                        self.wait_for.pop(holder, None)
                        print(
                            f"[LockManager] Node-{holder} ACQUIRED '{resource}' "
                            f"(after waiting)"
                        )
                        return continuum_pb2.LockReply(
                            granted=True, message="granted-after-wait"
                        )
                cond.wait(timeout=1)

    # ------------------------------------------------------------------
    # RPC: ReleaseLock
    # ------------------------------------------------------------------
    def ReleaseLock(self, request, context):
        resource = request.resource_id
        holder   = request.holder_id

        if resource not in self.conditions:
            return continuum_pb2.LockReply(granted=False, message="unknown-resource")

        cond = self.conditions[resource]
        with cond:
            with self.mutex:
                if self.locks.get(resource) == holder:
                    self.locks[resource] = None
                    print(f"[LockManager] Node-{holder} RELEASED '{resource}'")
                    cond.notify_all()
                    return continuum_pb2.LockReply(granted=True, message="released")
            return continuum_pb2.LockReply(granted=False, message="not-owner")


# ---------------------------------------------------------------------------
# Server bootstrap
# ---------------------------------------------------------------------------
def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    continuum_pb2_grpc.add_LockServiceServicer_to_server(LockManager(), server)
    server.add_insecure_port("localhost:60100")
    server.start()
    print(
        f"LockManager started on localhost:60100  "
        f"(deadlock detection = {DETECT})"
    )
    try:
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        server.stop(0)


if __name__ == "__main__":
    serve()
