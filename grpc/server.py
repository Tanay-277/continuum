import os
import sys
import time
from concurrent import futures

sys.path.append(os.path.dirname(__file__))

import grpc
import continuum_pb2
import continuum_pb2_grpc


class GameService(continuum_pb2_grpc.GameServiceServicer):

    def GetGameStatus(self, request, context):

        print("\n======================================")
        print("Step 1 : Request received from Client")
        print(f"Requested Game : {request.game_name}")

        time.sleep(1)

        print("\nStep 2 : Searching Game Library...")
        time.sleep(1)

        print("Game Found!")
        time.sleep(1)

        print("\nStep 3 : Preparing Response...")
        time.sleep(1)

        status = f"{request.game_name} is currently in your Playing Library."

        print("Response Ready")
        print("Sending Response to Client...")
        print("======================================\n")

        return continuum_pb2.GameResponse(status=status)


def serve():

    print("Starting gRPC Server...")
    time.sleep(1)

    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=10)
    )

    continuum_pb2_grpc.add_GameServiceServicer_to_server(
        GameService(), server
    )

    server.add_insecure_port("[::]:50051")

    server.start()

    print("\n======================================")
    print("gRPC Server Started Successfully")
    print("Listening on Port : 50051")
    print("Waiting for Client Requests...")
    print("======================================\n")

    server.wait_for_termination()


if __name__ == "__main__":
    serve()