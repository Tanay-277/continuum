"""
Experiment 5 — Deadlock Simulation & Resolution
Worker: simulates AutoSave or FinalSubmit acquiring two locks in opposite order.

Usage:
    python worker.py 1 autosave     # Node-1: draft first, then submission
    python worker.py 2 submission   # Node-2: submission first, then draft
"""

import sys
import time

import grpc
import continuum_pb2
import continuum_pb2_grpc


# ---------------------------------------------------------------------------
# gRPC helpers
# ---------------------------------------------------------------------------

def acquire(stub, resource: str, holder: int, ts: int) -> bool:
    """Send AcquireLock RPC and print the result.

    Returns:
        True if the lock was granted; False if aborted (deadlock-detect mode).
    """
    reply = stub.AcquireLock(
        continuum_pb2.LockRequest(
            resource_id=resource,
            holder_id=holder,
            timestamp=ts,
        )
    )
    print(
        f"Node-{holder}: '{resource}' -> "
        f"granted={reply.granted} ({reply.message})"
    )
    return reply.granted


def release(stub, resource: str, holder: int) -> None:
    """Send ReleaseLock RPC."""
    stub.ReleaseLock(
        continuum_pb2.LockRequest(
            resource_id=resource,
            holder_id=holder,
            timestamp=0,
        )
    )
    print(f"Node-{holder}: released '{resource}'")


# ---------------------------------------------------------------------------
# Core logic
# ---------------------------------------------------------------------------

def run(node_id: int, first: str, second: str) -> None:
    """
    Acquire `first` then `second`.
    If the second acquire is aborted (deadlock detected), release held locks
    and retry in the *opposite* order so the cycle is broken.
    """
    ts = node_id  # use node_id as Lamport timestamp (simple, unique)

    with grpc.insecure_channel("localhost:60100") as channel:
        stub = continuum_pb2_grpc.LockServiceStub(channel)
        held = []

        # --- Acquire first lock ---
        if acquire(stub, first, node_id, ts):
            held.append(first)

            # 1.5 s pause — widens the race window so the other worker
            # can grab its first lock before either tries for its second.
            time.sleep(1.5)

            # --- Try to acquire second lock ---
            if acquire(stub, second, node_id, ts):
                held.append(second)
            else:
                # Deadlock detected & aborted by the Lock Manager.
                print(
                    f"Node-{node_id}: ABORTED -- releasing held locks and retrying"
                )
                for r in held:
                    release(stub, r, node_id)
                held = []

                # Brief back-off, then retry in reversed order.
                time.sleep(1)
                if acquire(stub, second, node_id, ts):
                    held.append(second)
                if acquire(stub, first, node_id, ts):
                    held.append(first)

        # --- Critical section (simulated) ---
        time.sleep(0.5)

        # --- Release all held locks ---
        for r in held:
            release(stub, r, node_id)

        print(f"Node-{node_id}: DONE")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python worker.py <node_id> <autosave|submission>")
        sys.exit(1)

    node_id = int(sys.argv[1])
    role    = sys.argv[2]

    if role == "autosave":
        run(node_id, "draft", "submission")    # AutoSave:      draft → submission
    else:
        run(node_id, "submission", "draft")    # FinalSubmit:   submission → draft
