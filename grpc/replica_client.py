"""
Experiment 7 — Eventual Consistency client / convergence check.

Deliberately creates a conflict — two "writers" hit two different replicas
for the same key at nearly the same time — then checks convergence:
reads immediately (to show the inconsistency window), waits 2s for gossip,
and reads again (to prove all replicas converged via Last-Write-Wins).

Usage:
    python replica_client.py [key]

Example:
    python replica_client.py
    python replica_client.py shared-key-1
"""

import os
import sys
import time
import threading

sys.path.append(os.path.dirname(__file__))

import grpc
import continuum_pb2
import continuum_pb2_grpc

REPLICAS = {"A": "localhost:60301", "B": "localhost:60302", "C": "localhost:60303"}

CONVERGENCE_WAIT = 2.0  # seconds to allow gossip to propagate


def save(replica_name: str, key: str, content: str) -> None:
    with grpc.insecure_channel(REPLICAS[replica_name]) as channel:
        stub = continuum_pb2_grpc.ReplicaServiceStub(channel)
        ack = stub.SaveValue(
            continuum_pb2.ValueUpdate(
                key=key, content=content, lamport_timestamp=0, origin_replica=""
            )
        )
        print(
            f"[Client] Saved on Replica-{replica_name}: \"{content}\" "
            f"-> accepted={ack.accepted}, replica_ts={ack.lamport_timestamp}"
        )


def read(replica_name: str, key: str):
    with grpc.insecure_channel(REPLICAS[replica_name]) as channel:
        stub = continuum_pb2_grpc.ReplicaServiceStub(channel)
        state = stub.GetValue(continuum_pb2.ValueQuery(key=key))
        return state.content, state.lamport_timestamp, state.origin_replica


def main() -> None:
    key = sys.argv[1] if len(sys.argv) > 1 else "shared-key-1"
    print("=== Simulating two concurrent writers hitting DIFFERENT replicas ===\n")

    t1 = threading.Thread(target=save, args=("A", key, "value-from-writer-1"))
    t2 = threading.Thread(target=save, args=("C", key, "value-from-writer-2"))
    t1.start()
    time.sleep(0.05)  # near-simultaneous, not identical — creates a real race
    t2.start()
    t1.join()
    t2.join()

    print("\n=== Immediately after writes (replicas may still be mid-gossip) ===")
    for name in REPLICAS:
        content, ts, origin = read(name, key)
        print(f"Replica-{name}: \"{content}\" (ts={ts}, origin={origin})")

    print(f"\nWaiting {CONVERGENCE_WAIT:g}s for gossip to finish propagating...\n")
    time.sleep(CONVERGENCE_WAIT)

    print("=== After convergence window ===")
    results = {}
    for name in REPLICAS:
        content, ts, origin = read(name, key)
        results[name] = content
        print(f"Replica-{name}: \"{content}\" (ts={ts}, origin={origin})")

    if len(set(results.values())) == 1:
        print(f"\n*** CONVERGED: all replicas agree on: \"{list(results.values())[0]}\" ***")
    else:
        print(f"\n*** NOT YET CONVERGED: {set(results.values())} ***")
        sys.exit(1)


if __name__ == "__main__":
    main()
