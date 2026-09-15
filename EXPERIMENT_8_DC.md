# EXPERIMENT 8 — Redis Caching for Fault Tolerance (Cache-Aside Pattern)

**Distributed Computing Laboratory**
**Aim:** Add a Redis caching layer in front of the existing gRPC backend (Exp 2/3 Lamport-clock service, `grpc/server.py`) so that (a) repeated reads are served fast from cache without hitting the backend, and (b) the system degrades gracefully instead of erroring when either the cache **or** the backend is down.

**Pattern:** Cache-Aside (lazy loading)

1. On a read, check the cache first.
2. Cache hit -> return immediately, backend never touched.
3. Cache miss -> fetch from backend, store result in cache (with short TTL), return.

**Two dual-fault-tolerance paths (they are NOT the same):**
- **Redis down** -> gateway catches `redis.exceptions.RedisError` and goes straight to the backend (client sees no error, just no speed-up).
- **Backend down** -> gateway serves a **never-expiring stale backup key** (written alongside the short-TTL fresh key on every successful backend fetch).

---

## Environment note (Windows vs. the macOS walkthrough)

The walkthrough uses Homebrew (`brew install redis`). This machine is **Windows (PowerShell)**, so:

| Walkthrough (macOS) | This machine (Windows) |
|---|---|
| `brew install redis` | Portable **Redis 5.0.14.1 for Windows** (`redis-server.exe`, `redis-cli.exe`) downloaded from the tporadowski Redis Windows port |
| `brew services start redis` | `redis-server.exe --port 6379` |
| `brew services stop redis` | `Get-Process -Name redis-server | Stop-Process -Force` |
| `source venv/bin/activate` | Python 3.12 invoked directly as `py -3.12` |
| Backend RPC `GetItem(ItemRequest)` | Existing Exp 2/3 RPC **`GetGameStatus(GameRequest(game_name, lamport_timestamp))`** (the walkthrough says: *"if your earlier experiments used a different service name/RPC, substitute those in below — the caching logic itself is completely generic"*) |

Backend timeout: `server.py` intentionally sleeps ~5 s per request, so the gateway's backend call uses a `timeout=15` (the walkthrough's `timeout=2` produces `DEADLINE_EXCEEDED` on this slow backend).

---

## A. Files created / modified

| File | Change |
|---|---|
| `grpc/cache_gateway.py` | **Created.** Cache-aside gateway wrapping the (unchanged) Exp 2/3 gRPC service |
| `requirements.txt` | **Modified.** Appended `redis==5.0.1` |
| `grpc/server.py`, `continuum_pb2.py`, `continuum_pb2_grpc.py` | **Unchanged** — reused as-is (zero code changes to the backend) |

---

## B. Dependencies installed

- `redis==5.0.1` (Python client) — `pip install redis==5.0.1`
- Already present: `grpcio==1.83.1`, `protobuf==7.36.1`, `grpcio-tools`, `setuptools` (installed in a prior experiment)
- Redis **server** 5.0.14.1 for Windows (portable build, no installer)

Interpreter used: **Python 3.12**. (3.13 was rejected: its protobuf runtime 5.29.6 is older than the gencode 7.35.1 the generated `continuum_pb2.py` was compiled with.)

---

## C. Complete execution procedure (with real captured output)

### STEP 1 — Install & start Redis (Windows)
```powershell
& "$env:TEMP\opencode\redis\redis-server.exe" --port 6379
```
**Check it is running:**
```
Command:  redis-cli ping
Output:   PONG
Explanation: Redis server is up and answering on the default port.
```

### STEP 2 — Install the Python Redis client
```
Command:  py -3.12 -m pip install redis==5.0.1
Output:   Successfully installed redis-5.0.1
```
Append to `requirements.txt`: `redis==5.0.1`

```
Command:  py -3.12 -c "import redis; r = redis.Redis(); print(r.ping())"
Output:   True
Explanation: The Python client can open a connection to Redis and get a PONG.
```

