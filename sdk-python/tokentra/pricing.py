"""
Pricing tables for cost calculation
Updated: December 2025
"""

# Prices are per 1M tokens
PRICING_TABLES = {
    "openai": {
        "gpt-4": {"input_per_1m": 30.0, "output_per_1m": 60.0},
        "gpt-4-turbo": {"input_per_1m": 10.0, "output_per_1m": 30.0},
        "gpt-4o": {"input_per_1m": 2.5, "output_per_1m": 10.0},
        "gpt-4o-mini": {"input_per_1m": 0.15, "output_per_1m": 0.6},
        "gpt-3.5-turbo": {"input_per_1m": 0.5, "output_per_1m": 1.5},
        "o1": {"input_per_1m": 15.0, "output_per_1m": 60.0},
        "o1-mini": {"input_per_1m": 3.0, "output_per_1m": 12.0},
        "o1-pro": {"input_per_1m": 150.0, "output_per_1m": 600.0},
        "o3-mini": {"input_per_1m": 1.1, "output_per_1m": 4.4},
    },
    "anthropic": {
        "claude-3-5-sonnet-20241022": {"input_per_1m": 3.0, "output_per_1m": 15.0, "cached_per_1m": 0.3},
        "claude-3-5-haiku-20241022": {"input_per_1m": 0.8, "output_per_1m": 4.0, "cached_per_1m": 0.08},
        "claude-3-opus-20240229": {"input_per_1m": 15.0, "output_per_1m": 75.0, "cached_per_1m": 1.5},
        "claude-3-sonnet-20240229": {"input_per_1m": 3.0, "output_per_1m": 15.0, "cached_per_1m": 0.3},
        "claude-3-haiku-20240307": {"input_per_1m": 0.25, "output_per_1m": 1.25, "cached_per_1m": 0.03},
    },
    "google": {
        "gemini-2.0-flash": {"input_per_1m": 0.1, "output_per_1m": 0.4},
        "gemini-1.5-pro": {"input_per_1m": 1.25, "output_per_1m": 5.0},
        "gemini-1.5-flash": {"input_per_1m": 0.075, "output_per_1m": 0.3},
    },
    "xai": {
        "grok-2": {"input_per_1m": 2.0, "output_per_1m": 10.0},
        "grok-2-mini": {"input_per_1m": 0.2, "output_per_1m": 1.0},
    },
    "deepseek": {
        "deepseek-chat": {"input_per_1m": 0.14, "output_per_1m": 0.28},
        "deepseek-reasoner": {"input_per_1m": 0.55, "output_per_1m": 2.19},
    },
    "mistral": {
        "mistral-large": {"input_per_1m": 2.0, "output_per_1m": 6.0},
        "mistral-small": {"input_per_1m": 0.2, "output_per_1m": 0.6},
    },
    "cohere": {
        "command-r-plus": {"input_per_1m": 2.5, "output_per_1m": 10.0},
        "command-r": {"input_per_1m": 0.15, "output_per_1m": 0.6},
    },
    "groq": {
        "llama-3.3-70b": {"input_per_1m": 0.59, "output_per_1m": 0.79},
        "mixtral-8x7b": {"input_per_1m": 0.24, "output_per_1m": 0.24},
    },
}


def calculate_cost(
    provider: str,
    model: str,
    input_tokens: int,
    output_tokens: int,
    cached_tokens: int = 0,
) -> dict:
    """Calculate cost from token counts"""
    provider_pricing = PRICING_TABLES.get(provider.lower(), {})
    pricing = provider_pricing.get(model)

    # Try partial match if exact match not found
    if not pricing:
        for model_key, model_pricing in provider_pricing.items():
            if model_key in model.lower() or model.lower() in model_key:
                pricing = model_pricing
                break

    # Default pricing if not found
    if not pricing:
        pricing = {"input_per_1m": 1.0, "output_per_1m": 3.0, "cached_per_1m": 0.1}

    input_cost = (input_tokens / 1_000_000) * pricing["input_per_1m"]
    output_cost = (output_tokens / 1_000_000) * pricing["output_per_1m"]
    cached_cost = 0.0

    if cached_tokens and pricing.get("cached_per_1m"):
        cached_cost = (cached_tokens / 1_000_000) * pricing["cached_per_1m"]

    return {
        "input_cost": input_cost,
        "output_cost": output_cost,
        "cached_cost": cached_cost,
        "total_cost": input_cost + output_cost + cached_cost,
    }
