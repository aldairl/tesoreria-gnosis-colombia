import os

import bcrypt
import pytest
from fastapi import HTTPException

from auth import LoginRequest, authenticate


def _hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


VALID_USER = "tesoreria"
VALID_PASS = "secret123"


@pytest.fixture(autouse=True)
def env(monkeypatch):
    monkeypatch.setenv("ADMIN_USERNAME", VALID_USER)
    monkeypatch.setenv("ADMIN_PASSWORD_HASH", _hash(VALID_PASS))


# ─── Happy path ───────────────────────────────────────────────────────────────

def test_authenticate_valid_credentials():
    result = authenticate(LoginRequest(username=VALID_USER, password=VALID_PASS))
    assert result.token


# ─── Trim: username ───────────────────────────────────────────────────────────

def test_authenticate_trims_leading_space_in_username():
    result = authenticate(LoginRequest(username=f" {VALID_USER}", password=VALID_PASS))
    assert result.token


def test_authenticate_trims_trailing_space_in_username():
    result = authenticate(LoginRequest(username=f"{VALID_USER} ", password=VALID_PASS))
    assert result.token


def test_authenticate_trims_both_spaces_in_username():
    result = authenticate(LoginRequest(username=f"  {VALID_USER}  ", password=VALID_PASS))
    assert result.token


# ─── Trim: password ───────────────────────────────────────────────────────────

def test_authenticate_trims_leading_space_in_password():
    result = authenticate(LoginRequest(username=VALID_USER, password=f" {VALID_PASS}"))
    assert result.token


def test_authenticate_trims_trailing_space_in_password():
    result = authenticate(LoginRequest(username=VALID_USER, password=f"{VALID_PASS} "))
    assert result.token


def test_authenticate_trims_both_spaces_in_password():
    result = authenticate(LoginRequest(username=VALID_USER, password=f"  {VALID_PASS}  "))
    assert result.token


# ─── Wrong credentials still fail ─────────────────────────────────────────────

def test_authenticate_rejects_wrong_username():
    with pytest.raises(HTTPException) as exc:
        authenticate(LoginRequest(username="otro", password=VALID_PASS))
    assert exc.value.status_code == 401


def test_authenticate_rejects_wrong_password():
    with pytest.raises(HTTPException) as exc:
        authenticate(LoginRequest(username=VALID_USER, password="wrong"))
    assert exc.value.status_code == 401
