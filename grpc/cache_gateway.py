import json
import sys

import grpc
import redis

import continuum_pb2
import continuum_pb2_grpc

REDIS_HOST = "localhost"
REDIS_PORT = 6379
CACHE_TTL_SECONDS = 10
BACKEND_SERVICE_ADDR = "localhost:50051"
STALE_KEY_PREFIX = "stale:item:"
FRESH_KEY_PREFIX = "fresh:item:"


def get_redis():
    """Fresh connection per call, with a short timeout, so we can
    detect Redis being down quickly instead of hanging."""
    return redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        socket_connect_timeout=1,
        socket_timeout=1,
    )


def fetch_from_backend(game_name):
    """Direct call to the real backend gRPC service (Exp 2/3 server.py)."""
    with grpc.insecure_channel(BACKEND_SERVICE_ADDR) as channel:
        stub = continuum_pb2_grpc.GameServiceStub(channel)
        response = stub.GetGameStatus(
            continuum_pb2.GameRequest(game_name=game_name, lamport_timestamp=0),
            timeout=15,
        )
        return {
            "game_name": game_name,
            "status": response.status,
            "lamport_timestamp": response.lamport_timestamp,
        }


def get_item(game_name):
    fresh_key = f"{FRESH_KEY_PREFIX}{game_name}"
    stale_key = f"{STALE_KEY_PREFIX}{game_name}"

    # --- Try the cache first ---
    try:
        r = get_redis()
        cached = r.get(fresh_key)
        if cached:
            print(f"[Gateway] CACHE HIT for item {game_name}")
            return json.loads(cached), "cache-hit"
        print(f"[Gateway] CACHE MISS for item {game_name} -- querying backend")
    except redis.exceptions.RedisError as e:
        print(f"[Gateway] REDIS UNAVAILABLE ({e}) -- falling back to backend directly")
        r = None

    # --- Cache miss, or Redis itself is down: go to the real backend ---
    try:
        data = fetch_from_backend(game_name)
        print(f"[Gateway] Fetched item {game_name} from BACKEND")
        if r is not None:
            try:
                r.set(fresh_key, json.dumps(data), ex=CACHE_TTL_SECONDS)
                r.set(stale_key, json.dumps(data))  # no expiry - fault-tolerance backup
            except redis.exceptions.RedisError:
                print("[Gateway] Redis write failed, continuing without caching this result")
        return data, "backend"
    except grpc.RpcError as e:
        # --- Backend unreachable: fall back to a stale cached copy if we have one ---
        print(f"[Gateway] BACKEND UNAVAILABLE ({e.code()}) -- checking for stale cache")
        if r is not None:
            try:
                stale = r.get(stale_key)
                if stale:
                    print(f"[Gateway] Serving STALE cached copy for item {game_name}")
                    return json.loads(stale), "stale-fallback"
            except redis.exceptions.RedisError:
                pass
        raise RuntimeError(f"Item {game_name} unavailable: both backend and cache failed")


if __name__ == "__main__":
    game_name = sys.argv[1] if len(sys.argv) > 1 else "Elden Ring"
    data, source = get_item(game_name)
    print(f"\nResult (source={source}): {data}")