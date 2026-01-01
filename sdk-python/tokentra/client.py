"""
TokenTra SDK Client
Main client class for AI cost tracking
"""

import os
import time
import uuid
import threading
import queue
import logging
from typing import Any, Dict, List, Optional, TypeVar
from dataclasses import dataclass, field
from datetime import datetime

import requests

from .errors import TokenTraError, InvalidApiKeyError, NetworkError
from .pricing import calculate_cost

logger = logging.getLogger("tokentra")

T = TypeVar("T")

__version__ = "2.0.0"


@dataclass
class TokenTraConfig:
    """Configuration for TokenTra SDK"""

    api_key: str
    api_url: str = "https://api.tokentra.com"
    timeout: int = 30000  # milliseconds
    batch_size: int = 10
    flush_interval: float = 5.0  # seconds
    max_queue_size: int = 1000
    default_feature: Optional[str] = None
    default_team: Optional[str] = None
    default_project: Optional[str] = None
    default_environment: Optional[str] = None
    privacy_mode: str = "metrics_only"
    log_level: str = "WARNING"


@dataclass
class TelemetryEvent:
    """Telemetry event to send to TokenTra"""

    request_id: str
    timestamp: str
    provider: str
    model: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    input_cost: float
    output_cost: float
    total_cost: float
    latency_ms: int
    sdk_version: str = __version__
    sdk_language: str = "python"
    feature: Optional[str] = None
    team: Optional[str] = None
    project: Optional[str] = None
    cost_center: Optional[str] = None
    user_id: Optional[str] = None
    environment: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    cached_tokens: Optional[int] = None
    cached_cost: Optional[float] = None
    was_cached: bool = False
    original_model: Optional[str] = None
    routed_by_rule: Optional[str] = None
    is_error: bool = False
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    prompt_hash: Optional[str] = None
    method_path: Optional[str] = None
    is_streaming: bool = False

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        result = {
            "request_id": self.request_id,
            "timestamp": self.timestamp,
            "provider": self.provider,
            "model": self.model,
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "total_tokens": self.total_tokens,
            "input_cost": self.input_cost,
            "output_cost": self.output_cost,
            "total_cost": self.total_cost,
            "latency_ms": self.latency_ms,
            "sdk_version": self.sdk_version,
            "sdk_language": self.sdk_language,
        }

        # Add optional fields if set
        optional_fields = [
            "feature", "team", "project", "cost_center", "user_id",
            "environment", "cached_tokens", "cached_cost", "was_cached",
            "original_model", "routed_by_rule", "is_error", "error_code",
            "error_message", "prompt_hash", "method_path", "is_streaming",
        ]

        for field_name in optional_fields:
            value = getattr(self, field_name)
            if value is not None and value != {} and value is not False:
                result[field_name] = value

        if self.metadata:
            result["metadata"] = self.metadata

        return result