### STEP 3 — Start the backend gRPC service (Terminal 1)
```
Command:  py -3.12 server.py
Explanation: Starts the Exp 2/3 Lamport-clock gRPC GameService on port 50051.
(Startup banner: "[SERVER] gRPC Server Started Successfully ... Listening on Port : 50051")
```

### STEP 4 — Gateway code
`grpc/cache_gateway.py` — see Appendix for full listing. Key logic in `get_item()`:

1. try fresh key -> `cache-hit`
2. catch `RedisError` -> `REDIS UNAVAILABLE`, go to backend
3. backend fetch -> write **fresh** (TTL 10 s) **and** stale (never expires) keys -> `backend`
4. catch `grpc.RpcError` -> look up stale key -> `stale-fallback`
5. only if fresh+backend+stale all fail: raise `RuntimeError`

### STEP 5 — Cache-aside demo: miss then hit (Terminal 2)
```
Command:  py -3.12 cache_gateway.py "Elden Ring"

Output:   [Gateway] CACHE MISS for item Elden Ring -- querying backend
          [Gateway] Fetched item Elden Ring from BACKEND

          Result (source=backend): {'game_name': 'Elden Ring',
           'status': 'Elden Ring is currently in your Playing Library.',
           'lamport_timestamp': 6}

Explanation: First read — not in the fresh cache, so the gateway called the
backend, then wrote both fresh (10 s TTL) and stale (unbounded) keys.
```
```
Command:  py -3.12 cache_gateway.py "Elden Ring"     (immediately after)

Output:   [Gateway] CACHE HIT for item Elden Ring

          Result (source=cache-hit): {'game_name': 'Elden Ring',
           'status': 'Elden Ring is currently in your Playing Library.',
           'lamport_timestamp': 6}

Explanation: Second read served entirely from Redis — backend never hit
(no new log entry appears in Terminal 1). This is the fast path.
```
Redis key evidence:
```
Command:  redis-cli keys "*"                      Output:  stale:item:Elden Ring / fresh:item:Elden Ring
Command:  redis-cli ttl "fresh:item:Elden Ring"   Output:  10          (key expires in ~10 s)
Command:  redis-cli ttl "stale:item:Elden Ring"   Output:  -1          (never expires — the backup)
```

---

## D. Test cases and their outputs

### TEST 1 — Cache miss -> backend
```
py -3.12 cache_gateway.py "Elden Ring"
[Gateway] CACHE MISS for item Elden Ring -- querying backend
[Gateway] Fetched item Elden Ring from BACKEND
Result (source=backend): {...}
```
### TEST 2 — Cache hit, backend untouched
```
py -3.12 cache_gateway.py "Elden Ring"
[Gateway] CACHE HIT for item Elden Ring
Result (source=cache-hit): {...}
```
### TEST 3 — Redis down -> graceful fallback to backend
```
Stop-Process -Name redis-server -Force     (or: brew services stop redis)
redis-cli ping   ->  Could not connect to Redis ... actively refused it.

py -3.12 cache_gateway.py "Elden Ring"
[Gateway] REDIS UNAVAILABLE (Timeout connecting to server) -- falling back to backend directly
[Gateway] Fetched item Elden Ring from BACKEND
Result (source=backend): {'game_name': 'Elden Ring', ...}
```
Client still gets a valid answer; only the speed benefit is lost this one time.

### TEST 4 — Backend down -> stale cache fallback
```
# restart Redis first, then refresh cache with both services up:
py -3.12 cache_gateway.py "Elden Ring"    # -> CACHE MISS ... source=backend (fresh+stale keys re-written)

# now STOP the backend (Ctrl+C in Terminal 1). Wait >10 s so the fresh key's TTL expires.
py -3.12 cache_gateway.py "Elden Ring"
[Gateway] CACHE MISS for item Elden Ring -- querying backend
[Gateway] BACKEND UNAVAILABLE (StatusCode.UNAVAILABLE) -- checking for stale cache
[Gateway] Serving STALE cached copy for item Elden Ring
Result (source=stale-fallback): {'game_name': 'Elden Ring', 'status': 'Elden Ring is currently in your Playing Library.', 'lamport_timestamp': 10}
```
Client receives a valid (if slightly old) result instead of an error.

---

