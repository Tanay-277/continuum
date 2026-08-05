import os
import sys
import time

sys.path.append(os.path.dirname(__file__))

import grpc
import continuum_pb2
import continuum_pb2_grpc


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

    print("\nStep 2 : Creating Request")

    game = "Elden Ring"

    print(f"Game Requested : {game}")

    time.sleep(1)

    print("\nStep 3 : Sending Request to Server...")

    response = stub.GetGameStatus(
        continuum_pb2.GameRequest(
            game_name=game
        )
    )

    time.sleep(1)

    print("\nStep 4 : Response Received")

    print("--------------------------------------")
    print(response.status)
    print("--------------------------------------")

    print("\nExperiment Completed Successfully")


if __name__ == "__main__":
    run()