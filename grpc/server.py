import os
import sys
import time
import logging
from concurrent import futures

sys.path.append(os.path.dirname(__file__))

import grpc
import continuum_pb2
import continuum_pb2_grpc
from lamport_clock import LamportClock

script_dir = os.path.dirname(os.path.abspath(__file__))
logging.basicConfig(
    filename=os.path.join(script_dir, "server_lamport.log"),
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("LamportServer")


class GameService(continuum_pb2_grpc.GameServiceServicer):

    def __init__(self):
        self.lamport_clock = LamportClock(node_id="Server")
        self.total_requests = 0
        self.causality_violations = 0

    def GetGameStatus(self, request, context):

        self.total_requests += 1
        logger.info(f"Request #{self.total_requests} received: game={request.game_name}, client_timestamp={request.lamport_timestamp}")

        print("\n" + "=" * 60)
        print(f"[SERVER] Request #{self.total_requests} Received")
        print(f"[SERVER] Requested Game : {request.game_name}")
        print(f"[SERVER] Client Lamport Timestamp : {request.lamport_timestamp}")
        print(f"[SERVER] Server Lamport Clock (before update) : {self.lamport_clock.get_time()}")

        old_clock = self.lamport_clock.get_time()
        self.lamport_clock.update(request.lamport_timestamp)
        new_clock = self.lamport_clock.get_time()

        print(f"[SERVER] Server Lamport Clock (after update) : {new_clock}")

        if new_clock <= old_clock and request.lamport_timestamp > old_clock:
            self.causality_violations += 1
            logger.error(f"CAUSALITY VIOLATION: old={old_clock}, new={new_clock}, received={request.lamport_timestamp}")
        else:
            logger.info(f"Clock updated: {old_clock} -> {new_clock}")

        time.sleep(1)

        print("\n[SERVER] Step 2 : Searching Game Library...")
        time.sleep(1)
        print("[SERVER] Game Found!")
        time.sleep(1)

        print("\n[SERVER] Step 3 : Preparing Response...")
        time.sleep(1)

        status = f"{request.game_name} is currently in your Playing Library."

        response_timestamp = self.lamport_clock.tick()

        print(f"\n[SERVER] Response Lamport Timestamp : {response_timestamp}")
        print("[SERVER] Response Ready - Sending to Client...")
        print("=" * 60)

        logger.info(f"Response #{self.total_requests} sent: timestamp={response_timestamp}, status={status}")

        return continuum_pb2.GameResponse(
            status=status,
            lamport_timestamp=response_timestamp
        )

    def print_verification(self):
        print("\n" + "=" * 60)
        print("[SERVER] VERIFICATION SUMMARY")
        print("=" * 60)
        print(f"[SERVER] Total Requests Processed : {self.total_requests}")
        print(f"[SERVER] Causality Violations (FN) : {self.causality_violations}")
        print(f"[SERVER] True Positives (TP)       : {self.total_requests - self.causality_violations}")
        print(f"[SERVER] Lamport Clock Final Value : {self.lamport_clock.get_time()}")
        print("=" * 60)


def serve():

    print("\n" + "=" * 60)
    print("[SERVER] Starting gRPC Server...")
    print("=" * 60)
    time.sleep(1)

    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=10)
    )

    game_service = GameService()
    continuum_pb2_grpc.add_GameServiceServicer_to_server(
        game_service, server
    )

    server.add_insecure_port("[::]:50051")

    server.start()

    print("\n" + "=" * 60)
    print("[SERVER] gRPC Server Started Successfully")
    print("[SERVER] Listening on Port : 50051")
    print("[SERVER] Waiting for Client Requests...")
    print("[SERVER] Logs are being written to: server_lamport.log")
    print("=" * 60 + "\n")

    logger.info("Server started successfully on port 50051")

    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        game_service.print_verification()
        logger.info("Server stopped")


if __name__ == "__main__":
    serve()