## EXPERIMENT 8 — FINAL EXECUTION RECORD

(Live terminal transcript, user: **Yash**)

```
PowerShell 5.1 - Windows PowerShell
Copyright (C) 2019 Microsoft Corporation. All rights reserved.

.NET Framework 4.8.1

Loading personal and system profiles took 552ms.
```

```
PS C:\Users\Yash\AppData\Local\Temp\opencode\redis> & "C:\Users\Yash\AppData\Local\Temp\opencode\redis\redis-cli.exe" ping
PONG
```

```
PS C:\Users\Yash\Desktop\Yash\continuum> py -3.12 -m pip install redis==5.0.1
Successfully installed redis-5.0.1
```

```
PS C:\Users\Yash\Desktop\Yash\continuum> py -3.12 -c "import redis; r = redis.Redis(); print(r.ping())"
True
```

```
PS C:\Users\Yash\Desktop\Yash\continuum\grpc> py -3.12 server.py
====================================================================
[SERVER] Starting gRPC Server...
====================================================================

====================================================================
[SERVER] gRPC Server Started Successfully
[SERVER] Listening on Port : 50051
[SERVER] Waiting for Client Requests...
[SERVER] Logs are being written to: server_lamport.log
====================================================================
```

```
PS C:\Users\Yash\Desktop\Yash\continuum\grpc> py -3.12 cache_gateway.py "Elden Ring"
[Gateway] CACHE MISS for item Elden Ring -- querying backend
[Gateway] Fetched item Elden Ring from BACKEND

Result (source=backend): {'game_name': 'Elden Ring', 'status': 'Elden Ring is currently in your Playing Library.', 'lamport_timestamp': 6}
```

```
   (Terminal 1 simultaneously shows the backend WAS hit:)
====================================================================
[SERVER] Request #3 Received
[SERVER] Requested Game : Elden Ring
[SERVER] Response Ready - Sending to Client...
====================================================================
```

```
PS C:\Users\Yash\Desktop\Yash\continuum\grpc> py -3.12 cache_gateway.py "Elden Ring"
[Gateway] CACHE HIT for item Elden Ring

Result (source=cache-hit): {'game_name': 'Elden Ring', 'status': 'Elden Ring is currently in your Playing Library.', 'lamport_timestamp': 6}
```

```
   (NOTE: NO new request on Terminal 1 -> backend was never touched this time.)
```

```
PS C:\Users\Yash\Desktop\Yash\AppData\Local\Temp\opencode\redis> & "C:\Users\Yash\AppData\Local\Temp\opencode\redis\redis-cli.exe" keys "*"
stale:item:Elden Ring
fresh:item:Elden Ring

PS C:\Users\Yash\AppData\Local\Temp\opencode\redis> & "C:\Users\Yash\AppData\Local\Temp\opencode\redis\redis-cli.exe" ttl "fresh:item:Elden Ring"
10

PS C:\Users\Yash\AppData\Local\Temp\opencode\redis> & "C:\Users\Yash\AppData\Local\Temp\opencode\redis\redis-cli.exe" ttl "stale:item:Elden Ring"
-1
```

```
   TEST 1 - REDIS DOWN -> FALLBACK TO BACKEND
PS C:\Users\Yash\Desktop\Yash\continuum\grpc> Get-Process -Name redis-server | Stop-Process -Force
PS C:\Users\Yash\Desktop\Yash\continuum\grpc> & "C:\Users\Yash\AppData\Local\Temp\opencode\redis\redis-cli.exe" ping
Could not connect to Redis at 127.0.0.1:6379: No connection could be made because the target machine actively refused it.
PS C:\Users\Yash\Desktop\Yash\continuum\grpc> py -3.12 cache_gateway.py "Elden Ring"
[Gateway] REDIS UNAVAILABLE (Timeout connecting to server) -- falling back to backend directly
[Gateway] Fetched item Elden Ring from BACKEND

Result (source=backend): {'game_name': 'Elden Ring', 'status': 'Elden Ring is currently in your Playing Library.', 'lamport_timestamp': 8}
```

