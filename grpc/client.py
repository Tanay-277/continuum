import os
import sys
import time

sys.path.append(os.path.dirname(__file__))

import grpc
import continuum_pb2
import continuum_pb2_grpc
from lamport_clock import LamportClock


def run():

    print("\n======================================")
    print("Continuum Game Client Started")
    print("======================================")

    time.sleep(1)

    print("\nStep 1 : Connecting to gRPC Server...")

    channel = grpc.insecure_channel("localhost:50051")

    stub = continuum_pb2_grpc.GameServiceStub(channel)

    print("Connected Successfully")

    time.sleep(1)

    print("\nStep 2 : Initializing Lamport Clock...")

    lamport_clock = LamportClock()

    time.sleep(1)

    print("\nStep 3 : Creating Request")

    game = "Elden Ring"

    lamport_clock.tick()

    print(f"Game Requested : {game}")
    print(f"Lamport Timestamp : {lamport_clock.get_time()}")

    time.sleep(1)

    print("\nStep 4 : Sending Request to Server...")

    response = stub.GetGameStatus(
        continuum_pb2.GameRequest(
            game_name=game,
            lamport_timestamp=lamport_clock.get_time()
        )
    )

    lamport_clock.update(response.lamport_timestamp)

    time.sleep(1)

    print("\nStep 5 : Response Received")

    print("--------------------------------------")
    print(response.status)
    print(f"Server Lamport Timestamp : {response.lamport_timestamp}")
    print(f"Client Lamport Timestamp (after update) : {lamport_clock.get_time()}")
    print("--------------------------------------")

    print("\nExperiment Completed Successfully")


if __name__ == "__main__":
    run()