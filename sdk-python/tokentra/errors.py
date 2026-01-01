"""
TokenTra SDK Errors
"""

from typing import Optional


class TokenTraError(Exception):
    """Base exception for TokenTra SDK errors"""

    def __init__(
        self,
        code: str,
        message: str,
        cause: Optional[Exception] = None,
        retryable: bool = False,
    ):
        super().__init__(message)
        self.code = code
        self.message = message
        self.cause = cause
        self.retryable = retryable

    def __str__(self) -> str:
        return f"[{self.code}] {self.message}"


class InvalidApiKeyError(TokenTraError):
    """Raised when API key is invalid or missing"""

    def __init__(self, message: str = "Invalid or missing API key"):
        super().__init__("INVALID_API_KEY", message)


class RateLimitError(TokenTraError):
    """Raised when rate limit is exceeded"""

    def __init__(self, message: str = "Rate limit exceeded", retry_after: int = 60):
        super().__init__("RATE_LIMIT_EXCEEDED", message, retryable=True)
        self.retry_after = retry_after


class NetworkError(TokenTraError):
    """Raised on network failures"""

    def __init__(self, message: str, cause: Optional[Exception] = None):
        super().__init__("NETWORK_ERROR", message, cause=cause, retryable=True)


class TimeoutError(TokenTraError):
    """Raised on request timeout"""

    def __init__(self, message: str = "Request timed out"):
        super().__init__("TIMEOUT", message, retryable=True)