```
   RESTART REDIS & REPOPULATE KEYS (both Redis and backend must be UP)
PS C:\Users\Yash\AppData\Local\Temp\opencode\redis> & "C:\Users\Yash\AppData\Local\Temp\opencode\redis\redis-server.exe" --port 6379
PS C:\Users\Yash\AppData\Local\Temp\opencode\redis> & "C:\Users\Yash\AppData\Local\Temp\opencode\redis\redis-cli.exe" ping
PONG
PS C:\Users\Yash\Desktop\Yash\continuum\grpc> py -3.12 cache_gateway.py "Elden Ring"
[Gateway] CACHE MISS for item Elden Ring -- querying backend
[Gateway] Fetched item Elden Ring from BACKEND

Result (source=backend): {'game_name': 'Elden Ring', 'status': 'Elden Ring is currently in your Playing Library.', 'lamport_timestamp': 10}
```

```
   TEST 2 - BACKEND DOWN -> STALE CACHE FALLBACK
   (Ctrl+C on Terminal 1 stops the backend; wait ~10 s for the fresh key to expire)
PS C:\Users\Yash\Desktop\Yash\continuum\grpc> Test-NetConnection localhost -Port 50051 -InformationLevel Quiet
False
PS C:\Users\Yash\Desktop\Yash\continuum\grpc> & "C:\Users\Yash\AppData\Local\Temp\opencode\redis\redis-cli.exe" ttl "fresh:item:Elden Ring"
-2
PS C:\Users\Yash\Desktop\Yash\continuum\grpc> py -3.12 cache_gateway.py "Elden Ring"
[Gateway] CACHE MISS for item Elden Ring -- querying backend
[Gateway] BACKEND UNAVAILABLE (StatusCode.UNAVAILABLE) -- checking for stale cache
[Gateway] Serving STALE cached copy for item Elden Ring

Result (source=stale-fallback): {'game_name': 'Elden Ring', 'status': 'Elden Ring is currently in your Playing Library.', 'lamport_timestamp': 10}
```

```
   BACKEND LOG PROOF (server_lamport.log):
2026-09-15 12:36:44 - INFO - Request #3 received: game=Elden Ring, client_timestamp=0
2026-09-15 12:36:48 - INFO - Response #3 sent: timestamp=6, status=Elden Ring is currently in your Playing Library.
2026-09-15 12:37:04 - INFO - Request #4 received: game=Elden Ring, client_timestamp=0
2026-09-15 12:37:08 - INFO - Response #4 sent: timestamp=8, status=Elden Ring is currently in your Playing Library.
2026-09-15 13:16:58 - INFO - Request #5 received: game=Elden Ring, client_timestamp=0
2026-09-15 13:17:02 - INFO - Response #5 sent: timestamp=10, status=Elden Ring is currently in your Playing Library.
```

All three outcomes observed in the logs: **cache-hit** (STEP: CACHE HIT), **backend** (miss + Redis-down fallback), **stale-fallback** (backend-down).

---

## E. Screenshots to take for the manual

1. `redis-cli ping` -> `PONG` (Redis running).
2. `py -3.12 -c "import redis; print(redis.Redis().ping())"` -> `True` (client connected).
3. Backend console (Terminal 1) showing "gRPC Server Started ... Listening on Port : 50051".
4. **Call 1** gateway output -> `CACHE MISS ... source=backend` AND the matching "[SERVER] Request #N Received" in Terminal 1.
5. **Call 2** gateway output -> `CACHE HIT ... source=cache-hit` (and NO new server log — proves backend untouched).
6. `redis-cli keys "*"` + `TTL` of both keys (10 vs -1) — two-key design evidence.
7. Redis stopped (`redis-cli ping` connection refused) + gateway output showing `REDIS UNAVAILABLE` -> `source=backend`.
8. Backend stopped + gateway output showing `BACKEND UNAVAILABLE` -> `Serving STALE cached copy` -> `source=stale-fallback`.

---

## F. Result / Conclusion

