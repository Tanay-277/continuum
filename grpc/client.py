import os
import sys
import time
import logging

sys.path.append(os.path.dirname(__file__))

import grpc
import continuum_pb2
import continuum_pb2_grpc
from lamport_clock import LamportClock

script_dir = os.path.dirname(os.path.abspath(__file__))
logging.basicConfig(
    filename=os.path.join(script_dir, "client_lamport.log"),
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("LamportClient")


def run():

    print("\n" + "=" * 60)
    print("[CLIENT] Continuum Game Client Started")
    print("=" * 60)

    logger.info("Client started")

    time.sleep(1)

    print("\n[CLIENT] Step 1 : Connecting to gRPC Server...")

    channel = grpc.insecure_channel("localhost:50051")

    stub = continuum_pb2_grpc.GameServiceStub(channel)

    print("[CLIENT] Connected Successfully")

    time.sleep(1)

    print("\n[CLIENT] Step 2 : Initializing Lamport Clock...")

    lamport_clock = LamportClock(node_id="Client")

    time.sleep(1)

    print("\n[CLIENT] Step 3 : Creating Request")

    game = "Elden Ring"

    lamport_clock.tick()

    client_timestamp = lamport_clock.get_time()

    print(f"[CLIENT] Game Requested : {game}")
    print(f"[CLIENT] Client Lamport Timestamp (send) : {client_timestamp}")

    logger.info(f"Request sent: game={game}, timestamp={client_timestamp}")

    time.sleep(1)

    print("\n[CLIENT] Step 4 : Sending Request to Server...")

    request = continuum_pb2.GameRequest(
        game_name=game,
        lamport_timestamp=client_timestamp
    )

    response = stub.GetGameStatus(request)

    old_clock = lamport_clock.get_time()
    lamport_clock.update(response.lamport_timestamp)
    new_clock = lamport_clock.get_time()

    time.sleep(1)

    print("\n[CLIENT] Step 5 : Response Received")

    print("-" * 60)
    print(f"[CLIENT] Response Status     : {response.status}")
    print(f"[CLIENT] Server Lamport Timestamp : {response.lamport_timestamp}")
    print(f"[CLIENT] Client Lamport Clock (before update) : {old_clock}")
    print(f"[CLIENT] Client Lamport Clock (after update)  : {new_clock}")
    print("-" * 60)

    logger.info(f"Response received: server_timestamp={response.lamport_timestamp}, client_clock_after_update={new_clock}")

    print("\n[CLIENT] VERIFICATION")
    print("-" * 60)
    if response.lamport_timestamp > client_timestamp:
        print(f"[CLIENT] TP (True Positive) : Server timestamp ({response.lamport_timestamp}) > Client send timestamp ({client_timestamp})")
        print("[CLIENT] Causality preserved: Message was received after it was sent")
    else:
        print(f"[CLIENT] FN (False Negative) : Server timestamp ({response.lamport_timestamp}) <= Client send timestamp ({client_timestamp})")
        print("[CLIENT] ERROR: Causality violated!")

    if new_clock > old_clock:
        print(f"[CLIENT] Clock update correct: {old_clock} -> {new_clock}")
    else:
        print(f"[CLIENT] ERROR: Clock did not advance: {old_clock} -> {new_clock}")

    print(f"[CLIENT] Final Client Lamport Clock : {new_clock}")
    print("-" * 60)

    print("\n[CLIENT] Experiment Completed Successfully")
    print("[CLIENT] Logs are being written to: client_lamport.log")
    print("=" * 60 + "\n")

    logger.info("Experiment completed successfully")


if __name__ == "__main__":
    run()
