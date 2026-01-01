# TokenTra Python SDK

Track AI costs and usage across OpenAI, Anthropic, and other providers with zero latency impact.

## Installation

```bash
pip install tokentra
```

With provider-specific dependencies:

```bash
pip install tokentra[openai]      # For OpenAI
pip install tokentra[anthropic]   # For Anthropic
pip install tokentra[all]         # All providers
```

## Quick Start

### Automatic Instrumentation (Recommended)

```python
from tokentra import TokenTra
from openai import OpenAI

# Initialize TokenTra
tokentra = TokenTra(api_key="tt_live_xxx")

# Wrap your AI client
openai = tokentra.wrap(OpenAI())

# Use as normal - tracking happens automatically
response = openai.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Hello!"}],
    tokentra={"feature": "chat", "team": "product"}  # Optional attribution
)
```

### With Anthropic

```python
from tokentra import TokenTra
from anthropic import Anthropic

tokentra = TokenTra(api_key="tt_live_xxx")
anthropic = tokentra.wrap(Anthropic())

response = anthropic.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}],
    tokentra={"feature": "assistant", "team": "support"}
)
```

### Manual Tracking

```python
from tokentra import TokenTra

tokentra = TokenTra(api_key="tt_live_xxx")

# Track manually
tokentra.track(
    provider="openai",
    model="gpt-4",
    input_tokens=150,
    output_tokens=50,
    latency_ms=1200,
    feature="chat",
    team="product"
)
```

## Configuration

```python
tokentra = TokenTra(
    api_key="tt_live_xxx",
    
    # API settings
    api_url="https://api.tokentra.com",
    timeout=30000,  # milliseconds
    
    # Batching
    batch_size=10,
    flush_interval=5.0,  # seconds
    max_queue_size=1000,
    
    # Default attribution
    default_feature="my-app",
    default_team="engineering",
    default_project="main",
    default_environment="production",
    
    # Privacy
    privacy_mode="metrics_only",  # metrics_only, hashed, full_logging
    
    # Logging
    log_level="WARNING",
)
```

## Attribution

Add context to your AI calls for cost allocation:

```python
response = openai.chat.completions.create(
    model="gpt-4",
    messages=[...],
    tokentra={
        "feature": "document-summarizer",
        "team": "product",
        "project": "enterprise-suite",
        "cost_center": "CC-1234",
        "user_id": "user_12345",
        "environment": "production",
        "metadata": {"session_id": "abc123"}
    }
)
```

## Context Manager

```python
with TokenTra(api_key="tt_live_xxx") as tokentra:
    openai = tokentra.wrap(OpenAI())
    # ... use openai
# Automatically flushes and shuts down
```

## Statistics

```python
stats = tokentra.get_stats()
print(stats)
# {
#     "requests_tracked": 150,
#     "telemetry_sent": 145,
#     "telemetry_failed": 0,
#     "telemetry_buffered": 5,
#     "errors": 0
# }
```

## Environment Variables

```bash
export TOKENTRA_API_KEY=tt_live_xxx
```

Then:

```python
tokentra = TokenTra()  # Uses TOKENTRA_API_KEY
```

## License

MIT