class TokenTra:
    """
    TokenTra SDK for AI cost tracking

    Example:
        tokentra = TokenTra(api_key="tt_live_xxx")
        openai = tokentra.wrap(OpenAI())
    """

    def __init__(self, api_key: Optional[str] = None, **kwargs):
        # Get API key from param or environment
        api_key = api_key or os.environ.get("TOKENTRA_API_KEY")

        if not api_key:
            raise InvalidApiKeyError(
                "TokenTra API key is required. Set TOKENTRA_API_KEY or pass api_key parameter."
            )

        # Validate key format
        if not api_key.startswith(("tt_live_", "tt_test_", "tk_live_", "tk_test_")):
            raise InvalidApiKeyError(
                "Invalid API key format. Expected: tt_live_xxx or tt_test_xxx"
            )

        self.config = TokenTraConfig(api_key=api_key, **kwargs)

        # Configure logging
        logging.basicConfig(level=getattr(logging, self.config.log_level))

        # Initialize state
        self._stats = {
            "requests_tracked": 0,
            "telemetry_sent": 0,
            "telemetry_failed": 0,
            "telemetry_buffered": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "errors": 0,
        }

        # Telemetry queue
        self._telemetry_queue: queue.Queue[TelemetryEvent] = queue.Queue(
            maxsize=self.config.max_queue_size
        )

        # Background worker
        self._shutdown = threading.Event()
        self._worker = threading.Thread(target=self._telemetry_worker, daemon=True)
        self._worker.start()

        logger.info(f"TokenTra SDK initialized (v{__version__})")

    def wrap(self, client: T) -> T:
        """
        Wrap an AI client for automatic tracking

        Args:
            client: AI provider client (OpenAI, Anthropic, etc.)

        Returns:
            Wrapped client with identical API
        """
        provider = self._detect_provider(client)

        if provider == "openai":
            return self._wrap_openai(client)
        elif provider == "anthropic":
            return self._wrap_anthropic(client)
        else:
            raise TokenTraError(
                "UNSUPPORTED_PROVIDER",
                f"Unsupported AI client. Supported: OpenAI, Anthropic"
            )

    def _detect_provider(self, client: Any) -> str:
        """Detect the AI provider from client instance"""
        class_name = client.__class__.__name__
        module_name = client.__class__.__module__

        if "openai" in module_name.lower() or class_name == "OpenAI":
            return "openai"
        elif "anthropic" in module_name.lower() or class_name == "Anthropic":
            return "anthropic"

        return "unknown"

    def _wrap_openai(self, client: T) -> T:
        """Wrap OpenAI client"""
        sdk = self
        original_create = client.chat.completions.create

        def wrapped_create(*args, tokentra: Optional[Dict] = None, **kwargs):
            return sdk._track_openai_request(
                original_create, args, kwargs, tokentra or {}
            )

        client.chat.completions.create = wrapped_create
        return client

    def _track_openai_request(
        self, original_fn, args, kwargs, attribution: Dict
    ):
        """Track an OpenAI request"""
        request_id = str(uuid.uuid4())
        model = kwargs.get("model", "unknown")
        start_time = time.time()

        try:
            response = original_fn(*args, **kwargs)
            end_time = time.time()

            tokens = self._extract_openai_tokens(response)
            costs = calculate_cost("openai", model, tokens["input"], tokens["output"])

            event = TelemetryEvent(
                request_id=request_id,
                timestamp=datetime.utcnow().isoformat() + "Z",
                provider="openai",
                model=model,
                input_tokens=tokens["input"],
                output_tokens=tokens["output"],
                total_tokens=tokens["input"] + tokens["output"],
                input_cost=costs["input_cost"],
                output_cost=costs["output_cost"],
                total_cost=costs["total_cost"],
                latency_ms=int((end_time - start_time) * 1000),
                feature=attribution.get("feature") or self.config.default_feature,
                team=attribution.get("team") or self.config.default_team,
                project=attribution.get("project") or self.config.default_project,
                user_id=attribution.get("user_id"),
                environment=attribution.get("environment") or self.config.default_environment or "production",
                metadata=attribution.get("metadata", {}),
            )

            self._queue_telemetry(event)
            self._stats["requests_tracked"] += 1

            return response

        except Exception as e:
            end_time = time.time()
            self._stats["errors"] += 1

            event = TelemetryEvent(
                request_id=request_id,
                timestamp=datetime.utcnow().isoformat() + "Z",
                provider="openai",
                model=model,
                input_tokens=0,
                output_tokens=0,
                total_tokens=0,
                input_cost=0,
                output_cost=0,
                total_cost=0,
                latency_ms=int((end_time - start_time) * 1000),
                is_error=True,
                error_code=type(e).__name__,
                error_message=str(e)[:500],
            )
            self._queue_telemetry(event)

            raise

    def _wrap_anthropic(self, client: T) -> T:
        """Wrap Anthropic client"""
        sdk = self
        original_create = client.messages.create

        def wrapped_create(*args, tokentra: Optional[Dict] = None, **kwargs):
            return sdk._track_anthropic_request(
                original_create, args, kwargs, tokentra or {}
            )

        client.messages.create = wrapped_create
        return client

    def _track_anthropic_request(
        self, original_fn, args, kwargs, attribution: Dict
    ):
        """Track an Anthropic request"""
        request_id = str(uuid.uuid4())
        model = kwargs.get("model", "unknown")
        start_time = time.time()

        try:
            response = original_fn(*args, **kwargs)
            end_time = time.time()

            tokens = self._extract_anthropic_tokens(response)
            costs = calculate_cost(
                "anthropic", model, tokens["input"], tokens["output"], tokens.get("cached", 0)
            )

            event = TelemetryEvent(
                request_id=request_id,
                timestamp=datetime.utcnow().isoformat() + "Z",
                provider="anthropic",
                model=model,
                input_tokens=tokens["input"],
                output_tokens=tokens["output"],
                total_tokens=tokens["input"] + tokens["output"],
                input_cost=costs["input_cost"],
                output_cost=costs["output_cost"],
                total_cost=costs["total_cost"],
                latency_ms=int((end_time - start_time) * 1000),
                cached_tokens=tokens.get("cached"),
                cached_cost=costs.get("cached_cost"),
                feature=attribution.get("feature") or self.config.default_feature,
                team=attribution.get("team") or self.config.default_team,
                project=attribution.get("project") or self.config.default_project,
                user_id=attribution.get("user_id"),
                environment=attribution.get("environment") or self.config.default_environment,
                metadata=attribution.get("metadata", {}),
            )

            self._queue_telemetry(event)
            self._stats["requests_tracked"] += 1

            return response

        except Exception as e:
            end_time = time.time()
            self._stats["errors"] += 1
            raise

    def _extract_openai_tokens(self, response) -> Dict[str, int]:
        """Extract token counts from OpenAI response"""
        usage = getattr(response, "usage", None)
        if not usage:
            return {"input": 0, "output": 0}

        return {
            "input": getattr(usage, "prompt_tokens", 0),
            "output": getattr(usage, "completion_tokens", 0),
        }

    def _extract_anthropic_tokens(self, response) -> Dict[str, int]:
        """Extract token counts from Anthropic response"""
        usage = getattr(response, "usage", None)
        if not usage:
            return {"input": 0, "output": 0}

        return {
            "input": getattr(usage, "input_tokens", 0),
            "output": getattr(usage, "output_tokens", 0),
            "cached": getattr(usage, "cache_read_input_tokens", 0),
        }

    def _queue_telemetry(self, event: TelemetryEvent):
        """Add event to telemetry queue"""
        try:
            self._telemetry_queue.put_nowait(event)
            self._stats["telemetry_buffered"] += 1
        except queue.Full:
            logger.warning("Telemetry queue full, dropping event")

    def _telemetry_worker(self):
        """Background worker for sending telemetry"""
        batch: List[TelemetryEvent] = []
        last_flush = time.time()

        while not self._shutdown.is_set():
            try:
                event = self._telemetry_queue.get(timeout=0.1)
                batch.append(event)
                self._telemetry_queue.task_done()
            except queue.Empty:
                pass

            should_flush = (
                len(batch) >= self.config.batch_size or
                (batch and time.time() - last_flush >= self.config.flush_interval)
            )

            if should_flush and batch:
                self._send_batch(batch)
                batch = []
                last_flush = time.time()

        # Final flush on shutdown
        if batch:
            self._send_batch(batch)

    def _send_batch(self, events: List[TelemetryEvent]):
        """Send telemetry batch to backend"""
        try:
            response = requests.post(
                f"{self.config.api_url}/api/v1/sdk/ingest",
                json={"events": [e.to_dict() for e in events]},
                headers={
                    "Authorization": f"Bearer {self.config.api_key}",
                    "Content-Type": "application/json",
                    "X-SDK-Version": __version__,
                    "X-SDK-Language": "python",
                },
                timeout=self.config.timeout / 1000,
            )
            response.raise_for_status()

            self._stats["telemetry_sent"] += len(events)
            self._stats["telemetry_buffered"] -= len(events)
            logger.debug(f"Sent {len(events)} telemetry events")

        except Exception as e:
            self._stats["telemetry_failed"] += len(events)
            logger.warning(f"Failed to send telemetry: {e}")

    def track(
        self,
        provider: str,
        model: str,
        input_tokens: int,
        output_tokens: int,
        latency_ms: int = 0,
        **kwargs,
    ):
        """Manually track a request"""
        costs = calculate_cost(provider, model, input_tokens, output_tokens)

        event = TelemetryEvent(
            request_id=str(uuid.uuid4()),
            timestamp=datetime.utcnow().isoformat() + "Z",
            provider=provider,
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=input_tokens + output_tokens,
            input_cost=costs["input_cost"],
            output_cost=costs["output_cost"],
            total_cost=costs["total_cost"],
            latency_ms=latency_ms,
            **kwargs,
        )

        self._queue_telemetry(event)
        self._stats["requests_tracked"] += 1

    def flush(self):
        """Flush pending telemetry immediately"""
        events = []
        while not self._telemetry_queue.empty():
            try:
                events.append(self._telemetry_queue.get_nowait())
            except queue.Empty:
                break

        if events:
            self._send_batch(events)

    def shutdown(self):
        """Shutdown SDK gracefully"""
        logger.info("Shutting down TokenTra SDK...")
        self._shutdown.set()
        self._worker.join(timeout=5)
        self.flush()
        logger.info("TokenTra SDK shutdown complete")

    def get_stats(self) -> Dict[str, int]:
        """Get SDK statistics"""
        return self._stats.copy()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.shutdown()
