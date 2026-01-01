"""
TokenTra SDK for Python

Track AI costs and usage across OpenAI, Anthropic, and other providers.

Usage:
    from tokentra import TokenTra
    from openai import OpenAI

    tokentra = TokenTra(api_key="tt_live_xxx")
    openai = tokentra.wrap(OpenAI())

    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": "Hello!"}],
        tokentra={"feature": "chat", "team": "product"}
    )
"""

__version__ = "2.0.0"

from .client import TokenTra
from .errors import TokenTraError

__all__ = ["TokenTra", "TokenTraError", "__version__"]