The cache-aside gateway (`grpc/cache_gateway.py`) was placed in front of the **unchanged** Exp 2/3 gRPC backend. The first read missed the cache and was served by the backend while two independent Redis keys were written: a short-TTL `fresh:` key (10 s) and a never-expiring `stale:` key. The immediate second read was a pure `cache-hit` with no backend involvement, proving the fast path. Fault-tolerance tests confirmed both degradation paths: with **Redis down** the gateway caught the connection error and served directly from the backend (`source=backend`) with no client-visible failure; with the **backend down** and the fresh key expired, the gateway served the never-expiring stale copy (`source=stale-fallback`), so the client received valid (slightly stale) data rather than an error. The system therefore provides read caching and graceful degradation against failure of either tier, using a generic pattern that works with any "fetch by ID/name" backend service.

---

## G. Viva questions & short answers

1. **What is the cache-aside (lazy loading) pattern?** Read path: check cache -> hit: return; miss: fetch from the database/backend, write into cache with a TTL, then return.
2. **Why two cache keys per item instead of one?** The `fresh:` key is fast but expires; the never-expiring `stale:` key backs it up so that if the backend is down **after** the fresh entry has expired, the gateway can still serve old data instead of an error. One key cannot do both jobs.
3. **Why a short TTL (10 s) in testing?** A short TTL lets you actually observe misses, expirations, and the fallback behavior in real time. A long TTL would hide expirations during the demo.
4. **What happens if Redis is down?** The gateway catches `redis.exceptions.RedisError`, treats the miss as "no cache", and calls the backend directly. The client sees the same answer, just without the caching speed benefit.
5. **What happens if the backend is down?** The gateway catches `grpc.RpcError` and falls back to the never-expiring stale key, returning a slightly outdated but valid response — availability over freshness (graceful degradation).
6. **What is TTL and how is it set in redis-py?** Time-to-live in seconds. `r.set(key, value, ex=CACHE_TTL_SECONDS)`. `TTL` returns -1 for a key with no expiry and -2 if the key does not exist.
7. **Why create a fresh Redis connection per call instead of one shared connection?** A long-lived connection can hang on a dead server; a per-call connection with short `socket_connect_timeout/socket_timeout` fails fast so the gateway can switch to the fallback path immediately.
8. **Is this consistent (CAP-wise)?** It favours Availability — stale reads are better than no reads under a backend failure. Eventual consistency via the stale copy (contrast with Exp 7's LWW/gossip).
9. **Can this gateway work with a different backend?** Yes — only `fetch_from_backend()` depends on the RPC; the cache logic in `get_item()` is generic. The walkthrough explicitly says to substitute your own service/RPC.
10. **Why did the stale test first show `CACHE HIT` right after killing the backend?** Because the fresh key's 10 s TTL had not yet expired, so the gateway correctly served the fresh copy. The `stale-fallback` only triggers once the fresh key is gone *and* the backend is down — that is exactly the intended design.

---

## Appendix — `grpc/cache_gateway.py` (full listing)

```python
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
    return redis.Redis(host=REDIS_HOST, port=REDIS_PORT,
                       socket_connect_timeout=1, socket_timeout=1)


def fetch_from_backend(game_name):
    with grpc.insecure_channel(BACKEND_SERVICE_ADDR) as channel:
        stub = continuum_pb2_grpc.GameServiceStub(channel)
        response = stub.GetGameStatus(
            continuum_pb2.GameRequest(game_name=game_name, lamport_timestamp=0),
            timeout=15,
        )
        return {"game_name": game_name,
                "status": response.status,
                "lamport_timestamp": response.lamport_timestamp}


def get_item(game_name):
    fresh_key = f"{FRESH_KEY_PREFIX}{game_name}"
    stale_key = f"{STALE_KEY_PREFIX}{game_name}"

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

    try:
        data = fetch_from_backend(game_name)
        print(f"[Gateway] Fetched item {game_name} from BACKEND")
        if r is not None:
            try:
                r.set(fresh_key, json.dumps(data), ex=CACHE_TTL_SECONDS)
                r.set(stale_key, json.dumps(data))
            except redis.exceptions.RedisError:
                print("[Gateway] Redis write failed, continuing without caching this result")
        return data, "backend"
    except grpc.RpcError as e:
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
```